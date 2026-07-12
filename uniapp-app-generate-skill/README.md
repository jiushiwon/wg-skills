# uniapp-app-generate-skill

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
| 自定义导航栏内容被胶囊按钮覆盖 | 内置 `AppNavbar`：胶囊独占一行、仅返回图标同排、标题/内容在下方，绝不覆盖 |
| 生成完代码不知道能不能跑 | `npm run verify` 一键自检：主题同步 + 色阶校验 + lint + build + 产物检查 |

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
| `npm run verify` | theme:sync → theme:check → lint → build:h5 一键自检 |
| `npm run theme:sync` | 根据 theme.json 同步主题文件（生成色阶与色阶白名单） |
| `npm run theme:check` | 硬卡：扫描业务代码，禁止色阶之外的颜色 |

---

## 核心能力

| 能力 | 说明 |
|------|------|
| **项目脚手架** | 复制 `assets/boilerplate/` 到目标目录，自动生成目录结构、规范文件、页面与组件。 |
| **主题系统** | 以 `theme.json` 为唯一人工源头，自动生成 SCSS Token 与 JS 常量，支持颜色、间距、字体、圆角、阴影、组件级尺寸。 |
| **主题色阶与硬卡** | 改 `theme.json` 主色即可全量重生成主色阶/灰阶 50~900 与语义色；`npm run theme:check` 硬卡，**禁止色阶之外的颜色**。 |
| **组件级尺寸统一** | 提供 `$comp-*` Token，统一按钮、Tab、弹窗、TabBar、导航栏、头像、列表项、卡片、空状态等尺寸。 |
| **复用组件强一致** | 内置 `AppButton/AppTab/AppPopup/AppCard/AppEmpty/AppInput/AppNavbar`，多页面同类 UI 必须复用同一组件，主题色/尺寸/圆角严格一致。 |
| **跨平台抽象** | 内置 `platform.ts`、`platform-auth.ts`、`platform-share.ts`、`platform-image.ts`、`request.ts`，把平台差异收敛到一处。 |
| **自定义导航栏** | 内置 `AppNavbar` 组件，自动适配微信小程序胶囊按钮：**胶囊独占一行、仅返回图标可同排、标题与内容在下方、绝不覆盖胶囊**；默认导航栏无需处理。 |
| **静态资源规范** | 引导使用 `icon-forge` 生成图标，使用 Pexels API 获取真实图片，禁止用 CSS 渐变/色块代替图片。 |
| **一键自检** | 生成后的项目支持 `npm run verify`，自动跑 主题同步 → 色阶校验 → lint → build:h5 → 产物检查。 |
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
  → npm run verify（主题同步 → 色阶校验 → lint → build:h5 → 产物检查）
  → 对照 mini-program-checklist.md 自查
  → 交付并总结
```

---

## 目录结构

```
uniapp-app-generate-skill/
├── SKILL.md                  # 技能主文档：触发条件、四阶段流程、详细步骤
├── README.md                 # 本文件
├── assets/
│   └── boilerplate/          # 可直接复制的最小可运行 uni-app 项目模板
│       ├── theme.json        # 主题唯一人工源头
│       ├── scripts/
│       │   ├── sync-theme.js # 生成 SCSS/TS 主题文件 + 色阶白名单
│       │   ├── check-colors.js # 色阶外颜色硬卡
│       │   ├── verify.js     # sync → check → lint → build 一键自检
│       │   ├── .theme-scale.json # (生成) 色阶白名单，禁止手改
│       │   └── color-allowlist.json # (可选) 受审阅的例外白名单
│       ├── src/
│       │   ├── api/          # 接口封装与类型
│       │   ├── components/   # 公共组件（AppButton / AppTab / AppPopup / AppCard / AppEmpty / AppInput / AppNavbar）
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
    ├── component-standards.md
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
npm run verify      # theme:sync → theme:check → lint → build:h5 → 产物检查
npm run build:mp-weixin
```

预期结果：

- `npm run verify` 输出 `[verify] all checks passed`。
- `npm run build:mp-weixin` 输出 `DONE Build complete.`。
- `npm run lint` 0 error 0 warning。

---

## 共享组件（强制复用）

多页面出现的同类 UI 必须使用 `src/components/` 下的共享组件，保证 A/B/C 页面的 button / tab / popup 主题色、尺寸、圆角完全一致。**页面只 import，不手写同类结构。**

| 需求 | 组件 | 关键 props |
|------|------|-----------|
| 按钮 | `AppButton` | `type: primary/secondary/ghost`，`size: small/medium/large` |
| 分段 / 顶部 Tab | `AppTab` | `v-model` 选中 key，`items: [{ key, label }]` |
| 弹窗 / 动作面板 | `AppPopup` | `v-model` 显隐，`position: bottom/center`，`title` |
| 内容卡片 | `AppCard` | — |
| 空状态 | `AppEmpty` | `title`，`description` |
| 输入框 | `AppInput` | `v-model`，`placeholder` |
| 自定义导航栏 | `AppNavbar` | `title`，`showBack` |

示例：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { AppButton } from '@/components/AppButton';
import { AppTab } from '@/components/AppTab';
import { AppPopup } from '@/components/AppPopup';

const tab = ref('all');
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'done', label: '已完成' },
];
const show = ref(false);
</script>

<template>
  <view>
    <AppTab v-model="tab" :items="tabs" />
    <AppButton type="primary" size="medium" @tap="show = true">打开弹窗</AppButton>
    <AppPopup v-model="show" position="bottom" title="选择">
      <!-- 弹窗内容 -->
    </AppPopup>
  </view>
</template>
```

