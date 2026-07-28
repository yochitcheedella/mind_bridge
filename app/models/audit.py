from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from .base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, index=True)  # e.g., 'IDENTITY_DECRYPTED'
    target_student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    requested_by = Column(String)  # e.g., psychologist ID or system role
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
