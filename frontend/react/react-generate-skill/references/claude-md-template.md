# {{PROJECT_NAME}}

> {{PROJECT_DESC}}

## 技术栈

- React 18 + TypeScript
- Vite 5
- Zustand（状态管理）
- Ant Design 5.x（UI 组件库）
- React Router 6（路由）

## 依赖

- **frontend-request-skill**：HTTP 请求层规范（fetch + 响应信封 + Token 刷新队列）

## 红线

1. ❌ 不用 axios（必须 fetch）
2. ❌ 不用 `any` 类型
3. ❌ 不用 `console.log`
4. ❌ 不用 class 组件（必须函数组件 + Hooks）
5. ❌ 不用 `.jsx`（必须 `.tsx`）
6. ❌ 不用裸色值（使用 CSS 变量）
7. ❌ 不手写 Ant Design 已有的组件
8. ❌ 不在组件里直接调 `localStorage`（走 `utils/auth.ts`）
9. ❌ 不在组件里写 401 跳转（走 `services/auth.service.ts`）

## 目录约定

```
src/
├── api/           # 请求层（复用 frontend-request-skill）
├── config/        # 静态配置
├── services/     # 业务服务
├── stores/       # Zustand Store
├── hooks/        # 自定义 Hooks
├── components/   # 业务组件
├── pages/        # 页面
├── types/        # 类型定义
├── utils/        # 工具函数
└── styles/      # 全局样式
```

## 提交前必跑

```bash
npm run lint      # ESLint 0 error
npm run type-check  # tsc --noEmit 0 error
npm run build     # 构建成功
```
