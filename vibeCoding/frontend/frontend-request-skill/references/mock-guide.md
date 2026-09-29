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

// 业务异常 Mock 示例（code < 0）
MOCK_MAP['POST:/order/create'] = {
  code: -1003,
  message: '重复提交，请稍后再试',
  data: null,
} satisfies MockEntry<null>;
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

---

## 鉴权模块 Mock 完整示例（auth.mock.ts）

> 登录/登出/刷新/获取用户信息 是项目骨架**首屏必备**接口。AI 生成 Login.vue 时如果只 import `authApi.login` 不生成对应的 Mock，开发者首次跑就会被卡 404。下面给出完整可复制的 `src/api/_mocks_/auth.mock.ts` 模板。

```typescript
// src/api/_mocks_/auth.mock.ts
// ponytail: 登录态 mock 在 VITE_USE_MOCK=true 时返回固定 token + mock 用户，
// 让 LoginForm @submit 可以端到端跑通，联调时关掉 USE_MOCK 即可对接真实后端。
import { MOCK_MAP, type MockEntry } from './index';
import type { LoginResponse, UserInfo, RefreshTokenResponse, MenuNode } from '@/types/auth';

// ==================== 登录 ====================

MOCK_MAP['POST:/auth/login'] = {
  code: 0,
  message: 'ok',
  data: {
    token: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      id: 1,
      username: 'admin',
      nickname: '超级管理员',
      avatar: 'https://example.com/avatar.png',
      email: 'admin@example.com',
      roles: ['super_admin'],
      permissions: ['*'],
    },
  },
} satisfies MockEntry<LoginResponse>;

// 登录失败示例（密码错误）
MOCK_MAP['POST:/auth/login:wrong'] = {
  code: -1001,
  message: '用户名或密码错误',
  data: null,
} satisfies MockEntry<null>;

// ==================== 刷新 Token ====================

MOCK_MAP['POST:/auth/refresh'] = {
  code: 0,
  message: 'ok',
  data: {
    token: 'mock-access-token-refreshed-' + Date.now(),
    refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
  },
} satisfies MockEntry<RefreshTokenResponse>;

// ==================== 登出 ====================

MOCK_MAP['POST:/auth/logout'] = {
  code: 0,
  message: 'ok',
  data: null,
} satisfies MockEntry<null>;

// ==================== 当前用户信息 ====================

MOCK_MAP['GET:/auth/me'] = {
  code: 0,
  message: 'ok',
  data: {
    id: 1,
    username: 'admin',
    nickname: '超级管理员',
    avatar: 'https://example.com/avatar.png',
    email: 'admin@example.com',
    roles: ['super_admin'],
    permissions: ['*'],
    tenantId: 1,
  },
} satisfies MockEntry<UserInfo>;

// ==================== 菜单权限 ====================

const mockMenuTree: MenuNode[] = [
  {
    id: 1,
    name: '仪表盘',
    path: '/dashboard',
    icon: 'chart',
    menuType: 'C',
    sortOrder: 1,
    visible: 1,
    status: 1,
  },
  {
    id: 2,
    name: '系统管理',
    path: '/system',
    icon: 'setting',
    menuType: 'M',
    sortOrder: 10,
    visible: 1,
    status: 1,
    children: [
      {
        id: 21,
        name: '用户管理',
        path: '/system/user',
        menuType: 'C',
        sortOrder: 1,
        visible: 1,
        status: 1,
      },
    ],
  },
];

MOCK_MAP['GET:/auth/menus'] = {
  code: 0,
  message: 'ok',
  data: mockMenuTree,
} satisfies MockEntry<MenuNode[]>;
```

> **要点**：
> - 登录响应里的 `token` 用 `Date.now()` 后缀，避免每次请求 token 相同触发缓存问题
> - `:wrong` 后缀的 Mock Key 用于测试失败态（消费者可通过 query 参数触发）
> - `roles` 字段用 `['super_admin']`，前端 `hasPermission` 默认放行 super_admin

---

## 默认错误码集

> **权威来源**：[`api-contract.md` §7.3](api-contract.md)（前后端桥接的唯一真理源）。
>
> 各 init-skill 内置的统一响应规范 → 后端实际返回的错误码远不止 `SUCCESS_CODES` 那一个。`ERROR_CODE_MAP` 必须按后端契约穷举到位，否则 toast 会显示"请求失败"而不是后端真实 message。
>
> **强制要求**：本仓库的 `ERROR_CODE_MAP` 与 [`api-contract.md` §7.3](api-contract.md) 保持一致；任何业务新增错误码必须**先**更新契约，**后**更新映射表。

### 6 大类错误码（api-contract.md §7.3）

| 类别 | 范围 | 说明 |
|------|------|------|
| HTTP / 系统级 | `-1000` ~ `-1005` | 系统繁忙 / 参数校验 / 资源不存在 / 资源冲突 / 限流 / 服务不可用 |
| 鉴权模块 | `-1`、`-1006` ~ `-1012` | **JWT 鉴权专用 `-1`** / 用户名密码 / 账号锁定 / 验证码 / RefreshToken / 无权限 |
| 用户模块 | `-2001` ~ `-2004` | 用户不存在 / 已存在 / 原密码错误 / 两次密码不一致 |
| 角色 / 权限 | `-3001` ~ `-3004` | 角色不存在 / 已存在 / 已被使用 / 超级管理员不可删 |
| 菜单模块 | `-4001` ~ `-4003` | 菜单不存在 / 已存在 / 存在子菜单不可删 |
| 文件上传 | `-5001` ~ `-5003` | 类型不支持 / 文件过大 / 上传失败 |

**默认 `ERROR_CODE_MAP` 完整示例**（与契约 §7.3 对齐）：

```typescript
// src/config/error.config.ts
// 完整默认值见 references/error-handling.md §错误码映射。
// 真实项目**必须**按后端契约替换，并补充业务模块扩展码。

export const ERROR_CODE_MAP: Record<string, string> = {
  // HTTP 层（请求层）
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '权限不足',
  TIMEOUT: '请求超时，请检查网络',
  NETWORK_ERROR: '网络异常，请稍后重试',
  HTTP_ERROR: '请求失败',
  HTTP_5XX: '服务器繁忙，请稍后重试',
  UPLOAD_ERROR: '上传失败',

  // 业务层（api-contract.md §7.3）
  '-1':       '未登录或登录已过期',          // JWT 鉴权失效专用
  '-1000':    '系统繁忙，请稍后再试',
  '-1001':    '参数校验错误',
  '-1006':    '用户名或密码错误',
  '-1009':    '验证码错误',
  '-2001':    '用户不存在',
  // ... 其余按契约补全
};
```

> **使用建议**：
> - 项目启动后跑一遍联调，把后端实际抛出的 code 补到 `ERROR_CODE_MAP`，不要让前端 toast 永远显示"请求失败"
> - key 必须是 `string`（负数也要带引号），TypeScript 会把 `Record<string, string>` 索引签名放宽到 string
> - 文案尽量简短（≤15 字），过长的提示放在后端 `data.message` 字段通过 `extractMessage` 直接透传
> - **业务错误码必须先更新 [`api-contract.md` §7.3](api-contract.md)，再更新本映射**——契约是前后端唯一真理源
