# Apple

> 消费电子的标杆。**Drenched 白底 + 戏剧性排版**。

---

## 定位

iPhone、Mac、iPad、Apple Watch、Vision Pro。

## 风格 DNA

- **Drenched 白底**：白占 90%，黑色文字 + 强调色
- **戏剧性排版**：超大字、宽松行距
- **产品为中心**：摄影级产品图、视频
- **极简文案**：少即是多
- **空间感**：大量留白制造呼吸

## 配色

```css
--color-primary: oklch(0.20 0.01 270);        /* 近黑 */
--color-surface: oklch(0.99 0.00 0);          /* 纯白 */
--color-on-surface: oklch(0.10 0.00 0);       /* 纯黑 */
--color-accent: oklch(0.65 0.20 30);          /* 橙红（CTA） */
--color-accent-blue: oklch(0.55 0.20 250);    /* iPhone 15 Pro 蓝 */
```

**HEX**：
- 文字：`#1d1d1f`
- 背景：`#ffffff`
- 强调：`#0071e3`（Apple 蓝）

## 字体

- **SF Pro Display**（标题）
- **SF Pro Text**（正文）
- **SF Mono**（代码）

```css
--font-family-sans: 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
--font-family-mono: 'SF Mono', 'JetBrains Mono', monospace;
```

## 关键组件

| 组件 | 特点 |
|------|------|
| **Hero** | 全屏产品图 + 简短标题 + 2 CTA |
| **Product Showcase** | 滚动触发的产品演示 |
| **Nav** | 灰底、磨砂、超小字号 |
| **Spec Sheet** | 数字 + 简洁说明，垂直列表 |
| **CTA Buttons** | 蓝色链接（无按钮形状） |
| **Section Headlines** | 4-5 行大标题 |

## 适用场景

- ✅ 消费电子落地页
- ✅ 高端品牌营销
- ✅ 产品发布会
- ✅ 创意机构作品集
- ❌ 不适合数据/工具（太空）
- ❌ 不适合企业/政府（太高冷）

## 反 AI Slop 关键

- 渐变只在产品本身上（金属、玻璃反光）
- 文字**不用**渐变
- 产品图占主导，UI 极简
- 数字字号戏剧性（48-96px）
- 留白 ≥ 96px section

## 在 foundry 中使用

调色板选择：**创意广告**（Drenched）
字体配对：**系统化（iOS HIG）** 或 **英文编辑（Fraunces）**
