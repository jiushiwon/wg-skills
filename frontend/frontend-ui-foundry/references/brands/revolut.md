# Revolut

> 数字银行。**黑底 + 紫高亮**，稳重又现代。

---

## 定位

数字银行、加密货币、国际汇款、储蓄、投资。1+ 亿用户。

## 风格 DNA

- **黑底 Restrained**：纯黑 + 紫色高亮
- **稳重但现代**：不浮夸、强调信任
- **极简文案**：金融产品语言精确
- **卡片 UI**：银行卡、交易卡
- **数据可视化**：饼图、折线、柱状

## 配色

```css
--color-primary: oklch(0.10 0.00 0);           /* 纯黑 */
--color-secondary: oklch(0.55 0.25 320);       /* 紫高亮 */
--color-accent: oklch(0.65 0.20 50);           /* 金 */
--color-surface: oklch(0.99 0.005 75);         /* 浅米 */
--color-surface-dark: oklch(0.10 0.00 0);
--color-on-surface: oklch(0.15 0.01 270);
--color-on-surface-dark: oklch(0.95 0.005 270);
--color-success: oklch(0.65 0.20 145);
--color-error: oklch(0.55 0.25 25);
```

**HEX**：
- 黑：`#0d0d0d`
- 紫高亮：`#8e44ad` / `#cb6ce6`
- 金：`#d4a574`

## 字体

- **Inter**（变体）

```css
--font-family-sans: 'Inter', 'Geist', system-ui, sans-serif;
```

## 关键组件

| 组件 | 特点 |
|------|------|
| **Card UI** | 银行卡可视化 |
| **Amount Display** | 大金额 + tabular-nums |
| **Transaction List** | 紧凑列表，icon + 文字 + 金额 |
| **Quick Actions** | 圆形操作按钮网格 |
| **Charts** | 资产走势、分布 |
| **Security** | Face ID / PIN 强制 |

## 适用场景

- ✅ 银行 App
- ✅ 支付钱包
- ✅ 财富管理
- ✅ 加密交易
- ❌ 不适合儿童产品
- ❌ 不适合创意营销

## 反 AI Slop 关键

- 数字用 tabular-nums（关键）
- 关键操作二次确认
- 不浮夸、强调信任
- 真实银行级安全规范

## 在 foundry 中使用

调色板选择：**金融稳重**（Restrained + 黑紫高亮变体）
字体配对：**英文数据（IBM Plex）** 或 **英文极简（Geist）**
场景：**fintech-app**
