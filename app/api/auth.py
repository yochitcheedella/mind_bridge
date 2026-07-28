from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, generate_anonymous_alias, decode_token, encrypt_data
from app.models.user import Student
from app.models.university import University

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _get_current_student(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Student:
    """Dependency: decode Bearer JWT and return the matching Student row."""
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


@router.get("/universities")
def get_universities(db: Session = Depends(get_db)):
    """Return a list of active universities for registration."""
    universities = db.query(University).filter(University.is_active == True).all()
    return [{"id": u.id, "name": u.name} for u in universities]


class RegisterRequest(BaseModel):
    name: str
    phone: str
    email: str
    password: str
    department: str = "General"
    year: int = 1
    university_id: Optional[int] = None


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new student. Returns a JWT and their generated anonymous alias."""
    existing = db.query(Student).filter(Student.email_hash == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered.")

    alias = generate_anonymous_alias()
    student = Student(
        email_hash=req.email.lower(),
        password_hash=hash_password(req.password),
        encrypted_name=encrypt_data(req.name),
        encrypted_phone=encrypt_data(req.phone),
        encrypted_email=encrypt_data(req.email.lower()),
        anonymous_token=alias,
        department=req.department,
        year=req.year,
        risk_score=0.0,
        university_id=req.university_id,
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Fetch primary color if university exists
    primary_color = "#22c55e"
    if req.university_id:
        uni = db.query(University).filter(University.id == req.university_id).first()
        if uni:
            primary_color = uni.primary_color

    token = create_access_token({"sub": str(student.id), "alias": alias})
    return {
        "access_token": token,
        "token_type": "bearer",
        "anonymous_alias": alias,
        "student_id": student.id,
        "primary_color": primary_color,
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a student and return a JWT + their anonymous alias."""
    student = db.query(Student).filter(Student.email_hash == req.email.lower()).first()
    if not student or not verify_password(req.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    primary_color = "#22c55e"
    if student.university_id:
        uni = db.query(University).filter(University.id == student.university_id).first()
        if uni:
            primary_color = uni.primary_color

    token = create_access_token({"sub": str(student.id), "alias": student.anonymous_token})
    return {
        "access_token": token,
        "token_type": "bearer",
        "anonymous_alias": student.anonymous_token,
        "student_id": student.id,
        "primary_color": primary_color,
    }


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiates password reset by sending an OTP."""
    student = db.query(Student).filter(Student.email_hash == req.email.lower()).first()
    if not student:
        # Do not leak whether the email exists or not
        return {"status": "success", "message": "If the email exists, an OTP has been sent."}
    
    # [MOCK] In a real app, generate a 6-digit OTP, store in DB with expiration, and send via email/SMS.
    # For demo purposes, we assume '123456' is sent.
    return {"status": "success", "message": "If the email exists, an OTP has been sent."}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verifies OTP and resets the password."""
    student = db.query(Student).filter(Student.email_hash == req.email.lower()).first()
    if not student:
        raise HTTPException(status_code=400, detail="Invalid request")
    
    # [MOCK] We accept '123456' as the universal test OTP.
    if req.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    student.password_hash = hash_password(req.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully."}


class SSOLoginRequest(BaseModel):
    provider: str
    token: str


@router.post("/sso")
def sso_login(req: SSOLoginRequest, db: Session = Depends(get_db)):
    """Mock SSO login for Google/Microsoft."""
    if req.provider not in ["google", "microsoft"]:
        raise HTTPException(status_code=400, detail="Unsupported SSO provider")
    
    # [MOCK] In a real app, verify `req.token` via Google/Microsoft API to get the email.
    mock_email = f"sso_user_{req.provider}@university.edu"
    
    student = db.query(Student).filter(Student.email_hash == mock_email).first()
    if not student:
        # Auto-register SSO user
        alias = generate_anonymous_alias()
        student = Student(
            email_hash=mock_email,
            password_hash=hash_password("sso_generated_pwd!"),
            encrypted_name=encrypt_data("SSO User"),
            encrypted_phone=encrypt_data(""),
            encrypted_email=encrypt_data(mock_email),
            anonymous_token=alias,
            department="General",
            year=1,
            risk_score=0.0,
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    token_jwt = create_access_token({"sub": str(student.id), "alias": student.anonymous_token})
    return {
        "access_token": token_jwt,
        "token_type": "bearer",
        "anonymous_alias": student.anonymous_token,
        "student_id": student.id,
        "primary_color": "#22c55e",
    }


class ProfileUpdateRequest(BaseModel):
    department: Optional[str] = None
    year: Optional[int] = None


@router.get("/profile")
def get_profile(current: Student = Depends(_get_current_student), db: Session = Depends(get_db)):
    """Return the authenticated student's profile (alias + demographics). No PII exposed."""
    primary_color = "#22c55e"
    if current.university_id:
        uni = db.query(University).filter(University.id == current.university_id).first()
        if uni:
            primary_color = uni.primary_color

    return {
        "anonymous_alias": current.anonymous_token,
        "department": current.department,
        "year": current.year,
        "primary_color": primary_color,
    }


@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    current: Student = Depends(_get_current_student),
    db: Session = Depends(get_db),
):
    """Allow a student to update their department and/or year. Identity is never exposed."""
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


class FCMTokenRequest(BaseModel):
    token: str


@router.post("/fcm-token")
def update_fcm_token(
    req: FCMTokenRequest,
    current: Student = Depends(_get_current_student),
    db: Session = Depends(get_db),
):
    """Save the FCM push notification token for the student."""
    current.fcm_token = req.token
    db.commit()
    return {"status": "success", "message": "FCM token updated."}
