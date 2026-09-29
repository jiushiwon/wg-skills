# 认证中间件

## 客户端中间件 — middleware/auth.ts

Nuxt 路由中间件在 **页面导航前** 执行，用于保护需要登录的页面。

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  if (!token.value) {
    // 未登录 → 跳转登录页，记录目标页以便登录后回跳
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
```

### 访客中间件 — middleware/guest.ts

已登录用户访问登录页时自动跳转首页：

```typescript
// middleware/guest.ts
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('auth_token')

  if (token.value) {
    return navigateTo('/')
  }
})
```

### 页面中使用

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',           // 单个中间件
  // middleware: ['auth', 'role-check'],  // 多个中间件
})
</script>
```

### 全局中间件

文件名以 `auth.global.ts` 命名即可变为全局中间件：

```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // 所有页面都会经过此中间件
  const publicRoutes = ['/login', '/register', '/forgot-password']
  if (publicRoutes.includes(to.path)) return

  const token = useCookie('auth_token')
  if (!token.value) {
    return navigateTo('/login')
  }
})
```

## 服务端中间件 — server/middleware/auth.ts

服务端中间件拦截 **所有到达服务端的请求**（API 路由 + SSR 页面渲染），运行在 Node.js 环境。

```typescript
// server/middleware/auth.ts
import { getCookie, createError } from 'h3'

export default defineEventHandler((event) => {
  const url = event.path

  // 白名单路由不校验
  const publicRoutes = ['/api/auth/login', '/api/auth/register']
  if (publicRoutes.some((route) => url.startsWith(route))) {
    return
  }

  // 仅校验 /api/ 开头的路由
  if (!url.startsWith('/api/')) {
    return
  }

  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({
      statusCode: 401,
      message: '未登录或 Token 已过期',
    })
  }

  // 可选：验证 token 有效性（JWT verify）
  // try {
  //   const payload = verifyToken(token)
  //   event.context.user = payload
  // } catch {
  //   throw createError({ statusCode: 401, message: 'Token 无效' })
  // }
})
```

## Token 验证流程

```
客户端发起请求
  │
  ├─ 页面路由导航 → middleware/auth.ts
  │   └─ 检查 useCookie('auth_token') → 无 token → 跳 /login
  │
  ├─ API 请求 → request.ts 自动加 Authorization header
  │   └─ BFF (server/api/) → 服务端中间件校验
  │       ├─ getCookie(event, 'auth_token')
  │       ├─ JWT verify (可选)
  │       └─ 失败 → 401
  │
  └─ SSR 渲染 → useAsyncData/$fetch
      └─ 服务端通过 getCookie 读取 token → 携带到后端 API
```

## 路由守卫策略

| 页面 | 中间件 | 说明 |
|------|--------|------|
| `/login` | `guest` | 已登录跳首页 |
| `/register` | `guest` | 已登录跳首页 |
| `/` | `auth` | 需要登录 |
| `/users/*` | `auth` | 需要登录 |
| `/settings/*` | `auth` | 需要登录 |
| `/admin/*` | `['auth', 'admin']` | 需要管理员权限 |
| `/about` | 无 | 公开页面 |

## Nuxt 3 中间件类型对比

| 类型 | 文件命名 | 执行时机 | 作用域 |
|------|---------|---------|--------|
| 匿名中间件 | `middleware/xxx.ts` | 页面导航前 | 需在 `definePageMeta` 中显式使用 |
| 命名中间件 | `middleware/xxx.ts` | 页面导航前 | 同上 |
| 全局中间件 | `middleware/xxx.global.ts` | 每次页面导航前 | 所有页面自动执行 |
| 服务端中间件 | `server/middleware/xxx.ts` | 每个服务端请求 | 所有 API + SSR 请求 |
