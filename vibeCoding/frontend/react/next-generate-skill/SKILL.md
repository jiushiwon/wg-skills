---
name: next-generate-skill
description: 当用户要创建 Next.js 14+（React 生态的全栈框架，非 Vue 的 Nuxt）App Router + TypeScript + Zustand 全栈项目时使用。引导完成需求澄清、项目初始化、SSR/RSC 配置、请求层集成、API Routes、认证中间件、后置验证。严格对齐 frontend-request-skill 请求层规范。触发词："帮我做一个 Next.js 项目"、"初始化 Next.js 模板"、"用 Next.js 做一个 SSR 网站"、"做一个 Next.js 后台管理系统"。注意：Next.js ≠ Nuxt，如用户提到 Nuxt 请使用 nuxt-generate-skill。
---

# Next.js Generate Skill

## When to Use

- 用户明确提到 **Next.js / Next / Nextjs**
- 需要 **SSR / SSG / ISR / RSC** 渲染模式
- 需要 **SEO 优化**（企业官网、内容站、营销页）
- 需要 **API Routes**（前后端同仓库）
- 需要认证中间件的**全栈项目**

## When NOT to Use

- 纯 SPA（无 SSR 需求）→ 使用 `react-generate-skill`
- Vue / Nuxt 生态 → 使用 `nuxt-generate-skill`
- 移动端 App → 使用 `react-native-generate-skill`
- 小程序 → 使用 `uniapp-app-generate-skill`
- Pages Router 项目（已过时，不支持）

## 核心能力清单

| 能力 | 说明 |
|------|------|
| 三轨请求策略 | Server fetch / Client request.ts / Server Actions |
| App Router 优先 | Server Components 默认，按需 'use client' |
| API Routes | app/api/ Route Handlers（GET/POST/...） |
| Metadata API | 静态 Metadata + generateMetadata 动态 SEO |
| 认证中间件 | middleware.ts（Edge Runtime）+ cookie 验证 |
| 混合渲染 | RSC 预取数据 + Client Component 交互 |
| Route Groups | (auth) / (dashboard) 分组布局 |
| 环境变量 | .env.local + NEXT_PUBLIC_ 前缀控制 |

## 重要：本 Skill 严格依赖 `frontend-request-skill`

本 Skill **不重新发明请求层**。Client Components 中的 HTTP / 错误处理 / 鉴权相关代码必须复用 `frontend-request-skill` 的标准实现：

| next-generate-skill 输出 | 对应 frontend-request-skill 标准 |
|--------------------------|--------------------------------|
| `lib/api/client.ts` | `references/frontend-spec.md`（fetch 标准实现） |
| `lib/services/auth.service.ts` | `references/auth-patterns.md`（Token 刷新队列） |
| `lib/utils/{error,toast,auth}.ts` | `references/error-handling.md` + `auth-patterns.md` |
| `lib/config/{api,error}.config.ts` | `references/frontend-spec.md`（BASE_URL + ERROR_CODE_MAP） |
| `lib/hooks/useAuth.ts` | `references/auth-patterns.md` |
| 响应信封 `{ code, message, data }` | 与 `各 init-skill 内置的统一响应规范` 一致 |

**接入本 Skill 前，请先阅读 `frontend-request-skill` 的 SKILL.md 与核心 reference。**

---

## Overview

本技能将一个模糊的 Next.js 项目想法转化为生产级的 Next.js 14+ App Router + TypeScript 全栈项目，包含完整的目录结构、Server/Client 组件分层、API Routes、认证中间件和 SEO 策略。

1. **Pre-development**：需求澄清，输出 spec.md
2. **Project Initialization**：脚手架初始化、目录结构、CLAUDE.md、AGENTS.md
3. **Development**：请求层三轨集成、认证中间件、核心页面、API Routes
4. **Post-development**：`next lint` + `next build` 通过

## When to Use

当用户请求以下内容时触发本技能：

- "帮我做一个 Next.js 项目"
- "初始化一个 Next.js 模板"
- "用 Next.js 做一个 SSR 网站"
- "做一个 Next.js 后台管理系统"
- "帮我用 App Router 搭一个全栈项目"
- 任何涉及从零创建 Next.js 14+ App Router 全栈项目的请求

