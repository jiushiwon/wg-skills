---
name: fastapi-ws-module-skill
description: FastAPI WebSocket 通信模块一键叠加技能。面向已使用 fastapi-init-skill 生成的项目，标准化落地 WebSocket 长连接（JWT 鉴权）、单聊消息（含文本/图片/语音）、好友关系校验、消息幂等、离线推送、未读数、会话管理、多端登录。触发词："FastAPI WebSocket","WS 聊天","即时通信","IM 模块","聊天模块","ws 模块","添加 WebSocket","帮我加聊天功能","fastapi-ws-module"。
---

# FastAPI WebSocket Module Skill

为 FastAPI 项目**叠加**一套 WebSocket 即时通信能力，不是重新生成新项目。

## 定位

- 目标：在已有 `fastapi-init-skill` 骨架上，添加可运行的 WebSocket 通信模块。
- 不替代：不重复生成 `fastapi-init-skill` 已经提供的 JWT、统一响应、SQLAlchemy async 等基础设施。
- 不做腾讯 IM：自建轻量方案，适合小中规模，不依赖第三方 IM 服务。
- 输出：连接管理器、消息路由、消息存储、离线推送、会话管理、好友校验、接口契约。

## 骨架依赖（子模块）

> 本模块是 `fastapi-init-skill` 的子模块，必须在骨架基础上使用。

**使用前必须满足以下条件：**

1. ✅ 已安装 `fastapi-init-skill`（项目骨架）
2. ✅ 骨架包含：JWT、统一响应、SQLAlchemy async、分页、目录结构
3. ✅ 遵循骨架的表前缀、字段命名、软删除规范

**检测逻辑：**
1. 读取用户项目根目录，检查是否包含 `fastapi-init-skill` 的标志性文件（`app/main.py`、`app/config.py`、`app/response.py`）
2. 检查 `app/dependencies.py` 是否已有 `get_current_user` 依赖
3. 如未检测到骨架，提示："本模块需要先安装 fastapi-init-skill 骨架"
4. 如用户拒绝安装骨架，则终止并提示无法使用

## 用户问题（最多 3 个）

```
1. 现有项目的包名是什么？（默认从 fastapi-init-skill 推断，如 app）
2. 表前缀是什么？（默认 wg）
3. 是否需要群聊？（默认不需要，先做单聊）
```

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **WebSocket 长连接** | `WS /api/ws?token=<jwt>`，query 参数鉴权，多端登录（PC/手机/Web 同时在线） |
| 2 | **单聊消息** | 文本/图片/语音实时投递，在线直推，离线入库 |
| 3 | **好友校验** | 仅允许已通过好友互发消息，避免陌生人骚扰 |
| 4 | **消息幂等** | 客户端传 `client_msg_id`，网络抖动重发不重复入库 |
| 5 | **离线消息** | 用户上线时自动推送未送达消息（最多 100 条） |
| 6 | **未读数** | 单聊未读计数，支持清零 + 实时通知对方 |
| 7 | **会话列表** | 最近会话排序，最后一条消息预览 |
| 8 | **聊天记录** | 基于 cursor 翻页的历史消息查询 |
| 9 | **消息状态** | 未读 → 已送达 → 已读 三态流转 |
| 10 | **接口契约** | 生成 `api-contract-ws.md`，与 frontend-request-skill 对齐 |

## 生成流程

1. 确认已存在 FastAPI 骨架（含 JWT、统一响应、分页）。
2. 询问用户包名、表前缀（默认 wg）、是否需要群聊。
3. 按 `references/skeleton.py` 生成 `ws/` 下全部源码：
   - 将所有 `{prefix}` 占位符替换为用户指定的表前缀（如 `wg_`）
   - 将 `app.ws` 替换为用户的包名（如 `app.ws`）
4. 生成 `api-contract-ws.md` 与 `docs/ws-module-guide.md`。
5. 在 `app/main.py` 注册 WebSocket 路由。
6. 提示用户：重启服务后可通过 WebSocket 客户端测试连接。

## 模块结构

```
{{PROJECT_NAME}}/
├── app/
│   ├── ws/
│   │   ├── __init__.py
│   │   ├── manager.py          # WebSocket 连接管理器（多端登录）
│   │   ├── heartbeat.py        # 心跳保活（任何消息都算心跳）
│   │   ├── handler.py          # 消息路由与处理（好友/幂等/校验/落库/推送）
│   │   ├── friend.py           # 好友关系校验
│   │   ├── validators.py       # 消息内容校验 + 预览生成
│   │   ├── offline.py          # 离线消息推送
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── message.py      # {prefix}_chat_message 消息表
│   │   │   ├── conversation.py # {prefix}_chat_conversation 会话表
│   │   │   └── friend.py       # {prefix}_user_friend 好友表
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── message.py      # 消息入参/出参（含 image_url/voice_url 等）
│   │   │   └── conversation.py # 会话入参/出参 + MarkReadRequest
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── message_service.py       # 消息存储与查询
│   │   │   └── conversation_service.py  # 会话管理
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── ws.py           # WebSocket 端点 /api/ws
│   │       ├── chat.py         # REST 接口（历史/会话/未读/已读/发消息）
│   │       └── friend.py       # 好友 REST 接口（可选，没装 auth-module-skill 时兜底）
├── alembic/
│   └── versions/
│       └── ws_module.py        # 迁移文件
├── api-contract-ws.md          # 接口契约
└── docs/
    └── ws-module-guide.md      # 接入指南
```

