---
name: go-auth-module-skill
description: 在 Go（Gin + GORM）Web 项目上叠加 RBAC + 组织架构 + 通用登录（universal-login）权限模块。生成用户/角色/菜单/组织/岗位/租户、四档数据权限、38 个三段式权限常量、super_admin 双路径解析、应用密钥与绑定码、开放接口 HmacSHA256 签名鉴权；契约与 Java springboot-auth-module 及 vue-admin 前端逐字对齐，可做到「前端不动、直接桥接」。触发词：Go 权限模块、Go RBAC、go auth、Go 组织架构、Go 数据权限、Go 菜单权限、通用登录、universal login、应用绑定、开放接口签名、绑定码、super_admin、权限骨架、Go 复刻 Java 后台。
---

# Go Auth Module Skill

在 `go-gin-init-skill` 生成的项目上叠加**权限底座**：RBAC + 组织架构 + 通用登录。

契约与 Java `springboot-auth-module-skill` / `vue-admin-skill` **逐字对齐**，因此同一套前端可以
在「Java 后端」和「Go 后端」之间**零改动切换**——前端不用动一行代码，直接桥接。

> 已验证的落地实现见 `go-auth-admin` 仓库（Go 复刻 java-vue-admin 后台，21 项端到端冒烟全绿）。

## 依赖

- **go-gin-init-skill**：基础骨架（响应信封 / 错误码 / JWT / 启动脚本），本 skill 在其之上叠加
- **database-design-skill**：表前缀 `wg`、字段与索引规范
- **frontend-request-skill**：响应信封、错误码、Token 与前端消费契约

## 核心能力清单（9 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **RBAC** | 用户 / 角色 / 菜单（目录 M、页面 C、按钮 F）/ 组织 / 岗位 / 租户 |
| 2 | **三段式权限码** | `模块:资源:动作`，38 个常量唯一源，DB `permission` 列与前端 `v-permission` 逐字一致 |
| 3 | **super_admin 双路径** | 鉴权短路全量常量（38），`me()` 走 DB 派生（34）—— 见红线 1 |
| 4 | **四档数据权限** | `ALL / DEPT_AND_BELOW / DEPT_ONLY / SELF_ONLY`，多角色取最宽 |
| 5 | **菜单树** | 单表树形 `parent_id` 递归，含按钮级权限节点 |
| 6 | **通用登录（universal-login）** | 第三方应用 App + 密钥 AppKey + 绑定 AppBinding + 绑定码 BindCode |
| 7 | **开放接口应用签名** | `/api/open/**` 用 HmacSHA256 鉴权，300s 时间偏差、常量时间比较 |
| 8 | **绑定双向流程** | 应用发起（app_initiated）/ 宿主发起（user_initiated），绑定码一次性消费 |
| 9 | **零环境依赖** | 默认 `glebarez/sqlite`（纯 Go，CGO_ENABLED=0），无需安装数据库 |

## ★ 契约红线（本 skill 最值钱的部分，全是踩过的坑）

### 1. 两个权限解析路径**故意不同**，别合并

| 场景 | 数据来源 | super_admin 结果 |
|------|---------|----------------|
| `GET /api/auth/me`（前端权限数组） | **DB 派生**：`role_menu → menu.permission` | **34**（真实菜单权限：8 页面级 + 26 按钮级） |
| 鉴权中间件 `RequirePerm`（等价 `@PreAuthorize`） | DB 派生 **∪** 全量常量（super_admin 短路） | **38**（34 + 4 个无菜单的 `system:tenant:*`） |

对应 Java 的 `AuthorityLoader.permissions()` 与 `JwtAuthenticationFilter` 反射短路两条路径。
**不要**把 `me()` 也短路成 38——否则前端拿到的权限数组就和 Java 不一致了。

### 2. 目录菜单的 `permission` 必须存 **NULL**，不能存 `""`

- 装载权限的 SQL 是 `permission IS NOT NULL`，而**空串不是 NULL**，会被当成有效权限带进权限数组
- 实测后果：super_admin 的 `me()` 返回 **37**（34 真实 + 3 个空串），且菜单树里目录的
  `permission` 是 `""` 而不是 `null`（与 Java 不一致）
- 修法：模型字段用 `*string`，落库前把空串转 `nil`（`strPtr` 辅助函数）

### 3. 开放接口 `X-App-Key` 是 **AppKey.apiKey**，不是 `App.appKey`

| 字段 | 形态 | 用途 |
|------|------|------|
| `App.appKey` | `app_xxx` | 应用标识，**不参与签名** |
| `AppKey.apiKey` | `ak_xxx` | 密钥 ID，放进 `X-App-Key` 头并参与签名 |

混淆二者 → 中间件按 `api_key` 查 `AppKey` 表查不到 → 401「应用密钥无效或已禁用」。

### 4. 分页用 `list`，不是 `items` / `records`

分页响应固定 `{ list, total, page, pageSize }`，`page` 从 1 开始。

### 5. 哪些端点返回**裸数组**（前端「勿取 res.list」）

| 形态 | 端点 |
|------|------|
| **裸数组**（`data` 直接是数组） | `/api/posts`、`/api/bind`、`/api/menus`、`/api/orgs`、`/api/auth/menus` |
| **分页对象** | `/api/users`、`/api/roles`、`/api/apps`、`/api/apps/{id}/keys`、`/api/tenants` |

搞错会让前端表格一片空白（它按 `res.list` 取值却拿到数组）。

