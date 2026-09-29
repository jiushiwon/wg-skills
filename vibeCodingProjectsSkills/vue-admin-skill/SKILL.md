---
name: vue-admin-skill
description: Vue3 管理后台一键生成技能。整合前端（vue-base-skill 目录索引下的 14 个子技能）+ 后端（springboot-init-skill + springboot-auth-module-skill）+ 数据库（database-design-skill + mysql-guide-skill），输出 Java + Vue3 + MySQL 完整可运行管理后台（登录 / Dashboard / 用户 / 角色 / 菜单 / 组织 / 示例商品 6 大页面）。默认账号 admin/admin123。前端通过 file: 协议软链接依赖技能，不复制源代码；后端基础设施为 springboot-init-skill/demo 的衍生派生（见 template/backend/README.md#provenance）。请求层参考 frontend-request-skill 规范，封装由 vue-admin-skill 自带 utils/request.ts。触发词："管理后台"、"admin 系统"、"后台管理"、"一键生成管理后台"、"RBAC 权限系统"、"Vue3 管理端"。
---

# Vue Admin Skill

**项目级编排器 + 整合模板**：基于 wg-skills 技能矩阵，输出 Java + Vue3 + MySQL 完整可运行管理后台。

## 核心理念

> **本技能是项目级编排器。**
> **前端**通过 `file:` 协议软链接 vue-base-skill 子技能，**不复制**其源代码；
> **后端** common/ + config/ 为 springboot-init-skill/demo 的**衍生派生**（每文件顶部标注派生来源），auth/ 为基于 springboot-auth-module-skill/api-contract-auth.md 契约对齐的**手写完整 RBAC**。

| 类别 | 整合方式 | 理由 |
|------|----------|------|
| **前端组件** | `package.json` 用 `file:` 协议软链接到同级目录的 vue-* 技能包 | 单一事实源（single source of truth） |
| **后端代码** | 单工程内复用 springboot-init demo + springboot-auth-module 叠加层 | Java 单项目特性，无法拆包软链接 |
| **数据库 SQL** | 自包含于 vue-admin-skill/template/database/ | 部署独立，方便导入 |
| **文档** | 引用依赖技能的 SKILL.md | 不重复造轮子 |

---

## 依赖矩阵（18 个技能）

### 前端层（14 个）

| 技能 | 用途 |
|------|------|
| `vue-base-skill` | 目录索引（提供 14 个 vue-* 子技能统一浏览规范，本身无 `components/index.ts`） |
| `vue-login-skill` | LoginForm.vue + 9 种视觉风格 |
| `vue-layout-skill` | AppLayout + AppSidebar + AppHeader + AppMain + MenuItem |
| `vue-table-skill` | base-table + base-loading + base-paginated |
| `vue-form-skill` | base-form + base-form-item + base-form-render |
| `vue-tree-skill` | base-tree（菜单管理 / 组织树） |
| `vue-dialog-skill` | base-dialog + base-confirm |
| `vue-card-skill` | base-card（页面容器） |
| `vue-button-skill` | base-button（操作按钮） |
| `vue-tag-skill` | base-tag（状态显示） |
| `vue-dropdown-skill` | base-dropdown（用户下拉菜单） |
| `vue-input-skill` | base-input（文本/数字/密码） |
| `vue-select-skill` | base-select（下拉选择） |
| `vue-checkbox-skill` | base-checkbox（多选） |
| `vue-switch-skill` | base-switch（开关） |
| `frontend-request-skill` | 请求层**规范参考**（包级约束；封装由 vue-admin-skill 自带 `utils/request.ts`） |

### 后端层（3 个）

| 技能 | 用途 |
|------|------|
| `springboot-init-skill` | Spring Boot 3.x + Spring Security 6 + JWT + JPA 基础设施 |
| `springboot-auth-module-skill` | RBAC（用户/角色/菜单/部门/岗位/租户 + 数据权限） |
| `springboot-dict-module-skill` | 数据字典（可选，本模板未集成） |

### 数据库层（2 个）

| 技能 | 用途 |
|------|------|
| `database-design-skill` | 表前缀 `wg_`、字段命名、索引规范 |
| `mysql-guide-skill` | MySQL 8 连接 + 字段类型映射 |

---

## 一键生成指令

```
/vue-admin-skill 用 springboot + vue3 + mysql 给我生成一个管理后台系统
```

