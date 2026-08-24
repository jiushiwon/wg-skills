# 角色管理路由

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from src.auth.schemas import (
    RoleCreateRequest, RoleUpdateRequest, RoleResponse, PageRequest, PageResponse
)
from src.auth.dependencies import get_current_user
from src.auth.services.role_service import RoleService
from src.auth.schemas import CurrentUser

router = APIRouter(prefix="/api/roles", tags=["角色管理"])


@router.get("")
async def list_roles(
    page: int = 1,
    page_size: int = 10,
    name: str = None,
    code: str = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """角色列表"""
    return await RoleService.list_roles(page, page_size, name, code)


@router.get("/{role_id}")
async def get_role(
    role_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """角色详情"""
    role = await RoleService.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    return role


@router.post("")
async def create_role(
    req: RoleCreateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """创建角色"""
    return await RoleService.create_role(req, current_user)


@router.put("/{role_id}")
async def update_role(
    role_id: int,
    req: RoleUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """更新角色"""
    await RoleService.update_role(role_id, req, current_user)
    return {"code": 0, "message": "更新成功"}


@router.delete("/{role_id}")
async def delete_role(
    role_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """删除角色（软删除）"""
    await RoleService.delete_role(role_id)
    return {"code": 0, "message": "删除成功"}


@router.get("/{role_id}/menus")
async def get_role_menus(
    role_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """获取角色关联的菜单"""
    return await RoleService.get_role_menus(role_id)


@router.put("/{role_id}/menus")
async def assign_role_menus(
    role_id: int,
    menu_ids: List[int],
    current_user: CurrentUser = Depends(get_current_user)
):
    """分配角色菜单"""
    await RoleService.assign_menus(role_id, menu_ids)
    return {"code": 0, "message": "菜单分配成功"}
