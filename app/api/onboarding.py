import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.university import University

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

class UniversityOnboardingRequest(BaseModel):
    name: str
    admin_email: str
    admin_password: str
    primary_color: str
    logo_url: str = None

@router.post("/university")
def onboard_university(req: UniversityOnboardingRequest, db: Session = Depends(get_db)):
    """Register a new university tenant."""
    # Check if university or email already exists
    existing_uni = db.query(University).filter(
        (University.name == req.name) | (University.admin_email == req.admin_email)
    ).first()
    
    if existing_uni:
        raise HTTPException(status_code=400, detail="University or Admin Email already registered.")
        
    # Hash password
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(req.admin_password.encode('utf-8'), salt).decode('utf-8')
    
    uni = University(
        name=req.name,
        admin_email=req.admin_email,
        admin_password_hash=hashed_pw,
        primary_color=req.primary_color,
        logo_url=req.logo_url
    )
    
    db.add(uni)
    db.commit()
    db.refresh(uni)
    
    return {
        "status": "success",
        "university_id": uni.id,
        "message": f"University '{uni.name}' registered successfully."
    }
