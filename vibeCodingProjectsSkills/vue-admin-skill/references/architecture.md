# vue-admin-skill 架构图

## 整体架构

```
┌──────────────────────────────────────────────────────────────────┐
│                          浏览器（用户）                            │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTP
┌──────────────────────────────▼───────────────────────────────────┐
│                   Vue3 前端（localhost:5173）                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  AppLayout (vue-layout-skill)                              │    │
│  │  ├─ AppSidebar (菜单树，来自后端)                         │    │
│  │  ├─ AppHeader (面包屑 + 用户下拉)                          │    │
│  │  └─ AppMain (router-view)                                  │    │
│  │      └─ Views/{login,dashboard,system/*,example/*}        │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Pinia Stores                                              │    │
│  │  ├─ userStore (token + userInfo + permissions)            │    │
│  │  ├─ permissionStore (dynamicRoutes + 菜单树)             │    │
│  │  └─ appStore (sidebarCollapsed + breadcrumbs)            │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  utils/request.ts (frontend-request-skill)                │    │
│  │  ├─ 请求拦截器（注入 Authorization: Bearer）               │    │
│  │  ├─ 响应拦截器（401 跳登录 / 错误码映射）                  │    │
│  │  └─ Token 刷新队列（避免并发请求全部失败）                  │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Axios / JSON
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Spring Boot 后端（localhost:8080）                │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Spring Security 6 + JWT (springboot-init-skill)           │    │
│  │  ├─ JwtAuthenticationFilter (解析 Token)                   │    │
│  │  ├─ SecurityConfig (路由权限配置)                          │    │
│  │  └─ CurrentUser 注解（注入当前用户 ID）                    │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Controller 层                                             │    │
│  │  ├─ AuthController (登录 / 登出 / 当前用户 / 菜单)         │    │
│  │  ├─ UserController (用户 CRUD + 分配角色/岗位)             │    │
│  │  ├─ RoleController (角色 CRUD + 分配菜单)                 │    │
│  │  ├─ MenuController (菜单树 CRUD)                           │    │
│  │  ├─ OrgController / PostController / TenantController     │    │
│  │  ├─ ProductController (示例业务)                           │    │
│  │  └─ HealthController / UploadController / SseController  │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Service 层                                                 │    │
│  │  ├─ AuthService / UserService / RoleService / MenuService │    │
│  │  ├─ OrgService / PostService / TenantService / ProductSrv │    │
│  │  └─ PermissionEvaluator / DataScopeFilter (数据权限)       │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Repository 层 (Spring Data JPA)                           │    │
│  │  ├─ UserRepository / RoleRepository / MenuRepository       │    │
│  │  ├─ OrgRepository / PostRepository / TenantRepository      │    │
│  │  └─ ProductRepository                                      │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  统一响应 (ApiResponse) + 全局异常 (GlobalExceptionHandler) │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬───────────────────────────────────┘
                               │ JDBC / Hibernate
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    MySQL 8（localhost:3306）                       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  数据库 vue_admin                                          │    │
│  │  ├─ wg_user (基础用户表 + auth-module 扩展字段)           │    │
│  │  ├─ wg_sys_tenant (租户)                                   │    │
│  │  ├─ wg_sys_org (组织架构，树形)                            │    │
│  │  ├─ wg_sys_post (岗位)                                     │    │
│  │  ├─ wg_sys_role (角色 + data_scope)                        │    │
│  │  ├─ wg_sys_menu (菜单树，M/C/B 三种类型)                   │    │
│  │  ├─ wg_sys_user_role (用户角色关联)                        │    │
│  │  ├─ wg_sys_user_post (用户岗位关联)                        │    │
│  │  ├─ wg_sys_role_menu (角色菜单关联)                        │    │
│  │  └─ wg_product (示例业务表)                                │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 数据流（以「用户管理」为例）

```
1. 用户进入「系统管理 → 用户管理」页面
   ↓
2. 前端 UserView 调用 userApi.getUserList({ page: 1, pageSize: 10 })
   ↓
