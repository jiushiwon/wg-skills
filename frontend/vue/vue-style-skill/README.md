# vue-style-skill

Vue 3 样式规范技能 - 统一 UI 风格

## 概述

基于 vue-theme-skill 的 Design Token，封装常用的 CSS 工具类、动画、布局类等。

## 主要功能

- CSS 工具类（margin、padding、flex、grid）
- 动画类（fade、slide、scale）
- 响应式工具
- 主题切换

## 配合使用

必须与 **vue-theme-skill** 配合使用，所有样式必须使用 `var(--*)` 变量。

## 工具类示例

```html
<!-- 间距 -->
<div class="mt-4 p-2">...</div>

<!-- 弹性布局 -->
<div class="flex items-center justify-between">...</div>

<!-- 动画 -->
<div class="fade-in">...</div>
```

## CSS 变量

```css
:root {
  --color-primary: #1890ff;
  --space-4: 16px;
  --radius-md: 8px;
}
```

## 触发词

- Vue 样式
- CSS 工具类
- 主题切换
- 响应式
