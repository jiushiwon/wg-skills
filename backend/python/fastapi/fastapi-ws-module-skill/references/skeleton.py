"""
fastapi-ws-module-skill 完整模块代码模板

使用方式：
1. 将 app/ws/ 目录复制到项目中
2. 在 app/main.py 注册路由
3. 执行数据库迁移
"""

# ============================================================
# app/ws/__init__.py
# ============================================================

# WebSocket 通信模块

# ============================================================
# app/ws/manager.py — WebSocket 连接管理器
# ============================================================

"""
WebSocket 连接管理器

职责：
- 管理所有活跃的 WebSocket 连接
- 提供按用户 ID 发送消息的能力
- 线程安全（单机模式用 dict，多实例用 Redis）
"""

import json
import asyncio
from datetime import datetime
from fastapi import WebSocket


class WSManager:
    """WebSocket 连接管理器（单机模式）"""

    def __init__(self):
        self._connections: dict[int, WebSocket] = {}
        self._lock = asyncio.Lock()

    async def connect(self, user_id: int, ws: WebSocket) -> None:
        """注册连接"""
        await ws.accept()
        async with self._lock:
            # 如果已有连接，先断开旧的
            old = self._connections.get(user_id)
            if old:
                try:
                    await old.close(code=4000, reason="新连接替换")
                except Exception:
                    pass
            self._connections[user_id] = ws

    async def disconnect(self, user_id: int, code: int = 1000, reason: str = "") -> None:
        """断开连接"""
        async with self._lock:
            ws = self._connections.pop(user_id, None)
            if ws:
                try:
                    await ws.close(code=code, reason=reason)
                except Exception:
                    pass

    def is_online(self, user_id: int) -> bool:
        """检查用户是否在线"""
        return user_id in self._connections

    async def send_to(self, user_id: int, data: dict) -> bool:
        """向指定用户发送消息，返回是否成功"""
        ws = self._connections.get(user_id)
        if not ws:
            return False
        try:
            await ws.send_json(data)
            return True
        except Exception:
            await self.disconnect(user_id)
            return False

    @property
    def online_count(self) -> int:
        """当前在线人数"""
        return len(self._connections)


# 全局单例
manager = WSManager()


# ============================================================
# app/ws/heartbeat.py — 心跳保活
# ============================================================

"""
心跳监控器

- 客户端每 30s 发送 ping
- 服务端回 pong
- 60s 未收到 ping 则断开连接
"""

import asyncio
from datetime import datetime, timedelta


class HeartbeatMonitor:
    TIMEOUT = timedelta(seconds=60)
    CHECK_INTERVAL = 10

    def __init__(self):
        self._last_ping: dict[int, datetime] = {}
        self._task: asyncio.Task | None = None

    def record_ping(self, user_id: int) -> None:
        self._last_ping[user_id] = datetime.utcnow()

    def remove(self, user_id: int) -> None:
        self._last_ping.pop(user_id, None)

    async def start(self, ws_manager) -> None:
        self._task = asyncio.create_task(self._check_loop(ws_manager))

    async def _check_loop(self, ws_manager) -> None:
        while True:
            await asyncio.sleep(self.CHECK_INTERVAL)
            now = datetime.utcnow()
            expired = [
                uid for uid, last in self._last_ping.items()
                if now - last > self.TIMEOUT
            ]
            for uid in expired:
                await ws_manager.disconnect(uid, code=4002, reason="心跳超时")
                self.remove(uid)


heartbeat = HeartbeatMonitor()


# ============================================================
# app/ws/handler.py — 消息路由与处理
# ============================================================

"""
消息处理器

职责：
- 解析客户端发来的 WebSocket 消息
- 路由到对应的处理函数
- 管理消息存储与投递
"""

from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.manager import manager
from app.ws.models.message import ChatMessage
from app.ws.models.conversation import ChatConversation


async def handle_message(sender_id: int, data: dict, db: AsyncSession) -> dict | None:
    """
    处理客户端消息，返回要发给对方的消息（如果有）

    参数:
        sender_id: 发送方用户 ID
        data: 客户端发来的 JSON
        db: 数据库会话

    返回:
        要推送给接收方的消息 dict，或 None
    """
    msg_type = data.get("type")

    if msg_type == "ping":
        return {"type": "pong"}

    if msg_type == "chat":
        return await _handle_chat(sender_id, data, db)

    if msg_type == "ack":
        return await _handle_ack(sender_id, data, db)

    return {"type": "error", "code": -1001, "message": f"未知消息类型: {msg_type}"}


