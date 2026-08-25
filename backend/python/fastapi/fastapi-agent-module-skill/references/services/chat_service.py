# 对话服务

import json
import logging
from typing import Dict, Any
from src.agent.graph.agent import run_agent, get_llm
from src.agent.memory.buffer import MemoryBuffer
from src.agent.memory.store import memory_store
from src.agent.tools.registry import ToolRegistry
from src.agent.models import AgentSession, AgentMessage
from src.agent.llm.base import Message
from database import get_session
from sqlmodel import select

logger = logging.getLogger(__name__)


class ChatService:
    """对话服务"""

    @staticmethod
    async def chat(
        message: str,
        session_id: int = None,
        user_id: int = None
    ) -> Dict[str, Any]:
        """同步对话"""
        try:
            # 获取或创建会话
            session = await ChatService._get_or_create_session(session_id, user_id)

            # 获取历史消息
            messages = await ChatService._get_session_messages(session.id)

            # 运行 Agent
            response = await run_agent(
                user_input=message,
                session_id=session.id,
                user_id=user_id,
                messages=messages
            )

            # 保存消息
            await ChatService._save_message(session.id, "user", message)
            await ChatService._save_message(session.id, "assistant", response)

            return {
                "session_id": session.id,
                "message": response
            }
        except Exception as e:
            logger.error(f"对话失败: {e}")
            return {
                "error": True,
                "message": f"对话处理失败: {str(e)}"
            }

    @staticmethod
    async def stream_chat(
        message: str,
        session_id: int = None,
        user_id: int = None
    ):
        """流式对话"""
        try:
            # 获取或创建会话
            session = await ChatService._get_or_create_session(session_id, user_id)

            # 获取历史消息
            messages = await ChatService._get_session_messages(session.id)

            # 保存用户消息
            await ChatService._save_message(session.id, "user", message)

            # 构建消息（含历史）
            llm_messages = [
                Message(role=m["role"], content=m["content"])
                for m in messages
            ]
            llm_messages.append(Message(role="user", content=message))

            # 获取 LLM 和 Tools
            llm = get_llm()
            tools = ToolRegistry.get_definitions()

            # 流式调用
            response_content = ""
            async for chunk in llm.stream_chat(llm_messages, tools=tools if tools else None):
                response_content += chunk
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

            # 保存助手消息
            await ChatService._save_message(session.id, "assistant", response_content)

            yield f"data: {json.dumps({'type': 'done', 'content': ''})}\n\n"

        except Exception as e:
            logger.error(f"流式对话失败: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    @staticmethod
    async def _get_or_create_session(session_id: int, user_id: int):
        """获取或创建会话"""
        async with get_session() as session:
            if session_id:
                stmt = select(AgentSession).where(
                    AgentSession.id == session_id,
                    AgentSession.user_id == user_id
                )
                s = await session.exec(stmt).first()
                if s:
                    return s

            # 创建新会话
            s = AgentSession(
                user_id=user_id,
                title="新对话",
                model="gpt-4o-mini"
            )
            session.add(s)
            await session.commit()
            await session.refresh(s)
            return s

    @staticmethod
    async def _get_session_messages(session_id: int) -> list:
        """获取会话历史消息"""
        async with get_session() as session:
            stmt = select(AgentMessage).where(
                AgentMessage.session_id == session_id
            ).order_by(AgentMessage.created_at).limit(40)

            messages = await session.exec(stmt).all()
            return [{"role": m.role, "content": m.content} for m in messages]

    @staticmethod
    async def _save_message(session_id: int, role: str, content: str):
        """保存消息"""
        async with get_session() as session:
            msg = AgentMessage(
                session_id=session_id,
                role=role,
                content=content
            )
            session.add(msg)
            await session.commit()
