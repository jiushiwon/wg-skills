---
name: springboot-auth-module-skill
description: Spring Boot 授权与企业组织架构模块一键叠加技能，**组织权限领域的唯一权威技能**。面向已使用 springboot-init-skill 生成的项目，标准化落地 RBAC、方法级鉴权、角色-菜单绑定、组织架构、岗位/租户、四级数据权限、个人鉴权与菜单回填接口。触发词："Spring 授权模块","Spring Boot 权限模块","RBAC 模块","角色菜单权限","企业组织架构","组织架构","部门管理","角色权限","菜单管理","数据权限","springboot-auth-module","添加权限模块","帮我加一个 Spring 鉴权模块"。
---

# Spring Auth Module Skill

为 Spring Boot 项目**叠加**一套企业级授权与组织架构能力，不是重新生成新项目。

> ## ⚠️ 唯一权威声明
>
> **组织架构 / 部门管理 / 角色权限 / RBAC / 菜单管理 / 数据权限 六类需求，本技能是唯一权威。**
>
> `springboot-org-permission-module-skill` 已废弃并转发至本技能（历史上两个技能的表名、枚举、字段全部冲突，导致同一需求生成结果不可预测）。
> **不要再从其他技能生成组织权限代码。**

## 定位

- 目标：在已有 `springboot-init-skill` / `springboot-skill` 骨架上，添加**可运行且可鉴权**的 RBAC + 组织架构模块。
- 不替代：不重复生成 `springboot-init-skill` 已经提供的 JWT、统一响应、Swagger 等基础设施。
- 输出：实体、仓储、服务、控制器、DTO、Flyway 迁移、接口契约、接入指南。

## 依赖

- **springboot-init-skill**：基础 JWT、统一响应、分页、当前用户注解必须已存在。
- **frontend-request-skill**：响应信封、错误码、Token、分页字段必须保持对齐。
- **database-design-skill**：表前缀、字段命名、软删除、索引规范沿用。

## 用户问题（最多 3 个）

```
1. 现有项目的 Spring 包名是什么？（默认从 springboot-init-skill 推断，如 com.koala.myapp）
2. 表前缀是什么？（默认 wg）
3. 是否需要数据权限（全部 / 本部门 / 本部门及以下 / 仅本人）？（默认 4 档全开）
```

## 核心能力清单（12 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **租户（Tenant）** | 多租户数据隔离，支持独立组织架构 |
| 2 | **组织架构（Org）** | **单表**树形部门，`parent_id` 递归 + `parent_ids` 路径列 |
| 3 | **岗位（Post）** | 用户可绑定一个或多个岗位 |
| 4 | **用户（SysUser）** | 扩展基础 User，关联租户、部门、岗位、角色 |
| 5 | **角色（Role）** | RBAC 核心，支持四级数据权限范围 |
| 6 | **菜单/权限（Menu）** | 树形菜单 + 权限标识（permission），用于前端路由与按钮级鉴权 |
| 7 | **角色-菜单绑定** | 多对多，控制角色可见菜单与接口权限 |
| 8 | **用户-角色绑定** | 多对多，一个用户可拥有多个角色 |
| 9 | **方法级鉴权** | `@EnableMethodSecurity` + `@PreAuthorize("hasAuthority('...')")`，**每个受控端点必须显式声明** |
| 10 | **数据权限** | 四级：全部 / 本部门 / 本部门及以下 / 仅本人，**必须可作用于任意业务表** |
| 11 | **个人鉴权** | 登录 / 登出 / 修改密码 / 当前用户详情 / 获取菜单树 |
| 12 | **回填接口** | 角色菜单、用户角色、用户岗位的回填查询接口 |
| 13 | **接口契约** | 生成 `api-contract-auth.md`，与前端对齐 |

## 生成的模块结构

