---
name: vue-admin-skill
description: 管理后台一键生成技能。组合前端（vue-base-skill/vue-table-skill/vue-form-skill）+ 后端（springboot-init/fastapi-init/go-gin-init）+ 数据库（database-design-skill）+ 鉴权（auth-module-skill），一键生成完整管理后台系统。不使用任何第三方组件库，全部基于 wg-skills 技能矩阵。触发词："管理后台"、"admin 系统"、"后台管理"、"管理系统"、"一键生成管理后台"。
---

# Vue Admin Skill

**项目级技能**：组合现有技能矩阵，一键生成完整管理后台系统。

## 核心理念

> **不使用任何第三方组件库（Element Plus / Ant Design / Vuetify 等），全部基于 wg-skills 技能矩阵。**

本技能是一个**编排器**，负责协调前端、后端、数据库、鉴权等技能，一次性生成完整的管理后台项目。

## 技能矩阵

### 前端层

| 技能 | 用途 | 生成内容 |
|------|------|----------|
| `vue-base-skill` | 基础组件 | 按钮、卡片、标签、弹窗、抽屉 |
| `vue-table-skill` | 表格组件 | 数据表格、搜索、分页、批量操作 |
| `vue-form-skill` | 表单组件 | 基础表单、联动表单、步骤表单 |
| `vue-tree-skill` | 树形组件 | 菜单树、组织架构树、权限树 |
| `vue-contextmenu-skill` | 右键菜单 | 表格行操作、自定义菜单 |
| `vue-theme-skill` | 主题系统 | 暗黑模式、主题切换、Design Token |
| `vue-style-skill` | 样式规范 | 统一样式、响应式布局 |
| `frontend-request-skill` | 请求层 | API 封装、拦截器、错误处理 |

### 后端层（按语言选择）

| 语言 | 技能组合 |
|------|----------|
| **Java** | `springboot-init-skill` + `springboot-auth-module-skill` + `springboot-dict-module-skill` |
| **Python** | `fastapi-init-skill` + `fastapi-auth-module-skill` + `fastapi-dict-module-skill` |
| **Go** | `go-gin-init-skill` + `go-ws-module-skill` |

### 数据库层

| 技能 | 用途 |
|------|------|
| `database-design-skill` | 数据库设计规范（表名/索引/关联） |
| `mysql-guide-skill` | MySQL 集成参考 |
| `pgsql-guide-skill` | PostgreSQL 集成参考 |
| `redis-guide-skill` | Redis 缓存（可选） |

### 规范层

| 技能 | 用途 |
|------|------|
| `backend/shared/` | 统一响应信封、错误码、JWT、分页（公共规范层） |
| `springboot-auth-module-skill` / `fastapi-auth-module-skill` | JWT 鉴权、权限控制（按语言选择） |

## 交互流程

```
1. 询问项目名称（默认 my-admin）
2. 询问后端语言：Java / Python / Go
3. 询问数据库：MySQL / PostgreSQL
4. 是否需要 Redis 缓存（默认不需要）
5. 依次调用各技能生成代码
6. 整合为完整项目
7. 输出项目结构和启动说明
```

## 生成内容

### 前端（Vue3）

```markdown
frontend/
├── src/
│   ├── components/          # 基础组件（来自 vue-base-skill）
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseModal.vue
│   │   ├── BaseDrawer.vue
│   │   └── BaseTag.vue
│   ├── table/               # 表格组件（来自 vue-table-skill）
│   │   ├── ProTable.vue
│   │   └── TableSearch.vue
│   ├── form/                # 表单组件（来自 vue-form-skill）
│   │   ├── ProForm.vue
│   │   └── FormDrawer.vue
│   ├── tree/                # 树形组件（来自 vue-tree-skill）
│   │   └── ProTree.vue
│   ├── layout/              # 布局系统
│   │   ├── AppLayout.vue
│   │   ├── Sidebar.vue
│   │   ├── Navbar.vue
│   │   └── Breadcrumb.vue
│   ├── views/               # 页面模板
│   │   ├── login/           # 登录页
│   │   ├── dashboard/       # 仪表盘
│   │   ├── system/          # 系统管理
│   │   │   ├── user/        # 用户管理
│   │   │   ├── role/        # 角色管理
│   │   │   └── menu/        # 菜单管理
│   │   └── profile/         # 个人中心
│   ├── router/              # 路由配置
│   ├── store/               # 状态管理（Pinia）
│   ├── api/                 # API 接口
│   ├── utils/               # 工具函数
│   └── styles/              # 样式（来自 vue-style-skill）
├── package.json
└── vite.config.ts
```

