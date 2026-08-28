# 通用前端请求层规范

> `frontend-request-skill` 的通用前端规范。面向 Web / H5 / React / Vue 等标准前端项目，底层使用 `fetch`（推荐）或 `axios`。
>
> uniapp 适配规范见 [uniapp-spec.md](uniapp-spec.md)。二者仅在底层网络 API 和 Token 存储方式上有差异，响应信封、错误码、鉴权拦截、去重、Mock、SSE 解析逻辑完全一致。

## 文件位置

```
src/api/request.ts
```

## 配套配置

```typescript
// src/config/api.config.ts
export const BASE_URL = import.meta.env.VITE_BASE_URL || '';
export const DEFAULT_PREFIX = '/api';
export const REQUEST_TIMEOUT = 30000;
export const REQUEST_RETRY_COUNT = 0;

// 业务成功码：按后端契约配置。本示例约定 code=0 为成功，code<0 为业务异常
export const SUCCESS_CODES: (string | number)[] = [0];

// 与 401 同等处理的业务失败码，为空数组表示不启用
export const AUTH_FAILURE_CODES: (string | number)[] = [];

// Mock 全局开关：true 时所有请求强制走 Mock
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
```

## 类型定义

```typescript
import { getToken } from '@/utils/auth';
import { handleUnauthorized, refreshToken } from '@/services/auth.service';
import {
  BASE_URL,
  DEFAULT_PREFIX,
  REQUEST_TIMEOUT,
  USE_MOCK,
  SUCCESS_CODES,
  REQUEST_RETRY_COUNT,
  AUTH_FAILURE_CODES,
} from '@/config/api.config';
import { MOCK_MAP, type MockEntry } from './_mocks_';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type AuthMode = 'bearer' | 'customer-token';

export interface RequestOptions {
  url: string;
  method?: HttpMethod;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  needAuth?: boolean;        // 是否需要 Token，默认 true
  showErrorToast?: boolean;  // 是否显示错误提示
  skipDebounce?: boolean;    // 是否跳过防抖，默认 false
  skipAuthHandler?: boolean; // 是否跳过 401 处理，默认 false
  prefix?: string;           // API 前缀，默认 DEFAULT_PREFIX
  authMode?: AuthMode;       // Token 头格式
  retry?: number;            // 失败重试次数，默认 REQUEST_RETRY_COUNT
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface RequestError {
  code: string | number;
  message: string;
  raw?: any;
}

export interface RequestPromise<T> extends Promise<ApiResponse<T>> {
  __abort?: () => void;
}
```

## 核心实现

```typescript
// ===== 防抖去重 =====
const pendingRequests = new Map<string, Promise<any>>();

function generateRequestKey(url: string, method: string, data?: any): string {
  try {
    const sorted = data == null ? '' : stableStringify(data);
    return `${method}:${url}:${sorted}`;
  } catch {
    return `${method}:${url}:${Date.now()}`;
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value as object).sort();
  const pairs = keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`);
  return `{${pairs.join(',')}}`;
}

// ===== 请求拦截器 =====
function requestInterceptor(options: RequestOptions): { url: string; init: RequestInit } {
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const url = options.url.startsWith('http') ? options.url : `${BASE_URL}${prefix}${options.url}`;
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && shouldSetJsonContentType(options.data)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.needAuth !== false) {
    const token = getToken();
    if (token) {
      const mode = options.authMode ?? 'bearer';
      if (mode === 'bearer') {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        headers.set('Customer-Token', token);
      }
    }
  }

  const init: RequestInit = {
    method: options.method || 'GET',
    headers,
    signal: abortController.signal,
  };

  if (options.data !== undefined && options.data !== null) {
    init.body = options.data instanceof FormData ? options.data : JSON.stringify(options.data);
  }

  return { url, init };
}

function shouldSetJsonContentType(data: any): boolean {
  if (data === undefined || data === null) return false;
  if (typeof data === 'string') return true;
  if (data instanceof FormData || data instanceof ArrayBuffer || data instanceof Blob) return false;
  return typeof data === 'object';
}

// ===== 响应拦截器 =====
async function responseInterceptor<T>(res: Response, options: RequestOptions): Promise<ApiResponse<T>> {
  const statusCode = res.status;
  let data: any;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (statusCode === 401 || AUTH_FAILURE_CODES.includes(data?.code)) {
    throw formatError('UNAUTHORIZED', data?.message || '登录已过期', { res, data });
  }

  if (statusCode === 403) {
    throw formatError('FORBIDDEN', data?.message || '权限不足', { res, data });
  }

  if (statusCode < 200 || statusCode >= 300) {
    throw formatError('HTTP_ERROR', `请求失败: ${statusCode}`, { res, data });
  }

  if (data && data.code !== undefined && !SUCCESS_CODES.includes(data.code)) {
    throw formatError(data.code, extractMessage(data) || '请求失败', { res, data });
  }

  return data;
}

// ===== Mock 处理 =====
function shouldUseMock(): boolean {
  return USE_MOCK;
}

function findMockEntry<T>(method: string, url: string): { key: string; entry?: MockEntry<T> } {
  const exactKey = `${method}:${url}`;
  const exactEntry = MOCK_MAP[exactKey];
  if (exactEntry) return { key: exactKey, entry: exactEntry };

  const matchedKey = Object.keys(MOCK_MAP).find((key) => {
    const [m, ...rest] = key.split(':');
    if (m !== method) return false;
    const pattern = rest.join(':');
    return matchRestPath(pattern, url);
  });

  return { key: matchedKey || exactKey, entry: matchedKey ? MOCK_MAP[matchedKey] : undefined };
}

