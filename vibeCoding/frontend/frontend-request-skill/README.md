# 前端请求层设计 Skill

> 前端级统一请求封装：从 `request.ts` 出发，解决鉴权、Token、游客、防抖、Mock、错误处理、文件上传、SSE 流式请求、失败重试等实战问题。
>
> 本 skill 同时提供 **通用前端规范**（Web / H5 / React / Vue）和 **uniapp 适配规范**（微信小程序 / App / H5），二者核心思想完全一致，仅底层网络 API 不同。

## 功能

- **统一请求封装**：`request.ts` 入口，`get/post/put/del`
- **鉴权拦截**：自动注入 Token，401/403 响应交给 auth service 统一处理
- **Token 刷新衔接**：401 触发刷新后自动重试原请求，并发请求入队避免多次登录
- **游客模式**：请求层直接拦截未登录请求
- **防抖去重**：同一请求避免重复发送
- **失败重试**：超时/网络错误可按需自动重试
- **Mock 机制**：开发期不依赖后端
- **错误处理**：统一错误码映射与分级提示
- **文件上传**：独立封装不走 request 去重，支持进度回调
- **SSE 流式请求**：跨端 Server-Sent Events 封装，支持 AI 聊天打字机效果

## 使用方式

### 触发词

```
请求封装
request.ts 怎么写
前端请求统一处理
uniapp 请求统一处理
接口拦截
Token 刷新
游客模式拦截
Mock 数据配置
接口防抖
错误处理
文件上传
SSE 流式请求
打字机效果
Server-Sent Events
AI 聊天流式回复
```

### 前置依赖

无。本 skill 自包含，只聚焦请求层设计。

## 文档结构

```
frontend-request-skill/
├── SKILL.md                        # 主文件：触发条件、设计要点、职责边界
├── README.md                       # 本文件
└── references/
    ├── frontend-spec.md            # 通用前端请求层规范（fetch / axios）
    ├── uniapp-spec.md              # uniapp 适配规范（uni.request）
    ├── request-impl.md             # 历史参考：uniapp request.ts 完整实现
    ├── auth-patterns.md            # 请求层鉴权衔接模式
    ├── mock-guide.md               # Mock 机制配置与使用
    ├── error-handling.md           # 错误处理与文件上传封装
    └── sse-guide.md                # SSE 流式请求与打字机效果
```

## 本地安装

将本 skill 通过软链接安装到 Claude Code 的 skills 目录，即可在任意前端项目中通过触发词调用：

```bash
# macOS / Linux
ln -s /path/to/wg-skills/frontend-request-skill ~/.claude/skills/frontend-request-skill

# Windows（Git Bash）
ln -s /d/projects/wg-skills/frontend-request-skill /c/Users/$USER/.claude/skills/frontend-request-skill

# 验证
ls ~/.claude/skills/frontend-request-skill
```

安装完成后，在 Claude Code 中输入触发词（如“前端请求统一处理”）即可唤起本 skill。

## 快速开始

### 通用前端项目

1. **复制核心请求封装**
   将 [references/frontend-spec.md](references/frontend-spec.md) 中的完整实现复制到 `src/api/request.ts`。

2. **复制错误处理与上传工具**
   将 [references/error-handling.md](references/error-handling.md) 中的 `error.ts`、`toast.ts`、`upload.ts` 复制到对应位置（通用前端上传基于 `fetch` FormData）。

3. **实现鉴权服务**
   按 [references/auth-patterns.md](references/auth-patterns.md) 实现 `src/services/auth.service.ts`，至少提供 `refreshToken()` 与 `handleUnauthorized()`。

4. **配置环境变量**
   在项目根目录创建 `.env.development`：
   ```env
   VITE_BASE_URL=https://dev-api.example.com
   VITE_USE_MOCK=true
   ```

5. **注册 Mock 数据（可选）**
   按 [references/mock-guide.md](references/mock-guide.md) 创建 `src/api/_mocks_/` 并在 `index.ts` 中导入各模块 Mock 文件。

6. **开始使用**
   ```typescript
   import { get, post } from '@/api/request';

   const { data: userInfo } = await get<UserInfo>('/user/info');
   await post<void>('/user/update', { nickname: '张三' });
   ```

### uniapp 项目

1. **复制核心请求封装**
   将 [references/uniapp-spec.md](references/uniapp-spec.md) 中的完整实现复制到 `src/api/request.ts`。

2. **其余步骤同上**，上传/SSE 按 [references/error-handling.md](references/error-handling.md) 与 [references/sse-guide.md](references/sse-guide.md) 的 uniapp 示例落地。

## 环境变量

| 变量 | 说明 | 开发环境示例 | 生产环境示例 |
|------|------|--------------|--------------|
| `VITE_BASE_URL` | API 基础域名 | `https://dev-api.example.com` | `https://api.example.com` |
| `VITE_USE_MOCK` | 是否强制使用 Mock | `true` | `false` |

## 核心设计

### request.ts

```typescript
import { get, post } from '@/api/request';

const { data: userInfo } = await get<UserInfo>('/user/info');
await post<void>('/user/update', { nickname: '张三' });
```

### 响应约定

统一返回结构：