3. request.ts 拦截器自动注入 Authorization: Bearer <token>
   ↓
4. 请求 GET /api/users?page=1&pageSize=10 到达后端
   ↓
5. Spring Security + JwtAuthenticationFilter 验证 token
   ↓
6. 注入 @CurrentUser Long userId 到 UserController.getUserList()
   ↓
7. UserService 调用 DataScopeFilter 过滤（按角色 data_scope）
   ↓
8. UserRepository.findAll(PageRequest) 执行 SQL
   ↓
9. Hibernate 自动加表前缀 wg_ → 查询 wg_user 表
   ↓
10. 返回 Page<User> 包装为 ApiResponse<PageResponse<User>>
    ↓
11. 前端响应拦截器判断 code === 0，返回 data
    ↓
12. base-table 渲染数据
```

---

## 模块依赖关系

```
vue-admin-skill
│
├─ 前端模块
│  ├─ vue-base-skill（目录索引，无 components/index.ts 入口）
│  │  ├─ vue-login-skill ─── LoginForm.vue（9 种风格）
│  │  ├─ vue-layout-skill ── AppLayout / Sidebar / Header / Main
│  │  ├─ vue-table-skill ──── base-table / base-loading / base-paginated
│  │  ├─ vue-form-skill ───── base-form / base-form-item / base-form-render
│  │  ├─ vue-tree-skill ───── base-tree
│  │  ├─ vue-dialog-skill ─── base-dialog / base-confirm
│  │  ├─ vue-card-skill ───── base-card
│  │  ├─ vue-button-skill ─── base-button
│  │  ├─ vue-tag-skill ────── base-tag
│  │  ├─ vue-dropdown-skill ─ base-dropdown
│  │  └─ vue-input/select/checkbox/radio/switch/datepicker-skill
│  └─ frontend-request-skill ─ request.ts axios 封装
│
├─ 后端模块（单工程分层）
│  ├─ springboot-init-skill（基础设施）
│  │  ├─ common/（ApiResponse / BusinessException / JwtUtil 等）
│  │  ├─ config/（SecurityConfig / WebConfig / ResponseAdvice）
│  │  ├─ controller/（AuthController / UserController / HealthController / UploadController / SseController）
│  │  └─ entity/（基础 User）
│  └─ springboot-auth-module-skill（RBAC 叠加）
│     ├─ auth/controller/（扩展 AuthController + 完整 UserController + RoleController + MenuController + OrgController + PostController + TenantController）
│     ├─ auth/entity/（SysTenant / SysOrg / SysUser / SysRole / SysMenu / SysPost + 关联表）
│     ├─ auth/repository/
│     ├─ auth/service/
│     ├─ auth/dto/
│     └─ auth/permission/（PermissionEvaluator / DataScopeFilter）
│
└─ 数据模块
   ├─ database-design-skill ─ 表前缀 wg_ / 字段命名 / 索引规范
   └─ mysql-guide-skill ───── MySQL 8 连接配置 / 字段类型映射
```

---

## 关键技术点

### 1. Token 注入与刷新
```
请求拦截器：
  if (needAuth && hasToken) {
    headers['Authorization'] = `Bearer ${token}`
  }

响应拦截器：
  if (code === 401) {
    // 尝试用 refreshToken 刷新
    if (refreshSuccess) {
      // 重发原请求
    } else {
      // 跳登录
    }
  }
```

### 2. 动态菜单渲染
```
登录成功
  ↓
  GET /api/auth/me → 获取 permissions[]
  GET /api/auth/menus → 获取菜单树
  ↓
  permissionStore.dynamicRoutes = 根据菜单树生成路由
  ↓
  router.addRoute(dynamicRoutes)
  ↓
  AppSidebar 渲染菜单树
```

### 3. 按钮级权限（v-permission 指令）
```
<base-button v-permission="['user:add']">新增</base-button>

实现：
  app.directive('permission', {
    mounted(el, binding) {
      const permissions = userStore.permissions
      if (!permissions.includes(binding.value)) {
        el.parentNode?.removeChild(el)
      }
    }
  })
