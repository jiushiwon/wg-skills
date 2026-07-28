# 请求封装架构详解

## 1. 核心职责

请求封装层负责统一处理：
- 请求参数与响应结构标准化
- 请求/响应拦截
- 错误处理
- Mock 数据
- 防抖机制
- 认证注入

## 2. 文件结构

```
src/api/
├── request.ts      # 统一请求封装
├── _mocks_/       # Mock 数据
│   └── index.ts
└── index.ts       # 导出入口
```

## 3. 核心实现

### 3.1 请求配置

```typescript
// src/api/request.ts

export interface RequestOptions {
  url: string;                    // 相对路径
  method?: HttpMethod;
  data?: Record<string, any>;
  header?: Record<string, string>;
  timeout?: number;
  showErrorToast?: boolean;
  needAuth?: boolean;             // 默认 true
  authMode?: 'customer-token' | 'bearer';
  mock?: boolean;
  skipDebounce?: boolean;
  skipAuthHandler?: boolean;
  prefix?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  _headers?: Record<string, string | string[]>;
}
```

### 3.2 请求拦截器

```typescript
function requestInterceptor(options: RequestOptions): RequestOptions {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  };

  if (options.needAuth !== false) {
    const token = getToken();
    if (token) {
      headers[options.authMode === 'bearer' ? 'Authorization' : 'Customer-Token'] =
        options.authMode === 'bearer' ? `Bearer ${token}` : token;
    }

    const context = getCustomerContext();
    if (context) {
      headers['X-Customer-Context'] = context;
    }
  }

  return { ...options, header: headers };
}
```

### 3.3 响应拦截器

```typescript
function responseInterceptor<T>(res: any, options: RequestOptions): ApiResponse<T> {
  const { statusCode, data } = res;

  // 401 处理
  if (statusCode === 401 || AUTH_FAILURE_CODES.includes(data?.code)) {
    if (!options.skipAuthHandler) handleUnauthorized();
    throw new Error('登录已过期');
  }

  // 403 处理
  if (statusCode === 403) {
    handleForbidden();
    throw new Error('权限不足');
  }

  // 状态码校验
  if (statusCode !== (options.successCode ?? 200)) {
    throw new Error(`请求失败: ${statusCode}`);
  }

  // 业务码校验
  if (data && data.code !== 0 && data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}
```

### 3.4 防抖机制

```typescript
const pendingRequests = new Map<string, Promise<any>>();
const requestTimestamps = new Map<string, number>();
const DEBOUNCE_MS = 1000;

function shouldDebounce(key: string): boolean {
  const lastTime = requestTimestamps.get(key);
  return lastTime && Date.now() - lastTime < DEBOUNCE_MS;
}

export function request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const key = generateRequestKey(url, method, data);

  if (!options.skipDebounce && shouldDebounce(key)) {
    const pending = pendingRequests.get(key);
    if (pending) return pending;
  }

  // ... 执行请求
}
```

## 4. Mock 数据

### 4.1 Mock 结构

```typescript
// src/api/_mocks_/index.ts

export interface MockEntry<T = any> {
  code: number;
  message: string;
  data: T;
}

export const MOCK_MAP: Record<string, MockEntry> = {};
```

### 4.2 使用方式

```typescript
// 添加 Mock 数据
MOCK_MAP['GET:/user/info'] = {
  code: 200,
  message: 'success',
  data: { id: 1, name: '测试用户' },
};
```

### 4.3 Mock 模式

```typescript
type MockMode = 'none' | 'auto' | 'force';

const MOCK_MODE: MockMode = 'auto';

function shouldUseMock(interfaceMock?: boolean): boolean {
  if (MOCK_MODE === 'force') return true;
  if (MOCK_MODE === 'none') return false;
  return interfaceMock === true;
}
```

## 5. 错误处理

### 5.1 错误类型

| 类型 | 处理 |
|------|------|
| HTTP 401 | 跳转登录页 |
| HTTP 403 | 弹权限不足 |
| 业务码异常 | 弹错误消息 |
| 请求超时 | 弹超时提示 |
| 网络异常 | 弹网络异常 |

### 5.2 错误消息提取

```typescript
const ERROR_KEYS = [
  'message', 'msg', 'error', 'errorMessage', 'detail',
  'reason', 'error_description', 'errMsg', 'error_msg'
];

function extractErrorMessage(data: any, fallback: string): string {
  for (const key of ERROR_KEYS) {
    if (data[key]) return data[key];
  }
  return fallback;
}
```

## 6. API 前缀管理

```typescript
// src/config/api.config.ts

export const API_PREFIX = {
  DEFAULT: '/api/v1',
  // 按业务需求扩展
  USER: '/api/user/v1',
  ORDER: '/api/order/v1',
} as const;

export function getApiUrl(path: string, prefix: string = API_PREFIX.DEFAULT): string {
  // path 不应包含 prefix，例如传 /user/info 而非 /api/v1/user/info
  return `${BASE_URL}${prefix}${path}`;
}
```

## 7. 便捷方法

```typescript
export function get<T>(url: string, data?: object, options?: Options): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'GET', data, ...options });
}

export function post<T>(url: string, data?: object, options?: Options): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'POST', data, ...options });
}

export function put<T>(url: string, data?: object, options?: Options): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'PUT', data, ...options });
}

export function del<T>(url: string, data?: object, options?: Options): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'DELETE', data, ...options });
}
```

## 8. 使用示例

```typescript
import { get, post } from '@/api/request';

// GET 请求
const userInfo = await get<UserInfo>('/user/info');

// POST 请求
await post<void>('/user/update', { nickname: '张三' });

// 带配置
await get('/user/list', { page: 1 }, {
  mock: true,           // 使用 Mock
  skipDebounce: true,   // 跳过防抖
  prefix: API_PREFIX.USER,
});
```
