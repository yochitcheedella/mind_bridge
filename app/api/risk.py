from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.user import Student
from app.models.alert import RiskAlert
from app.models.mood import MoodLog

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.get("/queue")
def get_risk_queue(db: Session = Depends(get_db)):
    """
    Returns anonymous students sorted by risk score (highest first).
    Psychologist dashboard consumes this. No real identity is returned.
    """
    students = (
        db.query(Student)
        .filter(Student.risk_score > 0.0)
        .order_by(Student.risk_score.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "anonymous_id": s.anonymous_token,
            "risk_score": round(s.risk_score, 3),
            "department": s.department,
            "year": s.year,
        }
        for s in students
    ]


@router.get("/alerts")
def get_active_alerts(db: Session = Depends(get_db)):
    """Returns the count and list of active risk alerts."""
    alerts = db.query(RiskAlert).filter(RiskAlert.status == "active").all()
    return {
        "count": len(alerts),
        "alerts": [
            {
                "id": a.id,
                "risk_level": a.risk_level,
                "triggered_by": a.triggered_by,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ],
    }


@router.get("/analytics")
def get_campus_analytics(db: Session = Depends(get_db)):
    """
    Anonymous campus-wide wellbeing analytics for the admin dashboard.
    No individual student data is returned.
    """
    total_students = db.query(func.count(Student.id)).scalar() or 0
    avg_risk = db.query(func.avg(Student.risk_score)).scalar() or 0.0
    high_risk_count = db.query(func.count(Student.id)).filter(Student.risk_score >= 0.7).scalar() or 0
    medium_risk_count = db.query(func.count(Student.id)).filter(
        Student.risk_score >= 0.4, Student.risk_score < 0.7
    ).scalar() or 0

    avg_mood_raw = db.query(func.avg(MoodLog.score)).scalar()
    avg_mood = round(float(avg_mood_raw), 2) if avg_mood_raw else 3.2

    avg_burnout = db.query(func.avg(Student.burnout_probability)).scalar() or 0.0

    return {
        "total_students": total_students,
        "average_risk_score": round(float(avg_risk), 3),
        "high_risk_count": high_risk_count,
        "medium_risk_count": medium_risk_count,
        "average_mood_score": avg_mood,
        "average_burnout_probability": round(float(avg_burnout), 3),
        "campus_wellbeing_percent": max(0, round((1 - float(avg_risk)) * 100)),
    }