```

### 4. 数据权限过滤（DataScope）
```
查询 wg_user 时：
  if (currentUser.data_scope === 'ALL') {
    // 不加过滤
  } else if (currentUser.data_scope === 'SELF_ONLY') {
    where += ' AND id = ?'  // 仅本人
  }
  // DEPT_ONLY / DEPT_AND_BELOW 通过 org_id IN (...) 实现
```

---

## 包结构（后端）

```
com.example.demo/
├── Application.java                   # 启动类
├── common/                            # springboot-init 内置基础设施
│   ├── ApiResponse.java               # 统一响应
│   ├── BusinessException.java         # 业务异常（含错误码 -1001 ~ -2000）
│   ├── GlobalExceptionHandler.java    # 全局异常处理
│   ├── JwtUtil.java                   # JWT 工具
│   ├── JwtAuthenticationFilter.java   # JWT 过滤器
│   ├── CurrentUser.java               # 当前用户注解
│   ├── CurrentUserArgumentResolver.java # 注解解析器
│   ├── PageRequest.java               # 分页请求
│   └── PageResponse.java              # 分页响应
├── config/                            # springboot-init 内置配置
│   ├── SecurityConfig.java            # Spring Security 配置
│   ├── WebConfig.java                 # Web MVC 配置
│   ├── ResponseAdvice.java            # 响应拦截器
│   ├── OpenApiConfig.java             # Swagger 配置
│   └── LoggingFilter.java             # 日志过滤器
├── controller/                        # springboot-init 内置 Controller
│   ├── AuthController.java            # 登录/登出/刷新/me
│   ├── UserController.java            # 基础用户 CRUD（被 auth 覆盖）
│   ├── HealthController.java          # 健康检查
│   ├── UploadController.java          # 文件上传
│   └── SseController.java             # SSE 流式
├── auth/                              # springboot-auth-module 叠加
│   ├── controller/
│   │   ├── AuthController.java        # 扩展 me 返回 roles/permissions + menus
│   │   ├── UserController.java        # 完整用户 CRUD + 分配角色/岗位
│   │   ├── RoleController.java        # 角色 CRUD + 分配菜单
│   │   ├── MenuController.java        # 菜单 CRUD
│   │   ├── OrgController.java         # 组织 CRUD
│   │   ├── PostController.java        # 岗位 CRUD
│   │   └── TenantController.java      # 租户 CRUD
│   ├── entity/
│   │   ├── SysTenant.java
│   │   ├── SysOrg.java
│   │   ├── SysUser.java               # 扩展用户实体
│   │   ├── SysRole.java
│   │   ├── SysMenu.java
│   │   ├── SysPost.java
│   │   ├── SysUserRole.java           # 关联表
│   │   ├── SysUserPost.java
│   │   └── SysRoleMenu.java
│   ├── repository/                    # Spring Data JPA
│   ├── service/                       # 业务逻辑
│   ├── dto/                           # DTO
│   └── permission/
│       ├── PermissionEvaluator.java   # 权限评估器
│       └── DataScopeFilter.java       # 数据权限过滤
└── example/                           # 新增示例业务
    ├── controller/
    │   └── ProductController.java     # 商品 CRUD
    ├── entity/
    │   └── Product.java
    └── repository/
        └── ProductRepository.java
