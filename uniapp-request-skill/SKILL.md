---
name: uniapp-request-skill
description: Use when designing or reviewing the request layer of a uni-app mini-program project, including request.ts wrappers, interceptors, deduplication, mocks, error handling, file upload, SSE streaming, or token refresh.
---

# uniapp 请求层设计 Skill

## 定位

只聚焦**请求层设计**：从 `request.ts` 出发，建立 uniapp 项目统一、健壮、可维护的请求体系。

本 skill 只处理请求相关逻辑，不依赖其他 skill。

## 解决的问题

| 痛点 | 后果 | 本技能方案 |
|------|------|-----------|
| 每个页面各自 `uni.request` | 鉴权/错误处理重复 | 统一 request.ts |
| Token 过期无感知 | 用户操作失败 | 响应拦截器识别 401，统一交给 auth service 处理 |
| 重复点击导致重复请求 | 数据异常/资源浪费 | 防抖去重 |
| 后端接口未 ready | 前端阻塞 | Mock 机制 |
| 游客误触敏感接口 | 报错/白屏 | 请求层前置拦截 |
| 错误提示不统一 | 用户体验差 | 统一错误通知 |
| SSE/流式接口不知如何接入 | 聊天/AI 回复无法流式展示 | 跨端 SSE 封装 + 打字机效果 |
| Token 过期后并发请求全部失败 | 用户重复登录、数据丢失 | Token 刷新队列 + 失败请求自动重试 |

## When to Use

- "请求封装"
- "request.ts 怎么写"
- "uniapp 请求统一处理"
- "接口拦截"
- "Token 刷新"（请求层衔接部分，详见 [references/auth-patterns.md](references/auth-patterns.md)）
- "游客模式拦截"
- "Mock 数据配置"
- "接口防抖"
- "错误处理"
- "文件上传"
- "SSE 流式请求"
- "打字机效果"
- "Server-Sent Events"
- "AI 聊天流式回复"

## When NOT to Use

- 需要完整登录鉴权/权限设计 → 本 skill 只提供请求层衔接，完整鉴权体系需单独设计
- 需要项目整体规范化/目录结构诊断 → 不在本 skill 范围内
- 需要跨平台兼容性审计 → 不在本 skill 范围内

## Quick Reference

| 能力 | 关键选项 | 参考位置 |
|------|----------|----------|
| 统一请求 | `request<T>(options)` | [references/request-impl.md](references/request-impl.md) |
| Token 注入 | `needAuth`、`authMode` | [references/auth-patterns.md](references/auth-patterns.md) |
| 401/403 处理 | `skipAuthHandler` | [references/auth-patterns.md](references/auth-patterns.md) |
| 防抖去重 | `skipDebounce` | [references/request-impl.md](references/request-impl.md) |
| Mock 数据 | `USE_MOCK` | [references/mock-guide.md](references/mock-guide.md) |
| 错误提示 | `showErrorToast` | [references/error-handling.md](references/error-handling.md) |
| 文件上传 | `upload<T>(options)` | [references/error-handling.md](references/error-handling.md) |
| SSE 流式请求 | `sse<T>(options, onMessage)` | [references/sse-guide.md](references/sse-guide.md) |
| Token 自动刷新 | `auth.service.ts` 队列 | [references/auth-patterns.md](references/auth-patterns.md) |

## 核心文件结构

```
src/
├── api/
│   ├── request.ts           # 统一请求封装（核心）
│   ├── upload.ts            # 文件上传封装
│   ├── sse.ts               # SSE 流式请求封装
│   ├── _mocks_/
│   │   ├── index.ts         # Mock 数据字典
│   │   └── *.mock.ts        # 各模块 Mock
│   ├── user.ts              # 业务 API 示例
│   └── index.ts             # API 导出入口
├── config/
│   ├── api.config.ts        # BASE_URL / PREFIX / 超时 / Mock 模式 / 成功码 / 重试次数
│   └── error.config.ts      # 错误码映射
├── services/
│   └── auth.service.ts      # 登录态处理（项目自行收口）
├── utils/
│   ├── auth.ts              # getToken / setToken
│   ├── toast.ts             # 错误提示工具
│   └── error.ts             # 错误信息提取
└── composables/
    ├── useAuth.ts           # 游客判断 Hook
    └── useTypewriter.ts     # 打字机效果 Hook
```

## 设计要点

### 1. 统一入口

```typescript
// src/api/request.ts
export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';
  data?: any;                // 请求体：通常为 plain object；uni.request 也支持 string / ArrayBuffer / FormData 等
  header?: Record<string, string>;
  timeout?: number;
  needAuth?: boolean;        // 是否需要 Token，默认 true
  showErrorToast?: boolean;  // 是否显示错误提示，默认 true
  skipDebounce?: boolean;    // 是否跳过防抖，默认 false
  skipAuthHandler?: boolean; // 是否跳过 401 处理，默认 false
  prefix?: string;           // API 前缀，默认 DEFAULT_PREFIX
  authMode?: 'bearer' | 'customer-token'; // Token 头格式
  retry?: number;            // 失败重试次数，默认 REQUEST_RETRY_COUNT
}

export interface RequestPromise<T> extends Promise<ApiResponse<T>> {
  __abort?: () => void;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface UploadOptions {
  url: string;
  filePath: string;
  name?: string;
  formData?: Record<string, any>;
  header?: Record<string, string>;
  timeout?: number;
  onProgress?: (progress: number) => void; // 0-100
}

export function request<T = any>(options: RequestOptions): RequestPromise<T>;
export function get<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): RequestPromise<T>;
export function post<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): RequestPromise<T>;
export function put<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): RequestPromise<T>;
export function del<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
): RequestPromise<T>;
export function upload<T = any>(options: UploadOptions): Promise<T>; // 直接返回业务 data，不包 ApiResponse
```

