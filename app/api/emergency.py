from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_student
from app.models.user import Student
from app.models.alert import RiskAlert

router = APIRouter(prefix="/api/emergency", tags=["emergency"])

@router.post("/sos")
def trigger_emergency_sos(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Instantly elevates the student's risk profile to maximum and creates an active crisis alert.
    """
    from app.services.notifications import send_push_notification

    # 1. Elevate risk score to maximum
    student.risk_score = 1.0

    # 2. Log the active alert
    alert = RiskAlert(
        student_id=student.id,
        risk_level="critical",
        triggered_by="user_sos",
        status="active"
    )
    
    db.add(alert)
    db.commit()

    # 3. Send Push Notification to Psychologist devices
    # Note: In a real system, you would look up the FCM tokens of active psychologists
    mock_psychologist_fcm_token = "placeholder-psychologist-fcm-token"
    send_push_notification(
        title="EMERGENCY SOS ALERT",
        body=f"Student {student.alias} has triggered an SOS.",
        fcm_token=mock_psychologist_fcm_token,
        data={"alert_id": str(alert.id), "student_id": str(student.id)}
    )

    return {"status": "success", "message": "Emergency SOS dispatched."}