```

---

## 前端目录（src/）

```
src/
├── main.ts                            # 入口
├── App.vue                            # 根组件
├── styles/
│   ├── tokens.css                     # 设计 Token（CSS 变量）
│   └── global.css                     # 全局 reset + 工具类
├── utils/
│   ├── request.ts                     # axios 封装（frontend-request-skill）
│   ├── auth.ts                        # Token localStorage 操作
│   └── error.ts                       # 错误码映射
├── api/                               # 接口层
│   ├── auth.ts                        # /api/auth/*
│   ├── user.ts                        # /api/users
│   ├── role.ts                        # /api/roles
│   ├── menu.ts                        # /api/menus
│   ├── org.ts                         # /api/orgs
│   └── product.ts                     # /api/products
├── store/                             # Pinia
│   ├── user.ts                        # token + userInfo + permissions
│   ├── permission.ts                  # dynamicRoutes + 菜单树
│   └── app.ts                         # sidebar 折叠 + 面包屑
├── router/
│   ├── index.ts                       # 静态路由 + 动态注入
│   └── guards.ts                      # 全局守卫
├── directives/
│   └── permission.ts                  # v-permission 指令
├── layout/
│   └── index.vue                      # AppLayout 容器（vue-layout-skill）
└── views/
    ├── login/index.vue                # 登录页（vue-login-skill）
    ├── dashboard/index.vue            # Dashboard
    ├── system/
    │   ├── user/index.vue             # 用户管理
    │   ├── role/index.vue             # 角色管理
    │   ├── menu/index.vue             # 菜单管理
    │   └── org/index.vue              # 组织管理
    ├── example/
    │   └── product/index.vue          # 商品列表
    └── error/
        ├── 404.vue
        └── 403.vue
```

---

## 与 vue-base-skill 软链接方式

```json
// frontend/package.json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0",
    "vue-base-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill",
    "vue-login-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-complex-skill/vue-login-skill",
    "vue-layout-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-layout-skill",
    "vue-table-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-table-skill",
    "vue-form-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-form-skill",
    "vue-tree-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-tree-skill",
    "vue-dialog-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-dialog-skill",
    "vue-card-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-card-skill",
    "vue-button-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-button-skill",
    "vue-tag-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-tag-skill",
    "vue-dropdown-skill": "file:../../../vibeCoding/frontend/vue/vue-base-skill/vue-dropdown-skill",
    "frontend-request-skill": "file:../../../vibeCoding/frontend/frontend-request-skill"
  }
}
```

**路径假设**：
```
vibecoding-portal/                                  ← 根目录
├── skills/
│   ├── vibecodingProjectsSkills/
│   │   └── vue-admin-skill/template/frontend/      ← 当前位置
│   └── vibeCoding/
│       ├── frontend/
│       │   ├── vue/vue-base-skill/
│       │   └── frontend-request-skill/
│       └── backend/java/
│           ├── springboot-init-skill/
│           └── springboot-module/springboot-auth-module-skill/
```

从 `template/frontend/` 到 `vibeCoding/frontend/vue/vue-base-skill/`：
```
../../../vibeCoding/frontend/vue/vue-base-skill
   ↑    ↑     ↑
   │    │     └─ vue-base-skill 目录
   │    └─────── vibeCoding 目录（从 template 出发需上溯3级）
   └─────────── 回到 skills/vibecodingProjectsSkills 的父级，即 skills/
```

实际路径深度可能因部署而异，请按实际调整。

---

## 升级策略

### 升级 vue-base-skill（前端组件）
1. 修改 `vue-base-skill` 下的组件代码
2. 重新 `pnpm install`（自动重新链接）
3. 重启前端服务

### 升级 springboot-init-skill（基础设施）
1. 同步 `springboot-init-skill/demo/src/main/java/com/example/demo/{common,config}/` 到 vue-admin-skill/template/backend/{common,config}/
2. 检查 application.yml 变更
3. 重新构建后端

### 升级 springboot-auth-module-skill（RBAC）
1. 同步 auth 目录的最新代码
2. 检查 api-contract-auth.md 接口契约变更
3. 同步调整前端对应 api/*.ts

---

## 性能特征

| 指标 | 数值 |
|------|------|
| 后端启动时间 | < 5 秒 |
| 前端首次加载 | < 2 秒 |
| 登录接口响应 | < 200ms |
| 菜单查询响应 | < 100ms |
| 数据库表数量 | 10 张权限表 + 1 张商品表 |
| API 接口数量 | 约 30 个 |
| 前端页面数量 | 7 个（登录/Dashboard/4 个系统管理 + 1 个示例） |
| 前端组件数量 | 0 个（全部从 vue-base-skill 软链接） |