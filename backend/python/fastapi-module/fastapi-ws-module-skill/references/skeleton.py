"""
fastapi-ws-module-skill 完整模块代码模板

═══════════════════════════════════════════════════════════════════════
⚠️  本模块是 fastapi-init-skill 的子模块，必须在其生成的骨架上叠加。
═══════════════════════════════════════════════════════════════════════

复用 init-skill 的基础设施（不重复造轮子）：
  - 表前缀 {prefix}：默认 wg_（与 init-skill 一致）
  - 路由前缀 /api：与 init-skill 一致
  - 统一响应：handler 返回 dict，由 EnvelopeRoute 自动包装为 {code:0,message,data}
  - 业务异常：raise BusinessException(code, message) 由全局 handler 转信封
  - 鉴权：app.dependencies.get_current_user（init-skill 返回 dict 含 user_id）
  - JWT：app.utils.security.decode_access_token（payload["sub"] 为 user_id）
  - 数据库：app.database.Base + async_session_factory
  - 上传：app.routers.upload 提供的 /api/upload 接口

如项目未装 init-skill，请先执行 fastapi-init-skill 初始化。

使用方式：
1. 将 app/ws/ 目录复制到 init-skill 生成的 app/ 下
2. 在 app/main.py 注册 ws_router 与 chat_router
3. 执行 alembic upgrade head 建表
4. 重启服务即可使用
"""

# ============================================================
# app/ws/__init__.py
# ============================================================

# WebSocket 通信模块

# ============================================================
# app/ws/manager.py — WebSocket 连接管理器（多端登录）
# ============================================================

"""
WebSocket 连接管理器（多端登录）

- 每个用户允许多个连接（PC + 手机 + Web）
- 发送时广播到该用户的所有连接
- 任何连接断开不影响其他端
- 单机模式用内存 dict；多实例请改 Redis（见 heartbeat-guide.md）
"""

import asyncio
import json
from collections import defaultdict
from typing import Any

from fastapi import WebSocket


