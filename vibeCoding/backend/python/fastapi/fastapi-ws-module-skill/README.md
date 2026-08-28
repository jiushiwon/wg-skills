# fastapi-ws-module-skill

FastAPI WebSocket 通信模块生成器。在 `fastapi-init-skill` 骨架上叠加即时通信能力。

## 功能

- WebSocket 长连接（JWT 鉴权 + 心跳保活）
- 单聊消息实时投递
- 离线消息自动推送
- 未读计数与标记已读
- 会话列表与聊天记录分页查询

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
| WS | /api/ws/{token} | 长连接端点 |

### REST

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/chat/history | 聊天记录 |
| GET | /api/chat/conversations | 会话列表 |
| GET | /api/chat/unread | 未读总数 |
| PUT | /api/chat/conversations/{peer_id}/read | 标记已读 |

## 目录结构

```
fastapi-ws-module-skill/
├── SKILL.md              # 技能定义
├── README.md             # 本文件
└── references/
    ├── skeleton.py       # 完整模块代码模板
    ├── ws-protocol.md    # WebSocket 消息协议规范
    └── heartbeat-guide.md # 心跳保活方案
```

## 依赖

- `fastapi-init-skill`（骨架，必须）
- `fastapi-auth-module-skill`（可选，用户系统）

## 与其他 SKILL 的关系

- 依赖 `fastapi-init-skill` 的 JWT、统一响应、数据库引擎
- 消息中的文件 URL 复用 `fastapi-init-skill` 的上传接口
- 用户 ID 来自 `fastapi-auth-module-skill` 或骨架自带的 User 表
