# 用户服务

from typing import Optional, List, Dict
from sqlmodel import select, and_
from database import get_session
from src.auth.models import SysUser, SysUserRole, SysUserPost, SysRole, SysPost
from src.auth.schemas import UserResponse, PageResponse
from src.auth.services.auth_service import AuthService


class UserService:
    """用户服务"""

    @staticmethod
    async def list_users(page: int, page_size: int, username: str = None) -> PageResponse:
        """用户列表"""
        async with get_session() as session:
            stmt = select(SysUser).where(SysUser.deleted_at == None)

            if username:
                stmt = stmt.where(SysUser.username.contains(username))

            stmt = stmt.order_by(SysUser.id.desc())
            stmt = stmt.offset((page - 1) * page_size).limit(page_size)

            items = await session.exec(stmt).all()

            # 获取总数
            count_stmt = select(SysUser).where(SysUser.deleted_at == None)
            if username:
                count_stmt = count_stmt.where(SysUser.username.contains(username))
            total = len(await session.exec(count_stmt).all())

            # 转换响应
            result = []
            for user in items:
                roles = await UserService.get_user_roles(user.id)
                posts = await UserService.get_user_posts(user.id)
                result.append(UserResponse(
                    id=user.id,
                    username=user.username,
                    nickname=user.nickname,
                    email=user.email,
                    phone=user.phone,
                    avatar=user.avatar,
                    org_id=user.org_id,
                    status=user.status,
                    created_at=user.created_at,
                    roles=roles,
                    posts=posts
                ))

            return PageResponse(
                items=result,
                total=total,
                page=page,
                page_size=page_size
            )

    @staticmethod
    async def get_user(user_id: int) -> Optional[UserResponse]:
        """获取用户详情"""
        async with get_session() as session:
            stmt = select(SysUser).where(
                SysUser.id == user_id,
                SysUser.deleted_at == None
            )
            user = await session.exec(stmt).first()

            if not user:
                return None

            roles = await UserService.get_user_roles(user_id)
            posts = await UserService.get_user_posts(user_id)

            return UserResponse(
                id=user.id,
                username=user.username,
                nickname=user.nickname,
                email=user.email,
                phone=user.phone,
                avatar=user.avatar,
                org_id=user.org_id,
                status=user.status,
                created_at=user.created_at,
                roles=roles,
                posts=posts
            )

    @staticmethod
    async def create_user(req, current_user) -> UserResponse:
        """创建用户"""
        async with get_session() as session:
            user = SysUser(
                username=req.username,
                nickname=req.nickname,
                email=req.email,
                phone=req.phone,
                org_id=req.org_id,
                password_hash=AuthService.hash_password(req.password),
                status=req.status if hasattr(req, 'status') else 1
            )
            session.add(user)
            await session.flush()

            # 绑定角色
            if hasattr(req, 'role_ids') and req.role_ids:
                for role_id in req.role_ids:
                    session.add(SysUserRole(user_id=user.id, role_id=role_id))

            # 绑定岗位
            if hasattr(req, 'post_ids') and req.post_ids:
                for post_id in req.post_ids:
                    session.add(SysUserPost(user_id=user.id, post_id=post_id))

            await session.commit()

            return await UserService.get_user(user.id)

    @staticmethod
    async def update_user(user_id: int, req, current_user):
        """更新用户"""
        async with get_session() as session:
            stmt = select(SysUser).where(SysUser.id == user_id)
            user = await session.exec(stmt).first()

            if not user:
                raise Exception("用户不存在")

            if req.nickname is not None:
                user.nickname = req.nickname
            if req.email is not None:
                user.email = req.email
            if req.phone is not None:
                user.phone = req.phone
            if req.org_id is not None:
                user.org_id = req.org_id
            if req.status is not None:
                user.status = req.status

            session.add(user)

            # 更新角色
            if req.role_ids is not None:
                # 删除旧绑定
                del_stmt = SysUserRole.where(user_id == user_id)
                await session.exec(del_stmt)
                # 添加新绑定
                for role_id in req.role_ids:
                    session.add(SysUserRole(user_id=user_id, role_id=role_id))

            # 更新岗位
            if req.post_ids is not None:
                del_stmt = SysUserPost.where(user_id == user_id)
                await session.exec(del_stmt)
                for post_id in req.post_ids:
                    session.add(SysUserPost(user_id=user_id, post_id=post_id))

            await session.commit()

    @staticmethod
    async def delete_user(user_id: int):
        """删除用户（软删除）"""
        from datetime import datetime
        async with get_session() as session:
            stmt = select(SysUser).where(SysUser.id == user_id)
            user = await session.exec(stmt).first()

            if user:
                user.deleted_at = datetime.utcnow()
                await session.commit()

    @staticmethod
    async def get_user_roles(user_id: int) -> List[str]:
        """获取用户角色"""
        async with get_session() as session:
            stmt = select(SysRole).join(
                SysUserRole, SysUserRole.role_id == SysRole.id
            ).where(SysUserRole.user_id == user_id)
            roles = await session.exec(stmt).all()
            return [r.code for r in roles]

    @staticmethod
    async def get_user_posts(user_id: int) -> List[str]:
        """获取用户岗位"""
        async with get_session() as session:
            stmt = select(SysPost).join(
                SysUserPost, SysUserPost.post_id == SysPost.id
            ).where(SysUserPost.user_id == user_id)
            posts = await session.exec(stmt).all()
            return [p.name for p in posts]
