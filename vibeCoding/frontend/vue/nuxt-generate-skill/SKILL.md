---
name: nuxt-generate-skill
description: 当用户要创建 Nuxt 3（Vue 生态的全栈框架，非 React 的 Next.js）+ TypeScript + Pinia 全栈项目时使用。引导完成需求澄清、项目初始化、SSR/SEO 配置、请求层集成、BFF API 层、认证中间件、后置验证。严格对齐 frontend-request-skill 请求层规范。触发词："帮我做一个 Nuxt 项目"、"初始化 Nuxt3 模板"、"用 Nuxt 做一个 SSR 网站"、"做一个 Nuxt 后台管理系统"。注意：Nuxt ≠ Next.js，如用户提到 Next.js 请使用 next-generate-skill。
---

# Nuxt 3 全栈项目骨架生成

> 当用户要创建 Nuxt 3 + TypeScript + Pinia 全栈项目时触发本技能。

## When to Use

- 用户明确提到 **Nuxt / Nuxt3 / Nuxt.js**
- 需要 **SSR / SSG / ISR** 渲染模式
- 需要 **SEO 优化**（企业官网、内容站、电商）
- 需要 **BFF API 层**（server/api/ 做后端代理）
- 需要前后端同仓库的**全栈项目**

## When NOT to Use

- 纯 SPA（无 SSR 需求）→ 使用 `vue-generate-skill`
- 小程序 / App / 跨端 → 使用 `uniapp-app-generate-skill`
- React / Next.js 生态 → 使用 `next-generate-skill`
- 静态文档站 → 使用 VitePress / Nuxt Content

## 核心能力清单

| 能力 | 说明 |
|------|------|
| SSR 双轨请求 | 客户端 fetch + 服务端 $fetch，自动切换 |
| BFF API 层 | server/api/ + H3 event handler，代理 + 鉴权 |
| SEO 开箱即用 | useHead / useSeoMeta / sitemap / robots / JSON-LD |
| 认证双层 | 客户端中间件路由守卫 + 服务端中间件 API 守卫 |
| SSR 安全存储 | useCookie + useState 替代 localStorage + ref |
| 文件系统路由 | pages/ 目录即路由，layouts/ 布局系统 |
| 环境变量 | runtimeConfig（public + private）替代 process.env |
| vue-base-skill 组件复用 | 复用 Vue 体系 20+ 组件（3 次复用原则） |

## 依赖声明

| 依赖技能 | 状态 | 说明 |
|---------|------|------|
| frontend-request-skill | **强依赖** | 客户端请求层规范，本技能复用其 request.ts |
| vue-base-skill | 可选 | 基础组件复用（3 次复用原则） |

---

## 四阶段工作流

### Phase 1: Pre-development（需求澄清）

**目标**：在写代码前明确项目范围和技术选型。

#### 步骤 1.1 — 需求澄清

向用户提问以下问题（一次性收集）：

1. **项目类型**：管理后台 / 企业官网 / 电商平台 / 内容网站 / 其他？
2. **UI 框架偏好**：Element Plus / Nuxt UI / 其他？
3. **是否需要 SSR**：SEO 敏感页面需要 SSR，纯后台可用 SPA 模式
4. **后端情况**：已有后端 API？需要 BFF 代理？后端地址和接口规范？
5. **认证方式**：JWT Token / Session / OAuth？
6. **部署环境**：Vercel / 自建服务器 / Docker / 静态托管（SSG）？

#### 步骤 1.2 — 技术方案确认

根据需求输出技术方案摘要：

```
项目类型：{项目类型}
渲染模式：{SSR / SSG / SPA}
UI 框架：{Element Plus / Nuxt UI}
请求层：frontend-request-skill 规范 + Nuxt $fetch
状态管理：Pinia Setup Store（SSR 安全存储）
认证方式：JWT + httpOnly Cookie
部署目标：{部署平台}
```

等待用户确认后进入下一阶段。

---

### Phase 2: Project Initialization（项目初始化）

#### 步骤 2.1 — 创建 Nuxt 项目

```bash
npx nuxi@latest init {项目名} --packageManager pnpm
cd {项目名}
```

#### 步骤 2.2 — 安装核心依赖

```bash
# 核心
pnpm add pinia @pinia/nuxt

# UI 框架（二选一）
pnpm add element-plus @element-plus/nuxt    # Element Plus
# 或
pnpm add @nuxt/ui                            # Nuxt UI

# SEO 模块
pnpm add -D @nuxtjs/sitemap @nuxtjs/robots

# 开发工具
pnpm add -D @nuxt/eslint-config eslint prettier
```

