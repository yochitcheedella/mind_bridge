from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    email_hash = Column(String, unique=True, index=True)        # stored as lowercase — never displayed
    password_hash = Column(String)
    anonymous_token = Column(String, unique=True, index=True)  # alias e.g. "Blue Sparrow #4821"
    department = Column(String, default="General")
    year = Column(Integer, default=1)
    risk_score = Column(Float, default=0.0)
    burnout_probability = Column(Float, default=0.0)
    daily_wellness_score = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
