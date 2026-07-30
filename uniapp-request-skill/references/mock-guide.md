# Mock 机制参考

> 开发期不依赖后端即可跑通前端页面。通过全局开关控制是否启用 Mock，Mock 数据建议按接口字段契约声明类型。

## 配置

```typescript
// src/config/api.config.ts
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
```

```env
# .env.development
VITE_USE_MOCK=true

# .env.production
VITE_USE_MOCK=false
```

| 开关 | 行为 |
|------|------|
| `VITE_USE_MOCK=true` | 所有请求强制走 Mock |
| `VITE_USE_MOCK=false` | 所有请求走真实接口 |

## Mock 数据字典

```typescript
// src/api/_mocks_/index.ts
export interface MockEntry<T = any> {
  code: number;
  message: string;
  data: T;
}

export const MOCK_MAP: Record<string, MockEntry> = {};

// 注册各模块 Mock（必须显式 import，否则会被 tree-shaking 清空）
import './user.mock';
import './order.mock';
// 新增业务模块时，在这里追加 import
```

## 按模块注册 Mock（带字段契约）

推荐为 Mock 数据的 `data` 字段声明业务类型，既保证 Mock 数据符合接口契约，也能在联调时直接复用类型：

```typescript
// src/types/user.ts
export interface UserInfo {
  id: number;
  nickname: string;
  avatar: string;
}

// src/api/_mocks_/user.mock.ts
import { MOCK_MAP } from './index';
import type { MockEntry } from './index';
import type { UserInfo } from '@/types/user';

MOCK_MAP['GET:/user/info'] = {
  code: 200,
  message: 'ok',
  data: {
    id: 1,
    nickname: '张三',
    avatar: 'https://example.com/avatar.png',
  },
} satisfies MockEntry<UserInfo>;

MOCK_MAP['GET:/user/:id'] = {
  code: 200,
  message: 'ok',
  data: {
    id: 1,
    nickname: '张三',
  },
} satisfies MockEntry<Partial<UserInfo>>;
```

> **TypeScript 版本说明**：示例使用 TypeScript 4.9+ 的 `satisfies` 运算符。如果项目使用更低版本，可改为显式类型标注：
>
> ```typescript
> const userInfoMock: MockEntry<UserInfo> = {
>   code: 200,
>   message: 'ok',
>   data: {
>     id: 1,
>     nickname: '张三',
>     avatar: 'https://example.com/avatar.png',
>   },
> };
> MOCK_MAP['GET:/user/info'] = userInfoMock;
> ```

如果项目没有统一类型文件，也可以直接在 Mock 文件内声明局部类型：

```typescript
interface SmsSendResult {
  requestId: string;
}

MOCK_MAP['POST:/sms/send'] = {
  code: 200,
  message: 'ok',
  data: { requestId: 'mock-request-id' },
} satisfies MockEntry<SmsSendResult>;
```

## Mock Key 格式

Mock key 统一使用 `METHOD:/path` 格式，例如：

- `GET:/user/info`
- `POST:/order/create`
- `GET:/user/:id`（支持 REST 路径参数）

**注意**：key 中不要包含域名或 `api.config.ts` 里配置的 `DEFAULT_PREFIX`，只写接口路径部分。

## 匹配规则

1. 优先精确匹配 `METHOD:/path`
2. 其次按 REST 路径参数匹配，如 `GET:/user/:id` 可匹配 `GET:/user/123`
3. 未找到时返回默认空数据并打印警告

## 使用

Mock 完全由全局开关控制，业务代码中不需要再为单个接口设置 `mock: true`：

```typescript
// 开关开启时自动走 Mock，关闭时走真实接口
const { data: userInfo } = await get<UserInfo>('/user/info');
```

## 注意事项

- Mock 数据只在开发环境使用，生产环境务必设置 `VITE_USE_MOCK=false`
- 建议把 Mock 文件集中放在 `src/api/_mocks_/` 目录，按业务模块拆分
- 不要让 Mock 数据长期替代后端接口文档，联调阶段及时对接真实接口
- 联调时如果某个接口已就绪，可临时在 `MOCK_MAP` 中删除对应 key，让请求落到真实接口
