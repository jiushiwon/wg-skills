# API 契约文档规范（前端强制对齐）

`api-contract.md` 是后端与前端对接的**唯一事实来源（Single Source of Truth）**。生成后端项目时必须同步生成此文件，前端开发**必须严格对齐**该契约，禁止自行推测接口、字段、枚举或错误码。

---

## 0. 强制规则（红线）

1. **唯一事实来源**：前端所有接口路径、请求参数、响应字段、枚举值、错误码均以 `api-contract.md` 为准。
2. **不可绕过**：前端不得硬编码任何未在契约中声明的字段、枚举或路径；后端未在契约中声明的字段视为不存在。
3. **变更同步**：后端接口变更必须先更新 `api-contract.md`，再通知前端；前端不得在未更新契约的情况下适配新字段。
4. **枚举强约束**：枚举字段的值集合是闭集，前端必须使用契约列出的枚举值，不得新增、不得修改文案。
5. **类型强约束**：字段类型（string / integer / boolean / array / object）必须与契约一致；前端不得隐式转换后上传（如把 number 当 string 上传）。
6. **必填强约束**：标为"必填"的字段前端必须上传且非空；标为"可选"的字段可以省略，但省略时不得传 `null`（除非契约明确允许）。
7. **响应信封强约束**：所有接口返回 `{ code, message, data }`，前端必须读取 `code` 判断业务状态，禁止使用 HTTP 状态码判断业务成功/失败。
8. **错误处理强约束**：前端必须按错误码表处理每种错误，未列出的错误码按"系统繁忙"兜底。

> 违反以上任意一条，视为前后端对接缺陷，必须在 code review 阶段拦截。

---

## 1. 文件位置与命名

- 位置：项目根目录 `api-contract.md`
- 命名：固定为 `api-contract.md`，不可改名
- 编码：UTF-8
- 语言：中文（字段名、枚举值、路径保持英文）

---

## 2. 文档结构（固定顺序）

```markdown
# {PROJECT_NAME} API Contract

## 1. 基础信息
## 2. 统一响应格式
## 3. 枚举字典
## 4. 接口清单
## 5. 数据模型
## 6. 错误码汇总
## 7. 变更记录
```

每一节均为必填，缺失视为契约不完整。

---

## 3. 基础信息（第 1 节）

必须包含：

| 项 | 说明 | 示例 |
|----|------|------|
| Base URL | 各环境的服务地址 | `http://localhost:8080`（dev） |
| API Prefix | 统一路径前缀 | `/api` |
| 鉴权方式 | Token 携带方式 | `Authorization: Bearer {token}` |
| Content-Type | 默认请求体类型 | `application/json` |
| 字符编码 | 默认编码 | `UTF-8` |
| 时区 | 时间字段时区 | `UTC`，ISO 8601 |
| 分页默认值 | 默认 page / pageSize | `page=1, pageSize=20` |
| 最大分页 | pageSize 上限 | `100` |

示例：

```markdown
## 1. 基础信息

- Base URL（dev）：http://localhost:8080
- Base URL（prod）：https://api.example.com
- API Prefix：/api
- 鉴权方式：Bearer Token（请求头 `Authorization: Bearer {token}`）
- Content-Type：application/json
- 字符编码：UTF-8
- 时区：UTC，时间字段格式 ISO 8601（如 `2026-07-10T08:00:00Z`）
- 分页默认值：page=1，pageSize=20
- 分页上限：pageSize ≤ 100
```

---

## 4. 统一响应格式（第 2 节）

所有接口必须返回如下信封：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

字段约束：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | integer | 是 | 业务状态码，`>= 0` 成功，`< 0` 失败 |
| message | string | 是 | 人类可读描述，前端用于 Toast/日志 |
| data | any | 是 | 业务数据，空时使用 `null`，不得省略 |

规则：

1. HTTP 状态码统一为 `200`，业务状态由 `code` 表达。
2. `data` 永远存在，无数据时为 `null`，不得为 `undefined`。
3. 分页接口的 `data` 必须是对象，包含 `page`、`pageSize`、`total`、`list` 四个字段。
4. 禁止在响应中返回堆栈、SQL、内部错误信息。

---

## 5. 枚举字典（第 3 节）

**所有枚举字段必须集中在此节声明**，接口中引用枚举时只写枚举名（如 `UserStatus`），前端从这里查值。

### 5.1 枚举声明格式

每个枚举必须包含：枚举名、字段类型、值列表（值 + 含义 + 前端展示文案）。

```markdown
### UserStatus（用户状态）

- 字段类型：string
- 默认值：`active`

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| active | 正常 | 正常 |
| inactive | 未激活 | 未激活 |
| locked | 已锁定 | 已锁定 |
| deleted | 已删除 | 已删除 |
```

