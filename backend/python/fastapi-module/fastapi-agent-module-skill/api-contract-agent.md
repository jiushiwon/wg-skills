# Agent 模块接口契约

## 基础信息

- 基础路径：`/api/agent`
- 认证：需要登录（复用 auth 模块的 JWT）
- 响应格式：`{ code, message, data }`
- 限流：默认每用户 chat 10 次/分钟，session 30 次/分钟（生产推荐使用 slowapi + Redis）

## 接口列表

### 1. AI 对话（统一入口）

**POST** `/api/agent/chat`

请求体：
```json
{
  "message": "你好",
  "session_id": null,
  "stream": true
}
```

**模式说明**：
- `stream=true`（默认）：流式响应（SSE），仅返回 LLM 文本输出
- `stream=false`：同步响应，支持 Tools（function calling）

**流式模式限制**（P0-U1）：
- 当前流式接口仅返回 LLM token-by-token 文本输出
- 由于流式响应在第一个 token 到达时就需持久化用户消息，无法支持 Tools 的多轮 think-execute-think 循环
- 如需使用 Tools（搜索用户、查询组织、调用 API 等），请设置 `stream=false`
- 同步模式会调用 LangGraph 完整流程，包含 tool_calls

响应（SSE 流式）：
```
data: {"type": "token", "content": "你"}
data: {"type": "token", "content": "好"}
data: {"type": "done", "content": ""}
```

响应（同步）：
```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "session_id": 1,
    "message": "您拥有的角色是：admin, user"
  }
}
```

### 2. 会话列表

**GET** `/api/agent/sessions?page=1&page_size=10`

参数限制：`page >= 1`，`page_size ∈ [1, 100]`

响应：
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "user_id": 1,
        "title": "新对话",
        "model": "gpt-4o-mini",
        "status": 1,
        "created_at": "2026-08-24T10:00:00",
        "updated_at": "2026-08-24T10:30:00"
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 10
  }
}
```

### 3. 创建会话

**POST** `/api/agent/sessions`

请求体：
```json
{
  "title": "智能助手",
  "model": "gpt-4o-mini"
}
```

### 5. 获取会话

**GET** `/api/agent/sessions/{session_id}`

### 6. 删除会话

**DELETE** `/api/agent/sessions/{session_id}`

软删除（设置 `deleted_at`），数据库中的 `AgentMessage` 记录保留。

### 7. 获取会话消息

**GET** `/api/agent/sessions/{session_id}/messages`

### 8. 工具列表

**GET** `/api/agent/tools`

响应：
```json
{
  "code": 0,
  "data": [
    {
      "name": "get_user_info",
      "description": "获取当前用户信息",
      "parameters": {
        "current_user_id": {"type": "int", "required": true, "description": "系统自动注入"}
      }
    },
    {
      "name": "search_users",
      "description": "搜索用户（脱敏后）",
      "parameters": {
        "keyword": {"type": "str", "required": false, "max_length": 100},
        "limit": {"type": "int", "required": false, "ge": 1, "le": 50}
      }
    }
  ]
}
```

### 9. 清除会话记忆 ✅ P0-U3 已实现

**POST** `/api/agent/sessions/clear-memory`

请求体：
```json
{
  "session_id": 1
}
```

响应：
```json
{
  "code": 0,
  "data": {
    "cleared": true,
    "session_id": 1
  }
}
```

**注意**：
- 只清除内存中的 `MemoryStore`（短期对话上下文）
- 数据库中的 `AgentMessage` 历史消息不会被删除
- 仅清空自己 session 的记忆，不能跨用户操作

## 内置 Tools

| 名称 | 描述 | 参数 | 权限 |
|------|------|------|------|
| get_user_info | 查询当前用户信息（不含敏感字段） | current_user_id: int（系统注入） | 仅查自己 |
| get_user_roles | 查询当前用户的角色 | current_user_id: int（系统注入） | 仅查自己 |
| get_user_menus | 查询当前用户的菜单 | current_user_id: int（系统注入） | 仅查自己 |
| search_users | 搜索用户（脱敏后） | keyword?: str, limit?: int ∈ [1,50] | 限流 |
| get_org_tree | 查询当前租户的组织架构树 | current_user_id: int（系统注入） | 租户隔离 |
| get_org_detail | 查询当前租户的部门详情 | org_id: int, current_user_id: int | 租户隔离 |
| get_post_list | 查询当前租户的岗位列表 | current_user_id: int, status?: int, page?: int, page_size?: int ∈ [1,50] | 租户隔离 |
| get_tenant_info | 查询当前用户所属租户 | current_user_id: int（系统注入） | 仅查自己 |

## SSE 事件类型

| 类型 | 说明 |
|------|------|
| token | LLM 输出的 token |
| done | 流式输出结束 |
| error | 错误信息（仅含固定话术，不暴露内部异常） |

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| -1 | 参数错误 |
| -1001 | 认证/会话失败 |
| -429 | 限流命中 |
| -5001 | LLM 调用失败（用户友好提示） |
| -5002 | Tool 执行失败（用户友好提示） |

## 安全特性

1. **会话归属校验**：每个 session_id 操作都校验 `user_id == session.user_id`，跨用户访问返回 -1001
2. **历史消息过滤**：`_get_session_messages` 使用 JOIN 同时校验会话归属
3. **Tool current_user_id 强制注入**：LLM 无法通过 arguments 篡改 user_id
4. **Pydantic 参数校验**：Tool 参数边界、长度自动校验
5. **审计日志**：所有 Tool 调用、对话失败、限流命中均记录
6. **异常脱敏**：客户端只收到固定话术，真实异常写入服务端日志
7. **SSE 断连检测**：客户端断开后停止 token 生成，避免无效计费
8. **tenacity 退避重试**：LLM 429/529 等可恢复错误自动重试 3 次

## 数据库索引（migration.py）

| 索引名 | 字段 | 覆盖查询 |
|--------|------|----------|
| ix_*_session_user_updated | user_id, updated_at | list_sessions 排序 |
| ix_*_session_user_deleted | user_id, deleted_at | 过滤软删除 |
| ix_*_session_user_id | user_id, id | 校验归属 |
| ix_*_message_session_created | session_id, created_at | 加载历史 |
| ix_*_message_session_role | session_id, role | 按角色过滤 |