from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from .base import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    psychologist_id = Column(Integer, ForeignKey("psychologists.id"), nullable=True)
    slot_time = Column(DateTime(timezone=True))
    status = Column(String, default="pending")  # pending, confirmed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
