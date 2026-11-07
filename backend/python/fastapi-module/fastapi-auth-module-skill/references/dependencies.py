# Auth 模块依赖

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from src.auth.schemas import CurrentUser
from src.auth.services.auth_service import AuthService

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """获取当前登录用户"""
    token = credentials.credentials
    user = await AuthService.get_current_user_by_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证信息"
        )
    return user


def require_permissions(*permissions: str):
    """检查用户是否拥有指定权限"""
    async def check(
        current_user: CurrentUser = Depends(get_current_user)
    ):
        for perm in permissions:
            if perm not in current_user.permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"缺少权限: {perm}"
                )
        return current_user
    return check
