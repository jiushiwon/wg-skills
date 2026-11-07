# 组织架构服务

from typing import Optional, List, Dict
from sqlmodel import select
from database import get_session
from src.auth.models import SysOrg
from src.auth.schemas import PageResponse


class OrgService:
    """组织架构服务"""

    @staticmethod
    async def list_orgs(page: int, page_size: int, name: str = None) -> PageResponse:
        """组织列表"""
        async with get_session() as session:
            stmt = select(SysOrg).where(SysOrg.deleted_at == None)

            if name:
                stmt = stmt.where(SysOrg.name.contains(name))

            stmt = stmt.order_by(SysOrg.sort_order, SysOrg.id)
            stmt = stmt.offset((page - 1) * page_size).limit(page_size)

            items = await session.exec(stmt).all()

            count_stmt = select(SysOrg).where(SysOrg.deleted_at == None)
            total = len(await session.exec(count_stmt).all())

            return PageResponse(
                items=[m.model_dump() for m in items],
                total=total,
                page=page,
                page_size=page_size
            )

    @staticmethod
    async def get_org_tree() -> List[Dict]:
        """获取组织树"""
        async with get_session() as session:
            stmt = select(SysOrg).where(
                SysOrg.deleted_at == None,
                SysOrg.status == 1
            ).order_by(SysOrg.sort_order)
            orgs = await session.exec(stmt).all()
            return OrgService.build_org_tree([o.model_dump() for o in orgs])

    @staticmethod
    async def get_org(org_id: int) -> Optional[Dict]:
        """获取组织详情"""
        async with get_session() as session:
            stmt = select(SysOrg).where(
                SysOrg.id == org_id,
                SysOrg.deleted_at == None
            )
            org = await session.exec(stmt).first()
            return org.model_dump() if org else None

    @staticmethod
    async def create_org(req, current_user) -> Dict:
        """创建组织"""
        async with get_session() as session:
            org = SysOrg(
                name=req.name,
                parent_id=req.parent_id,
                sort_order=req.sort_order or 0,
                leader_user_id=req.leader_user_id,
                phone=req.phone,
                email=req.email,
                status=req.status or 1
            )
            session.add(org)
            await session.commit()
            return org.model_dump()

    @staticmethod
    async def update_org(org_id: int, req):
        """更新组织"""
        async with get_session() as session:
            stmt = select(SysOrg).where(SysOrg.id == org_id)
            org = await session.exec(stmt).first()

            if not org:
                raise Exception("组织不存在")

            if req.name is not None:
                org.name = req.name
            if req.parent_id is not None:
                org.parent_id = req.parent_id
            if req.sort_order is not None:
                org.sort_order = req.sort_order
            if req.leader_user_id is not None:
                org.leader_user_id = req.leader_user_id
            if req.phone is not None:
                org.phone = req.phone
            if req.email is not None:
                org.email = req.email
            if req.status is not None:
                org.status = req.status

            session.add(org)
            await session.commit()

    @staticmethod
    async def delete_org(org_id: int):
        """删除组织（软删除）"""
        from datetime import datetime
        async with get_session() as session:
            stmt = select(SysOrg).where(SysOrg.id == org_id)
            org = await session.exec(stmt).first()

            if org:
                org.deleted_at = datetime.utcnow()
                await session.commit()

    @staticmethod
    def build_org_tree(orgs: List[Dict]) -> List[Dict]:
        """构建组织树"""
        org_map = {o["id"]: {**o, "children": []} for o in orgs}
        tree = []

        for org in orgs:
            if org.get("parent_id") is None or org["parent_id"] not in org_map:
                if org.get("parent_id") is None:
                    tree.append(org_map[org["id"]])
                else:
                    tree.append({**org, "children": []})

        return tree
