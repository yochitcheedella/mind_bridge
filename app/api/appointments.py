from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_student, get_current_user_any_role
from app.core.security import create_access_token
from app.models.appointment import Appointment
from app.models.psychologist import Psychologist
from app.models.user import Student

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


class BookRequest(BaseModel):
    psychologist_id: int
    slot_time: str  # ISO 8601 datetime string
    notes: Optional[str] = None


def seed_psychologists(db: Session) -> None:
    """Seed default psychologists if the table is empty."""
    if db.query(Psychologist).count() == 0:
        defaults = [
            Psychologist(name="RAM SIR", specialization="Head Clinical Psychologist"),
            Psychologist(name="Dr. Sarah Mehta", specialization="Anxiety & Depression"),
            Psychologist(name="Dr. Raj Verma", specialization="Academic Stress & Burnout"),
        ]
        db.add_all(defaults)
        db.commit()


@router.get("/slots")
def get_available_slots(db: Session = Depends(get_db)):
    """Return available appointment slots for the next 7 days."""
    seed_psychologists(db)
    psychologists = db.query(Psychologist).all()

    slots = []
    base = datetime.utcnow()
    for p in psychologists:
        for day_offset in range(1, 8):
            for hour in [9, 11, 14, 16]:
                slot_dt = (
                    base + timedelta(days=day_offset)
                ).replace(hour=hour, minute=0, second=0, microsecond=0)
                slots.append(
                    {
                        "psychologist_id": p.id,
                        "psychologist_name": p.name,
                        "specialization": p.specialization,
                        "slot_time": slot_dt.isoformat(),
                    }
                )
    return slots[:24]  # first 24 slots


@router.get("/psychologists")
def get_psychologists(db: Session = Depends(get_db)):
    """Return all available psychologists."""
    seed_psychologists(db)
    psychologists = db.query(Psychologist).all()
    return [{"id": p.id, "name": p.name, "specialization": p.specialization} for p in psychologists]


