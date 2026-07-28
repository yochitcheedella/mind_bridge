import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import engine, get_db
from sqlalchemy.orm import sessionmaker

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_and_fetch_post():
    # Login to get token
    login_res = client.post("/api/auth/login", data={"username": "alice", "password": "password123"})
    if login_res.status_code != 200:
        pytest.skip("Auth not seeded properly for this test")
        
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a post
    post_res = client.post("/api/community/posts", json={"title": "Test Post", "content": "Hello World"}, headers=headers)
    assert post_res.status_code == 200
    post_id = post_res.json()["id"]
    
    # Fetch posts
    get_res = client.get("/api/community/posts", headers=headers)
    assert get_res.status_code == 200
    assert any(p["id"] == post_id for p in get_res.json())
    
    # Upvote post
    upvote_res = client.post(f"/api/community/posts/{post_id}/upvote", headers=headers)
    assert upvote_res.status_code == 200
    assert upvote_res.json()["upvotes"] >= 1
    
    # Add reply
    reply_res = client.post(f"/api/community/posts/{post_id}/replies", json={"content": "Me too!"}, headers=headers)
    assert reply_res.status_code == 200
    
    # Fetch single post
    single_res = client.get(f"/api/community/posts/{post_id}", headers=headers)
    assert single_res.status_code == 200
    assert len(single_res.json()["replies"]) >= 1
