# API Contract - Auth Module

> 本接口契约与 `fastapi-auth-module-skill` 完全对齐，确保前端一套 API 可同时对接 Java 和 Python 后端。
>
> ## ⚠️ 本文件修正的三处历史错误
>
> | # | 错误 | 修正 |
> |---|------|------|
> | 1 | 全篇字段名用 **snake_case**（`access_token` / `page_size` / `menu_type` / `data_scope` / `menu_ids` / `created_at`） | 统一 **camelCase**（`accessToken` / `pageSize` / `menuType` / `dataScope` / `menuIds` / `createdAt`） |
> | 2 | 错误码写 `400/401/403/404/500` | 对齐 `springboot-init-skill` 的负数表：`-1001/-1002/-1003/-1004/-1005/-2000` |
> | 3 | `menu_type` 注释写 `M=菜单 C=目录` | 正确是 **`M`=目录 / `C`=菜单 / `F`=按钮**（兼容读取 `B`=按钮） |
>
> 另新增：方法级鉴权要求、回填接口、三段式权限码全量表。

---

## 响应信封格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | `0` 成功；非 0 失败（见下方错误码表） |
| message | string | 提示信息 |
| data | object | 响应数据 |

### 错误码表

| 错误码 | HTTP | 说明 |
|--------|------|------|
| `0` | 200 | 成功 |
| `-1001` | 400 | 参数校验失败 / 用户名密码错 |
| `-1002` | 401 | 未登录 / token 失效 |
| `-1003` | 403 | 无权限 |
| `-1004` | 404 | 资源不存在 |
| `-1005` | 409 | 资源冲突（数据已存在 / 存在依赖） |
| `-2000` | 500 | 系统异常 |

### 通用约定

- **字段命名一律 camelCase**，不使用下划线。
- **分页信封**：`{ list, total, page, pageSize }`（`page` 从 1 开始）。
  > 字段名 **`list`**，与 `springboot-init-skill` 的 `PageResponse.list`、`frontend-request-skill/references/api-contract.md` §4.3 一致。写成 `items` / `records` 都是错的。
- **入参出参一律 DTO**，禁止实体直出。
- **删除一律软删除**（`deletedAt`）。
- 除 `/api/auth/login`、`/api/auth/refresh`、`/api/health`、Swagger 外，**所有端点要求登录**。

---

## 权限标识规范

**三段式 `模块:资源:动作`**，全小写。

**页面权限与列表接口权限共用同一码**。例如"用户管理"页面的路由权限与 `GET /api/users` 都是 `system:user:list`。

> ⚠️ 历史上路由写 `user:view`、接口写 `user:list`，导致非超管角色**看不到任何菜单**。页面与 list 必须同码。

### 权限码全量表（前后端必须逐字一致）

| 模块 | 资源 | 动作 | 权限码 |
|------|------|------|--------|
| system | user | list | `system:user:list` |
| system | user | create | `system:user:create` |
| system | user | edit | `system:user:edit` |
| system | user | delete | `system:user:delete` |
| system | user | reset-pwd | `system:user:reset-pwd` |
| system | user | assign-role | `system:user:assign-role` |
| system | user | assign-post | `system:user:assign-post` |
| system | role | list | `system:role:list` |
| system | role | create | `system:role:create` |
| system | role | edit | `system:role:edit` |
| system | role | delete | `system:role:delete` |
| system | role | assign-menu | `system:role:assign-menu` |
| system | menu | list | `system:menu:list` |
| system | menu | create | `system:menu:create` |
| system | menu | edit | `system:menu:edit` |
| system | menu | delete | `system:menu:delete` |
| system | org | list | `system:org:list` |
| system | org | create | `system:org:create` |
| system | org | edit | `system:org:edit` |
| system | org | delete | `system:org:delete` |
| system | post | list | `system:post:list` |
| system | post | create | `system:post:create` |
| system | post | edit | `system:post:edit` |
| system | post | delete | `system:post:delete` |
| system | tenant | list | `system:tenant:list` |
| system | tenant | create | `system:tenant:create` |
| system | tenant | edit | `system:tenant:edit` |
| system | tenant | delete | `system:tenant:delete` |
| system | app | list | `system:app:list` |
| system | app | create | `system:app:create` |
| system | app | edit | `system:app:edit` |
| system | app | delete | `system:app:delete` |
| system | app | key-manage | `system:app:key-manage` |
| account | bind | list | `account:bind:list` |
| account | bind | create | `account:bind:create` |
| account | bind | delete | `account:bind:delete` |
| account | bind | set-default | `account:bind:set-default` |
| dashboard | home | view | `dashboard:home:view` |
| example | product | list | `example:product:list` |
| example | product | create | `example:product:create` |
| example | product | edit | `example:product:edit` |
| example | product | delete | `example:product:delete` |