async def _handle_chat(sender_id: int, data: dict, db: AsyncSession) -> dict | None:
    """处理聊天消息"""
    receiver_id = data.get("to")
    content = data.get("content")
    msg_type = data.get("msg_type", 1)

    if not receiver_id or not content:
        return {"type": "error", "code": -1001, "message": "参数错误：to 和 content 必填"}

    if len(content) > 5000:
        return {"type": "error", "code": -1001, "message": "消息内容不能超过 5000 字符"}

    # 1. 存消息
    msg = ChatMessage(
        sender_id=sender_id,
        receiver_id=receiver_id,
        msg_type=msg_type,
        content=content,
        status=0
    )
    db.add(msg)
    await db.flush()

    # 2. 更新发送方会话
    await _upsert_conversation(db, sender_id, receiver_id, msg.id, increment_unread=False)

    # 3. 更新接收方会话
    await _upsert_conversation(db, receiver_id, sender_id, msg.id, increment_unread=True)

    await db.commit()

    # 4. 构造推送消息
    push_msg = {
        "type": "chat",
        "from": sender_id,
        "content": content,
        "msg_id": msg.id,
        "msg_type": msg_type,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # 5. 在线就推，不在线等上线拉
    delivered = await manager.send_to(receiver_id, push_msg)
    if delivered:
        msg.status = 1  # 已送达
        await db.commit()
        # 通知发送方：消息已送达
        await manager.send_to(sender_id, {
            "type": "ack",
            "msg_id": msg.id,
            "status": 1
        })

    return None  # 不需要返回给发送方（已通过 ack 通知）


async def _handle_ack(sender_id: int, data: dict, db: AsyncSession) -> dict | None:
    """处理客户端确认收到消息"""
    msg_id = data.get("msg_id")
    if not msg_id:
        return {"type": "error", "code": -1001, "message": "msg_id 必填"}

    # 更新消息状态为已读
    from sqlalchemy import update
    await db.execute(
        update(ChatMessage)
        .where(ChatMessage.id == msg_id, ChatMessage.receiver_id == sender_id)
        .values(status=2)
    )
    await db.commit()
    return None


async def _upsert_conversation(
    db: AsyncSession,
    user_id: int,
    peer_id: int,
    msg_id: int,
    increment_unread: bool
) -> None:
    """创建或更新会话"""
    from sqlalchemy import select
    from datetime import datetime, timezone

    result = await db.execute(
        select(ChatConversation).where(
            ChatConversation.user_id == user_id,
            ChatConversation.peer_id == peer_id,
            ChatConversation.peer_type == 1
        )
    )
    conv = result.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if conv:
        conv.last_msg_id = msg_id
        conv.last_msg_at = now
        conv.updated_at = now
        if increment_unread:
            conv.unread_count += 1
    else:
        conv = ChatConversation(
            user_id=user_id,
            peer_id=peer_id,
            peer_type=1,
            last_msg_id=msg_id,
            last_msg_at=now,
            unread_count=1 if increment_unread else 0
        )
        db.add(conv)


# ============================================================
# app/ws/offline.py — 离线消息推送
# ============================================================

"""
离线消息推送

用户上线时，查询未送达的消息并推送，最多 100 条。
超过 100 条的部分通过 REST 接口分页拉取。
"""

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.manager import manager
from app.ws.models.message import ChatMessage


OFFLINE_LIMIT = 100


async def push_offline_messages(user_id: int, db: AsyncSession) -> None:
    """推送离线消息"""
    result = await db.execute(
        select(ChatMessage)
        .where(
            ChatMessage.receiver_id == user_id,
            ChatMessage.status == 0
        )
        .order_by(ChatMessage.id.asc())
        .limit(OFFLINE_LIMIT)
    )
    messages = result.scalars().all()

    for msg in messages:
        push_msg = {
            "type": "offline",
            "from": msg.sender_id,
            "content": msg.content,
            "msg_id": msg.id,
            "msg_type": msg.msg_type,
            "timestamp": msg.created_at.isoformat()
        }
        delivered = await manager.send_to(user_id, push_msg)
        if delivered:
            msg.status = 1  # 标记已送达

    await db.commit()


# ============================================================
# app/ws/models/message.py — 消息表模型
# ============================================================

from datetime import datetime
from sqlalchemy import BigInteger, SmallInteger, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class ChatMessage(Base):
    __tablename__ = "{prefix}_chat_message"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    sender_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True,
                                            comment="发送方用户 ID")
    receiver_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True,
                                              comment="接收方用户 ID")
    group_id: Mapped[int] = mapped_column(BigInteger, default=0, comment="群组 ID，0=单聊")
    msg_type: Mapped[int] = mapped_column(SmallInteger, default=1,
                                           comment="消息类型 1文本 2图片 3文件")
    content: Mapped[str] = mapped_column(Text, nullable=False, comment="消息内容")
    status: Mapped[int] = mapped_column(SmallInteger, default=0,
                                         comment="状态 0未读 1已送达 2已读")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), comment="创建时间"
    )


