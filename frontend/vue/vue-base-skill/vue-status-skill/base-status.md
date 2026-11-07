# base-status 状态/标签组件

> 通用状态/标签/徽章组件，**必须嵌入 base-card** 使用。
> Vue3 + TypeScript，零第三方组件库。

## 为什么需要 base-status？

通用标签痛点：
- ❌ 每个项目重复实现 status / tag / badge
- ❌ 颜色不统一，没有规范
- ❌ 多种变体（实心/描边/点状）需要写多套

**base-status 把所有标签场景收敛成一个组件**：
- ✅ 7 种 type 颜色
- ✅ 5 种 variant 变体
- ✅ 3 种 size 尺寸
- ✅ 可关闭、可带图标、可闪烁

---

## 形态组合矩阵

| type \ variant | solid | light | outline | ghost | dot |
|--------------|-------|-------|---------|-------|-----|
| primary | 主色实心 | 主色浅 | 主色描边 | 主色透明 | 主色圆点 |
| success | 绿色实心 | 绿色浅 | 绿色描边 | 绿色透明 | 绿色圆点 |
| warning | 橙色实心 | 橙色浅 | 橙色描边 | 橙色透明 | 橙色圆点 |
| danger | 红色实心 | 红色浅 | 红色描边 | 红色透明 | 红色圆点 |
| info | 蓝色实心 | 蓝色浅 | 蓝色描边 | 蓝色透明 | 蓝色圆点 |
| default | 灰色实心 | 灰色浅 | 灰色描边 | 灰色透明 | 灰色圆点 |
| neutral | 黑白实心 | 黑白浅 | 黑白描边 | 黑白透明 | 黑白圆点 |

---

## 效果展示

### 1. 7 种 type（solid 默认形态）

```vue
<base-status type="primary">主要</base-status>
<base-status type="success">成功</base-status>
<base-status type="warning">警告</base-status>
<base-status type="danger">危险</base-status>
<base-status type="info">信息</base-status>
<base-status type="default">默认</base-status>
<base-status type="neutral">中性</base-status>
```

### 2. 5 种 variant

```vue
<!-- 实心（默认） -->
<base-status type="success">已支付</base-status>

<!-- 浅色 -->
<base-status type="success" variant="light">已支付</base-status>

<!-- 描边 -->
<base-status type="success" variant="outline">已支付</base-status>

<!-- 幽灵 -->
<base-status type="success" variant="ghost">已支付</base-status>

<!-- 仅圆点 -->
<base-status type="success" variant="dot">已支付</base-status>
```

### 3. 3 种 size

```vue
<base-status type="primary" size="sm">小</base-status>
<base-status type="primary" size="md">中</base-status>
<base-status type="primary" size="lg">大</base-status>
```

### 4. 形状（圆角/方形）

```vue
<base-status type="primary" shape="round">圆形</base-status>
<base-status type="primary" shape="square">方形</base-status>
```

### 5. 可关闭

```vue
<base-status type="primary" closable @close="handleClose">标签 1</base-status>
<base-status type="success" closable @close="handleClose">标签 2</base-status>
```

### 6. 带图标

```vue
<base-status type="primary" icon="check">已确认</base-status>
<base-status type="warning" icon="warning">待处理</base-status>
<base-status type="danger" icon="close">已取消</base-status>
```

### 7. 带数字徽标

```vue
<base-status type="danger" :count="99">消息</base-status>
<base-status type="danger" :count="150" :overflow="99">消息</base-status>
```

### 8. 闪烁动画

```vue
<base-status type="danger" blink>实时</base-status>
<base-status type="warning" blink>警告</base-status>
```

### 9. 禁用状态

```vue
<base-status type="primary" disabled>禁用</base-status>
```

### 10. 自定义颜色

```vue
<base-status type="primary" custom-color="#ff6b6b">自定义</base-status>
```

### 11. 业务场景示例

```vue
<!-- 订单状态 -->
<base-status type="warning">待支付</base-status>
<base-status type="info">待发货</base-status>
<base-status type="primary">已发货</base-status>
<base-status type="success">已完成</base-status>
<base-status type="danger">已退款</base-status>
<base-status type="default">已取消</base-status>
```

---

## 使用示例（必须在 base-card 内）

```vue
<template>
  <base-card title="订单管理">
    <div class="demo-row">
      <base-status type="warning">待支付</base-status>
      <base-status type="info">待发货</base-status>
      <base-status type="primary">已发货</base-status>
      <base-status type="success">已完成</base-status>
      <base-status type="danger">已退款</base-status>
    </div>
  </base-card>
</template>
```

---

## 容器原则