```
src/main/java/{{basePackage}}/auth/
├── common/
│   ├── AuthConstants.java          # 权限常量（避免魔法字符串）
│   └── DataScope.java              # 数据权限枚举（4 档，见下）
├── controller/
│   ├── AuthController.java         # 登录 / 登出 / 当前用户 / 菜单树 / 改密
│   ├── UserController.java         # 用户 CRUD + 绑定角色/岗位（含回填）
│   ├── RoleController.java         # 角色 CRUD + 绑定菜单（含回填）
│   ├── MenuController.java         # 菜单树 CRUD
│   ├── OrgController.java          # 组织架构树 CRUD
│   ├── PostController.java         # 岗位 CRUD
│   └── TenantController.java       # 租户 CRUD
├── dto/                            # 请求/响应 DTO（禁止实体直出）
├── entity/                         # 实体
├── repository/                     # Spring Data JPA
├── service/                        # 业务逻辑
└── permission/
    ├── AuthorityLoader.java        # 按 userId 装载权限标识 + 角色码
    ├── PermissionEvaluator.java    # 数据权限档位解析
    └── DataScopeFilter.java        # 数据权限过滤 Specification

src/main/resources/db/migration/
├── V10__init_auth_module.sql       # 授权模块表结构（含 parent_ids）

api-contract-auth.md                # 接口契约
docs/auth-module-guide.md           # 接入与扩展指南
```

## 表命名（强制）

```
{prefix}_sys_tenant          租户
{prefix}_sys_org             组织（单表树）
{prefix}_sys_post            岗位
{prefix}_sys_user            用户
{prefix}_sys_role            角色
{prefix}_sys_menu            菜单
{prefix}_sys_user_role       用户-角色
{prefix}_sys_user_post       用户-岗位
{prefix}_sys_role_menu       角色-菜单
```

> **例外清单为空。** 「用户表叫 `{prefix}_user`」是历史误用，已作废 —— 见红线 R1。

`menu_type` 取值（**统一采用业界惯例 M/C/F**）：

| 值 | 含义 | 说明 |
|----|------|------|
| `M` | 目录 | 只做分组，不对应页面组件，`path` 通常是 `/system` 这类前缀 |
| `C` | 菜单 | 对应一个页面组件，可带 `permission` |
| `F` | 按钮 | 不带路径，只承载 `permission` |

> 兼容：读取时 `B` 视为 `F`；写入时只允许 `M` / `C` / `F`。
> **注意**：`M` 是**目录**、`C` 是**菜单**。写成 `M=菜单 C=目录` 是错的（历史文档曾这样写，已纠正）。

## 权限标识格式（强制）

**三段式 `模块:资源:动作`**，全小写，用短横线连接多词动作。

```
system:user:list          system:user:create        system:user:edit
system:user:delete        system:user:reset-pwd     system:user:assign-role
system:role:list          system:role:assign-menu   system:menu:list
system:org:list           system:app:list           account:bind:list
dashboard:home:view       example:product:list
```

规则：

1. **三段固定**，禁止两段（`user:list`）或一段。
2. **页面权限与列表接口权限共用同一码**（页面 `system:user:list` 与 `GET /api/users` 的 `system:user:list` 是同一条），避免"路由写 view、接口写 list"这类错位。
3. **按钮权限绝不复用为页面/路由权限**。
4. 前端 `router` 的 `meta.permission`、前端 `v-permission`、后端 `@PreAuthorize`、DB `{prefix}_sys_menu.permission` **必须逐字一致**（交付前做三方 diff，见下方自检）。

## 方法级鉴权（强制）

```java
@Configuration
@EnableMethodSecurity           // ← 必须开启，否则 @PreAuthorize 静默失效
public class SecurityConfig { }
```

```java
// 每个受控端点必须显式声明；"仅 authenticated()" 视为未完成
@PreAuthorize("hasAuthority('system:user:list')")
@GetMapping
public ApiResponse<PageResponse<UserVO>> page(...) { }
```

**JWT 过滤器必须把真实权限装进 SecurityContext**（只装 `ROLE_USER` 会导致全量 403）：

```java
var authorities = new ArrayList<GrantedAuthority>();
authorityLoader.roleCodes(userId).forEach(c -> authorities.add(new SimpleGrantedAuthority("ROLE_" + c)));
authorityLoader.permissions(userId).forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));
var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
```

## 数据权限规则（四级）

| 数据范围 | 含义 | 使用场景 |
|----------|------|----------|
| `ALL` | 全部数据 | 超级管理员 |
| `DEPT_ONLY` | 本部门数据 | 部门经理 |
| `DEPT_AND_BELOW` | 本部门及以下子部门 | 区域负责人 |
| `SELF_ONLY` | 仅本人数据 | 普通员工 |

**多角色取最宽档位**（`ALL > DEPT_AND_BELOW > DEPT_ONLY > SELF_ONLY`）。

> 历史版本只实现 `ALL` / `SELF_ONLY` 两档并把其余档位**静默折叠**为 `SELF_ONLY` —— 这是缺陷，不是简化。四档必须全部可达。

