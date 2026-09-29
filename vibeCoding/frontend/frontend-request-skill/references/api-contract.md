# API 契约（api-contract）

> **本文件是前后端桥接的唯一真理源（Single Source of Truth）**。
>
> 任何后端骨架（Go / Java / Python / NodeJS / …）生成的 `api-contract.md` 必须与本文档一致；
> 前端 `frontend-request-skill` 的所有 `references/` 必须遵守本文档。
>
> **凡有冲突，以本文件为准**。

---

## 0. 契约的强制性

- 后端新生成业务时，**必须**更新后端 `api-contract.md`（新增/修改的接口、错误码、字段）。
- 前端**只读**这份契约，禁止猜测接口路径、字段、错误码。
- 契约变更必须前后端同步落地，不允许后端改了、前端没改就上线。

---

## 1. 适用范围

| 项目类型 | 后端骨架 | 前端框架 | 是否本契约 |
|----------|----------|----------|------------|
| 通用 Web / H5 | Go / Java / Python / NodeJS | Vue / React | ✅ |
| uniapp 跨端 | 同上 | uniapp | ✅ |
| 小程序原生 | 同上 | 原生小程序 | ✅ |
| 桌面端 | 同上 | Electron | ✅ |

---

## 2. 接口存放位置（前端统一约定）

> **强约定**：所有前端项目（vue / uniapp / react / 小程序原生），接口统一存放在 **`src/api/`** 目录下。
>
> 不允许散落到 `pages/api/`、`views/api/`、`utils/api/`、`service/` 等位置。

### 2.1 标准目录结构

```
src/
├── api/                          # 前后端桥接层（frontend-request-skill 管理）
│   ├── request.ts                # 统一请求封装（核心）
│   ├── upload.ts                 # 文件上传封装
│   ├── sse.ts                    # SSE 流式请求封装
│   ├── modules/                  # 按业务模块拆分
│   │   ├── auth.ts               # 鉴权相关（login / logout / refresh / me）
│   │   ├── user.ts               # 用户管理
│   │   ├── role.ts               # 角色管理
│   │   ├── menu.ts               # 菜单/权限
│   │   └── index.ts              # 统一导出
│   ├── _mocks_/                  # Mock 数据字典（USE_MOCK=true 时启用）
│   │   ├── index.ts              # MOCK_MAP + MockEntry
│   │   ├── auth.mock.ts
│   │   └── user.mock.ts
│   └── types/                    # 接口请求/响应类型
│       ├── auth.ts
│       └── user.ts
├── services/                     # 业务服务层（与 api/ 解耦）
│   └── auth.service.ts           # 鉴权服务：login / logout / handleUnauthorized
├── config/
│   ├── api.config.ts             # BASE_URL / 超时 / 成功码 / 重试次数
│   └── error.config.ts           # 错误码 → 用户文案映射（与后端契约一致）
├── utils/
│   ├── auth.ts                   # getToken / setToken
│   ├── toast.ts                  # 错误提示工具
│   └── error.ts                  # 错误信息提取
└── composables/
    ├── useAuth.ts               # 游客判断 Hook
    └── useTypewriter.ts          # 打字机效果 Hook
```

### 2.2 为什么放在 `src/api/` 而不是 `service/`？

- `api/` 只做**网络层**（请求/响应/错误），不关心业务状态。
- `services/` 做**业务逻辑**（如登录后写 token、刷新失败后跳登录页），依赖 `api/`。
- 二者层级分明，便于跨页面复用、Mock 替换、独立测试。

### 2.3 uniapp 项目的特殊性

uniapp 项目**也使用 `src/api/`**：

- H5 端编译后是普通前端，路径完全一致。
- 小程序/App 端 `src/api/` 会被 webpack/vite 直接打到产物，无需额外配置。
- **禁止**用 `uni.request` 散落在页面每个组件里——必须走 `src/api/request.ts` 封装。

