from functools import lru_cache
from fastapi import Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.config import settings
from app.exceptions import BusinessException
from app.utils.security import JWTUtil

security = HTTPBearer(auto_error=False)


@lru_cache()
def get_jwt() -> JWTUtil:
    return JWTUtil(settings.jwt_secret, settings.jwt_expires_in, settings.jwt_refresh_expires_in)


def _resolve_current_user(
    credentials: HTTPAuthorizationCredentials | None,
    token: str | None,
    jwt: JWTUtil,
) -> dict:
    raw_token = credentials.credentials if credentials else token
    if not raw_token:
        raise BusinessException(-1002, "未登录，请先获取 Token")
    try:
        payload = jwt.parse(raw_token)
        return {"user_id": int(payload["sub"]), "username": payload["username"]}
    except JWTError:
        raise BusinessException(-1002, "Token 无效或已过期")


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    token: str | None = Query(None, description="SSE 等无法设置 Header 的场景通过 URL 参数传递"),
    jwt: JWTUtil = Depends(get_jwt),
) -> dict:
    return _resolve_current_user(credentials, token, jwt)


async def optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    token: str | None = Query(None, description="SSE 等无法设置 Header 的场景通过 URL 参数传递"),
    jwt: JWTUtil = Depends(get_jwt),
) -> dict | None:
    """上传等接口在 DB_TYPE=none 时允许匿名，其他模式必须登录。"""
    if settings.db_type == "none":
        return None
    return _resolve_current_user(credentials, token, jwt)


# 数据库会话依赖从 database.py 透传，保持 routers 只依赖 dependencies.py
from app.database import get_db  # noqa: E402