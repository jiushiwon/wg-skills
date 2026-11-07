from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.bcrypt_rounds,
)


class JWTUtil:
    def __init__(self, secret: str, expires_in: int, refresh_expires_in: int):
        self.secret = secret
        self.expires_in = expires_in
        self.refresh_expires_in = refresh_expires_in
        self.algorithm = "HS256"

    def generate(self, user_id: int, username: str) -> str:
        payload = {
            "sub": str(user_id),
            "username": username,
            "exp": datetime.now(timezone.utc) + timedelta(seconds=self.expires_in),
            "type": "access",
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def generate_refresh(self, user_id: int, username: str) -> str:
        payload = {
            "sub": str(user_id),
            "username": username,
            "exp": datetime.now(timezone.utc) + timedelta(seconds=self.refresh_expires_in),
            "type": "refresh",
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def parse(self, token: str) -> dict:
        return jwt.decode(token, self.secret, algorithms=[self.algorithm])


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)