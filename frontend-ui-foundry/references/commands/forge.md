# forge — 场景化生成

按指定场景（移动/PC/管理端/营销页/文档/金融/原生/3D）从零生成页面或项目。

## 用法

```
forge <scenario> [--brand <name>] [--stack <name>] [--dark] [--prose-only]
```

### 参数

| 参数 | 说明 | 默认 |
|------|------|------|
| `<scenario>` | 必填，场景名 | — |
| `--brand` | 品牌风格 | 赤琥金（中文）/ Stripe / Linear |
| `--stack` | 技术栈 | html-tailwind |
| `--dark` | 暗色模式优先 | 否（浅色优先） |
| `--prose-only` | 只输出文案 + 骨架，不写实现 | 否 |

### 支持的场景

`mobile-responsive` / `pc-corporate` / `admin-dashboard` / `landing-marketing` / `docs-site` / `fintech-app` / `mobile-native` / `threejs-3d`

### 支持的技术栈

`html-tailwind` / `react-nextjs` / `vue-nuxt` / `uniapp` / `react-native` / `svelte`

## 6 步流水线

### 1. 加载场景基线

读取 `references/scenarios/<scenario>.md`，获取布局、组件、交互基线。

### 2. 选择品牌/调色板

**优先级**：用户指定品牌 → 推荐品牌（场景默认）→ 默认调色板（赤琥金）

读取 `references/brands/<name>.md`（如指定）获取调色策略 + 字体配对。

**调色板快速选择**：
- 场景默认品牌映射（见 SKILL.md 主文件）
- 用户可追加 `--brand` 覆盖

### 3. 生成 Token

合并场景 + 品牌，输出完整 Token：
- CSS 变量文件（`tokens.css`）
- Tailwind 配置（如用 Tailwind）
- 主题对象（如用 JS 主题）

模板见 `templates/tokens.css.tpl` 和 `templates/tokens.tailwind.tpl`。

### 4. 生成代码骨架

按技术栈输出：

| 栈 | 输出 |
|-----|------|
| html-tailwind | 单页 HTML + Tailwind config + 全局 CSS |
| react-nextjs | Next.js 项目结构 + page.tsx + 基础组件 |
| vue-nuxt | Nuxt 项目结构 + page.vue + 基础组件 |
| uniapp | pages.json + 页面 + 组件 |
| react-native | RN 项目结构 + screens + components |
| svelte | SvelteKit 路由 + page.svelte + 组件 |

### 5. 应用设计法则

按 [anti-patterns.md](../anti-patterns.md) 自检：
- 调色策略（4 档承诺度）
- 字号阶 ≥1.25 比例
- 行长 65-75ch
- 绝对禁令检查（侧边色条、渐变文字、玻璃拟态默认、hero-metric、相同卡片网格、模态第一反应）
- 减弱动效支持
- 触摸目标 ≥44pt
- 文字对比度 ≥4.5:1

### 6. 输出报告

```markdown
# Forge Report — <scenario>

## 场景
- 场景：<scenario>
- 品牌：<brand>
- 技术栈：<stack>
- 主题：light / dark

## 调色板
- 主色：oklch(0.55 0.16 28) — 朱砂红
- 策略：Committed

## 字体
- 标题：'Noto Sans SC', sans-serif
- 正文：'Noto Sans SC', sans-serif
- 等宽：'JetBrains Mono', monospace

## 间距阶梯（4pt 网格）
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 96 / 128

## 文件清单
- [tokens.css]()
- [tailwind.config.ts]()
- [index.html]()
- [components/Button.vue]()
- ...

## 自检
- [x] 调色策略 Committed
- [x] 字号阶 ≥1.25
- [x] 触摸目标 ≥44pt
- [x] 减弱动效
- [x] 无 AI slop

## 截图
[本地路径 / URL]
```

## 示例

```bash
# 营销落地页 + 暖色商务（Stripe）+ React Next.js
forge landing-marketing --brand stripe --stack react-nextjs

# 管理端 + 数据深色（Supabase）+ Vue Nuxt
forge admin-dashboard --brand supabase --stack vue-nuxt

# 文档站点 + 文档清爽（默认）+ 纯 HTML
forge docs-site --stack html-tailwind

# 金融 App + 金融稳重 + uniapp
forge fintech-app --stack uniapp

# 只看文案和结构（不写实现）
forge mobile-responsive --prose-only
```

## 注意事项

- **保留业务逻辑**：forge 不接管业务代码，只生成 UI 层
- **不修改既有项目**：forge 用于 greenfield（从零创建）
- **已有项目**：用 `optimize` 子命令
- **设计判断**：参考场景基线 + 品牌卡 + 设计法则