# ============================================================
# app/ws/models/conversation.py — 会话表模型
# ============================================================

from datetime import datetime
from sqlalchemy import BigInteger, SmallInteger, Integer, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class ChatConversation(Base):
    __tablename__ = "{prefix}_chat_conversation"
    __table_args__ = (
        UniqueConstraint("user_id", "peer_id", "peer_type", name="uq_conv_peer"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True,
                                          comment="用户 ID")
    peer_id: Mapped[int] = mapped_column(BigInteger, nullable=False, comment="对方 ID")
    peer_type: Mapped[int] = mapped_column(SmallInteger, default=1,
                                            comment="对方类型 1用户 2群组")
    last_msg_id: Mapped[int | None] = mapped_column(BigInteger, default=None,
                                                      comment="最后一条消息 ID")
    last_msg_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None, comment="最后消息时间"
    )
    unread_count: Mapped[int] = mapped_column(Integer, default=0, comment="未读数")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ============================================================
# app/ws/schemas/message.py — 消息 Schema
# ============================================================

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class WSIncoming(BaseModel):
    """客户端发来的 WebSocket 消息"""
    type: str = Field(..., description="消息类型：chat / ping / ack")
    to: int | None = Field(None, description="接收方用户 ID（chat 时必填）")
    content: str | None = Field(None, max_length=5000, description="消息内容（chat 时必填）")
    msg_type: int = Field(default=1, ge=1, le=3, description="1文本 2图片 3文件")
    msg_id: int | None = Field(None, description="消息 ID（ack 时必填）")


class WSOutgoing(BaseModel):
    """服务端推送给客户端的消息"""
    type: str
    from_: int | None = Field(None, alias="from")
    content: str | None = None
    msg_id: int | None = None
    msg_type: int | None = None
    timestamp: str | None = None
    code: int | None = None
    message: str | None = None

    model_config = ConfigDict(populate_by_name=True)


class MessageOut(BaseModel):
    """REST 接口返回的消息"""
    id: int
    sender_id: int
    receiver_id: int
    msg_type: int
    content: str
    status: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# app/ws/schemas/conversation.py — 会话 Schema
# ============================================================

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ConversationOut(BaseModel):
    """会话列表出参"""
    id: int
    peer_id: int
    peer_type: int
    last_msg_id: int | None
    last_msg_at: datetime | None
    unread_count: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# app/ws/services/message_service.py — 消息服务
# ============================================================

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.models.message import ChatMessage


async def get_history(
    db: AsyncSession,
    user_id: int,
    peer_id: int,
    cursor: int | None = None,
    page_size: int = 20
) -> list[ChatMessage]:
    """获取聊天记录（cursor 翻页）"""
    conditions = [
        or_(
            and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id == peer_id),
            and_(ChatMessage.sender_id == peer_id, ChatMessage.receiver_id == user_id)
        )
    ]
    if cursor:
        conditions.append(ChatMessage.id < cursor)

    result = await db.execute(
        select(ChatMessage)
        .where(*conditions)
        .order_by(ChatMessage.id.desc())
        .limit(page_size)
    )
    return list(result.scalars().all())


async def get_undelivered(db: AsyncSession, user_id: int) -> list[ChatMessage]:
    """获取未送达的消息"""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.receiver_id == user_id, ChatMessage.status == 0)
        .order_by(ChatMessage.id.asc())
    )
    return list(result.scalars().all())


# ============================================================
# app/ws/services/conversation_service.py — 会话服务
# ============================================================

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.models.conversation import ChatConversation


