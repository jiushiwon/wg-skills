# React + TS 项目结构标准

## 设计原则

> **约定优于配置 (Convention over Configuration)**
> **目录即文档 (Directory as Documentation)**
> **能少一个就少一个 (Less is More)**

---

## 标准目录

> **本 Skill 严格对齐 `frontend-request-skill` 的目录约定。** 所有 HTTP / 错误处理 / 鉴权相关文件必须按该 Skill 的结构组织。

```
my-react-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                   # 接口层（对齐 frontend-request-skill）
│   │   ├── request.ts         # 统一请求封装（fetch + 拦截器）
│   │   ├── upload.ts          # 文件上传
│   │   ├── sse.ts             # SSE 流式（按需）
│   │   ├── modules/           # 按业务模块聚合
│   │   │   ├── user.ts
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   └── index.ts           # API 统一导出
│   ├── config/                # 静态配置
│   │   ├── api.config.ts      # BASE_URL / PREFIX / 超时 / Mock 开关
│   │   └── error.config.ts    # ERROR_CODE_MAP
│   ├── services/              # 业务服务层（鉴权收口）
│   │   └── auth.service.ts    # 登录 / 登出 / Token 刷新队列
│   ├── assets/                # 需要打包处理的静态资源
│   │   ├── images/
│   │   └── icons/
│   ├── components/            # 业务组件（仅复用 ≥3 次才放进来）
│   │   ├── AppLayout.tsx     # 全局布局（必备）
│   │   └── ...
│   ├── hooks/                 # 自定义 Hooks（use* 命名）
│   │   ├── useAuth.ts        # 登录态 / 角色判断
│   │   ├── useFetch.ts       # 数据请求
│   │   └── ...
│   ├── constants/             # 全局常量
│   │   ├── colors.ts         # 从 CSS 变量映射的 TS 常量
│   │   ├── enums.ts
│   │   └── pages.ts          # 路由常量
│   ├── router/
│   │   ├── index.tsx         # 路由配置
│   │   ├── routes.ts         # 路由声明
│   │   └── guards.tsx        # 路由守卫（鉴权 / 角色）
│   ├── stores/               # Zustand stores
│   │   ├── index.ts
│   │   └── modules/
│   │       ├── userStore.ts  # 用户 / token
│   │       └── appStore.ts  # 全局 app 状态
│   ├── styles/
│   │   ├── tokens.css        # CSS 变量（颜色/间距/字体/圆角/阴影）
│   │   ├── reset.css         # 样式重置
│   │   └── global.css        # 全局样式
│   ├── types/                # 全局 TS 类型
│   │   ├── api.ts           # ApiResponse<T> / RequestError / RequestOptions
│   │   ├── user.ts          # 业务类型
│   │   └── ...
│   ├── utils/                # 通用工具
│   │   ├── auth.ts          # getToken / setToken / clearToken（抽象）
│   │   ├── error.ts         # formatError / extractMessage
│   │   ├── toast.ts         # showError / showSuccess（Ant Design）
│   │   ├── format.ts        # 格式化（日期、金额）
│   │   └── storage.ts       # localStorage 封装
│   ├── pages/               # 页面（一个页面一个 .tsx）
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── UserManagement.tsx
│   │   └── ...
│   ├── App.tsx              # 根组件
│   └── main.tsx              # 入口文件
├── .env                      # 本地环境变量（不入版本控制）
├── .env.example              # 环境变量示例（入版本控制）
├── .eslintrc.cjs             # ESLint 配置
├── .prettierrc.json          # Prettier 配置
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json             # 严格模式（strict: true）
├── tsconfig.node.json
├── vite.config.ts            # 路径别名 + auto-import
└── README.md
```

---

## 命名约定

### 文件命名

| 类型 | 命名 | 示例 |
|------|------|------|
| 组件 (.tsx) | PascalCase | `AppButton.tsx` / `UserManagement.tsx` |
| 页面 (.tsx) | PascalCase | `Dashboard.tsx` / `Login.tsx` |
| 工具函数 (.ts) | camelCase | `format.ts` / `storage.ts` |
| 自定义 Hooks (.ts) | camelCase + `use` 前缀 | `useAuth.ts` / `useFetch.ts` |
| Store (.ts) | camelCase | `userStore.ts` / `appStore.ts` |
| 类型 (.ts) | camelCase | `user.ts` / `api.ts` |
| 常量 (.ts) | camelCase | `colors.ts` / `enums.ts` |
| 接口模块 (.ts) | camelCase | `auth.ts` / `user.ts` |

### 目录命名

- 一律小写 + 复数：`api/modules/`、`stores/modules/`、`constants/`
- 例外：`components/`、`pages/`（虽然组件/页面通常多个，但更符合社区习惯）

### 代码命名

| 类型 | 命名 | 示例 |
|------|------|------|
| 组件 | PascalCase | `AppButton` / `UserCard` |
| 普通变量/函数 | camelCase | `userName` / `handleClick` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT` / `API_BASE_URL` |
| 类型/接口 | PascalCase | `User` / `LoginRequest` |
| 枚举 | PascalCase | `UserStatus.Active` |
| 私有方法/变量 | `_` 前缀 | `_handleInternal` |

---

## 何时新增目录

**严格规则**：**只用一次的不建**。

| 场景 | 处理 |
|------|------|
| 第一次用到工具函数 | 直接写在 `src/utils/xxx.ts` |
| 第二次用到同领域工具函数 | 继续写在 `src/utils/xxx.ts` |
| 第三次用到 | 这时候才考虑拆子目录 |

**反模式**：
- ❌ 项目一启动就建 `src/utils/date/`、`src/utils/string/`、`src/utils/url/`
- ❌ 每个工具函数一个文件（粒度过细）
- ❌ 每个组件一个文件 + 每个文件 50 行（拆分过细）

**正模式**：
- ✅ `src/utils/format.ts`（包含日期、金额、字符串所有格式化函数）
- ✅ `src/utils/storage.ts`（包含 localStorage、sessionStorage 封装）
- ✅ `src/utils/auth.ts`（token 存取、解析、过期判断）

---

## 路由约定

```tsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

export const router = createBrowserRouter(routes);

// src/router/routes.ts
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { AppLayout } from '@/components/AppLayout';

export const routes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <Dashboard />,
      },
      {
        path: 'users',
        element: <UserManagement />,
      },
    ],
  },
];
```

---

## 反模式（禁止）

❌ **不要** 把所有代码塞进 `src/pages/`
❌ **不要** 创建 `src/common/`、`src/shared/`、`src/lib/` 等模糊目录
❌ **不要** 把 constants 写在代码里散落各处（统一放 `src/constants/`）
❌ **不要** 创建空的 `index.ts`（有内容才创建）
❌ **不要** 在 `src/` 下创建 `src/main/feature/`、`src/main/module/` 等业务目录（业务在 `pages/` 和 `stores/modules/`）
❌ **不要** 把每个 API 接口放一个文件（按业务模块聚合到 `api/modules/<module>.ts`）
