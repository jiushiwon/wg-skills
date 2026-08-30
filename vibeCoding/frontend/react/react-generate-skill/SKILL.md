---
name: react-init-skill
description: This skill should be used when the user wants to create a standardized React 18 + TypeScript + Vite + Zustand project from scratch. It guides through pre-development brainstorming, project initialization, dynamic theme system setup, layout design, and post-development verification. Strictly aligned with frontend-request-skill for HTTP layer (fetch + response envelope + token refresh queue), frontend conventions, and React 18 + TypeScript strict mode (tsc --noEmit must pass). Invoke when the user says "帮我做一个 React 项目"、"初始化 React + TS 模板"、"做一个 React 后台管理系统"、"用 React 搭一个 xxx" or similar requests.
---

# React Generate Skill

## ⚠️ 重要：本 Skill 严格依赖 `frontend-request-skill`

本 Skill **不重新发明请求层**。所有 HTTP / 错误处理 / 鉴权相关代码必须复用 `frontend-request-skill` 的标准实现：

| react-init-skill 输出 | 对应 frontend-request-skill 标准 |
|----------------------|--------------------------------|
| `src/api/request.ts` | `references/frontend-spec.md`（fetch 标准实现） |
| `src/services/auth.service.ts` | `references/auth-patterns.md`（Token 刷新队列） |
| `src/utils/{error,toast,auth}.ts` | `references/error-handling.md` + `auth-patterns.md` |
| `src/config/{api,error}.config.ts` | `references/frontend-spec.md`（BASE_URL + ERROR_CODE_MAP） |
| `src/hooks/useAuth.ts` | `references/auth-patterns.md` |
| 响应信封 `{ code, message, data }` | 与 `backend-convention-skill/references/response-format.md` 一致 |

**接入本 Skill 前，请先阅读 `frontend-request-skill` 的 SKILL.md 与核心 reference。**

---

## Overview

This skill transforms a vague React project idea into a production-ready React 18 + TypeScript SPA with consistent architecture, design tokens, static assets, and coding standards.

1. **Pre-development**: brainstorm, scope, and produce a detailed specification.
2. **Project initialization**: scaffold the project, directory structure, CLAUDE.md, AGENTS.md, tsconfig.json, vite.config.ts.
3. **Development**: install frontend-request-skill's request layer, set up theme system, design the layout, and build core pages.
4. **Post-development**: lint, type-check (tsc --noEmit), verify the build.

## When to Use

Invoke this skill when the user asks for:

- "帮我做一个 React 项目"
- "初始化一个 React + TypeScript 模板"
- "做一个 React 后台管理系统"
- "用 React 搭一个 xxx 网站"
- "帮我生成一个标准的 React 项目结构"
- Any request that involves creating a new React SPA from scratch (H5 / 后台 / 文档站)

**Not for**: React Native / 小程序 / Taro / 移动端 hybrid — use `react-native-init-skill` instead.

## Workflow Summary

```
Phase 1: Pre-development
  → Ask 3-5 clarifying questions
  → Write spec.md (scope, pages, data model, API outline)

Phase 2: Project Initialization
  → npm create vite@latest scaffold
  → Replace placeholders
  → Create standard directory structure (including src/api/, src/services/, src/config/)
  → Generate CLAUDE.md (≤ 50 lines, references frontend-request-skill)
  → Generate AGENTS.md (≤ 400 lines, on-demand references)
  → Apply tsconfig.json strict template
  → Apply vite.config.ts template (path alias + auto-import)
  → Copy code-examples/ (types / stores / components / pages)

Phase 3: Development
  → Install frontend-request-skill's request layer (copy from references/)
  → Configure src/config/api.config.ts (BASE_URL / PREFIX / SUCCESS_CODES)
  → Configure src/config/error.config.ts (ERROR_CODE_MAP)
  → Set up src/styles/globals.css theme variables
  → Implement core pages using code-examples/ as template
  → Write hooks (useAuth, useFetch, ...)

Phase 4: Post-development
  → npm run lint           # ESLint must pass
  → npm run type-check     # tsc --noEmit must pass
  → npm run build          # Must build successfully
  → Summarize deliverables
```

## Phase 1: Pre-development

### 1.1 Brainstorming Questions

Ask 3-5 focused questions:

