# vue-generate-skill

一个用于 **从零生成标准化 Vue 3 + TypeScript 项目** 的 Claude Skill，纯前端 SPA 方向（后台 / H5 / 文档站 / 工具站）。

---

## 它能做什么

当你说：

- "帮我做一个 Vue3 项目"
- "初始化一个 Vue3 + TypeScript 模板"
- "做一个 Vue 后台管理系统"
- "用 Vue3 搭一个 xxx 网站"
- "帮我生成一个标准的 Vue3 项目结构"

这个 Skill 会引导你完成需求澄清、项目初始化、主题/页面/组件开发、构建验证的完整流程，最终交付一个可直接运行的 Vue3（Composition API + TypeScript + Vite + Pinia）项目。

---

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| 每次新建 Vue 项目都要从零搭结构 | 使用 `create-vue` 官方脚手架 + 本 Skill 的目录约定 |
| 主题色/间距/字体硬编码遍地都是 | 以 `src/styles/tokens.css` 为唯一源头，使用 CSS 变量 |
| UI 库选择困难 | 默认 Element Plus 2.x，备选 Naive UI / Ant Design Vue |
| AGENTS.md / CLAUDE.md 越写越长 | 强约束：CLAUDE.md ≤ 50 行，AGENTS.md ≤ 400 行 |
| 脚本越加越多 | 不写脚本，规范写进 CLAUDE.md，AI 一次写对 |
| 代码越写越多 | ponytail 模式：能删就删，能合并就合并 |

---

## 与 uniapp-app-generate-skill 的区别

| 维度 | vue-generate-skill | uniapp-app-generate-skill |
|------|--------------------|---------------------------|
| 目标平台 | 浏览器（H5 / 后台 / 文档站） | 小程序 + H5 + App 三端 |
| 构建工具 | Vite | uni-app + Vite |
| 跨平台抽象 | 不需要 | 需要（platform.ts 等） |
| 主题方案 | CSS 变量 | SCSS Token + 色阶校验 |
| UI 库 | Element Plus | uni-app 内置组件 |
| 路由 | vue-router 4 | uni-app pages.json |
| CLAUDE.md 上限 | 50 行 | 50 行（一致） |

**互不替代，按场景选用。**

---

## 使用方式

### 触发 Skill

对 Claude 说任意一种：

```
帮我做一个 Vue3 项目
初始化一个 Vue3 + TS 模板
用 Vue3 搭一个后台管理系统
```

### 四阶段流程

```
Phase 1: 需求澄清
  → Claude 会问 3-5 个核心问题
  → 输出 spec.md，你确认后进入下一步

Phase 2: 项目初始化
  → create-vue 脚手架生成项目
  → 安装 UI 库（默认 Element Plus）
  → 生成 CLAUDE.md（≤ 50 行）、AGENTS.md（≤ 400 行）

Phase 3: 开发实现
  → 设置 tokens.css 主题变量
  → 实现 Layout、Dashboard、Login 等核心页面
  → 复用 Element Plus 组件，不手写同类 UI

Phase 4: 验证交付
  → npm run lint
  → npm run type-check (vue-tsc)
  → npm run build
  → 输出交付总结
```

### 生成后如何运行

```bash
cd your-project
npm install
npm run dev        # 开发服务器
npm run build      # 生产构建
npm run lint       # ESLint 检查
npm run type-check # vue-tsc 类型检查
```

### 常用脚本

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 生产构建（输出 dist/） |
| `npm run preview` | 本地预览生产构建 |
| `npm run lint` | ESLint + Prettier 检查 |
| `npm run type-check` | vue-tsc --noEmit 类型检查 |

---

## 核心能力

| 能力 | 说明 |
|------|------|
| **官方脚手架** | 基于 `create-vue`（Vue 团队官方），不重新发明轮子。 |
| **CLAUDE.md 短小** | **强约束 ≤ 50 行**，AI 真正会读完。 |
| **AGENTS.md 按需查阅** | **≤ 400 行**，按主题拆分，AI 不会一次性读完。 |
| **CSS 变量主题** | 一份 `tokens.css` 覆盖颜色/间距/字体/圆角/阴影。 |
| **Element Plus 集成** | 默认 UI 库，开箱即用，按需引入。 |
| **Pinia 状态管理** | Composition API 风格，自动类型推导。 |
| **fetch 拦截器** | 自动加 token、统一错误处理、401 自动跳登录（来自 `frontend-request-skill`）。 |
| **路由守卫** | 登录态校验、角色权限校验，按需扩展。 |
| **TypeScript 严格模式** | tsconfig.json 默认 strict，业务代码必须类型完整。 |
| **ponytail 模式** | 实现最小化，不写多余抽象，不写用不到的代码。 |

