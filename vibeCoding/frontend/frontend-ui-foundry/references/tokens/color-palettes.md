# 调色板（Color Palettes）

10 套主流风格，每套提供 OKLCH/HSL/HEX 三种格式 + 角色映射。**生成与优化时直接选用整套，不可拆零混用**。

---

## 1. 赤琥金（Vermilion-amber）— 默认调色板

**美学定位**：中国科技 + 文学审美。**适用场景**：中文官网、文创产品、文化品牌、企业品牌站、文档站。

**色彩来源**：`#c45c48` 朱砂红 / `#d4a574` 琥珀金 / `#b87333` 古铜金 / `#1a1a1a` 墨黑 / `#f5f1e8` 宣纸白。

### OKLCH
```css
--color-primary: oklch(0.55 0.16 28);          /* 朱砂红 */
--color-primary-hover: oklch(0.48 0.18 28);
--color-secondary: oklch(0.74 0.10 75);        /* 琥珀金 */
--color-accent: oklch(0.62 0.12 60);           /* 古铜金 */
--color-surface: oklch(0.97 0.01 75);          /* 宣纸白 */
--color-surface-tinted: oklch(0.94 0.03 75);
--color-on-surface: oklch(0.18 0.01 30);       /* 墨黑 */
--color-on-surface-muted: oklch(0.45 0.01 30);
--color-border: oklch(0.85 0.02 60);
--color-border-strong: oklch(0.65 0.04 50);
--color-error: oklch(0.55 0.20 25);
--color-success: oklch(0.60 0.15 145);
--color-warning: oklch(0.75 0.15 80);
```

### HSL / HEX 备查
| 角色 | HEX | HSL |
|------|-----|-----|
| primary | #c45c48 | hsl(8 51% 53%) |
| secondary | #d4a574 | hsl(32 53% 64%) |
| accent | #b87333 | hsl(28 56% 46%) |
| surface | #f5f1e8 | hsl(38 39% 94%) |
| on-surface | #1a1a1a | hsl(0 0% 10%) |

### 配色策略
- **承诺度**：Committed（朱砂红占 30-40% 表面）
- **辅助色克制**：琥珀金仅在 hover/active 出现
- **文字对比度**：墨黑 on 宣纸白 = 14.8:1（AAA）

---

## 2. 冷调极简（Cold Minimal）

**美学定位**：Linear / Vercel / Geist 风。**适用场景**：SaaS 产品页、开发者工具、技术品牌、极简博客。

### OKLCH
```css
--color-primary: oklch(0.55 0.20 250);
--color-primary-hover: oklch(0.48 0.22 250);
--color-secondary: oklch(0.70 0.15 250);
--color-accent: oklch(0.75 0.18 200);
--color-surface: oklch(0.99 0.005 240);
--color-surface-tinted: oklch(0.96 0.01 240);
--color-on-surface: oklch(0.15 0.01 240);
--color-on-surface-muted: oklch(0.45 0.01 240);
--color-border: oklch(0.90 0.005 240);
--color-border-strong: oklch(0.70 0.01 240);
--color-error: oklch(0.55 0.20 25);
--color-success: oklch(0.65 0.18 145);
--color-warning: oklch(0.75 0.15 80);
```

### HSL / HEX
| 角色 | HEX |
|------|-----|
| primary | #4f46e5 |
| surface | #fafafa |
| on-surface | #0a0a0a |

### 配色策略
- **承诺度**：Restrained（主色 ≤10%，仅在 CTA/链接出现）
- **大量留白**：surface 占 70%+
- **细线边框**代替阴影

---

## 3. 暖色商务（Warm Business）

**美学定位**：Stripe 风。**适用场景**：支付/电商/金融科技、增长型 SaaS、产品落地页。

