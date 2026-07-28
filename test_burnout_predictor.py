from app.core.database import SessionLocal
from app.models.user import Student
from app.models.habit import Habit
from app.services.risk_engine import calculate_multi_factor_risk
from datetime import date, timedelta
import json

def test():
    db = SessionLocal()
    
    import random
    import string
    random_id = "".join(random.choices(string.ascii_letters, k=8))
    # 1. Create a dummy student
    student = Student(anonymous_token=f"Test Student {random_id}")
    db.add(student)
    db.commit()
    db.refresh(student)
    
    print(f"Created student {student.anonymous_token} with ID {student.id}")
    
    # Calculate baseline burnout probability (should be around 0.15 + 0.15 = 0.3 or similar because habit_risk is 0.5)
    # wait, chat risk=0, mood=0, journal=0. 
    # burnout_prob = (0 * 0.3) + (0 * 0.3) + (0 * 0.1) + (0.5 * 0.3) = 0.15
    res1 = calculate_multi_factor_risk(db, student.id)
    print(f"Baseline Burnout Probability: {res1['burnout_probability']}")
    
    # 2. Add some habits with 100% completion in the last 7 days
    today = date.today()
    last_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7)]
    
    h1 = Habit(student_id=student.id, habit_id="h1", name="Sleep", category="Health")
    h1.completions = last_7_days
    
    h2 = Habit(student_id=student.id, habit_id="h2", name="Exercise", category="Health")
    h2.completions = last_7_days
    
    db.add(h1)
    db.add(h2)
    db.commit()
    
    # 3. Recalculate burnout probability
    # Now habit completion is 100%, so habit_risk = 0.0
    # burnout_prob should be 0.0
    res2 = calculate_multi_factor_risk(db, student.id)
    print(f"Burnout Probability after perfect habit completion: {res2['burnout_probability']}")
    
    assert res2['burnout_probability'] < res1['burnout_probability'], "Burnout probability should decrease!"
    print("TEST PASSED: Habit tracking successfully integrated into Risk Engine!")

if __name__ == "__main__":
    test()
