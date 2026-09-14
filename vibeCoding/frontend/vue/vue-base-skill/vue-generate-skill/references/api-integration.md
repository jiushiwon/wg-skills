# API 请求层集成指南（严格对齐 `frontend-request-skill`）

> 本 Skill **不重新发明请求层**。所有 HTTP 请求必须复用 `frontend-request-skill` 的标准实现。
> 本文给出在 Vue3 + TS 项目中**正确接入**该标准的全部约定。

---

## 1. 强制约定（不可违反）

### 1.1 底层 API：必须用 `fetch`，不用 axios

| 框架 | 底层 API | 理由 |
|------|---------|------|
| Web / Vue3（本 Skill） | `fetch` | 与 `frontend-request-skill` 一致，零额外依赖 |
| uniapp / 小程序 | `uni.request` | 见 `frontend-request-skill/references/uniapp-spec.md` |

### 1.2 响应信封：必须 `{ code, message, data }`

```typescript
// src/types/api.ts（项目自带，与 backend 契约对齐）
export interface ApiResponse<T = unknown> {
  code: number;      // 业务状态码：0 = 成功，<0 = 业务异常
  message: string;   // 提示信息
  data: T;           // 业务数据
}
```

### 1.3 文件结构：必须按 frontend-request-skill 划分

```
src/
├── api/
│   ├── request.ts              # 统一请求封装（核心，必装）
│   ├── upload.ts               # 文件上传（必装）
│   ├── sse.ts                  # SSE 流式（按需，AI 聊天场景）
│   ├── _mocks_/                # Mock 数据（开发期）
│   │   ├── index.ts
│   │   └── *.mock.ts
│   ├── modules/                # 按业务模块聚合（user.ts / auth.ts / ...）
│   └── index.ts                # API 统一导出入口
├── config/
│   ├── api.config.ts           # BASE_URL / PREFIX / 超时 / Mock 开关 / 成功码
│   └── error.config.ts         # ERROR_CODE_MAP
├── services/
│   └── auth.service.ts         # 登录态收口（含 Token 刷新队列）
├── utils/
│   ├── auth.ts                 # getToken / setToken / clearToken
│   ├── error.ts                # formatError / extractMessage
│   ├── toast.ts                # showError / showInfo
│   └── storage.ts              # localStorage 封装
├── composables/
│   └── useAuth.ts              # 游客判断 composable
└── types/
    ├── api.ts                  # ApiResponse<T> / RequestError / ...
    └── *.ts                    # 按业务域拆分的类型
```

---

## 2. 一键安装：`frontend-request-skill` 集成

### 2.1 复制核心文件

从 `frontend-request-skill/references/` 复制：

| 源文件 | 目标位置 | 必须/可选 |
|--------|----------|-----------|
| `frontend-spec.md`（参考） | 阅读理解 | 必须 |
| `request.ts`（见后文完整示例） | `src/api/request.ts` | 必须 |
| `error-handling.md` | 阅读理解 | 必须 |
| `auth-patterns.md` | 阅读理解 | 必须 |

### 2.2 创建配置文件

```typescript
// src/config/api.config.ts
export const BASE_URL = import.meta.env.VITE_BASE_URL || '';
export const DEFAULT_PREFIX = '/api';
export const REQUEST_TIMEOUT = 30_000;
export const REQUEST_RETRY_COUNT = 0;

// 与后端契约对齐：code=0 成功，code<0 业务异常
export const SUCCESS_CODES: (number | string)[] = [0];

// 与 401 同等处理的业务失败码（按后端契约）
export const AUTH_FAILURE_CODES: (number | string)[] = [];

// Mock 全局开关：仅开发环境开启
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
```

```typescript
// src/config/error.config.ts
export const ERROR_CODE_MAP: Record<string, string> = {
  // HTTP 状态异常
  NO_AUTH_TOKEN: '请先登录',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '权限不足',
  TIMEOUT: '请求超时，请检查网络',
  NETWORK_ERROR: '网络异常，请稍后重试',
  HTTP_ERROR: '请求失败',
  UPLOAD_ERROR: '上传失败',

  // 业务异常示例（按后端契约调整）
  '-1001': '参数校验错误',
  '-1002': '未登录或 Token 无效',
  '-1003': '无权限',
  '-1004': '资源不存在',
  '-1005': '资源冲突',
  '-1006': '请求过于频繁',
  '-2000': '系统繁忙，请稍后再试',
};
```

---

