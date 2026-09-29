# CLAUDE.md 模板

以下为 Nuxt 3 项目的 CLAUDE.md 模板，复制后根据实际项目调整。

---

```markdown
# {项目名}

## 技术栈
- Nuxt 3 + Vue 3 Composition API + TypeScript（strict）
- Pinia Setup Store + useCookie/useState SSR 安全存储
- Element Plus（或 Nuxt UI）
- 请求层：frontend-request-skill 规范

## 关键红线
1. 禁止使用 axios — 统一使用 request.ts / $fetch
2. 禁止 `any` — 使用 `unknown` + 类型收窄
3. 禁止 Options API — 全部使用 `<script setup>` + Composition API
4. SSR 安全 — 禁止在 setup 中访问 window/document/localStorage
5. 服务端代码禁止 import 客户端模块
6. 禁止 `process.env` — 使用 `useRuntimeConfig()`

## 目录约定
- `pages/` — 文件系统路由
- `components/` — 自动导入组件（PascalCase）
- `composables/` — 有状态逻辑（use 前缀，自动导入）
- `utils/` — 无状态工具函数（自动导入）
- `server/api/` — BFF API 路由
- `server/middleware/` — 服务端中间件
- `types/` — TypeScript 类型定义

## 请求层
- 客户端：`utils/request.ts`（frontend-request-skill 规范）
- 服务端：`$fetch` + `useRuntimeConfig().apiBase`
- 统一封装：`utils/request-ssr.ts`

## 依赖技能
- frontend-request-skill — 请求层规范
- vue-base-skill — 基础组件复用
```