## 接口清单

### WebSocket 端点

| 协议 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| WS | `/api/ws?token=<jwt>` | WebSocket 长连接（token 走 query 参数，避免被代理日志记录） | URL 参数 token |

### REST 接口

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/chat/history | 聊天记录（cursor 翻页） | Bearer |
| GET | /api/chat/conversations | 会话列表 | Bearer |
| GET | /api/chat/unread | 未读消息总数 | Bearer |
| POST | /api/chat/read | 标记已读（body: `{ "peer_id": 123 }`） | Bearer |
| POST | /api/chat/messages | REST 备用发消息（给 Webhook / 客服系统） | Bearer |
| POST | /api/friend/request | 发起好友申请 | Bearer（可选） |
| POST | /api/friend/review | 通过 / 拒绝好友申请 | Bearer（可选） |
| GET | /api/friend/requests | 收到的好友申请列表 | Bearer（可选） |
| GET | /api/friend/list | 好友列表 | Bearer（可选） |
| DELETE | /api/friend/{friend_id} | 删除好友 | Bearer（可选） |
| POST | /api/friend/{friend_id}/block | 拉黑好友 | Bearer（可选） |

> 好友 REST 接口（`/api/friend/*`）是**可选**的。如果项目已装 `fastapi-auth-module-skill`，由它提供；本模块只提供兜底实现，让没装 auth-module-skill 的项目也能独立运行。

### WebSocket 消息协议

**客户端 → 服务端：**

