from app.core.database import SessionLocal
from app.api.risk import get_campus_analytics
from app.models.user import Student
import json

def test():
    db = SessionLocal()
    
    # 1. Create a few students across different departments
    db.query(Student).delete()
    db.commit()
    
    s1 = Student(anonymous_token="a1", department="Computer Science", risk_score=0.8)
    s2 = Student(anonymous_token="a2", department="Computer Science", risk_score=0.2)
    s3 = Student(anonymous_token="a3", department="Medicine", risk_score=0.9)
    s4 = Student(anonymous_token="a4", department="Engineering", risk_score=0.4)
    s5 = Student(anonymous_token="a5", department="Engineering", risk_score=0.6)
    
    db.add_all([s1, s2, s3, s4, s5])
    db.commit()
    
    # 2. Call the analytics function
    res = get_campus_analytics(db)
    
    # Print it out nicely
    print(json.dumps(res, indent=2))
    
    # Verify
    assert len(res["department_data"]) == 3, "Should have 3 departments"
    assert res["department_data"][0]["name"] == "Medicine", "Medicine should be highest stress (90)"
    assert res["department_data"][0]["stress"] == 90
    
    print("TEST PASSED: Admin analytics successfully returns dynamic department data!")

if __name__ == "__main__":
    test()
