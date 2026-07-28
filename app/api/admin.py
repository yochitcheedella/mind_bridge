from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.models.psychologist import Psychologist
from app.models.appointment import Appointment

router = APIRouter(prefix="/api/admin", tags=["admin"])

class PsychologistCreate(BaseModel):
    name: str
    specialization: str

class PsychologistResponse(BaseModel):
    id: int
    name: str
    specialization: str

@router.get("/psychologists", response_model=List[PsychologistResponse])
def get_all_psychologists(db: Session = Depends(get_db)):
    """Retrieve all psychologists for administration."""
    psychs = db.query(Psychologist).all()
    return psychs

@router.post("/psychologists", response_model=PsychologistResponse)
def add_psychologist(req: PsychologistCreate, db: Session = Depends(get_db)):
    """Add a new psychologist to the platform."""
    psych = Psychologist(name=req.name, specialization=req.specialization)
    db.add(psych)
    db.commit()
    db.refresh(psych)
    return psych

@router.delete("/psychologists/{psych_id}")
def remove_psychologist(psych_id: int, db: Session = Depends(get_db)):
    """Remove a psychologist (and theoretically transfer cases)."""
    psych = db.query(Psychologist).filter(Psychologist.id == psych_id).first()
    if not psych:
        raise HTTPException(status_code=404, detail="Psychologist not found")
        
    # Check for linked appointments
    has_appointments = db.query(Appointment).filter(Appointment.psychologist_id == psych_id).first()
    if has_appointments:
        raise HTTPException(status_code=400, detail="Cannot delete psychologist with existing appointments. Reassign them first.")
        
    db.delete(psych)
    db.commit()
    return {"status": "success", "message": "Psychologist removed."}