**不适用于**：纯 SPA（用 `react-generate-skill`）/ 移动端（用 `react-native-generate-skill`）/ Pages Router（已过时）

## Workflow Summary

```
Phase 1: Pre-development
  → 询问 3-5 个澄清问题
  → 输出 spec.md（范围、页面、数据模型、API 轮廓）

Phase 2: Project Initialization
  → npx create-next-app@latest 初始化
  → 创建标准目录结构（app/、lib/、components/、stores/、types/）
  → 生成 CLAUDE.md（≤ 50 行，声明依赖 frontend-request-skill）
  → 生成 AGENTS.md（≤ 400 行，按主题分章节）
  → 配置 next.config.js / tsconfig.json
  → 复制 code-examples/（types / stores / components / app/）

Phase 3: Development
  → 安装 frontend-request-skill 的 Client 请求层（lib/api/client.ts）
  → 创建 Server 请求层（lib/api/server.ts）
  → 配置 Server Actions（lib/actions/）
  → 实现认证中间件（middleware.ts）
  → 实现核心页面（混合 Server/Client Component）
  → 实现 API Routes（app/api/）

Phase 4: Post-development
  → next lint           # 必须 0 error
  → next build          # 必须构建成功
  → 总结交付物
```

## Phase 1: Pre-development

### 1.1 Brainstorming Questions

询问 3-5 个聚焦问题：

1. "这个项目解决什么问题？核心目标用户是谁？"
2. "主要功能有哪些？请列出 3-5 个核心页面或核心流程。"
3. "你倾向哪种视觉风格？清新健康 / 极简工具 / 活泼社区 / 商务数据？"
4. "UI 库偏好？Ant Design / Shadcn UI / Tailwind CSS / Radix UI？"
5. "是否需要登录、权限、用户系统？需要哪些 SEO 优化？"

### 1.2 Write spec.md

创建 `spec.md`：

```markdown
# {{PROJECT_NAME}} 项目规格说明

## 1. 项目定位
- 产品名称：
- 目标用户：
- 核心价值：
- 对标产品：

## 2. 核心功能
1. ...
2. ...
3. ...

## 3. 页面清单
| 页面 | 路由 | 渲染策略 | 说明 |
|------|------|---------|------|
| 首页 | app/page.tsx | RSC | SSR 静态首页 |
| 登录 | app/(auth)/login/page.tsx | Client | 客户端交互 |
| 用户管理 | app/(dashboard)/users/page.tsx | RSC + Client | 服务端预取 + 客户端交互 |

## 4. 数据模型
- User: { id, username, nickname, avatar, role, tenantId, createdAt }
- ...

## 5. API 轮廓
- POST /api/auth/login → { token, refreshToken, user }
- GET /api/users → { items, total }
- ...

## 6. 设计风格
- 风格：极简工具 / 商务数据 / ...
- 主色：#10b981
- UI 库：Ant Design 5.x
- 是否深色：否
```

## Phase 2: Project Initialization

### 2.1 Create the Next.js Project

```bash
npx create-next-app@latest {{project-name}} \
  --typescript \
  --tailwind {{按需}} \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm

cd {{project-name}}

# 状态管理
npm install zustand

# UI 库（Ant Design 默认）
npm install antd @ant-design/icons

# 工具
npm install -D @types/node
```

### 2.2 Apply tsconfig.json (STRICT MODE)

