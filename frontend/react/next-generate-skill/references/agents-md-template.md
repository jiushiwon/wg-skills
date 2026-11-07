# {{PROJECT_NAME}} 开发指南

本文件是项目的完整开发规范入口，按主题拆分章节，AI 按需查阅。

---

## 目录

1. [技术栈](#1-技术栈)
2. [项目结构](#2-项目结构)
3. [Server/Client 组件规范](#3-serverclient-组件规范)
4. [API 调用](#4-api-调用)
5. [Server Actions](#5-server-actions)
6. [状态管理](#6-状态管理)
7. [SEO 配置](#7-seo-配置)
8. [认证中间件](#8-认证中间件)
9. [样式规范](#9-样式规范)
10. [提交规范](#10-提交规范)

---

## 1. 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 14+ | 全栈框架（App Router） |
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Zustand | 5.x | Client 侧状态管理 |
| Ant Design | 5.x | UI 组件库 |

---

## 2. 项目结构

```
src/
├── app/                    # App Router（文件系统路由）
│   ├── layout.tsx          # 根 Layout（Server Component）
│   ├── page.tsx            # 首页
│   ├── (auth)/             # 认证路由组
│   ├── (dashboard)/        # 仪表盘路由组
│   └── api/                # Route Handlers
├── lib/
│   ├── api/                # 请求层（server.ts + client.ts）
│   ├── actions/            # Server Actions
│   ├── services/           # 业务服务
│   ├── config/             # 配置
│   ├── hooks/              # 自定义 Hooks（Client 用）
│   └── utils/              # 工具函数
├── components/             # 共享组件
├── stores/                 # Zustand
├── types/                  # TypeScript 类型
└── styles/                 # 全局样式
middleware.ts               # 认证中间件（根目录）
```

详见 `references/project-structure.md`

---

## 3. Server/Client 组件规范

### 默认规则

- **不加 `'use client'`** = Server Component
- **加了 `'use client'`** = Client Component
- **Server Components**：可 async、可 fetch、可访问 cookies
- **Client Components**：可 useState、可 onClick、可访问浏览器 API

### 选择决策

| 需求 | 渲染方式 |
|------|---------|
| 数据获取 | Server Component |
| 事件处理 | Client Component |
| useState/useEffect | Client Component |
| 浏览器 API | Client Component |
| Zustand Store | Client Component |
| antd 交互组件 | Client Component |

### 最佳实践

- Client Component 尽可能推到叶子节点
- 页面层用 Server Component 做数据预取
- 交互部分拆为独立的 Client Component

详见 `references/next-conventions.md`

---

## 4. API 调用

### 三轨策略

| 场景 | 文件 | 说明 |
|------|------|------|
| Server Components | `lib/api/server.ts` | Next.js fetch + 缓存 |
| Client Components | `lib/api/client.ts` | 复用 frontend-request-skill |
| Server Actions | `lib/actions/*.ts` | 替代 POST 请求 |

### 关键文件

| 文件 | 作用 |
|------|------|
| `lib/api/server.ts` | Server 专用 fetch（ISR 缓存） |
| `lib/api/client.ts` | Client 专用 request.ts |
| `lib/config/api.config.ts` | BASE_URL 配置 |
| `lib/config/error.config.ts` | 错误码映射 |
| `lib/services/auth.service.ts` | 登录/登出/Token 刷新 |

详见 `references/api-integration.md`

---

## 5. Server Actions

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createUser(_prevState: unknown, formData: FormData) {
  // 业务逻辑
  revalidatePath('/users');
  return { success: true };
}
```

**使用场景**：
- 表单提交
- 数据变更（增删改）
- 替代 POST API 调用

---

## 6. 状态管理

使用 Zustand（仅 Client 侧）：

```typescript
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  token: string | null;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      login: async () => { /* ... */ },
      logout: () => set({ token: null }),
    }),
    { name: 'user-storage', storage: createJSONStorage(() => localStorage) }
  )
);
```

详见 `references/code-examples/stores/`

---

## 7. SEO 配置

| 功能 | 实现 |
|------|------|
| 静态 Metadata | `layout.tsx` 导出 `metadata` |
| 动态 Metadata | `page.tsx` 导出 `generateMetadata` |
| Sitemap | `app/sitemap.ts` |
| Robots | `app/robots.ts` |
| JSON-LD | `<script type="application/ld+json">` |

详见 `references/seo-strategy.md`

---

## 8. 认证中间件

```typescript
// middleware.ts（根目录）
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

详见 `references/middleware-auth.md`

---

## 9. 样式规范

- CSS Modules（`.module.css`）为默认方案
- CSS 变量做主题：`var(--color-primary)`
- antd ConfigProvider 覆盖主题
- 全局样式在 `styles/global.css`

---

## 10. 提交规范

提交前必须运行：

```bash
npm run lint          # next lint 0 error
npm run build         # next build 成功
```

---

## 参考资料

- `references/project-structure.md` - 项目结构
- `references/api-integration.md` - 三轨请求层
- `references/next-config-template.md` - 配置模板
- `references/seo-strategy.md` - SEO 策略
- `references/middleware-auth.md` - 认证中间件
- `references/next-conventions.md` - 编码约定
- `references/component-standards.md` - 组件规范
- `references/code-examples/` - 代码示例
