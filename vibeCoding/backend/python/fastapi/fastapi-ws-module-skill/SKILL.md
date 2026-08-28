---
name: fastapi-ws-module-skill
description: FastAPI WebSocket 通信模块一键叠加技能。面向已使用 fastapi-init-skill 生成的项目，标准化落地 WebSocket 长连接、单聊消息、离线消息、未读数、会话管理。触发词："FastAPI WebSocket","WS 聊天","即时通信","IM 模块","聊天模块","ws 模块","添加 WebSocket","帮我加聊天功能","fastapi-ws-module"。
---

# FastAPI WebSocket Module Skill

为 FastAPI 项目**叠加**一套 WebSocket 即时通信能力，不是重新生成新项目。

## 定位

- 目标：在已有 `fastapi-init-skill` 骨架上，添加可运行的 WebSocket 通信模块。
- 不替代：不重复生成 `fastapi-init-skill` 已经提供的 JWT、统一响应、SQLModel 等基础设施。
- 不做腾讯 IM：自建轻量方案，适合小中规模，不依赖第三方 IM 服务。
- 输出：连接管理器、消息路由、消息存储、离线推送、会话管理、接口契约。

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
| 1 | **WebSocket 长连接** | `WS /api/ws/{token}`，JWT 鉴权，自动心跳保活 |
| 2 | **单聊消息** | 文本消息实时投递，在线直推，离线入库 |
| 3 | **离线消息** | 用户上线时自动推送未送达消息 |
| 4 | **未读数** | 单聊未读计数，支持清零 |
| 5 | **会话列表** | 最近会话排序，最后一条消息预览 |
| 6 | **聊天记录** | 基于 cursor 翻页的历史消息查询 |
| 7 | **消息状态** | 未读 → 已送达 → 已读 三态流转 |
| 8 | **接口契约** | 生成 `api-contract-ws.md`，与 frontend-request-skill 对齐 |

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
│   │   ├── manager.py          # WebSocket 连接管理器
│   │   ├── handler.py          # 消息路由与处理
│   │   ├── heartbeat.py        # 心跳保活
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── message.py      # wg_chat_message 消息表
│   │   │   └── conversation.py # wg_chat_conversation 会话表
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── message.py      # 消息入参/出参
│   │   │   └── conversation.py # 会话入参/出参
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── message_service.py    # 消息存储与查询
│   │   │   ├── conversation_service.py # 会话管理
│   │   │   └── offline_service.py    # 离线消息推送
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── ws.py           # WebSocket 端点
│   │       └── chat.py         # REST 接口（历史/会话/未读）
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
| WS | /api/ws/{token} | WebSocket 长连接 | URL 参数 token |

### REST 接口

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/chat/history | 聊天记录（cursor 翻页） | Bearer |
| GET | /api/chat/conversations | 会话列表 | Bearer |
| GET | /api/chat/unread | 未读消息总数 | Bearer |
| PUT | /api/chat/conversations/{peer_id}/read | 标记已读 | Bearer |

### WebSocket 消息协议

**客户端 → 服务端：**

```json
{
  "type": "chat",
  "to": 123,
  "content": "你好",
  "msg_type": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 消息类型：chat / ping / ack |
| to | integer | 是 | 接收方用户 ID |
| content | string | 是 | 消息内容 |
| msg_type | integer | 否 | 1 文本（默认），2 图片，3 文件 |

**服务端 → 客户端：**

```json
{
  "type": "chat",
  "from": 456,
  "content": "你好",
  "msg_id": 1001,
  "msg_type": 1,
  "timestamp": "2026-08-24T10:00:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | chat / offline / ack / pong / error |
| from | integer | 发送方用户 ID |
| content | string | 消息内容 |
| msg_id | integer | 消息 ID（用于 ack） |
| timestamp | string | ISO 8601 时间戳 |

## 表结构

### wg_chat_message — 聊天消息

```sql
CREATE TABLE wg_chat_message (
  id           BIGSERIAL PRIMARY KEY,
  sender_id    BIGINT NOT NULL,
  receiver_id  BIGINT NOT NULL,
  group_id     BIGINT NOT NULL DEFAULT 0,    -- 0=单聊
  msg_type     SMALLINT NOT NULL DEFAULT 1,  -- 1文本 2图片 3文件
  content      TEXT NOT NULL,
  status       SMALLINT NOT NULL DEFAULT 0,  -- 0未读 1已送达 2已读
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_conversation ON wg_chat_message(sender_id, receiver_id, created_at);
CREATE INDEX idx_msg_receiver_status ON wg_chat_message(receiver_id, status);
```

### wg_chat_conversation — 会话

```sql
CREATE TABLE wg_chat_conversation (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL,
  peer_id       BIGINT NOT NULL,
  peer_type     SMALLINT NOT NULL DEFAULT 1,  -- 1用户 2群组
  last_msg_id   BIGINT,
  last_msg_at   TIMESTAMPTZ,
  unread_count  INT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, peer_id, peer_type)
);
CREATE INDEX idx_conv_user ON wg_chat_conversation(user_id, last_msg_at DESC);
```

## 模块红线

1. **WebSocket 连接必须鉴权**：URL 参数中的 token 必须验证，无效/过期立即关闭（code 4001）。
2. **消息必须落库**：无论对方是否在线，消息先入库再投递，保证不丢失。
3. **心跳保活**：客户端每 30s 发 `{"type":"ping"}`，服务端回 `{"type":"pong"}`；超 60s 无心跳断开。
4. **离线消息上限**：单次最多推送 100 条离线消息，超过部分通过 REST 接口分页拉取。
5. **消息有序**：按 `id` 自增保证顺序，cursor 翻页用 `id < cursor`。
6. **连接管理器线程安全**：多 worker 时需 Redis 做连接注册，单机模式用内存 dict。
7. **不实现群聊**（v1）：先做单聊闭环，群聊作为后续迭代。
8. **不实现已读回执**（v1）：先做未读计数，已读回执作为后续迭代。
9. **不实现文件消息**（v1）：复用 fastapi-init-skill 的上传接口，消息中只存 URL。
10. **契约即事实**：接口字段/枚举/错误码以 `api-contract-ws.md` 为准。

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/skeleton.py` | 完整模块代码模板 |
| `references/ws-protocol.md` | WebSocket 消息协议详细规范 |
| `references/heartbeat-guide.md` | 心跳保活与断线重连方案 |

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract-ws.md` | WebSocket 协议 + REST 接口全量文档 |
| 接入指南 | `docs/ws-module-guide.md` | 表结构、连接流程、与 fastapi-init-skill 集成步骤 |

## 不做

- 不重复生成 FastAPI 基础骨架。
- 不实现群聊（v1 单聊闭环）。
- 不实现已读回执（v1 未读计数）。
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
