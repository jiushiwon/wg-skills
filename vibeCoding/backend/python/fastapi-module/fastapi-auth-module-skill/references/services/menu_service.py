# 菜单服务

from typing import Optional, List, Dict
from sqlmodel import select, and_
from database import get_session
from src.auth.models import SysMenu


class MenuService:
    """菜单服务"""

    @staticmethod
    async def list_menus(name: str = None, menu_type: str = None) -> List[Dict]:
        """菜单列表"""
        async with get_session() as session:
            stmt = select(SysMenu).where(SysMenu.deleted_at == None)

            if name:
                stmt = stmt.where(SysMenu.name.contains(name))
            if menu_type:
                stmt = stmt.where(SysMenu.menu_type == menu_type)

            stmt = stmt.order_by(SysMenu.sort_order, SysMenu.id)
            menus = await session.exec(stmt).all()

            # 转换为树形
            return MenuService.build_menu_tree([m.model_dump() for m in menus])

    @staticmethod
    async def get_all_menus() -> List[Dict]:
        """获取所有菜单"""
        async with get_session() as session:
            stmt = select(SysMenu).where(
                SysMenu.deleted_at == None,
                SysMenu.status == 1
            ).order_by(SysMenu.sort_order)
            menus = await session.exec(stmt).all()
            return [m.model_dump() for m in menus]

    @staticmethod
    async def get_menu(menu_id: int) -> Optional[Dict]:
        """获取菜单详情"""
        async with get_session() as session:
            stmt = select(SysMenu).where(
                SysMenu.id == menu_id,
                SysMenu.deleted_at == None
            )
            menu = await session.exec(stmt).first()
            return menu.model_dump() if menu else None

    @staticmethod
    async def create_menu(req, current_user) -> Dict:
        """创建菜单"""
        async with get_session() as session:
            menu = SysMenu(
                name=req.name,
                parent_id=req.parent_id,
                path=req.path,
                component=req.component,
                menu_type=req.menu_type or "M",
                icon=req.icon,
                permission=req.permission,
                sort_order=req.sort_order or 0,
                visible=req.visible if hasattr(req, 'visible') else 1,
                status=req.status if hasattr(req, 'status') else 1
            )
            session.add(menu)
            await session.commit()
            return menu.model_dump()

    @staticmethod
    async def update_menu(menu_id: int, req):
        """更新菜单"""
        async with get_session() as session:
            stmt = select(SysMenu).where(SysMenu.id == menu_id)
            menu = await session.exec(stmt).first()

            if not menu:
                raise Exception("菜单不存在")

            if req.name is not None:
                menu.name = req.name
            if req.parent_id is not None:
                menu.parent_id = req.parent_id
            if req.path is not None:
                menu.path = req.path
            if req.component is not None:
                menu.component = req.component
            if req.menu_type is not None:
                menu.menu_type = req.menu_type
            if req.icon is not None:
                menu.icon = req.icon
            if req.permission is not None:
                menu.permission = req.permission
            if req.sort_order is not None:
                menu.sort_order = req.sort_order
            if req.visible is not None:
                menu.visible = req.visible
            if req.status is not None:
                menu.status = req.status

            session.add(menu)
            await session.commit()

    @staticmethod
    async def delete_menu(menu_id: int):
        """删除菜单（软删除）"""
        from datetime import datetime
        async with get_session() as session:
            stmt = select(SysMenu).where(SysMenu.id == menu_id)
            menu = await session.exec(stmt).first()

            if menu:
                menu.deleted_at = datetime.utcnow()
                await session.commit()

    @staticmethod
    async def get_tree_select() -> List[Dict]:
        """获取菜单下拉树"""
        async with get_session() as session:
            stmt = select(SysMenu).where(
                SysMenu.deleted_at == None
            ).order_by(SysMenu.sort_order)
            menus = await session.exec(stmt).all()
            return MenuService.build_menu_tree([m.model_dump() for m in menus])

    @staticmethod
    def build_menu_tree(menus: List[Dict]) -> List[Dict]:
        """构建菜单树"""
        menu_map = {m["id"]: {**m, "children": []} for m in menus}
        tree = []

        for menu in menus:
            if menu.get("parent_id") is None or menu["parent_id"] not in menu_map:
                if menu.get("parent_id") is None:
                    tree.append(menu_map[menu["id"]])
                else:
                    # 孤立节点
                    tree.append({**menu, "children": []})

        return tree