### 5.2 枚举规则

1. **闭集**：枚举值是闭集，前端必须使用契约列出的值，不得新增。
2. **值稳定**：枚举值一旦发布，不得修改含义；新增枚举值必须在"变更记录"中标注。
3. **文案独立**：前端展示文案可以本地化，但枚举值本身不可变。
4. **整型枚举**：若使用整数枚举，必须明确每个整数的含义（如 `0=未知, 1=男, 2=女`），不得使用魔法数字。
5. **布尔字段**：能用布尔表达的不要用枚举（如 `is_active: true/false`）。

### 5.3 常见枚举示例

```markdown
### Gender（性别）

- 字段类型：string

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| unknown | 未知 | 保密 |
| male | 男 | 男 |
| female | 女 | 女 |

### OrderStatus（订单状态）

- 字段类型：string

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| pending | 待支付 | 待支付 |
| paid | 已支付 | 已支付 |
| shipped | 已发货 | 已发货 |
| completed | 已完成 | 已完成 |
| cancelled | 已取消 | 已取消 |
| refunded | 已退款 | 已退款 |

### Role（用户角色）

- 字段类型：string

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| user | 普通用户 | 用户 |
| admin | 管理员 | 管理员 |
| super_admin | 超级管理员 | 超管 |
```

---

## 6. 接口清单（第 4 节）

每个接口必须按下列模板完整描述，**任何字段不得省略**。

### 6.1 单接口模板

```markdown
#### {METHOD} {PATH}

**描述**：一句话说明接口用途。

**鉴权**：需要 / 不需要

**路径参数**：
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| id | integer | 是 | 用户 ID | 1 |

**查询参数**：
| 字段 | 类型 | 必填 | 默认值 | 说明 | 示例 |
|------|------|------|--------|------|------|
| page | integer | 否 | 1 | 页码，从 1 开始 | 1 |
| pageSize | integer | 否 | 20 | 每页条数，≤ 100 | 20 |
| status | string | 否 | - | 用户状态，枚举 UserStatus | active |

**请求体**（Content-Type: application/json）：
| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| username | string | 是 | 3-32 字符，字母数字下划线 | 用户名 | alice |
| password | string | 是 | 8-64 字符 | 密码（前端不得明文落盘） | ******** |
| email | string | 否 | 邮箱格式 | 邮箱 | alice@example.com |
| gender | string | 否 | 枚举 Gender | 性别 | male |

**请求示例**：
```json
{
  "username": "alice",
  "password": "12345678",
  "email": "alice@example.com",
  "gender": "female"
}
```

**响应 data 结构**：
| 字段 | 类型 | 必填 | 说明 | 枚举/引用 |
|------|------|------|------|-----------|
| id | integer | 是 | 用户 ID | - |
| username | string | 是 | 用户名 | - |
| email | string | 否 | 邮箱 | - |
| status | string | 是 | 用户状态 | UserStatus |
| gender | string | 是 | 性别 | Gender |
| createdAt | string | 是 | 创建时间，ISO 8601 | - |
| updatedAt | string | 是 | 更新时间，ISO 8601 | - |

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "status": "active",
    "gender": "female",
    "createdAt": "2026-07-10T08:00:00Z",
    "updatedAt": "2026-07-10T08:00:00Z"
  }
}
```

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败 | 显示 message 并定位字段 |
| -1002 | 未登录或 Token 失效 | 跳转登录页 |
| -1005 | 用户名已存在 | 提示用户更换 |
```

### 6.2 字段约束细则

1. **类型**：仅允许 `string`、`integer`、`number`、`boolean`、`object`、`array`、`null`。
2. **必填**：标"是"的字段前端必须上传；标"否"的字段可省略，但禁止传 `null`（除非明确允许）。
3. **校验规则**：必须写明长度、范围、格式、正则或枚举引用，前端按此规则做客户端校验。
4. **默认值**：可选字段如有默认值，必须写明，便于前端初始化表单。
5. **示例**：每个字段必须给示例值，前端 mock 与单元测试以示例为基准。
6. **数组字段**：必须声明元素类型（如 `array<integer>`、`array<object>`），对象数组需在"数据模型"节展开结构。
7. **嵌套对象**：超过一层嵌套的对象必须在"数据模型"节单独定义，接口中只写引用名。

### 6.3 文件上传接口

文件上传接口必须额外声明：

```markdown
**Content-Type**：multipart/form-data

**表单字段**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 文件，最大 10MB，支持 jpg/png/pdf |
| category | string | 否 | 文件分类，枚举 FileCategory |

