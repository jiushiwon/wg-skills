# Claude

> Anthropic 的对话式 AI。**焦橙 Restrained**，文学化、克制。

---

## 定位

Anthropic 旗下安全、helpful、harmless 大模型。Claude.ai 对话产品。

## 风格 DNA

- **焦橙 Restrained**：`#cc785c` 暖色调点缀
- **文学化排版**：Tiempos / Styrene 衬线感
- **对话式 UI**：消息流 + 输入框
- **极简 Chrome**：logo + 头像
- **信任感**：克制的装饰、强调内容

## 配色

```css
--color-primary: oklch(0.60 0.12 40);          /* 焦橙 */
--color-primary-hover: oklch(0.55 0.14 40);
--color-secondary: oklch(0.55 0.10 30);        /* 深橙棕 */
--color-accent: oklch(0.65 0.15 60);           /* 暖琥珀 */
--color-surface: oklch(0.99 0.005 40);         /* 暖白 */
--color-surface-tinted: oklch(0.96 0.02 40);
--color-on-surface: oklch(0.20 0.01 30);
--color-on-surface-muted: oklch(0.45 0.02 30);
--color-border: oklch(0.88 0.02 40);
```

**HEX**：
- 焦橙：`#cc785c`
- 深橙棕：`#8b5a3c`
- 暖白：`#faf8f5`

## 字体

- **Tiempos**（衬线，标题）
- **Styrene**（无衬线，正文）
- **Berkeley Mono**（代码）

```css
--font-family-sans: 'Styrene', 'Geist', system-ui, sans-serif;
--font-family-serif: 'Tiempos', 'Source Serif Pro', Georgia, serif;
--font-family-mono: 'Berkeley Mono', 'JetBrains Mono', monospace;
```

**替代方案**：
- 衬线：Fraunces / Source Han Serif SC
- 无衬线：General Sans / Cabinet Grotesk

## 关键组件

| 组件 | 特点 |
|------|------|
| **Message List** | 用户/AI 气泡，宽松排版 |
| **Input** | 底部固定 + 自动撑高 |
| **Sidebar** | 历史会话 + 新对话 |
| **Empty State** | 欢迎语 + 建议 |
| **Code Block** | 等宽 + 复制 |
| **Artifact** | 长内容可展开 |

## 适用场景

- ✅ AI 对话产品
- ✅ 内容创作工具
- ✅ 教育 / 写作平台
- ✅ 文学 / 文化品牌
- ❌ 不适合游戏化
- ❌ 不适合 3D 沉浸

## 反 AI Slop 关键

- 渐变 = 0
- 装饰元素 = 0
- 内容为王
- 暖色克制（≤10% 表面）

## 在 foundry 中使用

调色板选择：**赤琥金**（最接近 Claude 的中文科技风）
字体配对：**中文文学** 或 **英文编辑（Fraunces）**
场景：**docs-site** / **pc-corporate**