```typescript
interface ApiResponse<T> {
  code: number;    // 0 成功，<0 业务异常
  message: string; // 提示信息
  data: T;         // 业务数据
}
```

- `code = 0`：业务成功，返回 `data`。
- `code < 0`：业务异常，由 `ERROR_CODE_MAP` 映射提示文案。
- `401 / 403 / 500 / 超时 / 断网`：走 HTTP 状态异常分支，错误码为 `UNAUTHORIZED`、`FORBIDDEN`、`HTTP_ERROR`、`TIMEOUT`、`NETWORK_ERROR`。

> 本 skill 内置的 `-1001`、`-1002`、`-2000` 等错误码与 `backend-convention-skill/references/response-format.md` 对齐。接入真实项目时，请与后端确认错误码表并替换。

### 游客拦截

默认所有请求需要登录，未登录时直接拒绝：

```typescript
const { checkLogin } = useAuth();

function handleLike() {
  if (!checkLogin()) return;
  post('/api/like', { id });
}
```

登录态默认从 `localStorage`（通用前端）或 `uni.getStorageSync`（uniapp）读取，也支持从 Pinia `userStore` 读取。详见 [auth-patterns.md](references/auth-patterns.md)。

### 防抖

```typescript
// 默认对同一 key 的并发请求去重
await post('/api/order', data);

// 跳过去重（提交类接口）
await post('/api/order', data, { skipDebounce: true });
```

### 切换鉴权头格式

```typescript
await get('/user/info', null, { authMode: 'bearer' });
```

### Mock 开关

```env
# .env.development
VITE_USE_MOCK=true
```

```typescript
// src/api/_mocks_/user.mock.ts
import { MOCK_MAP } from './index';
import type { MockEntry } from './index';
import type { UserInfo } from '@/types/user';

MOCK_MAP['GET:/user/info'] = {
  code: 0,
  message: 'ok',
  data: { id: 1, nickname: '张三', avatar: '' },
} satisfies MockEntry<UserInfo>;
```

> 示例使用 TypeScript 4.9+ 的 `satisfies` 运算符，低版本请改为显式类型标注 `const userInfoMock: MockEntry<UserInfo> = ...`。

开关开启后，所有请求自动走 Mock；关闭后全部走真实接口。详见 [mock-guide.md](references/mock-guide.md)。

### 文件上传

```typescript
import { upload } from '@/api/upload';

const res = await upload<{ url: string }>({
  url: '/api/upload/avatar',
  file: fileInput.files[0],   // 通用前端用 File
  name: 'avatar',
  formData: { userId: '123' },
  onProgress: (progress) => console.log(`上传进度：${progress}%`),
});
```

上传独立封装，不走 `request` 的并发去重，避免大文件被错误合并。

### 错误处理

```typescript
import { get } from '@/api/request';
import { safeRequest } from '@/utils/toast';

// 方式一：safeRequest 自动提示错误
const userInfo = await safeRequest<UserInfo>({ url: '/user/info' });
if (!userInfo) return;

// 方式二：request 自行处理错误
get<UserInfo>('/user/info').catch((err) => {
  console.log('错误码：', err.code);    // 例如 -1001、UNAUTHORIZED、TIMEOUT
  console.log('错误信息：', err.message);
});
```

### SSE 流式请求

```typescript
import { ref, onUnmounted } from 'vue';
import { sse } from '@/api/sse';
import { useTypewriter } from '@/composables/useTypewriter';

const { displayText, isTyping, append, reset, stop } = useTypewriter({ speed: 40 });
let currentSse: ReturnType<typeof sse> | null = null;

function sendMessage(content: string) {
  reset();
  currentSse = sse<string>(
    { url: '/ai/chat/stream', method: 'POST', data: { content } },
    (msg) => append(String(msg.data)),
    (err) => uni.showToast({ title: '对话中断', icon: 'none' })
  );
}

onUnmounted(() => {
  currentSse?.abort();
  stop();
});
```

### 完整参考

- [frontend-spec.md](references/frontend-spec.md) — 通用前端规范
- [uniapp-spec.md](references/uniapp-spec.md) — uniapp 适配规范
- [auth-patterns.md](references/auth-patterns.md)
- [mock-guide.md](references/mock-guide.md)
- [error-handling.md](references/error-handling.md)
- [sse-guide.md](references/sse-guide.md)

## 从 uniapp-request-skill 迁移

本 skill 由 `uniapp-request-skill` 扩展而来。若你之前使用旧 skill：

1. 触发词保持不变，`uniapp 请求统一处理` 仍可唤起。
2. 新增通用前端触发词，如 `前端请求统一处理`、`request.ts 怎么写`。
3. 原有 `references/request-impl.md` 内容已沉淀为 [uniapp-spec.md](references/uniapp-spec.md)，可直接替换引用。

## 与后端规范的联动

本 skill 的响应信封与错误码表和 `backend-convention-skill/references/response-format.md` 保持一致。当配合 `fastapi-init-skill` 等后端脚手架使用时：

- 后端 `EnvelopeRoute` 输出 `{ code, message, data }`
- 前端 `request.ts` 按相同结构解析
- `ERROR_CODE_MAP` 可直接复用后端 `api-contract.md` 中的错误码表

前后端以 `api-contract.md` 为唯一事实来源，避免口头约定。