#### 步骤 2.3 — 配置 nuxt.config.ts

参考 `references/nuxt-config-template.md`，关键配置：

```typescript
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],
  ssr: true,
  runtimeConfig: {
    apiBase: '',                          // 服务端专用（后端真实地址）
    public: {
      appName: '{项目名}',
      apiBase: '/api',                    // 客户端请求前缀
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      titleTemplate: '%s - {项目名}',
    },
  },
  typescript: { strict: true },
})
```

#### 步骤 2.4 — 创建目录结构

```
mkdir -p components composables layouts middleware \
  pages server/api server/middleware server/utils \
  stores types utils assets/styles public
```

#### 步骤 2.5 — 创建核心类型文件

创建 `types/api.ts` — 后端统一响应信封：

```typescript
/** 后端统一响应信封 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页响应 */
export interface ApiListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

#### 步骤 2.6 — 配置 TypeScript

确保 `tsconfig.json` 继承 Nuxt 生成的配置：

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

### Phase 3: Development（核心开发）

#### 步骤 3.1 — 请求层集成

**双轨策略**（详见 `references/api-integration.md`）：

1. **客户端请求** — 复用 frontend-request-skill 的 `request.ts`

```typescript
// utils/request.ts
// 从 frontend-request-skill 复制，适配 Nuxt cookie 读取
import type { ApiResponse } from '~/types/api'

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = useCookie('auth_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token.value) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token.value}`
  }

  const config = useRuntimeConfig()
  const response = await fetch(`${config.public.apiBase}${url}`, { ...options, headers })
  const result: ApiResponse<T> = await response.json()

  if (result.code !== 0) {
    throw { code: result.code, message: result.message, data: result.data }
  }
  return result.data
}
```

2. **服务端请求** — 使用 Nuxt 原生 `$fetch`

```typescript
// server/api/ 下直接使用 $fetch
const config = useRuntimeConfig()
const result = await $fetch(`${config.apiBase}/users`, {
  headers: { Authorization: `Bearer ${token}` },
})
```

3. **SSR 统一封装** — `utils/request-ssr.ts`

```typescript
export async function ssrRequest<T>(url: string, options = {}): Promise<T> {
  if (import.meta.server) {
    const config = useRuntimeConfig()
    return await $fetch<T>(`${config.apiBase}${url}`, options)
  } else {
    const { request } = await import('~/utils/request')
    return await request<T>(url, options)
  }
}
```

#### 步骤 3.2 — Pinia Store（SSR 安全）

参考 `references/code-examples/stores/`：

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const token = useCookie('auth_token')           // SSR 安全
  const refreshToken = useCookie('refresh_token')
  const user = useState<User | null>('current_user', () => null)  // SSR 同步

  const isLoggedIn = computed(() => !!token.value)

  async function login(params: LoginParams): Promise<void> {
    const { data } = await useFetch<LoginResult>('/api/auth/login', {
      method: 'POST',
      body: params,
    })
    if (data.value) {
      token.value = data.value.token
      user.value = data.value.user
    }
  }

  function logout(): void {
    token.value = null
    refreshToken.value = null
    user.value = null
    navigateTo('/login')
  }

  return { token, user, isLoggedIn, login, logout }
})
```

**关键规则**：
- `useCookie()` 替代 localStorage 做 token 存储（服务端可读取）
- `useState()` 替代 `ref()` 做 SSR 状态同步
- 禁止在 setup 中直接访问 `localStorage` / `sessionStorage`

#### 步骤 3.3 — SEO 配置

参考 `references/seo-strategy.md`：

```vue
<script setup lang="ts">
useHead({
  title: '页面标题',
  meta: [
    { name: 'description', content: '页面描述' },
  ],
})

useSeoMeta({
  ogTitle: '页面标题',
  ogDescription: '页面描述',
  ogImage: 'https://example.com/og.png',
})
</script>
```

#### 步骤 3.4 — 认证中间件

参考 `references/middleware-auth.md`：

**客户端中间件**：

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')
  if (!token.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
```

**服务端中间件**：

```typescript
// server/middleware/auth.ts
import { getCookie, createError } from 'h3'

export default defineEventHandler((event) => {
  const url = event.path
  if (!url.startsWith('/api/') || url.startsWith('/api/auth/')) return

  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }
})
```

#### 步骤 3.5 — BFF API 层

参考 `references/server-api-routes.md`：

```
server/api/
├── auth/
│   ├── login.post.ts    # 登录（cookie 写入）
│   └── me.get.ts        # 获取当前用户
└── users/
    ├── index.get.ts     # 用户列表（分页）
    └── [id].get.ts      # 用户详情
