# uniapp 请求层设计 Skill

> uniapp 微信小程序统一请求封装：从 request.ts 出发，解决鉴权、Token、游客、防抖、Mock、错误处理、文件上传、SSE 流式请求、失败重试等实战问题。

## 功能

- **统一请求封装**：`request.ts` 入口，`get/post/put/del`
- **鉴权拦截**：自动注入 Token，401/403 响应交给 auth service 统一处理
- **Token 刷新衔接**：401 触发刷新后自动重试原请求，并发请求入队避免多次登录
- **游客模式**：请求层直接拦截未登录请求
- **防抖去重**：同一请求避免重复发送
- **失败重试**：超时/网络错误可按需自动重试
- **Mock 机制**：开发期不依赖后端
- **错误处理**：统一错误码映射与分级提示
- **文件上传**：基于 `uni.uploadFile` 的封装，独立实现不走 request 去重，支持进度回调
- **SSE 流式请求**：跨端 Server-Sent Events 封装，支持 AI 聊天打字机效果

## 使用方式

### 触发词

```
请求封装
request.ts 怎么写
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
uniapp-request-skill/
├── SKILL.md                        # 主文件：触发条件、设计要点、职责边界
├── README.md                       # 本文件
└── references/
    ├── request-impl.md             # request.ts 完整实现参考
    ├── auth-patterns.md            # 请求层鉴权衔接模式
    ├── mock-guide.md               # Mock 机制配置与使用
    ├── error-handling.md           # 错误处理与文件上传封装
    └── sse-guide.md                # SSE 流式请求与打字机效果
```

## 本地安装

将本 skill 通过软链接安装到 Claude Code 的 skills 目录，即可在任意 uniapp 项目中通过触发词调用：

```bash
# macOS / Linux
ln -s /path/to/wg-skills/uniapp-request-skill ~/.claude/skills/uniapp-request-skill

# Windows（Git Bash）
ln -s /d/projects/wg-skills/uniapp-request-skill /c/Users/$USER/.claude/skills/uniapp-request-skill

# 验证
ls ~/.claude/skills/uniapp-request-skill
```

安装完成后，在 Claude Code 中输入触发词（如“uniapp 请求统一处理”）即可唤起本 skill。

## 快速开始

按以下步骤将本 skill 的参考实现落地到新项目：

1. **复制核心请求封装**
   将 [references/request-impl.md](references/request-impl.md) 中的完整实现复制到 `src/api/request.ts`。

2. **复制错误处理与上传工具**
   将 [references/error-handling.md](references/error-handling.md) 中的 `error.ts`、`toast.ts`、`upload.ts` 复制到对应位置。

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

> 本 skill 内置的 `-1001`、`-1002`、`-1003` 等错误码仅为示例，接入真实项目时请替换为后端实际约定。

### 游客拦截

```typescript
const { checkLogin } = useAuth();

function handleLike() {
  if (!checkLogin()) return;
  post('/api/like', { id });
}
```

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
  code: 200,
  message: 'ok',
  data: { id: 1, nickname: '张三', avatar: '' },
} satisfies MockEntry<UserInfo>;
```

> 示例使用 TypeScript 4.9+ 的 `satisfies` 运算符，低版本请改为显式类型标注 `const userInfoMock: MockEntry<UserInfo> = ...`。

开关开启后，所有请求自动走 Mock；关闭后全部走真实接口。详见 [mock-guide.md](references/mock-guide.md)。

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

- [request-impl.md](references/request-impl.md)
- [auth-patterns.md](references/auth-patterns.md)
- [mock-guide.md](references/mock-guide.md)
- [error-handling.md](references/error-handling.md)
- [sse-guide.md](references/sse-guide.md)

## 从旧版 Mock 机制迁移

如果你之前使用 `MOCK_MODE`（`none` / `auto` / `force`）或单接口 `{ mock: true }`，请按以下方式迁移：

1. **删除所有单接口 Mock 标记**
   ```typescript
   // 旧写法，删除
   await get('/user/info', null, { mock: true });

   // 新写法，无需标记
   await get('/user/info');
   ```

2. **替换环境变量**
   ```env
   # 旧写法
   VITE_MOCK_MODE=force

   # 新写法
   VITE_USE_MOCK=true
   ```

3. **更新 `api.config.ts`**
   ```typescript
   // 删除
   export type MockMode = 'none' | 'auto' | 'force';
   export const MOCK_MODE: MockMode = (import.meta.env.VITE_MOCK_MODE as MockMode) || 'none';

   // 改为
   export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
   ```

4. **注册 Mock 模块**
   在 `src/api/_mocks_/index.ts` 中显式导入各模块 Mock 文件：
   ```typescript
   import './user.mock';
   import './order.mock';
   ```

5. **生产环境关闭 Mock**
   ```env
   VITE_USE_MOCK=false
   ```