```vue
<!-- ✅ 正确 -->
<base-card title="订单状态">
  <base-status type="success">已支付</base-status>
</base-card>

<!-- ❌ 错误 -->
<base-status type="success">已支付</base-status>
```

---

## 红线

- ❌ 禁止裸用 `<base-status>`（必须 `<base-card>` 包裹）
- ❌ 禁止裸色值 / 裸 px（必须 `var(--*)`）
- ❌ 禁止使用原生标签元素（如 `<button>` `<input>`），必须使用 `<span>` `<div>` 实现

---

## Props

```typescript
interface BaseStatusProps {
  // 核心
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'neutral'
  variant?: 'solid' | 'light' | 'outline' | 'ghost' | 'dot'

  // 样式
  size?: 'sm' | 'md' | 'lg'
  shape?: 'round' | 'square'                // 圆角/方形
  block?: boolean                            // 块级（铺满父容器）
  customColor?: string                       // 自定义颜色

  // 功能
  closable?: boolean                         // 可关闭
  disabled?: boolean                         // 禁用
  blink?: boolean                            // 闪烁动画

  // 图标
  icon?: string                              // 左侧图标
  count?: number                             // 数字徽标
  overflow?: number                          // 数字最大显示值

  // 无障碍
  ariaLabel?: string
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `'default'` | 类型 |
| `variant` | `string` | `'solid'` | 变体 |
| `size` | `string` | `'md'` | 尺寸 |
| `shape` | `string` | `'round'` | 形状 |
| `block` | `boolean` | `false` | 块级 |
| `customColor` | `string` | - | 自定义颜色 |
| `closable` | `boolean` | `false` | 可关闭 |
| `disabled` | `boolean` | `false` | 禁用 |
| `blink` | `boolean` | `false` | 闪烁动画 |
| `icon` | `string` | - | 图标名 |
| `count` | `number` | - | 数字徽标 |
| `overflow` | `number` | `99` | 数字最大值 |

---

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(event: MouseEvent) => void` | 点击 |
| `close` | `(event: MouseEvent) => void` | 关闭 |

---

## Slots

| 插槽 | 参数 | 说明 |
|------|------|------|
| `default` | - | 标签内容 |
| `icon` | - | 自定义图标 |

---

## 实现要点

