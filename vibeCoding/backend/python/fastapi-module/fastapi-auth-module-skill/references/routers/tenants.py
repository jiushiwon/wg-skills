# 租户管理路由

from fastapi import APIRouter, Depends, HTTPException
from src.auth.schemas import PageRequest, PageResponse
from src.auth.dependencies import get_current_user
from src.auth.services.tenant_service import TenantService
from src.auth.schemas import CurrentUser
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/tenants", tags=["租户管理"])


class TenantCreateRequest(BaseModel):
    name: str
    code: str
    status: int = 1


class TenantUpdateRequest(BaseModel):
    name: Optional[str] = None
    status: Optional[int] = None


class TenantResponse(BaseModel):
    id: int
    name: str
    code: str
    status: int


@router.get("")
async def list_tenants(
    page: int = 1,
    page_size: int = 10,
    name: str = None,
    code: str = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """租户列表"""
    return await TenantService.list_tenants(page, page_size, name, code)


@router.get("/{tenant_id}")
async def get_tenant(
    tenant_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """租户详情"""
    tenant = await TenantService.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="租户不存在")
    return tenant


@router.post("")
async def create_tenant(
    req: TenantCreateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """创建租户"""
    return await TenantService.create_tenant(req, current_user)


@router.put("/{tenant_id}")
async def update_tenant(
    tenant_id: int,
    req: TenantUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """更新租户"""
    await TenantService.update_tenant(tenant_id, req)
    return {"code": 0, "message": "更新成功"}


@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """删除租户（软删除）"""
    await TenantService.delete_tenant(tenant_id)
    return {"code": 0, "message": "删除成功"}
