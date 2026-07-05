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

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| 每次新建小程序都要从零搭结构 | 提供可直接复制的 `boilerplate` 模板，含目录、依赖、脚本、示例页面 |
| 主题色/间距/字体硬编码遍地都是 | 以 `theme.json` 为唯一源头，自动生成 SCSS Token 和 JS 常量 |
| 微信/H5/App 三端代码写法混乱 | 内置平台抽象层，把差异收敛到 `utils/platform*.ts` |
| 图标、图片资源不规范 | 引导使用 `icon-forge` 生成图标，Pexels 获取真实照片 |
| 自定义导航栏标题被胶囊按钮遮挡 | 内置 `AppNavbar` 组件，自动根据胶囊按钮位置计算安全区域 |
| 生成完代码不知道能不能跑 | `npm run verify` 一键自检：lint + build + 产物检查 |

---

## 使用方式

### 触发 Skill

对 Claude 说任意一种：

```
帮我做一个 uniapp 小程序
初始化一个微信小程序项目
用 uniapp 搭建一个商城小程序
```

### 四阶段流程

```
Phase 1: 需求澄清
  → Claude 会问 3~5 个核心问题
  → 输出 spec.md，你确认后进入下一步

Phase 2: 项目初始化
  → 复制 assets/boilerplate/ 到你的项目目录
  → 替换 {{PROJECT_NAME}} 等占位符
  → 生成 CLAUDE.md、AGENTS.md、.env

Phase 3: 开发实现
  → 同步 theme.json 主题
  → 生成图标（调用 icon-forge）
  → 实现 TabBar、页面、组件
  → 复杂页面可先调用 frontend-design 出方案

Phase 4: 验证交付
  → npm run lint
  → npm run verify
  → 输出交付总结
```

### 生成后如何运行

```bash
cd your-project
npm install
npm run dev:mp-weixin    # 微信小程序
npm run dev:h5           # H5
npm run dev:app          # App
```

### 常用脚本

| 命令 | 作用 |
|------|------|
| `npm run dev:mp-weixin` | 微信小程序开发 |
| `npm run build:mp-weixin` | 微信小程序打包 |
| `npm run dev:h5` | H5 开发 |
| `npm run build:h5` | H5 打包 |
| `npm run lint` | ESLint 检查 |
| `npm run verify` | lint + build 一键自检 |
| `npm run theme:sync` | 根据 theme.json 同步主题文件 |

---

## 核心能力

| 能力 | 说明 |
|------|------|
| **项目脚手架** | 复制 `assets/boilerplate/` 到目标目录，自动生成目录结构、规范文件、页面与组件。 |
| **主题系统** | 以 `theme.json` 为唯一人工源头，自动生成 SCSS Token 与 JS 常量，支持颜色、间距、字体、圆角、阴影、组件级尺寸。 |
| **组件级尺寸统一** | 提供 `$comp-*` Token，统一按钮、TabBar、导航栏、头像、列表项、卡片、空状态、页面边距、细边框等尺寸。 |
| **跨平台抽象** | 内置 `platform.ts`、`platform-auth.ts`、`platform-share.ts`、`platform-image.ts`、`request.ts`，把平台差异收敛到一处。 |
| **自定义导航栏** | 内置 `AppNavbar` 组件，自动适配微信小程序胶囊按钮位置，标题与胶囊按钮保持同一行。 |
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
│       │   ├── components/   # 公共组件（AppButton / AppCard / AppEmpty / AppInput / AppNavbar）
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

## 自定义导航栏

当页面需要自定义标题且与微信小程序右上角胶囊按钮对齐时，使用内置 `AppNavbar`：

```vue
<script setup lang="ts">
import { AppNavbar } from '@/components/AppNavbar';
</script>

<template>
  <view class="page">
    <AppNavbar title="页面标题" />
    <view class="page__content">
      <!-- 页面内容 -->
    </view>
  </view>
</template>
```

对应 `pages.json`：

```json
{
  "path": "pages/demo/index",
  "style": {
    "navigationStyle": "custom"
  }
}
```

组件会根据 `uni.getMenuButtonBoundingClientRect()` 自动计算标题高度和右侧安全间距，避免标题超出屏幕或被胶囊按钮遮挡。

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
4. **依赖版本**：当前 `@dcloudio/uni-*` 使用的是 `3.0.0-5010420260703001`（alpha/nightly），适合原型开发；生产环境请评估是否升级到稳定版。
5. **深色模式**：当前未引入深色模式；如后续需要，建议统一通过 `theme.json` 扩展并由 `theme:sync` 生成对应变量。

---

## 维护记录

- 2026-07-05：完成收尾优化 — Lint 全绿、主题自动同步、一键 verify、示例页面补齐。