### OKLCH
```css
--color-primary: oklch(0.65 0.20 30);
--color-primary-hover: oklch(0.58 0.22 30);
--color-secondary: oklch(0.75 0.15 50);
--color-accent: oklch(0.50 0.18 280);
--color-surface: oklch(0.98 0.01 60);
--color-surface-tinted: oklch(0.95 0.03 60);
--color-on-surface: oklch(0.20 0.01 30);
--color-on-surface-muted: oklch(0.50 0.01 30);
--color-border: oklch(0.88 0.02 50);
--color-border-strong: oklch(0.68 0.05 40);
--color-error: oklch(0.55 0.20 25);
--color-success: oklch(0.65 0.18 145);
--color-warning: oklch(0.75 0.15 80);
```

### HEX
| 角色 | HEX |
|------|-----|
| primary | #e8734a |
| accent | #635bff |
| surface | #fff8f3 |

### 配色策略
- **承诺度**：Committed
- **橙红 + 紫点缀**形成张力
- **柔和背景**减少冷感

---

## 4. 数据深色（Data Dark）

**美学定位**：Supabase / Grafana / 观测仪表盘。**适用场景**：监控面板、数据可视化、运维工具、技术后台。

### OKLCH
```css
--color-primary: oklch(0.65 0.18 195);
--color-primary-hover: oklch(0.58 0.20 195);
--color-secondary: oklch(0.60 0.15 220);
--color-accent: oklch(0.70 0.20 145);
--color-surface: oklch(0.18 0.01 220);
--color-surface-tinted: oklch(0.22 0.01 220);
--color-on-surface: oklch(0.95 0.005 220);
--color-on-surface-muted: oklch(0.65 0.01 220);
--color-border: oklch(0.30 0.01 220);
--color-border-strong: oklch(0.45 0.02 220);
--color-error: oklch(0.65 0.20 25);
--color-success: oklch(0.70 0.18 145);
--color-warning: oklch(0.78 0.15 80);
```

### HEX
| 角色 | HEX |
|------|-----|
| primary | #3ecf8e |
| surface | #0f172a |
| on-surface | #f1f5f9 |

### 配色策略
- **承诺度**：Full（4 角色齐备：蓝/青/绿/红覆盖数据维度）
- **深色为默认**（物理场景：SRE 凌晨 2 点看告警）
- **高对比文本**避免暗背景疲劳

---

## 5. 金融稳重（Finance Solid）

**美学定位**：Revolut / 传统银行。**适用场景**：银行 App、支付、财富管理、企业金融。

### OKLCH
```css
--color-primary: oklch(0.35 0.10 155);
--color-primary-hover: oklch(0.30 0.12 155);
--color-secondary: oklch(0.65 0.12 75);
--color-accent: oklch(0.50 0.05 240);
--color-surface: oklch(0.99 0.005 75);
--color-surface-tinted: oklch(0.95 0.01 75);
--color-on-surface: oklch(0.20 0.01 155);
--color-on-surface-muted: oklch(0.50 0.01 155);
--color-border: oklch(0.85 0.02 75);
--color-border-strong: oklch(0.65 0.04 75);
--color-error: oklch(0.50 0.20 25);
--color-success: oklch(0.55 0.15 145);
--color-warning: oklch(0.75 0.15 80);
```

### HEX
| 角色 | HEX |
|------|-----|
| primary | #14532d |
| secondary | #b08840 |
| surface | #fbfaf6 |

### 配色策略
- **承诺度**：Restrained（深绿占主导，金色仅在奖励/会员/等级）
- **大量留白** + 衬线数字
- **柔和阴影**避免廉价感

---

## 6. 文档清爽（Docs Fresh）

**美学定位**：Mintlify / Tailwind 文档。**适用场景**：API 文档、帮助中心、技术博客、开源项目。

