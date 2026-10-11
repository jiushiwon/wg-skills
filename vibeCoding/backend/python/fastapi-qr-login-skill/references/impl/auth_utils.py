"""JWT Token 生成工具"""
from datetime import datetime, timedelta, timezone

JWT_SECRET = "your-secret-key"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7


def create_token(user_id: str, expires_days: int = None) -> str:
    """生成 JWT，payload: {sub: userId, iat, exp}"""
    import jwt
    if not user_id:
        raise ValueError("user_id 不能为空")
    expire = datetime.now(timezone.utc) + timedelta(days=expires_days or JWT_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
