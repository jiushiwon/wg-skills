# {{PROJECT_NAME}} 接口契约

> 本文件由 init-skill 生成，遵循 `backend/shared/` 公共规范。前端 `frontend-request-skill` 按此契约消费接口。

## 1. 基础信息

| 项 | 值 |
|----|-----|
| Base URL（dev） | `http://localhost:{{APP_PORT}}/api` |
| API Prefix | `/api` |
| 鉴权方式 | `Authorization: Bearer {access_token}` |
| Content-Type | `application/json`（文件上传用 `multipart/form-data`） |
| 字符编码 | UTF-8 |
| 时区 | UTC，时间字段格式 ISO 8601（如 `2026-07-10T08:00:00Z`） |
| 公共规则版本 | 填写本项目采用的 `backend/shared/` 规范版本或提交标识 |

## 2. 统一响应格式

> 遵循 [shared/response-envelope-spec.md](response-envelope-spec.md)

本项目不在此重复定义响应字段；接口清单中的每个响应数据模型均位于公共信封的 `data` 内。

## 3. 全局错误码

> 遵循 [shared/error-code-spec.md](error-code-spec.md)

本项目只在“接口清单”中标注可能出现的错误码；错误码含义与 HTTP 映射以公共规范为准。模块扩展错误码记录在对应 `api-contract-<module>.md`。

## 4. JWT 鉴权

> 遵循 [shared/jwt-auth-spec.md](jwt-auth-spec.md)

项目若有额外认证端点或设备策略，在接口清单中补充；不得改写公共 JWT 格式和刷新规则。

## 5. 分页

> 遵循 [shared/pagination-spec.md](pagination-spec.md)

项目可在接口清单中标注哪些端点支持分页；不得自行改变公共参数和响应结构。

## 6. 接口清单

> 以下为 init-skill 生成的基础接口。各 module-skill 通过 `api-contract-<module>.md` 追加接口。

### 6.1 健康检查

#### GET /api/health

无需鉴权。

**响应 data：**

| 字段 | 类型 | 说明 |
|------|------|------|
| status | string | 固定 `ok` |
| service | string | 项目名称 |

### 6.2 认证

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

**可能错误码：** `-1001`（参数校验）、`-1005`（用户名已存在）

#### POST /api/auth/login

无需鉴权。请求 `{ username, password }`，响应同 register。

**可能错误码：** `-1002`（用户名或密码错误）

#### POST /api/auth/refresh

无需鉴权。请求 `{ refreshToken }`，响应同 register。

**可能错误码：** `-1002`（refreshToken 无效）

#### POST /api/auth/logout

需鉴权。无业务逻辑（JWT 无状态），客户端清除 token。

#### GET /api/auth/me

需鉴权。响应 data 为当前用户信息对象。

### 6.3 文件上传

#### POST /api/upload

需鉴权。单文件上传，`multipart/form-data`，字段名 `file`。

**响应 data：**

| 字段 | 类型 | 说明 |
|------|------|------|
| url | string | 文件访问 URL |
| filename | string | 原始文件名 |
| size | integer | 文件大小（字节） |
| mimeType | string | MIME 类型 |

**可能错误码：** `-1031`（文件过大）、`-1032`（类型不支持）

#### POST /api/uploads

需鉴权。多文件上传，字段名 `files`。响应 data 为数组。

### 6.4 SSE 流式

#### GET /api/sse/chat

无需鉴权。`Content-Type: text/event-stream`。

## 7. 与前端联动

| 维度 | 后端 | 前端 |
|------|------|------|
| 响应信封 | 自动包装 `{ code, message, data }` | `request.ts` 按 `ApiResponse<T>` 解析 |
| 错误码 | 全局异常处理器 | `ERROR_CODE_MAP`（对齐 `error-code-spec.md`） |
| Token | `Authorization: Bearer` | 请求拦截器自动注入 |
| SSE | 流式输出 | EventSource / `enableChunked` |
| 上传 | `multipart/form-data` | `upload<T>(options)` |

## 8. 版本

接口契约版本：1.0.0（与项目版本同步）。
