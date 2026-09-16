---
name: vue-status-skill
description: Vue 状态标签组件技能。base-status 统一状态标识实现，零 HTML5 标签，用 div/span + CSS3 模拟。支持 type / size / dot 模式，对齐 vue-theme-skill CSS 变量。当用户说"状态标签"、"badge"、"base-status"时触发。
---

# vue-status-skill

> 零 HTML5 标签：用 `<span class="base-status">` + CSS3 实现。

## 组件规格

```vue
<!-- base-status.vue -->
<template>
  <span :class="['base-status', `base-status--${type}`, `base-status--${size}`, { 'base-status--dot': dot }]">
    <span v-if="dot" class="base-status__dot"></span>
    <span class="base-status__text"><slot /></span>
  </span>
</template>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'success' \| 'warning' \| 'error' \| 'info' \| 'default'` | `'default'` | 状态类型 |
| size | `'sm' \| 'md'` | `'md'` | 尺寸 |
| dot | `boolean` | `false` | 仅显示圆点（无文字） |

## 样式规范

```css
.base-status {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-full, 999px);
  font-size: 12px; font-weight: 500; line-height: 1.4;
}
.base-status--success { background: rgba(16,185,129,0.1); color: #059669; }
.base-status--warning { background: rgba(245,158,11,0.1); color: #d97706; }
.base-status--error   { background: rgba(225,29,72,0.1);  color: #e11d48; }
.base-status--info    { background: rgba(59,130,246,0.1); color: #2563eb; }
.base-status--default { background: var(--color-bg-muted); color: var(--color-text-secondary); }

.base-status--sm { padding: 1px 6px; font-size: 11px; }

.base-status__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor; flex-shrink: 0;
}
```

## 使用示例

```vue
<base-status type="success">已完成</base-status>
<base-status type="warning">进行中</base-status>
<base-status type="error">失败</base-status>
<base-status type="success" dot />
```