## 3. `src/api/request.ts`（fetch 标准实现）

```typescript
// src/api/request.ts
import { getToken } from '@/utils/auth';
import { handleUnauthorized } from '@/services/auth.service';
import { formatError, extractMessage } from '@/utils/error';
import {
  BASE_URL,
  DEFAULT_PREFIX,
  REQUEST_TIMEOUT,
  REQUEST_RETRY_COUNT,
  USE_MOCK,
  SUCCESS_CODES,
  AUTH_FAILURE_CODES,
} from '@/config/api.config';
import { MOCK_MAP, type MockEntry } from './_mocks_';

// ==================== 类型 ====================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';
export type AuthMode = 'bearer' | 'customer-token';

export interface RequestOptions {
  url: string;
  method?: HttpMethod;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  needAuth?: boolean;        // 默认 true
  showErrorToast?: boolean;  // 默认 true
  skipDebounce?: boolean;    // 默认 false
  skipAuthHandler?: boolean; // 默认 false
  prefix?: string;           // 默认 DEFAULT_PREFIX
  authMode?: AuthMode;
  retry?: number;
}

export interface RequestPromise<T> extends Promise<ApiResponse<T>> {
  __abort?: () => void;
}

// ==================== 防抖去重 ====================

const pendingRequests = new Map<string, Promise<unknown>>();

function generateRequestKey(url: string, method: string, data?: unknown): string {
  try {
    const sorted = data == null ? '' : stableStringify(data);
    return `${method}:${url}:${sorted}`;
  } catch {
    return `${method}:${url}:${Date.now()}`;
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const pairs = keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`);
  return `{${pairs.join(',')}}`;
}

// ==================== 拦截器 ====================

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
      if (mode === 'bearer') headers.set('Authorization', `Bearer ${token}`);
      else headers.set('Customer-Token', token);
    }
  }

  const init: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.data !== undefined && options.data !== null) {
    init.body = options.data instanceof FormData ? options.data : JSON.stringify(options.data);
  }

  return { url, init };
}

function shouldSetJsonContentType(data: unknown): boolean {
  if (data === undefined || data === null) return false;
  if (typeof data === 'string') return true;
  if (data instanceof FormData || data instanceof ArrayBuffer || data instanceof Blob) return false;
  return typeof data === 'object';
}

async function responseInterceptor<T>(res: Response, options: RequestOptions): Promise<ApiResponse<T>> {
  const statusCode = res.status;
  let data: ApiResponse<T> | null = null;

  try {
    data = (await res.json()) as ApiResponse<T>;
  } catch {
    data = null;
  }

  if (statusCode === 401 || (data && AUTH_FAILURE_CODES.includes(data.code))) {
    throw formatError('UNAUTHORIZED', data?.message || '登录已过期');
  }

  if (statusCode === 403) {
    throw formatError('FORBIDDEN', data?.message || '权限不足');
  }

  if (statusCode < 200 || statusCode >= 300) {
    throw formatError('HTTP_ERROR', `请求失败: ${statusCode}`);
  }

  if (data && data.code !== undefined && !SUCCESS_CODES.includes(data.code)) {
    throw formatError(data.code, extractMessage(data) || '请求失败');
  }

  return data ?? (formatError('EMPTY_RESPONSE', '响应为空') as unknown as ApiResponse<T>);
}

// ==================== Mock ====================

function findMockEntry<T>(method: string, url: string): MockEntry<T> | undefined {
  const exactKey = `${method}:${url}`;
  if (MOCK_MAP[exactKey]) return MOCK_MAP[exactKey] as MockEntry<T>;
  const matchedKey = Object.keys(MOCK_MAP).find((key) => {
    const [m, ...rest] = key.split(':');
    if (m !== method) return false;
    return matchRestPath(rest.join(':'), url);
  });
  return matchedKey ? (MOCK_MAP[matchedKey] as MockEntry<T>) : undefined;
}

function matchRestPath(pattern: string, url: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean);
  const urlParts = url.split('?')[0]!.split('/').filter(Boolean);
  if (patternParts.length !== urlParts.length) return false;
  return patternParts.every((p, i) => p.startsWith(':') || p === urlParts[i]);
}

// ==================== 核心 request ====================

