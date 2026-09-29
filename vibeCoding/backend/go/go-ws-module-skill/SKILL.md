---
name: go-ws-module-skill
description: Go Gin WebSocket 通信模块一键叠加技能。面向已使用 go-gin-init-skill 生成的项目，标准化落地 WebSocket 长连接（JWT 鉴权）、单聊消息（含文本/图片/语音）、好友关系校验、消息幂等、离线推送、未读数、会话管理、多端登录。触发词："Go WebSocket","WS 聊天","即时通信","IM 模块","聊天模块","ws 模块","添加 WebSocket","帮我加聊天功能","go-ws-module"。
---

# Go Gin WebSocket Module Skill

为 Go Gin 项目**叠加**一套 WebSocket 即时通信能力，不是重新生成新项目。

## 定位

- 目标：在已有 `go-gin-init-skill` 骨架上，添加可运行的 WebSocket 通信模块。
- 不替代：不重复生成 `go-gin-init-skill` 已经提供的 JWT、统一响应、GORM 等基础设施。
- 不做腾讯 IM：自建轻量方案，适合小中规模，不依赖第三方 IM 服务。
- 输出：连接管理器、消息路由、消息存储、离线推送、会话管理、好友校验、接口契约。

## 骨架依赖（子模块）

> 本模块是 `go-gin-init-skill` 的子模块，必须在骨架基础上使用。

**使用前必须满足以下条件：**

1. ✅ 已安装 `go-gin-init-skill`（项目骨架）
2. ✅ 骨架包含：JWT、统一响应、GORM、分页、目录结构
3. ✅ 遵循骨架的表前缀、字段命名、软删除规范

**检测逻辑：**
1. 读取用户项目根目录，检查是否包含 `go-gin-init-skill` 的标志性文件（`main.go`、`config/config.go`、`middleware/auth.go`）
2. 检查是否已有 `getCurrentUser` 依赖
3. 如未检测到骨架，提示："本模块需要先安装 go-gin-init-skill 骨架"
4. 如用户拒绝安装骨架，则终止并提示无法使用

## 用户问题（最多 3 个）

```
1. 现有项目的包名是什么？（默认从 go-gin-init-skill 推断，如 main）
2. 表前缀是什么？（默认 wg）
3. 是否需要群聊？（默认不需要，先做单聊）
```

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **WebSocket 长连接** | `WS /api/ws?token=<jwt>`，query 参数鉴权，多端登录 |
| 2 | **单聊消息** | 文本/图片/语音实时投递，在线直推，离线入库 |
| 3 | **好友校验** | 仅允许已通过好友互发消息 |
| 4 | **消息幂等** | 客户端传 `client_msg_id`，网络抖动重发不重复入库 |
| 5 | **离线消息** | 用户上线时自动推送未送达消息（最多 100 条） |
| 6 | **未读数** | 单聊未读计数，支持清零 + 实时通知对方 |
| 7 | **会话列表** | 最近会话排序，最后一条消息预览 |
| 8 | **聊天记录** | 基于 cursor 翻页的历史消息查询 |
| 9 | **消息状态** | 未读 → 已送达 → 已读 三态流转 |
| 10 | **接口契约** | 生成 `api-contract-ws.md`，与前端对齐 |

## 生成流程

1. 确认已存在 Go Gin 骨架（含 JWT、统一响应、GORM）。
2. 询问用户包名、表前缀（默认 wg）、是否需要群聊。
3. 按 `references/skeleton.go` 生成 `ws/` 下全部源码：
   - 将所有 `{prefix}` 占位符替换为用户指定的表前缀（如 `wg_`）
   - 将 `ws` 替换为用户的包名
4. 生成 `api-contract-ws.md` 与 `docs/ws-module-guide.md`。
5. 在 `main.go` 注册 WebSocket 路由。
6. 提示用户：重启服务后可通过 WebSocket 客户端测试连接。

## 模块结构

```
{{PROJECT_NAME}}/
├── main.go                         # 注册 WebSocket 路由
├── config/
│   └── config.go                   # 配置
├── ws/
│   ├── manager.go                  # WebSocket 连接管理器（多端登录）
│   ├── handler.go                  # 消息路由与处理
│   ├── hub.go                      # 消息分发中心
│   ├── models/
│   │   ├── message.go              # 消息模型
│   │   ├── conversation.go         # 会话模型
│   │   └── friend.go               # 好友模型
│   ├── services/
│   │   ├── message_service.go      # 消息存储与查询
│   │   └── conversation_service.go # 会话管理
│   ├── routers/
│   │   ├── ws.go                   # WebSocket 端点
│   │   ├── chat.go                 # REST 接口
│   │   └── friend.go               # 好友接口
│   └── utils/
│       ├── validators.go           # 消息校验
│       └── helpers.go              # 工具函数
├── migrations/
│   └── ws_module.sql              # 数据库迁移
├── api-contract-ws.md              # 接口契约
└── docs/
    └── ws-module-guide.md          # 接入指南
```

