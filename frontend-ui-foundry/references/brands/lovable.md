# Lovable

> AI 产品生成器。**紫黑 Drenched**，3D 沉浸。

---

## 定位

AI 对话生成 Web 应用。提示词 → 可部署的 React App。

## 风格 DNA

- **紫黑 Drenched**：深紫黑背景 + 紫粉霓虹
- **3D 沉浸**：漂浮几何体、辉光、模糊
- **对话式 UI**：聊天式输入 + 实时预览
- **创意活力**：动态、年轻、生成式
- **AI 时代的视觉语言**

## 配色

```css
--color-primary: oklch(0.70 0.20 320);         /* 紫 */
--color-secondary: oklch(0.65 0.22 220);       /* 蓝青 */
--color-accent: oklch(0.80 0.20 80);           /* 暖黄 */
--color-surface: oklch(0.10 0.02 280);         /* 深紫黑 */
--color-surface-tinted: oklch(0.15 0.03 280);
--color-on-surface: oklch(0.95 0.01 280);
--color-on-surface-muted: oklch(0.65 0.02 280);
--color-glow: oklch(0.70 0.30 320);            /* 辉光 */
```

**HEX**：
- 紫：`#c084fc`
- 蓝青：`#38bdf8`
- 背景：`#0c0a1f`
- 辉光：`#e879f9`

## 字体

- **Inter**（变体）
- **JetBrains Mono**（代码）

```css
--font-family-sans: 'Inter', 'Geist', system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', monospace;
```

## 关键组件

| 组件 | 特点 |
|------|------|
| **Hero** | 3D 漂浮几何 + 大字 |
| **Chat Input** | 底部固定 + 多行 + 提交 |
| **Live Preview** | 实时渲染 iframe |
| **Code Editor** | Monaco / CodeMirror |
| **3D Background** | 紫黑渐变 + 几何 + 模糊 |
| **Gradient Text** | 唯一合理用例之一（品牌元素） |

## 适用场景

- ✅ AI 产品官网
- ✅ 创意机构作品集
- ✅ 沉浸式营销页
- ✅ 3D / WebGL 项目
- ✅ 生成式 AI 工具
- ❌ 不适合企业 / 政府
- ❌ 不适合工具型 App（太浮夸）

## 反 AI Slop 关键

- 渐变文字**只在品牌元素**（"Lovable"logo），不滥用
- 3D 装饰必须**真有内容**，不为了装饰而装饰
- 暗色唯一默认
- 性能预算严格（60fps）

## 在 foundry 中使用

调色板选择：**3D 沉浸**（Drenched，深色唯一）
字体配对：**英文极简（Geist）** 或 **英文表现（Cabinet Grotesk）**
场景：**threejs-3d** 或 **landing-marketing**
