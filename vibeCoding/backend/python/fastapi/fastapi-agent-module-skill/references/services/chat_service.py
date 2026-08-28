# 对话服务
# ✅ 修复 P0-S1: 异常脱敏（客户端只收固定话术）
# ✅ 修复 P0-S5: 历史消息 JOIN 校验归属
# ✅ 修复 P0-P4: SSE 断连检测
# ✅ 修复 P0-P5: chat() 单事务
# ✅ 修复 P1-S8: 从 settings.agent_memory_turns 读取 limit
# ✅ 修复 P1-P15: 同步对话加 asyncio.wait_for 总超时
# ✅ 修复 P1-P9: response_content 硬截断
# ✅ 修复 P1-U: 错误码标准化（error_code 枚举）

import asyncio
import json
import logging
from enum import IntEnum
from typing import Dict, Any, Optional
from fastapi import Request
from src.agent.graph.agent import run_agent, get_llm
from src.agent.tools.registry import ToolRegistry
from src.agent.models import AgentSession, AgentMessage
from src.agent.llm.base import Message
from src.agent.database import get_session
from src.agent.audit import audit_logger
from sqlmodel import select
from app.exceptions import BusinessException
from app.config import settings

logger = logging.getLogger(__name__)


# ✅ 修复 P1-U: 错误码标准化
class ChatErrorCode(IntEnum):
    SUCCESS = 0
    INVALID_PARAMS = -1
    SESSION_NOT_FOUND = -1001
    AUTH_FAILED = -1002
    RATE_LIMIT = -429
    LLM_FAILED = -5001
    TOOL_FAILED = -5002
    TIMEOUT = -5003
    INTERNAL = -5000


# 用户友好的错误提示（避免敏感信息泄露到客户端）
USER_FRIENDLY_ERROR = "对话处理失败，请稍后重试"
USER_FRIENDLY_STREAM_ERROR = "对话中断，请稍后重试"
USER_FRIENDLY_TIMEOUT = "对话超时，请稍后重试"

# ✅ 修复 P1-P15: 同步对话总超时（秒）
CHAT_TIMEOUT_SECONDS = 120

# ✅ 修复 P1-P9: 响应内容最大字符数（防止内存峰值）
MAX_RESPONSE_CHARS = 50000

# ✅ 修复 P1-S8: 从 settings 读取历史消息 limit
def _get_history_limit() -> int:
    """获取历史消息 limit，从配置读取"""
    try:
        return getattr(settings, "agent_memory_turns", 20) * 2
    except Exception:
        return 40


class ChatService:
    """对话服务"""

    @staticmethod
    async def chat(
        message: str,
        session_id: int = None,
        user_id: int = None
    ) -> Dict[str, Any]:
        """同步对话（单事务保证一致性 + 总超时保护）"""
        try:
            # ✅ 修复 P1-P15: 总超时保护（防止 worker 长时间被占用）
            return await asyncio.wait_for(
                ChatService._chat_inner(message, session_id, user_id),
                timeout=CHAT_TIMEOUT_SECONDS
            )
        except asyncio.TimeoutError:
            logger.error(f"对话超时: user_id={user_id}, session_id={session_id}")
            audit_logger.log_chat_failure(
                user_id=user_id, session_id=session_id,
                error=f"timeout after {CHAT_TIMEOUT_SECONDS}s"
            )
            raise BusinessException(code=ChatErrorCode.TIMEOUT, message=USER_FRIENDLY_TIMEOUT)
        except BusinessException:
            raise
        except Exception as e:
            # ✅ 修复 P0-S1：服务端记录完整异常，客户端只返回固定话术
            logger.exception(f"对话失败: user_id={user_id}, session_id={session_id}")
            audit_logger.log_chat_failure(user_id=user_id, session_id=session_id, error=str(e))
            raise BusinessException(code=ChatErrorCode.LLM_FAILED, message=USER_FRIENDLY_ERROR)

    @staticmethod
    async def _chat_inner(
        message: str,
        session_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """同步对话内部逻辑"""
        # 获取或创建会话
        session = await ChatService._get_or_create_session(session_id, user_id)

        # 获取历史消息（带 user_id 二次校验）
        messages = await ChatService._get_session_messages(session.id, user_id)

        # 先调用 LLM（失败则不写任何消息）
        response = await run_agent(
            user_input=message,
            session_id=session.id,
            user_id=user_id,
            messages=messages
        )

        # ✅ 修复 P1-P9: 硬截断
        if len(response) > MAX_RESPONSE_CHARS:
            response = response[:MAX_RESPONSE_CHARS] + "..."

        # ✅ 单事务保存用户消息 + 助手消息
        await ChatService._save_messages_atomic(
            session.id, [("user", message), ("assistant", response)]
        )

        return {
            "session_id": session.id,
            "message": response
        }

    @staticmethod
    async def stream_chat(
        message: str,
        session_id: int = None,
        user_id: int = None,
        request: Optional[Request] = None
    ):
        """流式对话（保证消息一致性 + 断连检测 + 异常脱敏）"""
        first_chunk_received = False
        response_content = ""

        try:
            # 获取或创建会话
            session = await ChatService._get_or_create_session(session_id, user_id)

            # 获取历史消息
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
                # ✅ 修复 P0-P4：客户端断连检测
                if request is not None and await request.is_disconnected():
                    logger.info(f"客户端断连，终止流式响应: user_id={user_id}, session_id={session.id}")
                    break

                # 过滤非字符串 chunk
                if not isinstance(chunk, str):
                    logger.warning(f"收到非字符串 chunk: {type(chunk).__name__}")
                    continue

                # ✅ 修复 P1-P9: 响应内容硬截断
                if len(response_content) >= MAX_RESPONSE_CHARS:
                    logger.warning(f"响应内容超过 {MAX_RESPONSE_CHARS} 字符，强制截断")
                    break

                # 第一个有效 chunk 到达时，才保存用户消息（保证一致性）
                if not first_chunk_received:
                    await ChatService._save_message(session.id, "user", message)
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
            # ✅ 修复 P1-U: 错误事件包含 error_code
            yield f"data: {json.dumps({'type': 'error', 'content': USER_FRIENDLY_STREAM_ERROR, 'error_code': int(ChatErrorCode.LLM_FAILED)}, ensure_ascii=False)}\n\n"

    @staticmethod
    async def _get_or_create_session(session_id: int, user_id: int):
        """获取或创建会话（过滤软删除的会话，防止复活）"""
        async with get_session() as session:
            if session_id:
                stmt = select(AgentSession).where(
                    AgentSession.id == session_id,
                    AgentSession.user_id == user_id,
                    AgentSession.deleted_at == None
                )
                s = await session.exec(stmt).first()
                if s:
                    return s
                logger.info(f"会话 {session_id} 不存在或已删除，创建新会话")

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
        """获取会话历史消息（修复 P0-S5 + P1-S8）"""
        async with get_session() as session:
            # ✅ JOIN 同时校验归属 + 获取消息
            limit = _get_history_limit()
            stmt = select(AgentMessage).join(
                AgentSession,
                AgentMessage.session_id == AgentSession.id
            ).where(
                AgentMessage.session_id == session_id,
                AgentSession.user_id == user_id,
                AgentSession.deleted_at == None
            ).order_by(AgentMessage.created_at).limit(limit)

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
        """原子保存多条消息（修复 P0-P5）"""
        async with get_session() as session:
            for role, content in messages:
                msg = AgentMessage(
                    session_id=session_id,
                    role=role,
                    content=content
                )
                session.add(msg)
            await session.commit()