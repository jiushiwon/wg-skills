# Nuxt 3 标准项目结构

## 完整目录树

```
project-root/
├── .nuxt/                    # [自动生成] Nuxt 构建产物，勿手动编辑
├── .output/                  # [自动生成] 构建输出目录
├── assets/                   # 需要构建工具处理的静态资源
│   ├── styles/
│   │   ├── variables.scss    # SCSS 变量
│   │   ├── mixins.scss       # SCSS Mixin
│   │   └── global.css        # 全局样式
│   └── images/               # 需要被构建处理的图片
├── components/               # Vue 组件（Nuxt 自动导入）
│   ├── AppLayout.vue
│   ├── AppHeader.vue
│   └── ui/                   # 可按功能分组
│       ├── BaseButton.vue
│       └── BaseTable.vue
├── composables/              # Vue 组合函数（Nuxt 自动导入）
│   ├── useAuth.ts
│   └── usePermission.ts
├── layouts/                  # 布局组件
│   ├── default.vue
│   └── admin.vue
├── middleware/               # 路由中间件
│   ├── auth.ts               # 客户端认证守卫
│   └── guest.ts              # 访客守卫（已登录跳转）
├── modules/                  # 本地 Nuxt 模块
│   └── my-module/
│       └── index.ts
├── pages/                    # 文件系统路由（Nuxt 自动生成路由）
│   ├── index.vue             # → /
│   ├── login.vue             # → /login
│   └── users/
│       ├── index.vue         # → /users
│       └── [id].vue          # → /users/:id
├── plugins/                  # Nuxt 插件（客户端/服务端生命周期）
│   ├── element-plus.ts       # UI 库插件
│   └── error-handler.ts      # 全局错误处理
├── public/                   # 不需要构建处理的静态资源（原样复制）
│   ├── favicon.ico
│   ├── logo.svg
│   └── robots.txt
├── server/                   # BFF 层（服务端专属）
│   ├── api/                  # API 路由 → /api/...
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   └── me.get.ts
│   │   └── users/
│   │       ├── index.get.ts
│   │       └── [id].get.ts
│   ├── middleware/            # 服务端中间件（所有 API 请求经过）
│   │   └── auth.ts
│   ├── routes/                # 服务端路由（非 /api 前缀）
│   │   └── health.ts
│   └── utils/                 # 服务端工具函数
│       ├── fetch-wrapper.ts   # 服务端 $fetch 封装
│       └── token.ts           # JWT 工具
├── utils/                    # 客户端工具函数（Nuxt 自动导入）
│   ├── request.ts            # 客户端请求封装（复用 frontend-request-skill）
│   └── request-ssr.ts        # SSR 双轨请求封装
├── types/                    # TypeScript 类型定义
│   ├── api.ts
│   ├── user.ts
│   └── env.d.ts
├── app.vue                   # 应用入口组件（替代 index.html）
├── error.vue                 # 全局错误页面
├── nuxt.config.ts            # Nuxt 核心配置
├── tsconfig.json             # TypeScript 配置
├── package.json
├── .env                      # 环境变量（本地开发）
├── .env.production           # 生产环境变量
└── .eslintrc.cjs             # ESLint 配置
```

## 各目录职责说明

### pages/ — 文件系统路由

Nuxt 的核心特性。每个 `.vue` 文件自动成为路由。

| 文件路径 | 生成路由 | 说明 |
|---------|---------|------|
| `pages/index.vue` | `/` | 首页 |
| `pages/about.vue` | `/about` | 关于页 |
| `pages/users/index.vue` | `/users` | 用户列表 |
| `pages/users/[id].vue` | `/users/:id` | 用户详情（动态路由） |
| `pages/[...slug].vue` | `/*` | 捕获所有（404） |

### composables/ — 组合函数

Nuxt **自动导入**，无需手动 import。用于封装有状态的复用逻辑。

```
composables/
├── useAuth.ts        # 认证逻辑（登录、登出、token 管理）
├── usePermission.ts  # 权限校验
└── usePagination.ts  # 分页逻辑
```

### layouts/ — 布局系统

通过 `definePageMeta({ layout: 'xxx' })` 指定页面使用的布局。

```
layouts/
├── default.vue       # 默认布局（顶栏 + 内容区）
└── admin.vue         # 管理后台布局（侧边栏 + 顶栏 + 内容区）
```

### middleware/ — 路由中间件

客户端中间件在页面导航前执行。

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')
  if (!token.value) {
    return navigateTo('/login')
  }
})
```

### server/ — BFF 层

完全独立于客户端，运行在 Node.js 环境，可以访问数据库、文件系统等。

- `server/api/` — REST API 路由
- `server/middleware/` — 服务端中间件（所有请求经过）
- `server/routes/` — 非 API 前缀的服务端路由
- `server/utils/` — 服务端工具函数（不泄露到客户端）

### plugins/ — 插件

在 Nuxt 应用启动时执行，可以做第三方库注册、全局注入等。

```typescript
// plugins/error-handler.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (err) => {
    console.error('[全局错误]', err)
  }
})
```

### assets/ vs public/

| 目录 | 处理方式 | 典型文件 |
|------|---------|---------|
| `assets/` | 构建工具处理（压缩、编译、hash） | SCSS、SVG sprite、需要优化的图片 |
| `public/` | 原样复制到输出目录 | favicon、robots.txt、OG 图片 |

### types/ — TypeScript 类型

项目共享的类型定义。`env.d.ts` 用于声明 Nuxt 自动生成的类型和环境变量类型。
