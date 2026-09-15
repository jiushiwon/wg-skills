# {{PROJECT_NAME}} 接口契约

本文件是 `nodejs-init-skill` 生成项目的默认接口契约模板，与 `frontend-request-skill` 的响应解析逻辑对齐。

> 响应信封、错误码、JWT 规范、分页约定遵循 `backend/shared/` 公共规范。

## 1. 基础信息

| 项 | 值 |
|----|-----|
| Base URL（dev） | `http://localhost:{{APP_PORT}}/api` |
| API Prefix | `/api` |
| 鉴权方式 | `Authorization: Bearer {access_token}` |
| Content-Type | `application/json`（文件上传用 `multipart/form-data`） |
| 字符编码 | UTF-8 |
| 时区 | UTC，时间字段格式 ISO 8601 |
| 分页默认值 | `page=1`，`pageSize=20`；分页上限 `pageSize ≤ 100` |

## 2. 统一响应格式

> 遵循 [shared/response-envelope-spec.md](../../../shared/response-envelope-spec.md)

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

## 3. 全局错误码

> 遵循 [shared/error-code-spec.md](../../../shared/error-code-spec.md)

| code | 含义 | HTTP |
|------|------|------|
| 0 | 成功 | 200 |
| -1001 | 参数校验失败 | 400 |
| -1002 | 未授权 | 401 |
| -1003 | 禁止访问 | 403 |
| -1004 | 资源不存在 | 404 |
| -1005 | 资源冲突 | 409 |
| -1006 | 请求过于频繁 | 429 |
| -1031 | 请求体过大 | 413 |
| -1032 | 不支持的文件类型 | 415 |
| -2000 | 系统异常 | 500 |

## 4. JWT 鉴权

> 遵循 [shared/jwt-auth-spec.md](../../../shared/jwt-auth-spec.md)

```
Authorization: Bearer {access_token}
```

JWT 载荷：`{ uid, sub, type: "access"|"refresh", iss, iat, exp }`

## 5. 接口清单

### 5.1 健康检查

#### GET /api/health

无需鉴权。

**响应 data：** `{ status: "ok", service: "{{PROJECT_NAME}}" }`

### 5.2 认证

#### POST /api/auth/register

无需鉴权。

**请求体：**

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|------|---------|
| username | string | 是 | 4-64 字符，唯一 |
| password | string | 是 | 6-128 字符 |
| nickname | string | 否 | 1-64 字符 |
| email | string | 否 | 邮箱格式 |
| phone | string | 否 | 手机号格式 |

**响应 data：**

| 字段 | 类型 | 说明 |
|------|------|------|
| accessToken | string | 访问令牌 |
| refreshToken | string | 刷新令牌 |
| tokenType | string | 固定 `Bearer` |
| expiresIn | integer | 过期秒数 |

#### POST /api/auth/login

无需鉴权。请求 `{ username, password }`，响应同 register。

#### POST /api/auth/refresh

无需鉴权。请求 `{ refreshToken }`，响应同 register。

#### POST /api/auth/logout

需鉴权。客户端清除 token。

#### GET /api/auth/me

需鉴权。响应 data 为当前用户 ID。

### 5.3 用户管理

#### GET /api/users

需鉴权。分页列表（`page` + `pageSize`），响应 data 为 `{ list, total, page, pageSize }`。

#### GET /api/users/{id}

需鉴权。响应 data 为用户对象。

#### PUT /api/users/profile

需鉴权。修改当前用户资料。

#### PUT /api/users/password

需鉴权。修改密码，请求 `{ oldPassword, newPassword }`。

### 5.4 文件上传

#### POST /api/upload

需鉴权。单文件上传，`multipart/form-data`，字段名 `file`。

**响应 data：** `{ url, filename, size, mimeType }`

#### POST /api/uploads

需鉴权。多文件上传，字段名 `files`。响应 data 为数组。

### 5.5 SSE 流式

#### GET /api/sse/chat

无需鉴权。`Content-Type: text/event-stream`。

## 6. 与前端联动

| 维度 | 后端（Express） | 前端 |
|------|----------------|------|
| 响应信封 | 中间件 `res.success(data)` / `res.fail(code, msg)` | `request.ts` 按 `ApiResponse<T>` 解析 |
| 错误码 | 全局错误中间件 | `ERROR_CODE_MAP`（对齐 `error-code-spec.md`） |
| Token | passport.js + JWT 策略 | 请求拦截器自动注入 |
| SSE | `res.write()` 流式输出 | EventSource / `enableChunked` |
| 上传 | multer 中间件 | `upload<T>(options)` |
