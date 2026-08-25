# Stripe

> 支付基础设施的事实标准。**暖色 Committed**，橙红渐隐，戏剧性排版。

---

## 定位

支付 API、订阅、发票、企业财务。开发者最爱的产品之一。

## 风格 DNA

- **暖色 Committed**：橙红 `#635bff` 紫 + `#ff6e40` 橙的微妙组合
- **排版戏剧性**：超大字号、宽松行距、强调对比
- **细节狂魔**：渐隐、模糊、微光、3D 几何
- **非典型落地页**：滚动故事化、交互式演示

## 配色

```css
--color-primary: oklch(0.65 0.20 30);       /* 橙红 */
--color-secondary: oklch(0.50 0.18 280);     /* 紫蓝 */
--color-accent: oklch(0.80 0.15 60);        /* 金黄 */
--color-surface: oklch(0.99 0.005 60);      /* 暖白 */
--color-on-surface: oklch(0.20 0.01 30);
```

**HEX**：
- 主：`#ff6e40` / `#635bff` / `#0a2540`

## 字体

- **标题**：`'Sohne', 'Geist', sans-serif`（自家付费）
- **正文**：`'Sohne', 'Geist', sans-serif`
- **等宽**：`'Berkeley Mono', 'JetBrains Mono', monospace`

**替代方案**：`Cabinet Grotesk` / `General Sans`（免费近替）

## 关键组件

| 组件 | 特点 |
|------|------|
| **Hero** | 大字 + 渐变文字（Stripe 是少数渐变文字不被骂的） |
| **代码 demo** | 终端风格代码 + 实时演示 |
| **Customer Story** | 大图 + 引用 + 数据 |
| **Pricing** | 简单表格（不堆卡片） |
| **Gradient blocks** | 暖色渐变背景区段 |
| **3D product UI** | 产品截图悬浮、3D 倾斜 |

## 适用场景

- ✅ 支付/金融落地页
- ✅ 增长型 SaaS 产品页
- ✅ 开发者向品牌
- ✅ API 产品营销
- ❌ 不适合数据密集后台
- ❌ 不适合政府/医疗（暖色 + 戏剧感太轻浮）

## 反 AI Slop 关键

- 渐变文字 Stripe 用了，但**只在"Stripe"logo 这种品牌元素**，不要到处用
- 卡片有变化尺寸（不全是相同 icon+heading+text）
- Hero 戏剧性但有具体价值主张
- 真实客户数据、真实产品截图

## 在 foundry 中使用

调色板选择：**暖色商务**（配色策略 Committed）
字体配对：**英文品牌（General Sans）** 或 **英文表现（Cabinet Grotesk）**