---

## 3. 登录页接口契约

> **登录页（不论后台管理系统、商城还是 SaaS 平台）必须有以下 5 个接口**。

| 方法 | 路径 | needAuth | 说明 |
|------|------|----------|------|
| `POST` | `/auth/login` | `false` | 登录 |
| `POST` | `/auth/logout` | `false`（可选） | 登出（前端清 Token） |
| `POST` | `/auth/refresh` | `false` | 刷新 Token（用 refreshToken 换 accessToken） |
| `GET` | `/auth/me` | `true` | 当前登录用户信息 |
| `GET` | `/auth/captcha` | `false` | 图形验证码（可选） |

### 3.1 POST /auth/login

**请求**：

```typescript
interface LoginRequest {
  username: string;
  password: string;
  captcha?: string;        // 有验证码时
  captchaId?: string;
}
```

**响应**：

```typescript
interface LoginResponse {
  token: string;           // accessToken（JWT）
  refreshToken: string;    // 用于刷新 token
  expiresIn: number;       // accessToken 过期秒数
  tokenType: 'Bearer';
  user: User;              // 用户信息
}
```

**可能的 code**：

| code | message | 说明 |
|------|---------|------|
| `0` | 登录成功 | — |
| `-1` | 未登录或 Token 无效 | （理论上 login 接口不会出现 -1，但保留契约） |
| `-1001` | 用户名或密码错误 | 前端弹"账号或密码错误" |
| `-1002` | 账号已锁定 | 前端弹"账号被锁定，请联系管理员" |
| `-1003` | 无权限 | — |
| `-1004` | 验证码错误 | 前端弹"验证码错误" |

### 3.2 POST /auth/refresh

**请求**：

```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}
```

**响应**：

```typescript
interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}
```

### 3.3 GET /auth/me

**请求**：无 body

**响应**：

```typescript
interface User {
  id: string | number;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
}
```

---

## 4. 管理页面通用接口契约

> **不是每个项目都有管理类页面，但有了就必须遵循以下契约**。
> 如果项目后端生成了新的业务模块（如订单、商品、文章），必须按此契约扩写 `api-contract.md`。

### 4.1 RESTful 风格

| 操作 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 列表 | `GET` | `/{module}` | 支持 `page`、`pageSize`、`keyword`、`sort`、`order` |
| 详情 | `GET` | `/{module}/:id` | — |
| 新增 | `POST` | `/{module}` | — |
| 修改 | `PUT` | `/{module}/:id` | — |
| 删除 | `DELETE` | `/{module}/:id` | — |
| 批量删除 | `POST` | `/{module}/batch-delete` | ids: id[] |

### 4.2 标准模块示例

```
GET    /users                 # 用户列表
GET    /users/:id             # 用户详情
POST   /users                 # 新增用户
PUT    /users/:id             # 修改用户
DELETE /users/:id             # 删除用户
GET    /users/:id/roles       # 用户的角色

GET    /roles                 # 角色列表
GET    /roles/:id             # 角色详情
POST   /roles                 # 新增角色
PUT    /roles/:id             # 修改角色
DELETE /roles/:id             # 删除角色

GET    /menus                 # 菜单树（管理端左侧菜单）
GET    /menus/:id             # 菜单详情
POST   /menus                 # 新增菜单
PUT    /menus/:id             # 修改菜单
DELETE /menus/:id             # 删除菜单

GET    /permissions           # 权限列表（按钮级别）
GET    /roles/:id/permissions # 角色的权限
```

### 4.3 列表响应（分页）

