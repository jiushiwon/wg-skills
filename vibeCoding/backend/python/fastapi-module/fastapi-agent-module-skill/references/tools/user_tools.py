# 用户相关 Tools（依赖 auth 模块）
# ✅ 修复 P0-A1: current_user_id 必须是必需参数（系统自动注入，禁止外部指定）
# 权限安全：不允许通过参数查询其他用户，仅允许查询当前用户

from src.agent.tools import tool


@tool(name="get_user_info", description="获取当前用户信息。只能查询当前登录用户的基本信息（不包含手机/邮箱等敏感字段）")
async def get_user_info(current_user_id: int) -> dict:
    """
    查询当前用户信息（不含敏感字段）

    Args:
        current_user_id: 当前登录用户ID（由系统自动注入，不接受外部指定）

    Returns:
        用户信息字典（已脱敏）
    """
    from src.auth.services.user_service import UserService

    user = await UserService.get_user(current_user_id)
    if not user:
        return {"error": "用户不存在"}

    # 字段脱敏：只返回非敏感信息
    return {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "org_id": user.org_id,
        "status": user.status,
        # 敏感字段（手机号/邮箱）不返回
    }


@tool(name="get_user_roles", description="获取当前用户的角色。只能查询当前登录用户的角色，不能查询其他用户")
async def get_user_roles(current_user_id: int) -> dict:
    """
    查询当前用户的角色

    Args:
        current_user_id: 当前登录用户ID（由系统自动注入）

    Returns:
        角色列表
    """
    from src.auth.services.user_service import UserService

    roles = await UserService.get_user_roles(current_user_id)
    return {"roles": roles}


@tool(name="get_user_menus", description="获取当前用户的菜单权限。只能查询当前登录用户的菜单")
async def get_user_menus(current_user_id: int) -> dict:
    """
    查询当前用户的菜单

    Args:
        current_user_id: 当前登录用户ID（由系统自动注入）

    Returns:
        菜单树列表
    """
    from src.auth.services.auth_service import AuthService

    menus = await AuthService.get_user_menus(current_user_id)
    return {"menus": menus}


@tool(name="search_users", description="搜索用户。仅返回脱敏后的基本信息（ID、用户名、昵称），不含手机/邮箱")
async def search_users(keyword: str = "", limit: int = 10, current_user_id: int = 0) -> dict:
    """
    搜索用户（结果已脱敏）

    Args:
        keyword: 搜索关键词
        limit: 返回数量限制（默认10）
        current_user_id: 当前登录用户ID（由系统自动注入，用于审计）

    Returns:
        用户列表（脱敏后）
    """
    from src.auth.services.user_service import UserService

    # ✅ 修复 P0-S6: limit 范围限制（之前无上限可撑爆数据库）
    safe_limit = min(max(limit, 1), 50)

    result = await UserService.list_users(page=1, page_size=safe_limit, username=keyword)
    return {
        "total": result.total,
        "users": [
            {"id": u.id, "username": u.username, "nickname": u.nickname}
            for u in result.items
        ]
    }