1. "这个项目解决什么问题？核心目标用户是谁？"
2. "主要功能有哪些？请列出 3-5 个核心页面或核心流程。"
3. "你倾向哪种视觉风格？清新健康 / 极简工具 / 活泼社区 / 商务数据？"
4. "UI 库偏好？Ant Design / Material UI / Chakra UI / Radix UI / 自研？"
5. "是否需要登录、权限、用户系统？"

### 1.2 Write spec.md

Create `spec.md` with:

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
| 页面 | 路径 | 说明 |
|------|------|------|
| 首页/Dashboard | src/pages/Dashboard.tsx | ... |

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

### 2.1 Create the React Project

```bash
npm create vite@latest {{project-name}} -- --template react-ts
cd {{project-name}}
npm install

# 状态管理
npm install zustand

# UI 库（Ant Design 默认）
npm install antd @ant-design/icons

# 路由
npm install react-router-dom

# 工具
npm install -D @types/node
```

### 2.2 Apply tsconfig.json (STRICT MODE)

**必须按 `references/tsconfig-template.md` 完整配置**：

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.3 Apply vite.config.ts

**按 `references/vite-config-template.md` 完整配置**：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

### 2.4 Create Standard Directory Structure

按 `references/project-structure.md` 创建完整目录。**关键目录**：

```
src/
├── api/              # 必须按 frontend-request-skill 划分
│   ├── request.ts
│   ├── upload.ts
│   ├── sse.ts (按需)
│   └── modules/
├── services/
│   └── auth.service.ts
├── config/
│   ├── api.config.ts
│   └── error.config.ts
├── stores/           # Zustand Store
│   ├── userStore.ts
│   └── appStore.ts
├── hooks/           # useAuth, useFetch 等
├── pages/            # 页面（不是 views）
├── components/       # 组件
├── types/           # ApiResponse<T> / RequestError
├── utils/           # auth.ts / error.ts / toast.ts
└── styles/          # 全局样式
```

### 2.5 Install frontend-request-skill's Request Layer

**严格按 `references/api-integration.md` 复制以下文件**：

| 目标文件 | 来源 | 必须 |
|----------|------|------|
| `src/api/request.ts` | `references/api-integration.md` § 3 | ✅ |
| `src/services/auth.service.ts` | `references/api-integration.md` § 4 | ✅ |
| `src/utils/auth.ts` | `references/api-integration.md` § 5 | ✅ |
| `src/utils/error.ts` | `references/api-integration.md` § 6 | ✅ |
| `src/utils/toast.ts` | `references/api-integration.md` § 7 | ✅ |
| `src/hooks/useAuth.ts` | `references/api-integration.md` § 8 | ✅ |
| `src/config/api.config.ts` | `references/api-integration.md` § 2.2 | ✅ |
| `src/config/error.config.ts` | `references/api-integration.md` § 2.2 | ✅ |
| `src/types/api.ts` | `references/code-examples/types/api.ts` | ✅ |
| `src/types/user.ts` | `references/code-examples/types/user.ts` | 按需 |

**禁止**：
- ❌ 自己写 request.ts（必须按标准复制）
- ❌ 在组件里直接调 `localStorage`（必须走 `utils/auth.ts`）
- ❌ 在组件里写 401 处理（必须交给 `auth.service.ts`）

### 2.6 Generate CLAUDE.md (≤ 50 lines)

**必须用 `references/claude-md-template.md` 模板**，强制 ≤ 50 行。

模板已包含：
- 显式声明依赖 `frontend-request-skill`
- 9 条红线（含 fetch 标准、auth.service 收口）
- 完整的目录约定

### 2.7 Generate AGENTS.md (≤ 400 lines)

**按 `references/agents-md-template.md`**。按主题拆分章节，AI 按需查阅。

### 2.8 Copy Code Examples

从 `references/code-examples/` 复制：

| 文件 | 必须 | 说明 |
|------|------|------|
| `types/api.ts` | ✅ | 全局 API 类型 |
| `types/user.ts` | 按需 | 业务类型（按项目实际调整） |
| `stores/userStore.ts` | ✅ | 用户 store（含 token） |
| `stores/appStore.ts` | ✅ | 全局 app 状态 |
| `components/AppLayout.tsx` | ✅ | 全局布局 |
| `pages/Login.tsx` | ✅ | 登录页 |
| `pages/UserManagement.tsx` | ✅ | 列表/分页/CRUD 参考 |

