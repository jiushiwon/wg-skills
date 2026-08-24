# {{project}} 接口契约

> 本文档由 springboot-init-skill 一键生成。配套 `docs/project-guide.md`。

## 一、响应信封

所有 JSON 接口（除 SSE 外）统一返回：

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

### 错误响应

```json
{
  "code": -1001,
  "message": "参数校验失败",
  "data": {
    "errors": [
      { "field": "username", "message": "用户名长度 4-64" }
    ]
  }
}
```

### 错误码表

| code | 含义 | HTTP |
|------|------|------|
| 0 | 成功 | 200 |
| -1001 | 参数校验失败 | 400 |
| -1002 | 未登录 | 401 |
| -1003 | 无权限 | 403 |
| -1004 | 资源不存在 | 404 |
| -1005 | 资源冲突 | 409 |
| -2000 | 系统异常 | 500 |
| -2001 | 数据库异常 | 500 |
| -2002 | 第三方服务异常 | 502 |

## 二、Token 注入

受保护接口需在 Header 注入：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi...
```

JWT 载荷：`{ uid: Long, type: "access"|"refresh", sub: username, iss, iat, exp }`

## 三、SSE 响应头

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

数据格式：

```
data: {"content":"hello","ts":1692600000000}

```

## 四、接口清单

### 4.1 健康检查

#### GET /api/health

无需鉴权。

```http
GET /api/health HTTP/1.1
Host: localhost:8080
```

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "ok",
    "service": "{{project}}",
    "ts": "1692600000000"
  }
}
```

### 4.2 认证

#### POST /api/auth/register

无需鉴权。

请求：

```json
{
  "username": "string (4-64)",
  "password": "string (6-64)",
  "nickname": "string?",
  "email": "string? (email 格式)",
  "phone": "string? (1[3-9]\\d{9})"
}
```

响应 200：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

#### POST /api/auth/login

无需鉴权。

请求：

```json
{
  "username": "string",
  "password": "string"
}
```

响应同 register。

#### POST /api/auth/refresh

无需鉴权。

请求：

```json
{
  "refreshToken": "string"
}
```

响应同 register。

#### POST /api/auth/logout

需鉴权。无业务逻辑（JWT 无状态），客户端清除 token 即可。

响应 200：

```json
{ "code": 0, "message": "success", "data": null }
```

#### GET /api/auth/me

需鉴权。

响应 200：

```json
{
  "code": 0,
  "message": "success",
  "data": 1
}
```

> `data` 为当前登录用户的 userId。

### 4.3 用户

#### GET /api/users

需鉴权。分页列表。

查询参数：

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| page | int | 1 | 页码（从 1 开始） |
| size | int | 10 | 每页条数 |

响应 200：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "username": "alice",
        "nickname": "Alice",
        "email": "alice@example.com",
        "phone": "13800000000",
        "createdAt": "2026-08-21T10:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

#### GET /api/users/{id}

需鉴权。响应同列表项。

#### POST /api/users

需鉴权。创建用户（管理员场景）。

请求：

```json
{
  "username": "string (4-64)",
  "password": "string (6-64)",
  "nickname": "string?",
  "email": "string? (email 格式)"
}
```

响应 200：同列表项。

#### PUT /api/users/profile

需鉴权。修改当前用户资料。

请求：

```json
{
  "nickname": "string?",
  "email": "string? (email 格式)"
}
```

响应 200：同列表项。

#### PUT /api/users/password

需鉴权。修改当前用户密码。

请求：

```json
{
  "oldPassword": "string",
  "newPassword": "string (6-64)"
}
```

响应 200：

```json
{ "code": 0, "message": "success", "data": null }
```

### 4.4 SSE 流式

#### GET /api/sse/chat

无需鉴权。

```http
GET /api/sse/chat HTTP/1.1
Host: localhost:8080
```

响应（每 2 秒一条）：

```
data: {"content":"你好陌生人","ts":1692600000000}

data: {"content":"你好陌生人","ts":1692600002000}

```

#### GET /api/sse/chat/protected

需鉴权。行为同 `/api/sse/chat`，但 `content` 会带上 `userId`，如 `欢迎回来 #1`。

### 4.5 文件上传

#### POST /api/upload

需鉴权。单文件上传。

请求：`multipart/form-data`，字段名 `file`。

限制：

- 默认大小：10MB（`UPLOAD_MAX_SIZE_BYTES`）
- 允许类型：jpg, jpeg, png, gif, pdf（`UPLOAD_ALLOWED_TYPES`）

响应 200：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "/uploads/2026/08/21/abc123.png",
    "size": 102400,
    "mimeType": "image/png",
    "filename": "test.png"
  }
}
```

> 上传文件可通过 `http://localhost:8080{{url}}` 直接访问。

#### POST /api/uploads

需鉴权。多文件上传。

请求：`multipart/form-data`，字段名 `files`（每个文件都使用该字段名）。

响应 200：

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "url": "/uploads/2026/08/21/abc1.png", "size": 1024, "mimeType": "image/png", "filename": "a.png" },
    { "url": "/uploads/2026/08/21/abc2.png", "size": 2048, "mimeType": "image/png", "filename": "b.png" }
  ]
}
```

### 4.6 Swagger

#### GET /swagger-ui.html

无需鉴权。Swagger UI 入口。

#### GET /v3/api-docs

无需鉴权。OpenAPI 3 JSON 描述。

## 五、与前端联动

| 维度 | 后端实现 | 前端消费 |
|------|----------|----------|
| 响应信封 | `ResponseBodyAdvice` 自动包装 | `frontend-request-skill` 的 `ApiResponse<T>` |
| 错误码 | `GlobalExceptionHandler` | `ERROR_CODE_MAP`（见 `frontend-request-skill/references/error-code-map.md`） |
| Token | `Authorization: Bearer {token}` | 请求拦截器自动注入 |
| SSE | `SseEmitter`（Spring MVC Servlet 异步） | EventSource（H5）/ `enableChunked`（小程序） |
| 上传 | `multipart/form-data` | `upload<T>(options)` |

详细对接见 `docs/project-guide.md` 的「与前端联动」章节。

## 六、版本

接口契约版本：1.0.0（与项目版本同步）。
