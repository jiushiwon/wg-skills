# 默认接口契约模板（api-contract.md 起点）

生成后端项目时，以本文件为起点生成项目根目录的 `api-contract.md`：

1. 保留第 1~3、5~7 节骨架（按项目实际值替换 `{{...}}`）。
2. 第 4 节先内置骨架自带的 **health / auth / users** 接口（本文件已写全），再把 `spec.md` 中确认的业务实体接口按同一模板逐个追加。
3. 格式规则（字段必填、枚举闭集、变更记录等）遵循 `api-contract-spec.md`，本文件是规范的最小可用落地。

---

```markdown
# {{PROJECT_NAME}} API Contract

## 1. 基础信息

- Base URL（dev）：http://localhost:{{APP_PORT}}
- Base URL（prod）：{{PROD_BASE_URL}}
- API Prefix：/api
- 鉴权方式：Bearer Token（请求头 `Authorization: Bearer {token}`）
- Content-Type：application/json（文件上传用 multipart/form-data）
- 字符编码：UTF-8
- 时区：UTC，时间字段格式 ISO 8601（如 `2026-07-10T08:00:00Z`）
- 分页默认值：page=1，pageSize=20；分页上限：pageSize ≤ 100

## 2. 统一响应格式

```json
{ "code": 0, "message": "success", "data": {} }
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | integer | 是 | 业务状态码，`>= 0` 成功，`< 0` 失败 |
| message | string | 是 | 人类可读描述 |
| data | any | 是 | 业务数据，空时为 `null`，不得省略 |

- HTTP 状态码统一 200（仅 404/405/500 例外），业务状态由 `code` 表达。
- 分页接口的 `data` 必含 `page`、`pageSize`、`total`、`list` 四个字段。
- 响应中禁止返回堆栈、SQL、内部错误信息。

## 3. 枚举字典

### UserStatus（用户状态）

- 字段类型：string
- 默认值：`active`

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| active | 正常 | 正常 |
| inactive | 未激活 | 未激活 |
| locked | 已锁定 | 已锁定 |

### Gender（性别）

- 字段类型：string
- 默认值：`unknown`

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| unknown | 未知 | 保密 |
| male | 男 | 男 |
| female | 女 | 女 |

### Role（用户角色）

- 字段类型：string
- 默认值：`user`

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| user | 普通用户 | 用户 |
| admin | 管理员 | 管理员 |

> 枚举值是闭集：前端必须使用以上值，不得新增、不得修改文案。新增枚举值必须先在「变更记录」登记并通知前端。

## 4. 接口清单

### Health

#### GET /api/health

**描述**：服务健康检查，用于探活与部署后自检。

**鉴权**：不需要

**响应 data 结构**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 固定 `ok` |

**响应示例**：
```json
{ "code": 0, "message": "success", "data": { "status": "ok" } }
```

### Auth

#### POST /api/auth/register

**描述**：用户注册。

**鉴权**：不需要

**请求体**（Content-Type: application/json）：
| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| username | string | 是 | 3-32 字符，字母数字下划线 | 用户名，唯一 | alice |
| password | string | 是 | 8-64 字符 | 密码（前端不得明文落盘） | ******** |
| email | string | 否 | 邮箱格式 | 邮箱 | alice@example.com |
| gender | string | 否 | 枚举 Gender | 性别 | female |

**请求示例**：
```json
{ "username": "alice", "password": "12345678", "email": "alice@example.com", "gender": "female" }
```

**响应 data 结构**：
| 字段 | 类型 | 必填 | 说明 | 枚举/引用 |
|------|------|------|------|-----------|
| id | integer | 是 | 用户 ID | - |
| username | string | 是 | 用户名 | - |
| status | string | 是 | 用户状态 | UserStatus |

**响应示例**：
```json
{ "code": 0, "message": "success", "data": { "id": 1, "username": "alice", "status": "active" } }
```

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败 | 显示 message 并定位字段 |
| -1005 | 用户名已存在 | 提示用户更换用户名 |

#### POST /api/auth/login

**描述**：用户登录，返回 Token 与用户信息。

**鉴权**：不需要

**请求体**：
| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| username | string | 是 | 非空 | 用户名 | alice |
| password | string | 是 | 非空 | 密码 | ******** |

**请求示例**：
```json
{ "username": "alice", "password": "12345678" }
```

**响应 data 结构**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | JWT，前端写入 storage，后续请求在拦截器统一携带 |
| expiresIn | integer | 是 | 过期秒数（默认 86400） |
| user | object | 是 | 用户信息，引用数据模型 User |

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "user": { "id": 1, "username": "alice", "status": "active", "gender": "female", "role": "user", "createdAt": "2026-07-10T08:00:00Z", "updatedAt": "2026-07-10T08:00:00Z" }
  }
}
```

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数缺失 | 提示填写用户名密码 |
| -1002 | 用户名或密码错误 | 提示账号或密码错误 |

### Users

#### GET /api/users

**描述**：查询用户列表（分页）。

**鉴权**：需要

**查询参数**：
| 字段 | 类型 | 必填 | 默认值 | 说明 | 示例 |
|------|------|------|--------|------|------|
| page | integer | 否 | 1 | 页码，从 1 开始 | 1 |
| pageSize | integer | 否 | 20 | 每页条数，≤ 100 | 20 |
| status | string | 否 | - | 用户状态，枚举 UserStatus | active |
| keyword | string | 否 | - | 用户名模糊搜索，≤ 64 字符 | ali |

**响应 data 结构**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 是 | 当前页码 |
| pageSize | integer | 是 | 每页条数 |
| total | integer | 是 | 总条数 |
| list | array<User> | 是 | 用户列表，元素引用数据模型 User |

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "list": [
      { "id": 1, "username": "alice", "email": "alice@example.com", "status": "active", "gender": "female", "role": "user", "createdAt": "2026-07-10T08:00:00Z", "updatedAt": "2026-07-10T08:00:00Z" }
    ]
  }
}
```

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1002 | 未登录或 Token 失效 | 跳转登录页 |

