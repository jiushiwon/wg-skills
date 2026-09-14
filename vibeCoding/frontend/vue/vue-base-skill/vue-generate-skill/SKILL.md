---
name: vue-generate-skill
description: This skill should be used when the user wants to create a standardized Vue 3 + TypeScript + Vite + Pinia project from scratch. It guides through pre-development brainstorming, project initialization, dynamic theme system setup, layout design, and post-development verification. Strictly aligned with frontend-request-skill for HTTP layer (fetch + response envelope + token refresh queue), frontend conventions, and Vue3 + TypeScript strict mode (vue-tsc --noEmit must pass). Invoke when the user says "帮我做一个 Vue3 项目"、"初始化 Vue3 + TS 模板"、"做一个 Vue 后台管理系统"、"用 Vue3 搭一个 xxx" or similar requests.
---

# Vue Generate Skill

## ⚠️ 重要：本 Skill 严格依赖 `frontend-request-skill`

本 Skill **不重新发明请求层**。所有 HTTP / 错误处理 / 鉴权相关代码必须复用 `frontend-request-skill` 的标准实现：

| vue-generate-skill 输出 | 对应 frontend-request-skill 标准 |
|----------------------|--------------------------------|
| `src/api/request.ts` | `references/frontend-spec.md`（fetch 标准实现） |
| `src/services/auth.service.ts` | `references/auth-patterns.md`（Token 刷新队列） |
| `src/utils/{error,toast,auth}.ts` | `references/error-handling.md` + `auth-patterns.md` |
| `src/config/{api,error}.config.ts` | `references/frontend-spec.md`（BASE_URL + ERROR_CODE_MAP） |
| `src/composables/useAuth.ts` | `references/auth-patterns.md` |
| 响应信封 `{ code, message, data }` | 与 `backend-convention-skill/references/response-format.md` 一致 |

**接入本 Skill 前，请先阅读 `frontend-request-skill` 的 SKILL.md 与核心 reference。**

---

## Overview

This skill transforms a vague Vue project idea into a production-ready Vue 3 + TypeScript SPA with consistent architecture, design tokens, static assets, and coding standards. It follows a four-phase workflow similar to `uniapp-app-generate-skill`, but focused on **pure Vue3 + Vite** (no cross-platform abstractions).

1. **Pre-development**: brainstorm, scope, and produce a detailed specification.
2. **Project initialization**: scaffold the project, directory structure, CLAUDE.md, AGENTS.md, tsconfig.json, vite.config.ts.
3. **Development**: install frontend-request-skill's request layer, set up theme system, design the layout, and build core pages.
4. **Post-development**: lint, type-check (vue-tsc --noEmit), verify the build.

## When to Use

Invoke this skill when the user asks for:

- "帮我做一个 Vue3 项目"
- "初始化一个 Vue3 + TypeScript 模板"
- "做一个 Vue 后台管理系统"
- "用 Vue3 搭一个 xxx 网站"
- "帮我生成一个标准的 Vue3 项目结构"
- Any request that involves creating a new Vue 3 SPA from scratch (H5 / 后台 / 文档站)

**Not for**: uniapp / 小程序 / Taro / 移动端 hybrid — use `uniapp-app-generate-skill` instead.

## Workflow Summary

```
Phase 1: Pre-development
  → Ask 3-5 clarifying questions
  → Write spec.md (scope, pages, data model, API outline)

Phase 2: Project Initialization
  → create-vue scaffold
  → Replace placeholders
  → Create standard directory structure (including src/api/, src/services/, src/config/)
  → Generate CLAUDE.md (≤ 50 lines, references frontend-request-skill)
  → Generate AGENTS.md (≤ 400 lines, on-demand references)
  → Apply tsconfig.json strict template
  → Apply vite.config.ts template (path alias + auto-import + Element Plus)
  → Copy code-examples/ (types / stores / components / views)

Phase 3: Development
  → Install frontend-request-skill's request layer (copy from references/)
  → Configure src/config/api.config.ts (BASE_URL / PREFIX / SUCCESS_CODES)
  → Configure src/config/error.config.ts (ERROR_CODE_MAP)
  → Set up src/styles/tokens.css theme variables
  → Implement core pages using code-examples/ as template
  → Write composables (useAuth, useTable, ...)

Phase 4: Post-development
  → npm run lint           # ESLint must pass
  → npm run type-check     # vue-tsc --noEmit must pass
  → npm run build          # Must build successfully
  → Summarize deliverables
```

## Phase 1: Pre-development

### 1.1 Brainstorming Questions

Ask 3-5 focused questions:

1. "这个项目解决什么问题？核心目标用户是谁？"
2. "主要功能有哪些？请列出 3-5 个核心页面或核心流程。"
3. "你倾向哪种视觉风格？清新健康 / 极简工具 / 活泼社区 / 商务数据？"
4. "UI 库偏好？Element Plus / Naive UI / Ant Design Vue / 自研？"
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
| 首页/Dashboard | src/views/Dashboard.vue | ... |

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
- UI 库：Element Plus 2.x
- 是否深色：否
```

## Phase 2: Project Initialization

### 2.1 Create the Vue Project

```bash
npm create vue@latest {{project-name}} -- --typescript --router --pinia --eslint --prettier
cd {{project-name}}
npm install

# Element Plus（默认）
npm install element-plus @element-plus/icons-vue

