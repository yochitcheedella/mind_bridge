from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_student
from app.models.user import Student
from app.models.mood import MoodLog
from app.models.sleep import SleepLog
from app.models.journal import JournalEntry
from app.models.chat import ChatMessage
from app.models.appointment import Appointment

router = APIRouter(prefix="/api/privacy", tags=["privacy"])

@router.get("/export")
def export_data(student: Student = Depends(get_current_student), db: Session = Depends(get_db)):
    """Export all personal data for the authenticated student."""
    moods = db.query(MoodLog).filter(MoodLog.student_id == student.id).all()
    sleeps = db.query(SleepLog).filter(SleepLog.student_id == student.id).all()
    journals = db.query(JournalEntry).filter(JournalEntry.student_id == student.id).all()
    chats = db.query(ChatMessage).filter(ChatMessage.student_id == student.id).all()
    appointments = db.query(Appointment).filter(Appointment.student_id == student.id).all()
    
    export_payload = {
        "profile": {
            "id": student.id,
            "anonymous_token": student.anonymous_token,
            "department": student.department,
            "year": student.year,
            "risk_score": student.risk_score,
            "joined_at": student.created_at.isoformat() if student.created_at else None
        },
        "mood_logs": [{"score": m.score, "date": m.created_at.isoformat()} for m in moods],
        "sleep_logs": [{"hours": s.hours_slept, "quality": s.quality, "date": s.date.isoformat()} for s in sleeps],
        "journals": [{"title": j.title, "content": j.content, "date": j.created_at.isoformat()} for j in journals],
        "chat_history": [{"sender": c.sender, "text": c.text, "date": c.timestamp.isoformat()} for c in chats],
        "appointments": [{"status": a.status, "date": a.slot_time.isoformat() if a.slot_time else None} for a in appointments]
    }
    
    return export_payload

@router.delete("/account")
def delete_account(student: Student = Depends(get_current_student), db: Session = Depends(get_db)):
    """Hard delete the user account and all associated personal data."""
    if student:
        # Note: SQLAlchemy cascade rules on the models should ideally handle this,
        # but we explicitly delete to ensure a clean wipe if cascades aren't configured.
        db.query(MoodLog).filter(MoodLog.student_id == student.id).delete()
        db.query(SleepLog).filter(SleepLog.student_id == student.id).delete()
        db.query(JournalEntry).filter(JournalEntry.student_id == student.id).delete()
        db.query(ChatMessage).filter(ChatMessage.student_id == student.id).delete()
        db.query(Appointment).filter(Appointment.student_id == student.id).delete()
        db.delete(student)
        
    db.commit()
    return {"status": "success", "message": "Account permanently deleted."}
