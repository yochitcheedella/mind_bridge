from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
from datetime import date

from app.core.database import get_db
from app.models.user import Student
from app.models.chat import ChatMessage
from app.models.mood import MoodLog
from app.models.clinical import CaseNote, FollowUp
from app.api.chat import manager

router = APIRouter(prefix="/api/psychologist", tags=["psychologist"])

class ChatMessageRequest(BaseModel):
    text: str

class CaseNoteRequest(BaseModel):
    content: str

class FollowUpRequest(BaseModel):
    due_date: str   # ISO date string YYYY-MM-DD
    reason: Optional[str] = None


@router.get("/student/{anonymous_id}")
def get_student_case_details(anonymous_id: str, db: Session = Depends(get_db)):
    """
    Retrieves the case summary, mood logs, and chat history for a given anonymous student.
    Strictly excludes PII (real email, name, etc.).
    """
    student = db.query(Student).filter(Student.anonymous_token == anonymous_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch recent mood logs
    mood_logs = (
        db.query(MoodLog)
        .filter(MoodLog.student_id == student.id)
        .order_by(MoodLog.timestamp.desc())
        .limit(10)
        .all()
    )

    # Fetch recent chat history
    chat_history = (
        db.query(ChatMessage)
        .filter(ChatMessage.student_id == student.id)
        .order_by(ChatMessage.timestamp.desc())
        .limit(30)
        .all()
    )
    chat_history.reverse() # Chronological order

    return {
        "student": {
            "anonymous_id": student.anonymous_token,
            "department": student.department,
            "year": student.year,
            "risk_score": student.risk_score,
            "created_at": student.created_at.isoformat() if student.created_at else None,
        },
        "mood_logs": [
            {
                "score": log.score,
                "note": log.note,
                "timestamp": log.timestamp.isoformat()
            } for log in mood_logs
        ],
        "chat_history": [
            {
                "id": str(msg.id),
                "sender": msg.sender,
                "text": msg.text,
                "timestamp": msg.timestamp.isoformat(),
                "risk_score": msg.sentiment_score
            } for msg in chat_history
        ]
    }

@router.post("/student/{anonymous_id}/chat")
async def send_counselor_message(anonymous_id: str, req: ChatMessageRequest, db: Session = Depends(get_db)):
    """
    Sends an anonymous message from the psychologist to the student.
    """
    student = db.query(Student).filter(Student.anonymous_token == anonymous_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Save to database
    counselor_msg = ChatMessage(
        student_id=student.id,
        sender="counselor",
        text=req.text
    )
    db.add(counselor_msg)
    db.commit()
    db.refresh(counselor_msg)

    # Push to WebSocket if student is connected
    payload = json.dumps({
        "id": str(counselor_msg.id),
        "sender": "counselor",
        "text": counselor_msg.text,
        "risk_level": "none",
        "risk_score": None,
        "timestamp": counselor_msg.timestamp.isoformat() if counselor_msg.timestamp else None,
    })
    
    await manager.send_personal(payload, student.id)
    
    # Push Notification to Student Device
    from app.services.notifications import send_push_notification
    # Note: In a real app, you would retrieve the student's registered FCM token from the database
    mock_student_fcm_token = "placeholder-student-fcm-token"
    send_push_notification(
        title="MindBridge Clinical Team",
        body="You have a new message from a counselor.",
        fcm_token=mock_student_fcm_token,
        data={"type": "counselor_message", "student_id": str(student.id)}
    )

    return {"status": "success", "message_id": counselor_msg.id}

@router.post("/student/{anonymous_id}/resolve")
def resolve_student_case(anonymous_id: str, db: Session = Depends(get_db)):
    """Resolves the case by resetting the student's risk score to a baseline (0.0)."""
    student = db.query(Student).filter(Student.anonymous_token == anonymous_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.risk_score = 0.0
    db.commit()
    return {"status": "success", "message": "Case resolved"}


# ── Case Notes ─────────────────────────────────────────────────────────────────

@router.get("/student/{anonymous_id}/notes")
def get_case_notes(anonymous_id: str, db: Session = Depends(get_db)):
    """Return all private case notes for this anonymous student."""
    notes = (
        db.query(CaseNote)
        .filter(CaseNote.student_anonymous_id == anonymous_id)
        .order_by(CaseNote.created_at.desc())
        .all()
    )
    return [
        {"id": n.id, "content": n.content, "created_at": n.created_at.isoformat()}
        for n in notes
    ]


@router.post("/student/{anonymous_id}/notes")
def add_case_note(anonymous_id: str, req: CaseNoteRequest, db: Session = Depends(get_db)):
    """Add a new private case note for this anonymous student."""
    note = CaseNote(student_anonymous_id=anonymous_id, content=req.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "content": note.content, "created_at": note.created_at.isoformat()}


# ── Follow-ups ─────────────────────────────────────────────────────────────────

@router.get("/student/{anonymous_id}/followup")
def get_followup(anonymous_id: str, db: Session = Depends(get_db)):
    """Return all follow-up reminders for this student."""
    rows = (
        db.query(FollowUp)
        .filter(FollowUp.student_anonymous_id == anonymous_id)
        .order_by(FollowUp.due_date)
        .all()
    )
    return [
        {
            "id": r.id,
            "due_date": str(r.due_date),
            "reason": r.reason,
            "completed": bool(r.completed),
        }
        for r in rows
    ]


@router.post("/student/{anonymous_id}/followup")
def set_followup(anonymous_id: str, req: FollowUpRequest, db: Session = Depends(get_db)):
    """Schedule a follow-up reminder for this anonymous student."""
    try:
        parsed = date.fromisoformat(req.due_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="due_date must be YYYY-MM-DD.")
    row = FollowUp(student_anonymous_id=anonymous_id, due_date=parsed, reason=req.reason)
    db.add(row)
    db.commit()
    db.refresh(row)
    
    # Push Notification to Student Device
    from app.services.notifications import send_push_notification
    student = db.query(Student).filter(Student.anonymous_token == anonymous_id).first()
    if student:
        mock_student_fcm_token = "placeholder-student-fcm-token"
        send_push_notification(
            title="MindBridge - Follow Up Scheduled",
            body=f"A counselor has scheduled a check-in for {parsed.strftime('%B %d, %Y')}.",
            fcm_token=mock_student_fcm_token,
            data={"type": "follow_up", "student_id": str(student.id)}
        )

    return {"id": row.id, "due_date": str(row.due_date), "reason": row.reason, "completed": False}


@router.post("/student/{anonymous_id}/followup/{followup_id}/complete")
def complete_followup(anonymous_id: str, followup_id: int, db: Session = Depends(get_db)):
    """Mark a follow-up as completed."""
    row = db.query(FollowUp).filter(FollowUp.id == followup_id, FollowUp.student_anonymous_id == anonymous_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Follow-up not found.")
    row.completed = 1
    db.commit()
    return {"status": "completed"}