function matchRestPath(pattern: string, url: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean);
  const urlParts = url.split('/').filter(Boolean);
  if (patternParts.length !== urlParts.length) return false;
  return patternParts.every((part, i) => part.startsWith(':') || part === urlParts[i]);
}

function resolveMock<T>(method: string, url: string): Promise<ApiResponse<T>> {
  const { key, entry } = findMockEntry<T>(method, url);
  if (!entry) {
    console.warn(`[mock] 未找到: ${key}`);
    return Promise.resolve({ code: 200, message: 'mock', data: null as T });
  }
  return Promise.resolve({ code: entry.code, message: entry.message, data: entry.data });
}

// ===== 核心请求 =====
export function request<T = any>(options: RequestOptions): RequestPromise<T> {
  const method = options.method || 'GET';

  if (shouldUseMock()) {
    return resolveMock<T>(method, options.url) as RequestPromise<T>;
  }

  if (options.needAuth !== false && !getToken()) {
    return Promise.reject(formatError('NO_AUTH_TOKEN', '未登录')) as RequestPromise<T>;
  }

  const url = options.url.startsWith('http')
    ? options.url
    : `${BASE_URL}${options.prefix || DEFAULT_PREFIX}${options.url}`;
  const requestKey = generateRequestKey(url, method, options.data);

  const maxRetry = options.retry ?? REQUEST_RETRY_COUNT;
  let currentRetry = 0;
  let abortController = new AbortController();

  const runRequest = (isRetry = false): RequestPromise<T> => {
    if (!options.skipDebounce && !isRetry) {
      const pending = pendingRequests.get(requestKey);
      if (pending) return pending as RequestPromise<T>;
    }

    const { url: finalUrl, init } = requestInterceptor(options);

    const innerPromise = fetchWithTimeout(finalUrl, init, options.timeout || REQUEST_TIMEOUT)
      .then(async (res) => responseInterceptor<T>(res, options))
      .catch(async (err: RequestError | Error) => {
        const requestErr = err instanceof Error ? formatError('NETWORK_ERROR', err.message, err) : err;

        if (requestErr.code === 'UNAUTHORIZED' && !isRetry && !options.skipAuthHandler) {
          try {
            await refreshToken();
            abortController = new AbortController();
            const retryPromise = runRequest(true);
            return retryPromise;
          } catch {
            handleUnauthorized();
            throw requestErr;
          }
        }

        const retriable = requestErr.code === 'TIMEOUT' || requestErr.code === 'NETWORK_ERROR';
        if (retriable && currentRetry < maxRetry) {
          currentRetry += 1;
          abortController = new AbortController();
          const retryPromise = runRequest(true);
          return retryPromise;
        }
        throw requestErr;
      })
      .finally(() => {
        pendingRequests.delete(requestKey);
      }) as RequestPromise<T>;

    innerPromise.__abort = () => abortController.abort();

    pendingRequests.set(requestKey, innerPromise);
    return innerPromise;
  };

  return runRequest();
}

async function fetchWithTimeout(url: string, init: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw formatError('TIMEOUT', '请求超时');
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

export function get<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): RequestPromise<T> {
  return request<T>({ url, method: 'GET', data, ...options });
}

export function post<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): RequestPromise<T> {
  return request<T>({ url, method: 'POST', data, ...options });
}

export function put<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): RequestPromise<T> {
  return request<T>({ url, method: 'PUT', data, ...options });
}

export function del<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): RequestPromise<T> {
  return request<T>({ url, method: 'DELETE', data, ...options });
}
```

## 辅助方法

```typescript
export function formatError(code: string | number, message: string, raw?: any): RequestError {
  return { code, message, raw };
}

export function extractMessage(data: any): string {
  if (!data || typeof data !== 'object') return '请求失败';
  return data.message || data.msg || data.error || data.detail || '请求失败';
}
```

## 使用示例

```typescript
// src/api/user.ts
import { get, post } from './request';

export function getUserInfo() {
  return get<UserInfo>('/user/info');
}

export function updateUserInfo(data: Partial<UserInfo>) {
  return post<void>('/user/update', data);
}
```

```typescript
// 组件中使用
const res = await getUserInfo();
```

```typescript
// 跳过防抖（提交类接口）
await post('/api/order', data, { skipDebounce: true });
```

```typescript
// 无需鉴权（如发送验证码）
await post('/api/sms/send', { phone }, { needAuth: false });
```

```typescript
// 失败重试（弱网场景）
await get('/api/order/list', null, { retry: 2 });
```

```typescript
// 组件卸载时取消请求
const task = get('/api/big-data');
// useEffect / onUnmounted 中
task.__abort?.();
```

## 与 uniapp 规范的差异点

| 项 | 通用前端规范 | uniapp 规范 |
|----|-------------|------------|
| 底层请求 | `fetch` / `axios` | `uni.request` |
| 上传 | `fetch` FormData / `axios` | `uni.uploadFile` |
| SSE | `EventSource` | `uni.request` `enableChunked: true` |
| Token 存储 | `localStorage` / `sessionStorage` | `uni.getStorageSync` |
| 取消请求 | `AbortController` | `task.abort()` |
| 网络错误字段 | `error.message` | `err.errMsg` |

其余响应信封、错误码、鉴权拦截、Mock、去重、重试逻辑完全一致。