#### GET /api/users/{id}

**描述**：根据 ID 查询用户详情。

**鉴权**：需要

**路径参数**：
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| id | integer | 是 | 用户 ID | 1 |

**响应 data 结构**：引用数据模型 User。

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1004 | 用户不存在 | 展示空态 |
| -1002 | 未登录 | 跳转登录页 |

#### POST /api/users

**描述**：新建用户（管理后台）。

**鉴权**：需要（admin）

**请求体**：同「POST /api/auth/register」，额外支持：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| role | string | 否 | 枚举 Role | 角色，默认 user | admin |

**响应 data 结构**：引用数据模型 User。

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败 | 显示 message 并定位字段 |
| -1003 | 非管理员 | 提示无权限 |
| -1005 | 用户名已存在 | 提示更换 |

#### PUT /api/users/{id}

**描述**：全量更新用户信息。

**鉴权**：需要

**路径参数**：
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| id | integer | 是 | 用户 ID | 1 |

**请求体**：
| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| email | string | 否 | 邮箱格式 | 邮箱 | alice@example.com |
| gender | string | 否 | 枚举 Gender | 性别 | male |
| status | string | 否 | 枚举 UserStatus | 状态（仅 admin） | locked |

**响应 data 结构**：引用数据模型 User。

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败 | 显示 message |
| -1004 | 用户不存在 | 展示空态 |

#### DELETE /api/users/{id}

**描述**：删除用户（软删除）。

**鉴权**：需要（admin）

**路径参数**：
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| id | integer | 是 | 用户 ID | 1 |

**响应 data 结构**：`null`。

**响应示例**：
```json
{ "code": 0, "message": "success", "data": null }
```

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1003 | 非管理员 | 提示无权限 |
| -1004 | 用户不存在 | 展示空态 |

<!-- 业务实体接口从此处追加，每个接口按 api-contract-spec.md 第 6.1 节模板写全：

#### {METHOD} {PATH}
**描述** / **鉴权** / **路径参数** / **查询参数** / **请求体** / **请求示例** / **响应 data 结构** / **响应示例** / **可能错误码**
-->

## 5. 数据模型

### User

| 字段 | 类型 | 必填 | 说明 | 枚举/引用 |
|------|------|------|------|-----------|
| id | integer | 是 | 主键 | - |
| username | string | 是 | 用户名，唯一 | - |
| email | string | 否 | 邮箱 | - |
| status | string | 是 | 用户状态 | UserStatus |
| gender | string | 是 | 性别 | Gender |
| role | string | 是 | 角色 | Role |
| createdAt | string | 是 | 创建时间，ISO 8601 | - |
| updatedAt | string | 是 | 更新时间，ISO 8601 | - |

规则：
1. 契约字段默认 camelCase；后端存储 snake_case，由序列化层映射。
2. 时间字段统一 `createdAt` / `updatedAt`，ISO 8601 + UTC。
3. 软删除字段 `deletedAt`，未删除为 `null`，默认不出现在响应中。

## 6. 错误码汇总

| 错误码 | 含义 | 前端处理 |
|--------|------|----------|
| 0 | 成功 | 正常处理 data |
| -1 | 通用失败 | 显示 message |
| -1001 | 参数校验错误 | 显示 message，定位字段 |
| -1002 | 未授权 | 清 token，跳转登录页 |
| -1003 | 无权限 | 提示无权限 |
| -1004 | 资源不存在 | 展示空态/404 |
| -1005 | 资源冲突 | 提示重复操作 |
| -1006 | 频率限制 | 提示稍后重试 |
| -2000 | 内部服务器错误 | 提示系统繁忙 |

> 未列出的错误码按 `-2000` 兜底。错误码含义一经发布不得修改。

## 7. 变更记录

| 日期 | 版本 | 变更内容 | 影响前端 | 作者 |
|------|------|----------|----------|------|
| {{DATE}} | v1.0.0 | 初始版本 | - | backend |
```

---

## 追加业务接口时的检查项

- [ ] 每个接口都按模板写全：描述/鉴权/参数表/请求示例/响应结构/响应示例/错误码
- [ ] 新枚举先登记到第 3 节，接口里只引用枚举名
- [ ] 嵌套超过一层的对象在第 5 节建数据模型，接口里只写引用名
- [ ] 变更在第 7 节追加记录；破坏性变更升主版本号并通知前端
