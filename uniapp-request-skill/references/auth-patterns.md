# 请求层鉴权模式参考

> 本文件提供与请求层衔接的最小鉴权模式。完整登录态、权限设计、登出回跳等不在 `uniapp-request-skill` 范围内，需由项目自行统一收口。

## 登录态存储方案选择

请求层只依赖 `getToken()` 的返回值，不关心 token 具体存在哪里。项目可按实际情况选择以下两种方案之一。

### 方案 A：本地 Storage（最小化）

适合简单项目或没有 Pinia 状态管理的场景：

```typescript
// src/utils/auth.ts
export function getToken(): string | null {
  return uni.getStorageSync('token') || null;
}

export function setToken(token: string): void {
  uni.setStorageSync('token', token);
}

export function clearToken(): void {
  uni.removeStorageSync('token');
}

export function getRefreshToken(): string | null {
  return uni.getStorageSync('refresh_token') || null;
}
```

### 方案 B：Pinia userStore（推荐）

适合使用 Pinia 管理全局状态的项目。请求层仍通过 `getToken()` 读取，但内部从 store 获取：

```typescript
// src/utils/auth.ts
import { useUserStore } from '@/stores/user';

export function getToken(): string | null {
  const userStore = useUserStore();
  return userStore.token || null;
}

export function setToken(token: string): void {
  const userStore = useUserStore();
  userStore.setToken(token);
}

export function setRefreshToken(token: string): void {
  const userStore = useUserStore();
  userStore.setRefreshToken(token);
}

export function getRefreshToken(): string | null {
  const userStore = useUserStore();
  return userStore.refreshToken || null;
}

export function clearToken(): void {
  const userStore = useUserStore();
  userStore.clearToken();
}
```

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(uni.getStorageSync('token') || null);
  const refreshToken = ref<string | null>(uni.getStorageSync('refresh_token') || null);

  function setToken(value: string) {
    token.value = value;
    uni.setStorageSync('token', value);
  }

  function setRefreshToken(value: string) {
    refreshToken.value = value;
    uni.setStorageSync('refresh_token', value);
  }

  function clearToken() {
    token.value = null;
    refreshToken.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('refresh_token');
  }

  return { token, refreshToken, setToken, setRefreshToken, clearToken };
});
```

> **重要**：本 skill 示例默认采用**方案 A**。如果你使用 Pinia，请替换为方案 B，但请求层代码本身不需要改动。

## Token 失效前置判断

在发起需要鉴权的请求前，若本地 Token 已过期，可直接拒绝或触发刷新，避免无意义请求打到后端。

```typescript
// src/utils/auth.ts
const TOKEN_EXPIRE_BUFFER_MS = 60 * 1000; // 提前 60 秒视为过期

