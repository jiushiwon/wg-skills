# 角色服务

from typing import Optional, List
from sqlmodel import select, and_
from database import get_session
from src.auth.models import SysRole, SysRoleMenu, SysMenu
from src.auth.schemas import RoleResponse, PageResponse


class RoleService:
    """角色服务"""

    @staticmethod
    async def list_roles(page: int, page_size: int, name: str = None, code: str = None) -> PageResponse:
        """角色列表"""
        async with get_session() as session:
            stmt = select(SysRole).where(SysRole.deleted_at == None)

            if name:
                stmt = stmt.where(SysRole.name.contains(name))
            if code:
                stmt = stmt.where(SysRole.code.contains(code))

            stmt = stmt.order_by(SysRole.sort_order, SysRole.id)
            stmt = stmt.offset((page - 1) * page_size).limit(page_size)

            items = await session.exec(stmt).all()

            # 获取总数
            count_stmt = select(SysRole).where(SysRole.deleted_at == None)
            total = len(await session.exec(count_stmt).all())

            result = []
            for role in items:
                menu_ids = await RoleService.get_role_menu_ids(role.id)
                result.append(RoleResponse(
                    id=role.id,
                    name=role.name,
                    code=role.code,
                    data_scope=role.data_scope,
                    sort_order=role.sort_order,
                    status=role.status,
                    created_at=role.created_at,
                    menus=menu_ids
                ))

            return PageResponse(
                items=result,
                total=total,
                page=page,
                page_size=page_size
            )

    @staticmethod
    async def get_role(role_id: int) -> Optional[RoleResponse]:
        """获取角色详情"""
        async with get_session() as session:
            stmt = select(SysRole).where(
                SysRole.id == role_id,
                SysRole.deleted_at == None
            )
            role = await session.exec(stmt).first()

            if not role:
                return None

            menu_ids = await RoleService.get_role_menu_ids(role_id)

            return RoleResponse(
                id=role.id,
                name=role.name,
                code=role.code,
                data_scope=role.data_scope,
                sort_order=role.sort_order,
                status=role.status,
                created_at=role.created_at,
                menus=menu_ids
            )

    @staticmethod
    async def create_role(req, current_user) -> RoleResponse:
        """创建角色"""
        async with get_session() as session:
            role = SysRole(
                name=req.name,
                code=req.code,
                data_scope=req.data_scope or "SELF_ONLY",
                sort_order=req.sort_order or 0,
                status=req.status or 1
            )
            session.add(role)
            await session.flush()

            # 绑定菜单
            if hasattr(req, 'menu_ids') and req.menu_ids:
                for menu_id in req.menu_ids:
                    session.add(SysRoleMenu(role_id=role.id, menu_id=menu_id))

            await session.commit()

            return await RoleService.get_role(role.id)

    @staticmethod
    async def update_role(role_id: int, req, current_user):
        """更新角色"""
        async with get_session() as session:
            stmt = select(SysRole).where(SysRole.id == role_id)
            role = await session.exec(stmt).first()

            if not role:
                raise Exception("角色不存在")

            if req.name is not None:
                role.name = req.name
            if req.data_scope is not None:
                role.data_scope = req.data_scope
            if req.sort_order is not None:
                role.sort_order = req.sort_order
            if req.status is not None:
                role.status = req.status

            session.add(role)

            # 更新菜单
            if req.menu_ids is not None:
                del_stmt = SysRoleMenu.where(role_id == role_id)
                await session.exec(del_stmt)
                for menu_id in req.menu_ids:
                    session.add(SysRoleMenu(role_id=role_id, menu_id=menu_id))

            await session.commit()

    @staticmethod
    async def delete_role(role_id: int):
        """删除角色（软删除）"""
        from datetime import datetime
        async with get_session() as session:
            stmt = select(SysRole).where(SysRole.id == role_id)
            role = await session.exec(stmt).first()

            if role:
                role.deleted_at = datetime.utcnow()
                await session.commit()

    @staticmethod
    async def get_role_menus(role_id: int) -> List[dict]:
        """获取角色菜单"""
        async with get_session() as session:
            stmt = select(SysMenu).join(
                SysRoleMenu, SysRoleMenu.menu_id == SysMenu.id
            ).where(SysRoleMenu.role_id == role_id)
            menus = await session.exec(stmt).all()
            return [m.model_dump() for m in menus]

    @staticmethod
    async def get_role_menu_ids(role_id: int) -> List[int]:
        """获取角色菜单ID列表"""
        async with get_session() as session:
            stmt = select(SysRoleMenu.menu_id).where(SysRoleMenu.role_id == role_id)
            return list(await session.exec(stmt).all())

    @staticmethod
    async def assign_menus(role_id: int, menu_ids: List[int]):
        """分配菜单"""
        async with get_session() as session:
            # 删除旧菜单
            del_stmt = SysRoleMenu.where(role_id == role_id)
            await session.exec(del_stmt)

            # 添加新菜单
            for menu_id in menu_ids:
                session.add(SysRoleMenu(role_id=role_id, menu_id=menu_id))

            await session.commit()
