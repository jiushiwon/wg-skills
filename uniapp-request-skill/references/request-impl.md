# request.ts 完整实现参考

> 生产级 uni-app 请求封装示例，可直接作为项目起点。

## 目录

- [文件位置](#文件位置)
- [类型定义](#类型定义)
- [核心实现](#核心实现)
- [辅助方法](#辅助方法)
- [使用示例](#使用示例)
- [注意事项](#注意事项)

---

## 文件位置

```
src/api/request.ts
```

---

## 配套配置

```typescript
// src/config/api.config.ts
export const BASE_URL = import.meta.env.VITE_BASE_URL || '';
export const DEFAULT_PREFIX = '/api/v1';
export const REQUEST_TIMEOUT = 30000;
export const REQUEST_RETRY_COUNT = 0;

// 业务成功码：按后端契约配置。本示例约定 code=0 为成功，code<0 为业务异常
export const SUCCESS_CODES: (string | number)[] = [0];

// 与 401 同等处理的业务失败码，为空数组表示不启用
export const AUTH_FAILURE_CODES: (string | number)[] = [];

// Mock 全局开关：true 时所有请求强制走 Mock
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
```

---

## 类型定义

```typescript
import { getToken } from '@/utils/auth';
import { handleUnauthorized, refreshToken } from '@/services/auth.service';
import {
  BASE_URL,
  DEFAULT_PREFIX,
  REQUEST_TIMEOUT,
  USE_MOCK,
  SUCCESS_CODES,           // 项目自定义业务成功码，本示例约定 code=0 为成功
  REQUEST_RETRY_COUNT,     // 网络错误/超时重试次数，默认 0
  AUTH_FAILURE_CODES,      // 与 401 同等处理的业务失败码（可选）
} from '@/config/api.config';
import { MOCK_MAP, type MockEntry } from './_mocks_';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type AuthMode = 'bearer' | 'customer-token';

export interface RequestOptions {
  url: string;
  method?: HttpMethod;
  data?: any;                // 请求体：通常为 plain object；uni.request 也支持 string / ArrayBuffer / FormData 等
  header?: Record<string, string>;
  timeout?: number;
  needAuth?: boolean;        // 是否需要 Token，默认 true
  showErrorToast?: boolean;  // 是否显示错误提示（由业务层或 safeRequest 消费）
  skipDebounce?: boolean;    // 是否跳过防抖，默认 false
  skipAuthHandler?: boolean; // 是否跳过 401 处理，默认 false
  prefix?: string;           // API 前缀，默认 DEFAULT_PREFIX
  authMode?: AuthMode;       // Token 头格式：bearer | customer-token
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

// 支持 abort 的 Promise 类型
export interface RequestPromise<T> extends Promise<ApiResponse<T>> {
  __abort?: () => void;
}
```

---

## 核心实现

```typescript
// ===== 防抖去重 =====
// 策略：同一 key 的并发请求只发一次，返回同一 Promise；完成后允许重新发起。
const pendingRequests = new Map<string, Promise<any>>();

function generateRequestKey(url: string, method: string, data?: any): string {
  try {
    const sorted = data == null ? '' : stableStringify(data);
    return `${method}:${url}:${sorted}`;
  } catch {
    // 不可序列化数据（FormData / ArrayBuffer / 循环引用等）不做去重 key
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
  // options.header 会覆盖默认 Content-Type，如需强制默认头需调整合并顺序
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  };

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

  // Mock 拦截优先，开发期不依赖登录态
  if (shouldUseMock()) {
    return resolveMock<T>(method, options.url) as RequestPromise<T>;
  }

  // 游客拦截：请求层直接拒绝，避免无意义请求
  if (options.needAuth !== false && !getToken()) {
    return Promise.reject(formatError('NO_AUTH_TOKEN', '未登录')) as RequestPromise<T>;
  }

  const url = options.url.startsWith('http') ? options.url : `${BASE_URL}${prefix}${options.url}`;
  const requestKey = generateRequestKey(url, method, options.data);

  const maxRetry = options.retry ?? REQUEST_RETRY_COUNT;
  let currentRetry = 0;

  const runRequest = (isRetry = false): RequestPromise<T> => {
    // 每次重试都重新经过拦截器，确保能拿到最新 Token
    const opts = requestInterceptor(options);

    // 防抖去重：非重试请求默认返回同一 Promise
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
          // 请求完成后清理 pending，释放内存
          pendingRequests.delete(requestKey);
        },
      });

      // 支持请求取消（如页面卸载时）
      abortTask = () => {
        if (task?.abort) task.abort();
      };
    }).catch(async (err: RequestError) => {
      // 401 触发 Token 刷新并重试原请求
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

      // 仅对超时/网络错误重试
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

---

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

---

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

---

## 注意事项

1. **并发去重策略**：同一 key 的并发请求只发一次，返回同一 Promise；请求完成后清理 `pendingRequests`，释放内存。
2. **请求 key 稳定化**：使用 `stableStringify` 递归排序对象 key，避免同一对象因属性顺序不同产生不同 key。对于不可序列化数据（FormData、ArrayBuffer、循环引用等），`generateRequestKey` 会回退到时间戳，自动放弃去重，避免错误合并。
3. **成功状态码**：HTTP 层 `200 <= statusCode < 300` 均视为请求成功；业务层通过 `SUCCESS_CODES` 配置成功码。本示例约定 `code = 0` 为业务成功，`code < 0` 为业务异常，项目需按实际后端契约调整。
4. **失败重试**：仅对 `TIMEOUT` / `NETWORK_ERROR` 自动重试，默认不重试；可在 `api.config.ts` 配置全局 `REQUEST_RETRY_COUNT`，或单请求设置 `retry`。
5. **401 处理**：HTTP 401 时先调用 `refreshToken()` 刷新，成功后以 `isRetry = true` 重试原请求；刷新失败调用 `handleUnauthorized()` 并抛出原错误。
6. **取消请求**：返回的 Promise 挂载 `__abort` 方法，页面卸载时可调用避免回调执行。
