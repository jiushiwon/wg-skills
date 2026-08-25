# 用户相关 Tools（依赖 auth 模块）

from typing import Optional
from src.agent.tools import tool


@tool(name="get_user_info", description="获取用户信息。根据用户ID查询用户基本信息，包括用户名、昵称、邮箱、手机号、部门等")
async def get_user_info(user_id: int = None) -> dict:
    """
    查询用户信息

    Args:
        user_id: 用户ID，如果不传则查询当前用户

    Returns:
        用户信息字典
    """
    from src.auth.services.user_service import UserService

    if user_id is None:
        # 获取当前用户
        from src.auth.dependencies import get_current_user
        # 注意：需要在调用处注入 current_user
        return {"error": "需要提供 user_id 参数"}

    user = await UserService.get_user(user_id)
    if not user:
        return {"error": "用户不存在"}

    return {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "email": user.email,
        "phone": user.phone,
        "org_id": user.org_id,
        "status": user.status
    }


@tool(name="get_user_roles", description="获取用户角色。根据用户ID查询其拥有的角色列表")
async def get_user_roles(user_id: int = None) -> dict:
    """
    查询用户角色

    Args:
        user_id: 用户ID

    Returns:
        角色列表
    """
    from src.auth.services.user_service import UserService

    roles = await UserService.get_user_roles(user_id)
    return {"roles": roles}


@tool(name="get_user_menus", description="获取用户菜单权限。根据用户ID查询其可见的菜单树")
async def get_user_menus(user_id: int = None) -> dict:
    """
    查询用户菜单

    Args:
        user_id: 用户ID

    Returns:
        菜单树列表
    """
    from src.auth.services.auth_service import AuthService

    menus = await AuthService.get_user_menus(user_id)
    return {"menus": menus}


@tool(name="search_users", description="搜索用户。根据关键词搜索用户列表")
async def search_users(keyword: str = "", limit: int = 10) -> dict:
    """
    搜索用户

    Args:
        keyword: 搜索关键词
        limit: 返回数量限制

    Returns:
        用户列表
    """
    from src.auth.services.user_service import UserService

    result = await UserService.list_users(page=1, page_size=limit, username=keyword)
    return {
        "total": result.total,
        "users": [
            {"id": u.id, "username": u.username, "nickname": u.nickname}
            for u in result.items
        ]
    }
