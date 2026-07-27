from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.deps import get_current_student
from app.models.journal import JournalEntry
from app.models.user import Student

router = APIRouter(prefix="/api/journal", tags=["journal"])


class JournalEntryRequest(BaseModel):
    content: str
    mood_tag: Optional[str] = None  # academic | relationships | family | finance | health | career


@router.post("/entry")
def create_entry(
    req: JournalEntryRequest,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    entry = JournalEntry(
        student_id=student.id,
        content=req.content,
        mood_tag=req.mood_tag,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id,
        "content": entry.content,
        "mood_tag": entry.mood_tag,
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
    }


@router.get("/entries")
def get_entries(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.student_id == student.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": e.id,
            "content": e.content,
            "mood_tag": e.mood_tag,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in entries
    ]
