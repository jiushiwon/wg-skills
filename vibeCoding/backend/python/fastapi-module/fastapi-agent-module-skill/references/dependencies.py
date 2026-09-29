# Agent 依赖 - 复用 Auth 模块的依赖

from fastapi import Depends
from src.auth.dependencies import get_current_user as auth_get_current_user
from src.auth.schemas import CurrentUser

# 直接复用 auth 模块的 get_current_user
# Agent 模块不需要自己实现，直接依赖 auth 模块的依赖
get_current_user = auth_get_current_user
