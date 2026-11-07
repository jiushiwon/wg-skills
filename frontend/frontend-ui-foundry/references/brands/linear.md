# Linear

> 项目管理的极简代表。**冷色 Restrained**，几何感、克制、开发者气质。

---

## 定位

项目管理、问题跟踪、SaaS 工具。设计师和工程师的最爱。

## 风格 DNA

- **冷色 Restrained**：紫蓝 `#5e6ad2` 占 ≤10%
- **大量留白**：黑/白/灰主导
- **几何感**：圆角小（4-8px）、细线、几何图标
- **微动效**：克制、精确、不浮夸
- **极简文案**：每个词都有用

## 配色

```css
--color-primary: oklch(0.55 0.20 265);       /* 紫蓝 */
--color-secondary: oklch(0.50 0.05 240);
--color-accent: oklch(0.70 0.15 200);        /* 青蓝点缀 */
--color-surface: oklch(0.99 0.005 240);      /* 白 */
--color-surface-dark: oklch(0.10 0.005 240); /* 近黑 */
--color-on-surface: oklch(0.10 0.005 240);
--color-on-surface-dark: oklch(0.95 0.005 240);
```

**HEX**：
- 主：`#5e6ad2`
- 暗背景：`#08090a`
- 亮背景：`#fbfbfb`

## 字体

- **标题**：`'Inter', sans-serif`（注意：Linear 是 Inter 少数合理用例之一）
- **正文**：`'Inter', sans-serif`
- **等宽**：`'Berkeley Mono', 'JetBrains Mono', monospace`

**警告**：Inter 是 AI slop 标志，**只有 Linear 这种已经定义视觉的极简场景**才考虑用，新项目建议用 **Geist** 替代。

## 关键组件

| 组件 | 特点 |
|------|------|
| **Top Nav** | 极简，左 logo + 右操作 |
| **Sidebar** | 折叠式，240/64px |
| **Issue Card** | 紧凑、状态色块、无装饰 |
| **Issue Detail** | 三栏：属性/内容/评论 |
| **Command Palette** | Cmd+K 全局搜索 |
| **Empty State** | 插画 + 简洁 CTA |
| **Status Indicator** | 几何圆点 + 文字 |

## 适用场景

- ✅ SaaS 产品落地页
- ✅ 开发者工具
- ✅ 后台管理系统
- ✅ 极简博客
- ❌ 不适合儿童/医疗（太冷）
- ❌ 不适合消费电子（太克制）

## 反 AI Slop 关键

- 卡片尺寸变化（不全是 1:1:1）
- 文字密度高、字间距精确
- 状态色块用几何而非 emoji
- 不堆 icon 网格

## 在 foundry 中使用

调色板选择：**冷调极简**（Restrained）
字体配对：**英文极简（Geist）**（避免 Inter 单独用）
