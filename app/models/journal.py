from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from .base import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    content = Column(Text)
    mood_tag = Column(String, nullable=True)  # 'academic', 'relationships', 'family', 'finance', 'health', 'career'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