async def get_conversations(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    page_size: int = 20
) -> tuple[list[ChatConversation], int]:
    """获取会话列表"""
    # 总数
    count_result = await db.execute(
        select(func.count()).select_from(ChatConversation).where(
            ChatConversation.user_id == user_id
        )
    )
    total = count_result.scalar() or 0

    # 列表
    result = await db.execute(
        select(ChatConversation)
        .where(ChatConversation.user_id == user_id)
        .order_by(ChatConversation.last_msg_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(result.scalars().all()), total


async def get_total_unread(db: AsyncSession, user_id: int) -> int:
    """获取未读消息总数"""
    result = await db.execute(
        select(func.coalesce(func.sum(ChatConversation.unread_count), 0))
        .where(ChatConversation.user_id == user_id)
    )
    return result.scalar() or 0


async def mark_read(db: AsyncSession, user_id: int, peer_id: int) -> None:
    """标记与某人的会话已读"""
    from sqlalchemy import update
    await db.execute(
        update(ChatConversation)
        .where(
            ChatConversation.user_id == user_id,
            ChatConversation.peer_id == peer_id,
            ChatConversation.peer_type == 1
        )
        .values(unread_count=0)
    )
    await db.commit()


# ============================================================
# app/ws/routers/ws.py — WebSocket 端点
# ============================================================

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.ws.manager import manager
from app.ws.heartbeat import heartbeat
from app.ws.handler import handle_message
from app.ws.offline import push_offline_messages

router = APIRouter()


def _verify_ws_token(token: str) -> int | None:
    """验证 WebSocket 连接的 token，返回 user_id 或 None"""
    from app.utils.security import decode_access_token
    payload = decode_access_token(token)
    if not payload:
        return None
    return int(payload.get("sub", 0)) or None


@router.websocket("/api/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    user_id = _verify_ws_token(token)
    if not user_id:
        await websocket.accept()
        await websocket.send_json({"type": "error", "code": -1002, "message": "未授权"})
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    heartbeat.record_ping(user_id)

    # 通知客户端连接成功
    await websocket.send_json({"type": "connected", "user_id": user_id})

    # 推送离线消息（需要独立的 DB 会话）
    from app.database import async_session_factory
    async with async_session_factory() as db:
        await push_offline_messages(user_id, db)

    try:
        while True:
            raw = await websocket.receive_json()
            heartbeat.record_ping(user_id)

            from app.database import async_session_factory
            async with async_session_factory() as db:
                reply = await handle_message(user_id, raw, db)
                if reply:
                    await websocket.send_json(reply)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        heartbeat.remove(user_id)
    except Exception:
        await manager.disconnect(user_id)
        heartbeat.remove(user_id)


# ============================================================
# app/ws/routers/chat.py — REST 接口
# ============================================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.response import api_response
from app.ws.services.message_service import get_history
from app.ws.services.conversation_service import (
    get_conversations, get_total_unread, mark_read
)
from app.ws.schemas.message import MessageOut
from app.ws.schemas.conversation import ConversationOut

router = APIRouter()


@router.get("/api/chat/history")
async def chat_history(
    peer_id: int = Query(..., description="对方用户 ID"),
    cursor: int = Query(None, description="翻页游标（消息 ID）"),
    page_size: int = Query(20, ge=1, le=100, description="每页条数"),
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """获取聊天记录（cursor 翻页）"""
    messages = await get_history(db, user.id, peer_id, cursor, page_size)
    return api_response(data={
        "list": [MessageOut.model_validate(m) for m in messages]
    })


@router.get("/api/chat/conversations")
async def conversation_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页条数"),
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """获取会话列表"""
    convs, total = await get_conversations(db, user.id, page, page_size)
    return api_response(data={
        "page": page,
        "pageSize": page_size,
        "total": total,
        "list": [ConversationOut.model_validate(c) for c in convs]
    })


@router.get("/api/chat/unread")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """获取未读消息总数"""
    total = await get_total_unread(db, user.id)
    return api_response(data={"total": total})


@router.put("/api/chat/conversations/{peer_id}/read")
async def mark_conversation_read(
    peer_id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """标记与某人的会话已读"""
    await mark_read(db, user.id, peer_id)
    return api_response(data=None)


# ============================================================
# app/main.py — 路由注册（追加到已有代码中）
# ============================================================

# 在现有路由注册之后添加：

# from app.ws.routers import ws as ws_router
# from app.ws.routers import chat as chat_router
# from app.ws.heartbeat import heartbeat
# from app.ws.manager import manager

# app.include_router(ws_router.router, tags=["WebSocket"])
# app.include_router(chat_router.router, tags=["聊天"])

# # 启动心跳监控
# @app.on_event("startup")
# async def start_heartbeat():
#     await heartbeat.start(manager)
