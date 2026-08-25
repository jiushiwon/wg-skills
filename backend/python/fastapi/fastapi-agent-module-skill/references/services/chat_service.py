# 对话服务
# 使用骨架的 BusinessException 处理异常

import json
import logging
from typing import Dict, Any, Optional
from fastapi import Request
from src.agent.graph.agent import run_agent, get_llm
from src.agent.memory.store import memory_store
from src.agent.tools.registry import ToolRegistry
from src.agent.models import AgentSession, AgentMessage
from src.agent.llm.base import Message
from src.agent.database import get_session  # 使用兼容层
from src.agent.audit import audit_logger
from sqlmodel import select
from app.exceptions import BusinessException

logger = logging.getLogger(__name__)

# 用户友好的错误提示（避免敏感信息泄露到客户端）
USER_FRIENDLY_ERROR = "对话处理失败，请稍后重试"
USER_FRIENDLY_STREAM_ERROR = "对话中断，请稍后重试"


class ChatService:
    """对话服务"""

    @staticmethod
    async def chat(
        message: str,
        session_id: int = None,
        user_id: int = None
    ) -> Dict[str, Any]:
        """同步对话（单事务保证一致性）"""
        try:
            # 获取或创建会话
            session = await ChatService._get_or_create_session(session_id, user_id)

            # 获取历史消息（带 user_id 二次校验，防跨用户访问）
            messages = await ChatService._get_session_messages(session.id, user_id)

            # 先调用 LLM（失败则不写任何消息）
            response = await run_agent(
                user_input=message,
                session_id=session.id,
                user_id=user_id,
                messages=messages
            )

            # ✅ 单事务保存用户消息 + 助手消息（保证要么都成功要么都不写）
            await ChatService._save_messages_atomic(
                session.id, [("user", message), ("assistant", response)]
            )

            return {
                "session_id": session.id,
                "message": response
            }
        except BusinessException:
            raise
        except Exception as e:
            # ✅ 修复 P0-S1：服务端记录完整异常，客户端只返回固定话术
            logger.exception(f"对话失败: user_id={user_id}, session_id={session_id}")
            audit_logger.log_chat_failure(user_id=user_id, session_id=session_id, error=str(e))
            raise BusinessException(code=-5001, message=USER_FRIENDLY_ERROR)

    @staticmethod
    async def stream_chat(
        message: str,
        session_id: int = None,
        user_id: int = None,
        request: Optional[Request] = None
    ):
        """流式对话（保证消息一致性 + 断连检测 + 异常脱敏）"""
        session = None
        user_msg_saved = False
        first_chunk_received = False
        response_content = ""

        try:
            # 获取或创建会话
            session = await ChatService._get_or_create_session(session_id, user_id)

            # 获取历史消息（带 user_id 二次校验）
            messages = await ChatService._get_session_messages(session.id, user_id)

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
            async for chunk in llm.stream_chat(llm_messages, tools=tools if tools else None):
                # ✅ 修复 P0-P4：客户端断连检测（避免 token 计费继续）
                if request is not None and await request.is_disconnected():
                    logger.info(f"客户端断连，终止流式响应: user_id={user_id}, session_id={session.id}")
                    break

                # 过滤非字符串 chunk
                if not isinstance(chunk, str):
                    continue

                # 第一个有效 chunk 到达时，才保存用户消息（保证一致性）
                if not first_chunk_received:
                    await ChatService._save_message(session.id, "user", message)
                    user_msg_saved = True
                    first_chunk_received = True

                response_content += chunk
                yield f"data: {json.dumps({'type': 'token', 'content': chunk}, ensure_ascii=False)}\n\n"

            # 保存助手消息
            if first_chunk_received and response_content:
                await ChatService._save_message(session.id, "assistant", response_content)

            yield f"data: {json.dumps({'type': 'done', 'content': ''})}\n\n"

        except Exception as e:
            # ✅ 修复 P0-S1：服务端记录完整异常，SSE 错误事件只返回固定话术
            logger.exception(f"流式对话失败: user_id={user_id}, session_id={session_id}")
            audit_logger.log_chat_failure(user_id=user_id, session_id=session_id, error=str(e))
            yield f"data: {json.dumps({'type': 'error', 'content': USER_FRIENDLY_STREAM_ERROR})}\n\n"

    @staticmethod
    async def _get_or_create_session(session_id: int, user_id: int):
        """获取或创建会话（过滤软删除的会话，防止复活）"""
        async with get_session() as session:
            if session_id:
                stmt = select(AgentSession).where(
                    AgentSession.id == session_id,
                    AgentSession.user_id == user_id,
                    AgentSession.deleted_at == None  # 过滤软删除
                )
                s = await session.exec(stmt).first()
                if s:
                    return s
                # session_id 不存在或已删除，创建新会话而非报错
                logger.info(f"会话 {session_id} 不存在或已删除，创建新会话")

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
    async def _get_session_messages(session_id: int, user_id: int) -> list:
        """获取会话历史消息（修复 P0-S5：加 user_id 校验防跨用户访问）"""
        async with get_session() as session:
            # ✅ 先校验会话归属（避免间接 Prompt Injection 通过跨用户会话注入）
            owner_stmt = select(AgentSession.id).where(
                AgentSession.id == session_id,
                AgentSession.user_id == user_id,
                AgentSession.deleted_at == None
            )
            owner = await session.exec(owner_stmt).first()
            if not owner:
                raise BusinessException(code=-1001, message="会话不存在或无权访问")

            # ✅ 单次查询：使用 JOIN 同时校验归属并获取消息
            stmt = select(AgentMessage).join(
                AgentSession,
                AgentMessage.session_id == AgentSession.id
            ).where(
                AgentMessage.session_id == session_id,
                AgentSession.user_id == user_id,
                AgentSession.deleted_at == None
            ).order_by(AgentMessage.created_at).limit(40)

            messages = await session.exec(stmt).all()
            return [{"role": m.role, "content": m.content} for m in messages]

    @staticmethod
    async def _save_message(session_id: int, role: str, content: str):
        """保存单条消息"""
        async with get_session() as session:
            msg = AgentMessage(
                session_id=session_id,
                role=role,
                content=content
            )
            session.add(msg)
            await session.commit()

    @staticmethod
    async def _save_messages_atomic(session_id: int, messages: list):
        """原子保存多条消息（修复 P0-P5：保证用户/助手消息事务一致）"""
        async with get_session() as session:
            for role, content in messages:
                msg = AgentMessage(
                    session_id=session_id,
                    role=role,
                    content=content
                )
                session.add(msg)
            # ✅ 单次 commit，保证两条消息要么都成功要么都失败
            await session.commit()