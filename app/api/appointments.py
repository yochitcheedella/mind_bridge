from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_student
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
            Psychologist(name="Dr. Sarah Mehta", specialization="Anxiety & Depression"),
            Psychologist(name="Dr. Raj Verma", specialization="Academic Stress & Burnout"),
            Psychologist(name="Dr. Priya Nair", specialization="Crisis Intervention"),
            Psychologist(name="Dr. Arun Kumar", specialization="Relationship & Social Stress"),
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
        status="confirmed",
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
    appts = db.query(Appointment).join(Student).order_by(Appointment.slot_time.asc()).all()
    result = []
    for a in appts:
        psych = db.query(Psychologist).filter(Psychologist.id == a.psychologist_id).first()
        result.append(
            {
                "id": a.id,
                "anonymous_id": a.student.anonymous_token,
                "psychologist_name": psych.name if psych else "Unknown",
                "slot_time": a.slot_time.isoformat() if a.slot_time else None,
                "status": a.status,
                "notes": a.notes,
            }
        )
    return result

class AppointmentStatusUpdate(BaseModel):
    status: str

@router.put("/{appointment_id}/status")
def update_appointment_status(appointment_id: int, req: AppointmentStatusUpdate, db: Session = Depends(get_db)):
    """Psychologist confirms or cancels an appointment."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
        
    if req.status not in ["pending", "confirmed", "cancelled", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    appt.status = req.status
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