@router.post("/book")
def book_appointment(
    req: BookRequest,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    try:
        slot_dt = datetime.fromisoformat(req.slot_time)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid slot_time format. Use ISO 8601.")

    appt = Appointment(
        student_id=student.id,
        psychologist_id=req.psychologist_id,
        slot_time=slot_dt,
        notes=req.notes,
        status="pending",
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return {"id": appt.id, "status": appt.status, "slot_time": appt.slot_time.isoformat()}


@router.get("/mine")
def get_my_appointments(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    appts = (
        db.query(Appointment)
        .filter(Appointment.student_id == student.id)
        .order_by(Appointment.slot_time.asc())
        .all()
    )
    result = []
    for a in appts:
        psych = db.query(Psychologist).filter(Psychologist.id == a.psychologist_id).first()
        result.append(
            {
                "id": a.id,
                "psychologist_name": psych.name if psych else "Unknown",
                "specialization": psych.specialization if psych else "",
                "slot_time": a.slot_time.isoformat() if a.slot_time else None,
                "student_alias": student.anonymous_token,
                "status": a.status,
                "notes": a.notes,
                "meeting_link": f"https://meet.mindbridge.health/session/{a.id}" if a.id % 2 == 0 else None,
                "check_in_code": f"MB-CHK-{a.id:04d}" if a.id % 2 != 0 else None,
            }
        )
    return result


@router.get("/all")
def get_all_appointments(db: Session = Depends(get_db)):
    """Psychologist views all appointments."""
    appts = db.query(Appointment).order_by(Appointment.slot_time.asc()).all()
    result = []
    for a in appts:
        psych = db.query(Psychologist).filter(Psychologist.id == a.psychologist_id).first()
        student = db.query(Student).filter(Student.id == a.student_id).first()
        result.append(
            {
                "id": a.id,
                "anonymous_id": student.anonymous_token if student else "Unknown",
                "psychologist_name": psych.name if psych else "Unknown",
                "slot_time": a.slot_time.isoformat() if a.slot_time else None,
                "status": a.status,
                "notes": a.notes,
            }
        )
    return result


@router.get("/psychologist")
def get_psychologist_appointments(db: Session = Depends(get_db)):
    """Psychologist calendar view — all appointments with anonymous student ID."""
    appts = db.query(Appointment).order_by(Appointment.slot_time.asc()).all()
    result = []
    for a in appts:
        student = db.query(Student).filter(Student.id == a.student_id).first()
        result.append(
            {
                "id": a.id,
                "anonymous_id": student.anonymous_token if student else "Unknown",
                "slot_time": a.slot_time.isoformat() if a.slot_time else None,
                "status": a.status,
                "notes": a.notes,
            }
        )
    return result

class AppointmentStatusUpdate(BaseModel):
    status: str
    new_time: Optional[str] = None

@router.put("/{appointment_id}/status")
def update_appointment_status(appointment_id: int, req: AppointmentStatusUpdate, db: Session = Depends(get_db)):
    """Psychologist confirms or cancels an appointment."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
        
    if req.status not in ["pending", "confirmed", "cancelled", "completed", "rescheduled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    appt.status = req.status
    if req.status == "rescheduled" and req.new_time:
        try:
            slot_dt = datetime.fromisoformat(req.new_time)
            appt.slot_time = slot_dt
        except ValueError:
            pass
            
    db.commit()
    return {"status": appt.status}

@router.delete("/cancel/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.student_id == student.id
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    appt.status = "cancelled"
    db.commit()
    return {"status": "cancelled"}


@router.post("/{appointment_id}/call-token")
def get_appointment_call_token(
    appointment_id: int,
    current_user: dict = Depends(get_current_user_any_role),
    db: Session = Depends(get_db),
):
    """
    Generate temporary, appointment-verified audio call room token.
    Enforces MindBridge Security Rule:
    Room is inaccessible without explicit appointment ownership verification.
    - If student: must be assigned student.
    - If psychologist: must be assigned psychologist.
    - Never reveals student's real name, email, phone, or roll number to psychologist.
    """
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    role = current_user.get("role", "student")
    user_id = current_user.get("id")

    student = db.query(Student).filter(Student.id == appt.student_id).first()
    psych = db.query(Psychologist).filter(Psychologist.id == appt.psychologist_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")

    student_alias = student.anonymous_token or "Anonymous Student"
    psych_name = psych.name if psych else "Clinical Psychologist"

    if role == "student":
        if appt.student_id != user_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You are not the assigned student for this appointment."
            )
        my_alias = student_alias
        peer_alias = psych_name
    elif role in ("psychologist", "admin"):
        if role == "psychologist" and appt.psychologist_id and appt.psychologist_id != user_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You are not the assigned psychologist for this appointment."
            )
        my_alias = psych_name
        peer_alias = student_alias
    else:
        raise HTTPException(status_code=403, detail="Unauthorized role.")

    call_token_data = {
        "sub": str(user_id),
        "role": role,
        "token_type": "call_token",
        "appointment_id": appt.id,
        "my_alias": my_alias,
        "peer_alias": peer_alias,
    }
    call_token = create_access_token(call_token_data, expires_delta=timedelta(hours=2))

    return {
        "call_token": call_token,
        "appointment_id": appt.id,
        "role": role,
        "my_alias": my_alias,
        "peer_alias": peer_alias,
        "status": appt.status,
        "slot_time": appt.slot_time.isoformat() if appt.slot_time else None,
        "counselor_name": psych_name,
        "student_identity": student_alias,
    }


class AppointmentFeedbackRequest(BaseModel):
    rating: int  # 1 to 5
    tags: Optional[str] = None
    comment: Optional[str] = None


@router.post("/{appointment_id}/feedback")
def submit_appointment_feedback(
    appointment_id: int,
    req: AppointmentFeedbackRequest,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Submits anonymous session feedback from student and marks appointment as completed.
    Zero-PII guaranteed.
    """
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.student_id == student.id,
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appt.feedback_rating = max(1, min(5, req.rating))
    appt.feedback_tags = req.tags
    appt.feedback_comment = req.comment
    appt.status = "completed"

    db.commit()
    return {"status": "completed", "message": "Feedback submitted successfully."}


