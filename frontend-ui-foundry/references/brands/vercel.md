# Vercel

> 前端部署平台。**黑白极简 + 几何渐变**。

---

## 定位

Next.js 母公司，前端部署、Serverless、Edge Functions。

## 风格 DNA

- **黑白极简**：黑 + 白 + 灰
- **Geist 字体**：自研开源
- **几何感**：网格、线条、3D 几何体
- **戏剧性微动效**：hover 倾斜、滚动揭示
- **代码优先**：开发者视角

## 配色

```css
--color-primary: oklch(0.10 0.00 0);         /* 纯黑 */
--color-surface: oklch(0.99 0.00 0);         /* 纯白 */
--color-surface-dark: oklch(0.10 0.00 0);   /* 纯黑 */
--color-on-surface: oklch(0.10 0.00 0);
--color-on-surface-dark: oklch(0.99 0.00 0);
--color-accent: oklch(0.70 0.20 320);        /* 紫粉渐变点缀 */
```

**HEX**：
- 黑：`#000000`
- 白：`#ffffff`
- 紫粉渐变：`#ff0080` → `#7928ca`

## 字体

- **Geist Sans**（开源，免费）
- **Geist Mono**（开源，免费）

```css
--font-family-sans: 'Geist', system-ui, sans-serif;
--font-family-mono: 'Geist Mono', 'JetBrains Mono', monospace;
```

## 关键组件

| 组件 | 特点 |
|------|------|
| **Hero** | 黑白大字 + 渐变几何背景 |
| **Logo Wall** | 灰度 logo 网格 |
| **Feature Grid** | 2x2 大尺寸特性卡 |
| **Stats** | 大数字 + 简洁说明 |
| **Code Block** | 等宽字体 + 暗背景 |
| **Geometric BG** | 渐变 + 模糊 + 几何形 |

## 适用场景

- ✅ 开发者工具品牌
- ✅ 技术产品落地页
- ✅ 极简博客
- ✅ 技术文档
- ❌ 不适合企业/政府（太冷）
- ❌ 不适合消费产品（太技术）

## 反 AI Slop 关键

- 渐变只在"装饰几何背景"用，**不是文字**
- 大字对比强烈
- 真实开发者故事、真实数据
- Geist 字体是开源的，所有人都能用但不是 AI 默认

## 在 foundry 中使用

调色板选择：**冷调极简**（黑白变体）
字体配对：**英文极简（Geist）**（推荐，最匹配的免费字体）
