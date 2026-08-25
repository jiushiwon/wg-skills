# Agent 模块接口契约

## 基础信息

- 基础路径：`/api/agent`
- 认证：需要登录（复用 auth 模块的 JWT）
- 响应格式：`{ code, message, data }`

## 接口列表

### 1. 流式对话

**POST** `/api/agent/chat`

请求体：
```json
{
  "message": "你好",
  "session_id": null,
  "stream": true
}
```

响应（SSE 流式）：
```
data: {"type": "token", "content": "你"}
data: {"type": "token", "content": "好"}
data: {"type": "done", "content": ""}
```

### 2. 同步对话

**POST** `/api/agent/chat/sync`

请求体：
```json
{
  "message": "查询我的角色",
  "session_id": 1
}
```

响应：
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

### 3. 会话列表

**GET** `/api/agent/sessions?page=1&page_size=10`

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
        "created_at": "2026-08-24T10:00:00"
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 10
  }
}
```

### 4. 创建会话

**POST** `/api/agent/sessions`

请求体：
```json
{
  "title": "智能助手",
  "model": "gpt-4o-mini"
}
```

### 5. 删除会话

**DELETE** `/api/agent/sessions/{session_id}`

### 6. 获取会话消息

**GET** `/api/agent/sessions/{session_id}/messages`

### 7. 工具列表

**GET** `/api/agent/tools`

响应：
```json
{
  "code": 0,
  "data": [
    {
      "name": "get_user_info",
      "description": "获取用户信息",
      "parameters": {
        "user_id": {"type": "int", "required": false}
      }
    },
    {
      "name": "get_user_roles",
      "description": "获取用户角色",
      "parameters": {}
    }
  ]
}
```

### 8. 清除记忆

**POST** `/api/agent/clear-memory`

请求体：
```json
{
  "session_id": 1
}
```

## 内置 Tools

| 名称 | 描述 | 参数 |
|------|------|------|
| get_user_info | 查询用户信息 | user_id?: number |
| get_user_roles | 查询用户角色 | user_id?: number |
| get_user_menus | 查询用户菜单 | user_id?: number |
| search_users | 搜索用户 | keyword: string |
| get_org_tree | 查询组织架构树 | - |
| get_org_detail | 查询部门详情 | org_id: number |
| get_post_list | 查询岗位列表 | status?: number |
| get_tenant_info | 查询租户信息 | - |

## SSE 事件类型

| 类型 | 说明 |
|------|------|
| token | LLM 输出的 token |
| tool_call | LLM 调用的工具 |
| tool_result | 工具执行结果 |
| done | 流式输出结束 |
| error | 错误信息 |

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| -1 | 参数错误 |
| -1001 | 认证失败 |
| -5001 | LLM 调用失败 |
| -5002 | Tool 执行失败 |
