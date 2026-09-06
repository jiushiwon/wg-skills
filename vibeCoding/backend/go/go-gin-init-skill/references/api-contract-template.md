# {{PROJECT_NAME}} 接口契约

本文档是 `go-gin-init-skill` 生成项目的默认接口契约模板，与 `frontend-request-skill` 的响应解析逻辑对齐。

## 1. 基础信息

| 项 | 值 |
|----|-----|
| Base URL（dev） | `http://localhost:{{APP_PORT}}/api` |
| API Prefix | `/api` |
| 鉴权方式 | `Authorization: Bearer {access_token}` |
| Content-Type | `application/json`（文件上传用 `multipart/form-data`） |
| 字符编码 | UTF-8 |
| 时区 | UTC，时间字段格式 ISO 8601（如 `2026-07-10T08:00:00Z`） |
| 分页默认值 | `page=1`，`pageSize=20`；分页上限 `pageSize <= 100` |

> 注：认证与用户管理接口仅在数据库类型为 `mysql` / `postgres` 时启用。

## 2. 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | integer | 是 | 业务状态码，`0` 成功，负数失败 |
| message | string | 是 | 人类可读描述 |
| data | any | 是 | 业务数据，空时为 `null` |

- HTTP 状态码统一 200（路由不存在等底层异常除外），业务状态由 `code` 表达。
- 响应中禁止返回堆栈、SQL、内部错误信息。

## 3. 全局错误码

| 错误码 | 含义 | 触发场景 |
|--------|------|----------|
| 0 | 成功 | 业务正常 |
| -1001 | 参数校验失败 | 必填字段缺失、格式错误 |
| -1002 | 未授权 | Token 缺失、无效或过期 |
| -1003 | 禁止访问 | 权限不足（预留） |
| -1004 | 资源不存在 | 用户/数据未找到 |
| -1005 | 资源冲突 | 用户名已存在、旧密码错误、重复提交 |
| -1006 | 请求过于频繁 | 限流触发（预留） |
| -1031 | 请求体过大 | 上传文件超过 `UPLOAD_MAX_SIZE` |
| -1032 | 不支持的文件类型 | 上传文件 MIME 不在白名单 |
| -2000 | 系统错误 | 未捕获异常 |

前端 `ERROR_CODE_MAP` 可直接复用本表。

## 4. 接口清单

### 4.1 健康检查

#### GET /api/health

| 项 | 值 |
|----|-----|
| 说明 | 服务健康检查 |
| 认证 | 否 |

**响应 data：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 固定 `ok` |
| service | string | 是 | 固定 `go-gin` |

#### GET /api/health/db

| 项 | 值 |
|----|-----|
| 说明 | 数据库连通检查 |
| 认证 | 否 |

**响应 data：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 固定 `ok` |
| database | string | 是 | `connected` / `disconnected` / `none` |

### 4.2 认证

#### POST /api/auth/register

| 项 | 值 |
|----|-----|
| 说明 | 用户注册 |
| 认证 | 否 |

**请求体：**

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| username | string | 是 | 1-64 字符 | 用户名，唯一 |
| password | string | 是 | 8-128 字符 | 登录密码 |
| email | string | 否 | 邮箱格式 | 邮箱 |
| phone | string | 否 | - | 手机号 |

**响应 data：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| access_token | string | 是 | 访问令牌 |
| refresh_token | string | 是 | 刷新令牌 |
| token_type | string | 是 | 固定 `bearer` |

**可能错误码：** `-1001`（参数校验失败）、`-1005`（用户名已存在）

#### POST /api/auth/login

| 项 | 值 |
|----|-----|
| 说明 | 用户登录 |
| 认证 | 否 |

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应 data：** 同 `POST /api/auth/register`

**可能错误码：** `-1001`（参数校验失败）、`-1002`（用户名或密码错误）

#### POST /api/auth/refresh

| 项 | 值 |
|----|-----|
| 说明 | 刷新访问令牌 |
| 认证 | 否 |

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refresh_token | string | 是 | 刷新令牌 |

**响应 data：** 同 `POST /api/auth/register`

