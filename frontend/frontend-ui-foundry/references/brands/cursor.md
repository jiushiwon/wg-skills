# Cursor

> AI 代码编辑器。**紫色 + 暗色 + 极简**。

---

## 定位

基于 VS Code 的 AI 代码编辑器，自动补全、对话修改、多文件编辑。

## 风格 DNA

- **紫色渐变** + 暗色背景
- **代码为中心**：编辑器是 UI 主体
- **极简 UI**：Chrome 最小化
- **AI 交互**：Cmd+K 命令、Cmd+L 对话、Tab 补全
- **开发者视角**：键盘优先

## 配色

```css
--color-primary: oklch(0.55 0.20 290);         /* 紫蓝 */
--color-secondary: oklch(0.50 0.18 320);
--color-accent: oklch(0.75 0.18 280);
--color-surface: oklch(0.12 0.01 270);         /* 近黑 */
--color-surface-tinted: oklch(0.18 0.01 270);
--color-on-surface: oklch(0.95 0.005 270);
--color-on-surface-muted: oklch(0.65 0.01 270);
--color-border: oklch(0.25 0.01 270);
--color-error: oklch(0.65 0.20 25);
```

**HEX**：
- 紫蓝：`#7c3aed` / `#8b5cf6`
- 背景：`#1a1a1a` / `#0d0d0d`
- 文字：`#e5e5e5`

## 字体

- **Inter**（UI）
- **JetBrains Mono**（代码，经典）

```css
--font-family-sans: 'Inter', 'Geist', system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

## 关键组件

| 组件 | 特点 |
|------|------|
| **Editor** | Monaco / CodeMirror 6 |
| **Sidebar** | 文件树 + 搜索 + Git |
| **Chat Panel** | 右侧 AI 对话 |
| **Cmd+K** | 命令面板 |
| **Inline Edit** | Cmd+K 编辑选中代码 |
| **Composer** | 多文件编辑 |
| **Tab 补全** | 灰色 ghost text |

## 适用场景

- ✅ 开发者工具
- ✅ AI 代码助手
- ✅ IDE / 编辑器类产品
- ❌ 不适合非技术用户
- ❌ 不适合移动端

## 反 AI Slop 关键

- UI Chrome 极简
- 键盘优先
- 渐变只在 logo / 启动屏
- 性能关键（编辑器必须 60fps）

## 在 foundry 中使用

调色板选择：**冷调极简（深色变体）**
字体配对：**英文数据（IBM Plex）** 或 **英文极简（Geist）**
场景：**admin-dashboard**（代码密集型）