### 6. 种子权限串必须和 Java 逐字一致

种子菜单的 `permission` 字符串要与 Java `DataInitializer` **完全相同**（实测 34 个，已 diff 校验）。
多一个少一个都会让 super_admin 权限数与 Java 对不上。

### 7. `import` 必须写全 `github.com/glebarez/sqlite`

写成 `"glebarez/sqlite"`（少了 `github.com/` 前缀）时，`go mod tidy` 会误判该依赖未被使用而**删掉它**，
随后编译报 `package glebarez/sqlite is not in std`。

## 生成流程

1. **确认基础骨架已存在**（`go-gin-init-skill` 产物），否则先跑它
2. **建模型层**：`SysUser / SysRole / SysMenu / SysOrg / SysPost / SysTenant` + 关联
   `SysUserRole / SysUserPost / SysRoleMenu`，表前缀 `wg_sys_*`
3. **建通用登录模型**：`App / AppKey / AppBinding / BindCode`
4. **建常量与工具**：38 个权限常量、`AuthPermsAll`、`hasPerm`（super_admin 短路）、`fmtTime`
5. **建仓储层**：`FindRoleCodesByUser / FindPermissionsByUser / FindDataScopesByUser /
   FindMenuIDsByUser / ResolveDataScope / DescendantOrgIDs`
6. **建中间件**：CORS → 应用签名（仅 `/api/open/**`）→ JWT 鉴权（放行 login/refresh/health）→ `RequirePerm`
7. **建服务层**：Auth / User / Role / Menu / Org / Post / Tenant + App / Bind / OpenApi
8. **建路由**：逐字对齐 Java 控制器路径，每个受保护端点挂 `RequirePerm("...")`
9. **写种子数据**（首次启动、无用户时注入）
10. **编译 + 冒烟**：`go build` 后按 `references/seed.md` 的冒烟清单验证

## 模块结构

```
backend/
├── config.go        # 读 .env，端口/DB/JWT 默认值与 Java application.yml 对齐
├── model.go         # 全部 GORM 模型 + 表名 + 软删除
├── common.go        # 响应信封、分页、AppError、JWTManager、权限常量、工具函数
├── middleware.go    # CORS / AuthMiddleware / RequirePerm / AppSigMiddleware
├── repo.go          # 角色码、权限、数据权限、菜单 ID、子孙组织
├── service.go       # 用户/角色/菜单/组织/岗位/租户 + 认证
├── service_app.go   # 应用/密钥/绑定/开放接口
├── handler.go       # RegisterRoutes：路径与 Java 逐字一致
├── seed.go          # 种子数据
└── main.go          # 装配 + AutoMigrate + Seed + 启动
```

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/contract-redlines.md` | 响应信封、分页、权限双路径、数据权限四档、时间与软删除约定 |
| `references/rbac-schema.md` | 全部表结构与模型字段（含软删除、密码只写不读） |
| `references/universal-login.md` | 应用/密钥/绑定/绑定码 + 开放接口 HmacSHA256 签名方案 |
| `references/seed.md` | 种子数据清单（账户/角色/菜单/组织/岗位）+ 端到端冒烟清单 |

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract.md` | 在 go-gin-init 契约上追加本模块的全部端点 |
| 权限常量表 | `docs/perms.md` | 38 个权限码与对应菜单/按钮的映射，供前后端核对 |

## 红线（不可绕过）

1. **不把 `me()` 与鉴权上下文的权限合并**：二者分属 DB 派生与常量短路两条路径（见契约红线 1）
2. **目录菜单 permission 存 NULL**：严禁存空串（见契约红线 2）
3. **开放接口签名头用 `AppKey.apiKey`**：严禁用 `App.appKey`（见契约红线 3）
4. **分页字段必须是 `list`**：禁止 `items` / `records`
5. **`apiSecret` 仅创建响应返回一次**：列表/详情永不返回，且不得把 secret 回写后再返回
   （历史缺陷：`setApiSecret(null)` 让前端永远拿不到，同时把库里 secret 写成 null）
6. **绑定码一次性消费**：5 分钟有效，使用后立刻失效
7. **绑定确认只接收 `{ code }`**：身份一律取自登录态，禁止接收用户名/密码（旧版越权漏洞）
8. **软删除用 `deleted_at`**：权限装载、菜单查询都必须带 `deleted_at IS NULL`
9. **密码字段只写不读**：`json:"-"`，任何 VO 都不得带密码
10. **所有注释、文档用中文**
11. **不替用户提交 git**
12. **不在 SKILL.md 锁定版本号**：Go / Gin / 依赖版本现场查官方源最新稳定版

## 触发关键词清单

```
Go 权限模块、Go RBAC、go auth、Go 组织架构、Go 数据权限、
Go 菜单权限、通用登录、universal login、应用绑定、开放接口签名、
绑定码、super_admin、权限骨架、Go 复刻 Java 后台
```

## 相关技能

- **go-gin-init-skill**：基础骨架（本 skill 在其之上叠加权限模块）
- **vue-admin-skill**：前端与后端契约的对照来源（Java 侧）
- **universal-login-bridge-skill**：通用登录的前端桥接

## 不做

- 不重复生成基础骨架（那是 go-gin-init-skill 的活）
- 不生成无契约的权限代码（必须与前端/Java 契约对齐）
- 不硬编码版本号
- 不替用户提交 git
- 不加未请求的中间件（Redis、消息队列等，除非用户明确要求）