export function isTokenExpired(): boolean {
  const expireAt = uni.getStorageSync('token_expire_at');
  if (!expireAt) return true;
  return Date.now() + TOKEN_EXPIRE_BUFFER_MS >= Number(expireAt);
}
```

请求层可在 `requestInterceptor` 之前调用：

```typescript
if (options.needAuth !== false && isTokenExpired()) {
  // 选择 A：直接拒绝
  return Promise.reject(formatError('TOKEN_EXPIRED', '登录已过期'));
  // 选择 B：先刷新 Token，再发起请求（需把 requestInterceptor 改为 async）
}
```

## Token 注入

```typescript
function requestInterceptor(options: RequestOptions): RequestOptions {
  const headers: Record<string, string> = { ...options.header };

  // 普通对象/字符串默认 application/json；FormData / ArrayBuffer / Blob 等不设置
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
```

| 选项 | 说明 |
|------|------|
| `needAuth: false` | 跳过 Token 注入，如登录/发送验证码接口 |
| `authMode: 'bearer'` | 使用 `Authorization: Bearer xxx` |
| `authMode: 'customer-token'` | 使用 `Customer-Token: xxx`（默认） |

## 401 统一响应处理

```typescript
function responseInterceptor<T>(res: any, options: RequestOptions): ApiResponse<T> {
  const { statusCode, data } = res;

  if (statusCode === 401) {
    // 抛出 UNAUTHORIZED，由 request.ts 的 catch 触发 refreshToken 或 handleUnauthorized
    throw formatError('UNAUTHORIZED', data?.message || '登录已过期', res);
  }

  if (statusCode === 403) {
    throw formatError('FORBIDDEN', data?.message || '权限不足', res);
  }

  // ...
}
```

## Token 刷新队列（可选高级）

```typescript
// src/services/auth.service.ts
import { BASE_URL } from '@/config/api.config';
import { getRefreshToken, setToken, clearToken } from '@/utils/auth';

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

export async function refreshToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const res = await uni.request({
      url: `${BASE_URL}/auth/refresh`,
      method: 'POST',
      data: { refreshToken: getRefreshToken() },
    });

    const { accessToken } = res.data?.data || {};
    if (!accessToken) {
      throw new Error('刷新 Token 失败');
    }

    setToken(accessToken);

    // 唤醒队列中的请求
    refreshQueue.forEach(({ resolve }) => resolve(accessToken));
    refreshQueue = [];

    return accessToken;
  } catch (err) {
    // 刷新失败，清空队列并抛出错误，由调用方决定是否跳转登录页
    refreshQueue.forEach(({ reject }) => reject(err));
    refreshQueue = [];
    throw err;
  } finally {
    isRefreshing = false;
  }
}
```

**注意**：refresh 接口直接调用 `uni.request`，避免循环使用本 skill 封装的 `request`。

## handleUnauthorized 实现

当 Token 刷新失败或收到明确的 401 需要强制登出时，由 `handleUnauthorized()` 统一清理登录态并跳转登录页：

```typescript
// src/services/auth.service.ts
export function handleUnauthorized() {
  clearToken();

  // 方案 A：直接跳转登录页
  uni.reLaunch({ url: '/pages/login/login' });

  // 方案 B：触发全局事件，让 App.vue 或登录拦截器处理
  // uni.$emit('auth:logout');
}
```

> **注意**：登录页路径、是否保留当前页面栈、是否记录回跳地址，都属于业务决策，本 skill 只给出最小示例，项目需自行调整。

## 请求层集成重试

401 触发刷新后，请求层需要把原请求重新发一次，而不是把错误抛给业务层。`request-impl.md` 中的完整实现采用以下策略：

- 响应拦截器识别 401 并抛出 `UNAUTHORIZED` 错误
- `request.ts` 的 `.catch` 中捕获 401，调用 `refreshToken()`
- 刷新成功后以 `isRetry = true` 重试原请求
- 刷新失败调用 `handleUnauthorized()` 并抛出原错误
- 用 `isRetry` 标记避免无限循环

详见 [request-impl.md](request-impl.md)「核心实现」小节。

### 与 Token 刷新队列结合

`refreshToken()` 内部已做队列化：同一时刻只有一个刷新请求，其他请求挂起等待。请求层只需在 401 时调用 `refreshToken()`，失败则统一登出。

具体实现见上文「Token 刷新队列」小节。

## 游客模式

请求层只做最小拦截：需要鉴权且无 Token 时直接拒绝。

```typescript
if (options.needAuth !== false && !getToken()) {
  return Promise.reject(formatError('NO_AUTH_TOKEN', '未登录'));
}
```

业务层建议配合 `useAuth` 在用户点击前预检查，避免先发起请求再报错：

```typescript
const { checkLogin } = useAuth();

function handleLike() {
  if (!checkLogin()) return;
  post('/api/like', { id: itemId });
}
```

## 配套阅读

- [request-impl.md](request-impl.md)：完整 `request.ts` 实现，包含 Token 注入与 401/403 响应处理
- [error-handling.md](error-handling.md)：错误处理与文件上传封装