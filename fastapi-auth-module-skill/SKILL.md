---
name: fastapi-auth-module-skill
description: FastAPI 授权与企业组织架构模块一键叠加技能。面向已使用 fastapi-init-skill 生成的项目，标准化落地 RBAC、角色-菜单、部门/岗位/租户、数据权限、个人鉴权。触发词："FastAPI 授权模块","Python 权限模块","FastAPI RBAC","角色菜单权限","企业组织架构","fastapi-auth-module","添加权限模块","帮我加一个 Python 鉴权模块"。
---

# FastAPI Auth Module Skill

为 FastAPI 项目**叠加**一套企业级授权与组织架构能力，不是重新生成新项目。

## 定位

- 目标：在已有 `fastapi-init-skill` 骨架上，添加可运行的 RBAC + 组织架构模块。
- 不替代：不重复生成 `fastapi-init-skill` 已经提供的 JWT、统一响应、SQLModel 等基础设施。
- 输出：模型、仓储、服务、路由、数据库迁移、接口契约、接入指南。

## 骨架依赖（子模块）

> 本模块是 `fastapi-init-skill` 的子模块，必须在骨架基础上使用。

**使用前必须满足以下条件：**

1. ✅ 已安装 `fastapi-init-skill`（项目骨架）
2. ✅ 骨架包含：JWT、统一响应、SQLModel、分页、目录结构
3. ✅ 遵循骨架的表前缀、字段命名、软删除规范

**检测逻辑：**
1. 读取用户项目根目录 `SKILL.md` 或 `README.md`
2. 检测是否包含 `fastapi-init-skill` 相关内容
3. 如未检测到骨架，提示："本模块需要先安装 fastapi-init-skill 骨架"
4. 如用户拒绝安装骨架，则终止并提示无法使用

## 用户问题（最多 3 个）

```
1. 现有项目的包名是什么？（默认从 fastapi-init-skill 推断，如 app）
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
src/
├── auth/
│   ├── __init__.py
│   ├── constants.py              # 权限常量
│   ├── enums.py                 # 数据权限枚举
│   ├── dependencies.py          # 权限校验依赖
│   ├── schemas.py               # Pydantic schemas
│   ├── models.py                # SQLModel 模型
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py              # 登录 / 登出 / 当前用户 / 菜单树
│   │   ├── users.py             # 用户 CRUD + 绑定角色/岗位
│   │   ├── roles.py             # 角色 CRUD + 绑定菜单
│   │   ├── menus.py             # 菜单树 CRUD
│   │   ├── orgs.py              # 组织架构树 CRUD
│   │   ├── posts.py             # 岗位 CRUD
│   │   └── tenants.py           # 租户 CRUD
│   └── services/
│       ├── __init__.py
│       ├── auth_service.py
│       ├── user_service.py
│       ├── role_service.py
│       ├── menu_service.py
│       └── data_scope.py        # 数据权限过滤辅助

alembic/versions/auth_module.py   # 迁移文件

api-contract-auth.md              # 接口契约
docs/auth-module-guide.md         # 接入与扩展指南
```

## 数据权限规则

| 数据范围 | 含义 | 使用场景 |
|----------|------|----------|
| ALL | 全部数据 | 超级管理员 |
| DEPT_ONLY | 本部门数据 | 部门经理 |
| DEPT_AND_BELOW | 本部门及以下子部门 | 区域负责人 |
| SELF_ONLY | 仅本人数据 | 普通员工 |

## 生成流程

1. 确认已存在 FastAPI 骨架（含 JWT、统一响应、分页）。
2. 询问用户包名、表前缀（默认 wg）、是否需要数据权限。
3. 按 `references/skeleton.py` 生成 `auth/` 下全部源码：
   - 将所有 `{prefix}` 占位符替换为用户指定的表前缀（如 `wg_`）
   - 将 `src.auth` 替换为用户的包名（如 `app.auth`）
4. 生成 `api-contract-auth.md` 与 `docs/auth-module-guide.md`。
5. 提示用户：
   - 用 `alembic upgrade head` 初始化表结构；
   - 若原项目已有 `User` 模型，建议用 `SysUser` 替换或扩展；
   - 重启服务后访问 `/api/auth/menus` 获取当前用户菜单树。

## 接口契约要点

- 响应信封：`{ code, message, data }`，与 `frontend-request-skill` 对齐。
- 登录：`POST /api/auth/login` 返回 `{ access_token, refresh_token, token_type, expires_in }`。
- 当前用户：`GET /api/auth/me` 返回用户 + 角色 + 部门 + 岗位。
- 菜单树：`GET /api/auth/menus` 返回当前用户可见的树形菜单。
- 用户、角色、菜单、部门、岗位：标准分页 CRUD。

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract-auth.md` | 含登录、当前用户、菜单树、CRUD 全量接口 ✅ 已交付 |
| 接入指南 | `docs/auth-module-guide.md` | 表结构、数据权限、与 fastapi-init-skill 集成步骤 |

## 红线

1. 不重复生成 FastAPI 基础骨架。
2. 表名统一 `{prefix}_sys_user`、`{prefix}_sys_role` 等，遵循 `database-skill` 规范。
3. 所有删除为软删除（`deleted_at`）。
4. 菜单树使用 `parent_id` + `sort_order`，禁止嵌套集合。
5. 接口鉴权先走 FastAPI 依赖注入 JWT 校验，再走角色-菜单权限校验。
6. 所有注释、文档用中文。

## 与 java-auth-module-skill 对齐

- 接口路径、字段命名、响应结构与 Java 版本完全一致
- 确保前端一套 API 可同时对接 Java 和 Python 后端

## 后续迭代

- 支持岗位数据权限、自定义数据权限规则。
- 支持 OAuth2 / SSO 接入。
- 与 `java-auth-module-skill` 保持 API 字段完全一致，方便前后端跨语言复用。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
FastAPI 授权模块、Python 权限模块、FastAPI RBAC、角色菜单权限、
企业组织架构、fastapi-auth-module、添加权限模块、帮我加一个 Python 鉴权模块
```
