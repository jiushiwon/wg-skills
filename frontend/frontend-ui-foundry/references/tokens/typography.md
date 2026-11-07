# 字体配对（Typography）

15 套主流字体配对。**禁止使用 Inter / Roboto / Arial（AI slop 标志）**。

每套包含：标题字体 / 正文字体 / 等宽字体 / 字号阶 / 字重 / 行高 / 行长。

---

## 通用规则

- **行长**：65-75ch（桌面）/ 35-60ch（移动）
- **行高**：正文 1.5-1.75，标题 1.1-1.3，代码 1.6
- **字号阶**：每级之间比例 ≥1.25（推荐 1.25 模数）
- **字重对比**：标题 600-700，正文 400，强调 500
- **西文优先 + 中文 fallback**：西文字体在前，中文 fallback 在后
- **衬线 vs 无衬线**：标题可衬线（编辑感/品牌感），正文必无衬线（可读性）
- **等宽字体**：代码区必用 tabular figures（数据列对齐）

---

## 1. 中文科技

**字体配对**：
- 标题：`'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`
- 正文：`'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`
- 等宽：`'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`

**字号阶（模数 1.25）**：
```
12 / 14 / 16 / 20 / 24 / 32 / 40 / 56 / 72 px
xs / sm / base / lg / xl / 2xl / 3xl / 4xl / 5xl
```

**适用场景**：通用中文产品、技术博客、企业站。

---

## 2. 中文文学

**字体配对**：
- 标题：`'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', serif`
- 正文：`'Noto Sans SC', 'PingFang SC', sans-serif`
- 等宽：`'JetBrains Mono', monospace`

**字号阶**：12 / 14 / 16 / 20 / 24 / 30 / 38 / 48 / 60 px（编辑感，较克制）

**适用场景**：文化品牌、文创产品、杂志感官网、出版物。

---

## 3. 中文政务

**字体配对**：
- 标题：`'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`（粗体）
- 正文：`'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`
- 等宽：`'Source Code Pro', monospace`

**字号阶**：14 / 16 / 18 / 22 / 28 / 36 / 48 px（保守、稳重）

**适用场景**：政务系统、官方网站、新闻机构、央企/银行。

---

## 4. 英文极简（Geist）

**字体配对**：
- 标题：`'Geist', 'Inter Tight', system-ui, sans-serif`（注意 Inter 是 fallback 而非首选）
- 正文：`'Geist', 'Inter Tight', system-ui, sans-serif`
- 等宽：`'Geist Mono', 'JetBrains Mono', monospace`

**字号阶**：12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 / 72 px

**适用场景**：Vercel 风格、开发者工具、技术品牌、极简 SaaS。

---

## 5. 英文编辑（Fraunces）

**字体配对**：
- 标题：`'Fraunces', 'Playfair Display', Georgia, serif`
- 正文：`'Inter Tight', 'Geist', system-ui, sans-serif`（正文用无衬线更可读）
- 等宽：`'JetBrains Mono', monospace`

**字号阶**：14 / 16 / 18 / 22 / 28 / 36 / 48 / 64 / 80 px（编辑感，差距大）

**适用场景**：创意机构、博客、杂志风落地页、长文阅读。

---

## 6. 英文数据（IBM Plex）

**字体配对**：
- 标题：`'IBM Plex Sans', 'Geist', system-ui, sans-serif`
- 正文：`'IBM Plex Sans', 'Geist', system-ui, sans-serif`
- 等宽：`'IBM Plex Mono', 'JetBrains Mono', monospace`

**字号阶**：12 / 14 / 16 / 18 / 22 / 28 / 36 px（克制）

**适用场景**：技术后台、数据仪表盘、监控工具、IBM 风企业产品。

---

## 7. 英文品牌（General Sans）

**字体配对**：
- 标题：`'General Sans', 'Satoshi', 'Geist', system-ui, sans-serif`
- 正文：`'General Sans', 'Satoshi', 'Geist', system-ui, sans-serif`
- 等宽：`'JetBrains Mono', monospace`

**字号阶**：12 / 14 / 16 / 18 / 24 / 32 / 48 / 64 px

**适用场景**：现代 SaaS 落地页、初创公司产品页、Stripe 风品牌。

---

## 8. 英文表现（Cabinet Grotesk）

**字体配对**：
- 标题：`'Cabinet Grotesk', 'General Sans', 'Geist', system-ui, sans-serif`
- 正文：`'Cabinet Grotesk', 'General Sans', system-ui, sans-serif`
- 等宽：`'JetBrains Mono', monospace`

**字号阶**：14 / 16 / 18 / 24 / 32 / 40 / 56 / 80 px（戏剧性）

**适用场景**：创意 SaaS 落地页、产品发布、Linear 风品牌。

---

## 9. 衬线精致（Newsreader）

**字体配对**：
- 标题：`'Newsreader', 'Fraunces', 'Source Serif Pro', Georgia, serif`
- 正文：`'Newsreader', 'Source Serif Pro', Georgia, serif`
- 等宽：`'JetBrains Mono', monospace`

**字号阶**：14 / 16 / 18 / 22 / 28 / 36 / 48 px

**适用场景**：出版、博客、编辑感产品页、新闻应用。

---

## 10. 工业风（Space Mono）

**字体配对**：
- 标题：`'Space Grotesk', 'Geist', sans-serif`（注：Space Grotesk 单独标题可控，全文使用算 AI slop）
- 正文：`'IBM Plex Sans', sans-serif`
- 等宽：`'Space Mono', 'JetBrains Mono', monospace`

