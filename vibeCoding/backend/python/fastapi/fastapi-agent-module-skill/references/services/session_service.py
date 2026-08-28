# 会话服务
# ✅ 修复 P1-P22: list_sessions 单查询（COUNT(*) OVER() 窗口函数）
# ✅ 修复 P0-S5: 全部查询带 user_id 校验

import logging
from typing import List, Dict, Any
from datetime import datetime, UTC
from src.agent.models import AgentSession, AgentMessage
from src.agent.database import get_session
from sqlmodel import select, func
from app.exceptions import BusinessException

logger = logging.getLogger(__name__)


class SessionService:
    """会话服务"""

    @staticmethod
    async def list_sessions(
        user_id: int,
        page: int = 1,
        page_size: int = 10
    ) -> Dict[str, Any]:
        """会话列表（✅ P1-P22: 单查询 + COUNT() OVER() 窗口函数）"""
        async with get_session() as session:
            where_clause = (
                AgentSession.user_id == user_id,
                AgentSession.deleted_at == None
            )

            # ✅ 单查询：items + total 通过 OVER() 一次往返
            total_over = func.count().over().label("total_count")
            stmt = select(AgentSession, total_over).where(
                *where_clause
            ).order_by(AgentSession.updated_at.desc()).offset(
                (page - 1) * page_size
            ).limit(page_size)

            rows = await session.exec(stmt).all()
            items = []
            total = 0
            for s, total_count in rows:
                if total == 0:
                    total = total_count
                items.append({
                    "id": s.id,
                    "user_id": s.user_id,
                    "title": s.title,
                    "model": s.model,
                    "status": s.status,
                    "created_at": str(s.created_at) if s.created_at else None,
                    "updated_at": str(s.updated_at) if s.updated_at else None
                })

            return {
                "items": items,
                "total": total,
                "page": page,
                "page_size": page_size
            }

    @staticmethod
    async def create_session(
        user_id: int,
        title: str = None,
        model: str = "gpt-4o-mini"
    ) -> Dict[str, Any]:
        """创建会话"""
        async with get_session() as session:
            s = AgentSession(
                user_id=user_id,
                title=title or "新对话",
                model=model
            )
            session.add(s)
            await session.commit()
            await session.refresh(s)

            return {
                "id": s.id,
                "user_id": s.user_id,
                "title": s.title,
                "model": s.model,
                "status": s.status,
                "created_at": str(s.created_at) if s.created_at else None,
                "updated_at": str(s.updated_at) if s.updated_at else None
            }

    @staticmethod
    async def get_session(session_id: int, user_id: int) -> Dict[str, Any]:
        """获取会话"""
        async with get_session() as session:
            stmt = select(AgentSession).where(
                AgentSession.id == session_id,
                AgentSession.user_id == user_id,
                AgentSession.deleted_at == None
            )
            s = await session.exec(stmt).first()

            if not s:
                raise BusinessException(code=-1001, message="会话不存在或无权访问")

            return {
                "id": s.id,
                "user_id": s.user_id,
                "title": s.title,
                "model": s.model,
                "status": s.status,
                "created_at": str(s.created_at) if s.created_at else None,
                "updated_at": str(s.updated_at) if s.updated_at else None
            }

    @staticmethod
    async def delete_session(session_id: int, user_id: int, hard_delete: bool = False):
        """删除会话

        Args:
            session_id: 会话ID
            user_id: 当前用户ID（防越权）
            hard_delete: True=硬删除（同时删除 messages）；False=软删除（仅置 deleted_at）

        ✅ 修复 P2-1: 硬删除时级联清理 messages（防存储膨胀）
        """
        async with get_session() as session:
            stmt = select(AgentSession).where(
                AgentSession.id == session_id,
                AgentSession.user_id == user_id
            )
            s = await session.exec(stmt).first()

            if not s:
                raise BusinessException(code=-1001, message="会话不存在或无权访问")

            if hard_delete:
                # ✅ 修复 P2-1: 级联删除消息（同一事务）
                from src.agent.models import AgentMessage
                msg_del_stmt = select(AgentMessage).where(
                    AgentMessage.session_id == session_id
                )
                messages = await session.exec(msg_del_stmt).all()
                for m in messages:
                    await session.delete(m)
                await session.delete(s)
            else:
                # 软删除
                s.deleted_at = datetime.now(UTC).replace(tzinfo=None)

            await session.commit()

    @staticmethod
    async def get_messages(session_id: int, user_id: int) -> List[Dict]:
        """获取会话消息"""
        async with get_session() as session:
            stmt = select(AgentSession).where(
                AgentSession.id == session_id,
                AgentSession.user_id == user_id,
                AgentSession.deleted_at == None
            )
            s = await session.exec(stmt).first()
            if not s:
                raise BusinessException(code=-1001, message="会话不存在或无权访问")

            msg_stmt = select(AgentMessage).where(
                AgentMessage.session_id == session_id
            ).order_by(AgentMessage.created_at)

            messages = await session.exec(msg_stmt).all()

            return [
                {
                    "id": m.id,
                    "session_id": m.session_id,
                    "role": m.role,
                    "content": m.content,
                    "tool_name": m.tool_name,
                    "created_at": str(m.created_at) if m.created_at else None
                }
                for m in messages
            ]