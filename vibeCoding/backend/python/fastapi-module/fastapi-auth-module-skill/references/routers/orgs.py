# 组织架构路由

from fastapi import APIRouter, Depends, HTTPException
from src.auth.schemas import PageRequest, PageResponse
from src.auth.dependencies import get_current_user
from src.auth.services.org_service import OrgService
from src.auth.schemas import CurrentUser
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/orgs", tags=["组织架构"])


class OrgCreateRequest(BaseModel):
    name: str
    parent_id: Optional[int] = None
    sort_order: int = 0
    leader_user_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: int = 1


class OrgUpdateRequest(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    leader_user_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[int] = None


class OrgResponse(BaseModel):
    id: int
    parent_id: Optional[int]
    name: str
    sort_order: int
    leader_user_id: Optional[int]
    phone: Optional[str]
    email: Optional[str]
    status: int
    children: List = []


@router.get("")
async def list_orgs(
    page: int = 1,
    page_size: int = 10,
    name: str = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """组织架构列表"""
    return await OrgService.list_orgs(page, page_size, name)


@router.get("/tree")
async def get_org_tree(
    current_user: CurrentUser = Depends(get_current_user)
):
    """获取组织架构树"""
    return await OrgService.get_org_tree()


@router.get("/{org_id}")
async def get_org(
    org_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """组织详情"""
    org = await OrgService.get_org(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="组织不存在")
    return org


@router.post("")
async def create_org(
    req: OrgCreateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """创建组织"""
    return await OrgService.create_org(req, current_user)


@router.put("/{org_id}")
async def update_org(
    org_id: int,
    req: OrgUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """更新组织"""
    await OrgService.update_org(org_id, req)
    return {"code": 0, "message": "更新成功"}


@router.delete("/{org_id}")
async def delete_org(
    org_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """删除组织（软删除）"""
    await OrgService.delete_org(org_id)
    return {"code": 0, "message": "删除成功"}
