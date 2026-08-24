# org-permission-skill

组织架构 + RBAC 权限模块生成器：在已有后端项目（含 auth-skill 的用户表）上长出完整的组织树、角色权限、菜单/按钮权限与数据权限能力。

## 功能

- 组织/部门树（ancestors 路径法，快速查子树）
- RBAC：用户 ↔ 角色 ↔ 权限，多角色权限取并集
- 权限 = 菜单 + 按钮一体（目录/菜单/按钮三类型）
- 数据权限：全部 / 自定义部门 / 本部门 / 本部门及子部门 / 仅本人，查询层统一拼接
- 权限缓存（Redis），变更即失效
- 超管（admin）单点绕过

## 使用方式

```
帮我加一个组织权限模块，要 RBAC 和数据权限
现有 Spring Boot 项目里做部门树 + 角色菜单权限，要按钮级
做一个 permission 模块，多角色、按部门过滤数据
```

技能会先确认数据权限、组织层级、多角色、按钮级权限等关键决策（都有默认值），然后产出表结构、接口契约增量和目标语言实现。

## 产出物

| 产出 | 内容 |
|------|------|
| 表结构 | `wg_dept`、`wg_role`、`wg_permission`、`wg_user_role`、`wg_role_permission`、`wg_role_dept` + `wg_user` 加 `dept_id`，含索引与删除约束 |
| 接口契约 | 14 个接口：部门 4、角色 6、权限 4、用户授权 2（含 `/api/auth/permissions` 前端鉴权） |
| 实现 | 按项目技术栈展开 Java/Go/Python/Node 对应实现要点为可运行代码 |

## 目录说明

```
org-permission-skill/
├── SKILL.md                  # 触发词、生成流程、问答清单、模块红线
├── README.md                 # 本文件
└── references/
    ├── domain-model.md       # 领域模型、表结构 DDL、状态机、Redis 键、数据权限范式
    ├── api-contract.md       # 接口契约增量（追加进项目 api-contract.md）
    ├── java.md               # Spring Boot 实现要点（注解 + AOP）
    ├── go.md                 # Gin 实现要点（中间件）
    ├── python.md             # FastAPI 实现要点（Depends）
    └── nodejs.md             # Express/NestJS 实现要点（中间件/Guard）
```

## 模块红线（摘要）

权限校验必须后端做（前端只是体验）；JWT 不放权限数据（走 DB + Redis 缓存，变更即失效）；删除前检查子节点与关联，违反返回 `-1005`；数据权限在查询层统一拼接禁止散落；perms 标识上线后禁止改名；错误码用闭集；超管绕过收敛在单点。完整红线见 SKILL.md。

## 依赖

- 用户与鉴权：auth-skill（`wg_user` 用户表 + 当前用户注入；本模块不建用户表，只加 `dept_id`）。
- 规范：backend-convention-skill（响应信封、错误码、JWT、契约模板，引用不复制）。
