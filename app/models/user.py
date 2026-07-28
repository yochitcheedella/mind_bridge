from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True) # nullable for dev mock
    email_hash = Column(String, unique=True, index=True)        # stored as lowercase — never displayed
    password_hash = Column(String)

    # Encrypted Identity Vault (AES-128 Fernet)
    encrypted_name = Column(String, nullable=True)
    encrypted_phone = Column(String, nullable=True)
    encrypted_email = Column(String, nullable=True)

    anonymous_token = Column(String, unique=True, index=True)  # alias e.g. "Blue Sparrow #4821"
    department = Column(String, default="General")
    year = Column(Integer, default=1)
    risk_score = Column(Float, default=0.0)
    burnout_probability = Column(Float, default=0.0)
    daily_wellness_score = Column(Integer, default=100)
    fcm_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