```

每个 API Route 的职责：
1. 参数校验
2. 鉴权（从 cookie 读取 token）
3. 代理转发到真实后端
4. 错误统一处理

#### 步骤 3.6 — 布局与页面

**布局组件**：

```vue
<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <AppLayout>
      <slot />
    </AppLayout>
  </div>
</template>
```

**页面示例**（参考 `references/code-examples/pages/`）：

```vue
<!-- pages/users/index.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: '用户管理' })

const { data, pending } = useAsyncData('users', () =>
  $fetch('/api/users', { query: { page: 1, pageSize: 10 } })
)
</script>
```

#### 步骤 3.7 — 环境变量

```bash
# .env
NUXT_API_BASE=https://api.example.com
NUXT_PUBLIC_APP_NAME=我的应用

# .env.production
NUXT_API_BASE=https://api.production.com
```

使用 `useRuntimeConfig()` 访问，禁止 `process.env`。

---

### Phase 4: Post-development（后置验证）

#### 步骤 4.1 — 类型检查

```bash
npx nuxi typecheck
```

确保零错误。

#### 步骤 4.2 — 构建验证

```bash
# SSR 模式构建
npx nuxi build

# 或 SSG 静态生成
npx nuxi generate
```

#### 步骤 4.3 — SEO 检查

- [ ] 每个页面都有唯一的 title
- [ ] 关键页面设置了 meta description
- [ ] OG 标签正确配置
- [ ] sitemap 生成正常
- [ ] robots.txt 配置正确

#### 步骤 4.4 — SSR 安全检查

- [ ] 没有在 setup 中访问 `window` / `document` / `localStorage`
- [ ] 涉及 DOM 的组件使用 `<ClientOnly>` 包裹
- [ ] Store 使用 `useCookie` / `useState` 而非 `ref` 做 SSR 同步
- [ ] 服务端 API 没有 import 客户端模块

#### 步骤 4.5 — 生成文档

为项目生成：
1. `CLAUDE.md` — 参考 `references/claude-md-template.md`
2. `AGENTS.md` — 参考 `references/agents-md-template.md`
3. `README.md` — 项目说明

---

## Resources（参考文档）

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目结构 | `references/project-structure.md` | Nuxt 3 标准目录结构与职责说明 |
| CLAUDE.md 模板 | `references/claude-md-template.md` | Claude Code 入口文件模板 |
| AGENTS.md 模板 | `references/agents-md-template.md` | 项目规范文档模板 |
| API 请求层 | `references/api-integration.md` | SSR 双轨请求策略详解 |
| Nuxt 配置 | `references/nuxt-config-template.md` | nuxt.config.ts 完整配置模板 |
| SEO 策略 | `references/seo-strategy.md` | useHead / OG / sitemap / JSON-LD |
| 认证中间件 | `references/middleware-auth.md` | 客户端 + 服务端认证方案 |
| Server API | `references/server-api-routes.md` | BFF 层 H3 event handler 规范 |
| Nuxt 约定 | `references/nuxt-conventions.md` | Auto-imports / 命名 / SSR 安全规则 |
| 组件规范 | `references/component-standards.md` | vue-base-skill 组件复用指南 |
| 代码示例 | `references/code-examples/` | 完整参考代码 |

## 代码示例目录

| 示例 | 路径 | 说明 |
|------|------|------|
| 类型定义 | `references/code-examples/types/api.ts` | 响应信封、分页、错误类型 |
| 用户类型 | `references/code-examples/types/user.ts` | 用户接口、登录/列表参数 |
| 用户 Store | `references/code-examples/stores/user.ts` | Pinia Setup Store + SSR 安全 |
| App Store | `references/code-examples/stores/app.ts` | 全局应用状态 |
| 布局组件 | `references/code-examples/components/AppLayout.vue` | 管理后台布局 |
| 登录页 | `references/code-examples/pages/login.vue` | definePageMeta + useAuth |
| 用户列表 | `references/code-examples/pages/users/index.vue` | useAsyncData SSR 预取 |
| 登录 API | `references/code-examples/server/api/auth/login.post.ts` | H3 cookie 写入 |
| 用户列表 API | `references/code-examples/server/api/users/index.get.ts` | 分页查询 + 鉴权 |
