# springboot-auth-module-skill

> 为 Spring Boot 项目一键叠加企业级授权与组织架构模块：RBAC、方法级鉴权、角色-菜单、组织-岗位-租户、四级数据权限、个人鉴权、回填接口。
>
> ## ⚠️ 唯一权威
>
> **组织架构 / 部门管理 / 角色权限 / RBAC / 菜单管理 / 数据权限** 六类需求，本技能是**唯一权威**。
> `springboot-org-permission-module-skill` 已废弃并转发至本技能 —— 历史上两者表名、枚举、字段全部冲突。

## 一句话

在已有 Spring Boot 骨架上说一句"帮我加一个权限模块"，即可拿到一套**可运行且真正可鉴权**的 RBAC + 组织架构代码、迁移脚本与接口契约。

## 适合场景

- 已有 `springboot-init-skill` 生成的项目，需要用户权限管理。
- 需要部门、岗位、租户等 enterprise org 结构。
- 前端菜单需要按角色动态渲染。
- 数据查询需要按"全部 / 本部门 / 本部门及以下 / 仅本人"过滤。

## 不适合场景

- 项目还没有 Spring Boot 基础骨架（请先用 `springboot-init-skill`）。
- 需要复杂的工作流审批（请用专门的工作流引擎）。
- 需要 OAuth2 / SSO（当前版本仅支持 JWT，后续迭代）。

## 触发关键词

```
Java 授权模块、Spring Boot 权限模块、RBAC 模块、角色菜单权限、
企业组织架构、组织架构、部门管理、角色权限、菜单管理、数据权限、
springboot-auth-module、添加权限模块、帮我加一个 Java 鉴权模块
```

## 快速上手

```bash
# 1. 在 AI 中说：
#    "在现有 Spring Boot 项目上加一个权限模块"

# 2. 回答 3 个问题：
#    Q1: 包名是什么？（默认 com.example.demo）
#    Q2: 表前缀是什么？（默认 wg）
#    Q3: 是否需要数据权限？（默认 4 档全开）

# 3. 执行迁移后重启
./mvnw flyway:migrate   # 或手动执行 V10__init_auth_module.sql
./restart.sh dev
```

## 生成内容

```
auth/
├── controller/      # Auth / User / Role / Menu / Org / Post / Tenant
├── dto/             # 请求/响应 DTO（禁止实体直出）
├── entity/          # 实体
├── repository/      # Spring Data JPA
├── service/         # 业务逻辑
├── permission/      # AuthorityLoader / PermissionEvaluator / DataScopeFilter
└── common/          # AuthPerms 权限常量

src/main/resources/db/migration/V10__init_auth_module.sql
api-contract-auth.md
docs/auth-module-guide.md
```

## 方法级鉴权（v1.2.0 新增，此前完全缺失）

```java
@Configuration
@EnableMethodSecurity                       // ← 不开则 @PreAuthorize 静默失效
public class SecurityConfig { }

@PreAuthorize("hasAuthority('system:user:list')")
@GetMapping("/api/users")
public ApiResponse<PageResponse<UserVO>> page(...) { }
```

并且 `JwtAuthenticationFilter` **必须**把用户真实权限装进 SecurityContext：

```java
authorityLoader.roleCodes(userId).forEach(c -> authorities.add(new SimpleGrantedAuthority("ROLE_" + c)));
authorityLoader.permissions(userId).forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));
```

> 只装 `ROLE_USER` → 所有 `hasAuthority` 判断失败 → "补了注解反而全员 403"。

### 权限码格式