**响应 data 结构**：
| 字段 | 类型 | 说明 |
|------|------|------|
| url | string | 文件访问 URL |
| size | integer | 文件大小（字节） |
| mimeType | string | 文件 MIME 类型 |
```

---

## 7. 数据模型（第 5 节）

所有接口共用的实体对象在此节统一定义，接口中通过引用名使用，避免重复声明。

```markdown
### User

| 字段 | 类型 | 必填 | 说明 | 枚举/引用 |
|------|------|------|------|-----------|
| id | integer | 是 | 主键 | - |
| username | string | 是 | 用户名，唯一 | - |
| email | string | 否 | 邮箱 | - |
| phone | string | 否 | 手机号，E.164 | - |
| status | string | 是 | 用户状态 | UserStatus |
| gender | string | 是 | 性别 | Gender |
| role | string | 是 | 角色 | Role |
| avatar | string | 否 | 头像 URL | - |
| createdAt | string | 是 | 创建时间，ISO 8601 | - |
| updatedAt | string | 是 | 更新时间，ISO 8601 | - |
```

规则：

1. 字段名统一 `snake_case`（后端）与 `camelCase`（前端）的映射由前端序列化层处理，契约中默认使用 `camelCase`。
2. 时间字段统一 `createdAt` / `updatedAt`，格式 ISO 8601，时区 UTC。
3. 主键统一 `id`，类型 integer 或 string（UUID）。
4. 软删除字段统一 `deletedAt`，未删除时为 `null`。

---

## 8. 错误码汇总（第 6 节）

错误码是闭集，前端必须按此处理。**唯一事实来源为 [response-format.md](response-format.md) 的"状态码规则"表，本规范不另列码表。** 生成 `api-contract.md` 时，把该表原样嵌入契约的"错误码汇总"节（如下方完整示例所示），并补充每码的"前端处理"列（由具体项目定）。

规则：

1. 错误码一旦发布不得修改含义。
2. 新增/调整错误码必须先改 [response-format.md](response-format.md)，再同步到本契约并通知前端，禁止在契约里单独增删。
3. 前端遇到未列出的错误码，按 `-2000` 兜底处理。

---

## 9. 变更记录（第 7 节）

每次契约变更必须追加一条记录，格式：

```markdown
| 日期 | 版本 | 变更内容 | 影响前端 | 作者 |
|------|------|----------|----------|------|
| 2026-07-10 | v1.0.0 | 初始版本 | - | backend |
| 2026-07-15 | v1.1.0 | 新增 OrderStatus.refunded 枚举 | 是 | backend |
```

规则：

1. 变更不得删除已发布字段，只能标记为"废弃（deprecated）"并保留至少一个版本周期。
2. 新增枚举值、新增可选字段属于"向后兼容"变更；删除字段、修改类型、修改枚举含义属于"破坏性"变更，必须升级主版本号并通知前端。

---

## 10. 完整示例（最小可用契约）

```markdown
# demo API Contract

## 1. 基础信息

- Base URL（dev）：http://localhost:8080
- API Prefix：/api
- 鉴权方式：Bearer Token
- Content-Type：application/json
- 时区：UTC，时间字段 ISO 8601
- 分页默认值：page=1，pageSize=20（上限 100）

## 2. 统一响应格式

```json
{ "code": 0, "message": "success", "data": {} }
```

## 3. 枚举字典

### UserStatus
- 字段类型：string

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| active | 正常 | 正常 |
| inactive | 未激活 | 未激活 |
| locked | 已锁定 | 已锁定 |

### Gender
- 字段类型：string

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| unknown | 未知 | 保密 |
| male | 男 | 男 |
| female | 女 | 女 |

## 4. 接口清单

### Auth

#### POST /api/auth/register

**描述**：用户注册。

**鉴权**：不需要

**请求体**：
| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| username | string | 是 | 3-32 字符，字母数字下划线 | 用户名 | alice |
| password | string | 是 | 8-64 字符 | 密码 | ******** |
| gender | string | 否 | 枚举 Gender | 性别 | female |

**请求示例**：
```json
{ "username": "alice", "password": "12345678", "gender": "female" }
```

