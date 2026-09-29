# API 集成指南（三轨策略）

> Next.js App Router 有三种请求场景，本文件指导如何正确配置每一轨。

## 核心概念

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 三轨请求策略                       │
├──────────────┬──────────────────┬────────────────────────────┤
│ Server       │ Client           │ Server Actions             │
│ Components   │ Components       │                            │
├──────────────┼──────────────────┼────────────────────────────┤
│ Next.js fetch │ frontend-request │ 'use server' 指令          │
│ （内置缓存）   │ -skill 的 request │ 替代大部分 POST 请求       │
│              │ .ts（fetch 封装） │                            │
├──────────────┼──────────────────┼────────────────────────────┤
│ lib/api/     │ lib/api/         │ lib/actions/               │
│ server.ts    │ client.ts        │ *.ts                       │
└──────────────┴──────────────────┴────────────────────────────┘
```

---

## 1. Server Components 请求层

### 1.1 lib/api/server.ts

Server Components 直接使用 Next.js 扩展的 `fetch`，支持请求级缓存和重验证。

```typescript
// lib/api/server.ts
import { cookies } from 'next/headers';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_PREFIX = '/api';

interface ServerRequestOptions {
  revalidate?: number | false;
  tags?: string[];
}

/**
 * Server Components 专用请求函数
 * 使用 Next.js 扩展的 fetch，支持 ISR 缓存
 */
export async function serverFetch<T = unknown>(
  url: string,
  options: RequestInit & ServerRequestOptions = {}
): Promise<T> {
  const { revalidate = 60, tags, ...fetchOptions } = options;

  // 从 cookies 读取 token
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${API_PREFIX}${url}`, {
    ...fetchOptions,
    headers,
    next: {
      revalidate,
      ...(tags ? { tags } : {}),
    },
  });

  if (!response.ok) {
    throw {
      code: response.status,
      message: response.statusText,
      status: response.status,
    };
  }

  const data = await response.json();

  // 响应信封格式 { code, message, data }
  if (data.code !== 0 && data.code !== 200) {
    throw { code: data.code, message: data.message };
  }

  return data.data as T;
}

// 快捷方法
export const serverGet = <T = unknown>(
  url: string,
  options?: ServerRequestOptions
) => serverFetch<T>(url, { ...options, method: 'GET' });

export const serverPost = <T = unknown>(
  url: string,
  body?: unknown,
  options?: ServerRequestOptions
) =>
  serverFetch<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
```

### 1.2 业务 API 封装

```typescript
// lib/api/modules/user.server.ts
import { serverGet } from '@/lib/api/server';
import type { User, UserListParams, ApiListResponse } from '@/types';

export async function fetchUsers(
  params: UserListParams
): Promise<ApiListResponse<User>> {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    ...(params.keyword ? { keyword: params.keyword } : {}),
  });

  return serverGet<ApiListResponse<User>>(`/users?${query}`, {
    revalidate: 60,
    tags: ['users'],
  });
}

export async function fetchUser(id: string): Promise<User> {
  return serverGet<User>(`/users/${id}`, {
    tags: [`user-${id}`],
  });
}
```

### 1.3 缓存策略

| 策略 | `revalidate` 值 | 场景 |
|------|-----------------|------|
| 不缓存 | `0` | 实时数据（股票、消息） |
| 定时重验证 | `60`（秒） | 列表页（每分钟刷新） |
| 按需重验证 | `false` + `tags` | 配合 `revalidateTag()` |
| 永久缓存 | `false` | 静态内容 |

---

## 2. Client Components 请求层

### 2.1 lib/api/client.ts

Client Components 复用 `frontend-request-skill` 的标准请求层。

```typescript
// lib/api/client.ts
import { apiConfig } from '@/lib/config/api.config';
import { errorConfig } from '@/lib/config/error.config';
import { getToken } from '@/lib/utils/auth';

export interface RequestOptions extends RequestInit {
  timeout?: number;
}

export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = apiConfig.timeout, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const token = getToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${apiConfig.baseURL}${url}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        errorConfig.ERROR_CODE_MAP[response.status] || '请求失败';
      throw { code: response.status, message, status: response.status };
    }

    // 响应信封格式 { code, message, data }
    if (data.code !== 0 && data.code !== 200) {
      throw { code: data.code, message: data.message };
    }

    return data.data as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw { code: -1, message: '请求超时' };
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 快捷方法
export const get = <T = unknown>(url: string, options?: RequestOptions) =>
  request<T>(url, { ...options, method: 'GET' });

export const post = <T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions
) =>
  request<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });

export const put = <T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions
) =>
  request<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const del = <T = unknown>(url: string, options?: RequestOptions) =>
  request<T>(url, { ...options, method: 'DELETE' });
```

### 2.2 配置文件

```typescript
// lib/config/api.config.ts
export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  prefix: '/api',
  timeout: 15000,
};
```

```typescript
// lib/config/error.config.ts
export const errorConfig = {
  ERROR_CODE_MAP: {
    401: '登录已过期，请重新登录',
    403: '没有权限',
    404: '请求的资源不存在',
    500: '服务器错误',
  } as Record<number, string>,
};
```

---

## 3. Server Actions

### 3.1 基本用法

Server Actions 用 `'use server'` 指令标记，替代大部分 POST 请求。

```typescript
// lib/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface LoginResult {
  success: boolean;
  message?: string;
}

export async function loginAction(
  _prevState: LoginResult | null,
  formData: FormData
): Promise<LoginResult> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, message: '请输入用户名和密码' };
  }

  try {
    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.code !== 0) {
      return { success: false, message: data.message };
    }

    // 设置 cookie（服务端操作）
    const cookieStore = cookies();
    cookieStore.set('token', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    });
    cookieStore.set('refreshToken', data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 天
    });

    return { success: true };
  } catch {
    return { success: false, message: '登录失败，请稍后重试' };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete('token');
  cookieStore.delete('refreshToken');
  redirect('/login');
}
```

### 3.2 在 Client Component 中使用

```typescript
'use client';

import { useActionState } from 'react';
import { loginAction } from '@/lib/actions/auth';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction}>
      <input name="username" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? '登录中...' : '登录'}
      </button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

### 3.3 Server Actions 最佳实践

| 规则 | 说明 |
|------|------|
| 文件顶部 `'use server'` | 必须声明 |
| 只在 Server 环境执行 | 可以访问数据库、文件系统、环境变量 |
| 可以被 Client Component 调用 | 通过 `form action` 或直接调用 |
| 返回可序列化的值 | 不能返回函数、Date 等 |
| 配合 `revalidatePath` / `revalidateTag` | 数据变更后刷新缓存 |

---

## 4. 数据传递模式

### 4.1 Server → Client（通过 props）

```typescript
// app/(dashboard)/users/page.tsx（Server Component）
import { fetchUsers } from '@/lib/api/modules/user.server';
import { UserTable } from './UserTable';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { items, total } = await fetchUsers({ page, pageSize: 10 });

  // Server Component 获取数据后，通过 props 传给 Client Component
  return <UserTable initialData={items} initialTotal={total} />;
}
```

```typescript
// app/(dashboard)/users/UserTable.tsx（Client Component）
'use client';