**字号阶**：12 / 14 / 16 / 20 / 24 / 32 / 48 px

**适用场景**：技术品牌、终端风落地页、加密货币、开发者工具。

---

## 11. 中文 + 英文混排（思源黑 + 通用英文）

**字体配对**：
- 标题：`'Noto Sans SC', 'PingFang SC', 'General Sans', 'Geist', sans-serif`
- 正文：同上
- 等宽：`'JetBrains Mono', 'Fira Code', monospace`

**应用规则**：英文标题用 `General Sans`，中文标题用 `Noto Sans SC`，浏览器自动 fallback。

**适用场景**：出海产品、国际化 SaaS、中英双语官网。

---

## 12. 圆体亲和（Dosis / Comfortaa）

**字体配对**：
- 标题：`'Dosis', 'Comfortaa', 'Quicksand', sans-serif`（柔和、圆润）
- 正文：`'Dosis', 'Quicksand', 'Geist', system-ui, sans-serif`
- 等宽：`'JetBrains Mono', monospace`

**字号阶**：14 / 16 / 18 / 22 / 28 / 36 px

**适用场景**：儿童产品、健康医疗、宠物、女性向产品（小心"医疗=圆体"反射）。

---

## 13. 衬线数据（Playfair + Plex）

**字体配对**：
- 标题：`'Playfair Display', 'Source Han Serif SC', serif`（数字展示用）
- 正文：`'IBM Plex Sans', 'Noto Sans SC', sans-serif`
- 等宽：`'IBM Plex Mono', 'JetBrains Mono', monospace`

**适用场景**：奢侈品、珠宝、艺术品电商、高端酒店。

---

## 14. 系统化（iOS HIG / Material 3）

**iOS 字体栈**：
- 标题：`'SF Pro Display', 'SF Pro Text', system-ui, sans-serif`
- 正文：`'SF Pro Text', system-ui, sans-serif`
- 等宽：`'SF Mono', 'JetBrains Mono', monospace`

**Material 字体栈**：
- 标题：`'Roboto Flex', 'Roboto', system-ui, sans-serif`
- 正文：`'Roboto', system-ui, sans-serif`
- 等宽：`'Roboto Mono', 'JetBrains Mono', monospace`

**字号阶（系统规范）**：
- iOS：Large Title 34 / Title 28 / Headline 17（semibold）/ Body 17 / Callout 16 / Subhead 15 / Footnote 13 / Caption 12
- Material：Display L 57 / Headline L 32 / Title L 22 / Body L 16 / Label L 14

**适用场景**：原生 iOS App、原生 Android App、跨端原生应用。

---

## 15. 可变字体（Variable Fonts）

**字体**：单一可变字体支持多字重和宽度。

**推荐字体**：
- `'Inter Variable', 'Geist Variable'`（避免单独 Inter）
- `'Source Han Sans Variable'`（中文）
- `'Recursive', 'General Sans Variable'`
- `'Fraunces Variable'`

**应用**：
```css
--font-weight: 350 700; /* 可变字重范围 */
--font-width: 75 125;   /* 可变字宽 */
```

**适用场景**：需要精细字重控制、对加载体积敏感的项目。

---

## 选型决策树

```
是否中文为主？
├─ 是 → 1 / 2 / 3 / 11
└─ 否 → 4 / 5 / 6 / 7 / 8 / 9 / 10 / 12 / 13 / 14 / 15

是否需要衬线编辑感？
├─ 是 → 2 / 5 / 9 / 13
└─ 否 → 1 / 3 / 4 / 6 / 7 / 8 / 10 / 11 / 14

是否数据密集？
├─ 是 → 6 / 14（IBM Plex / 系统字体）
└─ 否 → 1 / 2 / 4 / 5 / 7 / 8

是否需要戏剧性对比？
├─ 是 → 5 / 8 / 9 / 12
└─ 否 → 1 / 4 / 6 / 14
```

---

## 字号阶 Token

```css
/* 1.25 模数（推荐） */
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.25rem;     /* 20px */
--font-size-xl: 1.5rem;      /* 24px */
--font-size-2xl: 2rem;       /* 32px */
--font-size-3xl: 2.5rem;     /* 40px */
--font-size-4xl: 3.5rem;     /* 56px */
--font-size-5xl: 4.5rem;     /* 72px */

/* 字重 */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* 行高 */
--line-height-tight: 1.1;    /* 标题 */
--line-height-snug: 1.3;     /* 副标题 */
--line-height-normal: 1.5;   /* 正文下限 */
--line-height-relaxed: 1.7;  /* 正文上限/长文 */
--line-height-loose: 1.8;    /* 代码块 */
```

---

## 加载优化

```html
<!-- 关键字体 preload -->
<link rel="preload" href="/fonts/Geist-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Geist-Bold.woff2" as="font" type="font/woff2" crossorigin>

<!-- font-display: swap 避免 FOIT -->
<style>
  @font-face {
    font-family: 'Geist';
    src: url('/fonts/Geist-Regular.woff2') format('woff2');
    font-display: swap;
    font-weight: 400;
  }
</style>
```

- 优先 woff2（30% 小于 woff）
- 子集化（中文/拉丁文分别加载）
- 系统字体作为终极 fallback 避免空白
- 避免超过 3-4 个字体家族
