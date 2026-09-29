# Server API Routes 规范

## 目录结构

```
server/
├── api/                    # 自动注册为 /api/... 路由
│   ├── auth/
│   │   ├── login.post.ts   # POST /api/auth/login
│   │   ├── me.get.ts       # GET  /api/auth/me
│   │   └── refresh.post.ts # POST /api/auth/refresh
│   └── users/
│       ├── index.get.ts    # GET  /api/users
│       ├── index.post.ts   # POST /api/users
│       └── [id].get.ts     # GET  /api/users/:id
├── middleware/             # 服务端中间件
│   └── auth.ts
├── routes/                 # 非 /api 前缀的路由
│   └── health.ts           # GET  /health
└── utils/                  # 服务端工具函数
    ├── fetch-wrapper.ts
    └── token.ts
```

## 文件命名规则

| 文件名 | HTTP 方法 | 路由 |
|--------|----------|------|
| `index.get.ts` | GET | 目录路由 |
| `index.post.ts` | POST | 目录路由 |
| `[id].get.ts` | GET | 动态参数 |
| `[id].put.ts` | PUT | 动态参数 |
| `[id].delete.ts` | DELETE | 动态参数 |
| `login.post.ts` | POST | 子路由 |

文件名格式：`[name].[method].ts`，其中 method 决定 HTTP 方法。

## H3 Event Handler

Nuxt 3 服务端基于 [H3](https://h3.unjs.io/) 框架。

### 基本写法

```typescript
export default defineEventHandler(async (event) => {
  // event 包含请求的所有上下文
  return { hello: 'world' }
})
```

### 读取请求数据

```typescript
import { readBody, getQuery, getRouterParams, getCookie, getRequestHeader } from 'h3'

export default defineEventHandler(async (event) => {
  // 读取 POST body
  const body = await readBody(event)

  // 读取 query 参数 ?page=1&size=10
  const query = getQuery(event)

  // 读取路由参数 /users/:id
  const params = getRouterParams(event)

  // 读取 cookie
  const token = getCookie(event, 'auth_token')

  // 读取请求头
  const userAgent = getRequestHeader(event, 'user-agent')
})
```

### 错误处理

```typescript
import { createError, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  // 方式一：createError 抛出异常（中断执行）
  throw createError({
    statusCode: 404,
    message: '资源不存在',
  })

  // 方式二：带业务数据的错误
  throw createError({
    statusCode: 422,
    message: '参数校验失败',
    data: {
      errors: [
        { field: 'email', message: '邮箱格式不正确' },
      ],
    },
  })

  // 方式三：设置状态码但不中断
  setResponseStatus(event, 201)
  return { code: 0, message: '创建成功' }
})
```

### 响应操作

```typescript
import { setResponseHeader, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  // 设置响应头
  setResponseHeader(event, 'X-Custom-Header', 'value')

  // 重定向
  sendRedirect(event, '/new-location', 301)

  // 正常返回（自动序列化为 JSON）
  return {
    code: 0,
    message: 'success',
    data: { id: 1 },
  }
})
```

## 完整示例：CRUD API

```typescript
// server/api/users/index.post.ts — 创建用户
import { readBody, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '未登录' })

  const body = await readBody(event)

  // 参数校验
  if (!body.username || !body.email) {
    throw createError({
      statusCode: 422,
      message: '用户名和邮箱不能为空',
    })
  }

  const config = useRuntimeConfig()
  const result = await $fetch(`${config.apiBase}/users`, {
    method: 'POST',
    body,
    headers: { Authorization: `Bearer ${token}` },
  })

  setResponseStatus(event, 201)
  return { code: 0, message: '创建成功', data: result }
})
```

## 错误统一处理

创建服务端插件或中间件统一处理未捕获错误：

```typescript
// server/utils/error-handler.ts
import { createError, type H3Error } from 'h3'

export function handleApiError(error: unknown): never {
  // 已经是 H3Error 直接抛出
  if ((error as H3Error).statusCode) {
    throw error
  }

  // $fetch 请求错误
  if (error instanceof Error && 'response' in error) {
    const fetchError = error as { response: { status: number; _data: unknown } }
    throw createError({
      statusCode: fetchError.response.status,
      message: String(fetchError.response._data),
    })
  }

  // 未知错误
  throw createError({
    statusCode: 500,
    message: '服务器内部错误',
  })
}
```
