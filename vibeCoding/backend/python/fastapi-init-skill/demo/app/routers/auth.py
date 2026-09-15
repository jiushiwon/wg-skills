from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials

from app.response import EnvelopeRoute
from app.dependencies import get_db, get_current_user, get_jwt, security
from app.schemas.user import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserResponse
from app.services.user import UserService
from app.models.user import User
from app.exceptions import BusinessException
from app.utils.security import JWTUtil

router = APIRouter(route_class=EnvelopeRoute)


@router.post("/register", summary="注册新用户")
async def register(body: RegisterRequest, db=Depends(get_db), jwt: JWTUtil = Depends(get_jwt)):
    user = await UserService.create_user(db, body.username, body.password, body.email, body.phone)
    access_token = jwt.generate(user.id, user.username)
    refresh_token = jwt.generate_refresh(user.id, user.username)
    user.refresh_token = refresh_token
    await db.flush()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", summary="用户登录")
async def login(body: LoginRequest, db=Depends(get_db), jwt: JWTUtil = Depends(get_jwt)):
    user = await UserService.authenticate(db, body.username, body.password)
    access_token = jwt.generate(user.id, user.username)
    refresh_token = jwt.generate_refresh(user.id, user.username)
    user.refresh_token = refresh_token
    user.last_login_at = datetime.now(timezone.utc)
    await db.flush()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", summary="刷新令牌")
async def refresh(body: RefreshRequest, db=Depends(get_db), jwt: JWTUtil = Depends(get_jwt)):
    from sqlalchemy import select
    try:
        payload = jwt.parse(body.refresh_token)
        if payload.get("type") != "refresh":
            raise BusinessException(-1002, "无效的刷新令牌")
    except Exception:
        raise BusinessException(-1002, "刷新令牌无效或已过期")

    result = await db.execute(select(User).where(User.id == int(payload["sub"])))
    user = result.scalar_one_or_none()
    if not user or user.refresh_token != body.refresh_token:
        raise BusinessException(-1002, "刷新令牌无效")

    access_token = jwt.generate(user.id, user.username)
    refresh_token = jwt.generate_refresh(user.id, user.username)
    user.refresh_token = refresh_token
    await db.flush()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", summary="登出")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    jwt: JWTUtil = Depends(get_jwt),
    db=Depends(get_db),
):
    from sqlalchemy import select
    try:
        payload = jwt.parse(credentials.credentials)
        result = await db.execute(select(User).where(User.id == int(payload["sub"])))
        user = result.scalar_one_or_none()
        if user:
            user.refresh_token = None
            await db.flush()
    except Exception:
        pass
    return {"message": "已登出"}


@router.get("/me", summary="当前用户信息")
async def me(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise BusinessException(-1004, "用户不存在")
    return UserResponse.model_validate(user)