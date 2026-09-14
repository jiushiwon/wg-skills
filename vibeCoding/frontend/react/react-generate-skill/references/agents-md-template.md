# {{PROJECT_NAME}} 开发指南

本文件是项目的完整开发规范入口，按主题拆分章节，AI 按需查阅。

---

## 目录

1. [技术栈](#1-技术栈)
2. [项目结构](#2-项目结构)
3. [编码规范](#3-编码规范)
4. [API 调用](#4-api-调用)
5. [状态管理](#5-状态管理)
6. [样式规范](#6-样式规范)
7. [路由配置](#7-路由配置)
8. [提交规范](#8-提交规范)

---

## 1. 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| Zustand | 5.x | 状态管理 |
| Ant Design | 5.x | UI 组件库 |
| React Router | 6.x | 路由 |

---

## 2. 项目结构

```
src/
├── api/              # 请求层（必须复用 frontend-request-skill）
│   ├── request.ts
│   └── modules/
├── config/           # 静态配置
├── services/        # 业务服务
├── stores/          # Zustand
├── hooks/           # 自定义 Hooks
├── components/      # 业务组件
├── pages/           # 页面
├── types/           # 类型
├── utils/           # 工具函数
└── styles/          # 样式
```

详见 `references/project-structure.md`

---

## 3. 编码规范

- **TypeScript 严格模式**：所有 `.tsx` / `.ts` 文件必须通过 `tsc --noEmit`
- **不用 `any`**：使用 `unknown` + 类型守卫
- **不用 `console.log`**：使用日志服务
- **函数组件 + Hooks**：禁止 class 组件
- **CSS 变量**：禁止裸色值，使用 `var(--xxx)`

详见 `references/tsconfig-template.md`

---

## 4. API 调用

必须复用 `frontend-request-skill` 的请求层：

| 文件 | 作用 |
|------|------|
| `src/api/request.ts` | fetch 封装 |
| `src/config/api.config.ts` | BASE_URL 配置 |
| `src/config/error.config.ts` | 错误码映射 |
| `src/services/auth.service.ts` | 登录/登出/Token 刷新 |

详见 `references/api-integration.md`

---

## 5. 状态管理

使用 Zustand：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      login: async () => { /* ... */ },
      logout: () => set({ token: null }),
    }),
    { name: 'user-storage' }
  )
);
```

详见 `references/code-examples/stores/userStore.ts`

---

## 6. 样式规范

- 使用 CSS 模块：`.module.css`
- 使用 CSS 变量：参考 `src/styles/tokens.css`
- 组件样式写到组件目录内

---

## 7. 路由配置

使用 React Router 6：

```typescript
// src/router/routes.ts
export const routes = [
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'users', element: <UserManagement /> },
    ],
  },
];
```

---

## 8. 提交规范

提交前必须运行：

```bash
npm run lint          # ESLint 0 error
npm run type-check    # tsc --noEmit 0 error
npm run build         # 构建成功
```

---

## 参考资料

- `references/project-structure.md` - 项目结构
- `references/tsconfig-template.md` - TS 配置
- `references/vite-config-template.md` - Vite 配置
- `references/code-examples/` - 代码示例
