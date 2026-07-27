from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import random

import os

# TODO: In production, load SECRET_KEY from environment variable
SECRET_KEY = os.getenv("SECRET_KEY", "mindbridge-secret-key-change-in-production-use-env-var")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=13)

# Anonymous alias components — avoids any personally identifiable descriptors
ADJECTIVES = [
    "Blue", "Silver", "Golden", "Purple", "Crimson", "Emerald",
    "Azure", "Jade", "Amber", "Coral", "Violet", "Indigo",
    "Teal", "Copper", "Sapphire", "Rose", "Forest", "Arctic",
]
NOUNS = [
    "Sparrow", "Eagle", "Ocean", "Phoenix", "Wolf", "Falcon",
    "River", "Mountain", "Star", "Comet", "Orchid", "Cedar",
    "Horizon", "Breeze", "Harbor", "Lantern", "Echo", "Ember",
]


def generate_anonymous_alias() -> str:
    """Generates a unique, anonymous display name such as 'Blue Sparrow #4821'."""
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    num = random.randint(1000, 9999)
    return f"{adj} {noun} #{num}"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
