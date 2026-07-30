# 错误处理与提示策略参考

> 统一错误信息提取、环境差异化提示、文件上传错误处理。

## 错误信息提取

```typescript
// src/utils/error.ts
export interface RequestError {
  code: string | number;
  message: string;
  raw?: any;
}

export function formatError(code: string | number, message: string, raw?: any): RequestError {
  return { code, message, raw };
}

export function extractMessage(data: any, fallback = '请求失败'): string {
  if (!data || typeof data !== 'object') return fallback;
  return (
    data.message ||
    data.msg ||
    data.error ||
    data.detail ||
    data.errMsg ||
    fallback
  );
}
```

## 错误码映射

统一错误码到用户友好文案，避免后端文案直接暴露。

```typescript
// src/config/error.config.ts
export const ERROR_CODE_MAP: Record<string, string> = {
  // HTTP 状态异常（请求层）
  NO_AUTH_TOKEN: '请先登录',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '权限不足',
  TIMEOUT: '请求超时，请检查网络',
  NETWORK_ERROR: '网络异常，请稍后重试',
  UPLOAD_ERROR: '上传失败',

  // 业务异常（按后端 code 约定，例如 code < 0）
  '-1001': '手机号已存在',
  '-1002': '必填项不能为空',
  '-1003': '重复提交，请稍后再试',
};

export function resolveErrorMessage(err: RequestError): string {
  const key = String(err.code);
  if (typeof err.code === 'number' && err.code >= 500) {
    return '服务器繁忙，请稍后重试';
  }
  return ERROR_CODE_MAP[key] || err.message || '未知错误';
}
```

**code 约定说明**：

- `code = 0`：业务成功，由 `SUCCESS_CODES` 判定。
- `code < 0`：业务异常（如参数错误、重复新增等），会在 `ERROR_CODE_MAP` 中按字符串 key（如 `'-1001'`）查找对应提示。
- HTTP 状态异常（401/403/500/断网等）：错误码为 `UNAUTHORIZED` / `FORBIDDEN` / `HTTP_ERROR` / `TIMEOUT` / `NETWORK_ERROR` 等字符串，与业务 code 互不干扰。

## 错误提示工具

```typescript
// src/utils/toast.ts
import { resolveErrorMessage } from '@/config/error.config';

const isDev = import.meta.env.DEV;

export function showError(err: any) {
  const message = resolveErrorMessage(err);
  const code = err?.code;

  if (isDev) {
    uni.showModal({
      title: '错误详情',
      content: `${code || ''}\n${message}`,
      showCancel: false,
    });
    return;
  }

  // 生产环境按消息长度选择提示方式
  if (message.length <= 20) {
    uni.showToast({ title: message, icon: 'none' });
  } else {
    uni.showModal({ title: '提示', content: message, showCancel: false });
  }
}

export function showBusinessError(code: string | number, message: string) {
  showError({ code, message });
}
```

## 请求层集成

```typescript
export async function safeRequest<T>(options: RequestOptions): Promise<T | null> {
  try {
    const res = await request<T>(options);
    return res.data;
  } catch (err: any) {
    if (options.showErrorToast !== false) {
      showError(err);
    }
    return null;
  }
}
```

### safeRequest 与 request 的选择

- **`request<T>(options)`**：返回 `Promise<ApiResponse<T>>`，适合需要完整响应体、错误码或自定义错误处理的场景。
- **`safeRequest<T>(options)`**：返回 `Promise<T | null>`，已内置错误提示，适合页面直取业务数据、无需额外错误处理的场景。

## 文件上传封装

```typescript
// src/api/upload.ts
import { getToken } from '@/utils/auth';
import { BASE_URL, REQUEST_TIMEOUT } from '@/config/api.config';
import { formatError, extractMessage } from '@/utils/error';

export interface UploadOptions {
  url: string;
  filePath: string;
  name?: string;
  formData?: Record<string, any>;
  header?: Record<string, string>;
  timeout?: number;
  onProgress?: (progress: number) => void; // 0-100
}

export function upload<T = any>(options: UploadOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const header: Record<string, string> = {
      ...options.header,
    };
    if (token) {
      header['Customer-Token'] = token;
    }

    const task = uni.uploadFile({
      url: options.url.startsWith('http') ? options.url : `${BASE_URL}${options.url}`,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData,
      header,
      timeout: options.timeout || REQUEST_TIMEOUT,
      success: (res) => {
        let data: any = res.data;
        try {
          data = JSON.parse(res.data);
        } catch {
          // 保持原始字符串
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(formatError('UPLOAD_ERROR', extractMessage(data, '上传失败'), res));
        }
      },
      fail: (err) => {
        reject(formatError('UPLOAD_ERROR', err.errMsg || '上传失败', err));
      },
    });

    if (options.onProgress) {
      task.onProgressUpdate((res) => {
        options.onProgress?.(res.progress);
      });
    }
  });
}
```

## 使用示例

```typescript
const res = await upload({
  url: '/api/upload/avatar',
  filePath: tempFilePath,
  name: 'avatar',
  formData: { userId: '123' },
});
```

## 环境差异建议

| 环境 | 行为 |
|------|------|
| 开发/体验版 | Modal 展示完整错误 + 错误码，便于定位 |
| 正式版 | 短消息 Toast，长消息 Modal，不暴露内部错误码 |

## 注意事项

- 上传接口不要用 request 的防抖去重，应单独封装
- 上传失败应保留原始错误对象，便于日志上报
- 大文件上传建议配合进度回调 `onProgressUpdate`