**三段式 `模块:资源:动作`**，全小写。**页面权限与列表接口权限共用同一码**。
全量表见 [`api-contract-auth.md`](./api-contract-auth.md#权限码全量表前后端必须逐字一致)。

## 数据权限（四级，必须全部可达）

| 范围 | 说明 |
|------|------|
| `ALL` | 全部数据 |
| `DEPT_AND_BELOW` | 本部门及以下子部门 |
| `DEPT_ONLY` | 本部门 |
| `SELF_ONLY` | 仅本人 |

- 在 `Role` 上设置 `dataScope`，查询时通过 `DataScopeFilter` 动态拼接条件。
- **多角色取最宽档位**：`ALL > DEPT_AND_BELOW > DEPT_ONLY > SELF_ONLY`。
- **必须可作用于任意业务表**（业务表需有自身标识列与 `org_id`）。
- ⚠️ 只实现 `ALL` / `SELF_ONLY` 两档是**缺陷**：其余档会被静默折叠。

## 核心接口

| 路径 | 权限 | 说明 |
|------|------|------|
| `POST /api/auth/login` | 放行 | 登录 |
| `POST /api/auth/refresh` | 放行 | 刷新令牌 |
| `POST /api/auth/logout` | 需登录 | 登出 |
| `GET /api/auth/me` | 需登录 | 当前用户详情 |
| `PUT /api/auth/password` | 需登录 | 修改密码 |
| `GET /api/auth/menus` | 需登录 | 当前用户菜单树 |
| `CRUD /api/users` | `system:user:*` | 用户管理 |
| `GET /api/users/{id}/roles` | `system:user:list` | **回填**：用户已分配角色 |
| `GET /api/users/{id}/posts` | `system:user:list` | **回填**：用户已分配岗位 |
| `CRUD /api/roles` | `system:role:*` | 角色管理 |
| `GET /api/roles/{id}/menus` | `system:role:list` | **回填**：角色已分配菜单 |
| `CRUD /api/menus` | `system:menu:*` | 菜单管理 |
| `CRUD /api/orgs` | `system:org:*` | 组织架构 |
| `CRUD /api/posts` | `system:post:*` | 岗位管理 |
| `CRUD /api/tenants` | `system:tenant:*` | 租户管理 |

> **三个回填接口是硬性交付物**。缺一个，前端对应的"分配"弹窗就是空树全不选，点确定会**清空**已有分配。

## 表清单

| 表名 | 说明 |
|------|------|
| `{prefix}_sys_tenant` | 租户 |
| `{prefix}_sys_org` | 组织架构（单表树形 + `parent_ids` 路径列） |
| `{prefix}_sys_post` | 岗位 |
| `{prefix}_sys_user` | 用户 |
| `{prefix}_sys_role` | 角色 |
| `{prefix}_sys_menu` | 菜单/权限（树形） |
| `{prefix}_sys_role_menu` | 角色-菜单关联 |
| `{prefix}_sys_user_role` | 用户-角色关联 |
| `{prefix}_sys_user_post` | 用户-岗位关联 |

> **前缀统一，无例外。** 「用户表叫 `{prefix}_user`」是历史误用，已作废。

`menu_type`：**`M`=目录 / `C`=菜单 / `F`=按钮**（兼容读取 `B`=按钮）。

## 与 springboot-init-skill 集成

1. 确保原项目已有 `JwtUtil`、`CurrentUser`、`ApiResponse`。
2. 将本模块源码复制到 `{{basePackage}}.auth` 包下。
3. 替换 `SecurityConfig`（开启 `@EnableMethodSecurity`）与 `JwtAuthenticationFilter`（装配真实权限）。
4. 执行 `V10__init_auth_module.sql`。
5. 若原项目已有简单 `User` 实体，**改名为 `SysUser` 并迁移到 `{prefix}_sys_user`**。
6. 启动后用 Swagger UI + 三个账号（全权 / 部分权 / 只读）验证权限矩阵。

## 版本日志

### v1.2.0 (2026-09-28)

- ✅ **补方法级鉴权**：`@EnableMethodSecurity` + `@PreAuthorize` + JWT 装配真实权限（此前完全缺失，任意登录用户可删用户/角色/菜单）
- ✅ **数据权限补足 4 档**并明确"多角色取最宽档"，`DataScopeFilter` 支持任意业务表
- ✅ **补 3 个回填接口**（角色菜单 / 用户角色 / 用户岗位）
- ✅ **权限码统一为三段式**并提供全量表
- ✅ **修正 `menu_type` 语义**：`M`=目录 / `C`=菜单 / `F`=按钮（此前文档反向写成 `M`=菜单）
- ✅ **修正字段命名**：契约文档 snake_case → camelCase，与实现对齐
- ✅ **修正错误码**：`400/401/403/...` → `-1001~-2000`，与 `springboot-init-skill` 对齐
- ✅ 新增红线 R1~R12 与交付自检清单
- ✅ 新增 `parent_ids` 路径列设计，`DEPT_AND_BELOW` 可一条 SQL 命中
- ✅ 声明本技能为组织权限领域**唯一权威**

### v1.1.0 (2026-08-22)

- 新增 `references/skeleton.md` 代码骨架（伪代码）
- 新增 `api-contract-auth.md` 接口契约（snake_case 版）
- 声明与 `fastapi-auth-module-skill` 字段对齐（实际未对齐）

### v1.0.0 (2026-08-21)

- RBAC 核心（用户、角色、菜单）
- 组织架构（租户、部门、岗位）
- 角色-菜单、用户-角色、用户-岗位关联
- 数据权限（文档声明 4 档，实现常见 2 档）
- 个人鉴权（登录、登出、当前用户、菜单树、改密）

## 后续规划

- 权限集合加缓存（当前每次请求查库）
- OAuth2 / SSO 接入
- 岗位级数据权限
- 操作日志审计

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**
