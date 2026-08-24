# ai-chat-skill — 接口契约增量

以下接口追加进项目根目录 `api-contract.md`，格式遵循 backend-convention-skill `references/api-contract-spec.md`。除流式接口外，所有接口 HTTP 状态码统一 200，业务结果走 `{ code, message, data }` 信封；鉴权栏为 `Bearer` 的接口需要有效 access token（匿名会话场景见 `/api/chat/completions` 说明）。

---

## POST /api/chat/sessions

**描述**：创建会话。

**鉴权**：Bearer（允许匿名时为可选）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | 否 | 模型名，默认用服务端配置 |
| systemPrompt | string | 否 | 会话级 system prompt，覆盖默认 |

**请求示例**

```json
{ "model": "gpt-4o-mini", "systemPrompt": "你是一名简洁的助手" }
```

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 会话 ID |
| title | string | 标题（首条消息后生成，初始为空） |
| model | string | 模型名 |
| createdAt | string | 创建时间 |

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "id": 101, "title": "", "model": "gpt-4o-mini", "createdAt": "2026-07-12T10:00:00Z" } }
```

**错误码**：`-1002` 未登录（必须登录场景）

---

## GET /api/chat/sessions

**描述**：当前用户的会话分页列表（默认不含已归档）。

**鉴权**：Bearer（允许匿名时为可选）

**请求参数**（query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 默认 1 |
| pageSize | integer | 否 | 默认 20，上限 100 |
| status | integer | 否 | 1 正常 0 归档，默认 1 |

**响应结构**：统一分页信封 `{ page, pageSize, total, list }`，list 元素为会话摘要（`id, title, model, status, messageCount, totalTokens, updatedAt`）。

**响应示例**

```json
{
  "code": 0, "message": "success",
  "data": { "page": 1, "pageSize": 20, "total": 2, "list": [
    { "id": 101, "title": "花生过敏能吃吗", "model": "gpt-4o-mini", "status": 1, "messageCount": 6, "totalTokens": 1820, "updatedAt": "2026-07-12T10:05:00Z" }
  ] }
}
```

**错误码**：`-1002` 未登录（必须登录场景）

---

## GET /api/chat/sessions/{id}/messages

**描述**：会话消息历史，分页（按时间正序返回，便于直接渲染）。

**鉴权**：Bearer（允许匿名时为可选）

**请求参数**（query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 默认 1 |
| pageSize | integer | 否 | 默认 50，上限 200 |

**响应结构**：统一分页信封，list 元素为消息（`id, role, content, tokens, finishReason, createdAt`）。

**响应示例**

```json
{
  "code": 0, "message": "success",
  "data": { "page": 1, "pageSize": 50, "total": 6, "list": [
    { "id": 1001, "role": "user", "content": "我对花生过敏，能吃这个吗？", "tokens": 0, "finishReason": null, "createdAt": "2026-07-12T10:00:00Z" },
    { "id": 1002, "role": "assistant", "content": "不建议……", "tokens": 120, "finishReason": "stop", "createdAt": "2026-07-12T10:00:03Z" }
  ] }
}
```

**错误码**：`-1003` 会话不属于当前用户；`-1004` 会话不存在

---

## PUT /api/chat/sessions/{id}

**描述**：修改会话标题或归档/恢复。

**鉴权**：Bearer（允许匿名时为可选）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 否 | 新标题，最长 128 |
| status | integer | 否 | 1 正常 0 归档 |

二者至少传一个。

**请求示例**

```json
{ "status": 0 }
```

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "id": 101 } }
```

**错误码**：`-1001` 参数缺失；`-1003` 会话不属于当前用户；`-1004` 会话不存在

---

## DELETE /api/chat/sessions/{id}

**描述**：删除会话（级联删除其全部消息）。

**鉴权**：Bearer（允许匿名时为可选）

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1003` 会话不属于当前用户；`-1004` 会话不存在

---

## POST /api/chat/completions

**描述**：发送一条消息并以 **SSE 流式**返回模型回复。

> **此接口不走统一信封。** SSE 是 `text/event-stream` 长连接流式协议，无法用 `{ code, message, data }` 包裹增量数据。业务错误通过 `error` 事件表达，成功结果通过 `delta` / `done` 事件表达。HTTP 状态码在流建立前返回：参数/鉴权错误仍可用非 200 + 信封（此时流未开始）；一旦流建立（200 + `text/event-stream`），后续错误一律走 `error` 事件。

**鉴权**：Bearer（允许匿名时为可选；匿名用设备指纹/临时 token 在 header 传，服务端隔离）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | integer | 是 | 会话 ID |
| content | string | 是 | 用户消息，最长 4000 字符 |

**请求示例**

```json
{ "sessionId": 101, "content": "总结一下我刚才说的过敏注意事项" }
```

**响应**：`Content-Type: text/event-stream`，逐事件推送。

| 事件 | 数据 | 说明 |
|------|------|------|
| delta | `{ "text": "增量文本" }` | 模型增量输出，可能多条 |
| done | `{ "messageId": 1002, "tokens": 132, "finishReason": "stop" }` | 生成完成，消息已落库 |
| error | `{ "code": -2000, "message": "模型调用失败：rate limit" }` | 出错；code 用闭集，message 写 provider 错误概要，不泄露 key |

**事件示例**

```
event: delta
data: {"text":"不建议"}

event: delta
data: {"text":"食用。"}

event: done
data: {"messageId":1002,"tokens":132,"finishReason":"stop"}
```

**错误码**（流建立前走信封，流建立后走 error 事件）：`-1001` 参数缺失或 content 超长；`-1002` 未登录；`-1003` 会话不属于当前用户；`-1004` 会话不存在；`-1006` 消息过频；`-2000` 模型调用失败

---

## GET /api/chat/memories

**描述**：当前用户的长期记忆列表（问答确认要长期记忆时才有此接口）。

**鉴权**：Bearer

**请求参数**（query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| kind | string | 否 | profile / fact / preference，不传返回全部 |

**响应结构**：list 元素为记忆（`id, kind, content, createdAt`）。

**响应示例**

```json
{
  "code": 0, "message": "success",
  "data": { "list": [
    { "id": 501, "kind": "fact", "content": "用户对花生过敏", "createdAt": "2026-07-12T10:06:00Z" }
  ] }
}
```

**错误码**：`-1002` 未登录

---

## DELETE /api/chat/memories/{id}

**描述**：删除一条长期记忆。

**鉴权**：Bearer

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1003` 记忆不属于当前用户；`-1004` 记忆不存在
