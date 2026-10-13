# go-auth-module-skill

Go 后端权限模块 - RBAC + 组织架构 + 通用登录

## 概述

在 `go-gin-init-skill` 生成的项目上叠加**权限底座**：RBAC + 组织架构 + 通用登录（universal-login）。

## 核心能力

| # | 能力 | 说明 |
|---|------|------|
| 1 | **RBAC** | 用户/角色/菜单/组织/岗位/租户 |
| 2 | **三段式权限码** | `模块:资源:动作`，39 个常量（34 有菜单 + 5 无菜单） |
| 3 | **super_admin 双路径** | 鉴权短路 + DB 派生 |
| 4 | **四档数据权限** | ALL/DEPT_AND_BELOW/DEPT_ONLY/SELF_ONLY |
| 5 | **菜单树** | 单表树形结构 |
| 6 | **通用登录** | 第三方应用接入 |
| 7 | **应用签名** | HmacSHA256 鉴权 |
| 8 | **绑定双向流程** | 应用发起/宿主发起 |
| 9 | **零环境依赖** | 默认 SQLite |

## 依赖

- go-gin-init-skill（基础骨架）
- database-design-skill（表前缀规范）
- frontend-request-skill（请求层规范）

## 快速使用

```bash
# 1. 初始化项目
go-gin-init new my-project

# 2. 叠加权限模块
cp -r go-auth-module-skill/* my-project/

# 3. 启动
cd my-project
go mod tidy
go run main.go
```

## 关键文件

- `SKILL.md` - 完整技能说明
- `references/contract-redlines.md` - 契约红线
- `references/rbac-schema.md` - RBAC 数据模型
- `references/universal-login.md` - 通用登录设计
- `references/seed.md` - 初始数据

## 配套前端

- `vue-admin-skill` - Vue3 + Element 后台
- 与 Java `springboot-auth-module-skill` 契约逐字对齐，可无改动切换

## 触发词

- Go 权限模块
- Go RBAC
- go auth
- Go 通用登录
- 权限骨架
