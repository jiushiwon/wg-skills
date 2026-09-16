---
name: vue-button-skill
description: Vue 按钮组件技能。base-button 统一按钮实现，零 HTML5 标签（禁用原生 <button>），全部用 div/span + CSS3 模拟。支持 type / size / disabled / loading / icon 状态，对齐 vue-theme-skill CSS 变量。当用户说"做个按钮"、"按钮组件"、"base-button"时触发。
---

# vue-button-skill

> 零 HTML5 标签：禁用原生 `<button>`，用 `<div class="base-button">` + CSS3 实现。

## 组件规格

```vue
<!-- base-button.vue -->
<template>
  <div
    :class="['base-button', `base-button--${type}`, `base-button--${size}`, { 'is-disabled': disabled, 'is-loading': loading }]"
    @click="handleClick"
  >
    <span v-if="loading" class="base-button__spinner"></span>
    <span v-if="icon && !loading" class="base-button__icon">{{ icon }}</span>
    <span class="base-button__text"><slot /></span>
  </div>
</template>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | 按钮类型 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| loading | `boolean` | `false` | 加载中 |
| icon | `string` | `''` | 图标文字 |

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| click | `MouseEvent` | 点击事件（disabled/loading 时不触发） |

## 样式规范

```css
.base-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-semibold, 600);
  cursor: pointer; user-select: none;
  transition: opacity 0.2s, transform 0.15s;
  padding: 8px 16px;
}
.base-button:active:not(.is-disabled):not(.is-loading) { transform: scale(0.97); }
.base-button.is-disabled { opacity: 0.5; cursor: not-allowed; }
.base-button.is-loading { pointer-events: none; }

.base-button--primary { background: var(--color-primary); color: #fff; }
.base-button--secondary { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }
.base-button--danger { background: var(--color-error, #e11d48); color: #fff; }
.base-button--ghost { background: transparent; color: var(--color-primary); }

.base-button--sm { padding: 4px 10px; font-size: 12px; }
.base-button--lg { padding: 12px 24px; font-size: 16px; }

.base-button__spinner {
  width: 14px; height: 14px;
  border: 2px solid currentColor; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

## 使用示例

```vue
<base-button type="primary" @click="submit">提交</base-button>
<base-button type="secondary" size="sm">取消</base-button>
<base-button type="primary" :loading="saving">保存中</base-button>
<base-button type="danger" disabled>删除</base-button>
```
