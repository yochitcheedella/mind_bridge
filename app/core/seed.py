from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import hash_password, encrypt_data
from app.models.user import Student
from app.models.psychologist import Psychologist
from app.models.admin import VITAdmin

def seed_demo_accounts():
    db = SessionLocal()
    try:
        # 1. Student demo account
        student_email = "student@vishnu.edu.in"
        if not db.query(Student).filter(Student.email_hash == student_email).first():
            alias = "VIT Student #4821"
            # ensure alias is unique
            if not db.query(Student).filter(Student.anonymous_token == alias).first():
                demo_student = Student(
                    email_hash=student_email,
                    password_hash=hash_password("Student@VIT2024"),
                    encrypted_name=encrypt_data("Demo Student"),
                    encrypted_phone=encrypt_data("9876543210"),
                    encrypted_email=encrypt_data(student_email),
                    anonymous_token=alias,
                    department="CSE",
                    year=3,
                    risk_score=0.0,
                )
                db.add(demo_student)

        # 2. Psychologists demo accounts
        psych_email = "ram.sir@vishnu.edu.in"
        if not db.query(Psychologist).filter(Psychologist.email == psych_email).first():
            demo_psych = Psychologist(
                name="Dr. Ram Kumar",
                specialization="Clinical Psychology & Anxiety Therapy",
                email=psych_email,
                password_hash=hash_password("Psych@VIT2024"),
                is_active=True,
                available="true"
            )
            db.add(demo_psych)
            
        psych_email_2 = "dr.sarah.mehta@vishnu.edu.in"
        if not db.query(Psychologist).filter(Psychologist.email == psych_email_2).first():
            demo_psych_2 = Psychologist(
                name="Dr. Sarah Mehta",
                specialization="Staff Clinical Counselor & CBT Specialist",
                email=psych_email_2,
                password_hash=hash_password("Psych@VIT2024"),
                is_active=True,
                available="true"
            )
            db.add(demo_psych_2)

        # 3. Admin demo account
        admin_email = "admin@vishnu.edu.in"
        if not db.query(VITAdmin).filter(VITAdmin.email == admin_email).first():
            demo_admin = VITAdmin(
                name="VIT Chief Administrator",
                email=admin_email,
                password_hash=hash_password("Admin@VIT2024"),
                is_active=True,
            )
            db.add(demo_admin)

        db.commit()
    except Exception as e:
        print(f"Error during seeding demo accounts: {e}")
        db.rollback()
    finally:
        db.close()