**必须可作用于任意业务表**：`DataScopeFilter` 提供通用入口，业务表只要有 `creator_id` / `org_id` 就能接入，禁止只对用户表生效。

## 生成流程

1. 确认已存在 Spring Boot 骨架（含 JWT、统一响应、当前用户注解）。
2. 询问用户包名、表前缀、是否需要数据权限。
3. 按 `references/skeleton.md` 生成 `auth/` 下全部源码（**含方法级鉴权与四档数据权限的真实实现**）与迁移文件。
4. 生成 `api-contract-auth.md` 与 `docs/auth-module-guide.md`。
5. 提示用户：
   - 用 `V10__init_auth_module.sql` 初始化表结构；
   - 若原项目已有 `User` 实体，**改名为 `SysUser` 并迁移到 `{prefix}_sys_user`**；
   - 重启服务后访问 `/api/auth/menus` 获取当前用户菜单树。

## 接口契约要点

- 响应信封：`{ code, message, data }`，成功 `code === 0`；错误码沿用 `springboot-init-skill` 的负数表（`-1001` 校验 / `-1002` 未登录 / `-1003` 无权限 / `-1004` 不存在 / `-1005` 冲突 / `-2000` 系统）。
- **字段命名一律 camelCase**（`accessToken` / `pageSize` / `menuType` / `dataScope` / `menuIds` / `createdAt`）。~~snake_case~~ 是历史错误，已纠正。
- 登录：`POST /api/auth/login` 返回 `{ accessToken, refreshToken, tokenType, expiresIn }`。
- 当前用户：`GET /api/auth/me` 返回用户 + 角色 + 部门 + 岗位 + 权限。
- 菜单树：`GET /api/auth/menus` 返回当前用户可见的树形菜单。
- **回填接口（必须交付）**：
  - `GET /api/roles/{id}/menus` → `List<Long>`
  - `GET /api/users/{id}/roles` → `List<Long>`
  - `GET /api/users/{id}/posts` → `List<Long>`
- 用户、角色、菜单、部门、岗位：标准分页 CRUD，**入参出参一律走 DTO**。

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract-auth.md` | 含登录、当前用户、菜单树、回填、CRUD 全量接口 |
| 接入指南 | `docs/auth-module-guide.md` | 表结构、权限码表、数据权限、与 springboot-init-skill 集成步骤 |

## 交付自检（缺一不可）

| # | 检查 | 判定 |
|---|------|------|
| 1 | `grep -c "@PreAuthorize" ` 覆盖率 | 每个受控端点都有；`0` 命中 = 未完成 |
| 2 | `@EnableMethodSecurity` 是否开启 | 未开启 → `@PreAuthorize` 静默失效 |
| 3 | JWT 过滤器是否装配真实权限 | 只装 `ROLE_USER` = 未完成 |
| 4 | 表名是否全部 `{prefix}_sys_*` | 出现 `{prefix}_user` = 违反 R1 |
| 5 | `DataScope` 是否 4 档且均有可达分支 | 2 档 = 未完成 |
| 6 | 三方权限码 diff（DB ⟷ 路由 meta ⟷ v-permission ⟷ @PreAuthorize） | 必须零差集 |
| 7 | 是否有实体直接作为 `@RequestBody` / 响应体 | 有 = 违反 R5 |
| 8 | 回填接口是否交付 | 缺 → 前端"分配菜单/角色"会覆盖清空 |

## 红线

| # | 红线 | 理由 |
|---|------|------|
| **R1** | 表名**全部** `{prefix}_sys_*`。**禁止** `{prefix}_user` 特例 | 历史破例导致同一个库三种前缀 |
| **R2** | **必须交付方法级鉴权**：`@EnableMethodSecurity` + 每个受控端点的 `@PreAuthorize` + SecurityContext 装配真实权限。只写 `anyRequest().authenticated()` 视为**未完成** | 否则任何登录用户可删用户/角色/菜单、重置他人密码 |
| **R3** | 数据权限**必须四级可达**，且**必须能作用于业务表**；多角色取最**宽**档位 | 静默折叠档位 = 权限失效 |
| **R4** | **管理类端点禁止 `permitAll`**。只有 `/api/auth/login`、`/api/health`、Swagger 可放行 | 绑定/应用管理类接口 extern 放行会泄露 |
| **R5** | **禁止实体直接作为入参/出参**，一律 DTO | 防止 mass assignment（可注入 `appSecret`/`ownerId`/`createTime`） |
| **R6** | 权限码三段式，且 page 与 list 同码；按钮码不复用为路由码 | 防止"路由写 view、接口写 list"错位 |
| **R7** | `menu_type` 只允许 `M`(目录) / `C`(菜单) / `F`(按钮) | 与业界惯例一致，避免跨项目迁移出错 |
| **R8** | 所有删除为软删除（`deleted_at`） | 统一审计口径 |
| **R9** | 菜单树使用 `parent_id` + `sort_order`，禁止嵌套集合 | 便于任意层级扩展 |
| **R10** | **必须交付三个回填接口** | 缺一个，对应分配功能就会覆盖清空 |
| **R11** | 所有注释、文档用中文 | 目标用户是中文开发者 |
| **R12** | 不重复生成 Spring Boot 基础骨架 | 职责边界 |
| **R13** | 菜单 `menu_type=C` 必须同时有 `path` 与 `component`；`menu_type=F` 必须有三段式 `permission`（`^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*:[a-z][a-z0-9_-]+$`） | 「按钮没码」= 永远没权；「菜单没路径」= 前端 404 |
| **R14** | `menu_type=C` 的 `path` 全树不能重复（含自己排除、软删除项排除） | 同一 path 挂两个菜单 → 路由跳转随机 |
| **R15** | 菜单管理 UI 必须能**从前端路由表回填** `path/component/name/permission`（推荐 `<base-select>` 直接读 `router.options.routes`） | 防止「DB 菜单」与「router 静态路由」双源漂移 |

## 多角色去重机制

> 用户可绑多个角色，所有「可见菜单 / 按钮权限」都来自这些角色的并集。
> 三层防线保证**不重复、不遗漏、且对前端透明**：

```
┌──────────────────────────────────────────────────────────┐
│ 用户 → 多个角色 → 多个 wg_sys_role_menu                    │
└──────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 ① 菜单 ID 去重      ② 权限码去重       ③ 树形拼装去重
 JPA findAllById    AuthService.me()     buildMenuTree()
   按主键 IN 去重    Set→List.toList()   byId Map 不重复挂载
        │                   │                   │
        ▼                   ▼                   ▼
 GET /api/auth/menus  GET /api/auth/me  渲染 sidebar 自动无重复
