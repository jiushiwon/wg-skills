# {{PROJECT_NAME}}

> {{PROJECT_DESC}}

## 技术栈

- Next.js 14+ (App Router) + React 18 + TypeScript
- Zustand（Client 侧状态管理）
- Ant Design 5.x（UI 组件库）

## 依赖

- **frontend-request-skill**：Client Components HTTP 请求层规范（fetch + 响应信封 + Token 刷新队列）

## 红线

1. ❌ 不用 axios（Server 用 fetch，Client 复用 frontend-request-skill）
2. ❌ 不用 `any` 类型
3. ❌ 不用 `console.log`
4. ❌ 不用 class 组件（必须函数组件 + Hooks）
5. ❌ Server Component 不加 `'use client'`（默认就是 Server）
6. ❌ 不滥用 `'use client'`（只在需要交互/浏览器 API 时加）
7. ❌ 不在 Server Component 中使用 `useState` / `useEffect`
8. ❌ 不在组件里直接调 `localStorage`（走 `lib/utils/auth.ts`）
9. ❌ SSR 安全：工具函数必须判断 `typeof window`

## 目录约定

```
src/
├── app/           # App Router（文件系统路由）
├── lib/           # 工具库（api/ / actions/ / services/ / hooks/ / utils/）
├── components/    # 共享组件（仅复用 >= 3 次）
├── stores/        # Zustand（仅 Client 用）
├── types/         # TypeScript 类型
└── styles/        # 全局样式
middleware.ts       # 认证中间件（项目根目录）
```

## 提交前必跑

```bash
npm run lint      # next lint 0 error
npm run build     # next build 成功
```