## Phase 3: Development

### 3.1 Set Up the Theme System

按 `SKILL.md § 3.1` 创建 `src/styles/globals.css`（CSS 变量或 Ant Design ConfigProvider）。

### 3.2 Implement Pages

参考 `references/code-examples/pages/UserManagement.tsx` 的结构：

```typescript
import { useState, useEffect } from 'react';
import type { User, UserListParams } from '@/types/user';

export function UserManagement() {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<User[]>([]);

  // 业务方法（全部用 async/await + try/catch + unknown）
  async function loadData() {
    setLoading(true);
    try {
      const res = await userApi.list(query);
      setTableData(res.data.items);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        showError(err);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);
}
```

### 3.3 Implement State Management

参考 `references/code-examples/stores/userStore.ts`：

- ✅ Zustand 风格
- ✅ 使用 `create`
- ✅ 显式导出 store
- ✅ 提供 reset 方法

### 3.4 Shared Components（仅复用 ≥3 次）

参考 `references/component-standards.md`。

## Phase 4: Post-development

### 4.1 Run Type Check（必须 0 error）

```bash
npm run type-check    # tsc --noEmit
```

**红线**：任何 `.tsx` / `.ts` 文件必须通过类型检查。

### 4.2 Run Lint（必须 0 error）

```bash
npm run lint
```

### 4.3 Run Build

```bash
npm run build    # 自动先跑 type-check，再 vite build
```

### 4.4 Summarize Deliverables

提供：
1. 项目结构概览
2. 已生成文件清单
3. 主题色 / UI 库选择
4. type-check / lint / build 状态
5. 与 frontend-request-skill 的对齐清单

## Resources

本 Skill 包含以下参考资料：

| 文件 | 说明 |
|------|------|
| `references/project-structure.md` | 标准目录结构（对齐 frontend-request-skill） |
| `references/claude-md-template.md` | CLAUDE.md 模板（≤ 50 行） |
| `references/agents-md-template.md` | AGENTS.md 模板（≤ 400 行，按主题） |
| `references/api-integration.md` | **必读**：与 frontend-request-skill 集成的完整指南 |
| `references/tsconfig-template.md` | tsconfig.json 严格模式完整配置 |
| `references/vite-config-template.md` | vite.config.ts 完整配置 |
| `references/react-conventions.md` | React 18 + TS 编码约定 |
| `references/component-standards.md` | 共享组件规范（3 次复用原则） |
| `references/code-examples/` | **完整代码示例**：types / stores / components / pages |

外部依赖：

- **frontend-request-skill** — 请求层规范（必装）

## Best Practices

- **复用 frontend-request-skill**：不自己写 request.ts、不在组件里调 localStorage、不在组件里写 401 跳转。
- **TypeScript 严格模式**：`strict: true` 全开，提交前必须 `tsc --noEmit` 通过。
- **CLAUDE.md ≤ 50 行**：超出部分移到 AGENTS.md。
- **CSS 变量优先**：业务代码只用 CSS 变量，禁止裸色值。
- **Ant Design 优先**：能用的组件就用，不手写。
- **3 次复用原则**：组件被复用 ≥3 次才抽到 `src/components/`。
- **Hooks 提取逻辑**：可复用的逻辑抽到 `src/hooks/`。
- **每个组件文件带 `lang="ts"`**：`.tsx` 文件必须带类型。
- **请求层严格分层**：`api/` 只管 HTTP / `services/` 收口业务 / `hooks/` 给组件用。
- **错误捕获用 `unknown`**：不用 `any`，必要时用类型守卫。
- **完成必跑 3 件套**：`type-check` + `lint` + `build`，全部 0 error。

## Red Lines（绝不可违反）

1. ❌ 不用 axios（必须 fetch）
2. ❌ 不用 `any` 类型
3. ❌ 不用 `console.log`
4. ❌ 不用 class 组件（必须函数组件 + Hooks）
5. ❌ 不用 `.jsx`（必须 `.tsx`）
6. ❌ 不用裸色值
7. ❌ 不手写 Ant Design 已有的组件
8. ❌ 不在组件里直接调 `localStorage`
9. ❌ 不在组件里写 401 跳转
10. ❌ 不用 ESLint 规则覆盖 TypeScript 检查