## 接口清单

### WebSocket 端点

| 协议 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| WS | `/api/ws?token=<jwt>` | WebSocket 长连接 | URL 参数 token |

### REST 接口

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/chat/history | 聊天记录（cursor 翻页） | Bearer |
| GET | /api/chat/conversations | 会话列表 | Bearer |
| GET | /api/chat/unread | 未读消息总数 | Bearer |
| POST | /api/chat/read | 标记已读 | Bearer |
| POST | /api/chat/messages | REST 发消息 | Bearer |
| POST | /api/friend/request | 发起好友申请 | Bearer |
| POST | /api/friend/review | 通过/拒绝好友申请 | Bearer |
| GET | /api/friend/list | 好友列表 | Bearer |
| DELETE | /api/friend/:friend_id | 删除好友 | Bearer |

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
| to | int64 | 是（chat） | 接收方用户 ID |
| client_msg_id | string | 是（chat） | 客户端幂等键，8-64 字符 |
| msg_type | int | 否 | 1 文本（默认），2 图片，3 语音 |
| content | string | 是（msg_type=1） | 文本内容 |
| image_url | string | 是（msg_type=2） | 图片 URL |
| voice_url | string | 是（msg_type=3） | 语音 URL |
| voice_duration | int | 是（msg_type=3） | 语音时长（秒） |

**服务端 → 客户端：**

```json
{
  "type": "chat",
  "from": 456,
  "msg_id": 1001,
  "msg_type": 1,
  "content": "你好",
  "client_msg_id": "cli-uuid-8-64-char",
  "timestamp": "2026-09-09T10:00:00Z"
}
```

## 表结构

### {prefix}_chat_message — 聊天消息

```sql
CREATE TABLE {prefix}_chat_message (
  id              BIGSERIAL PRIMARY KEY,
  sender_id       BIGINT NOT NULL,
  receiver_id     BIGINT NOT NULL,
  group_id        BIGINT NOT NULL DEFAULT 0,
  msg_type        SMALLINT NOT NULL DEFAULT 1,
  content         TEXT NOT NULL DEFAULT '',
  image_url       VARCHAR(500) NOT NULL DEFAULT '',
  voice_url       VARCHAR(500) NOT NULL DEFAULT '',
  voice_duration  INT NOT NULL DEFAULT 0,
  client_msg_id   VARCHAR(64) NOT NULL,
  status          SMALLINT NOT NULL DEFAULT 0,
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
  peer_type     SMALLINT NOT NULL DEFAULT 1,
  last_msg_id   BIGINT,
  last_msg_at   TIMESTAMPTZ,
  last_message  VARCHAR(200) NOT NULL DEFAULT '',
  last_msg_type SMALLINT NOT NULL DEFAULT 0,
  unread_count  INT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, peer_id, peer_type)
);

CREATE INDEX idx_conv_user ON {prefix}_chat_conversation(user_id, last_msg_at DESC NULLS LAST);
```

### {prefix}_user_friend — 好友关系

```sql
CREATE TABLE {prefix}_user_friend (
  id          BIGSERIAL PRIMARY KEY,
  uid         BIGINT NOT NULL,
  friend_id   BIGINT NOT NULL,
  status      SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (uid, friend_id)
);

CREATE INDEX idx_friend_uid ON {prefix}_user_friend(uid, status);
```

## 核心代码实现

### WebSocket 管理器