> **后端实现要求**：每个受控端点必须有 `@PreAuthorize("hasAuthority('...')")`，
> 且 `SecurityConfig` 必须开启 `@EnableMethodSecurity`；`JwtAuthenticationFilter` 必须把
> 用户真实权限装进 `SecurityContext`（只装 `ROLE_USER` 会导致全量 403）。
>
> 详见 `references/skeleton.md` §6 / §7 / §10。

---

## 认证接口

### 登录

```
POST /api/auth/login
```

**认证**：无需登录

**请求体**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| accessToken | string | 访问令牌 |
| refreshToken | string | 刷新令牌 |
| tokenType | string | 固定 `Bearer` |
| expiresIn | int | 访问令牌有效期（秒） |

### 刷新令牌

```
POST /api/auth/refresh
```

**认证**：无需登录

**请求体**

```json
{ "refreshToken": "eyJ..." }
```

### 登出

```
POST /api/auth/logout
```

**认证**：需登录

**响应**

```json
{ "code": 0, "message": "success", "data": null }
```

> 无状态 JWT：服务端不维护会话，前端清除 token 即视为登出。

### 获取当前用户

```
GET /api/auth/me
```

**认证**：需登录

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "超级管理员",
    "email": "admin@example.com",
    "phone": "13800000001",
    "avatar": null,
    "tenantId": 1,
    "orgId": 1,
    "status": 1,
    "roles": ["super_admin"],
    "permissions": ["system:user:list", "system:user:create", "dashboard:home:view"]
  }
}
```

### 修改密码

```
PUT /api/auth/password
```

**认证**：需登录

**请求体**

```json
{
  "oldPassword": "admin123",
  "newPassword": "newPass123"
}
```

### 获取当前用户菜单树

```
GET /api/auth/menus
```

**认证**：需登录

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 2,
      "parentId": null,
      "name": "系统管理",
      "path": "/system",
      "component": "Layout",
      "menuType": "M",
      "icon": "settings",
      "permission": null,
      "sortOrder": 1,
      "visible": 1,
      "status": 1,
      "children": [
        {
          "id": 5,
          "parentId": 2,
          "name": "用户管理",
          "path": "/system/user",
          "component": "system/user/index",
          "menuType": "C",
          "icon": "users",
          "permission": "system:user:list",
          "sortOrder": 1,
          "visible": 1,
          "status": 1,
          "children": [
            {
              "id": 11,
              "parentId": 5,
              "name": "新增用户",
              "path": null,
              "component": null,
              "menuType": "F",
              "icon": null,
              "permission": "system:user:create",
              "sortOrder": 1,
              "visible": 1,
              "status": 1,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 菜单 ID |
| parentId | long \| null | 父菜单 ID，顶级为 `null` |
| name | string | 菜单名称 |
| path | string \| null | 路由路径 |
| component | string \| null | 组件路径 |
| menuType | string | **`M`=目录 / `C`=菜单 / `F`=按钮** |
| icon | string \| null | 图标名（**不是** emoji，见「图标约定」） |
| permission | string \| null | 权限标识（三段式） |
| sortOrder | int | 排序 |
| visible | int | 是否显示：`0` 隐藏 / `1` 显示 |
| status | int | 状态：`0` 禁用 / `1` 启用 |
| children | array | 子菜单 |

**图标约定**：`icon` 存**图标名**（如 `users` / `settings` / `building`），由前端 `BaseIcon` 映射到具体图形。**禁止在 DB 存 emoji**。

---

## 用户管理

### 用户列表

```
GET /api/users?page=1&pageSize=10&username=adm&status=1
```

**认证**：需登录 ｜ **权限**：`system:user:list` ｜ **数据权限**：按当前用户 dataScope 自动过滤

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码，默认 1 |
| pageSize | int | 每页条数，默认 10 |
| username | string | 用户名（模糊） |
| status | int | 状态筛选 |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "nickname": "超级管理员",
        "email": "admin@example.com",
        "phone": "13800000001",
        "avatar": null,
        "orgId": 1,
        "orgName": "总公司",
        "status": 1,
        "createdAt": "2026-09-28 10:00:00"
      }
    ],
    "total": 3,
    "page": 1,
    "pageSize": 10
  }
}
```

> ⚠️ `UserVO` **不含** `password`；列表项**不含** `roles` / `posts`（需要时用回填接口，见下）。

### 用户详情

```
GET /api/users/{id}
```

**认证**：需登录 ｜ **权限**：`system:user:list`

响应体在列表项基础上增加 `updatedAt`、`roles`、`posts`：

