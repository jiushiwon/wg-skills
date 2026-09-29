# fastapi-ws-module-skill

FastAPI WebSocket 通信模块生成器。在 `fastapi-init-skill` 骨架上叠加即时通信能力。

## 功能

- WebSocket 长连接（JWT 鉴权 + 心跳保活 + 多端登录）
- 单聊消息：文本 / 图片 / 语音 实时投递
- 好友关系校验（仅已通过好友可互发消息）
- 消息幂等（`client_msg_id` 防重）
- 离线消息自动推送（最多 100 条）
- 未读计数与标记已读（含 WS 实时通知）
- 会话列表与聊天记录分页查询
- 消息三态流转：未读 → 已送达 → 已读

## 使用方式

前提：项目已由 `fastapi-init-skill` 生成。

自然语言触发：

```
帮我加 WebSocket 聊天模块
加一个即时通信模块
做一个 ws 单聊功能
帮我加聊天，先做单聊
```

## 生成前会问什么

| 问题 | 默认值 |
|------|--------|
| 包名 | 自动检测（如 app） |
| 表前缀 | wg |
| 是否需要群聊 | 否（v1 只做单聊） |

## 接口清单

### WebSocket

| 协议 | 路径 | 说明 |
|------|------|------|
| WS | `/api/ws?token=<jwt>` | 长连接端点（token 走 query 参数，避免被代理日志记录） |

### REST

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/chat/history | 聊天记录（cursor 翻页） |
| GET | /api/chat/conversations | 会话列表 |
| GET | /api/chat/unread | 未读总数 |
| POST | /api/chat/read | 标记已读，body `{ "peer_id": 123 }` |

### WebSocket 消息类型

| type | 方向 | 说明 |
|------|------|------|
| `chat` | C→S | 发送消息（必带 `client_msg_id` 幂等键） |
| `ping` / `pong` | C↔S | 心跳 |
| `ack` | C↔S | 消息确认 |
| `read` | C→S | 标记已读 |
| `connected` | S→C | 连接成功通知 |
| `offline` | S→C | 离线消息推送 |
| `error` | S→C | 错误（含 `code` 和 `message`） |

## 目录结构

```
fastapi-ws-module-skill/
├── SKILL.md                # 技能定义
├── README.md               # 本文件
└── references/
    ├── skeleton.py         # 完整模块代码模板（10 个文件）
    ├── ws-protocol.md      # WebSocket 消息协议规范
    ├── heartbeat-guide.md  # 心跳保活方案
    └── friend-guide.md     # 好友关系约束说明
```

## 表结构

| 表名 | 说明 |
|------|------|
| `{prefix}_chat_message` | 消息表（含 `image_url` / `voice_url` / `voice_duration` / `client_msg_id`） |
| `{prefix}_chat_conversation` | 会话表（含 `last_message` 预览） |
| `{prefix}_user_friend` | 好友关系表（双向记录） |

## 依赖

- `fastapi-init-skill`（骨架，必须）
- `fastapi-auth-module-skill`（可选，提供好友关系 UserFriend 表的写入逻辑）

## 与其他 SKILL 的关系

- 依赖 `fastapi-init-skill` 的 JWT、统一响应、SQLAlchemy async、文件上传接口
- 消息中的图片/语音 URL 复用 `fastapi-init-skill` 的上传接口
- 用户 ID 来自 `fastapi-auth-module-skill` 或骨架自带的 User 表
- 好友表 `{prefix}_user_friend` 通常由 `fastapi-auth-module-skill` 写入，本模块只读

## 兼容性说明

> **WS 端点变更（破坏性）**  
> v1.1 起路径从 `/api/ws/{token}` 改为 `/api/ws?token=<jwt>`（query 参数）。  
> 升级时同步修改客户端连接代码。

> **REST 端点变更（破坏性）**  
> `PUT /api/chat/conversations/{peer_id}/read` → `POST /api/chat/read`，请求体 `{ "peer_id": 123 }`。