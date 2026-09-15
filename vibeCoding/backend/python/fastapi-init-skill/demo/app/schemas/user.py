from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64, description="用户名")
    # 🔴 生产环境建议将 min_length 提高到 8 并增加复杂度校验（大小写+数字+特殊字符）
    password: str = Field(..., min_length=8, max_length=128, description="密码")
    email: EmailStr | None = Field(default=None, max_length=128, description="邮箱")
    phone: str | None = Field(default=None, max_length=20, description="手机号")


class LoginRequest(BaseModel):
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="刷新令牌")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="访问令牌")
    refresh_token: str = Field(..., description="刷新令牌")
    token_type: str = Field(default="bearer", description="令牌类型")


class UserResponse(BaseModel):
    id: int
    username: str
    email: str | None = None
    phone: str | None = None
    nickname: str | None = None
    avatar: str | None = None
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    email: str | None = Field(default=None, description="邮箱")
    phone: str | None = Field(default=None, description="手机号")
    nickname: str | None = Field(default=None, min_length=1, max_length=64, description="昵称")
    avatar: str | None = Field(default=None, description="头像URL")


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., description="旧密码")
    # 🔴 生产环境建议增加复杂度校验（大小写+数字+特殊字符）
    new_password: str = Field(..., min_length=8, max_length=128, description="新密码")


class PaginatedResponse(BaseModel):
    page: int
    page_size: int = Field(..., alias="pageSize", serialization_alias="pageSize")
    total: int
    list: list[UserResponse]