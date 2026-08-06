"""
MindBridge AI — Authentication API
VIT-only platform. Three roles: student · psychologist · admin.
No SaaS, no multi-tenant, no university selection.
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token,
    generate_anonymous_alias, decode_token, encrypt_data,
)
from app.models.user import Student
from app.models.psychologist import Psychologist
from app.models.admin import VITAdmin
from app.models.audit import AuditLog

router = APIRouter(prefix="/api/auth", tags=["auth"])

VIT_INSTITUTION = "Vishnu Institute of Technology"
VIT_PRIMARY_COLOR = "#6366f1"  # Indigo — VIT brand color


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_current_student(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Student:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    student = db.query(Student).filter(Student.id == int(payload["sub"])).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
    return student


# ── Schemas ────────────────────────────────────────────────────────────────────

class StudentRegisterRequest(BaseModel):
    name: str
    phone: str
    alias: str
    email: str
    password: str
    department: str = "General"
    year: int = 1


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "student"  # "student" | "psychologist" | "admin"


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


class ProfileUpdateRequest(BaseModel):
    department: Optional[str] = None
    year: Optional[int] = None


class FCMTokenRequest(BaseModel):
    token: str


class AdminCreateRequest(BaseModel):
    name: str
    email: str
    password: str


# ── Student Registration ───────────────────────────────────────────────────────

@router.post("/register")
def register_student(req: StudentRegisterRequest, db: Session = Depends(get_db)):
    """Register a new VIT student. Email is encrypted; alias is the public identity."""
    existing = db.query(Student).filter(Student.email_hash == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered.")

    alias_existing = db.query(Student).filter(Student.anonymous_token == req.alias).first()
    if alias_existing:
        raise HTTPException(status_code=400, detail="This alias is already taken. Please choose another.")

    # Email domain check — VIT students only
    email_lower = req.email.lower().strip()
    allowed_domains = ["@vishnu.edu.in", "@vitap.ac.in", "@vitbhopal.ac.in", "@vit.ac.in", "@gmail.com", "@student.vit"]
    # In production, restrict strictly. For now, any email works for dev.

    student = Student(
        email_hash=email_lower,
        password_hash=hash_password(req.password),
        encrypted_name=encrypt_data(req.name),
        encrypted_phone=encrypt_data(req.phone),
        encrypted_email=encrypt_data(email_lower),
        anonymous_token=req.alias,
        department=req.department,
        year=req.year,
        risk_score=0.0,
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    token = create_access_token({"sub": str(student.id), "alias": req.alias, "role": "student"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "student",
        "anonymous_alias": req.alias,
        "student_id": student.id,
        "institution": VIT_INSTITUTION,
        "primary_color": VIT_PRIMARY_COLOR,
    }


# ── Unified Login ──────────────────────────────────────────────────────────────

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Unified login for all 3 VIT roles: student, psychologist, admin.
    Returns a JWT with the 'role' claim embedded.
    """
    role = req.role.lower().strip()

    # ── Student Login ──
    if role == "student":
        student = db.query(Student).filter(Student.email_hash == req.email.lower()).first()
        if not student or not verify_password(req.password, student.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        token = create_access_token({
            "sub": str(student.id),
            "alias": student.anonymous_token,
            "role": "student",
        })
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "student",
            "anonymous_alias": student.anonymous_token,
            "student_id": student.id,
            "institution": VIT_INSTITUTION,
            "primary_color": VIT_PRIMARY_COLOR,
        }

    # ── Psychologist Login ──
    elif role == "psychologist":
        psych = db.query(Psychologist).filter(
            Psychologist.email == req.email.lower(),
            Psychologist.is_active == True,
        ).first()
        if not psych or not psych.password_hash:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        if not verify_password(req.password, psych.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        token = create_access_token({
            "sub": str(psych.id),
            "name": psych.name,
            "role": "psychologist",
        })
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "psychologist",
            "psychologist_id": psych.id,
            "name": psych.name,
            "specialization": psych.specialization,
            "institution": VIT_INSTITUTION,
            "primary_color": "#3b82f6",  # Blue for psychologist
        }

    # ── Admin Login ──
    elif role == "admin":
        admin = db.query(VITAdmin).filter(
            VITAdmin.email == req.email.lower(),
            VITAdmin.is_active == True,
        ).first()
        if not admin or not verify_password(req.password, admin.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        token = create_access_token({
            "sub": str(admin.id),
            "name": admin.name,
            "role": "admin",
        })
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "admin",
            "admin_id": admin.id,
            "name": admin.name,
            "institution": VIT_INSTITUTION,
            "primary_color": "#8b5cf6",  # Purple for admin
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid role. Must be: student, psychologist, or admin.")


# ── Password Reset (Students) ──────────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiates password reset. Does not reveal whether the email exists."""
    # In production: generate OTP, store with expiry, send via VIT SMTP
    return {"status": "success", "message": "If the email exists, an OTP has been sent."}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verifies OTP and resets the user's password across all three institutional roles (Student, Psychologist, Admin). Demo OTP: 123456."""
    if req.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    email_lower = req.email.lower()
    new_hash = hash_password(req.new_password)

    # Check Student
    student = db.query(Student).filter(Student.email_hash == email_lower).first()
    if student:
        student.password_hash = new_hash
        db.commit()
        return {"status": "success", "message": "Student password updated successfully."}

    # Check Psychologist
    psych = db.query(Psychologist).filter(Psychologist.email == email_lower).first()
    if psych:
        psych.password_hash = new_hash
        db.commit()
        return {"status": "success", "message": "Psychologist password updated successfully."}

    # Check Admin
    admin = db.query(VITAdmin).filter(VITAdmin.email == email_lower).first()
    if admin:
        admin.password_hash = new_hash
        db.commit()
        return {"status": "success", "message": "Admin password updated successfully."}

    raise HTTPException(status_code=400, detail="Invalid request or account not found.")


# ── Student Profile ────────────────────────────────────────────────────────────

@router.get("/profile")
def get_profile(
    current: Student = Depends(_get_current_student),
    db: Session = Depends(get_db),
):
    """Return the authenticated student's profile. No PII exposed."""
    return {
        "anonymous_alias": current.anonymous_token,
        "department": current.department,
        "year": current.year,
        "institution": VIT_INSTITUTION,
        "primary_color": VIT_PRIMARY_COLOR,
    }


@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    current: Student = Depends(_get_current_student),
    db: Session = Depends(get_db),
):
    """Allow a student to update their department and/or year."""
    if req.department is not None:
        current.department = req.department
    if req.year is not None:
        if req.year < 1 or req.year > 10:
            raise HTTPException(status_code=422, detail="Year must be between 1 and 10.")
        current.year = req.year
    db.commit()
    db.refresh(current)
    return {
        "message": "Profile updated successfully.",
        "department": current.department,
        "year": current.year,
    }


@router.post("/fcm-token")
def update_fcm_token(
    req: FCMTokenRequest,
    current: Student = Depends(_get_current_student),
    db: Session = Depends(get_db),
):
    """Save the FCM push notification token for the student device."""
    current.fcm_token = req.token
    db.commit()
    return {"status": "success", "message": "FCM token updated."}


# ── Seed: Create default VIT admin (for first run) ────────────────────────────

@router.post("/seed-admin")
def seed_vit_admin(req: AdminCreateRequest, db: Session = Depends(get_db)):
    """
    Create the default VIT admin account.
    This endpoint is only for initial setup — in production, restrict by IP or remove entirely.
    """
    existing = db.query(VITAdmin).filter(VITAdmin.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin account already exists.")

    admin = VITAdmin(
        name=req.name,
        email=req.email.lower(),
        password_hash=hash_password(req.password),
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {
        "status": "success",
        "message": f"VIT Admin '{admin.name}' created successfully.",
        "admin_id": admin.id,
    }
