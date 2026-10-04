# 契约红线（与 Java springboot-auth-module 逐字对齐）

目标：同一套前端在 Java / Go 后端之间**零改动切换**。以下每条都是实测踩出来的，改一条前端就可能出错。

## 1. 响应信封

```json
{ "code": 0, "message": "success", "data": {} }
```

- `code == 0` 表示成功，非 0 为业务错误
- `message` 成功时固定 `success`（前端按 `code` 判断，但别改这个值）
- `data` 恒存在（无内容时为 `null` / `[]` / `{}`）

## 2. 分页响应用 `list`

```json
{ "code": 0, "message": "success",
  "data": { "list": [], "total": 3, "page": 1, "pageSize": 10 } }
```

- 字段名 **`list`**，不是 `items` / `records`
- `page` 从 **1** 开始
- 前端 `types/api.d.ts` 里 `PageResponse<T>` 就是这 4 个字段

## 3. 错误码（-1001 ~ -1005）

| code | 语义 | HTTP |
|------|------|------|
| -1001 | BadRequest（参数校验） | 400 |
| -1002 | Unauthorized（未登录 / 签名失败） | 401 |
| -1003 | Forbidden（无权限） | 403 |
| -1004 | NotFound | 404 |
| -1005 | Conflict（唯一冲突） | 409 |

## 4. ★ 权限双路径（最易踩）

```go
// 路径 A：/api/auth/me —— 前端权限数组，走 DB 派生
perms := repo.FindPermissionsByUser(uid)   // super_admin => 34

// 路径 B：鉴权中间件 RequirePerm —— 等价 @PreAuthorize
perms := repo.FindPermissionsByUser(uid)
if hasRole("super_admin") {                // ★ 短路：并上全量常量
    perms = union(perms, AuthPermsAll)     // => 38
}
```

对应关系（Java 侧）：

| Go | Java |
|----|------|
| 路径 A | `AuthorityLoader.permissions()` → `findPermissionsByUserId`（**无短路**） |
| 路径 B | `JwtAuthenticationFilter` 反射读 `AuthPerms` 静态字段后并入 |

**数量自检**（种子菜单固定时）：
- 菜单总数 **37**（3 目录 + 8 页面 + 26 按钮）→ `RoleVO.menuCount = 37`
- DB 派生权限 **34**（8 页面级 + 26 按钮级）→ `me()` 的 `permissions.length = 34`
- 全量常量 **38**（34 + 4 个无菜单的 `system:tenant:*`）→ super_admin 鉴权上下文

## 5. ★ 目录菜单的 `permission` 存 NULL

```go
// 模型：用指针类型，空串落库为 NULL
Permission *string `gorm:"column:permission;size:100" json:"permission"`

// 落库前统一转换
func strPtr(s string) *string { if s == "" { return nil }; return &s }
```

装载权限的 SQL 是 `permission IS NOT NULL`：

```sql
SELECT permission FROM wg_sys_menu
WHERE id IN (SELECT menu_id FROM wg_sys_role_menu WHERE role_id IN (...))
  AND permission IS NOT NULL AND deleted_at IS NULL
```

**空串不是 NULL**，会被当成有效权限。存 `""` 的实测后果：`me()` 返回 37（34 + 3 个空串），
且菜单树里目录的 `permission` 是 `""` 而非 `null`（与 Java 不一致）。

## 6. 数据权限四档

| 档位 | 含义 |
|------|------|
| `ALL` | 全部数据 |
| `DEPT_AND_BELOW` | 本组织及其子孙组织 |
| `DEPT_ONLY` | 仅本组织 |
| `SELF_ONLY` | 仅本人 |

**多角色取最宽档位**（不是取并集后过滤，而是选范围最大的那一档）。
子孙组织用 `DescendantOrgIDs`（内存递归，SQLite 无递归 CTE 也可用）。

## 7. JWT

- HS256，`Authorization: Bearer <token>`
- access 60 分钟、refresh 7 天（与 Java `application.yml` 一致）
- claims 含 `uid` / `type`（`access` 或 `refresh`）
- 放行路径：`/api/open/`（走应用签名）、`/api/auth/login`、`/api/auth/refresh`、`/api/health`

## 8. 时间与软删除

- 时间格式统一 `yyyy-MM-dd HH:mm:ss`
- 软删除用 `deleted_at` 列（GORM `gorm.DeletedAt`）
- **所有权限装载 / 菜单查询都必须带 `deleted_at IS NULL`**，否则软删除菜单的权限仍生效
- 关联表（`user_role` / `user_post` / `role_menu`）物理删除，无软删列

## 9. 密码与敏感字段

- `SysUser.Password` 标 `json:"-"`，**只写不读**
- 任何 VO 都不得携带密码
- `AppKey.APISecret` 同样 `json:"-"`，只有 `CreatedAppKeyVO` 会在创建响应里返回一次