# 工具
npm install -D @types/node unplugin-auto-import unplugin-vue-components
```

### 2.2 Apply tsconfig.json (STRICT MODE)

**必须按 `references/tsconfig-template.md` 完整配置**：

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "useUnknownInCatchVariables": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "Bundler",
    "paths": {
      "@/*": ["src/*"]
    },
    "noEmit": true
  }
}
```

### 2.3 Apply vite.config.ts

**按 `references/vite-config-template.md` 完整配置**：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ imports: ['vue', 'vue-router', 'pinia'], dts: 'src/auto-imports.d.ts' }),
    Components({ resolvers: [ElementPlusResolver()], dts: 'src/components.d.ts' }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
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
│   ├── _mocks_/
│   └── modules/
├── services/
│   └── auth.service.ts
├── config/
│   ├── api.config.ts
│   └── error.config.ts
├── stores/modules/   # Pinia Setup 风格
├── composables/      # useAuth 等
├── views/            # 页面
├── types/api.ts      # ApiResponse<T> / RequestError
└── utils/            # auth.ts / error.ts / toast.ts
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
| `src/composables/useAuth.ts` | `references/api-integration.md` § 8 | ✅ |
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

**按 `references/agents-md-template.md`**。按主题拆分 13 章节，AI 按需查阅。

### 2.8 Copy Code Examples

从 `references/code-examples/` 复制：

| 文件 | 必须 | 说明 |
|------|------|------|
| `types/api.ts` | ✅ | 全局 API 类型 |
| `types/user.ts` | 按需 | 业务类型（按项目实际调整） |
| `stores/user.ts` | ✅ | 用户 store（含 token） |
| `stores/app.ts` | ✅ | 全局 app 状态 |
| `components/AppLayout.vue` | ✅ | 全局布局 |
| `views/Login.vue` | ✅ | 登录页 |
| `views/UserManagement.vue` | ✅ | 列表/分页/CRUD 参考 |

## Phase 3: Development

### 3.1 Set Up the Theme System

按 `SKILL.md § 3.1` 创建 `src/styles/tokens.css`（CSS 变量）。

### 3.2 Implement Pages

参考 `references/code-examples/views/UserManagement.vue` 的结构：

```typescript
<script setup lang="ts">
// 1. 类型导入
import type { User, UserListParams } from '@/types/user';

// 2. 响应式状态
const loading = ref(false);
const tableData = ref<User[]>([]);

// 3. 业务方法（全部用 async/await + try/catch + unknown）
async function loadData() {
  loading.value = true;
  try {
    const res = await userApi.list(query);
    tableData.value = res.data.items;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      showError(err);
    }
  } finally {
    loading.value = false;
  }
}
</script>
```

### 3.3 Implement State Management

参考 `references/code-examples/stores/user.ts`：

- ✅ Setup Store 风格
- ✅ State 用 `ref`
- ✅ Getters 用 `computed<T>(...)`
- ✅ Actions 普通函数
- ✅ 显式返回所有成员
- ✅ 提供 `$reset`

### 3.4 Shared Components（仅复用 ≥3 次）

参考 `references/component-standards.md`。

## Phase 4: Post-development

### 4.1 Run Type Check（必须 0 error）

```bash
npm run type-check    # vue-tsc --noEmit
```

**红线**：任何 `.vue` 文件的 `<script setup lang="ts">` 块必须通过类型检查。

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
| `references/vite-config-template.md` | vite.config.ts + 路由 + 入口完整配置 |
| `references/vue-conventions.md` | Vue 3 + TS 编码约定（Composition API） |
| `references/component-standards.md` | 共享组件规范（3 次复用原则） |
| `references/code-examples/` | **完整代码示例**：types / stores / components / views |

外部依赖：

- **frontend-request-skill** — 请求层规范（必装）

## Best Practices

- **复用 frontend-request-skill**：不自己写 request.ts、不在组件里调 localStorage、不在组件里写 401 跳转。
- **TypeScript 严格模式**：`strict: true` 全开，提交前必须 `vue-tsc --noEmit` 通过。
- **CLAUDE.md ≤ 50 行**：超出部分移到 AGENTS.md。
- **CSS 变量优先**：业务代码只用 `var(--color-*)`，禁止裸色值。
- **Element Plus 优先**：能用的组件就用，不手写。
- **3 次复用原则**：组件被复用 ≥3 次才抽到 `src/components/`。
- **Setup Store**：Pinia 必须用 Setup 风格，不用 Options Store。
- **`<script setup lang="ts">` 全开**：每个 `.vue` 文件必须带 `lang="ts"`。
- **请求层严格分层**：`api/` 只管 HTTP / `services/` 收口业务 / `composables/` 给组件用。
- **错误捕获用 `unknown`**：不用 `any`，必要时用类型守卫。
- **完成必跑 3 件套**：`type-check` + `lint` + `build`，全部 0 error。

## Red Lines（绝不可违反）

1. ❌ 不用 axios（必须 fetch）
2. ❌ 不用 `any` 类型
3. ❌ 不用 `console.log`
4. ❌ 不用 Options API
5. ❌ 不用 `lang="ts"` 缺失
6. ❌ 不用裸色值
7. ❌ 不手写 Element Plus 已有的组件
8. ❌ 不在组件里直接调 `localStorage`
9. ❌ 不在组件里写 401 跳转
10. ❌ 不用 ESLint 规则覆盖 TypeScript 检查