import { useState } from 'react';
import { Table } from 'antd';
import type { User } from '@/types/user';

interface Props {
  initialData: User[];
  initialTotal: number;
}

export function UserTable({ initialData, initialTotal }: Props) {
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);

  // Client 侧交互逻辑...
  return <Table dataSource={data} />;
}
```

### 4.2 Token 管理

| 环境 | 存储方式 | 读取 |
|------|---------|------|
| Server Components / Actions / Route Handlers | `cookies()` | `cookies().get('token')?.value` |
| Client Components | `localStorage` | `getToken()` from `lib/utils/auth.ts` |

**注意**：登录成功后，Server Action 设置 `httpOnly` cookie（安全），同时 Client 侧也保存到 `localStorage`（方便 Client 请求层读取）。

---

## 5. 工具函数

### 5.1 auth.ts

```typescript
// lib/utils/auth.ts

// ---- Client 侧（仅在 'use client' 组件中使用）----
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  return false;
}
```

### 5.2 error.ts

```typescript
// lib/utils/error.ts
import { errorConfig } from '@/lib/config/error.config';

export function formatError(err: unknown): string {
  if (!err) return '未知错误';
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && 'message' in err) {
    return String((err as Error).message);
  }
  return '未知错误';
}

export function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const code = 'code' in err ? (err as { code: number }).code : 0;
    return errorConfig.ERROR_CODE_MAP[code] || formatError(err);
  }
  return formatError(err);
}
```

### 5.3 toast.ts

```typescript
// lib/utils/toast.ts
import { message } from 'antd';

export function showError(msg: string): void {
  message.error(msg);
}

export function showSuccess(msg: string): void {
  message.success(msg);
}

export function showLoading(msg?: string): void {
  message.loading(msg || '加载中...');
}
```

---

## 6. Auth 服务（Client 侧）

```typescript
// lib/services/auth.service.ts
import { post } from '@/lib/api/client';
import { setToken, setRefreshToken, clearToken } from '@/lib/utils/auth';
import type { LoginRequest, LoginResponse } from '@/types/user';

let refreshPromise: Promise<string> | null = null;

export const authService = {
  async login(req: LoginRequest): Promise<LoginResponse> {
    const res = await post<LoginResponse>('/auth/login', req);
    setToken(res.token);
    setRefreshToken(res.refreshToken);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await post('/auth/logout');
    } finally {
      clearToken();
    }
  },

  async refreshToken(): Promise<string> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const refreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('refreshToken')
            : null;
        const res = await post<{ token: string }>('/auth/refresh', {
          refreshToken,
        });
        setToken(res.token);
        return res.token;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },
};
```

---

## 7. Hooks（Client 侧）

```typescript
// lib/hooks/useAuth.ts
'use client';

import { useUserStore } from '@/stores/userStore';
import { authService } from '@/lib/services/auth.service';
import { showError, showSuccess } from '@/lib/utils/toast';

export function useAuth() {
  const { login: storeLogin, logout: storeLogout, isLoggedIn, user } =
    useUserStore();

  const login = async (username: string, password: string) => {
    try {
      await authService.login({ username, password });
      showSuccess('登录成功');
    } catch (err) {
      showError('登录失败');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      storeLogout();
      showSuccess('已退出登录');
    }
  };

  return { login, logout, isLoggedIn, user };
}
```

---

## 8. 选择决策树

```
需要请求数据？
├── 在 Server Component 中？
│   ├── 是 → 用 lib/api/server.ts（Next.js fetch）
│   └── 否 → 在 Client Component 中
│       ├── 是 GET 请求？
│   │   ├── 能提升到 Server Component？ → 提升后用 server.ts
│   │   └── 不能 → 用 lib/api/client.ts
│       └── 是 POST/PUT/DELETE？
│           ├── 能用 Server Action？ → 用 lib/actions/
│           └── 不能 → 用 lib/api/client.ts
```
