---
name: uniapp-request-skill
description: uniapp 微信小程序请求层设计技能。覆盖 request.ts 统一封装、鉴权拦截、Token 刷新、游客模式、防抖去重、Mock 机制、错误处理、文件上传等实战设计。
triggers:
  - "请求封装"
  - "request.ts"
  - "uniapp 请求"
  - "接口拦截"
  - "Token 刷新"
  - "游客模式"
  - "Mock 数据"
  - "防抖去重"
  - "错误处理"
  - "文件上传"
---

# uniapp 请求层设计 Skill

## 定位

**只聚焦请求层设计**：从 `request.ts` 出发，建立 uniapp 项目统一、健壮、可维护的请求体系。

与 `uniapp-standard-skill`（通用规范）互补，但不重叠。

## 解决的问题

| 痛点 | 后果 | 本技能方案 |
|------|------|-----------|
| 每个页面各自 `uni.request` | 鉴权/错误处理重复 | 统一 request.ts |
| Token 过期无感知 | 用户操作失败 | 自动 401 拦截 + 跳转 |
| 重复点击导致重复请求 | 数据异常/资源浪费 | 防抖去重 |
| 后端接口未ready | 前端阻塞 | Mock 机制 |
| 游客误触敏感接口 | 报错/白屏 | 请求前拦截 |
| 错误提示不统一 | 用户体验差 | 统一错误通知 |

---

## 一、核心文件结构

```
src/
├── api/
│   ├── request.ts           # 统一请求封装（核心）
│   ├── _mocks_/
│   │   ├── index.ts        # Mock 数据字典
│   │   └── *.mock.ts       # 各模块 Mock
│   ├── user.ts             # 业务 API 示例
│   └── index.ts            # API 导出入口
├── config/
│   └── api.config.ts       # BASE_URL / PREFIX / 超时 / Mock 模式
├── services/
│   └── auth.service.ts     # 登录态处理（401/登出/跳转）
├── utils/
│   ├── auth.ts             # getToken / setToken
│   └── toast.ts            # 错误提示工具
└── composables/
    └── useAuth.ts          # 游客判断 Hook
```

---

## 二、request.ts 设计要点

### 2.1 统一入口

```typescript
// src/api/request.ts

export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  header?: Record<string, string>;
  timeout?: number;
  needAuth?: boolean;        // 是否需要 Token，默认 true
  showErrorToast?: boolean;  // 是否显示错误提示，默认 true
  skipDebounce?: boolean;    // 是否跳过防抖，默认 false
  skipAuthHandler?: boolean; // 是否跳过 401 处理，默认 false
  mock?: boolean;            // 是否启用 Mock
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>>;
export function get<T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>>;
export function post<T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>>;
export function put<T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>>;
export function del<T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>>;
```

### 2.2 请求拦截器

```typescript
function requestInterceptor(options: RequestOptions): RequestOptions {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  };

  if (options.needAuth !== false) {
    const token = getToken();
    if (token) {
      headers['Customer-Token'] = token;
    }
  }

  return { ...options, header: headers };
}
```

### 2.3 响应拦截器

```typescript
function responseInterceptor<T>(res: any, options: RequestOptions): ApiResponse<T> {
  const { statusCode, data } = res;

  // 401 Token 失效
  if (statusCode === 401) {
    if (!options.skipAuthHandler) {
      handleUnauthorized();
    }
    throw new Error('登录已过期');
  }

  // 403 无权限
  if (statusCode === 403) {
    handleForbidden();
    throw new Error('权限不足');
  }

  // 业务码异常
  if (data && data.code !== 0 && data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}
```

---

## 三、鉴权设计

### 3.1 Token 注入

- 默认请求自动注入 Token
- 支持 `needAuth: false` 跳过（如登录接口本身）
- 支持 `authMode: 'bearer' | 'customer-token'` 切换鉴权头格式

### 3.2 401 统一处理

```typescript
// src/services/auth.service.ts
export function handleUnauthorized() {
  clearToken();
  uni.navigateTo({ url: '/pages/login/index' });
}
```

### 3.3 Token 刷新（可选高级）

```typescript
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

async function refreshToken(): Promise<string> {
  // 1. 请求 refresh 接口
  // 2. 更新本地 Token
  // 3. 重试队列中的请求
}
```

---

## 四、游客模式

### 4.1 请求层拦截

```typescript
// 需要鉴权且无 Token，直接拒绝请求
if (options.needAuth !== false && !getToken()) {
  return Promise.reject({ code: 'NO_AUTH_TOKEN', message: '未登录' });
}
```

### 4.2 业务层 Hook

```typescript
// src/composables/useAuth.ts
export function useAuth() {
  const store = useUserStore();
  const isLoggedIn = computed(() => !!store.token);
  const isGuest = computed(() => !store.token);

  function checkLogin(): boolean {
    if (!store.token) {
      uni.navigateTo({ url: '/pages/login/index' });
      return false;
    }
    return true;
  }

  return { isLoggedIn, isGuest, checkLogin };
}
```

### 4.3 使用示例

```typescript
function handleLike() {
  if (!checkLogin()) return;
  post('/api/like', { id: itemId });
}
```

---

## 五、防抖去重

### 5.1 设计

```typescript
const pendingRequests = new Map<string, Promise<any>>();
const requestTimestamps = new Map<string, number>();

function generateRequestKey(url: string, method: string, data?: any): string {
  if (!data) return `${method}:${url}`;
  return `${method}:${url}:${JSON.stringify(data, Object.keys(data).sort())}`;
}
```

### 5.2 行为

- 同一请求在 `REQUEST_DEBOUNCE_MS`（默认 1000ms）内重复发起，返回同一个 Promise
- 请求完成后自动清理，防止内存泄漏
- 提交类接口可设置 `skipDebounce: true`

---

## 六、Mock 机制

### 6.1 配置

```typescript
// src/config/api.config.ts
export type MockMode = 'none' | 'auto' | 'force';
export const MOCK_MODE: MockMode = 'auto';
```

### 6.2 Mock 数据字典

```typescript
// src/api/_mocks_/index.ts
export interface MockEntry<T = any> {
  code: number;
  message: string;
  data: T;
}

export const MOCK_MAP: Record<string, MockEntry> = {};
```

### 6.3 使用

```typescript
// 单个接口启用 Mock
await get('/user/info', null, { mock: true });
```

---

## 七、错误处理

### 7.1 错误通知策略

| 环境 | 行为 |
|------|------|
| 开发/体验版 | Modal 展示完整错误 |
| 正式版 | 短消息 Toast，长消息 Modal |

### 7.2 错误信息提取

从响应中按优先级提取 `message / msg / error / detail` 等字段。

---

## 八、文件上传

```typescript
export function upload<T = any>(options: UploadOptions): Promise<ApiResponse<T>>;
```

- 基于 `uni.uploadFile`
- 自动注入 Token
- 统一错误处理

---

## 九、业务 API 写法

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

---

## 十、触发词

```
请求封装
request.ts 怎么写
uniapp 请求统一处理
Token 刷新设计
游客模式拦截
Mock 数据配置
接口防抖
```

---

## 配套技能

| 技能 | 关系 |
|------|------|
| [uniapp-standard-skill](../uniapp-standard-skill/) | 通用规范基础 |
| [uniapp-auth-skill](../uniapp-auth-skill/) | 登录鉴权与权限设计 |
