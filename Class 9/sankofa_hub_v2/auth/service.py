import os
from datetime import datetime, timedelta

import bcrypt
from jose import JWTError, jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        plain.encode("utf-8"), hashed.encode("utf-8")
    )


def create_access_token(user_id: str, role: str) -> str:
    expires = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expires},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