```json
{
  "code": 0, "message": "success",
  "data": {
    "id": 1, "username": "admin", "nickname": "超级管理员",
    "email": "admin@example.com", "phone": "13800000001", "avatar": null,
    "orgId": 1, "orgName": "总公司", "status": 1,
    "createdAt": "2026-09-28 10:00:00", "updatedAt": "2026-09-28 10:00:00",
    "roles": [{ "id": 1, "name": "超级管理员", "code": "super_admin" }],
    "posts": [{ "id": 1, "name": "技术总监", "code": "tech_leader" }]
  }
}
```

### 创建用户

```
POST /api/users
```

**认证**：需登录 ｜ **权限**：`system:user:create`

**请求体**

```json
{
  "username": "newuser",
  "password": "user123456",
  "nickname": "新用户",
  "email": "newuser@example.com",
  "phone": "13900139000",
  "orgId": 2,
  "roleIds": [3],
  "postIds": [3],
  "status": 1
}
```

**响应**：返回 `UserVO`（**不是** `{ id }`）

### 更新用户

```
PUT /api/users/{id}
```

**认证**：需登录 ｜ **权限**：`system:user:edit`

**请求体**

```json
{
  "nickname": "修改昵称",
  "email": "newmail@example.com",
  "phone": "13900139001",
  "orgId": 2,
  "status": 1
}
```

> `roleIds` / `postIds` **不在此接口处理**，走下面的分配接口。

### 删除用户

```
DELETE /api/users/{id}
```

**认证**：需登录 ｜ **权限**：`system:user:delete`

**约束**：不能删除当前登录用户；不能删除内置 `admin`。

### 分配角色 / 分配岗位

```
PUT /api/users/{id}/roles    权限：system:user:assign-role
PUT /api/users/{id}/posts    权限：system:user:assign-post
```

**请求体**

```json
{ "roleIds": [1, 2, 3] }
```

```json
{ "postIds": [1, 2] }
```

> 语义为**全量覆盖**：传空数组即清空。
> 前端必须先调用回填接口拿到当前值，否则会把已有分配**覆盖清空**。

### 重置用户密码（管理员）

```
PUT /api/users/{id}/password
```

**认证**：需登录 ｜ **权限**：`system:user:reset-pwd`

**请求体**

```json
{ "newPassword": "reset123456" }
```

### ★ 用户分配回填（必须实现）

```
GET /api/users/{id}/roles
GET /api/users/{id}/posts
```

**认证**：需登录 ｜ **权限**：`system:user:list`

**响应**

```json
{ "code": 0, "message": "success", "data": [1, 3] }
```

---

## 角色管理

### 角色列表

```
GET /api/roles?page=1&pageSize=10&keyword=admin
```

**认证**：需登录 ｜ **权限**：`system:role:list`

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "超级管理员",
        "code": "super_admin",
        "description": "系统内置最高权限角色",
        "dataScope": "ALL",
        "sortOrder": 1,
        "status": 1,
        "menuCount": 38,
        "createdAt": "2026-09-28 10:00:00"
      }
    ],
    "total": 3,
    "page": 1,
    "pageSize": 10
  }
}
```

### 角色详情

```
GET /api/roles/{id}
```

**认证**：需登录 ｜ **权限**：`system:role:list`

### 创建角色

```
POST /api/roles
```

**认证**：需登录 ｜ **权限**：`system:role:create`

**请求体**

```json
{
  "name": "编辑角色",
  "code": "editor",
  "description": "内容编辑",
  "dataScope": "DEPT_ONLY",
  "sortOrder": 4,
  "status": 1,
  "menuIds": [1, 2, 5]
}
```

> `menuIds` 可选；也可创建后单独调 `PUT /api/roles/{id}/menus`。**不要两处都传**，避免双写歧义。

### 更新角色

```
PUT /api/roles/{id}
```

**认证**：需登录 ｜ **权限**：`system:role:edit`

**请求体**（不含 `code`，编码不可改）

```json
{
  "name": "编辑角色",
  "description": "内容编辑（改）",
  "dataScope": "DEPT_AND_BELOW",
  "sortOrder": 4,
  "status": 1
}
```

### 删除角色

```
DELETE /api/roles/{id}
```

**认证**：需登录 ｜ **权限**：`system:role:delete`

**约束**：`super_admin` 不可删；已分配给用户的角色不可删（返回 `-1005`）。

### 分配菜单

```
PUT /api/roles/{id}/menus
```

**认证**：需登录 ｜ **权限**：`system:role:assign-menu`

**请求体**

```json
{ "menuIds": [1, 2, 3, 4, 5] }
```

### ★ 角色菜单回填（必须实现）

```
GET /api/roles/{id}/menus
```

**认证**：需登录 ｜ **权限**：`system:role:list`

**响应**

```json
{ "code": 0, "message": "success", "data": [1, 2, 5, 11, 12] }
```

> ⚠️ 没有这个接口，前端"分配菜单"弹窗每次都是空树全不选，点确定就**清空该角色的全部权限**。

---

## 菜单管理

### 菜单树

```
GET /api/menus
```

**认证**：需登录 ｜ **权限**：`system:menu:list`

**响应**：与 `GET /api/auth/menus` 同结构，但返回**全量**菜单（不受当前用户角色限制）。

### 创建菜单

```
POST /api/menus
```

**认证**：需登录 ｜ **权限**：`system:menu:create`

**请求体**

```json
{
  "parentId": 2,
  "name": "用户管理",
  "path": "/system/user",
  "component": "system/user/index",
  "menuType": "C",
  "icon": "users",
  "permission": "system:user:list",
  "sortOrder": 1,
  "visible": 1,
  "status": 1
}
```

### 更新 / 删除菜单

```
PUT /api/menus/{id}      权限：system:menu:edit
DELETE /api/menus/{id}   权限：system:menu:delete
```

**约束**：存在子菜单时不可删除（返回 `-1005`）。

---

## 组织架构

> **单表树形**：`{prefix}_sys_org`。`parentId` 递归 + `parentIds` 路径列。
> 不拆 `Dept` 表。

### 组织树

```
GET /api/orgs
```

**认证**：需登录 ｜ **权限**：`system:org:list`

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "parentId": null,
      "name": "总公司",
      "sortOrder": 1,
      "leaderUserId": 1,
      "phone": "010-12345678",
      "email": "hq@example.com",
      "status": 1,
      "children": [
        {
          "id": 2, "parentId": 1, "name": "研发部", "sortOrder": 1,
          "leaderUserId": 1, "phone": null, "email": null, "status": 1, "children": []
        }
      ]
    }
  ]
}
```

