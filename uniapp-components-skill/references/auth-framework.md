# 鉴权框架详解

## 1. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      App.vue onLaunch                       │
│                         ↓                                   │
│                    bootstrap()                             │
│                         ↓                                   │
│         ┌─────────────────┴─────────────────┐               │
│         ↓                                   ↓               │
│   未登录状态                         已登录状态            │
│   needLogin: true                   同步用户资料           │
│         ↓                           初始化完成             │
│   跳转登录页                                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. 核心模块

### 2.1 文件结构

```
src/
├── services/
│   └── auth.service.ts    # 认证服务
├── stores/
│   └── user.ts           # 用户状态
├── utils/
│   └── auth.ts          # 鉴权工具
└── constants/
    └── storage.ts       # 存储 Key
```

## 3. 认证服务

### 3.1 bootstrap 启动引导

```typescript
// src/services/auth.service.ts

export interface BootstrapResult {
  needLogin: boolean;
  isGuest: boolean;
  profileComplete?: boolean;
}

export async function bootstrap(): Promise<BootstrapResult> {
  const store = useUserStore();
  store.initUser();

  if (!store.isLoggedIn) {
    return { needLogin: true, isGuest: true };
  }

  // 已登录：同步资料 + 加载字典
  const results = await Promise.allSettled([
    store.fetchUserProfile({ skipAuthHandler: true }),
    loadAllDictionaries(),
  ]);

  // 401 处理
  if (results[0].status === 'rejected') {
    const err = results[0].reason;
    if (err?.message?.includes('登录已过期')) {
      store.logout();
      return { needLogin: true, isGuest: true };
    }
  }

  return {
    needLogin: false,
    isGuest: false,
    profileComplete: isProfileComplete(),
  };
}
```

### 3.2 登录态判断

```typescript
export function isLoggedIn(): boolean {
  return useUserStore().isLoggedIn;
}
```

### 3.3 需要登录的场景

```typescript
export function requireLogin(loginRedirect?: string): boolean {
  if (isLoggedIn()) return true;

  const redirectUrl = loginRedirect || resolveLoginRedirect();
  if (redirectUrl) saveLoginRedirect(redirectUrl);

  uni.showToast({ title: '请先登录', icon: 'none' });
  uni.reLaunch({ url: '/pages/login/index' });

  return false;
}
```

## 4. Token 管理

### 4.1 获取 Token

```typescript
// src/utils/auth.ts

export function getToken(): string | null {
  try {
    return uni.getStorageSync(STORAGE_KEYS.TOKEN) || null;
  } catch {
    return null;
  }
}
```

### 4.2 用户上下文

```typescript
// src/utils/auth.ts

function base64Encode(str: string): string {
  // 微信小程序安全 Base64：手动 UTF-8 编码 + Base64 映射
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      // surrogate pair
      i++;
      const code2 = str.charCodeAt(i);
      const cp = 0x10000 + (((code & 0x3ff) << 10) | (code2 & 0x3ff));
      bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    }
  }
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i], b2 = bytes[i + 1], b3 = bytes[i + 2];
    output += chars[b1 >> 2];
    output += chars[((b1 & 3) << 4) | (b2 >> 4)];
    if (isNaN(b2)) { output += '=='; break; }
    output += chars[((b2 & 15) << 2) | (b3 >> 6)];
    if (isNaN(b3)) { output += '='; break; }
    output += chars[b3 & 63];
  }
  return output;
}

export function getCustomerContext(): string | null {
  try {
    const stored = uni.getStorageSync(STORAGE_KEYS.USER_INFO);
    if (stored) {
      const parsed = JSON.parse(stored);
      const userId = parsed.userId || parsed.accountId;
      if (userId) {
        const context = JSON.stringify({ userId: Number(userId) });
        return base64Encode(context);
      }
    }
  } catch {}
  return null;
}
```

## 5. 401 处理

### 5.1 统一处理

