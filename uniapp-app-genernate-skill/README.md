# uniapp-app-genernate-skill

一个用于 **从零生成标准化 uni-app 项目** 的 Claude Skill，支持微信小程序、H5、App 三端。

---

## 它能做什么

当你说：

- “帮我做一个 uniapp 小程序”
- “初始化一个微信小程序项目”
- “用 uniapp 搭建一个 xxx 小程序”
- “帮我生成一个小程序的标准项目结构”

这个 Skill 会引导你完成需求澄清、项目初始化、主题/组件/页面开发、构建验证的完整流程，最终交付一个可直接运行的 uni-app（Vue3 + TypeScript + Pinia + SCSS）项目。

---

## 核心能力

| 能力 | 说明 |
|------|------|
| **项目脚手架** | 复制 `assets/boilerplate/` 到目标目录，自动生成目录结构、规范文件、页面与组件。 |
| **主题系统** | 以 `theme.json` 为唯一人工源头，自动生成 SCSS Token 与 JS 常量，支持颜色、间距、字体、圆角、阴影、组件级尺寸。 |
| **组件级尺寸统一** | 提供 `$comp-*` Token，统一按钮、TabBar、导航栏、头像、列表项、卡片、空状态、页面边距、细边框等尺寸。 |
| **跨平台抽象** | 内置 `platform.ts`、`platform-auth.ts`、`platform-share.ts`、`platform-image.ts`、`request.ts`，把平台差异收敛到一处。 |
| **静态资源规范** | 引导使用 `icon-forge` 生成图标，使用 Pexels API 获取真实图片，禁止用 CSS 渐变/色块代替图片。 |
| **一键自检** | 生成后的项目支持 `npm run verify`，自动跑 lint + build + 产物检查。 |
| **示例页面完整** | 样板包含首页、列表页、表单页、我的页，演示下拉刷新、空状态、表单校验、本地草稿、登录抽象。 |

---

## 使用流程

```
Phase 1: Pre-development
  → 问 3~5 个聚焦问题（目标用户、核心功能、风格、TabBar、登录需求）
  → 输出 spec.md 并经用户确认

Phase 2: Project Initialization
  → 复制 assets/boilerplate/ 到目标目录
  → 替换占位符（package.json、manifest.json、pages.json、index.vue、index.html、README.md）
  → 生成 CLAUDE.md、AGENTS.md、.claudeignore、.env

Phase 3: Development
  → 确认 theme.json 主题配置并同步
  → 可选调用 frontend-design / ui-ux-pro-max 出设计方案
  → 可选调用 ponytail 精简实现
  → 生成/替换图标与图片
  → 实现 TabBar、页面、公共组件

Phase 4: Post-development
  → npm run lint
  → npm run verify（lint + build + 产物检查）
  → 对照 mini-program-checklist.md 自查
  → 交付并总结
```

---

## 目录结构

```
uniapp-app-genernate-skill/
├── SKILL.md                  # 技能主文档：触发条件、四阶段流程、详细步骤
├── README.md                 # 本文件
├── assets/
│   └── boilerplate/          # 可直接复制的最小可运行 uni-app 项目模板
│       ├── theme.json        # 主题唯一人工源头
│       ├── scripts/
│       │   ├── sync-theme.js # 自动生成 SCSS/TS 主题文件
│       │   └── verify.js     # lint + build 一键自检
│       ├── src/
│       │   ├── api/          # 接口封装与类型
│       │   ├── components/   # 公共组件（AppButton / AppCard / AppEmpty / AppInput）
│       │   ├── constants/    # 常量（colors / enums / env / pages）
│       │   ├── pages/        # 首页 / 列表 / 表单 / 我的
│       │   ├── static/       # 静态资源
│       │   ├── stores/       # Pinia 状态管理
│       │   ├── styles/       # 主题 Token 与全局样式
│       │   ├── types/        # 全局 TypeScript 类型
│       │   └── utils/        # 平台抽象、请求、存储、校验、格式化等
│       ├── src/manifest.json
│       ├── src/pages.json
│       ├── package.json
│       ├── vite.config.ts
│       └── ...
└── references/               # 规范参考文档
    ├── agents-md-template.md
    ├── claude-md-template.md
    ├── cross-platform-compatibility.md
    ├── design-skills-guide.md
    ├── layout-patterns.md
    ├── mini-program-checklist.md
    ├── pexels-integration.md
    ├── project-structure.md
    ├── static-assets-guide.md
    ├── theme-system.md
    └── wechat-common-patterns.md
```

---

## 快速验证

进入样板工程：

```bash
cd assets/boilerplate
rm -rf node_modules package-lock.json dist
npm install
npm run verify      # lint + build:h5 + 产物检查
npm run build:mp-weixin
```

预期结果：

- `npm run verify` 输出 `[verify] all checks passed`。
- `npm run build:mp-weixin` 输出 `DONE Build complete.`。
- `npm run lint` 0 error 0 warning。

---

## 主题定制

编辑 `assets/boilerplate/theme.json`：

```json
{
  "colors": { "primary": "#10b981" },
  "spacing": { "base": "4rpx" },
  "font": { "base": "12rpx" },
  "radius": { "base": "4rpx" }
}
```

然后运行：

```bash
npm run theme:sync
```

脚本会自动重写 `src/styles/config/_theme-config.scss` 与 `src/constants/colors.ts`。

---

## 依赖的子技能

本 Skill 在执行过程中会按需调用以下子技能：

- `ponytail`：保持实现最小化，避免过度设计。
- `frontend-design` / `ui-ux-pro-max`：关键页面的 UI/UX 方案。
- `icon-forge`：生成 TabBar 与页面图标。

---

## 注意事项

1. **不要直接提交规范文件**：`AGENTS.md`、`CLAUDE.md` 及 `docs/rules/` 下的修改须经项目负责人审阅后由维护者手动合入。
2. **占位符替换**：生成项目时，注意同时兼容 `{{PROJECT_NAME}}` 和 `{{ PROJECT_NAME }}` 两种形式。
3. **环境变量**：Pexels API Key 使用 `VITE_PEXELS_API_KEY`，baseURL 使用 `VITE_BASE_URL` / `VITE_H5_BASE_URL` / `VITE_APP_BASE_URL`。
4. **深色模式**：当前已在 `theme.json` 中预留 `darkColors`，但本期未引入 CSS 自定义属性；需要时二期再统一迁移。

---

## 维护记录

- 2026-07-05：完成收尾优化 — Lint 全绿、主题自动同步、一键 verify、示例页面补齐。
