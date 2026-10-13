---
name: go-auth-module-skill
description: 在 Go（Gin + GORM）Web 项目上叠加 RBAC + 组织架构 + 通用登录（universal-login）权限模块。生成用户/角色/菜单/组织/岗位/租户、四档数据权限、39 个三段式权限常量、super_admin 双路径解析、应用密钥与绑定码、开放接口 HmacSHA256 签名鉴权；契约与 Java springboot-auth-module 及 vue-admin 前端逐字对齐，可做到「前端不动、直接桥接」。触发词：Go 权限模块、Go RBAC、go auth、Go 组织架构、Go 数据权限、Go 菜单权限、通用登录、universal login、应用绑定、开放接口签名、绑定码、super_admin、权限骨架、Go 复刻 Java 后台。
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
| 2 | **三段式权限码** | `模块:资源:动作`，39 个常量唯一源（34 个有菜单 + 5 个无菜单），DB `permission` 列与前端 `v-permission` 逐字一致 |
| 3 | **super_admin 双路径** | 鉴权短路全量常量（39），`me()` 走 DB 派生（34）—— 见红线 1 |
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
| 鉴权中间件 `RequirePerm`（等价 `@PreAuthorize`） | DB 派生 **∪** 全量常量（super_admin 短路） | **39**（34 + 5 个无菜单的：4 个 `system:tenant:*` + `system:api:view`） |

对应 Java 的 `AuthorityLoader.permissions()` 与 `JwtAuthenticationFilter` 反射短路两条路径。
**不要**把 `me()` 也短路成 39——否则前端拿到的权限数组就和 Java 不一致了。

> ⚠️ **数量会变**：39 里有 5 个「无菜单权限」（4 个 `system:tenant:*` + `system:api:view`）。
> 新增无菜单权限时常量集会增长，但 `me()` 的 34 只跟**种子菜单**走，不受影响。
> 别把这两个数字写死在文档里不复核 —— 曾因新增 `system:api:view` 后技能仍写 38 而产生偏差。

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

### 8. ★ 树构建必须**自顶向下递归**，禁止「迭代 + 先挂子再收根」

`MenuNodeVO.Children` / `OrgNodeVO.Children` 是 `[]XxxVO` **值切片**。任何形如

```go
if p != nil { p.Children = append(p.Children, *n) } else { roots = append(roots, *n) }
```

的迭代写法都会踩两类坑（Java 用对象引用天然免疫，Go 必须显式处理）：

- **根节点值拷贝**：`roots = append(roots, *n)` 拷的是当时的快照；父节点先于子节点被遍历时，
  之后挂上去的 children **不会同步进 roots 里的副本** → 整棵子树静默丢失。
- **三层更深一层**：即使改成「先挂完子、再收根」的两阶段，也只是修好根这一层 ——
  页面节点被拷进目录时同样是一个快照，之后挂到页面上的**按钮仍然丢失**。

实测症状：`/api/orgs` 只返回总公司且 `children` 为空；`/api/auth/menus` 只返回 3 目录 + 8 页面 = **11**，
26 个按钮全丢（正确应为 **37**）。

**唯一正确写法**：先按 `parentID` 分组，再递归构建，保证子树完整后才拷进父节点：

```go
var build func([]SysMenu) []MenuNodeVO
build = func(ms []SysMenu) []MenuNodeVO {
    out := make([]MenuNodeVO, 0, len(ms))
    for i := range ms {
        n := menuToNode(&ms[i])
        n.Children = build(byParent[ms[i].ID])   // 子树先完整，再拷
        out = append(out, n)
    }
    return out
}
```

父 ID 指向不存在记录的**孤儿节点要降级为根**（对齐 Java 的 `else roots.add(n)`），否则会整个消失。
验证时必须断言**节点总数**（37）与**三层结构**（用户管理下有 6 个按钮），只断言 `code:0` 会漏掉这个 bug。

## 生成流程

1. **确认基础骨架已存在**（`go-gin-init-skill` 产物），否则先跑它
2. **建模型层**：`SysUser / SysRole / SysMenu / SysOrg / SysPost / SysTenant` + 关联
   `SysUserRole / SysUserPost / SysRoleMenu`，表前缀 `wg_sys_*`
3. **建通用登录模型**：`App / AppKey / AppBinding / BindCode`
4. **建常量与工具**：39 个权限常量、`AuthPermsAll`、`hasPerm`（super_admin 短路）、`fmtTime`
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
| 权限常量表 | `docs/perms.md` | 39 个权限码与对应菜单/按钮的映射，供前后端核对（数量随无菜单权限增长，以代码为准） |

> ⚠️ 若叠加在 `go-gin-init-skill` 之上，该项目要求的 `docs/project-guide.md` 同样必须落地。

## ★ 收尾自检清单（交付前逐项打勾，历史教训）

2026-10-07 审计发现：功能层（端点/VO/权限码/种子/业务规则）可以做到全部对齐，
但**交付物、文档、中间件、脚本会被整批漏掉** —— 根因是「手写实现」而非「套模板生成」。
所以收尾必须走这张表，**不能凭记忆**：

```
[ ] api-contract.md          （按 go-gin-init/references/api-contract-template.md 生成）
[ ] docs/project-guide.md    （按 go-gin-init/references/project-guide-template.md 生成）
[ ] docs/perms.md            （本模块权限常量表）
[ ] restart.sh / restart.bat （用户风格：set -u / log() / get_port_pids / dev·stop·status）
[ ] README.md                （启动方式 + 默认账号 + 常见问题，不要只写两行标题）
[ ] .env + .env.example      （二者都要；.env 必须真正被 godotenv 加载）
[ ] 安全头中间件已装配        （go-gin-init 红线 6：强制开启）
[ ] gofmt -w . 已执行         （手写代码必留列对齐差异，实测可差 500+ 行）
[ ] 依赖版本为当前最新稳定版  （红线 2：禁止沿用记忆里的旧版本号）
```

**验证侧的配对本能陷阱**：比对 Java `@PreAuthorize` 时，注解顺序是
`@Operation → @PreAuthorize → @XxxMapping`。按行线性配对会**系统性错位一格**
（GET 拿到 create、POST 拿到 edit），必须按**方法签名切块**再提取。

## 红线（不可绕过）

1. **不把 `me()` 与鉴权上下文的权限合并**：二者分属 DB 派生与常量短路两条路径（见契约红线 1）
2. **目录菜单 permission 存 NULL**：严禁存空串（见契约红线 2）
3. **开放接口签名头用 `AppKey.apiKey`**：严禁用 `App.appKey`（见契约红线 3）
4. **分页字段必须是 `list`**：禁止 `items` / `records`
5. **`apiSecret` 仅创建响应返回一次**：列表/详情永不返回，且不得把 secret 回写后再返回
   （历史缺陷：`setApiSecret(null)` 让前端永远拿不到，同时把库里 secret 写成 null）
6. **树结构端点必须递归构建**：禁止「迭代 + 值拷贝进 roots」，否则子树静默丢失（见契约红线 8）。
   验收要断言节点总数 37 与三层结构，不能只看 `code:0`
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
