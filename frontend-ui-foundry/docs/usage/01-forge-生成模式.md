# 01 · Forge 生成模式

按场景从零生成新项目或页面。

## 用法

```bash
forge <scenario> [--brand <name>] [--stack <name>] [--dark] [--prose-only]
```

## 8 个场景

| 场景 ID | 用途 |
|---------|------|
| `mobile-responsive` | 移动优先响应式 Web |
| `pc-corporate` | PC 企业官网 |
| `admin-dashboard` | SaaS 后台/中后台 |
| `landing-marketing` | 营销落地页 |
| `docs-site` | API 文档/帮助中心 |
| `fintech-app` | 银行/支付应用 |
| `mobile-native` | iOS/Android 原生 App |
| `threejs-3d` | 3D 沉浸式体验 |

## 6 个技术栈

| 栈 ID | 框架 |
|-------|------|
| `html-tailwind` | 纯 HTML + Tailwind（默认） |
| `react-nextjs` | Next.js App Router |
| `vue-nuxt` | Nuxt 3 |
| `uniapp` | 跨端（小程序 + H5 + App） |
| `react-native` | React Native |
| `svelte` | SvelteKit |

## 6 步流水线

1. **加载场景基线** → `references/scenarios/<scenario>.md`
2. **选择品牌** → 用户指定 / 场景默认 / 赤琥金（兜底）
3. **生成 Token** → `templates/tokens.css.tpl` + 调色板替换
4. **生成代码骨架** → 按技术栈
5. **应用设计法则** → 反 AI slop 自检
6. **输出报告**

## 常用示例

```bash
# 营销页 + Stripe 暖色 + React
forge landing-marketing --brand stripe --stack react-nextjs

# 后台 + Supabase 深色 + Vue
forge admin-dashboard --brand supabase --stack vue-nuxt

# 文档站 + Mintlify + 纯 HTML
forge docs-site --stack html-tailwind

# 金融 App + 金融稳重 + uniapp
forge fintech-app --stack uniapp

# 3D 沉浸 + Lovable + 暗色
forge threejs-3d --brand lovable --dark

# 只看文案和结构
forge mobile-responsive --prose-only
```

## 默认品牌映射

| 场景 | 默认品牌 | 备选 |
|------|---------|------|
| mobile-responsive | 冷调极简 | 原生移动 |
| pc-corporate | 赤琥金 | 创意广告 |
| admin-dashboard | 2B 灰蓝 | 数据深色 |
| landing-marketing | 暖色商务 | 创意广告 |
| docs-site | 文档清爽 | 冷调极简 |
| fintech-app | 金融稳重 | 2B 灰蓝 |
| mobile-native | 原生移动 | — |
| threejs-3d | 3D 沉浸 | 数据深色 |

## 输出物

- `tokens.css` — 完整 CSS 变量
- `tailwind.config.ts`（如用 Tailwind）
- 基础组件（Button/Input/Card 等）
- 页面骨架
- `forge-report.md` — 决策报告

## 注意事项

- **greenfield（从零）专用**：已有项目用 `optimize`
- **保留业务逻辑**：不接管业务代码，只生成 UI 层
- **设计判断依据**：场景基线 + 品牌卡 + 设计法则（`references/anti-patterns.md`）
