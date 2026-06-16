---
name: frontend-ui-foundry
description: "Use when generating UI for a specific scenario (mobile/PC/官网/管理端/营销页/文档/金融/原生/3D), when refactoring an existing HTML/Vue/React project to a unified design system, when extracting design tokens from code, when applying a brand style, or when auditing a frontend project for design and code quality. Covers 8 scenarios, 10 mainstream color palettes, 15 font pairings, 4pt spacing scale, OKLCH color strategy, and 6 tech stacks (HTML+Tailwind/React+Next/Vue+Nuxt/uniapp/RN/Svelte)."
argument-hint: "[forge|optimize|tokens|unify|audit|brand|scenario|stack] [args]"
user-invocable: true
---

# Frontend UI Foundry

综合性前端 UI 技能：按场景生成、一键优化、Token 统一、品牌套用、设计审查六位一体。

## 设计哲学

- **场景驱动**：不同场景（移动端/PC/管理端/营销页/文档/金融/原生/3D）有截然不同的布局、组件、交互基线
- **Token 优先**：所有视觉决策沉淀为可消费的设计 Token，颜色/字体/间距/圆角/阴影/动效一应俱全
- **双模式闭环**：`forge` 从零生成，`optimize` 智能重构现有项目
- **复用协同**：直接引用 `impeccable` 的设计法则、`ui-ux-pro-max` 的规则库、`ui-audit` 的决策框架
- **多栈适配**：HTML+Tailwind、React+Next、Vue+Nuxt、uniapp、RN、Svelte 六栈统一体验

## 子命令

| 命令 | 类别 | 用途 | 详细 |
|------|------|------|------|
| `forge <scenario>` | 生成 | 从零按场景生成页面或项目 | [commands/forge.md](references/commands/forge.md) |
| `optimize [target]` | 优化 | 一键智能重构现有项目 | [commands/optimize.md](references/commands/optimize.md) |
| `tokens <action>` | Token | 提取/注入/导出设计 Token | [commands/tokens.md](references/commands/tokens.md) |
| `unify [target]` | 统一 | 多页面/多模块风格统一 | [commands/unify.md](references/commands/unify.md) |
| `audit [target]` | 审查 | 设计 + 代码双维审查 | [commands/audit.md](references/commands/audit.md) |
| `brand <name>` | 品牌 | 套用品牌风格到目标 | [commands/brand.md](references/commands/brand.md) |
| `scenario <type>` | 场景 | 输出场景方案基线 | [commands/scenario.md](references/commands/scenario.md) |
| `stack <name>` | 技术栈 | 技术栈最佳实践 | [commands/stack.md](references/commands/stack.md) |

### 路由规则

1. **无参数** → 渲染子命令菜单 + 场景选择器，引导用户选择
2. **首词匹配子命令** → 加载对应 `references/commands/<cmd>.md` 并按其流程执行
3. **首词不匹配** → 视为通用设计请求，按"识别场景 → 选择风格 → 加载 Token → 实施"主流程

### 主流程（首词不匹配时）

```
1. 识别场景（mobile-responsive / pc-corporate / admin-dashboard / landing-marketing / docs-site / fintech-app / mobile-native / threejs-3d）
2. 选择风格（brand 名称 / 调色板 / 用户自描述）
3. 选择技术栈（html-tailwind / react-nextjs / vue-nuxt / uniapp / react-native / svelte）
4. 加载 references/tokens/ 对应 Token
5. 加载 references/scenarios/<scenario>.md 场景基线
6. 应用设计法则（OKLCH 调色策略、字号阶 ≥1.25、行长 65-75ch、AI slop 黑名单）
7. 输出代码 + Token 文件 + 报告
```

## 核心资源

### 设计 Token（6 份）

| 类别 | 文件 |
|------|------|
| 调色板 | [tokens/color-palettes.md](references/tokens/color-palettes.md) |
| 字体配对 | [tokens/typography.md](references/tokens/typography.md) |
| 间距阶梯 | [tokens/spacing-scale.md](references/tokens/spacing-scale.md) |
| 圆角阴影 | [tokens/radius-elevation.md](references/tokens/radius-elevation.md) |
| 动效 | [tokens/motion.md](references/tokens/motion.md) |
| 布局栅格 | [tokens/layout-grid.md](references/tokens/layout-grid.md) |

### 场景库（8 个）

