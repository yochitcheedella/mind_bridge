from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter(prefix="/api/saas", tags=["saas"])

@router.get("/dashboard")
def get_saas_metrics(db: Session = Depends(get_db)):
    """Super Admin dashboard metrics for multi-university management."""
    # Mocking SaaS data for demonstration
    return {
        "mrr": 45000,
        "active_universities": 12,
        "total_students_covered": 145000,
        "recent_invoices": [
            {"id": "INV-1001", "university": "Stanford University", "amount": 12000, "status": "paid"},
            {"id": "INV-1002", "university": "MIT", "amount": 8500, "status": "pending"},
            {"id": "INV-1003", "university": "UC Berkeley", "amount": 24500, "status": "paid"}
        ],
        "system_health": "100%"
    }
