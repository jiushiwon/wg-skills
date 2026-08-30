# springboot-auth-module-skill

> 为 Spring Boot 项目一键叠加企业级授权与组织架构模块：RBAC、角色-菜单、部门-岗位-租户、数据权限、个人鉴权。

## 一句话

在已有 Spring Boot 骨架上说一句"帮我加一个权限模块"，即可拿到一套可运行的 RBAC + 组织架构代码、迁移脚本与接口契约。

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
企业组织架构、springboot-auth-module、添加权限模块、帮我加一个 Java 鉴权模块
```

## 快速上手

```bash
# 1. 在 Claude Code 中说：
#    "在现有 Spring Boot 项目上加一个权限模块"

# 2. 回答 3 个问题：
#    Q1: 包名是什么？（默认 com.koala.{project}）
#    Q2: 表前缀是什么？（默认 wg）
#    Q3: 是否需要数据权限？（默认是）

# 3. 执行迁移后重启
./mvnw flyway:migrate   # 或手动执行 V10__init_auth_module.sql
./restart.sh dev
```

## 生成内容

```
auth/
├── controller/      # Auth / User / Role / Menu / Org / Post / Tenant
├── dto/             # 请求/响应 DTO
├── entity/          # 实体
├── repository/      # Spring Data JPA
├── service/         # 业务逻辑
├── permission/      # 权限校验与数据范围辅助
└── common/          # 常量、枚举

src/main/resources/db/migration/V10__init_auth_module.sql
api-contract-auth.md
docs/auth-module-guide.md
```

## 数据权限

| 范围 | 说明 |
|------|------|
| ALL | 全部数据 |
| DEPT_ONLY | 本部门 |
| DEPT_AND_BELOW | 本部门及以下子部门 |
| SELF_ONLY | 仅本人 |

在 `Role` 上设置 `data_scope`，查询时通过 `DataScopeFilter` 动态拼接条件。

## 核心接口

| 路径 | 说明 |
|------|------|
| `POST /api/auth/login` | 登录 |
| `POST /api/auth/logout` | 登出 |
| `GET /api/auth/me` | 当前用户详情 |
| `PUT /api/auth/password` | 修改密码 |
| `GET /api/auth/menus` | 当前用户菜单树 |
| `CRUD /api/users` | 用户管理 |
| `CRUD /api/roles` | 角色管理 |
| `CRUD /api/menus` | 菜单管理 |
| `CRUD /api/orgs` | 组织架构 |
| `CRUD /api/posts` | 岗位管理 |
| `CRUD /api/tenants` | 租户管理 |

## 表清单

| 表名 | 说明 |
|------|------|
| `{prefix}_sys_tenant` | 租户 |
| `{prefix}_sys_org` | 组织架构（树形） |
| `{prefix}_sys_post` | 岗位 |
| `{prefix}_sys_user` | 用户 |
| `{prefix}_sys_role` | 角色 |
| `{prefix}_sys_menu` | 菜单/权限（树形） |
| `{prefix}_sys_role_menu` | 角色-菜单关联 |
| `{prefix}_sys_user_role` | 用户-角色关联 |
| `{prefix}_sys_user_post` | 用户-岗位关联 |

## 与 springboot-init-skill 集成

1. 确保原项目已有 `JwtUtil`、`CurrentUser`、`ApiResponse`。
2. 将本模块源码复制到 `{basePackage}.auth` 包下。
3. 执行 `V10__init_auth_module.sql`。
4. 若原项目已有简单 `User` 实体，可删除或保留；本模块使用独立的 `SysUser`。
5. 启动后用 Swagger UI 验证接口。

## 版本日志

### v1.1.0 (2026-08-22)

- ✅ 新增 `references/skeleton.md` 代码骨架
- ✅ 新增 `api-contract-auth.md` 完整接口契约
- ✅ 与 `fastapi-auth-module-skill` 字段完全对齐

### v1.0.0 (2026-08-21)

- ✅ RBAC 核心（用户、角色、菜单）
- ✅ 组织架构（租户、部门、岗位）
- ✅ 角色-菜单、用户-角色、用户-岗位关联
- ✅ 数据权限（ALL / DEPT_ONLY / DEPT_AND_BELOW / SELF_ONLY）
- ✅ 个人鉴权（登录、登出、当前用户、菜单树、改密）
- ✅ 接口契约 `api-contract-auth.md`
- ✅ 接入指南 `docs/auth-module-guide.md`

## 后续规划

- OAuth2 / SSO 接入
- 岗位级数据权限
- 操作日志审计
- 与 `fastapi-auth-module-skill` 字段完全对齐

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**