### 创建 / 更新 / 删除组织

```
POST   /api/orgs          权限：system:org:create
PUT    /api/orgs/{id}     权限：system:org:edit
DELETE /api/orgs/{id}     权限：system:org:delete
```

**创建请求体**

```json
{
  "name": "研发部",
  "parentId": 1,
  "sortOrder": 1,
  "leaderUserId": 2,
  "phone": "010-12345679",
  "email": "rd@example.com",
  "status": 1
}
```

**约束**：存在子组织时不可删除（返回 `-1005`）。

---

## 岗位管理

```
GET    /api/posts          权限：system:post:list
POST   /api/posts          权限：system:post:create
PUT    /api/posts/{id}     权限：system:post:edit
DELETE /api/posts/{id}     权限：system:post:delete
```

**创建请求体**

```json
{ "name": "前端开发", "code": "frontend_dev", "sortOrder": 1, "status": 1 }
```

---

## 租户管理

```
GET    /api/tenants        权限：system:tenant:list
POST   /api/tenants        权限：system:tenant:create
PUT    /api/tenants/{id}   权限：system:tenant:edit
DELETE /api/tenants/{id}   权限：system:tenant:delete
```

**创建请求体**

```json
{ "name": "租户A", "code": "tenant_a", "status": 1 }
```

---

## 数据权限范围（4 档）

| 值 | 说明 | 过滤语义 |
|-----|------|----------|
| `ALL` | 全部数据 | 不加条件 |
| `DEPT_AND_BELOW` | 本部门及以下 | `org_id IN (自身 + 全部子孙组织 id)` |
| `DEPT_ONLY` | 本部门 | `org_id = 当前用户 orgId` |
| `SELF_ONLY` | 仅本人 | `creator_id = 当前用户 id`（用户表用 `id`） |

**多角色取最宽档位**：`ALL > DEPT_AND_BELOW > DEPT_ONLY > SELF_ONLY`。

**用户无部门归属时**：`DEPT_*` 档**收紧为 `SELF_ONLY`**，而不是放行。

> ⚠️ 只实现 `ALL` / `SELF_ONLY` 两档属缺陷：其余档会被静默折叠，权限"看起来生效实则失效"。
> 四档必须全部可达，且必须能作用于**任意业务表**（业务表需有自身标识列与 `org_id`）。

---

## 变更记录

| 日期 | 变更 |
|------|------|
| 2026-08-22 | 初版（snake_case、两档数据权限、无鉴权要求、无回填接口） |
| **2026-09-28** | **字段名改 camelCase；错误码对齐 `-1001~-2000`；`menu_type` 语义纠正为 `M`目录/`C`菜单/`F`按钮；补方法级鉴权要求与三段式权限码全量表；补 3 个回填接口；数据权限明确 4 档；明确 DTO 入出参；明确图标存名不存 emoji** |
