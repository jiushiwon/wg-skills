# uniapp 请求层规范

> `frontend-request-skill` 的 uniapp 适配规范。面向微信小程序 / App / H5 跨端项目，底层使用 `uni.request` / `uni.uploadFile` / `uni.request`（`enableChunked` 模式）。
>
> 通用前端规范见 [frontend-spec.md](frontend-spec.md)。二者仅在底层网络 API 和 Token 存储方式上有差异，响应信封、错误码、鉴权拦截、去重、Mock、SSE 解析逻辑完全一致。

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
  header?: Record<string, string>;
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
function requestInterceptor(options: RequestOptions): RequestOptions {
  const headers: Record<string, string> = { ...options.header };

  if (!headers['Content-Type'] && shouldSetJsonContentType(options.data)) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.needAuth !== false) {
    const token = getToken();
    if (token) {
      const mode = options.authMode ?? 'customer-token';
      if (mode === 'bearer') {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Customer-Token'] = token;
      }
    }
  }

  return { ...options, header: headers };
}

function shouldSetJsonContentType(data: any): boolean {
  if (data === undefined || data === null) return false;
  if (typeof data === 'string') return true;
  if (data instanceof FormData || data instanceof ArrayBuffer || data instanceof Blob) return false;
  return typeof data === 'object';
}

// ===== 响应拦截器 =====
function responseInterceptor<T>(res: any, options: RequestOptions): ApiResponse<T> {
  const { statusCode, data } = res;

  if (statusCode === 401 || AUTH_FAILURE_CODES.includes(data?.code)) {
    throw formatError('UNAUTHORIZED', data?.message || '登录已过期', res);
  }

  if (statusCode === 403) {
    throw formatError('FORBIDDEN', data?.message || '权限不足', res);
  }

  if (statusCode < 200 || statusCode >= 300) {
    throw formatError('HTTP_ERROR', `请求失败: ${statusCode}`, res);
  }

  if (data && data.code !== undefined && !SUCCESS_CODES.includes(data.code)) {
    throw formatError(data.code, extractMessage(data) || '请求失败', res);
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
  const prefix = options.prefix || DEFAULT_PREFIX;
  const method = options.method || 'GET';

  if (shouldUseMock()) {
    return resolveMock<T>(method, options.url) as RequestPromise<T>;
  }

  if (options.needAuth !== false && !getToken()) {
    return Promise.reject(formatError('NO_AUTH_TOKEN', '未登录')) as RequestPromise<T>;
  }

  const url = options.url.startsWith('http') ? options.url : `${BASE_URL}${prefix}${options.url}`;
  const requestKey = generateRequestKey(url, method, options.data);

  const maxRetry = options.retry ?? REQUEST_RETRY_COUNT;
  let currentRetry = 0;

  const runRequest = (isRetry = false): RequestPromise<T> => {
    const opts = requestInterceptor(options);

    if (!opts.skipDebounce && !isRetry) {
      const pending = pendingRequests.get(requestKey);
      if (pending) return pending as RequestPromise<T>;
    }

    let abortTask: (() => void) | undefined;

    const innerPromise = new Promise<ApiResponse<T>>((resolve, reject) => {
      const task = uni.request({
        url,
        method,
        data: opts.data,
        header: opts.header,
        timeout: opts.timeout || REQUEST_TIMEOUT,
        dataType: 'json',
        success: (res) => {
          try {
            resolve(responseInterceptor<T>(res, opts));
          } catch (err) {
            reject(err);
          }
        },
        fail: (err) => {
          const message = err.errMsg || '网络异常';
          const code = message.toLowerCase().includes('timeout') ? 'TIMEOUT' : 'NETWORK_ERROR';
          reject(formatError(code, message, err));
        },
        complete: () => {
          pendingRequests.delete(requestKey);
        },
      });

      abortTask = () => {
        if (task?.abort) task.abort();
      };
    }).catch(async (err: RequestError) => {
      if (err.code === 'UNAUTHORIZED' && !isRetry && !opts.skipAuthHandler) {
        try {
          await refreshToken();
          const retryPromise = runRequest(true);
          abortTask = retryPromise.__abort;
          return retryPromise;
        } catch {
          handleUnauthorized();
          throw err;
        }
      }

      const retriable = err.code === 'TIMEOUT' || err.code === 'NETWORK_ERROR';
      if (retriable && currentRetry < maxRetry) {
        currentRetry += 1;
        const retryPromise = runRequest(true);
        abortTask = retryPromise.__abort;
        return retryPromise;
      }
      throw err;
    }) as RequestPromise<T>;

    innerPromise.__abort = () => abortTask?.();

    pendingRequests.set(requestKey, innerPromise);
    return innerPromise;
  };

  return runRequest();
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
  return data.message || data.msg || data.error || data.detail || data.errMsg || '请求失败';
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
// 页面中使用
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
// 页面卸载时取消请求
const task = get('/api/big-data');
// onUnload 中
task.__abort?.();
```

## 与通用前端规范的差异点

| 项 | 通用前端规范 | uniapp 规范 |
|----|-------------|------------|
| 底层请求 | `fetch` / `axios` | `uni.request` |
| 上传 | `fetch` FormData / `axios` | `uni.uploadFile` |
| SSE | `EventSource` | `uni.request` `enableChunked: true` |
| Token 存储 | `localStorage` / `sessionStorage` | `uni.getStorageSync` |
| 取消请求 | `AbortController` | `task.abort()` |
| 网络错误字段 | `error.message` | `err.errMsg` |

其余响应信封、错误码、鉴权拦截、Mock、去重、重试逻辑完全一致。