```typescript
// src/services/auth.service.ts

const UNAUTHORIZED_LOCK_MS = 3000;
let unauthorizedLockUntil = 0;

export function handleUnauthorized(): void {
  const now = Date.now();
  if (now < unauthorizedLockUntil) return;
  unauthorizedLockUntil = now + UNAUTHORIZED_LOCK_MS;

  // 保存回跳地址（必须先于清理）
  const redirectUrl = resolveLoginRedirect();
  if (redirectUrl) saveLoginRedirect(redirectUrl);

  // 清理登录态（保留 LOGIN_REDIRECT，回跳地址已保存）
  const store = useUserStore();
  store.logout();
  [STORAGE_KEYS.USER_INFO, STORAGE_KEYS.USER_PROFILE, STORAGE_KEYS.TOKEN]
    .forEach(key => uni.removeStorageSync(key));

  // 跳转登录页
  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
  uni.redirectTo({ url: '/pages/login/index' });
}
```

### 5.2 并发去重

多个请求同时 401 时，3 秒窗口期内只执行一次登出+跳转：

```typescript
const UNAUTHORIZED_LOCK_MS = 3000;
let unauthorizedLockUntil = 0;

export function handleUnauthorized() {
  const now = Date.now();
  if (now < unauthorizedLockUntil) return;  // 3 秒内跳过
  unauthorizedLockUntil = now + UNAUTHORIZED_LOCK_MS;

  // ... 登出逻辑
}
```

## 6. 403 处理

```typescript
// src/services/auth.service.ts

export function handleForbidden(): void {
  // 由响应拦截器统一 throw Error，上游错误处理展示 UI
  console.warn('[Auth] 权限不足，操作被拒绝');
}
```

## 7. 登出流程

```typescript
// src/services/auth.service.ts

export function logout(options: LogoutOptions = {}): void {
  const store = useUserStore();
  store.logout();

  // 清理所有状态（保留 LOGIN_REDIRECT，避免回跳丢失）
  const keysToClear = Object.values(STORAGE_KEYS).filter(
    key => key !== STORAGE_KEYS.LOGIN_REDIRECT
  );
  keysToClear.forEach(key => {
    try { uni.removeStorageSync(key); } catch {}
  });

  if (options.loginRedirect) saveLoginRedirect(options.loginRedirect);

  uni.reLaunch({ url: '/pages/index/index' });
}
```

## 8. 登录回跳

### 8.1 保存回跳地址

```typescript
export function saveLoginRedirect(url: string): void {
  if (!url || !url.startsWith('/pages/')) return;
  uni.setStorageSync(STORAGE_KEYS.LOGIN_REDIRECT, url);
}
```

### 8.2 消费回跳地址

```typescript
export function consumeLoginRedirect(): string {
  const redirectUrl = uni.getStorageSync(STORAGE_KEYS.LOGIN_REDIRECT);
  uni.removeStorageSync(STORAGE_KEYS.LOGIN_REDIRECT);
  return typeof redirectUrl === 'string' ? redirectUrl : '';
}
```

### 8.3 登录页使用

```typescript
// 登录成功后
const redirectUrl = consumeLoginRedirect();
if (redirectUrl) {
  uni.redirectTo({ url: redirectUrl });
} else {
  // 默认跳转逻辑
  uni.switchTab({ url: '/pages/index/index' });
}
```

## 9. 存储 Key

```typescript
// src/constants/storage.ts

const PREFIX = 'app_';  // 可自定义

export const STORAGE_KEYS = {
  USER_INFO: `${PREFIX}user_info`,
  USER_PROFILE: `${PREFIX}user_profile`,
  TOKEN: `${PREFIX}token`,
  LOGIN_REDIRECT: `${PREFIX}login_redirect`,
} as const;
```

## 10. 用户状态

```typescript
// src/stores/user.ts

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null);
  const isLoggedIn = computed(() => !!userInfo.value);

  function initUser() {
    const stored = uni.getStorageSync(STORAGE_KEYS.USER_INFO);
    if (stored) {
      userInfo.value = JSON.parse(stored);
    }
  }

  function logout() {
    userInfo.value = null;
  }

  return { userInfo, isLoggedIn, initUser, logout };
});
```

---

## 11. 流程图

```
用户操作
    ↓
requireLogin() 检查
    ↓
┌─ 未登录 ─┐
│  保存    │
│  回跳地址 │
│  跳转    │
│  登录页   │
└─────────┘
    ↓
登录成功
    ↓
消费回跳地址
    ↓
跳转目标页面
```