export async function request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  const { url, init } = requestInterceptor(options);

  // Mock 优先
  if (USE_MOCK) {
    const mock = findMockEntry<T>(init.method ?? 'GET', url);
    if (mock) return mock.response as ApiResponse<T>;
  }

  // 防抖去重
  const key = generateRequestKey(url, init.method ?? 'GET', options.data);
  if (!options.skipDebounce) {
    const pending = pendingRequests.get(key);
    if (pending) return pending as Promise<ApiResponse<T>>;
  }

  const promise = (async () => {
    const controller = new AbortController();
    const timeout = options.timeout ?? REQUEST_TIMEOUT;
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      return await responseInterceptor<T>(res, options);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw formatError('TIMEOUT', '请求超时，请检查网络');
      }
      if (!navigator.onLine) {
        throw formatError('NETWORK_ERROR', '网络异常，请检查连接');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  })();

  if (!options.skipDebounce) pendingRequests.set(key, promise);
  promise.finally(() => pendingRequests.delete(key));

  // 401 处理交给 auth.service
  if (!options.skipAuthHandler) {
    promise.catch((err) => {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: unknown }).code === 'UNAUTHORIZED') {
        handleUnauthorized();
      }
    });
  }

  return promise;
}

// ==================== 便捷方法 ====================

export function get<T = unknown>(url: string, data?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): RequestPromise<T> {
  const query = data ? `?${new URLSearchParams(data as Record<string, string>).toString()}` : '';
  return request<T>({ ...options, url: `${url}${query}`, method: 'GET', data }) as RequestPromise<T>;
}

export function post<T = unknown>(url: string, data?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): RequestPromise<T> {
  return request<T>({ ...options, url, method: 'POST', data }) as RequestPromise<T>;
}

export function put<T = unknown>(url: string, data?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): RequestPromise<T> {
  return request<T>({ ...options, url, method: 'PUT', data }) as RequestPromise<T>;
}

export function del<T = unknown>(url: string, data?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): RequestPromise<T> {
  return request<T>({ ...options, url, method: 'DELETE', data }) as RequestPromise<T>;
}
```

---

## 4. `src/services/auth.service.ts`（鉴权收口）

```typescript
// src/services/auth.service.ts
import { useUserStore } from '@/stores/modules/user';
import { post } from '@/api/request';
import { setToken, clearToken, getRefreshToken, setRefreshToken } from '@/utils/auth';
import { formatError } from '@/utils/error';
import type { ApiResponse, LoginRequest, LoginResponse } from '@/types/api';

// ==================== Token 刷新队列 ====================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// ==================== 公开方法 ====================

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await post<LoginResponse>('/auth/login', credentials, { needAuth: false });
  setToken(res.data.token);
  setRefreshToken(res.data.refreshToken);
  useUserStore().setProfile(res.data.user);
  return res.data;
}

export function logout(): void {
  clearToken();
  useUserStore().clearProfile();
  window.location.href = '/login';
}

