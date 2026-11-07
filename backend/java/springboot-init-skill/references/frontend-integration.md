# 前端联动规范

> 与 `frontend-request-skill` / `uniapp-request-skill` / `web-request-skill` 的对接约定。本 skill 生成的接口契约可直接被前端消费。

## 一、响应信封对接

后端 `ApiResponse<T>` ↔ 前端 `ApiResponse<T>`（`frontend-request-skill`）字段一一对应：

| 后端字段 | 前端类型 | 说明 |
|---------|---------|------|
| `code: int` | `number` | 0=成功，其他=错误码 |
| `message: string` | `string` | 提示信息 |
| `data: T` | `T` | 业务数据 |

## 二、错误码映射

后端错误码表（详见 `references/api-contract-template.md`）可直接复制到前端的 `ERROR_CODE_MAP`：

```typescript
// frontend-request-skill/error-code.ts
export const ERROR_CODE_MAP: Record<number, string> = {
  [-1001]: '参数校验失败',
  [-1002]: '未登录',
  [-1003]: '无权限',
  [-1004]: '资源不存在',
  [-1005]: '资源冲突',
  [-2000]: '系统异常',
  [-2001]: '数据库异常',
  [-2002]: '第三方服务异常',
};
```

## 三、Token 注入

后端通过 `Authorization: Bearer {token}` 鉴权。前端拦截器自动注入：

```typescript
// frontend-request-skill/interceptor.ts
request.interceptors.request.use((config) => {
  const token = uni.getStorageSync('access_token');
  if (token) {
    config.header.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

刷新令牌：拦截器捕获 401 时调用 `/api/auth/refresh` → 重发原请求。

## 四、SSE 对接

后端 `SseEmitter` ↔ 前端 `EventSource`（H5）/ `enableChunked`（小程序）。

### H5（浏览器）

```typescript
const es = new EventSource('/api/sse/chat');

es.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('收到:', data);
});

es.onerror = () => es.close();
```

### uniapp / 小程序

参见 `frontend-request-skill/references/sse-guide.md`：

```typescript
import { createSseClient } from 'frontend-request-skill';

const client = createSseClient({
  url: '/api/sse/chat',
  onMessage: (data) => console.log('收到:', data),
  onError: (err) => console.error(err),
});

// 关闭
client.close();
```

### Token 鉴权的 SSE

```typescript
const client = createSseClient({
  url: '/api/sse/chat/protected',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  onMessage: (data) => console.log(data),
});
```

## 五、文件上传对接

后端 `multipart/form-data` ↔ 前端 `uni.uploadFile` / `axios + FormData`。

### uniapp

```typescript
uni.uploadFile({
  url: '/api/upload',
  filePath: tempFilePath,
  name: 'file',
  header: {
    Authorization: `Bearer ${token}`,
  },
  success: (res) => {
    const data = JSON.parse(res.data);
    console.log('上传成功:', data.data.url);
  },
});
```

### H5 / axios

```typescript
const form = new FormData();
form.append('file', file);

const resp = await axios.post('/api/upload', form, {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  },
});
console.log('上传成功:', resp.data.data.url);
```

后端返回 `data.url`（如 `/uploads/2026/08/21/abc.png`），前端拼接 `http://localhost:8080` 后可直接 `<image>` 渲染。

## 六、CORS 配合

后端 `SecurityConfig` 已放行 CORS。生产部署前端域名需加入 `.env`：

```bash
CORS_ORIGINS=https://app.example.com
```

## 七、Swagger UI 前端开发

开发期间推荐前端直接用 Swagger UI 自测：

- Swagger UI：<http://localhost:8080/swagger-ui.html>
- 鉴权：点右上「Authorize」→ 输入 `Bearer {token}` → 后续请求自动带 Header
- 一键复制 cURL 命令调试

## 八、典型集成示例

### 登录 → 存 token → 受保护请求

```typescript
// 1. 登录
const resp = await request({
  url: '/api/auth/login',
  method: 'POST',
  data: { username, password },
});

if (resp.code === 0) {
  uni.setStorageSync('access_token', resp.data.accessToken);
  uni.setStorageSync('refresh_token', resp.data.refreshToken);
}

// 2. 后续请求自动带 token（拦截器）
const users = await request({ url: '/api/users', method: 'GET' });
```

### token 过期自动刷新

```typescript
request.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    if (error.code === -1002) {
      // 401 → 用 refresh token 换新 access token
      const refresh = uni.getStorageSync('refresh_token');
      const resp = await request({
        url: '/api/auth/refresh',
        method: 'POST',
        data: { refreshToken: refresh },
      });
      if (resp.code === 0) {
        uni.setStorageSync('access_token', resp.data.accessToken);
        // 重发原请求
        return request(error.config);
      } else {
        // 刷新失败 → 跳登录
        uni.removeStorageSync('access_token');
        uni.removeStorageSync('refresh_token');
        uni.reLaunch({ url: '/pages/login/index' });
      }
    }
    return Promise.reject(error);
  }
);
```