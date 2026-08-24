# 菜单管理路由

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.auth.schemas import (
    MenuCreateRequest, MenuUpdateRequest, MenuTreeItem
)
from src.auth.dependencies import get_current_user
from src.auth.services.menu_service import MenuService
from src.auth.schemas import CurrentUser

router = APIRouter(prefix="/api/menus", tags=["菜单管理"])


@router.get("")
async def list_menus(
    name: str = None,
    menu_type: str = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """菜单列表（树形）"""
    return await MenuService.list_menus(name, menu_type)


@router.get("/all")
async def get_all_menus(
    current_user: CurrentUser = Depends(get_current_user)
):
    """获取所有菜单（不分页，用于下拉选择）"""
    return await MenuService.get_all_menus()


@router.get("/{menu_id}")
async def get_menu(
    menu_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """菜单详情"""
    menu = await MenuService.get_menu(menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="菜单不存在")
    return menu


@router.post("")
async def create_menu(
    req: MenuCreateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """创建菜单"""
    return await MenuService.create_menu(req, current_user)


@router.put("/{menu_id}")
async def update_menu(
    menu_id: int,
    req: MenuUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """更新菜单"""
    await MenuService.update_menu(menu_id, req)
    return {"code": 0, "message": "更新成功"}


@router.delete("/{menu_id}")
async def delete_menu(
    menu_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """删除菜单"""
    await MenuService.delete_menu(menu_id)
    return {"code": 0, "message": "删除成功"}


@router.get("/tree/select")
async def get_menu_tree_select(
    current_user: CurrentUser = Depends(get_current_user)
):
    """获取菜单下拉树（用于选择父菜单）"""
    return await MenuService.get_tree_select()
