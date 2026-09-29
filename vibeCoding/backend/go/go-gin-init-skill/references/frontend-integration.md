# 前端集成指南

本文档说明 Go 后端与前端的对接规范，确保前后端接口无缝对接。

## 响应信封

所有 API 响应统一使用以下格式：

```typescript
interface ApiResponse<T> {
  code: number;      // 0=成功，其他=错误
  message: string;   // 提示信息
  data?: T;         // 响应数据
}
```

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 错误响应

```json
{
  "code": -1,
  "message": "用户名或密码错误"
}
```

## 错误码规范

| 错误码 | 说明 | 前端处理 |
|--------|------|----------|
| 0 | 成功 | 正常处理 data |
| -1 | 通用错误 | 显示 message |
| -1001 | 参数校验错误 | 高亮对应表单字段 |
| -2000 | 系统错误 | 显示友好提示，联系管理员 |
| -401 | 未授权（Token 失效） | 跳转登录页 |
| -403 | 禁止访问 | 显示"无权限" |
| -404 | 资源不存在 | 显示 404 页面 |
| -429 | 请求过于频繁 | 显示提示，稍后重试 |

## 前端请求层封装

### Axios 封装示例

```typescript
// request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message, data } = response.data;

    if (code === 0) {
      return data;
    }

    // Token 失效
    if (code === -401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error(message));
    }

    // 其他错误
    return Promise.reject(new Error(message));
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;
```

### API 调用示例

```typescript
// userAPI.ts
import request from './request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  expire: number;
  user: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  };
}

export const login = (data: LoginParams) =>
  request.post<LoginResult>('/api/auth/login', data);

export const getUserList = (params: { page: number; page_size: number }) =>
  request.get('/api/users', { params });

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

## SSE 对接

### EventSource 示例

```typescript
// sse.ts
export const createSSEConnection = (message: string) => {
  const token = localStorage.getItem('token');
  const url = `${import.meta.env.VITE_API_BASE_URL}/api/sse/chat?message=${encodeURIComponent(message)}`;

  const eventSource = new EventSource(url, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return eventSource;
};

// 使用
const eventSource = createSSEConnection('帮我写一首诗');

eventSource.addEventListener('message', (event) => {
  console.log('收到:', event.data);
  // 更新 UI
});

eventSource.addEventListener('done', () => {
  console.log('完成');
  eventSource.close();
});
```

## 文件上传对接

### 单文件上传

```typescript
// upload.ts
export const uploadSingle = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const data = await request.post<{ filename: string; url: string; size: number }>(
    '/api/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return data;
};
```

### 多文件上传

```typescript
export const uploadMultiple = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const data = await request.post<{ files: Array<{ filename: string; url: string; size: number }> }>(
    '/api/uploads',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return data;
};
```

## Token 刷新机制

```typescript
// token.ts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(request(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { token } = await request.post('/api/auth/refresh');
        localStorage.setItem('token', token);
        onTokenRefreshed(token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return request(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

## 前端项目模板

可结合 `frontend-request-skill` 生成标准化前端请求层。

## 相关技能

- `frontend-request-skill`：前端请求层规范封装
- `vue-base-skill`：Vue 基础组件
- `uniapp-request-skill`：uni-app 请求层
