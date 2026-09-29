# vue-admin-skill API 契约（v1.0）

> 配套前端：`template/frontend/src/api/*.ts`
> 配套后端：`template/backend/src/main/java/com/example/demo/auth/controller/*.java` + `example/controller/ProductController.java`
> 取代 springboot-init-skill/demo 的通用契约（已删除 SSE / 上传 / 注册 / 刷新 等无关端点）

## 一、响应信封

所有 JSON 接口（除 SSE / 文件流外）统一返回 `ApiResponse<T>`：

```json
{ "code": 0, "message": "success", "data": { } }
```

参数校验失败示例：

```json
{
  "code": -1001,
  "message": "参数校验失败",
  "data": { "errors": [{ "field": "username", "message": "不能为空" }] }
}
```

### 错误码表

| code    | 含义          | HTTP | 前端拦截行为                  |
|---------|---------------|------|-------------------------------|
| 0       | 成功          | 200  | 业务处理                      |
| -1001   | 参数校验失败  | 400  | 显示 message + data.errors    |
| -1002   | 未登录 / token 失效 | 401 | 清 token + 跳 `/login` |
| -1003   | 无权限        | 403  | 跳 `/403`                     |
| -1004   | 资源不存在    | 404  | 显示 message                  |
| -1005   | 资源冲突（重复）| 409 | 显示 message                  |
| -2000   | 系统异常      | 500  | 显示 message + 上报           |

> 实际 GlobalExceptionHandler 仅注册 -1001/-1002/-1003/-1004/-1005/-2000；-2001（数据库）/-2002（第三方）为预留码，未实现。

## 二、Token 注入

```
Authorization: Bearer {accessToken}
```

由前端 `@/utils/request.ts` 的 axios 拦截器从 `localStorage.accessToken` 自动注入。后端 `JwtAuthenticationFilter` 解析，失败回 401（code=-1002）。

## 三、6 大业务实体契约

### 3.1 用户（SysUser，前端 `api/user.ts`）

| 端点                       | 方法  | 请求                      | 响应                |
|----------------------------|-------|---------------------------|---------------------|
| `/api/users`               | GET   | `?page=&pageSize=&username=&status=` | `PageResponse<User>` |
| `/api/users/{id}`          | GET   | -                         | `User`              |
| `/api/users`               | POST  | `CreateUserRequest`       | `SysUser`           |
| `/api/users/{id}`          | PUT   | `UpdateUserRequest`       | `SysUser`           |
| `/api/users/{id}`          | DELETE| -                         | void（软删除）       |
| `/api/users/{id}/roles`    | PUT   | `{ roleIds: number[] }`   | void                |
| `/api/users/{id}/posts`    | PUT   | `{ postIds: number[] }`   | void                |
| `/api/users/{id}/password` | PUT   | `ResetPasswordRequest`    | void（管理员重置）   |

`User` 字段（前端 TS Interface）：`id, username, nickname, email, phone, avatar, orgId, orgName?, status, createdAt, roles: Array<{id,name,code}>, posts: Array<{id,name,code}>`。

`CreateUserRequest`：`username, password, nickname, email, phone, avatar?, orgId, roleIds, postIds, status`。
`UpdateUserRequest`：`nickname, email, phone, avatar?, orgId, status, password?`。
`ResetPasswordRequest`：`{ newPassword: string (6-32) }`。

### 3.2 角色（SysRole，前端 `api/role.ts`）

| 端点                     | 方法  | 请求                  | 响应                 |
|--------------------------|-------|-----------------------|----------------------|
| `/api/roles`             | GET   | `RoleQuery`           | `PageResponse<Role>` |
| `/api/roles/{id}`        | GET   | -                     | `SysRole`            |
| `/api/roles`             | POST  | `CreateRoleRequest`   | `SysRole`            |
| `/api/roles/{id}`        | PUT   | `UpdateRoleRequest`   | `SysRole`            |
| `/api/roles/{id}`        | DELETE| -                     | void                 |
| `/api/roles/{id}/menus`  | PUT   | `{ menuIds: number[] }`| void                |

`Role` 字段：`id, name, code, description, dataScope ('ALL'|'SELF_ONLY'), sortOrder, status, createdAt, menuCount`。
`CreateRoleRequest`：`name, code, description, dataScope, menuIds, status`（sortOrder 可选）。

### 3.3 菜单（SysMenu，前端 `api/menu.ts`）

| 端点              | 方法  | 请求                  | 响应            |
|-------------------|-------|-----------------------|-----------------|
| `/api/menus`      | GET   | -                     | `List<MenuNode>`（树形） |
| `/api/menus`      | POST  | `CreateMenuRequest`   | `SysMenu`       |
| `/api/menus/{id}` | PUT   | `UpdateMenuRequest`   | `SysMenu`       |
| `/api/menus/{id}` | DELETE| -                     | void（软删除）  |

