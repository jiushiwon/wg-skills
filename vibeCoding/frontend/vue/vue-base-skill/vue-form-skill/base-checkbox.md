# base-checkbox

> 复选框组件。支持单个复选框和复选组。
>
> 必须作为 `<base-form-item>` 的子组件或独立使用。

## 属性 Props

### BaseCheckbox（单个）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `boolean` | `false` | 是否选中 |
| `label` | `string` | `''` | 标签文本 |
| `disabled` | `boolean` | `false` | 禁用 |
| `indeterminate` | `boolean` | `false` | 半选状态（仅视觉） |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

### BaseCheckboxGroup（复选组）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `unknown[]` | `[]` | 选中值数组 |
| `options` | `{ label: string; value: unknown; disabled?: boolean }[]` | `[]` | 选项列表 |
| `disabled` | `boolean` | `false` | 全组禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `boolean \| unknown[]` | 值变化 |
| `change` | `boolean \| unknown[]` | 值变化 |

## 实现要点

### 1. 单个复选框

```vue
<template>
  <!-- 零 HTML5 标签：用 div 替代 label -->
  <div
    class="base-checkbox"
    :class="[
      `base-checkbox--${size}`,
      {
        'base-checkbox--checked': isChecked,
        'base-checkbox--disabled': disabled,
        'base-checkbox--indeterminate': indeterminate,
      },
    ]"
  >
    <span class="base-checkbox__input">
      <span
        class="base-checkbox__box"
        :class="{
          'base-checkbox__box--checked': isChecked,
          'base-checkbox__box--indeterminate': indeterminate,
          'is-disabled': disabled,
        }"
        role="checkbox"
        :aria-checked="indeterminate ? 'mixed' : isChecked"
        :aria-disabled="disabled"
        tabindex="0"
        @click="handleToggle"
        @keydown.enter="handleToggle"
        @keydown.space.prevent="handleToggle"
      >
        <span v-if="indeterminate" class="base-checkbox__indeterminate" />
        <span v-else-if="isChecked" class="base-checkbox__check" />
      </span>
    </span>
    <span v-if="label || $slots.default" class="base-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<BaseCheckboxProps>(), {
  modelValue: false,
  label: '',
  disabled: false,
  indeterminate: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const isChecked = computed(() => !!props.modelValue)

function handleToggle() {
  if (props.disabled) return
  const checked = !isChecked.value
  emit('update:modelValue', checked)
  emit('change', checked)
}
</script>
```

### 2. 复选组

```vue
<template>
  <div
    class="base-checkbox-group"
    :class="[`base-checkbox-group--${size}`]"
  >
    <base-checkbox
      v-for="opt in options"
      :key="String(opt.value)"
      :model-value="isSelected(opt.value)"
      :label="opt.label"
      :disabled="disabled || opt.disabled"
      :size="size"
      @change="(checked) => handleToggle(opt.value, checked)"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<BaseCheckboxGroupProps>(), {
  modelValue: () => [],
  options: () => [],
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown[]]
  change: [value: unknown[]]
}>()

function isSelected(value: unknown) {
  return Array.isArray(props.modelValue) && props.modelValue.includes(value)
}

function handleToggle(value: unknown, checked: boolean) {
  const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (checked) {
    arr.push(value)
  } else {
    const idx = arr.indexOf(value)
    if (idx > -1) arr.splice(idx, 1)
  }
  emit('update:modelValue', arr)
  emit('change', arr)
}
</script>
```

### 3. 样式

```vue
<style scoped>
.base-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  user-select: none;
}

.base-checkbox--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-checkbox__input {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 自定义复选框（无 input） */
.base-checkbox__box {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
  outline: none;
}

.base-checkbox__box:focus-visible {
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-checkbox__box.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-checkbox__box--checked,
.base-checkbox__box--indeterminate {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.base-checkbox__check::before {
  content: '✓';
  color: var(--color-white);
  font-weight: var(--weight-bold);
}

.base-checkbox__indeterminate::before {
  content: '—';
  color: var(--color-white);
  font-weight: var(--weight-bold);
}

/* 尺寸 */
.base-checkbox--sm .base-checkbox__box {
  width: 16px;
  height: 16px;
  font-size: 10px;
}

.base-checkbox--md .base-checkbox__box {
  width: 18px;
  height: 18px;
  font-size: 12px;
}

.base-checkbox--lg .base-checkbox__box {
  width: 20px;
  height: 20px;
  font-size: 14px;
}

.base-checkbox__label {
  font-size: var(--font-base);
  color: var(--color-text-primary);
}

.base-checkbox--sm .base-checkbox__label { font-size: var(--font-sm); }
.base-checkbox--lg .base-checkbox__label { font-size: var(--font-lg); }

/* 复选组 */
.base-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
</style>
```

### 4. 容器原则

```vue
<base-card title="权限配置">
  <base-form :model="form">
    <base-form-item label="权限" prop="permissions" required>
      <base-checkbox-group v-model="form.permissions" :options="permissionOptions" />
    </base-form-item>
  </base-form>
</base-card>
```