```typescript
interface PageRequest {
  page?: number;       // 默认 1
  pageSize?: number;   // 默认 20，上限 100
  keyword?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 5. 请求头规范（所有骨架统一）

> 任何后端骨架（Go / Java / Python / NodeJS）**必须**识别以下请求头。

| 请求头 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `Authorization` | string | 部分 | JWT Token，格式 `Bearer <token>`（详见 §7） |
| `Content-Type` | string | POST/PUT 必填 | 默认 `application/json;charset=UTF-8` |
| `X-Request-ID` | string（UUID） | 可选 | 链路追踪，前端每次请求自动生成 |
| `Accept-Language` | string | 可选 | i18n，默认 `zh-CN` |
| `User-Agent` | string | 自动 | 浏览器/客户端自动设置 |

**前端自动注入实现**：

```typescript
// 在 requestInterceptor 中
const headers = new Headers(options.headers);

// JWT Token（needAuth=true 时自动注入）
if (options.needAuth !== false) {
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
}

// JSON Content-Type
if (!headers.has('Content-Type') && shouldSetJsonContentType(options.data)) {
  headers.set('Content-Type', 'application/json;charset=UTF-8');
}

// 链路追踪 ID
if (!headers.has('X-Request-ID')) {
  headers.set('X-Request-ID', generateUuidV4());
}

// i18n
if (!headers.has('Accept-Language')) {
  headers.set('Accept-Language', getLocale());
}
```

---

## 6. 响应信封（强契约）

> 所有后端接口**必须**返回以下结构，**没有任何例外**。

```typescript
interface ApiResponse<T = any> {
  code: number;     // 业务状态码（见 §7 严格约定）
  message: string;  // 用户可读消息（错误时显示给用户）
  data: T;          // 业务数据（成功时填充）
}
```

**HTTP 状态码**：

| 状态 | 含义 | 前端处理 |
|------|------|----------|
| `200` | 业务请求已处理（成功/失败看 `code`） | 正常解析信封 |
| `401` | JWT 无效/过期 | 触发 Token 刷新流程（见 auth-patterns） |
| `403` | 权限不足 | 弹"无权限" |
| `429` | 请求过于频繁 | 弹"操作太频繁" |
| `500` | 服务器内部错误 | **不弹用户 Toast**，swallow + 上报 |
| `503` | 服务不可用 | 同 500 |

> **关键原则**：HTTP 状态只表示"网络/网关层"，业务成功失败**只看 `code`**。

---

## 7. 业务错误码契约（最严格约定）

> **绝对不可破坏的强契约**——所有后端骨架、所有前端项目、所有业务模块**必须**严格遵守。

### 7.1 通用规则

| code 范围 | 含义 | 处理 |
|-----------|------|------|
| **`code === 0`** | 业务成功 | 正常返回 `data` |
| **`code > 0`** | 按项目约定（一般不用） | 默认也视为业务异常 |
| **`code < 0`** | 业务异常 | 抛 `RequestError`，按 `showError` 决定是否 toast |

### 7.2 特殊错误码 `-1`（JWT 鉴权）

> **`code === -1` 是本项目所有骨架统一的"鉴权失效"标识**。
>
> 后端识别到以下任意场景，必须返回 `code: -1`：
>
> 1. 用户未登录（无 Token / Token 已清空）
> 2. Token 无效（伪造、篡改、签名错误）
> 3. Token 过期（accessToken 失效）
> 4. Token 未传递（请求头缺 `Authorization`）
>
> 前端响应拦截器识别 `-1` **等同于 HTTP 401**，统一走 Token 刷新流程。

**`AUTH_FAILURE_CODES` 配置**：

```typescript
// src/config/api.config.ts
export const AUTH_FAILURE_CODES: (string | number)[] = [-1];
```

### 7.3 默认错误码集（按模块分类）

> 以下错误码由各后端 init-skill 共享，前后端**必须**对齐。

#### HTTP / 系统级

| code | message | 说明 |
|------|---------|------|
| `-1000` | 系统繁忙，请稍后再试 | 兜底错误 |
| `-1001` | 参数校验错误 | 入参不合法 |
| `-1002` | 资源不存在 | 404 业务化 |
| `-1003` | 资源冲突 | 重复新增 |
| `-1004` | 请求过于频繁 | 限流 |
| `-1005` | 服务暂不可用 | — |

#### 鉴权模块

| code | message | 说明 |
|------|---------|------|
| `-1` | 未登录或登录已过期 | **JWT 失效专用**（见 §7.2） |
| `-1006` | 用户名或密码错误 | — |
| `-1007` | 账号已锁定 | — |
| `-1008` | 账号已禁用 | — |
| `-1009` | 验证码错误 | — |
| `-1010` | 验证码已过期 | — |
| `-1011` | RefreshToken 无效 | — |
| `-1012` | 无访问权限 | 403 业务化 |

#### 用户模块

| code | message | 说明 |
|------|---------|------|
| `-2001` | 用户不存在 | — |
| `-2002` | 用户已存在 | — |
| `-2003` | 原密码错误 | 修改密码 |
| `-2004` | 两次密码不一致 | — |

#### 角色 / 权限模块

| code | message | 说明 |
|------|---------|------|
| `-3001` | 角色不存在 | — |
| `-3002` | 角色已存在 | — |
| `-3003` | 角色已被使用 | 删除时 |
| `-3004` | 超级管理员不可删除 | — |

#### 菜单模块

| code | message | 说明 |
|------|---------|------|
| `-4001` | 菜单不存在 | — |
| `-4002` | 菜单已存在 | — |
| `-4003` | 存在子菜单，不可删除 | — |

#### 文件上传模块

| code | message | 说明 |
|------|---------|------|
| `-5001` | 文件类型不支持 | — |
| `-5002` | 文件过大 | — |
| `-5003` | 文件上传失败 | — |

---

## 8. showError 参数契约

> **核心约定**：前端请求层 `showError` 参数控制"是否由请求层主动弹 Toast"。

| 取值 | 含义 | 默认 |
|------|------|------|
| `false`（默认） | 请求层自动弹 Toast（按 `ERROR_CODE_MAP` 映射文案） | ✅ |
| `true` | 请求层**不弹**，调用方自行 try/catch 处理 | — |

**典型用法**：

```typescript
// 场景 1：默认（自动弹）
const res = await post('/users', form);
// 失败：弹"参数校验错误"等用户文案

