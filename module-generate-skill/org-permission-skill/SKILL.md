---
name: org-permission-skill
description: 组织架构与 RBAC 权限模块生成。用户要做组织/部门树、角色权限、菜单权限、按钮权限、数据权限、RBAC、给用户分配角色时使用。产出组织/角色/权限领域模型、表结构、接口契约增量与四语言实现要点，依赖 auth-skill 的用户表，遵循 backend-convention-skill。触发词："加权限"、"权限管理"、"RBAC"、"组织架构"、"部门树"、"角色权限"、"菜单权限"、"按钮权限"、"数据权限"、"给用户分配角色"、"role permission"、"org module"、"permission module"。
---

# Org Permission Skill

组织架构 + RBAC 权限模块生成器。产出：领域模型 + 表结构 + 接口契约增量 + 目标语言实现。

**依赖**：auth-skill（`wg_user` 用户表 + 当前用户注入，**本模块不建用户表**，只在 `wg_user` 上加 `dept_id` 字段）；backend-convention-skill（规范，引用不复制）。

## 生成流程

1. **问答确认边界**（见下节，未明确的一律按默认值并告知用户）。
2. 按 `references/domain-model.md` 产出表结构 DDL（含 `wg_user` 加 `dept_id` 的 ALTER 语句；不要数据权限则不建 `wg_role_dept`）。
3. 按 `references/api-contract.md` 把接口增量追加进项目 `api-contract.md`。
4. 按检测到的技术栈，展开 `references/<lang>.md` 为可运行代码。
5. 逐条核对「模块红线」。

## 问答清单（生成前确认）

| 决策 | 选项 | 默认 |
|------|------|------|
| 是否需要数据权限 | 要（按部门过滤数据）/ 不要（只做功能权限） | 要 |
| 组织层级是否有限制 | 不限 / 固定 N 层 | 不限 |
| 一个用户是否可多角色 | 可（权限取并集）/ 不可（单角色） | 可，权限取并集 |
| 是否需要按钮级权限 | 要（菜单+按钮一体）/ 不要（只到菜单） | 要 |

## 模块红线

1. **权限校验必须在后端做**。前端菜单/按钮显隐只是体验，每个写接口必须校验 `perms` 标识，无权限返回 `-1003`。
2. **JWT 不放权限数据**（与 auth-skill 一致）。权限走 DB + Redis 缓存（`perm:user:{userId}`），权限/角色/数据范围变更时立即失效缓存。
3. **删除约束**：删部门前检查子部门与关联用户；删角色前检查关联用户；删权限前检查子权限。存在关联则拒绝，返回 `-1005`。
4. **数据权限在查询层统一拼接** dept 过滤条件，收敛为一个 Where 拼接函数/拦截器，禁止散落在各业务里手写（范式见 `references/domain-model.md` 与各语言文件）。
5. **perms 标识一旦上线禁止改名**（前端与后端代码都引用它），只能废弃后新增。
6. 错误码用闭集：`-1001` 参数、`-1002` 未登录、`-1003` 无权限、`-1004` 不存在、`-1005` 冲突（唯一事实来源见 backend-convention-skill `references/response-format.md`，不另列码表）。
7. **超管（role code = `admin`）绕过所有校验的逻辑必须收敛在一个判断点**，禁止散落多处特判。

## 标准接口

见 `references/api-contract.md`：

- 部门：`GET /api/dept/tree`、`POST /api/dept`、`PUT /api/dept/{id}`、`DELETE /api/dept/{id}`
- 角色：`GET /api/role/page`、`POST /api/role`、`PUT /api/role/{id}`、`DELETE /api/role/{id}`、`PUT /api/role/{id}/permissions`、`PUT /api/role/{id}/data-scope`
- 权限/菜单：`GET /api/permission/tree`、`POST /api/permission`、`PUT /api/permission/{id}`、`DELETE /api/permission/{id}`
- 用户授权：`PUT /api/user/{id}/roles`、`GET /api/auth/permissions`

## 四语言实现要点

- Java：`references/java.md`（自定义注解 `@RequirePerm` + AOP 校验 perms，数据权限用统一 Where 拼接）
- Go：`references/go.md`（Gin 中间件 + handler 内校验函数）
- Python：`references/python.md`（FastAPI `Depends` 校验器）
- Node：`references/nodejs.md`（Express 中间件 / Nest Guard）

## 不做

- 不建用户表、不重做登录鉴权（那是 auth-skill 的事，本模块假设 `wg_user` 已存在）。
- 不做字段级/行级之外的细粒度 ACL（数据权限只到部门维度）。
- 不复制 backend-convention-skill 已有的响应信封、错误码表、JWT 工具与当前用户注入，本模块只在其上补权限业务。
