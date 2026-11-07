# API 请求层集成策略（SSR 双轨方案）

## 核心问题

Nuxt 3 同时运行在 **客户端（浏览器）** 和 **服务端（Node.js）** 两套环境中，请求层不能简单复用纯前端方案。

## 双轨策略总览

```
┌─────────────────────────────────────────────────────────┐
│                       页面/组件                          │
│         useAsyncData / useFetch / $fetch                │
└──────────────┬──────────────────────────┬───────────────┘
               │ 客户端                   │ 服务端
               ▼                          ▼
┌──────────────────────────┐ ┌─────────────────────────────┐
│  utils/request.ts         │ │  $fetch (Nuxt 原生)          │
│  (frontend-request-skill) │ │  或 utils/request-ssr.ts    │
│  ─────────────────────── │ │  ────────────────────────  │
│  fetch + 信封解析          │ │  直接调后端，无浏览器限制     │
│  Token 自动刷新队列        │ │  通过 H3 event 读取 cookie   │
│  响应拦截器               │ │  createError 错误处理        │
└──────────────────────────┘ └─────────────────────────────┘
```

## 客户端请求（浏览器环境）

复用 **frontend-request-skill** 的 `request.ts`：

```typescript
// utils/request.ts
// 从 frontend-request-skill 复制，核心特性：
// - 基于原生 fetch 封装
// - 响应信封解析 (ApiResponse<T>)
// - Token 自动刷新队列（并发请求只刷新一次）
// - 请求/响应拦截器
// - 错误统一处理

import type { ApiResponse } from '~/types/api'

const BASE_URL = '/api'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = useCookie('auth_token')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token.value) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token.value}`
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  })

  const result: ApiResponse<T> = await response.json()

  if (result.code !== 0) {
    // Token 过期处理
    if (result.code === 401) {
      // 触发 token 刷新或跳转登录
    }
    throw { code: result.code, message: result.message, data: result.data }
  }

  return result.data
}

export { request }
```

## 服务端请求（Node.js 环境）

在 `server/api/` 路由和 SSR 页面数据获取中使用：

```typescript
// server/api/users/index.get.ts
import { getCookie, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const config = useRuntimeConfig()
  const query = getQuery(event)

  // 使用 Nuxt 原生 $fetch 直接调后端（无需经过浏览器）
  const result = await $fetch(`${config.apiBase}/users`, {
    params: query,
    headers: { Authorization: `Bearer ${token}` },
  })

  return result
})
```

## SSR 统一封装（request-ssr.ts）

```typescript
// utils/request-ssr.ts
// 自动判断环境选择请求底层

import type { ApiResponse } from '~/types/api'

/**
 * SSR 安全的请求封装
 * - 客户端：走 request.ts（frontend-request-skill 规范）
 * - 服务端：走 $fetch（Nuxt 原生）
 */
export async function ssrRequest<T>(
  url: string,
  options: {
    method?: string
    body?: unknown
    params?: Record<string, unknown>
    headers?: Record<string, string>
  } = {},
): Promise<T> {
  if (import.meta.server) {
    // 服务端：直接 $fetch 调后端
    const config = useRuntimeConfig()
    return await $fetch<T>(`${config.apiBase}${url}`, {
      method: (options.method as 'GET' | 'POST') || 'GET',
      body: options.body,
      params: options.params,
      headers: options.headers,
    })
  } else {
    // 客户端：走 BFF（/api/ 前缀）
    const { request } = await import('~/utils/request')
    return await request<T>(url, {
      method: options.method || 'GET',
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  }
}
```

## 错误处理

### 服务端错误 — H3 createError

```typescript
import { createError } from 'h3'

// 抛出 HTTP 错误（前端会收到对应的 status code）
throw createError({
  statusCode: 404,
  message: '用户不存在',
})

// 带状态码的业务错误
throw createError({
  statusCode: 422,
  message: '参数校验失败',
  data: { field: 'email', reason: '格式不正确' },
})
```

### 客户端错误 — 统一 catch

```typescript
try {
  const user = await request<User>('/users/1')
} catch (error) {
  // error 结构：{ code: number, message: string, data?: unknown }
  const err = error as { code: number; message: string }
  console.error(`请求失败 [${err.code}]: ${err.message}`)
}
```

## Token 传递机制

```
浏览器 Cookie (auth_token)
  │
  ├── 客户端请求 → request.ts 自动从 cookie 读取 → 加入 Authorization header
  │
  └── SSR 请求   → getCookie(event, 'auth_token') → 服务端 $fetch 携带
```

关键点：
1. 使用 `useCookie('auth_token')` 在客户端读写 cookie
2. 使用 `getCookie(event, 'auth_token')` 在服务端读取 cookie
3. cookie 设置 `httpOnly: true` 防止 XSS 访问
4. SSR 请求无需经过浏览器，直接在 Node.js 调用后端

## useFetch vs useAsyncData

| API | 用途 | 说明 |
|-----|------|------|
| `useFetch` | 简单请求 | 语法糖，自动组合 `useAsyncData` + `$fetch` |
| `useAsyncData` | 复杂逻辑 | 需要自定义获取函数、多请求合并 |
| `$fetch` | 直接调用 | 不做 SSR 缓存，适合事件处理 |

```typescript
// 简单场景 — useFetch
const { data } = await useFetch<User>('/api/users/1')

// SSR 数据预取 — useAsyncData + $fetch
const { data } = await useAsyncData('user-1', () =>
  $fetch<User>('/api/users/1'),
)

// 事件处理（点击按钮）— 直接 $fetch
async function handleClick() {
  const user = await $fetch<User>('/api/users/1')
}
```
