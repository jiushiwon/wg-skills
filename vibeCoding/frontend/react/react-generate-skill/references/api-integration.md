# API 集成指南

> 本文件指导如何复用 frontend-request-skill 的请求层

## 1. 安装依赖

```bash
npm install zustand
```

## 2. 配置文件

### 2.1 api.config.ts

```typescript
// src/config/api.config.ts
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  prefix: '/api',
  timeout: 15000,
  enableMock: import.meta.env.DEV,
};
```

### 2.2 error.config.ts

```typescript
// src/config/error.config.ts
export const errorConfig = {
  ERROR_CODE_MAP: {
    401: '登录已过期，请重新登录',
    403: '没有权限',
    404: '请求的资源不存在',
    500: '服务器错误',
  },
};
```

## 3. 请求封装

### 3.1 request.ts

```typescript
// src/api/request.ts
import { apiConfig } from '@/config/api.config';
import { errorConfig } from '@/config/error.config';
import { getToken } from '@/utils/auth';

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
      const message = errorConfig.ERROR_CODE_MAP[response.status] || '请求失败';
      throw { code: response.status, message, status: response.status };
    }

    // 响应信封格式 { code, message, data }
    if (data.code !== 0 && data.code !== 200) {
      throw { code: data.code, message: data.message };
    }

    return data.data;
  } catch (err) {
    if (err.name === 'AbortError') {
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

export const post = <T = unknown>(url: string, data?: unknown, options?: RequestOptions) =>
  request<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) });

export const put = <T = unknown>(url: string, data?: unknown, options?: RequestOptions) =>
  request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data) });

export const del = <T = unknown>(url: string, options?: RequestOptions) =>
  request<T>(url, { ...options, method: 'DELETE' });
```

## 4. 业务 API

### 4.1 模块划分

```typescript
// src/api/modules/user.ts
import { get, post, del } from '../request';
import type { User, UserListParams } from '@/types/user';

export const userApi = {
  list: (params: UserListParams) => post<{ items: User[]; total: number }>('/users', params),
  get: (id: string) => get<User>(`/users/${id}`),
  create: (data: Partial<User>) => post<User>('/users', data),
  update: (id: string, data: Partial<User>) => put<User>(`/users/${id}`, data),
  delete: (id: string) => del(`/users/${id}`),
};
```

### 4.2 统一导出

```typescript
// src/api/index.ts
export * from './modules/user';
```

## 5. Auth 服务

```typescript
// src/services/auth.service.ts
import { post } from '@/api/request';
import { setToken, setRefreshToken, clearToken } from '@/utils/auth';
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
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await post<{ token: string }>('/auth/refresh', { refreshToken });
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

## 6. 工具函数

### 6.1 auth.ts

```typescript
// src/utils/auth.ts
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  // 可以解析 JWT 或调用后端验证
  return false;
}
```

### 6.2 error.ts

```typescript
// src/utils/error.ts
import { errorConfig } from '@/config/error.config';

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

### 6.3 toast.ts

```typescript
// src/utils/toast.ts
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

## 7. Hooks

```typescript
// src/hooks/useAuth.ts
import { useUserStore } from '@/stores/userStore';
import { authService } from '@/services/auth.service';
import { showError, showSuccess } from '@/utils/toast';

export function useAuth() {
  const { login: storeLogin, logout: storeLogout, isLoggedIn, user } = useUserStore();

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