红线：

- 禁止页面内手写 `<button>`、tab 栏、popup 遮罩或复制共享组件结构（自检：`grep -rn "<button" src/pages` 应为空）。
- 禁止用页面 scoped 样式覆盖共享组件的尺寸/主题色，差异走 props / token。
- 新增可复用 UI 先沉淀到 `src/components/` 并登记 `references/component-standards.md`。

完整规范见 [`references/component-standards.md`](references/component-standards.md)。

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

<style lang="scss" scoped>
.page {
  // 内容整体下移，避开状态栏 + 胶囊带 + 标题行，绝不覆盖胶囊
  padding-top: var(--navbar-height, 0px);
}
</style>
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

组件会根据 `uni.getMenuButtonBoundingClientRect()` 自动计算高度：**胶囊按钮独占一行**，仅左侧返回图标与胶囊同排对齐；标题位于胶囊带下方独立一行；页面内容用 `padding-top: var(--navbar-height)` 下移，绝不覆盖胶囊。使用默认导航栏（非 `custom`）的页面无需处理。

---

## 主题定制

`theme.json` 是唯一人工源头，**只含 `colors/spacing/font/radius`**（语义色由色阶自动派生，不再手写）：

```json
{
  "colors": {
    "primary": "#10b981",
    "success": "#4caf50",
    "warning": "#ff9800",
    "error": "#f44336",
    "info": "#2196f3",
    "grayBase": "#6b7280"
  },
  "spacing": { "base": "4rpx" },
  "font": { "base": "12rpx" },
  "radius": { "base": "4rpx" }
}
```

改色后固定两步：

```bash
npm run theme:sync   # 重生成 _theme-config.scss、colors.ts、.theme-scale.json
npm run theme:check  # 硬卡：业务代码不得出现色阶之外的颜色
```

### 色阶

`primary` 与 `grayBase` 各自动生成 50~900 十档色阶（JS 与 SCSS 同一套 mix 公式），语义色全部由色阶派生：

| 语义 | 来源 | 用途 |
|------|------|------|
| `COLOR_PRIMARY` / `$color-primary` | `PRIMARY_500` | 主按钮、强调 |
| `COLOR_PRIMARY_LIGHT` / `$color-primary-light` | `PRIMARY_100` | 浅底、secondary 按钮 |
| `COLOR_PRIMARY_DARK` / `$color-primary-dark` | `PRIMARY_700` | 按下态 |
| `COLOR_TEXT_SECONDARY` / `$color-text-secondary` | `GRAY_500` | 次要文字 |
| `COLOR_BORDER` / `$color-border` | `GRAY_200` | 边框 |

业务代码**只用** `$primary-*/$gray-*/$color-*`（SCSS）或 `PRIMARY_*/GRAY_*/COLOR_*`（TS），禁止裸色值。

### 色阶校验（硬卡）

`npm run theme:check` 扫描 `src/pages/`、`src/components/` 等业务代码（豁免 `src/styles/` 与生成的 `colors.ts`），凡不在白名单内的 `#hex`、`rgb()/rgba()/hsl()/hsla()` 一律失败：

```text
[check-colors] 发现 1 处色阶外颜色：
  src/pages/index/index.vue:75: #123456
```

中性色（`#fff/#000/transparent/currentColor`）与全透明 `rgba(*,0)` 自动豁免；确需引入品牌中性色，写入 `scripts/color-allowlist.json` 的 `allowed` 数组（受审阅兜底，勿滥用）。

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
- 2026-07-10：升级三点 — ① 主题色改为色阶动态生成（JS/SCSS 同源），新增 `theme:check` 硬卡禁止色阶外颜色；② 新增 `AppTab`/`AppPopup` 共享组件与复用红线（`references/component-standards.md`），tab/button/popup 等组件样式强制统一；③ `AppNavbar` 改为胶囊独占一行、仅返回图标同排、标题/内容在下方且不覆盖胶囊。**行为变更**：旧项目若已用 `AppNavbar`，标题会从胶囊行移到下方一行。
