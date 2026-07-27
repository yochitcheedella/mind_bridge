from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, generate_anonymous_alias, decode_token
from app.models.user import Student

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


class RegisterRequest(BaseModel):
    email: str
    password: str
    department: str = "General"
    year: int = 1


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
        anonymous_token=alias,
        department=req.department,
        year=req.year,
        risk_score=0.0,
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    token = create_access_token({"sub": str(student.id), "alias": alias})
    return {
        "access_token": token,
        "token_type": "bearer",
        "anonymous_alias": alias,
        "student_id": student.id,
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a student and return a JWT + their anonymous alias."""
    student = db.query(Student).filter(Student.email_hash == req.email.lower()).first()
    if not student or not verify_password(req.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(student.id), "alias": student.anonymous_token})
    return {
        "access_token": token,
        "token_type": "bearer",
        "anonymous_alias": student.anonymous_token,
        "student_id": student.id,
    }


class ProfileUpdateRequest(BaseModel):
    department: Optional[str] = None
    year: Optional[int] = None


@router.get("/profile")
def get_profile(current: Student = Depends(_get_current_student)):
    """Return the authenticated student's profile (alias + demographics). No PII exposed."""
    return {
        "anonymous_alias": current.anonymous_token,
        "department": current.department,
        "year": current.year,
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
