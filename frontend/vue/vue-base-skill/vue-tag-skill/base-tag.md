# base-tag 标签

> 用于表格中状态展示、分类标记、计数等。
> **必须嵌入 base-card 或 base-table 使用**。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | 标签类型 |
| `size` | `'sm' \| 'md'` | `'sm'` | 尺寸 |
| `variant` | `'solid' \| 'outline' \| 'light'` | `'light'` | 样式变体 |
| `closable` | boolean | `false` | 可关闭 |

## Events

| Event | 参数 | 说明 |
|-------|------|------|
| `close` | - | 关闭事件 |

## 形态

| 组合 | 适用 |
|------|------|
| `light`（默认）+ 6 type | 表格状态展示 |
| `solid` + 6 type | 强调标签 |
| `outline` + 6 type | 强调标签（描边） |

## 代码

```vue
<template>
  <span
    :class="[
      'base-tag',
      `base-tag--type-${type}`,
      `base-tag--size-${size}`,
      `base-tag--variant-${variant}`,
    ]"
  >
    <slot />
    <span v-if="closable" class="base-tag__close" @click.stop="emit('close')">×</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  variant?: 'solid' | 'outline' | 'light'
  closable?: boolean
}>(), {
  type: 'default',
  size: 'sm',
  variant: 'light',
  closable: false,
})

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.base-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  border: 1px solid transparent;
}

.base-tag--size-md {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-sm);
}

.base-tag__close {
  cursor: pointer;
  opacity: 0.6;
  margin-left: var(--space-1);
  font-size: var(--font-base);
  line-height: 1;
}
.base-tag__close:hover { opacity: 1; }

/* Light */
.base-tag--variant-light.base-tag--type-default { background: var(--color-bg-secondary); color: var(--color-text-secondary); }
.base-tag--variant-light.base-tag--type-primary { background: var(--color-primary-50); color: var(--color-primary); }
.base-tag--variant-light.base-tag--type-success { background: var(--color-success-light); color: var(--color-success-dark); }
.base-tag--variant-light.base-tag--type-warning { background: var(--color-warning-light); color: var(--color-warning-dark); }
.base-tag--variant-light.base-tag--type-danger { background: var(--color-danger-light); color: var(--color-danger-dark); }

/* Solid */
.base-tag--variant-solid.base-tag--type-default { background: var(--color-text-secondary); color: var(--color-text-inverse); }
.base-tag--variant-solid.base-tag--type-primary { background: var(--color-primary); color: var(--color-text-inverse); }
.base-tag--variant-solid.base-tag--type-success { background: var(--color-success); color: var(--color-text-inverse); }
.base-tag--variant-solid.base-tag--type-warning { background: var(--color-warning); color: var(--color-text-inverse); }
.base-tag--variant-solid.base-tag--type-danger { background: var(--color-danger); color: var(--color-text-inverse); }

/* Outline */
.base-tag--variant-outline { background: transparent; }
.base-tag--variant-outline.base-tag--type-primary { border-color: var(--color-primary); color: var(--color-primary); }
.base-tag--variant-outline.base-tag--type-success { border-color: var(--color-success); color: var(--color-success); }
.base-tag--variant-outline.base-tag--type-warning { border-color: var(--color-warning); color: var(--color-warning); }
.base-tag--variant-outline.base-tag--type-danger { border-color: var(--color-danger); color: var(--color-danger); }
</style>
```

## 使用示例

```vue
<!-- ✅ 在 base-card 中使用 -->
<base-card title="订单">
  <base-table :data="orders" :columns="columns">
    <template #status="{ row }">
      <base-tag :type="row.status === 'paid' ? 'success' : 'warning'">
        {{ row.status === 'paid' ? '已支付' : '待支付' }}
      </base-tag>
    </template>
  </base-table>
</base-card>
```

## HTML Demo

- [demo-components/base-tag/html/](demo-components/base-tag/html/)