```vue
<template>
  <span
    :class="[
      'base-status',
      `base-status--type-${type}`,
      `base-status--variant-${variant}`,
      `base-status--size-${size}`,
      `base-status--shape-${shape}`,
      { 'base-status--block': block },
      { 'base-status--disabled': disabled },
      { 'base-status--blink': blink },
      { 'base-status--has-icon': icon || $slots.icon },
      { 'base-status--has-count': count !== undefined },
    ]"
    :style="customColorStyle"
    :aria-label="ariaLabel"
    role="status"
    @click="handleClick"
  >
    <!-- 图标 -->
    <span v-if="icon || $slots.icon" class="base-status__icon">
      <slot name="icon">
        <span :class="`base-status__icon--${icon}`" />
      </slot>
    </span>

    <!-- 内容 -->
    <span class="base-status__content">
      <slot />
    </span>

    <!-- 数字徽标 -->
    <span v-if="count !== undefined" class="base-status__count">
      {{ displayCount }}
    </span>

    <!-- 关闭按钮 -->
    <span
      v-if="closable"
      class="base-status__close"
      role="button"
      aria-label="关闭"
      @click.stop="handleClose"
    >
      <span class="base-status__close-icon">×</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<BaseStatusProps>(), {
  type: 'default',
  variant: 'solid',
  size: 'md',
  shape: 'round',
  block: false,
  disabled: false,
  blink: false,
  overflow: 99,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  close: [event: MouseEvent]
}>()

// 自定义颜色
const customColorStyle = computed(() => {
  if (!props.customColor) return {}
  return {
    '--status-custom-bg': props.customColor,
    '--status-custom-border': props.customColor,
    '--status-custom-text': props.customColor,
  }
})

// 显示的数字（处理溢出）
const displayCount = computed(() => {
  if (props.count === undefined) return ''
  return props.count > props.overflow ? `${props.overflow}+` : String(props.count)
})

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}

function handleClose(event: MouseEvent) {
  if (props.disabled) return
  emit('close', event)
}
</script>

<style scoped>
.base-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: var(--weight-medium);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  border: 1px solid transparent;
  transition: all 0.2s;
  vertical-align: middle;
  cursor: default;
  position: relative;
}

/* Size */
.base-status--size-sm {
  height: 20px;
  padding: 0 var(--space-2);
  font-size: var(--font-xs);
}

.base-status--size-md {
  height: 24px;
  padding: 0 var(--space-3);
  font-size: var(--font-sm);
}

.base-status--size-lg {
  height: 28px;
  padding: 0 var(--space-4);
  font-size: var(--font-base);
}

/* Shape */
.base-status--shape-round {
  border-radius: var(--radius-full);
}

.base-status--shape-square {
  border-radius: var(--radius-sm);
}

/* Block */
.base-status--block {
  display: flex;
  width: 100%;
  justify-content: center;
}

/* Disabled */
.base-status--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Blink */
.base-status--blink {
  animation: status-blink 1.5s ease-in-out infinite;
}

@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ===== Solid ===== */
.base-status--variant-solid.base-status--type-primary {
  background: var(--color-primary);
  color: white;
}
.base-status--variant-solid.base-status--type-success {
  background: var(--color-success);
  color: white;
}
.base-status--variant-solid.base-status--type-warning {
  background: var(--color-warning);
  color: white;
}
.base-status--variant-solid.base-status--type-danger {
  background: var(--color-danger);
  color: white;
}
.base-status--variant-solid.base-status--type-info {
  background: var(--color-info);
  color: white;
}
.base-status--variant-solid.base-status--type-default {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.base-status--variant-solid.base-status--type-neutral {
  background: var(--color-text-primary);
  color: white;
}

/* ===== Light ===== */
.base-status--variant-light.base-status--type-primary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.base-status--variant-light.base-status--type-success {
  background: rgba(82, 196, 26, 0.12);
  color: var(--color-success);
}
.base-status--variant-light.base-status--type-warning {
  background: rgba(250, 173, 20, 0.12);
  color: var(--color-warning);
}
.base-status--variant-light.base-status--type-danger {
  background: rgba(255, 77, 79, 0.12);
  color: var(--color-danger);
}
.base-status--variant-light.base-status--type-info {
  background: rgba(24, 144, 255, 0.12);
  color: var(--color-info);
}
.base-status--variant-light.base-status--type-default {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}
.base-status--variant-light.base-status--type-neutral {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

/* ===== Outline ===== */
.base-status--variant-outline.base-status--type-primary {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.base-status--variant-outline.base-status--type-success {
  border-color: var(--color-success);
  color: var(--color-success);
}
.base-status--variant-outline.base-status--type-warning {
  border-color: var(--color-warning);
  color: var(--color-warning);
}
.base-status--variant-outline.base-status--type-danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
.base-status--variant-outline.base-status--type-info {
  border-color: var(--color-info);
  color: var(--color-info);
}
.base-status--variant-outline.base-status--type-default {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.base-status--variant-outline.base-status--type-neutral {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

/* ===== Ghost ===== */
.base-status--variant-ghost.base-status--type-primary { color: var(--color-primary); }
.base-status--variant-ghost.base-status--type-success { color: var(--color-success); }
.base-status--variant-ghost.base-status--type-warning { color: var(--color-warning); }
.base-status--variant-ghost.base-status--type-danger { color: var(--color-danger); }
.base-status--variant-ghost.base-status--type-info { color: var(--color-info); }
.base-status--variant-ghost.base-status--type-default { color: var(--color-text-secondary); }
.base-status--variant-ghost.base-status--type-neutral { color: var(--color-text-primary); }

/* ===== Dot ===== */
.base-status--variant-dot {
  background: transparent !important;
  border: none !important;
  color: var(--color-text-primary);
  padding: 0;
  height: auto;
}

.base-status--variant-dot::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-text-muted);
  margin-right: var(--space-1);
}

.base-status--variant-dot.base-status--type-primary::before { background: var(--color-primary); }
.base-status--variant-dot.base-status--type-success::before { background: var(--color-success); }
.base-status--variant-dot.base-status--type-warning::before { background: var(--color-warning); }
.base-status--variant-dot.base-status--type-danger::before { background: var(--color-danger); }
.base-status--variant-dot.base-status--type-info::before { background: var(--color-info); }
.base-status--variant-dot.base-status--type-default::before { background: var(--color-text-muted); }
.base-status--variant-dot.base-status--type-neutral::before { background: var(--color-text-primary); }

/* Custom color */
.base-status[style*="--status-custom-bg"] {
  background: var(--status-custom-bg);
  color: white;
}

/* Icon */
.base-status__icon {
  display: inline-flex;
  align-items: center;
  font-size: 1.1em;
}

.base-status__content {
  display: inline-flex;
  align-items: center;
}

/* Count */
.base-status__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-xs);
  font-weight: var(--weight-semibold);
  line-height: 1;
}

.base-status--variant-solid .base-status__count {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

/* Close */
.base-status__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s;
  margin-left: var(--space-1);
  background: transparent;
  color: inherit;
}

.base-status__close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.base-status--variant-solid .base-status__close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.base-status__close-icon {
  font-size: 14px;
  line-height: 1;
}
</style>
```