### OKLCH
```css
--color-primary: oklch(0.55 0.18 270);
--color-primary-hover: oklch(0.48 0.20 270);
--color-secondary: oklch(0.60 0.10 220);
--color-accent: oklch(0.70 0.15 30);
--color-surface: oklch(0.99 0.003 270);
--color-surface-tinted: oklch(0.96 0.01 270);
--color-on-surface: oklch(0.20 0.01 270);
--color-on-surface-muted: oklch(0.50 0.01 270);
--color-border: oklch(0.88 0.01 270);
--color-border-strong: oklch(0.68 0.02 270);
--color-error: oklch(0.55 0.20 25);
--color-success: oklch(0.65 0.18 145);
--color-warning: oklch(0.75 0.15 80);
--color-code-bg: oklch(0.96 0.01 270);
```

### HEX
| 角色 | HEX |
|------|-----|
| primary | #6366f1 |
| surface | #fafaf9 |
| code-bg | #f5f5f4 |

### 配色策略
- **承诺度**：Restrained
- **等宽字体色块**突出代码
- **三栏布局**：导航/内容/TOC

---

## 7. 创意广告（Creative Ad）

**美学定位**：Apple 风。**适用场景**：消费电子、高端品牌、产品发布、创意机构作品集。

### OKLCH
```css
--color-primary: oklch(0.20 0.01 270);
--color-primary-hover: oklch(0.10 0.01 270);
--color-secondary: oklch(0.50 0.02 270);
--color-accent: oklch(0.65 0.20 30);
--color-surface: oklch(0.99 0.00 0);
--color-surface-tinted: oklch(0.97 0.00 0);
--color-on-surface: oklch(0.10 0.00 0);
--color-on-surface-muted: oklch(0.50 0.00 0);
--color-border: oklch(0.90 0.00 0);
--color-border-strong: oklch(0.70 0.00 0);
--color-error: oklch(0.55 0.20 25);
--color-success: oklch(0.65 0.18 145);
--color-warning: oklch(0.75 0.15 80);
```

### HEX
| 角色 | HEX |
|------|-----|
| primary | #1d1d1f |
| surface | #ffffff |
| accent | #f56300 |

### 配色策略
- **承诺度**：Drenched（白底黑字占 90%，强调色仅在 CTA）
- **超大字** + 大量留白
- **摄影级视觉**做主元素

---

## 8. 原生移动（Native Mobile）

**美学定位**：iOS HIG + Material 3 系统色。**适用场景**：iOS App、Android App、小程序、跨端原生。

### iOS OKLCH
```css
--color-primary: oklch(0.55 0.20 250);          /* 系统蓝 */
--color-primary-hover: oklch(0.48 0.22 250);
--color-secondary: oklch(0.65 0.18 320);
--color-accent: oklch(0.70 0.18 30);
--color-surface: oklch(0.99 0.00 270);
--color-surface-tinted: oklch(0.96 0.01 270);
--color-on-surface: oklch(0.10 0.00 270);
--color-on-surface-muted: oklch(0.50 0.00 270);
--color-border: oklch(0.88 0.01 270);
--color-border-strong: oklch(0.70 0.02 270);
```

### Material 3 OKLCH
```css
--color-primary: oklch(0.55 0.18 280);
--color-secondary: oklch(0.65 0.15 200);
--color-tertiary: oklch(0.70 0.18 30);
--color-surface: oklch(0.98 0.01 280);
--color-surface-container: oklch(0.94 0.01 280);
--color-on-surface: oklch(0.15 0.01 280);
```

### HEX 备查
| 系统 | 角色 | HEX |
|------|------|-----|
| iOS | primary | #007aff |
| iOS | systemGray | #8e8e93 |
| Material | primary | #6750a4 |

### 配色策略
- **承诺度**：Restrained（系统色仅 1-2 个）
- **大量灰阶** + 系统色点缀
- **暗色模式独立 token**（不直接反转）

---

## 9. 3D 沉浸（3D Immersive）

**美学定位**：Lovable / WebGL 沉浸式。**适用场景**：3D 产品展示、游戏化落地页、创意机构、AI 产品官网。

