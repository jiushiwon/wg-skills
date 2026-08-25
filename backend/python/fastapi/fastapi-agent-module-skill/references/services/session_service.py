# 会话服务

from typing import List, Dict, Any
from src.agent.models import AgentSession, AgentMessage
from src.agent.schemas import SessionResponse, SessionListResponse
from database import get_session
from sqlmodel import select


class SessionService:
    """会话服务"""

    @staticmethod
    async def list_sessions(
        user_id: int,
        page: int = 1,
        page_size: int = 10
    ) -> SessionListResponse:
        """会话列表"""
        async with get_session() as session:
            stmt = select(AgentSession).where(
                AgentSession.user_id == user_id,
                AgentSession.deleted_at == None
            ).order_by(AgentSession.updated_at.desc())

            # 分页
            stmt = stmt.offset((page - 1) * page_size).limit(page_size)
            items = await session.exec(stmt).all()

            # 总数
            count_stmt = select(AgentSession).where(
                AgentSession.user_id == user_id,
                AgentSession.deleted_at == None
            )
            total = len(await session.exec(count_stmt).all())

            return SessionListResponse(
                items=[SessionResponse(
                    id=s.id,
                    user_id=s.user_id,
                    title=s.title,
                    model=s.model,
                    status=s.status,
                    created_at=str(s.created_at) if s.created_at else None
                ) for s in items],
                total=total,
                page=page,
                page_size=page_size
            )

    @staticmethod
    async def create_session(
        user_id: int,
        title: str = None,
        model: str = "gpt-4o-mini"
    ) -> SessionResponse:
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

            return SessionResponse(
                id=s.id,
                user_id=s.user_id,
                title=s.title,
                model=s.model,
                status=s.status,
                created_at=str(s.created_at) if s.created_at else None
            )

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
                return None

            return {
                "id": s.id,
                "user_id": s.user_id,
                "title": s.title,
                "model": s.model,
                "status": s.status,
                "created_at": str(s.created_at) if s.created_at else None
            }

    @staticmethod
    async def delete_session(session_id: int, user_id: int):
        """删除会话"""
        from datetime import datetime
        async with get_session() as session:
            stmt = select(AgentSession).where(
                AgentSession.id == session_id,
                AgentSession.user_id == user_id
            )
            s = await session.exec(stmt).first()

            if s:
                s.deleted_at = datetime.utcnow()
                await session.commit()

    @staticmethod
    async def get_messages(session_id: int, user_id: int) -> List[Dict]:
        """获取会话消息"""
        async with get_session() as session:
            # 验证会话归属
            stmt = select(AgentSession).where(
                AgentSession.id == session_id,
                AgentSession.user_id == user_id
            )
            s = await session.exec(stmt).first()
            if not s:
                return []

            # 获取消息
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
