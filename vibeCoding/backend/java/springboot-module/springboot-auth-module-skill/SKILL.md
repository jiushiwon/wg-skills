---
name: springboot-auth-module-skill
description: Spring Boot授权与企业组织架构模块一键叠加技能。面向已使用 springboot-init-skill 或 springboot-skill 生成的项目，标准化落地 RBAC、角色-菜单绑定、部门/岗位/租户、数据权限、个人鉴权。触发词："Spring 授权模块","Spring Boot 权限模块","RBAC 模块","角色菜单权限","企业组织架构","springboot-auth-module","添加权限模块","帮我加一个 Spring 鉴权模块"。
---

# Spring Auth Module Skill

为 Spring Boot 项目**叠加**一套企业级授权与组织架构能力，不是重新生成新项目。

## 定位

- 目标：在已有 `springboot-init-skill` / `springboot-skill` 骨架上，添加可运行的 RBAC + 组织架构模块。
- 不替代：不重复生成 `springboot-init-skill` 已经提供的 JWT、统一响应、Swagger 等基础设施。
- 输出：实体、仓储、服务、控制器、Flyway 迁移、接口契约、接入指南。

## 依赖

- **springboot-init-skill**：基础 JWT、统一响应、分页、当前用户注解必须已存在。
- **frontend-request-skill**：响应信封、错误码、Token、分页字段必须保持对齐。
- **database-skill**：表前缀、字段命名、软删除、索引规范沿用。

## 用户问题（最多 3 个）

```
1. 现有项目的 Spring 包名是什么？（默认从 springboot-init-skill 推断，如 com.koala.myapp）
2. 表前缀是什么？（默认 wg）
3. 是否需要数据权限（全部 / 本部门 / 本部门及以下 / 仅本人）？（默认需要）
```

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **租户（Tenant）** | 多租户数据隔离，支持独立组织架构 |
| 2 | **组织架构（Org）** | 树形部门，支持 parent_id 递归 |
| 3 | **岗位（Post）** | 用户可绑定一个或多个岗位 |
| 4 | **用户（SysUser）** | 扩展基础 User，关联租户、部门、岗位、角色 |
| 5 | **角色（Role）** | RBAC 核心，支持数据权限范围 |
| 6 | **菜单/权限（Menu）** | 树形菜单 + 权限标识（permission），用于前端路由与按钮级鉴权 |
| 7 | **角色-菜单绑定** | 多对多，控制角色可见菜单与接口权限 |
| 8 | **用户-角色绑定** | 多对多，一个用户可拥有多个角色 |
| 9 | **数据权限** | 按角色数据范围过滤：全部、本部门、本部门及以下、仅本人 |
| 10 | **个人鉴权** | 登录 / 登出 / 修改密码 / 当前用户详情 / 获取菜单树 |
| 11 | **接口契约** | 生成 `api-contract-auth.md`，与前端对齐 |

## 生成的模块结构

```
src/main/java/{basePackage}/auth/
├── common/
│   ├── AuthConstants.java          # 权限常量
│   └── DataScope.java              # 数据权限枚举
├── controller/
│   ├── AuthController.java         # 登录 / 登出 / 当前用户 / 菜单树
│   ├── UserController.java         # 用户 CRUD + 绑定角色/岗位
│   ├── RoleController.java         # 角色 CRUD + 绑定菜单
│   ├── MenuController.java         # 菜单树 CRUD
│   ├── OrgController.java          # 组织架构树 CRUD
│   ├── PostController.java         # 岗位 CRUD
│   └── TenantController.java       # 租户 CRUD
├── dto/                            # 请求/响应 DTO
├── entity/                         # 实体
├── repository/                     # Spring Data JPA
├── service/                        # 业务逻辑
└── permission/
    ├── PermissionEvaluator.java    # 接口/按钮鉴权
    └── DataScopeFilter.java        # 数据权限过滤辅助

src/main/resources/db/migration/
├── V10__init_auth_module.sql       # 授权模块表结构

api-contract-auth.md                # 接口契约
docs/auth-module-guide.md           # 接入与扩展指南
```

## 数据权限规则

| 数据范围 | 含义 | 使用场景 |
|----------|------|----------|
| ALL | 全部数据 | 超级管理员 |
| DEPT_ONLY | 本部门数据 | 部门经理 |
| DEPT_AND_BELOW | 本部门及以下子部门 | 区域负责人 |
| SELF_ONLY | 仅本人数据 | 普通员工 |

## 生成流程

1. 确认已存在 Spring Boot 骨架（含 JWT、统一响应、当前用户注解）。
2. 询问用户包名、表前缀、是否需要数据权限。
3. 按 `references/skeleton.md` 生成 `auth/` 下全部源码与迁移文件。
4. 生成 `api-contract-auth.md` 与 `docs/auth-module-guide.md`。
5. 提示用户：
   - 用 `V10__init_auth_module.sql` 初始化表结构；
   - 若原项目已有 `User` 实体，建议用 `SysUser` 替换或扩展；
   - 重启服务后访问 `/api/auth/menus` 获取当前用户菜单树。

## 接口契约要点

- 响应信封：`{ code, message, data }`，与 `frontend-request-skill` 对齐。
- 登录：`POST /api/auth/login` 返回 `{ accessToken, refreshToken, tokenType, expiresIn }`。
- 当前用户：`GET /api/auth/me` 返回用户 + 角色 + 部门 + 岗位。
- 菜单树：`GET /api/auth/menus` 返回当前用户可见的树形菜单。
- 用户、角色、菜单、部门、岗位：标准分页 CRUD。

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract-auth.md` | 含登录、当前用户、菜单树、CRUD 全量接口 ✅ 已交付 |
| 接入指南 | `docs/auth-module-guide.md` | 表结构、数据权限、与 springboot-init-skill 集成步骤 |

## 红线

1. 不重复生成 Spring Boot 基础骨架。
2. 表名统一 `{prefix}_sys_user`、`{prefix}_sys_role` 等，遵循 `database-skill` 规范。
3. 所有删除为软删除（`deleted_at`）。
4. 菜单树使用 `parent_id` + `sort_order`，禁止嵌套集合。
5. 接口鉴权先走 Spring Security JWT，再走角色-菜单权限校验。
6. 所有注释、文档用中文。

## 后续迭代

- 支持岗位数据权限、自定义数据权限规则。
- 支持 OAuth2 / SSO 接入。
- 与 `fastapi-auth-module-skill` 保持 API 字段完全一致，方便前后端跨语言复用。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
Spring 授权模块、Spring Boot 权限模块、RBAC 模块、角色菜单权限、
企业组织架构、springboot-auth-module、添加权限模块、帮我加一个 Spring 鉴权模块
```
