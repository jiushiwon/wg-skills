# WebSocket 消息协议规范

## 连接方式

```
WS /api/ws?token=<jwt_access_token>
```

> **为什么用 query 参数而不是 URL 路径？**
>
> token 放在路径里（`/api/ws/{token}`）会被 Nginx/网关 access log 完整记录 → 泄漏 JWT。  
> query 参数虽也会进日志，但更易于在网关层做脱敏（`set $token_log "***"`）。  
> 浏览器原生 WebSocket 不支持自定义 Header，所以 query 参数是 FastAPI 生态的事实标准。

- 连接成功：服务端返回 `{"type":"connected","user_id":123}`
- 连接失败：返回 `{"type":"error","code":-1002,"message":"未授权"}` 并关闭连接（code 4001）

## 心跳机制

```
客户端 → 服务端：{"type":"ping"}
服务端 → 客户端：{"type":"pong"}
```

- 客户端每 **30 秒**发送一次 ping
- 服务端收到后立即回复 pong
- 任何业务消息（chat / ack / read）也算作心跳，不强制每 30s 必须 ping
- 服务端 **60 秒**内未收到任何消息，判定客户端离线，主动断开（code 4002）
- 客户端未收到 pong，判定连接异常，触发重连

## 消息类型

### 客户端 → 服务端

| type | 说明 | 必填字段 |
|------|------|----------|
| `chat` | 发送聊天消息 | `to`, `client_msg_id`, `msg_type`, `content` 或 `image_url` 或 `voice_url` |
| `ping` | 心跳 | 无 |
| `ack` | 确认收到消息 | `msg_id` |
| `read` | 标记对方会话已读 | `peer_id` |

### 服务端 → 客户端

| type | 说明 | 字段 |
|------|------|------|
| `connected` | 连接成功 | `user_id` |
| `chat` | 收到聊天消息（实时） | `from`, `msg_id`, `msg_type`, `content/image_url/voice_url`, `client_msg_id`, `timestamp` |
| `offline` | 离线消息 | 同 chat |
| `ack` | 消息送达/已读回执 | `msg_id`, `status`, `client_msg_id` |
| `read` | 对方标记我已读 | `from`, `peer_id` |
| `pong` | 心跳回复 | 无 |
| `error` | 错误 | `code`, `message` |

## 消息格式详解

### 发送消息（文本）

```json
{
  "type": "chat",
  "to": 456,
  "msg_type": 1,
  "content": "你好",
  "client_msg_id": "cli-1724912345-abc123"
}
```

### 发送消息（图片）

```json
{
  "type": "chat",
  "to": 456,
  "msg_type": 2,
  "image_url": "https://cdn.example.com/uploads/2026/08/abc.png",
  "client_msg_id": "cli-1724912345-abc124"
}
```

### 发送消息（语音）

```json
{
  "type": "chat",
  "to": 456,
  "msg_type": 3,
  "voice_url": "https://cdn.example.com/uploads/2026/08/abc.mp3",
  "voice_duration": 12,
  "client_msg_id": "cli-1724912345-abc125"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 固定 `chat` |
| to | integer | 是 | 接收方用户 ID（必须是你好友） |
| client_msg_id | string | 是 | 客户端幂等键，8-64 字符，全局唯一（推荐用 `cli-<时间戳>-<uuid>`） |
| msg_type | integer | 否 | 1 文本（默认）, 2 图片, 3 语音 |
| content | string | 是（msg_type=1） | 文本内容，1-2000 字符 |
| image_url | string | 是（msg_type=2） | 图片 URL，由 fastapi-init-skill 上传接口产生 |
| voice_url | string | 是（msg_type=3） | 语音 URL |
| voice_duration | integer | 是（msg_type=3） | 语音时长（秒），1-600 |

### 接收消息

```json
{
  "type": "chat",
  "from": 456,
  "msg_id": 1001,
  "msg_type": 1,
  "content": "你好",
  "client_msg_id": "cli-1724912345-abc123",
  "timestamp": "2026-08-29T10:00:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | `chat` 或 `offline` |
| from | integer | 发送方用户 ID |
| msg_id | integer | 消息 ID（用于 ack） |
| msg_type | integer | 1文本 2图片 3语音 |
| content / image_url / voice_url / voice_duration | 各类型对应字段 |  |
| client_msg_id | string | 原样回传，客户端用此去重 |
| timestamp | string | ISO 8601 时间戳 |

### 消息确认（ACK）

```json
// 客户端收到消息后确认（消息状态 0→2 已读）
{ "type": "ack", "msg_id": 1001 }

// 服务端确认消息已入库（消息状态 0→1 已送达）
{
  "type": "ack",
  "msg_id": 1001,
  "status": 1,
  "client_msg_id": "cli-1724912345-abc123"
}
```

### 标记已读（read）

```json
// 客户端发送：标记与 peer_id 的会话已读
{ "type": "read", "peer_id": 456 }

// 服务端通知对方：你发的消息我已读
{
  "type": "read",
  "from": 123,
  "peer_id": 456
}
```

### 错误消息

```json
{
  "type": "error",
  "code": -1001,
  "message": "参数错误：client_msg_id 必填，长度 8-64"
}
```

## 错误码

| code | 含义 | 触发场景 |
|------|------|----------|
| -1001 | 参数错误 | 消息格式不对、必填字段缺失、client_msg_id 不合规、msg_type/voice_duration 越界 |
| -1002 | 未授权 | token 无效或过期 |
| -1003 | 禁止访问 | 对方不是已通过好友、给自己发消息 |
| -1004 | 用户不存在 | 接收方不存在（按需实现） |
| -2000 | 系统错误 | 服务端内部异常 |

## 消息状态流转

```
[未读 0] ──送达──▶ [已送达 1] ──已读──▶ [已读 2]
```

- 服务端推送成功（对方在线）→ 状态变为 1（已送达）
- 客户端 ack 确认 或 服务端收到 read 消息 → 状态变为 2（已读）
- v1 数据层完整支持，前端 UI 提示由 frontend 自行决定是否实现

## 幂等保证

服务端用 `client_msg_id`（UNIQUE 约束）做幂等：

| 场景 | 客户端表现 | 服务端表现 |
|------|----------|----------|
| 首次发送 | 收到 `ack`，msg_id = 新分配 | INSERT 成功 |
| 网络超时重发同一 client_msg_id | 收到 `ack`，msg_id = 首次分配的 ID | 检测到重复，返回首次结果，**不二次 INSERT** |
| ack 消息丢失，客户端重发 chat | 同上 | 同上 |

> 客户端实现建议：  
> 1. 生成 `client_msg_id`（UUID 或 `cli-<时间戳>-<随机>`）  
> 2. 收到 ack 后按 client_msg_id 索引保存 msg_id  
> 3. 断网期间记录所有未确认消息的 client_msg_id  
> 4. 重连后先发心跳再决定是否重发（已经 ack 过的无需重发）

## 重连策略

客户端断线后按**指数退避**重连：

```
第 1 次：1 秒后重连
第 2 次：2 秒后重连
第 3 次：4 秒后重连
第 4 次：8 秒后重连
第 5 次及以后：16 秒后重连（上限）
```

重连成功后：服务端自动推送离线消息，客户端无需额外请求。

## 多端登录

- 同一用户可在多个端同时在线（PC + 手机 + Web）
- 服务端 `WSManager` 内部用 `defaultdict(set)` 管理连接
- 发送消息时广播到该用户的所有连接
- 任何一端断开不影响其他端
- 心跳超时则断开该用户的所有连接（防止某端假死）