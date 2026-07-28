from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from app.core.database import get_db
from app.core.deps import get_current_student
from app.models.user import Student
from datetime import datetime, timezone

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

# Mock database since we don't have a Notification model yet.
# In a real scenario, this would be an SQLAlchemy model.
MOCK_NOTIFICATIONS = [
    {"id": 1, "title": "AI Check-in Available", "message": "Your AI Guide is ready for your daily check-in.", "is_read": False, "type": "info"},
    {"id": 2, "title": "New Appointment", "message": "Your teleport session with Dr. Smith is confirmed.", "is_read": False, "type": "success"},
    {"id": 3, "title": "Wellness Goal", "message": "Don't forget to complete your 5-minute meditation.", "is_read": True, "type": "warning"},
]

@router.get("/")
def get_notifications(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Fetch recent notifications for the student."""
    # Return mock data for demonstration
    return MOCK_NOTIFICATIONS

@router.post("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Mark a specific notification as read."""
    for n in MOCK_NOTIFICATIONS:
        if n["id"] == notification_id:
            n["is_read"] = True
            return {"status": "success"}
    raise HTTPException(status_code=404, detail="Notification not found")