// 场景 2：调用方自己处理（轮询/静默失败/自定义提示）
const res = await get('/orders/poll', null, { showError: true });
if (!res) return; // 调用方已知空白处理

// 场景 3：调用方覆盖默认提示
try {
  await post('/orders', form, { showError: true });
} catch (err) {
  ElMessage.warning('库存不足，请稍后再试'); // 自定义文案
}
```

> **设计理由**：默认自动弹，覆盖 80% 场景（页面直取数据）；少数特殊场景（轮询、上传队列、批量提交）传 `showError: true` 让调用方自己处理。

---

## 9. HTTP 500 错误兜底（强制 swallow 用户弹框）

> **强约定**：HTTP 500 / 502 / 503 / 504 类错误，**前端请求层不弹任何用户 Toast**。
>
> 理由：500 是服务端问题，用户弹 Toast 也无法解决；交给全局错误处理（Sentry / 监控平台 / 后端日志）。

**实现**：

```typescript
// 响应拦截器中
if (statusCode >= 500 && statusCode < 600) {
  // 上报到全局错误处理（不抛给用户）
  reportToGlobalErrorHandler({
    type: 'HTTP_5XX',
    statusCode,
    url: options.url,
    method: options.method,
    message: extractMessage(data) || '服务器繁忙',
  });

  // 抛特定错误，request() 的 catch 块识别后 swallow
  throw formatError('HTTP_5XX', extractMessage(data) || '服务器繁忙', { res, data });
}

