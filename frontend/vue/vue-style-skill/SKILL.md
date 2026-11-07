---
name: vue-style-skill
description: Vue 样式基础设施技能。提供纯 HTML/CSS 实现的工具类、动画库、布局方案、重置样式，基于 vue-theme-skill 的 Design Token（主题 Token/色阶/换肤请用 vue-theme-skill）。遵循 vue-generate-skill 规范，纯 CSS 实现，零原生 HTML5 组件，零 emoji。触发词："Vue 样式"、"CSS 变量"、"动画"、"工具类"、"布局"、"vue-style"、"flex 布局"、"grid 布局"。
---

# Vue Style Skill

Vue 项目的样式基础设施：在 `vue-theme-skill` 的 Design Token 之上，提供可直接复用的**工具类、动画、布局、重置样式**。

## 定位与边界

| 维度 | 说明 |
|------|------|
| 本技能做什么 | 提供工具类命名规范、动画类、布局方案、重置样式的纯 CSS 实现 |
| 本技能不做什么 | 不定义主题 Token / 色阶 / 换肤（→ `vue-theme-skill`）；不实现组件（→ `vue-base-skill`） |
| 依赖 | `vue-theme-skill`（Token 唯一来源，零硬编码） |

## 能力清单

### 1. 工具类

命名遵循「前缀 + 方向 + 档位」，全部走 `var(--space-*)`：

| 类别 | 类名示例 | 说明 |
|------|---------|------|
| 外边距 | `mt-4` `mb-2` `mx-6` `my-8` | margin-top/bottom/x/y，档位对应 `--space-*` |
| 内边距 | `pt-4` `pb-2` `px-6` `py-8` | padding，同 `--space-*` |
| 弹性布局 | `flex` `inline-flex` `flex-col` `items-center` `justify-between` | flex 容器与对齐 |
| 网格布局 | `grid` `grid-cols-2` `grid-cols-3` `gap-4` | grid 容器与列数 |
| 文字 | `text-sm` `text-center` `truncate` `font-medium` | 字号/对齐/省略/字重 |
| 显示 | `hidden` `block` `relative` `absolute` | 显示与定位 |

### 2. 动画类

全部复用全局关键帧，命名 `{name}` + 可选 `-{duration}`：

| 类名 | 效果 |
|------|------|
| `fade-in` | 透明度 0→1 |
| `fade-out` | 透明度 1→0 |
| `slide-up` | 自下而上滑入 |
| `slide-down` | 自上而下滑入 |
| `scale-in` | 缩放 0.95→1 |
| `spin` | 持续旋转（loading） |

动画参数统一走 `--transition-fast/normal/slow` 与 `--ease-out/in-out`，不内联 `@keyframes`。

### 3. 布局方案

| 方案 | 类名 | 说明 |
|------|------|------|
| 水平排列 | `flex items-center gap-4` | 常规横向布局 |
| 两端对齐 | `flex items-center justify-between` | 头尾分离（标题 + 操作区） |
| 垂直居中 | `flex flex-col items-center justify-center` | 空态/登录页 |
| 网格卡片 | `grid grid-cols-3 gap-4` | 卡片列表 |

### 4. 重置样式

提供一份基础 reset，消除浏览器默认差异（盒模型、边距、列表样式、表单控件外观），放在项目入口 `styles/reset.css`，不覆盖业务样式。

## 硬规则

1. 所有颜色 / 间距 / 圆角 / 字号 / 阴影必须走 `var(--xxx, 兜底)`，禁止裸值。
2. 不内联 `@keyframes`，动画关键帧统一引用全局真源。
3. 工具类只做「单属性职责」，不做「多属性组合」——组合交给布局类或组件。
4. 零原生 HTML5 标签，零 emoji（示例代码一律 `<div>` + CSS class）。

## 触发词

```
Vue 样式、CSS 工具类、动画、布局、flex 布局、grid 布局、响应式、vue-style
```
