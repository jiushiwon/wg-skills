# Mintlify

> 文档站的事实标准。**米白 Restrained**，阅读优先。

---

## 定位

API 文档、SDK 文档、帮助中心、开源项目文档。

## 风格 DNA

- **米白 Restrained**：米色背景 + 靛蓝强调
- **阅读优先**：行长 65-75ch、行高 1.7
- **代码块高亮**：Shiki + 主题色匹配
- **三栏布局**：左导航 / 主内容 / 右 TOC
- **API 引用**：自动从代码生成

## 配色

```css
--color-primary: oklch(0.55 0.18 270);        /* 靛蓝 */
--color-secondary: oklch(0.60 0.10 220);
--color-accent: oklch(0.70 0.15 30);
--color-surface: oklch(0.99 0.003 270);       /* 米白 */
--color-surface-tinted: oklch(0.96 0.01 270);
--color-code-bg: oklch(0.96 0.01 270);
--color-on-surface: oklch(0.20 0.01 270);
--color-on-surface-muted: oklch(0.50 0.01 270);
--color-border: oklch(0.88 0.01 270);
```

**HEX**：
- 靛蓝：`#6366f1`
- 米白：`#fafaf9`
- 代码背景：`#f5f5f4`

## 字体

- **Inter**（变体）
- **JetBrains Mono**（代码）

```css
--font-family-sans: 'Inter', 'Geist', system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

## 关键组件

| 组件 | 特点 |
|------|------|
| **三栏布局** | 280px sidebar / 1fr / 240px TOC |
| **代码块** | 复制按钮 + 语言标签 + 行号 |
| **API Reference** | 端点 + 参数 + 响应 |
| **Callout** | Note / Tip / Warning / Danger |
| **Search** | Cmd+K 全文搜索 |
| **Version Switcher** | 顶栏下拉 |
| **TOC** | 右侧目录，scroll spy |

## 适用场景

- ✅ API 文档
- ✅ SDK 文档
- ✅ 帮助中心
- ✅ 知识库
- ✅ 开源项目 README
- ❌ 不适合营销页（太学术）
- ❌ 不适合后台（太静态）

## 反 AI Slop 关键

- 渐变 / 装饰元素 = 0
- 内容为王
- 行高 1.7、行长 65-75ch
- 代码块质量（语法高亮、行号、复制）

## 在 foundry 中使用

调色板选择：**文档清爽**（Restrained，米白）
字体配对：**英文极简（Geist）** 或 **英文数据（IBM Plex）**
场景：**docs-site**