### OKLCH
```css
--color-primary: oklch(0.70 0.20 320);
--color-primary-hover: oklch(0.63 0.22 320);
--color-secondary: oklch(0.65 0.22 220);
--color-accent: oklch(0.80 0.20 80);
--color-surface: oklch(0.10 0.02 280);
--color-surface-tinted: oklch(0.15 0.03 280);
--color-on-surface: oklch(0.95 0.01 280);
--color-on-surface-muted: oklch(0.65 0.02 280);
--color-border: oklch(0.30 0.04 280);
--color-border-strong: oklch(0.50 0.06 280);
--color-glow: oklch(0.70 0.30 320);
```

### HEX
| 角色 | HEX |
|------|-----|
| primary | #c084fc |
| secondary | #38bdf8 |
| surface | #0c0a1f |
| glow | #e879f9 |

### 配色策略
- **承诺度**：Drenched（深紫黑占满，霓虹仅在交互元素）
- **辉光效果** + 玻璃浮层
- **暗色为唯一默认**

---

## 10. 2B 灰蓝（B2B Slate）

**美学定位**：企业 SaaS / CRM / ERP。**适用场景**：企业内部系统、CRM、ERP、协同工具、垂直 SaaS。

### OKLCH
```css
--color-primary: oklch(0.45 0.10 240);
--color-primary-hover: oklch(0.38 0.12 240);
--color-secondary: oklch(0.55 0.08 220);
--color-accent: oklch(0.60 0.15 200);
--color-surface: oklch(0.98 0.005 240);
--color-surface-tinted: oklch(0.95 0.01 240);
--color-on-surface: oklch(0.18 0.01 240);
--color-on-surface-muted: oklch(0.45 0.01 240);
--color-border: oklch(0.85 0.01 240);
--color-border-strong: oklch(0.65 0.02 240);
--color-error: oklch(0.55 0.20 25);
--color-success: oklch(0.60 0.15 145);
--color-warning: oklch(0.75 0.15 80);
```

### HEX
| 角色 | HEX |
|------|-----|
| primary | #1e3a8a |
| surface | #f8fafc |
| on-surface | #0f172a |

### 配色策略
- **承诺度**：Restrained
- **蓝灰主导** + 中性灰
- **数据密度高**时仍能保持秩序

---

## 调色板速查矩阵

| 调色板 | 承诺度 | 主题 | 适用场景 |
|--------|--------|------|----------|
| 赤琥金 | Committed | 浅（可配深） | 中文官网、文创、文化品牌 |
| 冷调极简 | Restrained | 浅（可配深） | 开发者工具、技术品牌 |
| 暖色商务 | Committed | 浅 | 支付、电商、SaaS |
| 数据深色 | Full | 深（默认） | 监控、运维、技术后台 |
| 金融稳重 | Restrained | 浅 | 银行、财富管理 |
| 文档清爽 | Restrained | 浅 | API 文档、帮助中心 |
| 创意广告 | Drenched | 浅 | 消费电子、高端品牌 |
| 原生移动 | Restrained | 浅/深 | iOS/Android App |
| 3D 沉浸 | Drenched | 深 | 3D 展示、创意机构 |
| 2B 灰蓝 | Restrained | 浅 | 企业 SaaS、CRM、ERP |

---

## 暗色模式派生

任何调色板的暗色模式**不直接反转**，而是用同色相 + 提亮 5-10% lightness + 降 chroma 30%：

```css
/* 浅色 → 暗色规则 */
--color-surface: oklch(0.99 0.005 240);          /* 浅 */
--color-surface-dark: oklch(0.18 0.008 240);     /* 暗（提亮 surface lightness 0.18，chroma 略增） */
--color-on-surface: oklch(0.15 0.01 240);        /* 浅：深色文字 */
--color-on-surface-dark: oklch(0.95 0.005 240);  /* 暗：浅色文字 */
--color-primary: oklch(0.55 0.20 250);            /* 浅 */
--color-primary-dark: oklch(0.65 0.20 250);      /* 暗：chroma 不变，lightness 略提 */
```

测试时单独验对比度，不复用浅色 token。
