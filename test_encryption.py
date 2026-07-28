from app.core.database import SessionLocal
from app.models.user import Student
from app.core.security import encrypt_data, decrypt_data, hash_password
from app.api.auth import generate_anonymous_alias

def test():
    db = SessionLocal()
    
    # 1. Simulate registration
    name = "John Doe"
    phone = "123-456-7890"
    email = "johndoe@university.edu"
    
    alias = generate_anonymous_alias()
    student = Student(
        email_hash=email.lower(), # Simple mock for hash
        password_hash=hash_password("securepassword"),
        encrypted_name=encrypt_data(name),
        encrypted_phone=encrypt_data(phone),
        encrypted_email=encrypt_data(email.lower()),
        anonymous_token=alias
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    
    print(f"Stored Name Ciphertext: {student.encrypted_name}")
    print(f"Stored Phone Ciphertext: {student.encrypted_phone}")
    
    assert student.encrypted_name != name
    assert student.encrypted_phone != phone
    
    # 2. Simulate Emergency Decryption
    decrypted_name = decrypt_data(student.encrypted_name)
    decrypted_phone = decrypt_data(student.encrypted_phone)
    decrypted_email = decrypt_data(student.encrypted_email)
    
    print(f"Decrypted Name: {decrypted_name}")
    print(f"Decrypted Phone: {decrypted_phone}")
    print(f"Decrypted Email: {decrypted_email}")
    
    assert decrypted_name == name
    assert decrypted_phone == phone
    assert decrypted_email == email
    
    print("All encryption/decryption tests passed successfully!")

if __name__ == "__main__":
    test()
