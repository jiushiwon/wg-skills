# base-radio

> 单选框组件。支持单选组。
>
> 必须作为 `<base-form-item>` 的子组件或独立使用。

## 属性 Props

### BaseRadio（单个）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `unknown` | `undefined` | 绑定值 |
| `label` | `string` | `''` | 标签文本 |
| `value` | `unknown` | **必填** | 当前选项的值 |
| `disabled` | `boolean` | `false` | 禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

### BaseRadioGroup（单选组）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `unknown` | `undefined` | 选中值 |
| `options` | `{ label: string; value: unknown; disabled?: boolean }[]` | **必填** | 选项列表 |
| `disabled` | `boolean` | `false` | 全组禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `unknown` | 值变化 |
| `change` | `unknown` | 值变化 |

## 实现要点

### 1. 单个单选框

```vue
<template>
  <!-- 零 HTML5 标签：用 div 替代 label -->
  <div
    class="base-radio"
    :class="[
      `base-radio--${size}`,
      {
        'base-radio--checked': isChecked,
        'base-radio--disabled': disabled,
      },
    ]"
  >
    <span class="base-radio__input">
      <span
        class="base-radio__circle"
        :class="{
          'base-radio__circle--checked': isChecked,
          'is-disabled': disabled,
        }"
        role="radio"
        :aria-checked="isChecked"
        :aria-disabled="disabled"
        tabindex="0"
        @click="handleSelect"
        @keydown.enter="handleSelect"
        @keydown.space.prevent="handleSelect"
      >
        <span v-if="isChecked" class="base-radio__dot" />
      </span>
    </span>
    <span v-if="label || $slots.default" class="base-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<BaseRadioProps>(), {
  label: '',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [value: unknown]
}>()

const isChecked = computed(() => props.modelValue === props.value)

function handleSelect() {
  if (props.disabled || isChecked.value) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>
```

### 2. 单选组

```vue
<template>
  <div
    class="base-radio-group"
    :class="[`base-radio-group--${size}`]"
  >
    <base-radio
      v-for="opt in options"
      :key="String(opt.value)"
      :model-value="modelValue"
      :value="opt.value"
      :label="opt.label"
      :disabled="disabled || opt.disabled"
      :size="size"
      @change="(val) => emit('update:modelValue', val)"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<BaseRadioGroupProps>(), {
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [value: unknown]
}>()
</script>
```

### 3. 样式

```vue
<style scoped>
.base-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  user-select: none;
}

.base-radio--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-radio__input {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 自定义单选框（无 input） */
.base-radio__circle {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-bg);
  transition: border-color 0.2s;
  cursor: pointer;
  outline: none;
}

.base-radio__circle:focus-visible {
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-radio__circle.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-radio__circle--checked {
  border-color: var(--color-primary);
}

.base-radio__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
}

/* 尺寸 */
.base-radio--sm .base-radio__circle { width: 16px; height: 16px; }
.base-radio--sm .base-radio__dot { width: 6px; height: 6px; }

.base-radio--md .base-radio__circle { width: 18px; height: 18px; }
.base-radio--md .base-radio__dot { width: 8px; height: 8px; }

.base-radio--lg .base-radio__circle { width: 20px; height: 20px; }
.base-radio--lg .base-radio__dot { width: 10px; height: 10px; }

.base-radio__label {
  font-size: var(--font-base);
  color: var(--color-text-primary);
}

.base-radio--sm .base-radio__label { font-size: var(--font-sm); }
.base-radio--lg .base-radio__label { font-size: var(--font-lg); }

/* 单选组 */
.base-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
</style>
```

### 4. 容器原则

```vue
<base-card title="性别选择">
  <base-form :model="form">
    <base-form-item label="性别" prop="gender" required>
      <base-radio-group v-model="form.gender" :options="genderOptions" />
    </base-form-item>
  </base-form>
</base-card>
```