```json
{
  "type": "chat",
  "to": 123,
  "msg_type": 1,
  "content": "你好",
  "client_msg_id": "cli-uuid-8-64-char"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 消息类型：chat / ping / ack / read |
| to | integer | 是（chat） | 接收方用户 ID |
| client_msg_id | string | 是（chat） | 客户端幂等键，8-64 字符 |
| msg_type | integer | 否 | 1 文本（默认），2 图片，3 语音 |
| content | string | 是（msg_type=1） | 文本内容，1-2000 字符 |
| image_url | string | 是（msg_type=2） | 图片 URL，由 fastapi-init-skill 上传接口产生 |
| voice_url | string | 是（msg_type=3） | 语音 URL |
| voice_duration | integer | 是（msg_type=3） | 语音时长（秒），1-600 |
| msg_id | integer | 是（ack） | 确认收到的消息 ID |
| peer_id | integer | 是（read） | 标记对方的已读 |

**服务端 → 客户端：**

```json
{
  "type": "chat",
  "from": 456,
  "msg_id": 1001,
  "msg_type": 1,
  "content": "你好",
  "client_msg_id": "cli-uuid-8-64-char",
  "timestamp": "2026-08-29T10:00:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | connected / chat / offline / ack / read / pong / error |
| from | integer | 发送方用户 ID |
| msg_id | integer | 消息 ID（用于 ack） |
| msg_type | integer | 1文本 2图片 3语音 |
| content / image_url / voice_url / voice_duration | 各类型对应字段 |  |
| client_msg_id | string | 原样回传，便于客户端去重 |
| timestamp | string | ISO 8601 时间戳 |

## 表结构

### {prefix}_chat_message — 聊天消息

```sql
CREATE TABLE {prefix}_chat_message (
  id              BIGSERIAL PRIMARY KEY,
  sender_id       BIGINT NOT NULL,
  receiver_id     BIGINT NOT NULL,
  group_id        BIGINT NOT NULL DEFAULT 0,    -- 0=单聊
  msg_type        SMALLINT NOT NULL DEFAULT 1,  -- 1文本 2图片 3语音
  content         TEXT NOT NULL DEFAULT '',
  image_url       VARCHAR(500) NOT NULL DEFAULT '',
  voice_url       VARCHAR(500) NOT NULL DEFAULT '',
  voice_duration  INT NOT NULL DEFAULT 0,
  client_msg_id   VARCHAR(64) NOT NULL,         -- 幂等键（全局唯一）
  status          SMALLINT NOT NULL DEFAULT 0,  -- 0未读 1已送达 2已读
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_msg_id)
);
CREATE INDEX idx_msg_conversation ON {prefix}_chat_message(sender_id, receiver_id, created_at);
CREATE INDEX idx_msg_receiver_status ON {prefix}_chat_message(receiver_id, status);
```

### {prefix}_chat_conversation — 会话

```sql
CREATE TABLE {prefix}_chat_conversation (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL,
  peer_id       BIGINT NOT NULL,
  peer_type     SMALLINT NOT NULL DEFAULT 1,  -- 1用户 2群组
  last_msg_id   BIGINT,
  last_msg_at   TIMESTAMPTZ,
  last_message  VARCHAR(200) NOT NULL DEFAULT '',  -- 预览（"[图片]"/"[语音]"/文本前 50 字）
  last_msg_type SMALLINT NOT NULL DEFAULT 0,
  unread_count  INT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, peer_id, peer_type)
);
CREATE INDEX idx_conv_user ON {prefix}_chat_conversation(user_id, last_msg_at DESC NULLS LAST);
```

### {prefix}_user_friend — 好友关系（必建）

```sql
CREATE TABLE {prefix}_user_friend (
  id          BIGSERIAL PRIMARY KEY,
  uid         BIGINT NOT NULL,
  friend_id   BIGINT NOT NULL,
  status      SMALLINT NOT NULL DEFAULT 0,  -- 0待通过 1已通过 2拉黑
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (uid, friend_id)
);
CREATE INDEX idx_friend_uid ON {prefix}_user_friend(uid, status);
```

> 好友表默认双向：A 加 B 为好友 → 写两条记录（A.uid=A, B.uid=B）。  
> 申请 / 通过 / 拉黑逻辑通常由 `fastapi-auth-module-skill` 提供，本模块只做查询。

## 模块红线

1. **WebSocket 连接必须鉴权**：query 参数中的 token 必须验证，无效/过期立即关闭（code 4001）。
2. **消息必须落库**：无论对方是否在线，消息先入库再投递，保证不丢失。
3. **好友关系是消息的前置条件**：仅 `status=1` 的好友可以互发消息（含 REST `/api/chat/history`），未通过/拉黑一律拒绝（code -1003）。
4. **消息必须带 `client_msg_id`**：8-64 字符，全局唯一；服务端按此去重，重发不二次入库。
5. **心跳保活**：客户端每 30s 发 `{"type":"ping"}`，服务端回 `{"type":"pong"}`；任何业务消息（chat/ack/read）也视作心跳；超 60s 无消息断开。
6. **离线消息上限**：单次最多推送 100 条离线消息，超过部分通过 REST `/api/chat/history` 分页拉取。
7. **消息有序**：按 `id` 自增保证顺序，cursor 翻页用 `id < cursor`。
8. **支持多端登录**：同一用户允许多个 WebSocket 连接（PC + 手机 + Web），消息广播到所有端；任何一端断开不影响其他端。
9. **token 不放 URL 路径**：用 `?token=` 而非 `/{token}`，避免被 Nginx/代理日志记录。
10. **契约即事实**：接口字段/枚举/错误码以 `api-contract-ws.md` 为准。

## 错误码

| code | 含义 | 触发场景 |
|------|------|----------|
| -1001 | 参数错误 | 消息格式不对、必填字段缺失、client_msg_id 不合规 |
| -1002 | 未授权 | token 无效或过期 |
| -1003 | 禁止访问 | 对方不是已通过好友、给自己发消息 |
| -1004 | 用户不存在 | 接收方不存在（可选，按需实现） |
| -2000 | 系统错误 | 服务端内部异常 |

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/skeleton.py` | 完整模块代码模板（含 manager/handler/friend/validators 等 10 个文件） |
| `references/ws-protocol.md` | WebSocket 消息协议详细规范 |
| `references/heartbeat-guide.md` | 心跳保活与断线重连方案 |
| `references/friend-guide.md` | 好友关系约束与集成方式 |

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract-ws.md` | WebSocket 协议 + REST 接口全量文档 |
| 接入指南 | `docs/ws-module-guide.md` | 表结构、连接流程、与 fastapi-init-skill 集成步骤 |

## 不做

- 不重复生成 FastAPI 基础骨架。
- 不实现群聊（v1 单聊闭环）。
- 不实现已读回执的 UI 提示（数据流已支持 `status=2` 与 WS 通知 `read`，但前端红点/角标由 frontend 自行实现）。
- 不依赖第三方 IM 服务（腾讯 IM、融云等）。
- 不做音视频通话。
- 不在 SKILL.md 锁定版本号。
- 不替用户提交 git。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
FastAPI WebSocket、WS 聊天、即时通信、IM 模块、聊天模块、ws 模块、
添加 WebSocket、帮我加聊天功能、fastapi-ws-module
```