// request() 的 catch 块
.catch((err: RequestError) => {
  // HTTP 5xx 永远不弹用户 Toast
  if (err.code === 'HTTP_5XX') {
    throw err; // 抛给调用方，但不再走 toast
  }

  // 业务 code < 0：按 showError 决定
  const businessCode = typeof err.code === 'number' ? err.code : 0;
  if (businessCode < 0 && options.showError !== true) {
    showError(err); // 弹 Toast
  }

  throw err;
});
```

**调用方感知**：

```typescript
try {
  await get('/big-data');
} catch (err) {
  // HTTP 5xx：用户无感（请求层 swallow），但调用方仍可感知（用于重试/降级）
  if (err.code === 'HTTP_5XX') {
    // 自定义降级逻辑（如展示缓存、占位图）
    return getCachedData();
  }
  throw err;
}
```

---

## 10. Token 响应兼容（Java camelCase / Python snake_case）

> 后端 Java（Spring Boot）默认输出 camelCase（`accessToken`），
> 后端 Python（FastAPI）默认输出 snake_case（`access_token`）。
> 前端必须**双兼容**。

**前端兼容实现**：

```typescript
interface TokenResponseRaw {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
  tokenType?: string;
  token_type?: string;
}

export function normalizeTokenResponse(raw: TokenResponseRaw): TokenResponse {
  return {
    token: raw.accessToken ?? raw.access_token ?? '',
    refreshToken: raw.refreshToken ?? raw.refresh_token ?? '',
    expiresIn: raw.expiresIn ?? raw.expires_in ?? 0,
    tokenType: (raw.tokenType ?? raw.token_type ?? 'Bearer') as 'Bearer',
  };
}
```

---

## 11. JWT 鉴权约定（所有骨架统一）

> **所有后端骨架（Go / Java / Python / NodeJS）必须使用 JWT 做无状态鉴权**。

### 11.1 Token 类型

| Token | 用途 | 存储位置 | 有效期 |
|-------|------|----------|--------|
| `accessToken` | 接口访问令牌 | 前端内存 / localStorage | 2 小时（建议） |
| `refreshToken` | 刷新令牌 | 前端 localStorage | 7 天（建议） |

### 11.2 请求头格式

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 11.3 失效处理流程

```
请求接口
  ↓
HTTP 401 或 code === -1
  ↓
进入 refresh 队列（isRefreshing 锁）
  ↓
POST /auth/refresh（携带 refreshToken）
  ↓
成功 → 替换 token → 重发原请求
失败 → handleUnauthorized() 跳登录页
```

详细实现见 [auth-patterns.md](auth-patterns.md)。

---

## 12. 超时默认值

| 类型 | 默认 | 可覆盖 |
|------|------|--------|
| 普通接口 | 30000ms（30s） | `options.timeout` |
| 文件上传 | 120000ms（2min） | `options.timeout` |
| SSE 流式 | 不超时（手动 abort） | `options.timeout` |

**前端配置**：

```typescript
// src/config/api.config.ts
export const REQUEST_TIMEOUT = 30000;
export const UPLOAD_TIMEOUT = 120000;
```

---

## 13. 参数命名约定

| 端 | 字段命名 | 备注 |
|----|----------|------|
| 请求 | camelCase | 前端发请求一律 camelCase |
| 响应 | camelCase 优先 | 前端默认按 camelCase 解析（详见 §10 Token 兼容） |
| 路径参数 | kebab-case 或 camelCase | 与后端路由对齐 |

**示例**：

```typescript
// 请求
post('/users', {
  userName: '张三',
  phoneNumber: '13800138000',
});

// 响应
{
  code: 0,
  message: 'ok',
  data: {
    userName: '张三',
    phoneNumber: '13800138000',
    createTime: '2026-09-23T10:00:00Z',
  },
}
```

---

## 14. 变更记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-09-24 | v1.0 | 初版：定义 §2 接口位置 / §3 登录页契约 / §5 请求头 / §6 信封 / §7 错误码 / §9 500 兜底 / §11 JWT |