### 后端（以 Java 为例）

```markdown
backend/
├── src/main/java/
│   ├── controller/          # 控制器
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── RoleController.java
│   │   └── MenuController.java
│   ├── service/             # 业务逻辑
│   ├── repository/          # 数据访问
│   ├── entity/              # 实体类
│   ├── dto/                 # 数据传输对象
│   ├── config/              # 配置类
│   └── common/              # 公共模块
├── pom.xml
└── application.yml
```

### 数据库

```markdown
database/
├── init.sql                 # 初始化脚本
│   ├── wg_sys_user          # 用户表
│   ├── wg_sys_role          # 角色表
│   ├── wg_sys_menu          # 菜单表
│   ├── wg_sys_permission    # 权限表
│   ├── wg_sys_user_role     # 用户角色关联
│   └── wg_sys_role_permission # 角色权限关联
└── .env.example             # 数据库配置
```

## 核心功能模块

### 1. 登录/注册

- 登录页（用户名+密码+验证码）
- JWT Token 管理
- 路由守卫
- 记住密码

### 2. 布局系统

- 侧边栏（折叠/展开）
- 顶部导航栏
- 面包屑
- 多标签页
- 暗黑模式切换

### 3. 权限管理

- 用户管理（CRUD、状态切换、重置密码）
- 角色管理（CRUD、权限分配）
- 菜单管理（树形结构、排序、图标）
- 按钮级权限（v-permission 指令）

### 4. 数据展示

- 数据表格（搜索、排序、分页、批量操作）
- 数据卡片
- 图表统计（可选）

### 5. 系统设置

- 字典管理（来自 dict-module-skill）
- 个人中心（修改密码、头像）
- 系统日志（来自 log-module-skill，可选）

## 生成示例

用户输入：

```markdown
/vue-admin-skill 帮我生成一个后台管理系统
```

AI 交互：

```markdown
1. 项目名称？（默认 my-admin）
2. 后端语言？Java / Python / Go
3. 数据库？MySQL / PostgreSQL
4. 是否需要 Redis？（默认不需要）
```

AI 输出：

```markdown
好的，我将为您生成一个完整的管理后台系统：
- 前端：Vue3 + vue-base-skill + vue-table-skill + vue-form-skill
- 后端：Spring Boot + springboot-auth-module-skill
- 数据库：MySQL + database-design-skill
- 鉴权：JWT + springboot-auth-module-skill（或 fastapi-auth-module-skill）

正在生成项目...
```

## 不做

- 不使用任何第三方组件库（Element Plus / Ant Design / Vuetify 等）
- 不负责服务器部署（使用 super-deploy-skills）
- 不处理具体业务逻辑（只生成骨架和基础模块）
- 不替用户选择技术栈（由用户决定）

## 依赖关系

```markdown
vue-admin-skill（编排器）
    │
    ├── 前端技能
    │   ├── vue-base-skill
    │   ├── vue-table-skill
    │   ├── vue-form-skill
    │   ├── vue-tree-skill
    │   ├── vue-contextmenu-skill
    │   ├── vue-theme-skill
    │   ├── vue-style-skill
    │   └── frontend-request-skill
    │
    ├── 后端技能（按语言）
    │   ├── springboot-init-skill + auth-module + dict-module
    │   ├── fastapi-init-skill + auth-module + dict-module
    │   └── go-gin-init-skill + ws-module
    │
    ├── 数据库技能
    │   ├── database-design-skill
    │   ├── mysql-guide-skill / pgsql-guide-skill
    │   └── redis-guide-skill（可选）
    │
    └── 规范层
        ├── backend/shared/（响应信封/错误码/JWT/分页）
        └── springboot-auth-module-skill / fastapi-auth-module-skill
```