```jsonc
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2.3 Apply next.config.js

**按 `references/next-config-template.md` 完整配置**，包含 images、rewrites、headers。

### 2.4 Create Standard Directory Structure

**按 `references/project-structure.md` 创建完整目录**。关键差异（对比 react-generate-skill）：

```
src/
├── app/                    # App Router 文件系统路由
│   ├── layout.tsx         # 根 Layout（Server Component）
│   ├── page.tsx           # 首页（Server Component）
│   ├── loading.tsx        # 全局 Loading UI
│   ├── error.tsx          # 全局错误边界
│   ├── not-found.tsx      # 404 页面
│   ├── (auth)/            # 认证路由组（无侧边栏）
│   │   └── login/page.tsx
│   ├── (dashboard)/       # 仪表盘路由组（有侧边栏）
│   │   ├── layout.tsx     # Dashboard Layout（Client Component）
│   │   └── users/page.tsx
│   └── api/               # Route Handlers
│       ├── auth/login/route.ts
│       └── users/route.ts
├── lib/                    # 工具库（Next.js 惯用 lib/）
│   ├── api/               # 请求层
│   │   ├── client.ts      # Client Components 用（复用 frontend-request-skill）
│   │   └── server.ts      # Server Components 用（Next.js fetch）
│   ├── actions/           # Server Actions
│   ├── services/          # 业务服务
│   ├── config/            # 配置
│   ├── utils/             # 工具函数
│   └── hooks/             # 自定义 Hooks（仅 Client 用）
├── components/             # 共享组件
├── stores/                 # Zustand（仅 Client 用）
├── types/                  # TypeScript 类型
├── styles/                 # 全局样式
└── public/                 # 静态资源
middleware.ts               # 认证中间件（项目根目录）
```

### 2.5 Install Request Layer（三轨策略）

**核心差异**：Next.js 有三种请求场景，严格按 `references/api-integration.md` 配置：

| 场景 | 文件 | 策略 |
|------|------|------|
| Server Components | `lib/api/server.ts` | Next.js 扩展的 fetch + `{ next: { revalidate } }` |
| Client Components | `lib/api/client.ts` | 复用 frontend-request-skill 的 request.ts |
| Server Actions | `lib/actions/*.ts` | `'use server'` 指令，替代 POST 请求 |

**禁止**：
- ❌ 在 Server Components 中使用 `lib/api/client.ts`（会报错：localStorage 在服务端不存在）
- ❌ 在 Client Components 中直接用 fetch（必须复用 `lib/api/client.ts`）
- ❌ 在组件里直接调 `localStorage`（走 `lib/utils/auth.ts`）

### 2.6 Generate CLAUDE.md (<= 50 lines)

**必须用 `references/claude-md-template.md` 模板**。

### 2.7 Generate AGENTS.md (<= 400 lines)

**按 `references/agents-md-template.md`**。按主题拆分章节。

### 2.8 Copy Code Examples

从 `references/code-examples/` 复制：

| 文件 | 必须 | 说明 |
|------|------|------|
| `types/api.ts` | 是 | 全局 API 类型 |
| `types/user.ts` | 按需 | 业务类型 |
| `stores/userStore.ts` | 是 | 用户 store（含 token） |
| `stores/appStore.ts` | 是 | 全局 app 状态 |
| `components/AppLayout.tsx` | 是 | 全局布局（Client Component） |
| `app/layout.tsx` | 是 | 根 Layout（Server Component） |
| `app/(auth)/login/page.tsx` | 是 | 登录页（Client Component） |
| `app/(dashboard)/users/page.tsx` | 是 | 用户列表（混合模式） |
| `app/api/auth/login/route.ts` | 是 | 登录 API |
| `app/api/users/route.ts` | 是 | 用户列表 API |

## Phase 3: Development

### 3.1 Server Components vs Client Components

**默认规则**：不加 `'use client'` 的组件都是 Server Component。

| 场景 | 选择 | 说明 |
|------|------|------|
| 数据获取 | Server Component | 用 `lib/api/server.ts` |
| 静态展示 | Server Component | 不需要交互 |
| 事件处理（onClick 等） | Client Component | 加 `'use client'` |
| 使用 Hooks（useState 等） | Client Component | 加 `'use client'` |
| 使用浏览器 API | Client Component | 加 `'use client'` |
| 使用 Zustand Store | Client Component | 加 `'use client'` |

**最佳实践**：将 Client Component 推到叶子节点，Server Component 尽可能靠近顶层。

### 3.2 Implement Pages

参考 `references/code-examples/` 中的页面实现：

**Server Component 页面**（数据预取）：
```typescript
// app/(dashboard)/users/page.tsx
import { fetchUsers } from '@/lib/api/server';
import { UserTable } from './UserTable';

export default async function UsersPage() {
  const { items, total } = await fetchUsers({ page: 1, pageSize: 10 });

  return <UserTable initialData={items} initialTotal={total} />;
}
```

**Client Component 页面**（交互逻辑）：
```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card } from 'antd';
```

### 3.3 Implement SEO

**按 `references/seo-strategy.md` 配置**：

```typescript
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '首页',
  description: '项目描述',
};

export default function HomePage() { ... }
```

### 3.4 Implement Middleware

**按 `references/middleware-auth.md` 配置**：

```typescript
// middleware.ts（项目根目录）
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

### 3.5 Implement API Routes

参考 `references/code-examples/app/api/` 中的实现。

### 3.6 Shared Components（仅复用 >= 3 次）

参考 `references/component-standards.md`。

## Phase 4: Post-development

### 4.1 Run Lint（必须 0 error）

```bash
npm run lint        # next lint
```

### 4.2 Run Build（必须成功）

```bash
npm run build       # next build
```

**红线**：任何 `.tsx` / `.ts` 文件必须通过构建。

### 4.3 Summarize Deliverables

提供：
1. 项目结构概览
2. 已生成文件清单
3. Server/Client Component 分布
4. SEO 配置状态
5. 中间件配置状态
6. lint / build 状态
7. 与 frontend-request-skill 的对齐清单

## Resources

本 Skill 包含以下参考资料：

| 文件 | 说明 |
|------|------|
| `references/project-structure.md` | 标准目录结构（App Router） |
| `references/claude-md-template.md` | CLAUDE.md 模板（<= 50 行） |
| `references/agents-md-template.md` | AGENTS.md 模板（<= 400 行） |
| `references/api-integration.md` | **必读**：三轨请求层集成指南 |
| `references/next-config-template.md` | next.config.js 完整配置 |
| `references/seo-strategy.md` | SEO 策略（Metadata / sitemap / robots） |
| `references/middleware-auth.md` | 认证中间件配置 |
| `references/next-conventions.md` | Next.js App Router 编码约定 |
| `references/component-standards.md` | 共享组件规范（Server/Client 区分） |
| `references/code-examples/` | **完整代码示例**：types / stores / components / app/ |

外部依赖：

- **frontend-request-skill** — 请求层规范（必装）

## Best Practices

- **复用 frontend-request-skill**：Client Components 不自己写 request.ts。
- **Server Components 优先**：默认不加 `'use client'`，只在需要交互时才加。
- **Server Actions 替代 POST**：表单提交和数据变更优先用 `'use server'`。
- **混合模式**：页面层 RSC 做数据预取，交互部分拆为 Client Component。
- **TypeScript 严格模式**：`strict: true` 全开，`next build` 必须通过。
- **CLAUDE.md <= 50 行**：超出部分移到 AGENTS.md。
- **SEO 必备**：每个页面都要有 Metadata。
- **3 次复用原则**：组件被复用 >= 3 次才抽到 `components/`。
- **middleware.ts 在根目录**：不是 `src/middleware.ts`（除非用了 `--src-dir`）。
- **环境变量**：`.env.local` + `NEXT_PUBLIC_` 前缀控制客户端可见性。

## Red Lines（绝不可违反）

1. ❌ 不用 axios（Server 用 fetch，Client 复用 frontend-request-skill）
2. ❌ 不用 `any` 类型
3. ❌ 不用 `console.log`
4. ❌ 不用 class 组件（必须函数组件 + Hooks）
5. ❌ 不用 `.jsx`（必须 `.tsx`）
6. ❌ 不在 Server Component 中加 `'use client'`（默认就是 Server）
7. ❌ 不滥用 `'use client'`（只在需要交互/浏览器 API 时加）
8. ❌ 不在 Server Component 中使用 `useState` / `useEffect` / `useRouter`
9. ❌ 不在组件里直接调 `localStorage`（走 `lib/utils/auth.ts`）
10. ❌ 不在组件里写 401 跳转（走 `lib/services/auth.service.ts`）
11. ❌ 不用 Pages Router（必须 App Router）
12. ❌ Server Component 中不访问 `window` / `document` / `localStorage`
