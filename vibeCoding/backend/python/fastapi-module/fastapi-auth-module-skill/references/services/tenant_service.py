# 租户服务

from typing import Optional, List, Dict
from sqlmodel import select
from database import get_session
from src.auth.models import SysTenant
from src.auth.schemas import PageResponse


class TenantService:
    """租户服务"""

    @staticmethod
    async def list_tenants(page: int, page_size: int, name: str = None, code: str = None) -> PageResponse:
        """租户列表"""
        async with get_session() as session:
            stmt = select(SysTenant).where(SysTenant.deleted_at == None)

            if name:
                stmt = stmt.where(SysTenant.name.contains(name))
            if code:
                stmt = stmt.where(SysTenant.code.contains(code))

            stmt = stmt.order_by(SysTenant.id.desc())
            stmt = stmt.offset((page - 1) * page_size).limit(page_size)

            items = await session.exec(stmt).all()

            count_stmt = select(SysTenant).where(SysTenant.deleted_at == None)
            total = len(await session.exec(count_stmt).all())

            return PageResponse(
                items=[m.model_dump() for m in items],
                total=total,
                page=page,
                page_size=page_size
            )

    @staticmethod
    async def get_tenant(tenant_id: int) -> Optional[Dict]:
        """获取租户详情"""
        async with get_session() as session:
            stmt = select(SysTenant).where(
                SysTenant.id == tenant_id,
                SysTenant.deleted_at == None
            )
            tenant = await session.exec(stmt).first()
            return tenant.model_dump() if tenant else None

    @staticmethod
    async def create_tenant(req, current_user) -> Dict:
        """创建租户"""
        async with get_session() as session:
            tenant = SysTenant(
                name=req.name,
                code=req.code,
                status=req.status or 1
            )
            session.add(tenant)
            await session.commit()
            return tenant.model_dump()

    @staticmethod
    async def update_tenant(tenant_id: int, req):
        """更新租户"""
        async with get_session() as session:
            stmt = select(SysTenant).where(SysTenant.id == tenant_id)
            tenant = await session.exec(stmt).first()

            if not tenant:
                raise Exception("租户不存在")

            if req.name is not None:
                tenant.name = req.name
            if req.status is not None:
                tenant.status = req.status

            session.add(tenant)
            await session.commit()

    @staticmethod
    async def delete_tenant(tenant_id: int):
        """删除租户（软删除）"""
        from datetime import datetime
        async with get_session() as session:
            stmt = select(SysTenant).where(SysTenant.id == tenant_id)
            tenant = await session.exec(stmt).first()

            if tenant:
                tenant.deleted_at = datetime.utcnow()
                await session.commit()