class WSManager:
    """WebSocket 连接管理器（单机 + 多端登录）"""

    def __init__(self):
        # user_id -> Set[WebSocket]
        self._connections: dict[int, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def connect(self, user_id: int, ws: WebSocket) -> None:
        """注册一个新连接（同一用户可多次调用）"""
        await ws.accept()
        async with self._lock:
            self._connections[user_id].add(ws)

    async def disconnect(self, user_id: int, ws: WebSocket) -> None:
        """断开单个连接"""
        async with self._lock:
            conns = self._connections.get(user_id)
            if conns and ws in conns:
                conns.discard(ws)
                if not conns:
                    self._connections.pop(user_id, None)
        # 关闭已 accept 的连接
        try:
            await ws.close()
        except Exception:
            pass

    async def force_disconnect_all(self, user_id: int, code: int = 1000, reason: str = "") -> int:
        """强制断开某用户的所有连接（心跳超时 / 踢人），返回断开数量"""
        async with self._lock:
            conns = list(self._connections.get(user_id, ()))
            self._connections.pop(user_id, None)
        for ws in conns:
            try:
                await ws.close(code=code, reason=reason)
            except Exception:
                pass
        return len(conns)

    def is_online(self, user_id: int) -> bool:
        """检查用户是否有任何在线连接"""
        return bool(self._connections.get(user_id))

    def online_devices(self, user_id: int) -> int:
        """返回用户的在线连接数（用于显示"3 台设备在线"）"""
        return len(self._connections.get(user_id, ()))

    async def send_to(self, user_id: int, data: dict[str, Any]) -> bool:
        """向指定用户的所有连接广播消息，返回是否有任一连接成功"""
        # 拷贝快照，避免 send 时持有锁
        conns = list(self._connections.get(user_id, ()))
        if not conns:
            return False

        async def _safe_send(ws: WebSocket) -> bool:
            try:
                await ws.send_json(data)
                return True
            except Exception:
                # 推送失败：清理该连接
                await self.disconnect(user_id, ws)
                return False

        results = await asyncio.gather(*[_safe_send(ws) for ws in conns])
        return any(results)

    @property
    def online_count(self) -> int:
        """当前在线用户数（去重后）"""
        return len(self._connections)


# 全局单例
manager = WSManager()


# ============================================================
# app/ws/heartbeat.py — 心跳保活（任何消息都算心跳）
# ============================================================

"""
心跳监控器

- 客户端每 30s 发 ping，服务端回 pong
- 任何客户端消息（chat/ack/read）也算心跳
- 60s 内无任何消息 → 断开该用户所有连接
"""

import asyncio
from datetime import datetime, timedelta


class HeartbeatMonitor:
    TIMEOUT = timedelta(seconds=60)          # 60s 无消息则断开
    CHECK_INTERVAL = 10                     # 每 10s 检查一次

    def __init__(self):
        self._last_active: dict[int, datetime] = {}
        self._task: asyncio.Task | None = None

    def record(self, user_id: int) -> None:
        """记录用户最后一次活动时间（ping 或任意业务消息）"""
        self._last_active[user_id] = datetime.utcnow()

    def remove(self, user_id: int) -> None:
        """用户断开时清理"""
        self._last_active.pop(user_id, None)

    async def start(self, ws_manager) -> None:
        self._task = asyncio.create_task(self._check_loop(ws_manager))

    async def _check_loop(self, ws_manager) -> None:
        while True:
            await asyncio.sleep(self.CHECK_INTERVAL)
            now = datetime.utcnow()
            expired = [
                uid for uid, last in self._last_active.items()
                if now - last > self.TIMEOUT
            ]
            for uid in expired:
                # 强制断开该用户所有连接
                await ws_manager.force_disconnect_all(uid, code=4002, reason="心跳超时")
                self.remove(uid)


heartbeat = HeartbeatMonitor()


# ============================================================
# app/ws/validators.py — 消息内容校验
# ============================================================

"""
消息校验器

- 文本：content 必填、1-2000 字符
- 图片：image_url 必填、长度 <= 500
- 语音：voice_url 必填、voice_duration 1-600 秒

返回 None 表示校验通过，返回 str 表示错误信息。
"""


def validate_message(
    msg_type: int,
    content: str,
    image_url: str = "",
    voice_url: str = "",
    voice_duration: int = 0,
) -> str | None:
    if msg_type not in (1, 2, 3):
        return f"不支持的消息类型: {msg_type}"

    if msg_type == 1:  # 文本
        if not content or not content.strip():
            return "文本消息内容不能为空"
        if len(content) > 2000:
            return "文本消息不能超过 2000 字符"

    elif msg_type == 2:  # 图片
        if not image_url:
            return "图片消息必须传 image_url"
        if len(image_url) > 500:
            return "image_url 过长"

    elif msg_type == 3:  # 语音
        if not voice_url:
            return "语音消息必须传 voice_url"
        if len(voice_url) > 500:
            return "voice_url 过长"
        if not isinstance(voice_duration, int) or voice_duration <= 0 or voice_duration > 600:
            return "语音时长必须在 1-600 秒之间"

    return None


def build_preview(msg_type: int, content: str, image_url: str = "", voice_url: str = "") -> str:
    """生成会话列表的预览文本"""
    if msg_type == 2:
        return "[图片]"
    if msg_type == 3:
        return f"[语音 {voice_url and ''}]" if voice_url else "[语音]"
    text = content or ""
    if len(text) > 50:
        return text[:50] + "..."
    return text


# ============================================================
# app/ws/friend.py — 好友关系校验
# ============================================================

"""
好友关系校验

仅允许"已通过"好友互相发送消息，避免陌生人骚扰。

依赖 wg_user_friend 表（双向记录：uid 加 friend_id、friend_id 加 uid）。
未通过好友请走 auth-module-skill 的好友申请流程。
"""

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.models.friend import UserFriend


async def ensure_friend(db: AsyncSession, uid: int, peer_id: int) -> tuple[bool, str]:
    """
    校验两人是否为已通过好友关系。

    返回 (True, "") 表示通过；(False, reason) 表示拒绝。

    依赖表：{prefix}_user_friend
    - status=1 已通过；0 待通过；2 拉黑
    - 双向记录：A 加 B 为好友 → 同时写 (uid=A, friend_id=B) 与 (uid=B, friend_id=A)
    """
    if uid == peer_id:
        return False, "不能给自己发送消息"
    if uid <= 0 or peer_id <= 0:
        return False, "用户 ID 无效"

    # 查询任一方向的好友记录（status=1 已通过）
    result = await db.execute(
        select(UserFriend.id)
        .where(
            or_(
                and_(UserFriend.uid == uid, UserFriend.friend_id == peer_id),
                and_(UserFriend.uid == peer_id, UserFriend.friend_id == uid),
            ),
            UserFriend.status == 1,
        )
        .limit(1)
    )
    if not result.scalar_one_or_none():
        return False, "仅已通过的好友可以聊天"
    return True, ""


def get_uid(user) -> int:
    """
    从 get_current_user 的返回值中取 user_id。

    fastapi-init-skill 的 get_current_user 返回 dict: {"user_id": int, "username": str}
    fastapi-auth-module-skill 可能直接返回 User ORM 对象（有 .id 属性）
    本 helper 同时兼容两种形态。
    """
    if isinstance(user, dict):
        return int(user["user_id"])
    return int(user.id)


# ============================================================
# app/ws/handler.py — 消息路由与处理
# ============================================================

"""
消息处理器

职责：
- 解析客户端发来的 WebSocket 消息
- 路由到对应的处理函数
- 落库 + 实时推送 + 离线入库
- 幂等：相同 client_msg_id 不重复入库

调用约定：
- 返回 dict 表示要回给发送方的消息（如 ack、error、pong）
- 返回 None 表示不回（业务已通过 push 通道发完）
"""

from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.friend import ensure_friend
from app.ws.manager import manager
from app.ws.models.conversation import ChatConversation
from app.ws.models.message import ChatMessage
from app.ws.validators import build_preview, validate_message


async def handle_message(sender_id: int, data: dict, db: AsyncSession) -> dict | None:
    msg_type = data.get("type")

    if msg_type == "ping":
        return {"type": "pong"}

    if msg_type == "chat":
        return await _handle_chat(sender_id, data, db)

    if msg_type == "ack":
        return await _handle_ack(sender_id, data, db)

    if msg_type == "read":
        return await _handle_read(sender_id, data, db)

    return {"type": "error", "code": -1001, "message": f"未知消息类型: {msg_type}"}


async def _handle_chat(sender_id: int, data: dict, db: AsyncSession) -> dict | None:
    """处理聊天消息（含好友校验 + 幂等 + 字段校验 + 落库 + 推送）"""
    receiver_id = data.get("to")
    content = (data.get("content") or "").strip()
    msg_type = int(data.get("msg_type", 1))
    image_url = data.get("image_url", "")
    voice_url = data.get("voice_url", "")
    voice_duration = int(data.get("voice_duration", 0))
    client_msg_id = data.get("client_msg_id", "")

    # 1. 必填校验
    if not isinstance(receiver_id, int) or receiver_id <= 0:
        return {"type": "error", "code": -1001, "message": "to 必填且为正整数"}
    if not client_msg_id or len(client_msg_id) < 8 or len(client_msg_id) > 64:
        return {"type": "error", "code": -1001, "message": "client_msg_id 必填，长度 8-64"}

    # 2. 自我消息拦截
    if sender_id == receiver_id:
        return {"type": "error", "code": -1001, "message": "不能给自己发送消息"}

    # 3. 幂等：相同 client_msg_id 直接返回上次结果
    existing = await db.execute(
        select(ChatMessage).where(ChatMessage.client_msg_id == client_msg_id).limit(1)
    )
    if dup := existing.scalar_one_or_none():
        return {
            "type": "ack",
            "msg_id": dup.id,
            "status": dup.status,
            "client_msg_id": client_msg_id,
            "duplicate": True,
        }

    # 4. 好友校验
    ok, reason = await ensure_friend(db, sender_id, receiver_id)
    if not ok:
        return {"type": "error", "code": -1003, "message": reason}

    # 5. 内容校验
    err = validate_message(msg_type, content, image_url, voice_url, voice_duration)
    if err:
        return {"type": "error", "code": -1001, "message": err}

    # 6. 落库
    msg = ChatMessage(
        sender_id=sender_id,
        receiver_id=receiver_id,
        msg_type=msg_type,
        content=content,
        image_url=image_url,
        voice_url=voice_url,
        voice_duration=voice_duration,
        client_msg_id=client_msg_id,
        status=0,
    )
    db.add(msg)
    await db.flush()  # 拿 msg.id

    preview = build_preview(msg_type, content, image_url, voice_url)

    # 7. 更新发送方会话（不增未读）
    await _upsert_conversation(
        db, sender_id, receiver_id, msg.id, preview, msg_type, increment_unread=False
    )
    # 8. 更新接收方会话（增未读）
    await _upsert_conversation(
        db, receiver_id, sender_id, msg.id, preview, msg_type, increment_unread=True
    )
    await db.commit()

    # 9. 推送给接收方（多端）
    push_msg = {
        "type": "chat",
        "from": sender_id,
        "content": content,
        "image_url": image_url,
        "voice_url": voice_url,
        "voice_duration": voice_duration,
        "msg_id": msg.id,
        "msg_type": msg_type,
        "client_msg_id": client_msg_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    delivered = await manager.send_to(receiver_id, push_msg)
    if delivered:
        msg.status = 1
        await db.commit()

    # 10. 回执给发送方
    return {
        "type": "ack",
        "msg_id": msg.id,
        "status": msg.status,
        "client_msg_id": client_msg_id,
    }


async def _handle_ack(sender_id: int, data: dict, db: AsyncSession) -> dict | None:
    """客户端确认收到消息 → 状态置为已读"""
    msg_id = data.get("msg_id")
    if not msg_id:
        return {"type": "error", "code": -1001, "message": "msg_id 必填"}
    await db.execute(
        update(ChatMessage)
        .where(ChatMessage.id == msg_id, ChatMessage.receiver_id == sender_id)
        .values(status=2)
    )
    await db.commit()
    return None


async def _handle_read(sender_id: int, data: dict, db: AsyncSession) -> dict | None:
    """WebSocket 版标记已读（对应 REST POST /api/chat/read）"""
    peer_id = data.get("peer_id", 0)
    if not isinstance(peer_id, int) or peer_id <= 0:
        return {"type": "error", "code": -1001, "message": "peer_id 必填"}

    ok, reason = await ensure_friend(db, sender_id, peer_id)
    if not ok:
        return {"type": "error", "code": -1003, "message": reason}

    await db.execute(
        update(ChatMessage)
        .where(
            ChatMessage.sender_id == peer_id,
            ChatMessage.receiver_id == sender_id,
            ChatMessage.status < 2,
        )
        .values(status=2)
    )
    await db.execute(
        update(ChatConversation)
        .where(
            ChatConversation.user_id == sender_id,
            ChatConversation.peer_id == peer_id,
            ChatConversation.peer_type == 1,
        )
        .values(unread_count=0)
    )
    await db.commit()

    # 通知对方：你发的消息我已读
    await manager.send_to(peer_id, {
        "type": "read",
        "from": sender_id,
        "peer_id": peer_id,
    })
    return None


async def _upsert_conversation(
    db: AsyncSession,
    user_id: int,
    peer_id: int,
    msg_id: int,
    preview: str,
    msg_type: int,
    increment_unread: bool,
) -> None:
    """创建或更新会话（含预览文本）"""
    result = await db.execute(
        select(ChatConversation).where(
            ChatConversation.user_id == user_id,
            ChatConversation.peer_id == peer_id,
            ChatConversation.peer_type == 1,
        )
    )
    conv = result.scalar_one_or_none()
    now = datetime.now(timezone.utc)

    if conv:
        conv.last_msg_id = msg_id
        conv.last_msg_at = now
        conv.last_message = preview
        conv.last_msg_type = msg_type
        conv.updated_at = now
        if increment_unread:
            conv.unread_count += 1
    else:
        db.add(ChatConversation(
            user_id=user_id,
            peer_id=peer_id,
            peer_type=1,
            last_msg_id=msg_id,
            last_msg_at=now,
            last_message=preview,
            last_msg_type=msg_type,
            unread_count=1 if increment_unread else 0,
        ))


# ============================================================
# app/ws/offline.py — 离线消息推送
# ============================================================

"""
离线消息推送

- 用户上线时推送 status=0 的未送达消息（最多 100 条）
- 超过 100 条通过 REST /api/chat/history 拉取
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.manager import manager
from app.ws.models.message import ChatMessage


OFFLINE_LIMIT = 100


async def push_offline_messages(user_id: int, db: AsyncSession) -> None:
    """推送离线消息（标记已送达）"""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.receiver_id == user_id, ChatMessage.status == 0)
        .order_by(ChatMessage.id.asc())
        .limit(OFFLINE_LIMIT)
    )
    messages = list(result.scalars().all())

    for msg in messages:
        push_msg = {
            "type": "offline",
            "from": msg.sender_id,
            "content": msg.content,
            "image_url": msg.image_url,
            "voice_url": msg.voice_url,
            "voice_duration": msg.voice_duration,
            "msg_id": msg.id,
            "msg_type": msg.msg_type,
            "client_msg_id": msg.client_msg_id,
            "timestamp": msg.created_at.isoformat(),
        }
        delivered = await manager.send_to(user_id, push_msg)
        if delivered:
            msg.status = 1

    if messages:
        await db.commit()


# ============================================================
# app/ws/models/message.py — 消息表模型
# ============================================================

from datetime import datetime

from sqlalchemy import BigInteger, SmallInteger, Text, String, Integer, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ChatMessage(Base):
    __tablename__ = "{prefix}_chat_message"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    sender_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True, comment="发送方用户 ID")
    receiver_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True, comment="接收方用户 ID")
    group_id: Mapped[int] = mapped_column(BigInteger, default=0, comment="群组 ID，0=单聊")
    msg_type: Mapped[int] = mapped_column(SmallInteger, default=1, comment="消息类型 1文本 2图片 3语音")
    content: Mapped[str] = mapped_column(Text, nullable=False, default="", comment="消息内容")
    image_url: Mapped[str] = mapped_column(String(500), default="", comment="图片 URL（msg_type=2 时使用）")
    voice_url: Mapped[str] = mapped_column(String(500), default="", comment="语音 URL（msg_type=3 时使用）")
    voice_duration: Mapped[int] = mapped_column(Integer, default=0, comment="语音时长 秒（msg_type=3 时使用）")
    client_msg_id: Mapped[str] = mapped_column(String(64), nullable=False, comment="客户端幂等键")
    status: Mapped[int] = mapped_column(SmallInteger, default=0, comment="状态 0未读 1已送达 2已读")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("client_msg_id", name="uq_msg_client_msg_id"),
    )


# ============================================================
# app/ws/models/conversation.py — 会话表模型
# ============================================================

from datetime import datetime

from sqlalchemy import BigInteger, SmallInteger, Integer, String, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ChatConversation(Base):
    __tablename__ = "{prefix}_chat_conversation"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True, comment="用户 ID")
    peer_id: Mapped[int] = mapped_column(BigInteger, nullable=False, comment="对方 ID")
    peer_type: Mapped[int] = mapped_column(SmallInteger, default=1, comment="对方类型 1用户 2群组")
    last_msg_id: Mapped[int | None] = mapped_column(BigInteger, default=None, comment="最后一条消息 ID")
    last_msg_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None, comment="最后消息时间")
    last_message: Mapped[str] = mapped_column(String(200), default="", comment="最后一条消息预览")
    last_msg_type: Mapped[int] = mapped_column(SmallInteger, default=0, comment="最后一条消息类型")
    unread_count: Mapped[int] = mapped_column(Integer, default=0, comment="未读数")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "peer_id", "peer_type", name="uq_conv_peer"),
    )


# ============================================================
# app/ws/models/friend.py — 好友关系表（新增）
# ============================================================

from datetime import datetime

from sqlalchemy import BigInteger, SmallInteger, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserFriend(Base):
    __tablename__ = "{prefix}_user_friend"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uid: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True, comment="用户 ID")
    friend_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True, comment="好友 ID")
    status: Mapped[int] = mapped_column(SmallInteger, default=0, comment="0待通过 1已通过 2拉黑")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("uid", "friend_id", name="uq_friend_pair"),
    )


# ============================================================
# app/ws/schemas/message.py — 消息 Schema
# ============================================================

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WSIncoming(BaseModel):
    """客户端发来的 WebSocket 消息"""
    type: str = Field(..., description="消息类型: chat / ping / ack / read")
    to: int | None = Field(None, description="接收方用户 ID（chat 时必填）")
    content: str | None = Field(None, max_length=2000, description="文本内容（msg_type=1 时必填）")
    msg_type: int = Field(default=1, ge=1, le=3, description="1文本 2图片 3语音")
    image_url: str | None = Field(None, max_length=500, description="图片 URL（msg_type=2 时必填）")
    voice_url: str | None = Field(None, max_length=500, description="语音 URL（msg_type=3 时必填）")
    voice_duration: int | None = Field(None, ge=1, le=600, description="语音时长 秒（msg_type=3 时必填）")
    client_msg_id: str | None = Field(None, min_length=8, max_length=64, description="客户端幂等键（chat 时必填）")
    msg_id: int | None = Field(None, description="消息 ID（ack 时必填）")
    peer_id: int | None = Field(None, description="对方 ID（read 时必填）")


class WSOutgoing(BaseModel):
    """服务端推送给客户端的消息"""
    type: str
    from_: int | None = Field(None, alias="from")
    content: str | None = None
    image_url: str | None = None
    voice_url: str | None = None
    voice_duration: int | None = None
    msg_id: int | None = None
    msg_type: int | None = None
    client_msg_id: str | None = None
    timestamp: str | None = None
    code: int | None = None
    message: str | None = None
    duplicate: bool | None = None

    model_config = ConfigDict(populate_by_name=True)


class MessageOut(BaseModel):
    """REST 接口返回的消息"""
    id: int
    sender_id: int
    receiver_id: int
    msg_type: int
    content: str
    image_url: str
    voice_url: str
    voice_duration: int
    client_msg_id: str
    status: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SendMessageRequest(BaseModel):
    """REST 备用发消息请求体（给 Webhook / 管理后台 / 客服系统用）

    正常用户请走 WebSocket /api/ws，仅在无法维持长连接时使用本接口。
    """
    receiver_id: int = Field(..., gt=0, description="接收方用户 ID（必须是你好友）")
    client_msg_id: str = Field(..., min_length=8, max_length=64, description="幂等键，8-64 字符")
    msg_type: int = Field(default=1, ge=1, le=3, description="1文本 2图片 3语音")
    content: str = Field(default="", max_length=2000, description="文本内容（msg_type=1 时必填）")
    image_url: str = Field(default="", max_length=500, description="图片 URL（msg_type=2 时必填）")
    voice_url: str = Field(default="", max_length=500, description="语音 URL（msg_type=3 时必填）")
    voice_duration: int = Field(default=0, ge=0, le=600, description="语音时长（秒，msg_type=3 时必填且 1-600）")


# ============================================================
# app/ws/schemas/conversation.py — 会话 Schema
# ============================================================

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ConversationOut(BaseModel):
    """会话列表出参"""
    id: int
    peer_id: int
    peer_type: int
    last_msg_id: int | None
    last_msg_at: datetime | None
    last_message: str
    last_msg_type: int
    unread_count: int

    model_config = ConfigDict(from_attributes=True)


class MarkReadRequest(BaseModel):
    """标记已读请求体"""
    peer_id: int = Field(..., gt=0, description="对方用户 ID")


class PeerUserInfo(BaseModel):
    """会话中对方用户的简要信息（昵称/头像）"""
    user_id: int
    nickname: str = ""
    avatar: str = ""


class ConversationWithPeerOut(BaseModel):
    """带 peer 用户信息的会话（前端无需再 JOIN）"""
    id: int
    peer: PeerUserInfo
    last_msg_id: int | None
    last_msg_at: datetime | None
    last_message: str
    last_msg_type: int
    unread_count: int


# ============================================================
# app/ws/services/message_service.py — 消息服务
# ============================================================

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.models.message import ChatMessage


async def get_history(
    db: AsyncSession,
    user_id: int,
    peer_id: int,
    cursor: int | None = None,
    page_size: int = 20,
) -> list[ChatMessage]:
    """获取聊天记录（cursor 翻页：id < cursor 取更早的）"""
    conditions = [
        or_(
            and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id == peer_id),
            and_(ChatMessage.sender_id == peer_id, ChatMessage.receiver_id == user_id),
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
    """获取所有未送达的消息（不限条数）"""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.receiver_id == user_id, ChatMessage.status == 0)
        .order_by(ChatMessage.id.asc())
    )
    return list(result.scalars().all())


# ============================================================
# app/ws/services/conversation_service.py — 会话服务
# ============================================================

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.models.conversation import ChatConversation


async def get_conversations(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[ChatConversation], int]:
    """获取会话列表（按 last_msg_at 倒序）"""
    count_result = await db.execute(
        select(func.count()).select_from(ChatConversation).where(
            ChatConversation.user_id == user_id
        )
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(ChatConversation)
        .where(ChatConversation.user_id == user_id)
        .order_by(ChatConversation.last_msg_at.desc().nulls_last())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(result.scalars().all()), total


async def get_total_unread(db: AsyncSession, user_id: int) -> int:
    """获取未读消息总数"""
    result = await db.execute(
        select(func.coalesce(func.sum(ChatConversation.unread_count), 0)).where(
            ChatConversation.user_id == user_id
        )
    )
    return result.scalar() or 0


async def mark_read(db: AsyncSession, user_id: int, peer_id: int) -> None:
    """标记与某人的会话已读（消息置 status=2 + 会话 unread_count=0）"""
    from app.ws.models.message import ChatMessage

    await db.execute(
        update(ChatMessage)
        .where(
            ChatMessage.sender_id == peer_id,
            ChatMessage.receiver_id == user_id,
            ChatMessage.status < 2,
        )
        .values(status=2)
    )
    await db.execute(
        update(ChatConversation)
        .where(
            ChatConversation.user_id == user_id,
            ChatConversation.peer_id == peer_id,
            ChatConversation.peer_type == 1,
        )
        .values(unread_count=0)
    )
    await db.commit()


# ============================================================
# app/ws/routers/ws.py — WebSocket 端点（token 走 query 参数）
# ============================================================

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.ws.handler import handle_message
from app.ws.heartbeat import heartbeat
from app.ws.manager import manager
from app.ws.offline import push_offline_messages

router = APIRouter()


def _verify_ws_token(token: str) -> int | None:
    """
    验证 WebSocket 连接的 token，返回 user_id 或 None。

    fastapi-init-skill 的 JWT payload 用 "sub" 存 user_id；
    早期项目可能用 "uid" 字段；本函数兼容两种。
    """
    from app.utils.security import decode_access_token  # noqa: PLC0415
    payload = decode_access_token(token)
    if not payload:
        return None
    sub = payload.get("sub") or payload.get("uid")
    return int(sub) if sub else None


@router.websocket("/api/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(default="", description="JWT access_token"),
):
    """
    WebSocket 长连接。

    连接方式：ws://host/api/ws?token=<jwt>
    推荐使用 query 参数而非 URL 路径参数：避免 token 被代理日志记录。
    """
    user_id = _verify_ws_token(token)
    if not user_id:
        await websocket.accept()
        await websocket.send_json({"type": "error", "code": -1002, "message": "未授权"})
        await websocket.close(code=4001, reason="未授权")
        return

    await manager.connect(user_id, websocket)
    heartbeat.record(user_id)

    # 通知客户端连接成功
    await websocket.send_json({"type": "connected", "user_id": user_id})

    # 推送离线消息（独立 DB 会话）
    from app.database import async_session_factory
    async with async_session_factory() as db:
        await push_offline_messages(user_id, db)

    try:
        while True:
            raw = await websocket.receive_json()
            # 任何客户端消息都算心跳
            heartbeat.record(user_id)

            from app.database import async_session_factory
            async with async_session_factory() as db:
                reply = await handle_message(user_id, raw, db)
                if reply:
                    await websocket.send_json(reply)

    except WebSocketDisconnect:
        await manager.disconnect(user_id, websocket)
        # 该用户还有其他端在线就不清理心跳
        if not manager.is_online(user_id):
            heartbeat.remove(user_id)
    except Exception:
        await manager.disconnect(user_id, websocket)
        if not manager.is_online(user_id):
            heartbeat.remove(user_id)


# ============================================================
# app/ws/routers/chat.py — REST 接口
# ============================================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

# init-skill 提供的基础设施
from app.dependencies import get_db, get_current_user
from app.exceptions import BusinessException
from app.ws.friend import ensure_friend, get_uid
from app.ws.schemas.conversation import ConversationOut, MarkReadRequest
from app.ws.schemas.message import MessageOut, SendMessageRequest
from app.ws.services.conversation_service import get_conversations, get_total_unread, mark_read
from app.ws.services.message_service import get_history

router = APIRouter()


@router.get("/api/chat/history")
async def chat_history(
    peer_id: int = Query(..., gt=0, description="对方用户 ID"),
    cursor: int = Query(None, description="翻页游标（消息 ID）"),
    page_size: int = Query(20, ge=1, le=100, description="每页条数"),
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """获取聊天记录（cursor 翻页）"""
    uid = get_uid(user)
    ok, reason = await ensure_friend(db, uid, peer_id)
    if not ok:
        raise BusinessException(-1003, reason)
    messages = await get_history(db, uid, peer_id, cursor, page_size)
    # handler 直接返回 dict，由 EnvelopeRoute 自动包装为 {code:0, message, data}
    return {
        "list": [MessageOut.model_validate(m) for m in messages],
        "has_more": len(messages) == page_size,
    }


@router.get("/api/chat/conversations")
async def conversation_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页条数"),
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """获取会话列表"""
    uid = get_uid(user)
    convs, total = await get_conversations(db, uid, page, page_size)
    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "list": [ConversationOut.model_validate(c) for c in convs],
    }


@router.get("/api/chat/unread")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """获取未读消息总数"""
    uid = get_uid(user)
    total = await get_total_unread(db, uid)
    return {"total": total}


@router.post("/api/chat/read")
async def mark_conversation_read(
    request: MarkReadRequest,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """标记与某人的会话已读（同时通过 WS 通知对方）"""
    uid = get_uid(user)
    ok, reason = await ensure_friend(db, uid, request.peer_id)
    if not ok:
        raise BusinessException(-1003, reason)
    await mark_read(db, uid, request.peer_id)

    # 通过 WS 通道实时通知对方
    from app.ws.manager import manager
    await manager.send_to(request.peer_id, {
        "type": "read",
        "from": uid,
        "peer_id": request.peer_id,
    })
    return None  # 返回 null data，由 EnvelopeRoute 包装


@router.post("/api/chat/messages")
async def send_message_rest(
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """
    REST 备用发消息接口（给 Webhook / 管理后台 / 客服系统用）。

    正常用户请走 WebSocket /api/ws，仅在无法维持长连接时使用本接口。
    """
    from app.ws.handler import _handle_chat  # noqa: PLC0415
    uid = get_uid(user)
    data = {
        "type": "chat",
        "to": request.receiver_id,
        "msg_type": request.msg_type,
        "content": request.content,
        "image_url": request.image_url,
        "voice_url": request.voice_url,
        "voice_duration": request.voice_duration,
        "client_msg_id": request.client_msg_id,
    }
    reply = await _handle_chat(uid, data, db)
    if reply.get("type") == "error":
        # 错误码转换：-1001/-1003 → BusinessException
        raise BusinessException(reply["code"], reply["message"])
    return reply


# ============================================================
# app/main.py — 路由注册（追加到 fastapi-init-skill 生成的 main.py 中）
# ============================================================

# init-skill 生成的 main.py 通常已有：
#   from app.routers import health, auth, users, sse, upload
#   app.include_router(health.router)
#   ...
#
# 在这些 include_router 之后追加：

# from app.ws.routers import ws as ws_router
# from app.ws.routers import chat as chat_router
# from app.ws.heartbeat import heartbeat
# from app.ws.manager import manager
# from contextlib import asynccontextmanager
#
# app.include_router(ws_router.router, tags=["WebSocket"])
# app.include_router(chat_router.router, tags=["聊天"])
#
# # 启动心跳监控（注入到 lifespan 的 startup 阶段）
# @app.on_event("startup")
# async def start_heartbeat():
#     await heartbeat.start(manager)

# ⚠️ 注意：handler 不要直接调用 api_response()，那是给 exception_handler 用的。
#    成功路径直接 return dict，让 EnvelopeRoute 包装；错误路径 raise BusinessException。


# ============================================================
# app/ws/schemas/friend.py — 好友表单/出参
# ============================================================

"""
好友相关的 Pydantic 模型。

如果项目已装 fastapi-auth-module-skill，可以删掉本文件，由 auth 模块替代。
如果只用本 skill 的聊天功能（没装 auth-module-skill），则用本文件提供的兜底接口。
"""

from datetime import datetime

from pydantic import BaseModel, Field


class FriendRequestCreate(BaseModel):
    """发起好友申请"""
    target_uid: int = Field(..., gt=0, description="对方用户 ID")
    remark: str = Field(default="", max_length=100, description="申请备注")


class FriendRequestReview(BaseModel):
    """通过 / 拒绝好友申请"""
    requester_uid: int = Field(..., gt=0, description="申请人用户 ID")
    accept: bool = Field(..., description="True=通过 False=拒绝")


class FriendOut(BaseModel):
    """好友信息"""
    friend_id: int
    nickname: str = ""
    avatar: str = ""
    status: int = Field(..., description="1=已通过 2=拉黑")
    created_at: datetime


class FriendListResponse(BaseModel):
    """好友列表（按最近消息时间倒序）"""
    total: int
    list: list[FriendOut]


class FriendRequestOut(BaseModel):
    """好友申请记录"""
    requester_uid: int
    requester_nickname: str = ""
    requester_avatar: str = ""
    remark: str = ""
    status: int = Field(..., description="0=待处理 1=已通过 2=已拒绝")
    created_at: datetime


class FriendRequestListResponse(BaseModel):
    """好友申请列表"""
    total: int
    list: list[FriendRequestOut]


class UserSearchResult(BaseModel):
    """用户搜索结果（用于"添加好友"页）"""
    user_id: int
    nickname: str = ""
    avatar: str = ""
    is_friend: bool = Field(default=False, description="是否已经是好友")
    is_requested: bool = Field(default=False, description="是否已发起申请")


# ============================================================
# app/ws/services/friend_service.py — 好友业务逻辑
# ============================================================

"""
好友关系服务（兜底实现）

如果项目装了 fastapi-auth-module-skill，推荐用它的服务（本文件可删）。
本服务实现：
  - 发起好友申请（写 status=0 记录，对方可通过 review 改为 1）
  - 通过/拒绝（review）
  - 删除好友（双向删）
  - 拉黑（status=2）
  - 好友列表 / 申请列表
  - 搜索用户（按昵称模糊匹配）

依赖表：{prefix}_user_friend（双向记录）
"""

from datetime import datetime, timezone

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import BusinessException
from app.ws.friend import get_uid
from app.ws.models.friend import UserFriend


async def create_friend_request(db: AsyncSession, requester_id: int, target_uid: int, remark: str = "") -> None:
    """发起好友申请"""
    if requester_id == target_uid:
        raise BusinessException(-1001, "不能加自己为好友")

    # 检查是否已经是好友
    existing = await db.execute(
        select(UserFriend.id).where(
            or_(
                and_(UserFriend.uid == requester_id, UserFriend.friend_id == target_uid),
                and_(UserFriend.uid == target_uid, UserFriend.friend_id == requester_id),
            ),
            UserFriend.status.in_((1, 2)),
        ).limit(1)
    )
    if existing.scalar_one_or_none():
        raise BusinessException(-1001, "你们已经是好友或已拉黑")

    # 检查反向是否已有"待处理"申请（A 申请 B，B 也申请 A → 自动通过）
    reverse = await db.execute(
        select(UserFriend).where(
            UserFriend.uid == target_uid,
            UserFriend.friend_id == requester_id,
            UserFriend.status == 0,
        )
    )
    rev = reverse.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if rev:
        # 反向已有待处理申请 → 自动互为好友（双向写 status=1）
        rev.status = 1
        rev.updated_at = now
        db.add(UserFriend(
            uid=requester_id,
            friend_id=target_uid,
            status=1,
            created_at=now,
            updated_at=now,
        ))
    else:
        # 写一条 status=0 的申请记录
        db.add(UserFriend(
            uid=requester_id,
            friend_id=target_uid,
            status=0,
            created_at=now,
            updated_at=now,
        ))
    await db.commit()


async def review_friend_request(db: AsyncSession, current_uid: int, requester_uid: int, accept: bool) -> None:
    """通过 / 拒绝好友申请"""
    result = await db.execute(
        select(UserFriend).where(
            UserFriend.uid == requester_uid,
            UserFriend.friend_id == current_uid,
            UserFriend.status == 0,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise BusinessException(-1001, "申请不存在或已处理")
    now = datetime.now(timezone.utc)
    if accept:
        record.status = 1
        record.updated_at = now
        # 双向写
        existing = await db.execute(
            select(UserFriend.id).where(
                UserFriend.uid == current_uid,
                UserFriend.friend_id == requester_uid,
            )
        )
        if not existing.scalar_one_or_none():
            db.add(UserFriend(
                uid=current_uid,
                friend_id=requester_uid,
                status=1,
                created_at=now,
                updated_at=now,
            ))
    else:
        record.status = 2  # 拒绝后置为"已拒绝"，避免重复打扰
        record.updated_at = now
    await db.commit()


async def delete_friend(db: AsyncSession, current_uid: int, friend_id: int) -> None:
    """删除好友（双向删）"""
    await db.execute(
        update(UserFriend).where(
            or_(
                and_(UserFriend.uid == current_uid, UserFriend.friend_id == friend_id),
                and_(UserFriend.uid == friend_id, UserFriend.friend_id == current_uid),
            )
        ).values(status=0, updated_at=datetime.now(timezone.utc))
    )
    await db.commit()


async def list_friends(db: AsyncSession, current_uid: int, page: int = 1, page_size: int = 50) -> tuple[list[dict], int]:
    """好友列表（已通过的）"""
    count_result = await db.execute(
        select(func.count()).select_from(UserFriend).where(
            UserFriend.uid == current_uid,
            UserFriend.status == 1,
        )
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(UserFriend).where(
            UserFriend.uid == current_uid,
            UserFriend.status == 1,
        ).order_by(UserFriend.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = [
        {
            "friend_id": f.friend_id,
            "status": f.status,
            "created_at": f.created_at,
        }
        for f in result.scalars().all()
    ]
    return items, total


async def list_pending_requests(db: AsyncSession, current_uid: int) -> list[dict]:
    """我收到的好友申请（别人加我，待我处理）"""
    result = await db.execute(
        select(UserFriend).where(
            UserFriend.friend_id == current_uid,
            UserFriend.status == 0,
        ).order_by(UserFriend.created_at.desc())
    )
    return [
        {
            "requester_uid": r.uid,
            "remark": "",
            "status": r.status,
            "created_at": r.created_at,
        }
        for r in result.scalars().all()
    ]


async def block_user(db: AsyncSession, current_uid: int, target_uid: int) -> None:
    """拉黑用户（双向写 status=2）"""
    now = datetime.now(timezone.utc)
    for uid, fid in ((current_uid, target_uid), (target_uid, current_uid)):
        existing = await db.execute(
            select(UserFriend).where(
                UserFriend.uid == uid,
                UserFriend.friend_id == fid,
            )
        )
        rec = existing.scalar_one_or_none()
        if rec:
            rec.status = 2
            rec.updated_at = now
        else:
            db.add(UserFriend(uid=uid, friend_id=fid, status=2, created_at=now, updated_at=now))
    await db.commit()


# ============================================================
# app/ws/routers/friend.py — 好友 REST 接口（兜底）
# ============================================================

"""
好友 REST 接口。

项目已装 fastapi-auth-module-skill 时，应使用其好友接口，本文件可删。
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.exceptions import BusinessException
from app.ws.friend import get_uid
from app.ws.schemas.friend import (
    FriendListResponse,
    FriendOut,
    FriendRequestCreate,
    FriendRequestListResponse,
    FriendRequestOut,
    FriendRequestReview,
)
from app.ws.services.friend_service import (
    block_user,
    create_friend_request,
    delete_friend,
    list_friends,
    list_pending_requests,
    review_friend_request,
)

router = APIRouter()


@router.post("/api/friend/request")
async def send_friend_request(
    request: FriendRequestCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """发起好友申请"""
    uid = get_uid(user)
    await create_friend_request(db, uid, request.target_uid, request.remark)
    return None


@router.post("/api/friend/review")
async def review_request(
    request: FriendRequestReview,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """通过 / 拒绝好友申请"""
    uid = get_uid(user)
    await review_friend_request(db, uid, request.requester_uid, request.accept)
    return None


@router.get("/api/friend/requests")
async def get_pending_requests(
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """我收到的好友申请列表"""
    uid = get_uid(user)
    items = await list_pending_requests(db, uid)
    return FriendRequestListResponse(
        total=len(items),
        list=[FriendRequestOut(**item) for item in items],
    ).model_dump()


@router.get("/api/friend/list")
async def get_friend_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """好友列表"""
    uid = get_uid(user)
    items, total = await list_friends(db, uid, page, page_size)
    return FriendListResponse(
        total=total,
        list=[FriendOut(**item) for item in items],
    ).model_dump()


@router.delete("/api/friend/{friend_id}")
async def remove_friend(
    friend_id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """删除好友"""
    uid = get_uid(user)
    if uid == friend_id:
        raise BusinessException(-1001, "不能删除自己")
    await delete_friend(db, uid, friend_id)
    return None


@router.post("/api/friend/{friend_id}/block")
async def block(
    friend_id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    """拉黑好友"""
    uid = get_uid(user)
    if uid == friend_id:
        raise BusinessException(-1001, "不能拉黑自己")
    await block_user(db, uid, friend_id)
    return None


# ============================================================
# 完整路由注册（在 main.py 中追加）
# ============================================================

# from app.ws.routers import ws as ws_router
# from app.ws.routers import chat as chat_router
# from app.ws.routers import friend as friend_router   # 可选
#
# app.include_router(ws_router.router, tags=["WebSocket"])
# app.include_router(chat_router.router, tags=["聊天"])
# app.include_router(friend_router.router, tags=["好友"])  # 可选