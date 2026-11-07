# AGENTS.md 模板

以下为 Nuxt 3 项目的 AGENTS.md 模板，按主题分章节。复制后根据实际项目调整，控制在 400 行以内。

---

```markdown
# AGENTS.md — {项目名}

## 一、项目概述

{项目名} 是基于 Nuxt 3 的全栈 Web 应用，采用 SSR 渲染模式。

- 前端框架：Nuxt 3 + Vue 3 Composition API
- 状态管理：Pinia Setup Store
- UI 组件库：Element Plus
- 类型系统：TypeScript strict mode
- 请求层：frontend-request-skill 规范

## 二、目录结构

| 目录 | 职责 |
|------|------|
| pages/ | 文件系统路由 |
| components/ | 自动导入组件 |
| composables/ | 有状态组合函数 |
| utils/ | 无状态工具函数 |
| layouts/ | 布局组件 |
| middleware/ | 路由中间件 |
| server/api/ | BFF API 路由 |
| server/middleware/ | 服务端中间件 |
| server/utils/ | 服务端工具函数 |
| types/ | 类型定义 |
| stores/ | Pinia Store |
| plugins/ | Nuxt 插件 |
| assets/ | 构建资源 |
| public/ | 静态资源 |

## 三、技术栈

### 核心
- Nuxt 3.12+
- Vue 3.4+ Composition API
- TypeScript 5.x strict
- Pinia 2.x Setup Store
- Node.js 18+

### UI & 样式
- Element Plus（或 Nuxt UI）
- SCSS / CSS Variables

### 请求层
- 客户端：原生 fetch 封装（frontend-request-skill）
- 服务端：Nuxt $fetch
- BFF 层：server/api/ 代理 + 鉴权

### 工程化
- ESLint + @nuxt/eslint-config
- Prettier
- Husky + lint-staged

## 四、开发规范

### 4.1 TypeScript
- strict: true
- 禁止 any（使用 unknown + 类型收窄）
- 接口定义放在 types/ 目录
- 组件 Props 使用 interface + defineProps

### 4.2 组件
- 全部使用 <script setup lang="ts">
- 禁止 Options API
- 组件文件名 PascalCase
- 模板中使用 PascalCase
- 3 次复用提取公共组件

### 4.3 路由
- pages/ 目录即路由，禁止手动配置路由
- 使用 definePageMeta 设置中间件和布局
- 动态路由用 [param] 命名

### 4.4 状态管理
- Pinia Setup Store
- 客户端状态用 useCookie / useState
- SSR 安全：不在 setup 中直接访问 localStorage

### 4.5 样式
- 组件样式 scoped
- BEM 命名
- 全局变量放 assets/styles/variables
- 颜色/间距使用 CSS 自定义属性

### 4.6 SSR 安全
- 禁止在 setup 中访问 window/document
- 涉及 DOM 的组件用 <ClientOnly> 包裹
- 使用 import.meta.client / import.meta.server 判断环境
- useState 替代 ref 做 SSR 状态同步

## 五、请求层规范

### 客户端请求
- 使用 utils/request.ts（复用 frontend-request-skill）
- Token 从 useCookie('auth_token') 获取
- 统一响应信封 ApiResponse<T>

### 服务端请求
- 使用 $fetch + useRuntimeConfig().apiBase
- Token 从 getCookie(event, 'auth_token') 获取
- 错误使用 createError 抛出

### BFF API 路由
- server/api/ 做后端代理
- 统一鉴权（server/middleware/auth.ts）
- 参数校验 → 转发到真实后端 → 返回结果

## 六、提交规范

### Commit 格式
```
<type>(<scope>): <description>
```

### Type
- feat: 新功能
- fix: 修复
- refactor: 重构
- docs: 文档
- style: 样式
- test: 测试
- chore: 构建/工具

### Scope
- 页面：page:login, page:users
- 组件：component:table
- API：api:auth, api:users
- Store：store:user
- Config：config:nuxt

## 七、环境变量

使用 runtimeConfig 管理，禁止直接读取 process.env：

```typescript
// nuxt.config.ts
runtimeConfig: {
  apiBase: '',          // 服务端
  public: {
    appName: '',        // 客户端 + 服务端
  },
}
```

## 八、输出要求

- 所有注释和文档使用中文
- 代码提交前必须通过 `nuxt typecheck`
- 新增页面必须设置 title（useHead / useSeoMeta）
- 需要登录的页面必须设置 middleware: 'auth'
- API 路由必须做参数校验和错误处理
```
