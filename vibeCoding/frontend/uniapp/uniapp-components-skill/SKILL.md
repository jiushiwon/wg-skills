---
name: uniapp-components-skill
description: uniapp 微信小程序登录鉴权与安全规范。覆盖 Token 管理、认证服务架构、401/403 处理、登出回跳、接口安全、数据安全、代码安全等。触发词："登录鉴权怎么做"、"uniapp 登录"、"token 管理"、"401 处理"、"403 处理"、"安全规范"
---

# uniapp 登录鉴权与安全规范 Skill

## Overview

本 skill 提供 uniapp 微信小程序项目的登录鉴权与安全规范，不包含业务逻辑。

**前置依赖**：建议配合 [uniapp-common-skill](../uniapp-standard-skill/) 使用（红线规则、目录结构、接口规范）

## When to Use

- "登录鉴权怎么做"
- "uniapp 登录"
- "token 管理"
- "401 处理"
- "403 处理"
- "登出流程"
- "安全规范"
- "接口安全"

## 快速索引

| 规范主题 | 位置 | 说明 |
|----------|------|------|
| **红线规则** | #一-红线规则 | 专属强制规范 |
| **认证服务** | #二-认证服务架构 | Bootstrap、登录态判断 |
| **Token 管理** | #三-Token 管理 | 获取 Token、用户上下文 |
| **401 处理** | #四-401-处理 | 并发去重、统一跳转 |
| **403 处理** | #五-403-处理 | 权限不足处理 |
| **登出流程** | #六-登出流程 | 清理状态、回跳 |
| **登录回跳** | #七-登录回跳 | 保存/消费回跳地址 |
| **用户状态** | #八-用户状态管理 | Pinia Store |
| **安全规范** | #九-安全规范 | 接口/数据/代码安全 |

---

## 一、红线规则

| 编号 | 规则 | 说明 |
|------|------|------|
| A01 | **认证服务收口** | 登录态统一走 auth.service.ts，禁止在各页面散落 Token 读写 |
| A02 | **Token 只存 Storage** | 禁止在内存变量、组件 data、Storage 之外持久化 Token |
| A03 | **禁止明文存敏感信息** | Storage 中禁止明文存储密码、身份证、银行卡 |
| A04 | **401 统一处理** | 所有请求统一通过响应拦截器处理 401，禁止各页面各自跳转 |
| A05 | **登出必清理** | 登出时必须清理所有登录态，保留回跳地址 |
| A06 | **日志脱敏** | 禁止在日志中输出密码、Token、完整手机号 |

---

## 二、认证服务架构

### 2.1 核心模块

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

### 2.2 bootstrap 启动引导

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

  const results = await Promise.allSettled([
    store.fetchUserProfile({ skipAuthHandler: true }),
    loadAllDictionaries(),
  ]);

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

### 2.3 登录态判断

```typescript
export function isLoggedIn(): boolean {
  return useUserStore().isLoggedIn;
}
```

### 2.4 需要登录的场景

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

---

## 三、Token 管理

### 3.1 获取 Token

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

### 3.2 用户上下文

```typescript
// src/utils/auth.ts

function base64Encode(str: string): string {
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

### 3.3 存储 Key 管理

```typescript
// src/constants/storage.ts

const PREFIX = 'app_';

export const STORAGE_KEYS = {
  USER_INFO: `${PREFIX}user_info`,
  USER_PROFILE: `${PREFIX}user_profile`,
  TOKEN: `${PREFIX}token`,
  LOGIN_REDIRECT: `${PREFIX}login_redirect`,
} as const;
```

---

## 四、401 处理

### 4.1 统一处理

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

  // 清理登录态（保留 LOGIN_REDIRECT）
  const store = useUserStore();
  store.logout();
  [STORAGE_KEYS.USER_INFO, STORAGE_KEYS.USER_PROFILE, STORAGE_KEYS.TOKEN]
    .forEach(key => uni.removeStorageSync(key));

  // 跳转登录页
  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
  uni.redirectTo({ url: '/pages/login/index' });
}
```

### 4.2 并发去重

多个请求同时 401 时，3 秒窗口期内只执行一次登出+跳转（详见上方 §4.1 `handleUnauthorized` 中的 `unauthorizedLockUntil` 逻辑）：

---

## 五、403 处理

```typescript
// src/services/auth.service.ts

export function handleForbidden(): void {
  console.warn('[Auth] 权限不足，操作被拒绝');
}
```

---

## 六、登出流程

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

---

## 七、登录回跳

### 7.1 保存回跳地址

```typescript
export function saveLoginRedirect(url: string): void {
  if (!url || !url.startsWith('/pages/')) return;
  uni.setStorageSync(STORAGE_KEYS.LOGIN_REDIRECT, url);
}
```

### 7.2 消费回跳地址

```typescript
export function consumeLoginRedirect(): string {
  const redirectUrl = uni.getStorageSync(STORAGE_KEYS.LOGIN_REDIRECT);
  uni.removeStorageSync(STORAGE_KEYS.LOGIN_REDIRECT);
  return typeof redirectUrl === 'string' ? redirectUrl : '';
}
```

### 7.3 登录页使用

```typescript
// 登录成功后
const redirectUrl = consumeLoginRedirect();
if (redirectUrl) {
  uni.redirectTo({ url: redirectUrl });
} else {
  uni.switchTab({ url: '/pages/index/index' });
}
```

---

## 八、用户状态管理

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

## 九、安全规范

### 9.1 接口安全

- Token 存储在 Storage（不存敏感信息）
- 敏感接口添加签名验证
- 防止 XSS：用户输入必须转义

### 9.2 数据安全

- 禁止在 Storage 中明文存储密码
- 敏感数据加密传输
- 日志脱敏处理

### 9.3 代码安全

```typescript
// 禁止
eval('...')
new Function('...')

// 必须使用
JSON.parse('...')
uni.setStorageSync(...)
```

### 9.4 安全检查清单

| 检查项 | 要求 |
|--------|------|
| Token 存储 | 只存 Storage，不存敏感信息 |
| 日志输出 | 脱敏处理 |
| 用户输入 | 转义处理 |
| URL 参数 | 校验协议 |
| 路由跳转 | 鉴权检查 |
| 敏感操作 | 二次确认 |
| 错误上报 | 脱敏用户信息 |
| 清理数据 | 登出时清理 |

---

## References

- `references/auth-framework.md` — 鉴权框架详解（含完整流程图）
- `references/security.md` — 安全规范详解