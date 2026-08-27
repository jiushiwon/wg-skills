# base-button 按钮

> 通用按钮组件，**必须嵌入 base-card** 使用。
> 三种 type：primary / default / success / warning / danger / text
> 三种 size：sm / md / lg
> 五种 variant：solid / outline / ghost / text / link

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'primary' \| 'default' \| 'success' \| 'warning' \| 'danger' \| 'text'` | `'default'` | 按钮类型 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'text' \| 'link'` | `'solid'` | 样式变体 |
| `disabled` | boolean | `false` | 禁用 |
| `loading` | boolean | `false` | 加载中 |
| `block` | boolean | `false` | 块级（铺满父容器） |
| `icon` | string | - | 图标（Iconify 名称） |

## Events

| Event | 参数 | 说明 |
|-------|------|------|
| `click` | `event: MouseEvent` | 点击事件 |

## 形态组合

| type \ variant | solid | outline | ghost | text | link |
|--------------|-------|---------|-------|------|------|
| primary | 主色实心 | 主色描边 | 主色幽灵 | 主色文字 | — |
| default | 默认实心 | — | — | — | — |
| success | 绿色实心 | — | — | 绿色文字 | — |
| warning | 橙色实心 | — | — | — | — |
| danger | 红色实心 | — | — | 红色文字 | — |
| text | — | — | — | 文字按钮 | — |

## 代码

```vue
<template>
  <button
    :class="[
      'base-button',
      `base-button--type-${type}`,
      `base-button--size-${size}`,
      `base-button--variant-${variant}`,
      { 'base-button--block': block, 'base-button--loading': loading },
    ]"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="base-button__spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'primary' | 'default' | 'success' | 'warning' | 'danger' | 'text'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline' | 'ghost' | 'text' | 'link'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  icon?: string
}>(), {
  type: 'default',
  size: 'md',
  variant: 'solid',
  disabled: false,
  loading: false,
  block: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
  user-select: none;
  white-space: nowrap;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button--block { display: flex; width: 100%; }

/* Size */
.base-button--size-sm { height: var(--height-button-sm); padding: 0 var(--space-3); font-size: var(--font-sm); }
.base-button--size-md { height: var(--height-button-md); padding: 0 var(--space-4); font-size: var(--font-base); }
.base-button--size-lg { height: var(--height-button-lg); padding: 0 var(--space-5); font-size: var(--font-lg); }

/* Solid Primary */
.base-button--variant-solid.base-button--type-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}
.base-button--variant-solid.base-button--type-primary:hover:not(:disabled) {
  background: var(--color-primary-light);
}

/* Solid Default */
.base-button--variant-solid.base-button--type-default {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
.base-button--variant-solid.base-button--type-default:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Success / Warning / Danger */
.base-button--variant-solid.base-button--type-success { background: var(--color-success); color: var(--color-text-inverse); }
.base-button--variant-solid.base-button--type-warning { background: var(--color-warning); color: var(--color-text-inverse); }
.base-button--variant-solid.base-button--type-danger { background: var(--color-danger); color: var(--color-text-inverse); }
.base-button--variant-solid.base-button--type-danger:hover:not(:disabled) { background: var(--color-danger-dark); }

/* Outline */
.base-button--variant-outline.base-button--type-primary {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: transparent;
}
.base-button--variant-outline.base-button--type-primary:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

/* Text */
.base-button--variant-text {
  background: transparent;
  border-color: transparent;
  color: var(--color-text);
}
.base-button--variant-text.base-button--type-primary { color: var(--color-primary); }
.base-button--variant-text.base-button--type-danger { color: var(--color-danger); }
.base-button--variant-text:hover:not(:disabled) { background: var(--color-surface-hover); }

/* Loading spinner */
.base-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
```

## 使用示例

```vue
<!-- ✅ 必须嵌入 base-card -->
<base-card title="操作">
  <base-button type="primary">新建</base-button>
  <base-button>取消</base-button>
  <base-button type="danger" variant="text">删除</base-button>
</base-card>

<!-- 在 base-card header-right 中 -->
<base-card title="用户列表">
  <template #header-right>
    <base-button type="primary">+ 新建用户</base-button>
  </template>
  ...
</base-card>
```

## HTML Demo

- [demo-components/base-button/html/](demo-components/base-button/html/)