完整实现见 [references/request-impl.md](references/request-impl.md)。

### 2. 鉴权衔接

本 skill 只负责请求层与鉴权的衔接点：

- 默认请求自动注入 Token
- 支持 `needAuth: false` 跳过（如登录接口本身）
- 支持 `authMode: 'bearer' | 'customer-token'` 切换鉴权头格式
- 401/403 响应交给 `auth.service.ts` 统一处理

详细 Token 管理、401/403 处理、Token 刷新队列、登出回跳等见 [references/auth-patterns.md](references/auth-patterns.md)。

### 3. 游客模式

请求层只做最小拦截：

```typescript
import { formatError } from '@/utils/error';

if (options.needAuth !== false && !getToken()) {
  return Promise.reject(formatError('NO_AUTH_TOKEN', '未登录'));
}
```

业务层建议前置检查：

```typescript
const { checkLogin } = useAuth();

function handleLike() {
  if (!checkLogin()) return;
  post('/api/like', { id: itemId });
}
```

### 4. 防抖去重

- 同一 key 的并发请求只发一次，返回同一个 Promise
- 请求完成后清理 pending，释放内存
- 提交类接口可设置 `skipDebounce: true`

### 5. Mock 机制

- 通过全局开关 `USE_MOCK` 控制：开启后所有请求强制走 Mock，关闭后全部走真实接口
- Mock 数据建议按接口字段契约声明类型（`MockEntry<T>`）
- 支持精确匹配 `METHOD:/path` 和 REST 路径参数匹配
- 见 [references/mock-guide.md](references/mock-guide.md)

### 6. 错误处理

- 统一错误信息提取（`message` / `msg` / `error` / `detail`）
- 开发环境 Modal 展示完整错误，生产环境 Toast/Modal 分级提示
- 文件上传单独封装
- 见 [references/error-handling.md](references/error-handling.md)

### 7. SSE 流式请求

- 封装 `sse<T>(options, onMessage, onError?)`，支持 H5 `EventSource` 与小程序 `enableChunked` 双端
- 自动注入 Token、401 识别、手动中断
- 流式 chunk 解析 + 数据行缓存，适用于 AI 聊天、打字机效果
- 见 [references/sse-guide.md](references/sse-guide.md)

### 8. Token 自动刷新与失败重试

- HTTP 401 触发静默刷新
- 刷新期间新请求入队，刷新成功后自动重发
- 刷新失败统一登出，避免用户反复登录
- 见 [references/auth-patterns.md](references/auth-patterns.md)

## Common Mistakes

| 错误 | 后果 | 正确做法 |
|------|------|----------|
| 在请求层写死鉴权跳转逻辑 | 与 auth skill 重复、难以维护 | 请求层只识别 401/403，统一交给 `auth.service.ts` |
| 把 401 重试/Token 刷新在每个 API 里单独实现 | 代码重复、并发刷新导致多次登录 | 使用队列式 Token 刷新，统一收口到 auth.service.ts |
| 并发请求未做去重 | 重复点击导致重复提交 | 用 Map 缓存同一 key 的 pending Promise |
| `JSON.stringify` 直接生成请求 key | 属性顺序不同导致 key 不同，去重失效 | 递归排序 key 后序列化 |
| `statusCode !== 200` 判断成功 | 201/204 等合法状态被误判 | `200 <= statusCode < 300` |
| Mock 数据写进生产包 | 数据泄露、行为异常 | Mock 仅由 `VITE_USE_MOCK` 控制，生产环境设为 `false` |
| 文件上传复用 request 的防抖 | 大文件/多次选择文件被错误去重 | 上传单独封装，不走 request 防抖 |
| SSE 在小程序端使用 H5 的 EventSource | 小程序无原生 EventSource，直接报错 | 使用 `enableChunked` + 手动解析 chunk |
| SSE 不处理连接中断/页面卸载 | 内存泄漏、重复回调 | 返回可中断的 requestTask，页面 onUnload 时调用 |
| 401 时直接重试原请求但不刷新 Token | 重试仍失败，陷入死循环 | 先刷新 Token，再重试队列中的请求 |
| Token 刷新不排队 | 并发刷新导致多次登录请求 | 使用 `isRefreshing` + Promise 队列 |

## 输出

触发本 skill 时，按以下优先级输出：

1. **问题诊断**：当前请求层存在的主要问题（重复代码、缺拦截器、错误处理散落等）
2. **结构方案**：推荐的 `src/api/`、`src/config/`、`src/utils/`、`src/services/` 文件划分
3. **核心代码**：给出或修正 `request.ts`、`upload.ts`、错误处理工具的实现
4. **衔接说明**：明确哪些逻辑属于请求层、哪些应收口到 `auth.service.ts`
5. **进阶能力**：按需补充 SSE 流式请求、Token 自动刷新队列、失败重试
6. **参考引用**：复杂实现直接引用 `references/` 中的对应文档

## 职责边界

| 范畴 | 本 skill 负责 | 本 skill 不负责 |
|------|--------------|----------------|
| 请求封装 | `request.ts`、拦截器、去重、Mock、错误提示、上传、SSE 衔接 | — |
| 鉴权实现 | 请求层 Token 注入、401/403 识别、刷新触发点 | Token 管理、登录态、登出回跳等完整鉴权体系 |
| Token 刷新队列 | — | 推荐由 `auth.service.ts` 统一实现，请求层只负责触发与重试 |
| 项目规范 | — | 目录结构、命名规范等通用规范 |
| 跨平台审计 | — | 多端兼容性检查 |