```go
// ws/hub.go
type Hub struct {
    clients    map[int64]map[*Client]bool  // userID -> clients
    register   chan *Client
    unregister chan *Client
    broadcast  chan *Message
    mutex      sync.RWMutex
}

func NewHub() *Hub {
    return &Hub{
        clients:    make(map[int64]map[*Client]bool),
        register:   make(chan *Client),
        unregister: make(chan *Client),
        broadcast:  make(chan *Message, 256),
    }
}

func (h *Hub) Register(client *Client) {
    h.mutex.Lock()
    defer h.mutex.Unlock()
    if h.clients[client.UserID] == nil {
        h.clients[client.UserID] = make(map[*Client]bool)
    }
    h.clients[client.UserID][client] = true
}

func (h *Hub) Unregister(client *Client) {
    h.mutex.Lock()
    defer h.mutex.Unlock()
    if clients, ok := h.clients[client.UserID]; ok {
        if _, ok := clients[client]; ok {
            delete(clients, client)
            close(client.Send)
            if len(clients) == 0 {
                delete(h.clients, client.UserID)
            }
        }
    }
}

func (h *Hub) SendToUser(userID int64, msg []byte) {
    h.mutex.RLock()
    defer h.mutex.RUnlock()
    if clients, ok := h.clients[userID]; ok {
        for client := range clients {
            select {
            case client.Send <- msg:
            default:
                close(client.Send)
                delete(clients, client)
            }
        }
    }
}
```

### WebSocket 处理器

```go
// ws/handler.go
type Handler struct {
    hub      *Hub
    db       *gorm.DB
    jwtKey   string
}

type Client struct {
    Hub    *Hub
    Conn   *websocket.Conn
    Send   chan []byte
    UserID int64
}

func (h *Handler) ServeWS(c *gin.Context) {
    token := c.Query("token")
    if token == "" {
        c.JSON(400, gin.H{"code": -1002, "message": "token required"})
        return
    }

    // 解析 JWT
    claims, err := utils.ParseToken(token, h.jwtKey)
    if err != nil {
        c.JSON(400, gin.H{"code": -1002, "message": "invalid token"})
        return
    }
    userID := claims.UserID

    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Printf("upgrade error: %v", err)
        return
    }

    client := &Client{
        Hub:    h.hub,
        Conn:   conn,
        Send:   make(chan []byte, 256),
        UserID: userID,
    }
    h.hub.Register(client)

    go client.writePump()
    go client.readPump()
}

func (c *Client) readPump() {
    defer func() {
        c.Hub.Unregister(c)
        c.Conn.Close()
    }()

    c.Conn.SetReadLimit(512 * 1024)
    c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
    c.Conn.SetPongHandler(func(string) error {
        c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
        return nil
    })

    for {
        _, message, err := c.Conn.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                log.Printf("error: %v", err)
            }
            break
        }
        h.handleMessage(c, message)
    }
}
```

## 模块红线

1. **WebSocket 连接必须鉴权**：query 参数中的 token 必须验证，无效/过期立即关闭（code 4001）。
2. **消息必须落库**：无论对方是否在线，消息先入库再投递，保证不丢失。
3. **好友关系是消息的前置条件**：仅 `status=1` 的好友可以互发消息。
4. **消息必须带 `client_msg_id`**：8-64 字符，全局唯一；服务端按此去重。
5. **心跳保活**：客户端每 30s 发 ping，服务端回 pong；超 60s 无消息断开。
6. **离线消息上限**：单次最多推送 100 条离线消息。
7. **消息有序**：按 `id` 自增保证顺序。
8. **支持多端登录**：同一用户允许多个 WebSocket 连接。
9. **契约即事实**：接口字段/枚举/错误码以 `api-contract-ws.md` 为准。

## 错误码

| code | 含义 | 触发场景 |
|------|------|----------|
| -1001 | 参数错误 | 消息格式不对、必填字段缺失 |
| -1002 | 未授权 | token 无效或过期 |
| -1003 | 禁止访问 | 对方不是已通过好友、给自己发消息 |
| -2000 | 系统错误 | 服务端内部异常 |

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/skeleton.go` | 完整模块代码模板 |
| `references/ws-protocol.md` | WebSocket 消息协议详细规范 |
| `references/heartbeat-guide.md` | 心跳保活与断线重连方案 |
| `references/friend-guide.md` | 好友关系约束与集成方式 |

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract-ws.md` | WebSocket 协议 + REST 接口全量文档 |
| 接入指南 | `docs/ws-module-guide.md` | 表结构、连接流程、与 go-gin-init-skill 集成步骤 |

## 不做

- 不重复生成 Go Gin 基础骨架。
- 不实现群聊（v1 单聊闭环）。
- 不依赖第三方 IM 服务。
- 不做音视频通话。
- 不在 SKILL.md 锁定版本号。
- 不替用户提交 git。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
Go WebSocket、WS 聊天、即时通信、IM 模块、聊天模块、ws 模块、
添加 WebSocket、帮我加聊天功能、go-ws-module、Gin WebSocket
```
