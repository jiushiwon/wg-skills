# demo 接口契约

> 本文档由 springboot-init-skill 一键生成。配套 [docs/project-guide.md](docs/project-guide.md)。

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

## 三、SSE 响应头

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

## 四、接口清单

### 4.1 健康检查

#### GET /api/health

无需鉴权。

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "ok",
    "service": "demo",
    "ts": "1692600000000"
  }
}
```

### 4.2 认证

#### POST /api/auth/register

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

响应：

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

响应同上。

#### POST /api/auth/refresh

请求：

```json
{
  "refreshToken": "string"
}
```

#### POST /api/auth/logout

需鉴权。

#### GET /api/auth/me

需鉴权，返回当前 userId。

### 4.3 用户

#### GET /api/users

需鉴权，分页列表。

查询参数：`page`（默认 1）、`pageSize`（默认 20，上限 100）。

#### GET /api/users/{id}

需鉴权。

#### POST /api/users

需鉴权，创建用户。

#### PUT /api/users/profile

需鉴权，修改当前用户资料。

#### PUT /api/users/password

需鉴权，修改密码。

### 4.4 SSE 流式

#### GET /api/sse/chat

无需鉴权。

#### GET /api/sse/chat/protected

需鉴权。

### 4.5 文件上传

#### POST /api/upload

需鉴权，单文件上传，字段名 `file`。

响应：

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

#### POST /api/uploads

需鉴权，多文件上传，字段名 `files`。

## 五、与前端联动

| 维度 | 后端实现 | 前端消费 |
|------|----------|----------|
| 响应信封 | `ResponseBodyAdvice` | `frontend-request-skill` 的 `ApiResponse<T>` |
| 错误码 | `GlobalExceptionHandler` | `ERROR_CODE_MAP` |
| Token | `Authorization: Bearer {token}` | 请求拦截器 |
| SSE | `SseEmitter` | EventSource / `enableChunked` |
| 上传 | `multipart/form-data` | `upload<T>(options)` |

## 六、版本

接口契约版本：1.0.0