---

## 目录结构

```
vue-generate-skill/
├── SKILL.md                   # 技能主文档：触发条件、四阶段流程、详细步骤
├── README.md                  # 本文件
└── references/                # 规范参考文档
    ├── project-structure.md       # 标准目录结构与命名约定
    ├── claude-md-template.md      # CLAUDE.md 模板（≤50 行，含 frontend-request-skill 依赖声明）
    ├── agents-md-template.md      # AGENTS.md 模板（≤400 行，按主题拆分）
    ├── api-integration.md         # ⭐ 与 frontend-request-skill 集成完整指南
    ├── tsconfig-template.md       # tsconfig.json 严格模式完整配置
    ├── vite-config-template.md    # vite.config.ts + 路由 + 入口完整配置
    ├── vue-conventions.md         # Vue 3 + TS 约定（Composition API / 命名 / Props）
    ├── component-standards.md     # 共享组件规则与何时抽取
    └── code-examples/             # 完整可复制代码示例
        ├── README.md
        ├── types/api.ts           # ApiResponse<T> / RequestError
        ├── types/user.ts          # User 业务类型
        ├── stores/user.ts         # 用户 Pinia store
        ├── stores/app.ts          # 全局 app 状态
        ├── components/AppLayout.vue
        ├── views/Login.vue
        └── views/UserManagement.vue
```

---

## 强依赖：frontend-request-skill

本 Skill **不重新发明请求层**。所有 HTTP / 鉴权 / 错误处理代码必须复用 `frontend-request-skill` 的标准实现。详见 [`references/api-integration.md`](references/api-integration.md)。

---

## 设计哲学（与 uniapp-app-generate-skill 一致）

> **少即是多。**

- CLAUDE.md 50 行 > AGENTS.md 1800 行
- 1 个好 prompt > 10 个检查脚本
- 复用 Element Plus 组件 > 手写组件
- 复用 UI 库 > 自研组件库
- 让 AI 一次写对 > 让 AI 改 10 遍

详见本仓库 `docs/vibecoding-guide-skill/如何正确VibeCoding公众号文章.md`。

---

## CLAUDE.md 模板（≤50 行）

完整模板见 [`references/claude-md-template.md`](references/claude-md-template.md)。**关键约束**：必须显式声明依赖 `frontend-request-skill`。

---

## 主题定制

`src/styles/tokens.css` 是唯一人工源头。改色后无需重新构建，CSS 变量会自动级联。

```css
:root {
  --color-primary: #10b981;
  --color-primary-light: #34d399;
  --color-primary-dark: #047857;
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* 深色模式覆盖 */
  }
}
```

业务代码只用 `var(--color-primary)` 等变量，**禁止裸色值**。

---

## 注意事项

1. **CLAUDE.md 强约束 ≤ 50 行**：超出部分移到 AGENTS.md。
2. **优先 UI 库**：Element Plus 能解决的，就不手写。
3. **3 次复用原则**：组件被复用 ≥3 次才抽到 `src/components/`。
4. **不要写检查脚本**：规范写在 CLAUDE.md 里，让 AI 第一遍就写对。
5. **不要复制粘贴大段规范**：AI 注意力有限，1800 行它会忽略 1500 行。
6. **TypeScript 严格模式**：业务代码不允许 `any`，必要时用 `unknown` + 类型守卫。
7. **不要手写日历 / 表格 / 表单组件**：Element Plus / Naive UI 都有现成的。

---

## 依赖的子技能

本 Skill 在执行过程中会按需调用以下子技能：

- **`frontend-request-skill`**（强依赖）：请求层规范（fetch + 响应信封 + Token 刷新队列），所有 HTTP 代码必须按其标准实现。
- `ponytail`：保持实现最小化，避免过度设计。
- `frontend-design` / `ui-ux-pro-max`：关键页面的 UI/UX 方案。
- `image-forge-skill`：生成页面所需的图标（如果项目需要）。

---

## 适用 vs 不适用

✅ **适用**：
- 后台管理系统
- H5 活动页（不是指小程序 H5，是纯 Web）
- 工具型 Web 应用（Markdown 编辑器、Todo、看板等）
- 文档站点
- 内部工具

❌ **不适用**：
- 微信小程序 / 抖音小程序 → 用 `uniapp-app-generate-skill`
- 移动 App → 用 `uniapp-app-generate-skill` 或 React Native 方案
- Next.js / Nuxt 等 SSR 框架 → 待扩展的 `nuxt-generate-skill` / `next-generate-skill`

---

## 维护记录

- 2026-08-26：初版发布 — Vue3 + TS + Vite + Pinia + Element Plus 标准脚手架，CLAUDE.md ≤50 行强约束。