**可能错误码：** `-1002`（刷新令牌无效）

#### POST /api/auth/logout

| 项 | 值 |
|----|-----|
| 说明 | 登出，清空 refresh_token |
| 认证 | 是 |

**请求头：** `Authorization: Bearer {access_token}`

**响应 data：** `null`

**响应 message：** `已登出`

#### GET /api/auth/me

| 项 | 值 |
|----|-----|
| 说明 | 当前用户信息 |
| 认证 | 是 |

**请求头：** `Authorization: Bearer {access_token}`

**响应 data：** 见「4.6 公共数据模型 -> UserResponse」

**可能错误码：** `-1004`（用户不存在）

### 4.3 用户管理

#### GET /api/users

| 项 | 值 |
|----|-----|
| 说明 | 用户列表（分页） |
| 认证 | 是 |

**查询参数：**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | integer | 否 | 1 | 页码，从 1 起 |
| pageSize | integer | 否 | 20 | 每页条数，<= 100 |

**响应 data：** 见「4.6 公共数据模型 -> PaginatedResponse<UserResponse>」

#### GET /api/users/{id}

| 项 | 值 |
|----|-----|
| 说明 | 用户详情 |
| 认证 | 是 |

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 用户 ID |

**响应 data：** 见「4.6 公共数据模型 -> UserResponse」

**可能错误码：** `-1004`（用户不存在）

#### PUT /api/users/{id}

| 项 | 值 |
|----|-----|
| 说明 | 更新用户 |
| 认证 | 是 |

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 用户 ID |

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称 |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| avatar | string | 否 | 头像 URL |
| status | integer | 否 | 状态：1 正常，0 禁用 |

**响应 data：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 用户 ID |

**可能错误码：** `-1001`（参数校验失败）、`-1004`（用户不存在）

#### DELETE /api/users/{id}

| 项 | 值 |
|----|-----|
| 说明 | 删除用户（软删除） |
| 认证 | 是 |

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 用户 ID |

**响应 data：** `null`

**可能错误码：** `-1004`（用户不存在）

### 4.4 SSE 流式

#### GET /api/sse/chat

| 项 | 值 |
|----|-----|
| 说明 | SSE 聊天示例 |
| 认证 | 是 |

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 否 | 用户消息 |

**响应头：**

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**事件格式：**

```
event: message
data: {"content": "hello", "ts": 1692600000000}

event: done
data: {"done": true}
```

### 4.5 文件上传

#### POST /api/upload

| 项 | 值 |
|----|-----|
| 说明 | 单文件上传 |
| 认证 | 是 |

**请求头：** `Authorization: Bearer {access_token}`

**请求体：** `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 上传文件 |

**响应 data：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filename | string | 是 | 文件名 |
| url | string | 是 | 访问 URL |
| size | integer | 是 | 文件大小（字节） |

**可能错误码：** `-1031`（文件过大）、`-1032`（不支持的文件类型）

#### POST /api/uploads

| 项 | 值 |
|----|-----|
| 说明 | 多文件上传 |
| 认证 | 是 |

**请求头：** `Authorization: Bearer {access_token}`

**请求体：** `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | file[] | 是 | 上传文件（多个） |

**响应 data：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | array | 是 | 文件列表 |

**files 元素：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filename | string | 是 | 文件名 |
| url | string | 是 | 访问 URL |
| size | integer | 是 | 文件大小（字节） |

**可能错误码：** `-1031`（文件过大）、`-1032`（不支持的文件类型）

### 4.6 公共数据模型

#### UserResponse

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 用户 ID |
| username | string | 是 | 用户名 |
| nickname | string | 否 | 昵称 |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| avatar | string | 否 | 头像 URL |
| status | integer | 是 | 状态：1 正常，0 禁用 |
| created_at | string | 是 | 创建时间（ISO 8601） |
| updated_at | string | 是 | 更新时间（ISO 8601） |

#### PaginatedResponse<T>

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| list | array | 是 | 数据列表 |
| total | integer | 是 | 总数 |
| page | integer | 是 | 当前页码 |
| page_size | integer | 是 | 每页条数 |