或更具体：

```
/vue-admin-skill 生成管理后台：前端 Vue3 + 后端 Spring Boot + 数据库 MySQL 8
```

---

## 模板结构

```
vue-admin-skill/
├── SKILL.md                          # 本文件
├── README.md                         # 快速入门
├── QUICKSTART.md                     # 一键启动指南（3 步启动）
├── references/
│   └── architecture.md               # 架构图 + 数据流 + 模块依赖
└── template/
    ├── frontend/                     # Vue3 前端（组装代码，不含组件实现）
    │   ├── package.json              # file: 软链接所有 vue-* 技能
    │   ├── vite.config.ts
    │   ├── tsconfig.json
    │   ├── index.html
    │   ├── .env.development          # BASE_URL=http://localhost:8080
    │   ├── .env.production
    │   └── src/
    │       ├── main.ts
    │       ├── App.vue
    │       ├── styles/               # tokens.css + global.css
    │       ├── utils/                # request.ts + auth.ts + error.ts
    │       ├── api/                  # auth.ts + user.ts + role.ts + menu.ts + org.ts + product.ts
    │       ├── store/                # user.ts + permission.ts + app.ts (Pinia)
    │       ├── router/               # index.ts + guards.ts
    │       ├── directives/           # permission.ts (v-permission)
    │       ├── layout/index.vue      # AppLayout 容器
    │       └── views/
    │           ├── login/index.vue
    │           ├── dashboard/index.vue
    │           ├── system/
    │           │   ├── user/index.vue
    │           │   ├── role/index.vue
    │           │   ├── menu/index.vue
    │           │   └── org/index.vue
    │           ├── example/product/index.vue
    │           └── error/{404,403}.vue
    └── backend/                      # Spring Boot 后端（单工程，复用 springboot-init + auth-module）
        ├── pom.xml
        ├── Dockerfile
        ├── docker-compose.yml        # MySQL 8 + Spring Boot 编排
        ├── restart.sh / restart.bat # 一键启动脚本
        ├── .env.example
        ├── README.md
        └── src/
            ├── main/
            │   ├── java/com/example/demo/
            │   │   ├── Application.java
            │   │   ├── common/       # ApiResponse + BusinessException + GlobalExceptionHandler + JwtUtil + JwtAuthenticationFilter + CurrentUser + CurrentUserArgumentResolver + PageRequest/Response
            │   │   ├── config/       # SecurityConfig + WebConfig + ResponseAdvice + OpenApiConfig + LoggingFilter
            │   │   ├── controller/   # AuthController + UserController + HealthController + UploadController + SseController
            │   │   ├── auth/         # RBAC 叠加层（auth-module **契约对齐**；vue-admin 自带完整手写实现）
            │   │   │   ├── controller/  # AuthController(扩展) + UserController(完整) + RoleController + MenuController + OrgController + PostController + TenantController
            │   │   │   ├── entity/      # SysTenant + SysOrg + SysUser + SysRole + SysMenu + SysPost + 关联表
            │   │   │   ├── repository/
            │   │   │   ├── service/
            │   │   │   ├── dto/
            │   │   │   └── permission/  # PermissionEvaluator + DataScopeFilter
            │   │   └── example/      # 示例业务（新增）
            │   │       ├── controller/  # ProductController
            │   │       ├── entity/     # Product
            │   │       └── repository/ # ProductRepository
            │   └── resources/
            │       ├── application.yml
            │       ├── application-dev.yml
            │       └── db/migration/V1__init.sql
            └── test/
    └── database/                     # 数据库脚本（自包含）
        ├── init.sql                  # 完整版（schema + seed）
        ├── schema.sql                # 仅表结构
        ├── seed.sql                  # 仅种子数据
        ├── docker-compose.yml        # MySQL 8 容器
        └── README.md
```

---

## 6 大业务页面

| # | 页面 | 路径 | 核心组件 | 说明 |
|---|------|------|----------|------|
| 1 | **登录页** | `/login` | `LoginForm` (vue-login-skill) | 默认 `frosted` 风格，9 种可选 |
| 2 | **Dashboard** | `/dashboard` | base-card + base-tag + base-button | 4 KPI + 1 卡片，演示基础组件 |
| 3 | **用户管理** | `/system/user` | base-table + base-paginated + base-dialog + base-form + base-confirm | 完整 CRUD + 分配角色/重置密码 |
| 4 | **角色管理** | `/system/role` | base-table + base-tree（菜单分配） | CRUD + 分配菜单树 |
| 5 | **菜单管理** | `/system/menu` | base-tree + base-form | 树形展示 + 详情编辑 |
| 6 | **组织管理** | `/system/org` | base-tree + base-form | 树形组织架构 + 编辑 |
| 7 | **示例商品**（业务） | `/example/product` | base-table + base-dialog + base-form | 演示非权限场景也能用本技能 |

