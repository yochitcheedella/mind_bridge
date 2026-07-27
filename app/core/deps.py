"""
Shared FastAPI dependencies — used across all API routes.
"""
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import Student


def get_current_student(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Student:
    """
    JWT-based dependency that extracts and validates the authenticated student.
    Raises 401 if the token is missing or invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    student = db.query(Student).filter(Student.id == int(payload["sub"])).first()
    if not student:
        raise HTTPException(status_code=401, detail="Student account not found")

    return student
