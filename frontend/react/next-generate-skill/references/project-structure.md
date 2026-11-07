# Next.js App Router 项目结构标准

## 设计原则

> **约定优于配置 (Convention over Configuration)**
> **目录即文档 (Directory as Documentation)**
> **App Router 文件系统路由**

---

## 标准目录

> **本 Skill 严格对齐 `frontend-request-skill` 的请求层约定。** Client Components 中的 HTTP / 错误处理 / 鉴权必须按该 Skill 的结构组织。Server Components 使用 Next.js 内置的 fetch。

```
my-next-app/
├── public/                        # 静态资源（直接 /xxx 访问）
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/                       # App Router（文件系统路由）
│   │   ├── layout.tsx             # 根 Layout（Server Component）
│   │   ├── page.tsx               # 首页（Server Component）
│   │   ├── loading.tsx            # 全局 Loading UI
│   │   ├── error.tsx              # 全局错误边界（Client Component）
│   │   ├── not-found.tsx          # 404 页面
│   │   │
│   │   ├── (auth)/                # 认证路由组（不共享 layout）
│   │   │   └── login/
│   │   │       └── page.tsx       # 登录页（Client Component）
│   │   │
│   │   ├── (dashboard)/           # 仪表盘路由组（共享 layout）
│   │   │   ├── layout.tsx         # Dashboard Layout（Client Component）
│   │   │   ├── loading.tsx        # Dashboard Loading
│   │   │   ├── error.tsx          # Dashboard Error
│   │   │   ├── users/
│   │   │   │   └── page.tsx       # 用户管理（RSC + Client 混合）
│   │   │   └── settings/
│   │   │       └── page.tsx       # 设置页
│   │   │
│   │   └── api/                   # Route Handlers
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts   # POST /api/auth/login
│   │       │   └── logout/
│   │       │       └── route.ts   # POST /api/auth/logout
│   │       └── users/
│   │           ├── route.ts       # GET /api/users, POST /api/users
│   │           └── [id]/
│   │               └── route.ts   # GET/PUT/DELETE /api/users/:id
│   │
│   ├── lib/                       # 工具库（Next.js 惯用 lib/）
│   │   ├── api/                   # 请求层（三轨策略）
│   │   │   ├── client.ts          # Client Components 用（复用 frontend-request-skill）
│   │   │   └── server.ts          # Server Components 用（Next.js fetch）
│   │   ├── actions/               # Server Actions
│   │   │   ├── auth.ts            # 登录/登出 actions
│   │   │   └── user.ts            # 用户 CRUD actions
│   │   ├── services/              # 业务服务层
│   │   │   └── auth.service.ts    # Token 刷新队列
│   │   ├── config/                # 配置
│   │   │   ├── api.config.ts      # BASE_URL / PREFIX
│   │   │   └── error.config.ts    # ERROR_CODE_MAP
│   │   ├── utils/                 # 工具函数
│   │   │   ├── auth.ts            # Token 存取（cookies 服务端 / localStorage 客户端）
│   │   │   ├── error.ts           # formatError / extractMessage
│   │   │   └── toast.ts           # showError / showSuccess
│   │   └── hooks/                 # 自定义 Hooks（仅 Client 用）
│   │       └── useAuth.ts         # 登录态 / 角色判断
│   │
│   ├── components/                # 共享组件
│   │   ├── AppLayout.tsx          # 全局布局（Client Component）
│   │   └── ...
│   │
│   ├── stores/                    # Zustand（仅 Client 用）
│   │   ├── userStore.ts           # 用户 store
│   │   └── appStore.ts            # 全局 app 状态
│   │
│   ├── types/                     # TypeScript 类型
│   │   ├── api.ts                 # ApiResponse<T> / RequestError
│   │   └── user.ts                # 业务类型
│   │
│   └── styles/                    # 全局样式
│       ├── tokens.css             # CSS 变量
│       ├── reset.css              # 样式重置
│       └── global.css             # 全局样式
│
├── middleware.ts                   # 认证中间件（项目根目录 or src/ 根目录）
├── .env.local                     # 本地环境变量（不入版本控制）
├── .env.example                   # 环境变量示例
├── .eslintrc.json                 # ESLint 配置
├── next.config.js                 # Next.js 配置
├── package.json
├── tsconfig.json                  # 严格模式
└── README.md
```

---

## Route Groups 说明

Route Groups 使用 `(groupName)` 语法，**不影响 URL 路径**：

| Route Group | 路径前缀 | Layout | 用途 |
|-------------|---------|--------|------|
| `(auth)` | 无（/login） | 无或独立 | 登录/注册（无侧边栏） |
| `(dashboard)` | 无（/users） | 共享 Dashboard Layout | 后台管理（有侧边栏） |

**关键**：`(auth)` 和 `(dashboard)` 只是目录组织，URL 中不会出现 `auth` 或 `dashboard`。

---

## 文件命名约定

### App Router 特殊文件名（不可更改）

| 文件名 | 用途 | 渲染方式 |
|--------|------|---------|
| `page.tsx` | 路由页面 | 可 RSC / Client |
| `layout.tsx` | 布局（嵌套） | Server Component（必须） |
| `loading.tsx` | Loading UI | Client Component |
| `error.tsx` | 错误边界 | Client Component（必须 `'use client'`） |
| `not-found.tsx` | 404 页面 | 可 RSC / Client |
| `route.ts` | API Route Handler | Server（Edge / Node.js） |
| `template.tsx` | 模板（每次导航重建） | Server Component |
| `default.tsx` | parallel routes 回退 | 可 RSC / Client |

### 普通文件命名

| 类型 | 命名 | 示例 |
|------|------|------|
| 组件 (.tsx) | PascalCase | `AppButton.tsx` / `UserTable.tsx` |
| 工具函数 (.ts) | camelCase | `format.ts` / `auth.ts` |
| 自定义 Hooks (.ts) | camelCase + `use` 前缀 | `useAuth.ts` |
| Store (.ts) | camelCase | `userStore.ts` |
| 类型 (.ts) | camelCase | `user.ts` / `api.ts` |
| Server Action (.ts) | camelCase | `auth.ts` / `user.ts` |

---

## 环境变量

```
# .env.local（不入版本控制）

# 服务端专用（不带 NEXT_PUBLIC_ 前缀）
API_SECRET_KEY=xxx
DATABASE_URL=xxx

# 客户端可见（必须带 NEXT_PUBLIC_ 前缀）
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_APP_NAME=MyApp
```

**规则**：
- ❌ 不要把服务端密钥加 `NEXT_PUBLIC_` 前缀
- ❌ 不要在 Client Component 中使用不带 `NEXT_PUBLIC_` 的变量
- ✅ Server Components / Route Handlers / Server Actions 可以访问所有变量
- ✅ Client Components 只能访问 `NEXT_PUBLIC_` 前缀的变量

---

## 反模式（禁止）

- ❌ 把所有代码塞进 `app/`（业务逻辑应在 `lib/`）
- ❌ 在 `app/` 下创建 `components/`（共享组件应在 `src/components/`）
- ❌ 创建 `src/common/`、`src/shared/` 等模糊目录
- ❌ 使用 Pages Router 的 `pages/` 目录（必须用 `app/`）
- ❌ 把 middleware.ts 放在 `app/` 内部（应在项目根目录或 `src/` 根目录）