export function handleUnauthorized(): void {
  // 统一 401 处理：清状态 + 跳登录
  clearToken();
  useUserStore().clearProfile();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/**
 * 刷新 Token（带并发队列）
 * - 已刷新：复用同一 Promise
 * - 刷新中：后续请求进入队列等待
 * - 刷新失败：统一登出
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => subscribeTokenRefresh(resolve));
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    handleUnauthorized();
    return null;
  }

  isRefreshing = true;
  try {
    const res = await post<LoginResponse>(
      '/auth/refresh',
      { refreshToken },
      { needAuth: false, skipAuthHandler: true }
    );
    setToken(res.data.token);
    setRefreshToken(res.data.refreshToken);
    onTokenRefreshed(res.data.token);
    return res.data.token;
  } catch (err) {
    handleUnauthorized();
    throw formatError('REFRESH_FAILED', '刷新 Token 失败');
  } finally {
    isRefreshing = false;
  }
}
```

---

## 5. `src/utils/auth.ts`（Token 存取抽象）

```typescript
// src/utils/auth.ts
import { useUserStore } from '@/stores/modules/user';

export function getToken(): string | null {
  const store = useUserStore();
  return store.token;
}

export function setToken(token: string): void {
  useUserStore().setToken(token);
}

export function clearToken(): void {
  useUserStore().clearToken();
}

export function getRefreshToken(): string | null {
  return useUserStore().refreshToken;
}

export function setRefreshToken(token: string): void {
  useUserStore().setRefreshToken(token);
}
```

---

## 6. `src/utils/error.ts`

```typescript
// src/utils/error.ts
import type { ApiResponse } from '@/types/api';

export interface RequestError {
  code: string | number;
  message: string;
  raw?: unknown;
}

export function formatError(code: string | number, message: string, raw?: unknown): RequestError {
  return { code, message, raw };
}

export function extractMessage(data: ApiResponse<unknown> | null | undefined, fallback = '请求失败'): string {
  if (!data || typeof data !== 'object') return fallback;
  return data.message || fallback;
}
```

---

## 7. `src/utils/toast.ts`

```typescript
// src/utils/toast.ts
import { ElMessage } from 'element-plus';
import { formatError, type RequestError } from './error';
import { resolveErrorMessage } from '@/config/error.config';

const isDev = import.meta.env.DEV;

export function showError(err: unknown): void {
  const error: RequestError =
    err && typeof err === 'object' && 'code' in err
      ? (err as RequestError)
      : formatError('UNKNOWN', '未知错误');

  const message = resolveErrorMessage(error);

  if (isDev) {
    // 开发环境：详细弹窗
    console.error('[API Error]', error);
    ElMessage({
      type: 'error',
      message: `${message} (code: ${error.code})`,
      duration: 5000,
      showClose: true,
    });
  } else {
    // 生产环境：简洁 Toast
    ElMessage({ type: 'error', message, duration: 3000 });
  }
}

export function showInfo(message: string): void {
  ElMessage({ type: 'info', message, duration: 3000 });
}

export function showSuccess(message: string): void {
  ElMessage({ type: 'success', message, duration: 2000 });
}
```

---

## 8. `src/composables/useAuth.ts`

```typescript
// src/composables/useAuth.ts
import { useUserStore } from '@/stores/modules/user';
import { useRouter } from 'vue-router';

export function useAuth() {
  const userStore = useUserStore();
  const router = useRouter();

  /** 是否已登录 */
  function isLoggedIn(): boolean {
    return Boolean(userStore.token);
  }

  /** 检查登录态，未登录跳登录页 */
  function checkLogin(redirect?: string): boolean {
    if (!isLoggedIn()) {
      router.push({ path: '/login', query: redirect ? { redirect } : undefined });
      return false;
    }
    return true;
  }

  /** 检查角色权限 */
  function hasRole(roles: string | string[]): boolean {
    if (!userStore.profile) return false;
    const required = Array.isArray(roles) ? roles : [roles];
    return required.some((r) => userStore.profile!.roles.includes(r));
  }

  return { isLoggedIn, checkLogin, hasRole };
}
```

---

## 9. `src/api/modules/user.ts`（业务 API 示例）

```typescript
// src/api/modules/user.ts
import { get, post, put, del } from '../request';
import type { User, UserListParams, UserListResponse } from '@/types/user';

export const userApi = {
  list: (params: UserListParams) =>
    get<UserListResponse>('/users', params),

  get: (id: number) =>
    get<User>(`/users/${id}`),

  create: (data: Omit<User, 'id'>) =>
    post<User>('/users', data),

  update: (id: number, data: Partial<User>) =>
    put<User>(`/users/${id}`, data),

  remove: (id: number) =>
    del<void>(`/users/${id}`),
};
```

---

## 10. 红线（不可违反）

1. ❌ 不用 `axios`（用 `fetch`）
2. ❌ 不在 `api/request.ts` 里写鉴权跳转（统一交给 `auth.service.ts`）
3. ❌ 不直接调 `localStorage.getItem('token')`（统一走 `utils/auth.ts`）
4. ❌ 不自己定义响应信封（用 `ApiResponse<T>`）
5. ❌ 不跳过 `successErrorToast: false` 默认值（除非确定要静默）
6. ❌ 不用 `successCodes.includes(data.code)` 判断成功（用 `SUCCESS_CODES` 常量）
7. ❌ 不把 401 重试写在每个 API（统一在 `auth.service.ts` 队列）
8. ❌ 不在 `vite.config.ts` 里硬编码 BASE_URL（用 `import.meta.env.VITE_BASE_URL`）
9. ❌ 不在请求层写业务错误码文案（统一走 `ERROR_CODE_MAP`）

---

## 11. 与后端的契约联动

后端必须遵守 `backend-convention-skill/references/response-format.md`：

```
HTTP 200 + { code: 0, message: "ok", data: {...} }  // 成功
HTTP 200 + { code: -1001, message: "参数错误", data: null }  // 业务异常
HTTP 401                                           // Token 失效
HTTP 403                                           // 无权限
```

前后端通过 `api-contract.md` 对齐错误码表与响应结构。