```

- **后端 `SysRoleMenuRepository.findMenuIdsByUserId`**：不主动去重（IN 子查询本身就只返回一份主键，外层 `findAllById` 再去一次）
- **后端 `findPermissionsByUserId`**：`AuthService.me()` 里 `new HashSet<>(...)` 显式去重后再 `new ArrayList<>(...)` 返回
- **后端 `buildMenuTree`**：`Map<Long, MenuNode>` 按 id 索引，重复 id 不会重复挂到 `parent.children`
- **前端**：登录响应 `permissions` 已是去重 List，直接 `permissions.value = info.permissions` 覆盖，不做合并也就不会重复
- **前端路由注入**：`<base-card>` + `<AdminSidebar>` 接收 `MenuNode[]`，按 id 渲染，重复 id 不会重复出现

**校验（自动化测试不写，但必须能跑通的）**：

```sql
-- 用户 admin 同时绑定了 super_admin（id=1）和 user_admin（id=2）
-- 其中 super_admin 拥有所有 45 条菜单，user_admin 拥有 41 条（不含应用管理 36..40）
-- 期望：admin 看到 45 条（不是 86 条去重 → 仍 45），common_user 看到 6 条
SELECT COUNT(DISTINCT m.id)
FROM wg_sys_menu m
JOIN wg_sys_role_menu rm ON m.id = rm.menu_id
JOIN wg_sys_user_role ur ON ur.role_id = rm.role_id
WHERE ur.user_id = 1 AND m.deleted_at IS NULL;
```

## 后续迭代

- 权限集合加缓存（当前每次请求查库，权限变更稀疏时可接受）。
- 支持岗位级数据权限、自定义数据权限规则。
- 支持 OAuth2 / SSO 接入。
- 与 `fastapi-auth-module-skill` 保持 API 字段完全一致，方便前后端跨语言复用。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
Spring 授权模块、Spring Boot 权限模块、RBAC 模块、角色菜单权限、
企业组织架构、组织架构、部门管理、角色权限、菜单管理、数据权限、
springboot-auth-module、添加权限模块、帮我加一个 Spring 鉴权模块
```
