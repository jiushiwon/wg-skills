# 岗位服务

from typing import Optional, List, Dict
from sqlmodel import select
from database import get_session
from src.auth.models import SysPost
from src.auth.schemas import PageResponse


class PostService:
    """岗位服务"""

    @staticmethod
    async def list_posts(page: int, page_size: int, name: str = None, code: str = None) -> PageResponse:
        """岗位列表"""
        async with get_session() as session:
            stmt = select(SysPost).where(SysPost.deleted_at == None)

            if name:
                stmt = stmt.where(SysPost.name.contains(name))
            if code:
                stmt = stmt.where(SysPost.code.contains(code))

            stmt = stmt.order_by(SysPost.sort_order, SysPost.id)
            stmt = stmt.offset((page - 1) * page_size).limit(page_size)

            items = await session.exec(stmt).all()

            count_stmt = select(SysPost).where(SysPost.deleted_at == None)
            total = len(await session.exec(count_stmt).all())

            return PageResponse(
                items=[m.model_dump() for m in items],
                total=total,
                page=page,
                page_size=page_size
            )

    @staticmethod
    async def get_post(post_id: int) -> Optional[Dict]:
        """获取岗位详情"""
        async with get_session() as session:
            stmt = select(SysPost).where(
                SysPost.id == post_id,
                SysPost.deleted_at == None
            )
            post = await session.exec(stmt).first()
            return post.model_dump() if post else None

    @staticmethod
    async def create_post(req, current_user) -> Dict:
        """创建岗位"""
        async with get_session() as session:
            post = SysPost(
                name=req.name,
                code=req.code,
                sort_order=req.sort_order or 0,
                status=req.status or 1
            )
            session.add(post)
            await session.commit()
            return post.model_dump()

    @staticmethod
    async def update_post(post_id: int, req):
        """更新岗位"""
        async with get_session() as session:
            stmt = select(SysPost).where(SysPost.id == post_id)
            post = await session.exec(stmt).first()

            if not post:
                raise Exception("岗位不存在")

            if req.name is not None:
                post.name = req.name
            if req.code is not None:
                post.code = req.code
            if req.sort_order is not None:
                post.sort_order = req.sort_order
            if req.status is not None:
                post.status = req.status

            session.add(post)
            await session.commit()

    @staticmethod
    async def delete_post(post_id: int):
        """删除岗位（软删除）"""
        from datetime import datetime
        async with get_session() as session:
            stmt = select(SysPost).where(SysPost.id == post_id)
            post = await session.exec(stmt).first()

            if post:
                post.deleted_at = datetime.utcnow()
                await session.commit()

    @staticmethod
    async def get_all_posts() -> List[Dict]:
        """获取所有岗位"""
        async with get_session() as session:
            stmt = select(SysPost).where(
                SysPost.deleted_at == None,
                SysPost.status == 1
            ).order_by(SysPost.sort_order)
            posts = await session.exec(stmt).all()
            return [p.model_dump() for p in posts]