**响应 data 结构**：
| 字段 | 类型 | 必填 | 说明 | 枚举/引用 |
|------|------|------|------|-----------|
| id | integer | 是 | 用户 ID | - |
| username | string | 是 | 用户名 | - |
| status | string | 是 | 用户状态 | UserStatus |
| gender | string | 是 | 性别 | Gender |

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "alice",
    "status": "active",
    "gender": "female"
  }
}
```

**可能错误码**：
| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败 | 显示 message |
| -1005 | 用户名已存在 | 提示更换 |

#### POST /api/auth/login

**描述**：用户登录，返回 Token。

**鉴权**：不需要

**请求体**：
| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| username | string | 是 | 非空 | 用户名 |
| password | string | 是 | 非空 | 密码 |

**响应 data 结构**：
| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | JWT，前端写入 storage，后续请求自动携带 |
| expiresIn | integer | 过期秒数 |
| user | User | 用户信息，引用数据模型 User |

**可能错误码**：
| 错误码 | 触发条件 |
|--------|----------|
| -1001 | 参数缺失 |
| -1002 | 用户名或密码错误 |

### Users

#### GET /api/users

**描述**：查询用户列表（分页）。

**鉴权**：需要

**查询参数**：
| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | integer | 否 | 1 | 页码 |
| pageSize | integer | 否 | 20 | 每页条数，≤ 100 |
| status | string | 否 | - | 用户状态，枚举 UserStatus |
| keyword | string | 否 | - | 用户名模糊搜索，≤ 64 字符 |

**响应 data 结构**：
| 字段 | 类型 | 说明 |
|------|------|------|
| page | integer | 当前页码 |
| pageSize | integer | 每页条数 |
| total | integer | 总条数 |
| list | array<User> | 用户列表，元素引用数据模型 User |

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
      {
        "id": 1,
        "username": "alice",
        "status": "active",
        "gender": "female"
      }
    ]
  }
}
```

**可能错误码**：
| 错误码 | 触发条件 |
|--------|----------|
| -1001 | pageSize 超出上限 |
| -1002 | 未登录 |

#### GET /api/users/{id}

**描述**：根据 ID 查询用户。

**鉴权**：需要

**路径参数**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 用户 ID |

**响应 data 结构**：引用数据模型 User。

**可能错误码**：
| 错误码 | 触发条件 |
|--------|----------|
| -1004 | 用户不存在 |
| -1002 | 未登录 |

## 5. 数据模型

### User

| 字段 | 类型 | 必填 | 说明 | 枚举/引用 |
|------|------|------|------|-----------|
| id | integer | 是 | 主键 | - |
| username | string | 是 | 用户名 | - |
| email | string | 否 | 邮箱 | - |
| phone | string | 否 | 手机号 | - |
| status | string | 是 | 用户状态 | UserStatus |
| gender | string | 是 | 性别 | Gender |
| avatar | string | 否 | 头像 URL | - |
| createdAt | string | 是 | 创建时间，ISO 8601 | - |
| updatedAt | string | 是 | 更新时间，ISO 8601 | - |

## 6. 错误码汇总

| 错误码 | 含义 | 前端处理 |
|--------|------|----------|
| 0 | 成功 | 正常处理 data |
| -1 | 通用失败 | 显示 message |
| -1001 | 参数校验错误 | 显示 message，定位字段 |
| -1002 | 未授权 | 跳转登录页 |
| -1003 | 无权限 | 提示无权限 |
| -1004 | 资源不存在 | 显示 404 |
| -1005 | 资源冲突 | 提示重复 |
| -1006 | 频率限制 | 提示稍后重试 |
| -2000 | 内部服务器错误 | 显示系统繁忙 |

## 7. 变更记录

| 日期 | 版本 | 变更内容 | 影响前端 | 作者 |
|------|------|----------|----------|------|
| 2026-07-10 | v1.0.0 | 初始版本 | - | backend |
```

---

## 11. 前端对接检查清单

前端在对接每个接口前必须确认：

- [ ] 路径、方法、Content-Type 与契约完全一致
- [ ] 请求参数（路径/查询/body）的字段名、类型、必填与契约一致
- [ ] 枚举值来自契约"枚举字典"节，未新增、未改写
- [ ] 响应解析读取 `code` 判断业务状态，未使用 HTTP 状态码
- [ ] 已处理契约列出的所有错误码，未列出的按 `-2000` 兜底
- [ ] 时间字段按 ISO 8601 + UTC 处理，展示时转本地时区
- [ ] 分页接口读取 `page/pageSize/total/list` 四个字段
- [ ] 文件上传使用 `multipart/form-data`，字段名与契约一致
- [ ] Token 写入 storage，后续请求自动携带 `Authorization` 头
- [ ] 未在契约中声明的字段一律不访问、不展示

---

## 12. 维护责任

| 角色 | 责任 |
|------|------|
| 后端 | 接口变更前先更新契约；保证实现与契约一致；通知前端破坏性变更 |
| 前端 | 严格按契约对接；发现实现与契约不一致时以契约为准，反馈后端修复 |
| Code Review | 拦截任何与契约不一致的代码（字段、枚举、错误码） |

**当实现与契约冲突时，以契约为准，后端修改实现，前端不得绕过。**
