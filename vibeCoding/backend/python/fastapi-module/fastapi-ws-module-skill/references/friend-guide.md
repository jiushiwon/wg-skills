# 好友关系约束与集成指南

本模块强制要求**仅允许已通过好友互相发送消息**，避免陌生人骚扰与垃圾消息。

## 1. 为什么必须做好友校验

| 场景 | 无校验的后果 | 有校验的后果 |
|------|------------|------------|
| 任意用户给陌生人发消息 | 骚扰、广告、刷屏 | 拒绝（code -1003） |
| 自我消息 | UI 出现自己跟自己聊天 | 拒绝（code -1003） |
| 拉黑后还能收到 | 持续骚扰 | `status=2` 的好友记录已被过滤 |

## 2. 表结构

由 `app/ws/models/friend.py` 生成（或沿用 `fastapi-auth-module-skill` 已有的友表）：

```sql
CREATE TABLE {prefix}_user_friend (
  id          BIGSERIAL PRIMARY KEY,
  uid         BIGINT NOT NULL,           -- 用户 A
  friend_id   BIGINT NOT NULL,           -- 用户 B
  status      SMALLINT NOT NULL DEFAULT 0, -- 0待通过 1已通过 2拉黑
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (uid, friend_id)
);
CREATE INDEX idx_friend_uid ON {prefix}_user_friend(uid, status);
```

### 双向记录约定

A 加 B 为好友时，**写两条记录**：

```
A 加 B 为好友（status=1）：
  INSERT (uid=A, friend_id=B, status=1)
  INSERT (uid=B, friend_id=A, status=1)  ← 反向记录，B 的好友列表里也要有 A
```

只有双向记录都存在，`ensure_friend(A, B)` 与 `ensure_friend(B, A)` 才会同时通过。

> 拉黑同理：A 拉黑 B → 把 `(uid=A, friend_id=B)` 的 status 置 2 即可（保留 B 的记录，避免 A 出现在 B 的好友列表时不一致）。

## 3. 校验逻辑

代码位置：`app/ws/friend.py`

```python
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.ws.models.friend import UserFriend


async def ensure_friend(db: AsyncSession, uid: int, peer_id: int) -> tuple[bool, str]:
    """
    校验两人是否为已通过好友关系。
    返回 (True, "") 表示通过；(False, reason) 表示拒绝。
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
```

### 触发点

`ensure_friend` 在以下入口被调用：

| 入口 | 触发时机 | 拒绝时返回 |
|------|----------|-----------|
| WebSocket `chat` | `_handle_chat` 落库前 | `{"type": "error", "code": -1003, "message": "..."}` |
| WebSocket `read` | `_handle_read` 前 | 同上 |
| REST `/api/chat/history` | 查询前 | HTTP `code: -1003` |
| REST `/api/chat/read` | 标记前 | HTTP `code: -1003` |

## 4. 与 fastapi-auth-module-skill 的协作

| 流程 | 哪个 skill 负责 | 涉及表 |
|------|----------------|--------|
| 发起好友申请 | fastapi-auth-module-skill | `{prefix}_user_friend` (status=0) |
| 通过好友申请 | fastapi-auth-module-skill | `{prefix}_user_friend` (status=1) + 双向写 |
| 拉黑好友 | fastapi-auth-module-skill | `{prefix}_user_friend` (status=2) |
| 删除好友 | fastapi-auth-module-skill | DELETE `{prefix}_user_friend` 两条 |
| 校验好友关系 | **fastapi-ws-module-skill（本模块）** | SELECT `{prefix}_user_friend` |
| 发消息/读历史 | **fastapi-ws-module-skill（本模块）** | 依赖校验结果 |

> **本模块只读不写** `{prefix}_user_friend`。  
> 写入逻辑由 `fastapi-auth-module-skill` 的好友申请 API 负责，避免双向写不一致。

## 5. 没有好友系统时的降级

如果项目没有 `fastapi-auth-module-skill`，可以临时"全员可发"：

```python
# app/ws/friend.py —— 临时降级版
async def ensure_friend(db: AsyncSession, uid: int, peer_id: int) -> tuple[bool, str]:
    if uid == peer_id:
        return False, "不能给自己发送消息"
    return True, ""
```

> ⚠️ 此模式仅用于内部工具/演示，**生产环境必须用好友表**。

## 6. 未来扩展

- v2 计划加 `mute` 状态（status=3 单向免打扰）
- v2 计划加群聊（`peer_type=2` + `{prefix}_chat_group_member` 表）
- 多端登录时，好友关系无需变化（好友关系属于"账号级"而非"设备级"）