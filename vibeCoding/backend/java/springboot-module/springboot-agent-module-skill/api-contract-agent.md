# Agent 模块接口契约

> 基于 `springboot-init-skill` 骨架 + `springboot-auth-module-skill` 鉴权模块

## 通用说明

- **基地址**：`/api/agent`
- **鉴权**：所有接口需携带 `Authorization: Bearer <token>`
- **响应格式**：`ApiResponse` 信封（`ResponseBodyAdvice` 自动包装）`{ "code": 0, "message": "操作成功", "data": ... }`
- **用户获取**：`@CurrentUser Long userId`（骨架 `CurrentUserArgumentResolver`）
- **错误码**：见末尾错误码表
- **分页参数**：`page`（默认 1）、`pageSize`（默认 20）
- **表前缀**：`{prefix}`（默认 `wg`）
- **ORM**：Spring Data JPA（与骨架一致）
- **DB 迁移**：Flyway（`V20__init_agent_module.sql`）

---

## 1. 流式对话

**POST** `/api/agent/chat`

SSE 流式返回，支持 Function Calling。

### 请求体

```json
{
  "content": "帮我查一下我的用户信息",
  "sessionId": 123,
  "model": "gpt-4o-mini"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | String | ✅ | 用户消息 |
| sessionId | Long | ❌ | 会话ID，不传则自动创建 |
| model | String | ❌ | 模型名称（需在白名单内） |

### SSE 事件

```
event: message
data: {"content": "你好", "role": "assistant"}

event: tool_call
data: {"name": "getUserInfo", "args": {}, "result": {...}}

event: usage
data: {"promptTokens": 120, "completionTokens": 85, "totalTokens": 205}

event: error
data: {"code": -5001, "message": "对话处理失败，请稍后重试"}

event: done
data: {"sessionId": 123, "messageId": 456}

event: warning
data: {"message": "响应已截断（超过50000字符）"}
```

### Rate Limit
- 10 次/分钟/用户
- 超限返回 `event: error` + `code: -429`

---

## 2. 同步对话

**POST** `/api/agent/chat/sync`

非流式返回，适用于需要完整 Tool 调用结果的场景。

### 请求体

```json
{
  "content": "帮我查一下我的用户信息",
  "sessionId": 123,
  "model": "gpt-4o-mini"
}
```

### 响应

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "content": "根据查询结果，您的用户信息如下...",
    "sessionId": 123,
    "messageId": 456,
    "toolCalls": [
      {
        "name": "getUserInfo",
        "args": {},
        "result": {"id": 1, "username": "admin"}
      }
    ],
    "usage": {
      "promptTokens": 120,
      "completionTokens": 85,
      "totalTokens": 205
    }
  }
}
```

---

## 3. 会话列表

**GET** `/api/agent/sessions?page=1&pageSize=20`

### 响应

```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 123,
      "title": "用户信息查询",
      "model": "gpt-4o-mini",
      "status": 0,
      "createdAt": "2025-01-01 12:00:00",
      "updatedAt": "2025-01-01 12:05:00"
    }
  ]
}
```

---

## 4. 创建会话

**POST** `/api/agent/sessions`

### 请求体

```json
{
  "title": "新对话",
  "model": "gpt-4o-mini"
}
```

### 响应

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 124,
    "title": "新对话",
    "model": "gpt-4o-mini",
    "status": 0,
    "createdAt": "2025-01-01 12:10:00"
  }
}
```

---

## 5. 获取会话详情

**GET** `/api/agent/sessions/{id}`

### 响应

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 123,
    "title": "用户信息查询",
    "model": "gpt-4o-mini",
    "status": 0,
    "messageCount": 10,
    "createdAt": "2025-01-01 12:00:00",
    "updatedAt": "2025-01-01 12:05:00"
  }
}
```

---

## 6. 删除会话

**DELETE** `/api/agent/sessions/{id}?hard=false`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 会话ID（路径参数） |
| hard | Boolean | ❌ | 是否硬删除（默认 false，软删除） |

- 软删除：标记 `deleted_at`，数据保留
- 硬删除：级联删除会话 + 所有消息（FK CASCADE）

### 响应

```json
{
  "code": 0,
  "message": "操作成功",
  "data": null
}
```

---

## 7. 获取会话消息

**GET** `/api/agent/sessions/{id}/messages?page=1&pageSize=50`

### 响应

```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "sessionId": 123,
      "role": "user",
      "content": "帮我查一下我的用户信息",
      "createdAt": "2025-01-01 12:00:00"
    },
    {
      "id": 2,
      "sessionId": 123,
      "role": "assistant",
      "content": "根据查询结果...",
      "toolCalls": [...],
      "tokens": 205,
      "createdAt": "2025-01-01 12:00:05"
    }
  ]
}
```

---

## 8. 清除会话内存记忆

**POST** `/api/agent/sessions/{id}/clear-memory`

清除会话的内存缓存（不清除数据库历史）。下次对话时会从数据库重新加载。

### 响应

```json
{
  "code": 0,
  "message": "操作成功",
  "data": null
}
```

---

## 9. 可用工具列表

**GET** `/api/agent/tools`

### 响应

```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "name": "getUserInfo",
      "description": "获取当前用户基本信息（不含手机号/邮箱）"
    },
    {
      "name": "getUserRoles",
      "description": "获取当前用户角色列表"
    },
    {
      "name": "searchUsers",
      "description": "搜索用户（返回ID/用户名/昵称，不含敏感信息）"
    }
  ]
}
```

---

## 错误码

| code | 说明 |
|------|------|
| `0` | 成功 |
| `-1` | 通用错误 |
| `-1001` | 会话归属校验失败 |
| `-1002` | 会话不存在 |
| `-429` | 请求频率超限（Rate Limit） |
| `-5001` | LLM 调用失败 |
| `-5002` | Tool 执行失败 |
| `-5003` | 对话处理超时 |
| `-5000` | Agent 内部错误 |

---

## SSE 特殊说明

### 代理缓冲问题

SSE 在 Nginx/CDN 后面可能被缓冲，导致流式效果失效。解决方法：

```nginx
# Nginx 配置
location /api/agent/chat {
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
    proxy_read_timeout 120s;
}
```

### Tool 调用限制

- 流式模式下 LLM 仍可调用 Tools（通过 Spring AI Function Calling）
- Tool 结果在下一轮 token 中返回，客户端需处理 `tool_call` 事件
- 同步模式返回完整的 Tool 调用链

### 连接超时

- SSE 连接超时：120 秒
- LLM 调用超时：60 秒
- 超时后自动断开，返回 `error` 事件