---

## 默认账号（3 个，演示数据权限）

| 账号 | 密码 | 角色 | 数据权限 | 可访问菜单 |
|------|------|------|----------|-----------|
| `admin` | `admin123` | super_admin（超级管理员） | ALL | 全部 |
| `user_admin` | `admin123` | user_admin（用户管理员） | ALL | 系统管理（不含菜单管理） |
| `demo` | `admin123` | common_user（普通用户） | SELF_ONLY | 仅仪表盘 |

---

## 快速启动（3 步）

### Step 1：启动 MySQL + 导入数据库
```bash
cd template/database
docker compose up -d
docker exec -i vue-admin-mysql mysql -uroot -proot < init.sql
```

### Step 2：启动后端
```bash
cd ../backend
./restart.sh dev
# 或 Windows: restart.bat dev
```
访问 `http://localhost:8080/swagger-ui.html`

### Step 3：启动前端
```bash
cd ../frontend
pnpm install
pnpm dev
```
访问 `http://localhost:5173`

详细启动说明：[QUICKSTART.md](./QUICKSTART.md)

---

## 技术栈

| 层 | 技术 |
|------|------|
| 前端框架 | Vue 3.4 + Vite 5 + TypeScript 5 |
| 前端路由 | Vue Router 4 |
| 前端状态 | Pinia 2 |
| 前端请求 | Axios 1.6（封装参考 frontend-request-skill 规范，由 vue-admin-skill 自带 utils/request.ts） |
| 前端组件 | vue-base-skill 等 14 个技能（软链接） |
| 后端框架 | Spring Boot 3.x |
| 后端安全 | Spring Security 6 + jjwt 0.12.x |
| 后端 ORM | Spring Data JPA + Hibernate |
| 后端迁移 | Flyway |
| 后端文档 | springdoc-openapi |
| 数据库 | MySQL 8.0 |
| 构建 | Maven Wrapper |
| 容器 | Docker + docker compose |

---

## 关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 表前缀 | `wg_` | 与 springboot-init demo 一致 |
| User 表 | `wg_user`（扩展字段：tenant_id、org_id、avatar、status） | 兼容 springboot-init + auth-module |
| 数据权限 | ALL + SELF_ONLY 两种 | demo 阶段不引入 4 种数据范围复杂度 |
| 菜单渲染 | 后端 `/api/auth/menus` 返回 + 前端动态路由 | 与权限完全匹配 |
| 状态管理 | Pinia | Vue3 官方推荐 |
| 请求库 | axios | 拦截器生态成熟 |

---

## 不做（边界声明）

- **不复制**前端依赖技能源代码（vue-base-skill 子技能通过 `file:` 协议软链接）；后端 `common/` `config/` 为 springboot-init-skill/demo 的衍生派生（每文件顶部标注派生来源，差异详见 `template/backend/README.md#provenance`），`auth/` 为基于 springboot-auth-module-skill/api-contract-auth.md 契约对齐的手写完整 RBAC
- 不集成 springboot-dict-module（保持范围聚焦）
- 不集成 spring-boot-starter-data-redis（demo 阶段不引入）
- 不写业务页（订单 / 库存 / 财务等）——仅商品列表作为示例
- 不写部署脚本（已存在 super-deploy-skills）
- 不写数据可视化大屏（已存在 vue-dashboard-skill）
- 不写实时 WebSocket（mock 数据即可）
- 不写数据导入导出
- 不做国际化（i18n）

---

## 文件结构维护

修改本技能后，同步更新：
1. `vue-admin-skill/README.md`（如文件结构变化）
2. `vue-admin-skill/SKILL.md`（如依赖变化）
3. `vue-admin-skill/QUICKSTART.md`（如启动步骤变化）
4. `wg-skills/README.md`（如有目录结构变化）
5. `wg-skills/AGENTS.md`（如有目录结构变化）