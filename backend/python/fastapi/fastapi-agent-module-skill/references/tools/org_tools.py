# 组织架构 Tools（依赖 auth 模块）

from typing import Optional
from src.agent.tools import tool


@tool(name="get_org_tree", description="获取组织架构树。查询完整的部门组织结构")
async def get_org_tree() -> dict:
    """
    查询组织架构树

    Returns:
        组织树
    """
    from src.auth.services.org_service import OrgService

    tree = await OrgService.get_org_tree()
    return {"org_tree": tree}


@tool(name="get_org_detail", description="获取部门详情。根据部门ID查询详细信息")
async def get_org_detail(org_id: int) -> dict:
    """
    查询部门详情

    Args:
        org_id: 部门ID

    Returns:
        部门信息
    """
    from src.auth.services.org_service import OrgService

    org = await OrgService.get_org(org_id)
    if not org:
        return {"error": "部门不存在"}

    return org


@tool(name="get_post_list", description="获取岗位列表。查询所有岗位")
async def get_post_list(status: int = 1) -> dict:
    """
    查询岗位列表

    Args:
        status: 岗位状态，默认查询在职

    Returns:
        岗位列表
    """
    from src.auth.services.post_service import PostService

    posts = await PostService.get_all_posts()
    return {"posts": posts}


@tool(name="get_tenant_info", description="获取租户信息。查询当前系统的租户列表")
async def get_tenant_info() -> dict:
    """
    查询租户列表

    Returns:
        租户列表
    """
    from src.auth.services.tenant_service import TenantService

    result = await TenantService.list_tenants(page=1, page_size=100)
    return {
        "total": result.total,
        "tenants": result.items
    }
