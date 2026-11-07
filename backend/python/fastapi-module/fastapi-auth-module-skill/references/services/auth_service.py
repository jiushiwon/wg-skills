# 认证服务

import jwt
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from src.auth.models import SysUser, SysRole, SysUserRole, SysMenu
from src.auth.schemas import LoginResponse, CurrentUser
from src.auth.constants import (
    TOKEN_TYPE, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
)


class AuthService:
    """认证服务"""

    @staticmethod
    async def login(username: str, password: str) -> Optional[LoginResponse]:
        """
        用户登录
        """
        from src.auth.models import SysUser
        from sqlmodel import select
        from database import get_session

        async with get_session() as session:
            stmt = select(SysUser).where(
                SysUser.username == username,
                SysUser.deleted_at == None
            )
            user = await session.exec(stmt).first()

            if not user or not AuthService.verify_password(password, user.password_hash):
                return None

            if user.status != 1:
                raise Exception("用户已被禁用")

            # 生成 token
            return await AuthService.create_token(user)

    @staticmethod
    def verify_password(plain_password: str, password_hash: str) -> bool:
        """验证密码"""
        import hashlib
        return hashlib.sha256(plain_password.encode()).hexdigest() == password_hash

    @staticmethod
    def hash_password(password: str) -> str:
        """密码加密"""
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

    @staticmethod
    async def create_token(user: SysUser) -> LoginResponse:
        """生成 Token"""
        from config import settings

        now = datetime.utcnow()
        expire_at = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        payload = {
            "sub": str(user.id),
            "username": user.username,
            "exp": expire_at
        }
        access_token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

        refresh_expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_payload = {
            "sub": str(user.id),
            "type": "refresh",
            "exp": refresh_expire
        }
        refresh_token = jwt.encode(refresh_payload, settings.JWT_SECRET, algorithm="HS256")

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=TOKEN_TYPE,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    @staticmethod
    async def get_current_user_by_token(token: str) -> Optional[CurrentUser]:
        """通过 Token 获取当前用户"""
        from config import settings
        from sqlmodel import select
        from database import get_session

        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            user_id = int(payload.get("sub"))
        except jwt.ExpiredSignatureError:
            return None

        async with get_session() as session:
            stmt = select(SysUser).where(
                SysUser.id == user_id,
                SysUser.deleted_at == None
            )
            user = await session.exec(stmt).first()

            if not user or user.status != 1:
                return None

            # 获取用户角色
            role_stmt = select(SysRole).join(
                SysUserRole, SysUserRole.role_id == SysRole.id
            ).where(SysUserRole.user_id == user.id)
            roles = await session.exec(role_stmt).all()

            # 获取用户权限
            permissions = []
            for role in roles:
                menu_stmt = select(SysMenu).join(
                    SysRoleMenu, SysRoleMenu.menu_id == SysMenu.id
                ).where(SysRoleMenu.role_id == role.id)
                menus = await session.exec(menu_stmt).all()
                for menu in menus:
                    if menu.permission:
                        permissions.append(menu.permission)

            return CurrentUser(
                id=user.id,
                username=user.username,
                nickname=user.nickname,
                tenant_id=user.tenant_id,
                org_id=user.org_id,
                roles=[r.code for r in roles],
                permissions=list(set(permissions))
            )

    @staticmethod
    async def logout(user_id: int):
        """登出（可扩展：加入黑名单）"""
        pass

    @staticmethod
    async def change_password(user_id: int, old_password: str, new_password: str):
        """修改密码"""
        from sqlmodel import select, update
        from database import get_session

        async with get_session() as session:
            stmt = select(SysUser).where(SysUser.id == user_id)
            user = await session.exec(stmt).first()

            if not AuthService.verify_password(old_password, user.password_hash):
                raise Exception("原密码错误")

            user.password_hash = AuthService.hash_password(new_password)
            session.add(user)
            await session.commit()

    @staticmethod
    async def get_user_menus(user_id: int) -> List[Dict]:
        """获取用户菜单树"""
        from sqlmodel import select
        from database import get_session

        async with get_session() as session:
            # 获取用户角色
            role_stmt = select(SysRole.id).join(
                SysUserRole, SysUserRole.role_id == SysRole.id
            ).where(SysUserRole.user_id == user_id)
            role_ids = await session.exec(role_stmt).all()

            # 获取角色菜单
            menu_stmt = select(SysMenu).join(
                SysRoleMenu, SysRoleMenu.menu_id == SysMenu.id
            ).where(
                SysRoleMenu.role_id.in_(role_ids),
                SysMenu.status == 1,
                SysMenu.deleted_at == None
            ).order_by(SysMenu.sort_order)
            menus = await session.exec(menu_stmt).all()

            # 构建菜单树
            return MenuService.build_menu_tree([m.model_dump() for m in menus])


class MenuService:
    """菜单服务（内嵌）"""

    @staticmethod
    def build_menu_tree(menus: List[Dict]) -> List[Dict]:
        """构建菜单树"""
        menu_map = {m["id"]: m for m in menus}
        tree = []

        for menu in menus:
            if menu.get("parent_id") is None:
                tree.append(MenuService._build_children(menu, menu_map))
            elif menu["parent_id"] not in menu_map:
                # 孤立节点也加入
                tree.append(menu)

        return tree

    @staticmethod
    def _build_children(menu: Dict, menu_map: Dict) -> Dict:
        """递归构建子节点"""
        children = []
        for m in menu_map.values():
            if m.get("parent_id") == menu["id"]:
                children.append(MenuService._build_children(m, menu_map))

        if children:
            menu["children"] = children
        else:
            menu["children"] = []

        return menu
