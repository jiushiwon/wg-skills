from fastapi import APIRouter, Depends, Query

from app.response import EnvelopeRoute
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateRequest, ChangePasswordRequest, PaginatedResponse
from app.exceptions import BusinessException
from app.utils.security import hash_password, verify_password

router = APIRouter(route_class=EnvelopeRoute)


@router.get("/users", summary="用户列表（分页）")
async def list_users(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, alias="pageSize", description="每页数量"),
    db=Depends(get_db),
    _=Depends(get_current_user),
):
    from sqlalchemy import select, func
    count_result = await db.execute(select(func.count(User.id)))
    total = count_result.scalar()
    result = await db.execute(
        select(User).order_by(User.id.desc()).offset((page - 1) * page_size).limit(page_size)
    )
    users = result.scalars().all()
    return PaginatedResponse(
        page=page,
        pageSize=page_size,
        total=total,
        list=[UserResponse.model_validate(u) for u in users],
    )


@router.get("/users/{user_id}", summary="用户详情")
async def get_user(user_id: int, db=Depends(get_db), _=Depends(get_current_user)):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise BusinessException(-1004, "用户不存在")
    return UserResponse.model_validate(user)


@router.put("/users/profile", summary="修改个人资料")
async def update_profile(
    body: UserUpdateRequest,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise BusinessException(-1004, "用户不存在")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.flush()
    return UserResponse.model_validate(user)


@router.put("/users/password", summary="修改密码")
async def change_password(
    body: ChangePasswordRequest,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise BusinessException(-1004, "用户不存在")
    if not verify_password(body.old_password, user.password):
        raise BusinessException(-1005, "旧密码不正确")
    user.password = hash_password(body.new_password)
    await db.flush()
    return {"message": "密码修改成功"}