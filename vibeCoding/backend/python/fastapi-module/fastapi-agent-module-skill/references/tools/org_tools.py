# 组织架构 Tools（依赖 auth 模块）
# ✅ 修复 P0-A3: 所有 Tool 注入 current_user_id，用于租户隔离 + 审计

from src.agent.tools import tool


@tool(name="get_org_tree", description="获取组织架构树。查询当前用户所属租户下的完整部门组织结构")
async def get_org_tree(current_user_id: int) -> dict:
    """
    查询组织架构树（仅当前用户所属租户）

    Args:
        current_user_id: 当前登录用户ID（由系统自动注入）

    Returns:
        组织树
    """
    from src.auth.services.org_service import OrgService
    from src.auth.services.user_service import UserService

    # ✅ 修复 P0-A3: 通过 user 获取组织（多租户隔离）
    user = await UserService.get_user(current_user_id)
    if not user or not user.tenant_id:
        return {"error": "无法识别用户租户"}

    tree = await OrgService.get_org_tree(tenant_id=user.tenant_id)
    return {"org_tree": tree, "tenant_id": user.tenant_id}


@tool(name="get_org_detail", description="获取部门详情。根据部门ID查询详细信息（仅限当前租户）")
async def get_org_detail(org_id: int, current_user_id: int) -> dict:
    """
    查询部门详情

    Args:
        org_id: 部门ID
        current_user_id: 当前登录用户ID（由系统自动注入）

    Returns:
        部门信息
    """
    from src.auth.services.org_service import OrgService
    from src.auth.services.user_service import UserService

    # ✅ 修复 P0-A3: 校验部门归属当前用户租户
    user = await UserService.get_user(current_user_id)
    if not user or not user.tenant_id:
        return {"error": "无法识别用户租户"}

    org = await OrgService.get_org(org_id, tenant_id=user.tenant_id)
    if not org:
        return {"error": "部门不存在或无权访问"}

    return org


@tool(name="get_post_list", description="获取岗位列表。查询当前租户下的所有岗位")
async def get_post_list(current_user_id: int, status: int = 1, page: int = 1, page_size: int = 20) -> dict:
    """
    查询岗位列表（仅当前租户 + 分页）

    Args:
        current_user_id: 当前登录用户ID（由系统自动注入）
        status: 岗位状态，默认查询在职
        page: 页码
        page_size: 每页数量（最大50）

    Returns:
        岗位列表
    """
    from src.auth.services.post_service import PostService
    from src.auth.services.user_service import UserService

    # ✅ 修复 P0-A3: 多租户隔离 + 分页
    user = await UserService.get_user(current_user_id)
    if not user or not user.tenant_id:
        return {"error": "无法识别用户租户"}

    # ✅ 修复 P0-S6: 边界校验
    safe_page = max(page, 1)
    safe_page_size = min(max(page_size, 1), 50)

    posts = await PostService.list_posts(
        tenant_id=user.tenant_id,
        status=status,
        page=safe_page,
        page_size=safe_page_size
    )
    return {"posts": posts.items, "total": posts.total, "page": safe_page}


@tool(name="get_tenant_info", description="获取当前用户所属租户信息。仅返回当前用户租户，不暴露其他租户")
async def get_tenant_info(current_user_id: int) -> dict:
    """
    查询当前用户所属租户信息

    Args:
        current_user_id: 当前登录用户ID（由系统自动注入）

    Returns:
        当前租户信息
    """
    from src.auth.services.tenant_service import TenantService
    from src.auth.services.user_service import UserService

    # ✅ 修复 P0-A3: 仅返回当前用户租户，不再返回所有租户列表
    user = await UserService.get_user(current_user_id)
    if not user or not user.tenant_id:
        return {"error": "无法识别用户租户"}

    tenant = await TenantService.get_tenant(user.tenant_id)
    return {"tenant": tenant}