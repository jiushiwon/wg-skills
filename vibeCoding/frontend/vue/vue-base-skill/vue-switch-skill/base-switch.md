# base-switch

> 开关组件。开/关切换。
>
> 必须作为 `<base-form-item>` 的子组件或独立使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `boolean` | `false` | 是否开启 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `boolean` | 值变化 |
| `change` | `boolean` | 值变化 |

## 实现要点

### 1. 核心逻辑

```typescript
const props = withDefaults(defineProps<BaseSwitchProps>(), {
  modelValue: false,
  disabled: false,
  loading: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

function toggle() {
  if (props.disabled || props.loading) return
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
```

### 2. 渲染结构

```vue
<template>
  <div
    class="base-switch"
    :class="[
      `base-switch--${size}`,
      {
        'base-switch--on': modelValue,
        'base-switch--disabled': disabled || loading,
        'base-switch--loading': loading,
      },
    ]"
    role="switch"
    :aria-checked="modelValue"
    :aria-disabled="disabled || loading"
    tabindex="0"
    @click="toggle"
    @keydown.enter="toggle"
    @keydown.space.prevent="toggle"
  >
    <span class="base-switch__track">
      <span class="base-switch__thumb">
        <span v-if="loading" class="base-switch__spinner" />
      </span>
    </span>
  </div>
</template>
```

### 3. 样式

```vue
<style scoped>
/* 开关根（纯 div，非 button） */
.base-switch {
  display: inline-flex;
  align-items: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  outline: none;
  user-select: none;
}

.base-switch:focus-visible .base-switch__track {
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-switch--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-switch--loading {
  cursor: wait;
}

.base-switch__track {
  display: flex;
  align-items: center;
  border-radius: 999px;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  transition: background 0.2s, border-color 0.2s;
  position: relative;
}

.base-switch--on .base-switch__track {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.base-switch__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.base-switch--on .base-switch__thumb {
  transform: translateX(100%);
}

/* 尺寸 */
.base-switch--sm .base-switch__track {
  width: 36px;
  height: 20px;
}

.base-switch--sm .base-switch__thumb {
  width: 16px;
  height: 16px;
  margin: 2px;
}

.base-switch--md .base-switch__track {
  width: 44px;
  height: 24px;
}

.base-switch--md .base-switch__thumb {
  width: 20px;
  height: 20px;
  margin: 2px;
}

.base-switch--lg .base-switch__track {
  width: 52px;
  height: 28px;
}

.base-switch--lg .base-switch__thumb {
  width: 24px;
  height: 24px;
  margin: 2px;
}

/* 加载动画 */
.base-switch__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

### 4. 容器原则

```vue
<base-card title="通知设置">
  <base-form :model="form">
    <base-form-item label="邮件通知" prop="emailNotify">
      <base-switch v-model="form.emailNotify" />
    </base-form-item>
    <base-form-item label="短信通知" prop="smsNotify">
      <base-switch v-model="form.smsNotify" size="lg" />
    </base-form-item>
  </base-form>
</base-card>
```
