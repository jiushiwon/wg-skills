# WebSocket 消息协议规范

## 连接方式

```
WS /api/ws/{token}
```

- `token`：JWT access_token，通过 URL 参数传递（WebSocket 不支持自定义 Header）
- 连接成功：服务端返回 `{"type":"connected","user_id":123}`
- 连接失败：返回 `{"type":"error","code":-1002,"message":"未授权"}` 并关闭连接

## 心跳机制

```
客户端 → 服务端：{"type":"ping"}
服务端 → 客户端：{"type":"pong"}
```

- 客户端每 **30 秒**发送一次 ping
- 服务端收到后立即回复 pong
- 服务端 **60 秒**未收到 ping，判定客户端离线，主动断开
- 客户端未收到 pong，判定连接异常，触发重连

## 消息类型

### 客户端 → 服务端

| type | 说明 | 必填字段 |
|------|------|----------|
| `chat` | 发送聊天消息 | `to`, `content` |
| `ping` | 心跳 | 无 |
| `ack` | 确认收到消息 | `msg_id` |

### 服务端 → 客户端

| type | 说明 | 字段 |
|------|------|------|
| `connected` | 连接成功 | `user_id` |
| `chat` | 收到聊天消息 | `from`, `content`, `msg_id`, `msg_type`, `timestamp` |
| `offline` | 离线消息 | 同 chat |
| `ack` | 消息送达确认 | `msg_id`, `status` |
| `pong` | 心跳回复 | 无 |
| `error` | 错误 | `code`, `message` |

## 消息格式详解

### 发送消息

```json
{
  "type": "chat",
  "to": 456,
  "content": "你好",
  "msg_type": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 固定 `chat` |
| to | integer | 是 | 接收方用户 ID |
| content | string | 是 | 消息内容，文本消息最大 5000 字符 |
| msg_type | integer | 否 | 1 文本（默认）, 2 图片 URL, 3 文件 URL |

### 接收消息

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
| type | string | `chat` 或 `offline` |
| from | integer | 发送方用户 ID |
| content | string | 消息内容 |
| msg_id | integer | 消息 ID |
| msg_type | integer | 1 文本, 2 图片, 3 文件 |
| timestamp | string | ISO 8601 时间戳 |

### 消息确认（ACK）

```json
// 客户端收到消息后确认
{
  "type": "ack",
  "msg_id": 1001
}

// 服务端确认消息已送达
{
  "type": "ack",
  "msg_id": 1001,
  "status": 1
}
```

### 错误消息

```json
{
  "type": "error",
  "code": -1001,
  "message": "参数错误：to 字段缺失"
}
```

## 错误码

| code | 含义 | 触发场景 |
|------|------|----------|
| -1001 | 参数错误 | 消息格式不对、必填字段缺失 |
| -1002 | 未授权 | token 无效或过期 |
| -1003 | 禁止访问 | 发送消息给无权限的用户 |
| -1004 | 用户不存在 | 接收方不存在 |
| -2000 | 系统错误 | 服务端内部异常 |

## 消息状态流转

```
[未读 0] ──送达──▶ [已送达 1] ──已读──▶ [已读 2]
```

- 服务端投递成功 → 状态变为 1（已送达）
- 客户端 ack 确认 → 状态变为 2（已读）
- v1 只实现未读/已送达，已读回执作为后续迭代

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
