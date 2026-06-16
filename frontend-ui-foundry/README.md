# Frontend UI Foundry 🎨

> Claude Code 技能：按场景生成 UI、一键优化现有项目、统一管理设计 Token、套用品牌风格、执行设计与代码双维审查。

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue?logo=anthropic)](https://claude.ai/code)
[![Scenarios](https://img.shields.io/badge/Scenarios-8-orange)](#场景库)
[![Tech Stacks](https://img.shields.io/badge/Stacks-6-green)](#技术栈)
[![Brands](https://img.shields.io/badge/Brands-58-purple)](#品牌库)

---

## 目录

- [这是什么？](#这是什么)
- [核心能力](#核心能力)
- [安装](#安装)
- [快速开始](#快速开始)
- [子命令详解](#子命令详解)
- [设计 Token](#设计-token)
- [场景库](#场景库)
- [品牌库](#品牌库)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [设计哲学](#设计哲学)
- [常见问题](#常见问题)
- [贡献](#贡献)
- [许可证](#许可证)

---

## 这是什么？

**Frontend UI Foundry** 是一个面向 Claude Code 的综合性前端 UI 技能。它把「生成 → 优化 → 审查 → Token 管理 → 品牌套用」串联成一条完整工作流，让你用自然语言就能产出生产级前端界面。

不管你是要从零做一个营销落地页，还是想给现有 Vue/React/uniapp 项目统一设计系统，Foundry 都能按既定规则输出一致、可维护、反 AI Slop 的代码。

---

## 核心能力

| 能力 | 说明 |
|------|------|
| **8 大场景生成** | 移动端响应式、PC 企业官网、管理端中后台、营销落地页、文档站点、金融应用、原生移动、3D 沉浸 |
| **10 套调色板** | 基于 OKLCH 的专业配色，含默认「赤琥金」中国科技文学风 |
| **15 组字体配对** | 覆盖标题/正文/等宽，避免 Inter/Roboto 等 AI Slop 字体 |
| **58 个品牌风格** | Stripe / Linear / Vercel / Apple / Supabase / Mintlify / Revolut / Lovable / Cursor / Claude 等 |
| **6 大技术栈** | HTML+Tailwind、React+Next.js、Vue+Nuxt、uniapp、React Native、Svelte |
| **8 个子命令** | `forge` / `optimize` / `tokens` / `unify` / `audit` / `brand` / `scenario` / `stack` |
| **反 AI Slop** | 6 条绝对禁令 + 12 高频陷阱 + 17 项自检清单 |

---

## 安装

### 前置要求

- [Claude Code](https://claude.ai/code) 已安装并登录
- 本技能为 Claude Code Skill，不是 npm 包

### 安装方式

#### 方式一：复制到 Claude Code 技能目录

```bash
# 1. 找到本仓库的 frontend-ui-foundry 目录
# 2. 复制到 Claude Code  skills 目录

# macOS / Linux
cp -r frontend-ui-foundry ~/.claude/skills/

# Windows PowerShell
Copy-Item -Recurse -Path .\frontend-ui-foundry -Destination $env:USERPROFILE\.claude\skills\

# Windows CMD
xcopy /E /I frontend-ui-foundry %USERPROFILE%\.claude\skills\frontend-ui-foundry
```

#### 方式二：通过 skill-creator 安装

在 Claude Code 中直接说：

```text
安装 frontend-ui-foundry 技能
```

或

```text
/frontend-ui-foundry
```

#### 方式三：Git 子模块（推荐团队协作）

```bash
git submodule add https://github.com/YOUR_NAME/wg-skills.git
ln -s wg-skills/frontend-ui-foundry ~/.claude/skills/frontend-ui-foundry
```

### 验证安装

```bash
ls ~/.claude/skills/frontend-ui-foundry/SKILL.md
```

如果看到 `SKILL.md`，说明安装成功。

---

## 快速开始

安装完成后，在 Claude Code 中直接输入：

```text
/frontend-ui-foundry
```

或自然语言：

```text
用 foundry 帮我做一个营销落地页，Stripe 风格，React
```

### 常见任务

```text
# 生成项目
forge landing-marketing --brand stripe --stack react-nextjs

# 优化现有项目
optimize ./my-project --strategy gradual

# 审查项目
audit ./my-project --depth deep

# 提取设计 Token
tokens extract ./my-project > tokens.json

# 套用品牌
brand apple ./my-project
```

---

## 子命令详解

| 子命令 | 作用 | 示例 |
|--------|------|------|
| `forge <scenario>` | 从零按场景生成页面或项目 | `forge admin-dashboard --brand supabase --stack vue-nuxt` |
| `optimize [target]` | 一键智能重构现有项目 | `optimize ./src --strategy conservative` |
| `tokens <action>` | 提取 / 注入 / 导出设计 Token | `tokens export tailwind --output tokens.config.ts` |
| `unify [target]` | 多页面 / 多模块风格统一 | `unify --scope pages` |
| `audit [target]` | 设计 + 代码双维审查 | `audit --focus design --depth deep` |
| `brand <name>` | 套用品牌风格到目标 | `brand linear ./my-project` |
| `scenario <type>` | 输出场景方案基线 | `scenario fintech-app` |
| `stack <name>` | 输出技术栈最佳实践 | `stack uniapp` |

每个子命令的完整流程见：

- [docs/usage/01-forge-生成模式.md](docs/usage/01-forge-生成模式.md)
- [docs/usage/02-optimize-优化模式.md](docs/usage/02-optimize-优化模式.md)
- [docs/usage/03-audit-审查模式.md](docs/usage/03-audit-审查模式.md)
- [docs/usage/04-tokens-管理.md](docs/usage/04-tokens-管理.md)
- [docs/usage/05-子命令速查.md](docs/usage/05-子命令速查.md)

---

## 设计 Token

所有视觉决策都沉淀为可消费的设计 Token，存放在 `references/tokens/`：

| Token | 文件 | 内容 |
|-------|------|------|
| 调色板 | [references/tokens/color-palettes.md](references/tokens/color-palettes.md) | 10 套 OKLCH 调色板 + HEX 对照 |
| 字体 | [references/tokens/typography.md](references/tokens/typography.md) | 15 组字体配对、字号阶、行高 |
| 间距 | [references/tokens/spacing-scale.md](references/tokens/spacing-scale.md) | 4pt 网格、内边距/外边距阶梯 |
| 圆角与阴影 | [references/tokens/radius-elevation.md](references/tokens/radius-elevation.md) | 圆角、阴影、z-index |
| 动效 | [references/tokens/motion.md](references/tokens/motion.md) | 时长、缓动、 prefers-reduced-motion |
| 栅格 | [references/tokens/layout-grid.md](references/tokens/layout-grid.md) | 断点、容器、12 栅格 |

模板文件：

- [templates/tokens.css.tpl](templates/tokens.css.tpl) — CSS 变量模板
- [templates/tokens.tailwind.tpl](templates/tokens.tailwind.tpl) — Tailwind 配置模板

---

## 场景库

`references/scenarios/` 下包含 8 个场景的基线方案：

| 场景 | 文件 | 典型用途 |
|------|------|---------|
| 移动端响应式 | [mobile-responsive.md](references/scenarios/mobile-responsive.md) | 响应式 H5 / 小程序 Webview |
| PC 企业官网 | [pc-corporate.md](references/scenarios/pc-corporate.md) | 企业品牌站 |
| 管理端中后台 | [admin-dashboard.md](references/scenarios/admin-dashboard.md) | SaaS / ERP 后台 |
| 营销落地页 | [landing-marketing.md](references/scenarios/landing-marketing.md) | 推广页 / 活动页 |
| 文档站点 | [docs-site.md](references/scenarios/docs-site.md) | 帮助中心 / 文档站 |
| 金融应用 | [fintech-app.md](references/scenarios/fintech-app.md) | 银行 / 支付 / 钱包 |
| 原生移动 | [mobile-native.md](references/scenarios/mobile-native.md) | iOS / Android App |
| 3D 沉浸 | [threejs-3d.md](references/scenarios/threejs-3d.md) | WebGL / Three.js 体验 |

---

## 品牌库

`references/brands/` 下包含 58 个品牌总览 + 10 个详细品牌卡：

- [brands/index.md](references/brands/index.md) — 58 品牌按 8 能力域分类
- 详细卡：Stripe、Linear、Vercel、Apple、Supabase、Mintlify、Revolut、Lovable、Cursor、Claude

使用品牌风格：

```text
brand stripe ./my-project
forge landing-marketing --brand apple --stack react-nextjs
```

---

## 技术栈

`references/stacks/` 下包含 6 个技术栈的最佳实践：

| 技术栈 | 文件 |
|--------|------|
| HTML + Tailwind | [html-tailwind.md](references/stacks/html-tailwind.md) |
| React + Next.js | [react-nextjs.md](references/stacks/react-nextjs.md) |
| Vue + Nuxt | [vue-nuxt.md](references/stacks/vue-nuxt.md) |
| uniapp | [uniapp.md](references/stacks/uniapp.md) |
| React Native | [react-native.md](references/stacks/react-native.md) |
| Svelte | [svelte.md](references/stacks/svelte.md) |

---

## 项目结构

```text
frontend-ui-foundry/
├── SKILL.md                          # 技能入口（8 子命令路由）
├── README.md                         # 本文件
├── docs/                             # 完整使用文档
│   ├── README.md                     # 文档首页
│   └── usage/                        # 10 份使用指南
│       ├── 01-forge-生成模式.md
│       ├── 02-optimize-优化模式.md
│       ├── 03-audit-审查模式.md
│       ├── 04-tokens-管理.md
│       ├── 05-子命令速查.md
│       ├── 06-调色板选择.md
│       ├── 07-场景与品牌映射.md
│       ├── 08-技术栈速查.md
│       ├── 09-AI-Slop-黑名单.md
│       └── 10-常见问题.md
├── references/                       # 知识库
│   ├── anti-patterns.md              # AI Slop 黑名单
│   ├── tokens/                       # 6 份设计 Token
│   ├── scenarios/                    # 8 个场景基线
│   ├── brands/                       # 58 品牌总览 + 10 详细卡
│   ├── stacks/                       # 6 个技术栈
│   └── commands/                     # 8 个子命令流程
├── scripts/                          # 4 个 Node 工具脚本
│   ├── detect-stack.mjs
│   ├── extract-tokens.mjs
│   ├── match-profile.mjs
│   └── verify-output.mjs
├── templates/                        # Token 模板
│   ├── tokens.css.tpl
│   └── tokens.tailwind.tpl
├── demo/                             # 端到端验证
│   ├── README.md
│   └── verify.sh
└── ui-configurator.html              # 可视化调色配置器
```

---

## 设计哲学

1. **场景驱动**：不同场景有不同的布局、组件、交互基线，不一套模板打天下。
2. **Token 优先**：所有视觉决策先沉淀为 Token，再生成代码。
3. **双模式闭环**：`forge` 从零生成，`optimize` 智能重构，覆盖项目全生命周期。
4. **多栈适配**：同一套设计系统同时支持 6 大前端技术栈。
5. **反 AI Slop**：禁用渐变文字、玻璃拟态默认、侧边色条等「一眼 AI」模式。

---

## 常见问题

**Q: 这个技能会破坏我的现有项目吗？**

A: `optimize` 模式默认使用渐进策略，只改样式和结构，不动业务逻辑（props、event、router、state、API 调用）。建议先使用 `--report-only` 查看报告，确认后再执行修改。

**Q: 支持深色模式吗？**

A: 支持。生成时可通过 `--dark` 指定深色主题，或在 Token 中配置 `dark` 变体。

**Q: 可以自定义品牌吗？**

A: 可以。在 `references/brands/` 下新增品牌文件，或直接在命令中描述品牌关键词。

**Q: 生成中文还是英文？**

A: 默认中文。可在命令中通过 `--lang en` 切换为英文。

更多问题见 [docs/usage/10-常见问题.md](docs/usage/10-常见问题.md)。

---

## 贡献

欢迎提交 Issue 和 Pull Request！

贡献方向：

- 新增场景基线
- 新增品牌风格
- 新增技术栈适配
- 补充 Token 模板
- 修复 AI Slop 黑名单

---

## 许可证

MIT License
