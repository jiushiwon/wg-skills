# 错误处理与提示策略参考

> 统一错误信息提取、环境差异化提示、文件上传错误处理。
>
> 本文档所有约定必须与 [`api-contract.md` §7-§9](api-contract.md) 严格对齐。

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

> 以下错误码与 [`api-contract.md` §7.3](api-contract.md) 严格对齐，是默认值。真实项目**必须**按后端契约替换。

```typescript
// src/config/error.config.ts
export const ERROR_CODE_MAP: Record<string, string> = {
  // ===== HTTP / 系统级（请求层）=====
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '权限不足',
  TIMEOUT: '请求超时，请检查网络',
  NETWORK_ERROR: '网络异常，请稍后重试',
  HTTP_ERROR: '请求失败',
  HTTP_5XX: '服务器繁忙，请稍后重试',  // api-contract.md §9: swallow 但保留文案供日志使用
  NO_AUTH_TOKEN: '请先登录',

  // ===== 业务异常（api-contract.md §7.3）=====
  '-1':    '未登录或登录已过期', // JWT 鉴权失效，详见 §7.2

  // HTTP / 系统级业务码
  '-1000': '系统繁忙，请稍后再试',
  '-1001': '参数校验错误',
  '-1002': '资源不存在',
  '-1003': '资源冲突',
  '-1004': '请求过于频繁',
  '-1005': '服务暂不可用',

  // 鉴权模块
  '-1006': '用户名或密码错误',
  '-1007': '账号已锁定',
  '-1008': '账号已禁用',
  '-1009': '验证码错误',
  '-1010': '验证码已过期',
  '-1011': 'RefreshToken 无效',
  '-1012': '无访问权限',

  // 用户模块
  '-2001': '用户不存在',
  '-2002': '用户已存在',
  '-2003': '原密码错误',
  '-2004': '两次密码不一致',

  // 角色 / 权限模块
  '-3001': '角色不存在',
  '-3002': '角色已存在',
  '-3003': '角色已被使用',
  '-3004': '超级管理员不可删除',

  // 菜单模块
  '-4001': '菜单不存在',
  '-4002': '菜单已存在',
  '-4003': '存在子菜单，不可删除',

  // 文件上传模块
  '-5001': '文件类型不支持',
  '-5002': '文件过大',
  '-5003': '文件上传失败',
};

export function resolveErrorMessage(err: RequestError): string {
  const key = String(err.code);
  return ERROR_CODE_MAP[key] || err.message || '未知错误';
}
```

**code 约定说明**（与 `api-contract.md` §7 对齐）：

- `code = 0`：业务成功，由 `SUCCESS_CODES` 判定。
- `code < 0`：业务异常，按字符串 key（如 `'-1001'`）在 `ERROR_CODE_MAP` 查找对应提示。
- **`code === -1`：JWT 鉴权失效专用**（未登录 / Token 无效 / 过期 / 未传递），等同 HTTP 401。
- HTTP 状态异常（401/403/断网/超时等）：错误码为 `UNAUTHORIZED` / `FORBIDDEN` / `HTTP_ERROR` / `TIMEOUT` / `NETWORK_ERROR` / `HTTP_5XX` 等字符串，与业务 code 互不干扰。

## 错误提示工具

```typescript
// src/utils/toast.ts
import { resolveErrorMessage } from '@/config/error.config';

const isDev = import.meta.env.DEV;

/**
 * 弹出错误 Toast。
 * 注意：HTTP_5XX 永不调用此函数（api-contract.md §9 强制 swallow）。
 */
export function showError(err: any) {
  const message = resolveErrorMessage(err);
  const code = err?.code;

  // 双重保险：HTTP 5xx 永不弹用户 Toast
  if (code === 'HTTP_5XX') return;

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
/**
 * safeRequest：根据 options.showError 决定是否弹 Toast（api-contract.md §8）
 * - showError: false（默认）→ 请求层弹 Toast
 * - showError: true         → 不弹，调用方自己处理
 *
 * HTTP_5XX 永远不会弹用户 Toast（api-contract.md §9）
 */
export async function safeRequest<T>(options: RequestOptions): Promise<T | null> {
  try {
    const res = await request<T>(options);
    return res.data;
  } catch (err: any) {
    if (options.showError === true) {
      // 调用方自己处理
      return null;
    }
    showError(err);
    return null;
  }
}
```

### safeRequest 与 request 的选择

- **`request<T>(options)`**：返回 `Promise<ApiResponse<T>>`，适合需要完整响应体、错误码或自定义错误处理的场景。
- **`safeRequest<T>(options)`**：返回 `Promise<T | null>`，已内置错误提示，适合页面直取业务数据、无需额外错误处理的场景。

### showError 使用规则

| 场景 | `showError` 取值 | 行为 |
|------|-----------------|------|
| 页面直取数据（默认） | `false`（省略） | 请求层自动弹 Toast |
| 轮询 / 心跳 | `true` | 静默失败，调用方重试 |
| 自定义错误文案 | `true` | catch 后 `ElMessage.warning('库存不足')` |
| 上传队列批量 | `true` | 单独处理每条失败 |
| HTTP 5xx（任何场景） | 任意 | **强制 swallow 用户 Toast**，调用方 catch 降级 |

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