`MenuNode` 字段：`id, parentId, name, path?, component?, menuType ('M'|'C'|'B'), icon?, permission?, sortOrder, visible, status, children`。

**`icon` 字段约束**：值必须是 `frontend-icon-skill` 模板名（如 `dashboard` / `user` / `chart` / `menu` / `tree` / `building` / `box` / `role` 等），前端用 `<BaseIcon name="..." />` 渲染。详见 `template/frontend/ICONS.md` + `template/database/seed.sql`。

**`menuType` 枚举**：`M`=菜单（可点击）/ `C`=目录（分组）/ `B`=按钮（仅权限标记，不渲染菜单项）。

### 3.4 组织（SysOrg，前端 `api/org.ts`）

| 端点             | 方法  | 请求              | 响应            |
|------------------|-------|-------------------|-----------------|
| `/api/orgs`      | GET   | -                 | `List<OrgNode>`（树形） |
| `/api/orgs`      | POST  | `CreateOrgRequest`| `SysOrg`        |
| `/api/orgs/{id}` | PUT   | `CreateOrgRequest`| `SysOrg`        |
| `/api/orgs/{id}` | DELETE| -                 | void（软删除）  |

`OrgNode` 字段：`id, parentId, name, sortOrder, leaderUserId, phone, email, status, children`。

### 3.5 岗位（SysPost，后端 CRUD，前端未消费）

| 端点             | 方法  | 请求               | 响应           |
|------------------|-------|--------------------|----------------|
| `/api/posts`     | GET   | -                  | `List<SysPost>`|
| `/api/posts`     | POST  | `CreatePostRequest`| `SysPost`      |
| `/api/posts/{id}`| PUT   | `CreatePostRequest`| `SysPost`      |
| `/api/posts/{id}`| DELETE| -                  | void（软删除） |

> 后端 `PostController` 已完整实现。前端**当前未消费**（不在 6 大业务页面），后续按需添加 `api/post.ts` + `views/system/post/index.vue`。

### 3.6 租户（SysTenant，后端 CRUD，前端未消费）

| 端点               | 方法  | 请求                 | 响应             |
|--------------------|-------|----------------------|------------------|
| `/api/tenants`     | GET   | -                    | `List<SysTenant>`|
| `/api/tenants`     | POST  | `CreateTenantRequest`| `SysTenant`      |
| `/api/tenants/{id}`| PUT   | `CreateTenantRequest`| `SysTenant`      |
| `/api/tenants/{id}`| DELETE| -                    | void（软删除）   |

> 多租户场景。前端**当前未消费**，同上节。

### 3.7 商品（Product，前端 `api/product.ts`）

| 端点                 | 方法  | 请求         | 响应                   |
|----------------------|-------|--------------|------------------------|
| `/api/products`      | GET   | `ProductQuery` | `PageResponse<Product>` |
| `/api/products/{id}` | GET   | -            | `Product`              |
| `/api/products`      | POST  | `Product`    | `{ id: number }`       |
| `/api/products/{id}` | PUT   | `Product`    | void                   |
| `/api/products/{id}` | DELETE| -            | void（硬删除）         |

`Product` 字段：`id, name, code, category, price, stock, description, status, createdAt`。`ProductQuery`：`page?, pageSize?, keyword?`（模糊匹配 name / code）。

> 后端在 `example/controller/ProductController.java`，作为示例业务实体。

## 四、认证（Auth，前端 `api/auth.ts`）

| 端点                  | 方法 | 请求                            | 响应                                   |
|-----------------------|------|---------------------------------|----------------------------------------|
| `/api/auth/login`     | POST | `{ username, password }`        | `LoginResponse { accessToken, refreshToken, tokenType, expiresIn }` |
| `/api/auth/logout`    | POST | -                               | void（JWT 无状态，客户端清 token 即可）|
| `/api/auth/me`        | GET  | -                               | `UserInfoResponse`                     |
| `/api/auth/menus`     | GET  | -                               | `List<MenuNode>`（当前用户可访问菜单树）|
| `/api/auth/password`  | PUT  | `{ oldPassword, newPassword }`  | void                                   |

`UserInfoResponse` 字段：`id, username, nickname, email, phone, avatar, tenantId, orgId, status, roles: string[], permissions: string[]`。

> 不存在 `/api/auth/register`、`/api/auth/refresh` 端点——用户由管理员创建，token 仅做失效由前端清。

## 五、版本

- 契约版本：1.0.0
- 适用 vue-admin-skill v1.0+
- 后端：Spring Boot 3 + Java 17 + JPA + Spring Security + JWT
- 前端：Vue 3 + Pinia + Axios + Element Plus
- 总计：**8 controller**（Auth/User/Role/Menu/Org/Post/Tenant/Product）+ 6 前端 `api/*.ts`（auth/user/role/menu/org/product）
