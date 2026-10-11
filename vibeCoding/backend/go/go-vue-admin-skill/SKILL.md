---
name: go-vue-admin-skill
description: 零代码表单驱动的 Go+Vue 管理后台。核心是契约驱动表单，后端定义实体/接口 → 生成 FormSchema → 前端自动渲染完整页面。集成 RBAC 权限体系、通用 CRUD、7 种布局、6 种菜单。一键生成完整管理后台。触发词：Go+Vue后台、零代码表单、契约驱动表单、管理后台生成、Go管理后台、Vue+Go管理系统。
---

# go-vue-admin-skill

> 零代码表单驱动的 Go+Vue 管理后台
>
> 核心：契约驱动表单（后端定义 → 前端自动渲染）
>
> 配套：RBAC 权限 + 通用 CRUD + 7 种布局 + 6 种菜单

## 核心定位

**不是简单的技能组合，而是完整的付费产品级解决方案**。

- 整合了 vue-form-skill、vue-table-skill、vue-layout-skill 等核心代码
- 整合了 go-auth-module-skill 权限模块
- 所有代码独立内聚，不依赖外部技能引用

## 系统架构

```
go-vue-admin-skill/
├── frontend/                    # Vue3 前端（完整内聚）
│   ├── components/            # 组件库
│   ├── views/                 # 页面模板
│   └── styles/                # 样式系统
│
└── backend/                   # Go + Gin 后端
    ├── modules/
    │   ├── auth/             # 权限模块
    │   └── crud/             # 通用 CRUD
    └── middleware/           # 中间件
```

## 核心能力

### 1. 契约驱动表单（零代码核心）

```
后端实体定义 → 自动生成 FormSchema → 前端自动渲染完整表单
```

### 2. 通用 CRUD

一张表 = 增删改查 API + 前端页面

### 3. 权限体系

- 用户管理、角色管理、菜单管理、部门管理
- JWT 鉴权、接口签名

### 4. 7 种布局 + 6 种菜单

| 布局 | 说明 |
|------|------|
| sidebar | 侧边栏用户（经典） |
| horizontal | 横向顶部 |
| topbar | 顶部双栏 |
| sidebar-user-bottom | 用户在菜单下 |
| mix | 混合模式 |
| sidebar-right | 侧边栏在右 |
| header-only | 只有顶栏 |

## 触发词

- Go+Vue后台
- 零代码表单
- 契约驱动表单
- 管理后台生成
- Go管理后台
- Vue+Go管理系统
