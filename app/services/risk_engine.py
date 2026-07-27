from sqlalchemy.orm import Session
from app.models.user import Student
from app.models.chat import ChatMessage
from app.models.mood import MoodLog
from app.models.journal import JournalEntry
from datetime import datetime, timedelta

def calculate_multi_factor_risk(db: Session, student_id: int):
    """
    Calculates a multi-factor risk score and burnout probability.
    Factors:
    - Chat Risk (40%)
    - Mood Average (20%)
    - Journal Sentiment (20%)
    - Historical Baseline (20%)
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # 1. Chat Risk (Recent messages)
    recent_chats = db.query(ChatMessage).filter(
        ChatMessage.student_id == student_id,
        ChatMessage.sender == "user",
        ChatMessage.timestamp >= thirty_days_ago
    ).order_by(ChatMessage.timestamp.desc()).limit(20).all()
    
    chat_risk = 0.0
    if recent_chats:
        # Assuming sentiment_score is now used as risk_score for AI responses
        # Let's see if we have recent AI risk scores
        recent_ai_msgs = db.query(ChatMessage).filter(
            ChatMessage.student_id == student_id,
            ChatMessage.sender == "ai",
            ChatMessage.timestamp >= thirty_days_ago
        ).order_by(ChatMessage.timestamp.desc()).limit(5).all()
        
        if recent_ai_msgs:
            # Avg risk of recent interactions
            chat_risk = sum(msg.sentiment_score for msg in recent_ai_msgs if msg.sentiment_score) / len(recent_ai_msgs)
    
    # 2. Mood Average
    recent_moods = db.query(MoodLog).filter(
        MoodLog.student_id == student_id,
        MoodLog.timestamp >= thirty_days_ago
    ).order_by(MoodLog.timestamp.desc()).limit(14).all()
    
    mood_risk = 0.0
    if recent_moods:
        # Score 1 = Very Low (High Risk = 1.0), Score 5 = Excellent (Low Risk = 0.0)
        mood_sum = sum((5 - m.score) / 4.0 for m in recent_moods)
        mood_risk = mood_sum / len(recent_moods)
        
    # 3. Journal Sentiment
    recent_journals = db.query(JournalEntry).filter(
        JournalEntry.student_id == student_id,
        JournalEntry.created_at >= thirty_days_ago
    ).order_by(JournalEntry.created_at.desc()).limit(5).all()
    
    journal_risk = 0.0
    if recent_journals:
        j_sum = sum(j.sentiment_score for j in recent_journals if j.sentiment_score)
        # Assuming -1 is sad (High Risk = 1.0), +1 is happy (Low Risk = 0.0)
        # Normalize to 0-1 risk: risk = (-sentiment + 1) / 2
        journal_risk = sum((-j.sentiment_score + 1) / 2.0 for j in recent_journals if j.sentiment_score is not None) / len(recent_journals) if any(j.sentiment_score is not None for j in recent_journals) else 0.0
        
    # 4. Baseline
    # We can use the existing student.risk_score as a rolling baseline
    baseline_risk = student.risk_score if student.risk_score else 0.0
    
    # Weighted calculation
    final_risk = (chat_risk * 0.40) + (mood_risk * 0.20) + (journal_risk * 0.20) + (baseline_risk * 0.20)
    
    # Burnout Probability
    # Burnout is heavily tied to low mood, high anxiety/stress (chat risk), and persistent negative journal sentiment.
    burnout_prob = (chat_risk * 0.3) + (mood_risk * 0.5) + (journal_risk * 0.2)
    
    # Update Student Record
    student.risk_score = min(max(final_risk, 0.0), 1.0)
    student.burnout_probability = min(max(burnout_prob, 0.0), 1.0)
    
    # Calculate daily wellness score (inverse of burnout/risk mix)
    wellness = int((1.0 - burnout_prob) * 100)
    student.daily_wellness_score = max(min(wellness, 100), 0)
    
    db.commit()
    
    return {
        "risk_score": student.risk_score,
        "burnout_probability": student.burnout_probability,
        "daily_wellness_score": student.daily_wellness_score
    }