| 场景 | 文件 | 典型用途 |
|------|------|---------|
| 移动端响应式 | [scenarios/mobile-responsive.md](references/scenarios/mobile-responsive.md) | 响应式 Web |
| PC 企业官网 | [scenarios/pc-corporate.md](references/scenarios/pc-corporate.md) | 企业品牌站 |
| 管理端中后台 | [scenarios/admin-dashboard.md](references/scenarios/admin-dashboard.md) | SaaS 后台 |
| 营销落地页 | [scenarios/landing-marketing.md](references/scenarios/landing-marketing.md) | 推广页 |
| 文档站点 | [scenarios/docs-site.md](references/scenarios/docs-site.md) | 帮助中心 |
| 金融应用 | [scenarios/fintech-app.md](references/scenarios/fintech-app.md) | 银行/支付 |
| 原生移动 | [scenarios/mobile-native.md](references/scenarios/mobile-native.md) | iOS/Android |
| 3D 沉浸 | [scenarios/threejs-3d.md](references/scenarios/threejs-3d.md) | WebGL/Three.js |

### 品牌风格（58 总览 + 10 详细）

[brands/index.md](references/brands/index.md) 列出 58 个品牌，10 个详细卡见 [brands/](references/brands/)。

### 技术栈（6 个）

[stacks/](references/stacks/) 目录下六栈适配。

### AI Slop 黑名单

详见 [anti-patterns.md](references/anti-patterns.md)。**生成与优化前必读**。

## 关键设计法则（精简版）

完整版见 [impeccable/SKILL.md](../impeccable/SKILL.md)，本 SKILL 必读要点：

### 调色策略
- 使用 **OKLCH**，减少极亮/极暗的 chroma
- 永不使用 `#000` 或 `#fff`，所有中性色向品牌色相微调（chroma 0.005–0.01）
- 四档承诺度：**Restrained**（点缀 ≤10%）/ **Committed**（主色占 30–60%）/ **Full**（3-4 角色明确分工）/ **Drenched**（整个表面就是色）

### 主题判断
- 不预设深/浅色。先写一句"谁、哪、什么光、什么心情"的物理场景句，句子里推不出答案就改具体直到能推

### 字体
- 正文行长 65-75ch
- 字号阶 ≥1.25 比例
- 不用 Inter/Roboto/Arial（AI slop 标志）

### 布局
- 卡片不是万灵药，嵌套卡片必错
- 不强求包容器，大多数元素不需要
- 间距要有节奏，避免处处相同

### 动效
- 不动 CSS 布局属性
- ease-out 指数曲线，无 bounce/elastic
- 150-300ms 微交互，复杂 ≤400ms

### 绝对禁令
- 侧边色条边框（`border-left/right > 1px` 彩色强调）
- 渐变文字（`background-clip: text`）
- 玻璃拟态作默认
- 大数字+小标签的 hero-metric 模板
- 尺寸一致的卡片网格
- 模态框作为第一反应

### AI Slop 测试
如果有人看了这个界面说"AI 做的"而你无法反驳，就是失败。先做品类反思维（不能从品类直接猜出主题+调色板），再做二阶反思维（不能从品类+反参考猜出美学家族）。

## 验证提醒

修改现有项目时：
1. **不破坏业务逻辑**：props、event、router、state、API 调用保持不变
2. **不破坏可访问性**：对比度 ≥4.5:1（AA），触摸目标 ≥44pt
3. **不引入 AI slop**：对照 [anti-patterns.md](references/anti-patterns.md) 自检
4. **保留动画意图**：`prefers-reduced-motion` 必须支持
5. **提供回滚方案**：optimize 模式必须输出 diff + 回滚脚本

## 默认决策

- **默认调色板**：赤琥金（中国科技+文学审美）
- **optimize 默认策略**：渐进（80% 对齐到匹配品牌）
- **生成语言**：中文
- **目标部署位置**：`D:\frontend-skills\frontend-ui-foundry\`

## 开始使用

- 想生成页面/项目：`forge <scenario>` 或 `forge <scenario> --brand <name> --stack <name>`
- 想优化现有项目：`optimize` 或 `optimize <path>`
- 想看可用调色板：`tokens color` 或读 [tokens/color-palettes.md](references/tokens/color-palettes.md)
- 想套用品牌风格：`brand <name>` 后跟目标
- 想审查项目：`audit <path>`
- 没参数：渲染上方子命令菜单，引导用户选择
