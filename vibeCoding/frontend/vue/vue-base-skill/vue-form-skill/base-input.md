# base-input

> 输入框组件。支持文本、密码、搜索、文本域。
>
> 必须作为 `<base-form-item>` 的子组件或独立使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | `''` | 绑定值 |
| `type` | `'text' \| 'password' \| 'search' \| 'textarea'` | `'text'` | 类型 |
| `placeholder` | `string` | `'请输入'` | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `clearable` | `boolean` | `false` | 可清空 |
| `showPassword` | `boolean` | `false` | 密码显隐切换 |
| `maxlength` | `number` | `undefined` | 最大字符数 |
| `minlength` | `number` | `undefined` | 最小字符数 |
| `rows` | `number` | `3` | textarea 行数 |
| `autosize` | `boolean \| { minRows: number; maxRows: number }` | `false` | textarea 自适应高度 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `prefixIcon` | `string` | `undefined` | 前缀图标类名 |
| `suffixIcon` | `string` | `undefined` | 后缀图标类名 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `string \| number` | 值变化 |
| `input` | `Event` | 输入时 |
| `change` | `Event` | 失焦或回车时 |
| `focus` | `FocusEvent` | 获得焦点 |
| `blur` | `FocusEvent` | 失去焦点 |
| `clear` | — | 清空时 |
| `keydown` | `KeyboardEvent` | 按键 |

## 插槽 Slots

| 插槽 | 说明 |
|------|------|
| `prefix` | 前缀内容（图标、文本） |
| `suffix` | 后缀内容（图标、按钮） |

## 实现要点

### 1. 核心逻辑

```typescript
import { ref, computed, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  placeholder: '请输入',
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: false,
  rows: 3,
  autosize: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [e: Event]
  change: [e: Event]
  focus: [e: FocusEvent]
  blur: [e: FocusEvent]
  clear: []
  keydown: [e: KeyboardEvent]
}>()

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()
const isFocused = ref(false)
const showClear = ref(false)
const showPwd = ref(false)

// 是否 textarea
const isTextarea = computed(() => props.type === 'textarea')

// 是否显示清空按钮
const isClearable = computed(() => {
  return props.clearable && isFocused.value && !!props.modelValue
})

// 是否显示密码切换
const isShowPassword = computed(() => {
  return props.type === 'password' && props.showPassword
})

// 实际 input type
const inputType = computed(() => {
  if (props.type === 'password' && showPwd.value) return 'text'
  return props.type === 'search' ? 'search' : props.type
})
```

### 2. 渲染结构

```vue
<template>
  <!-- textarea（无原生 textarea，用 contenteditable） -->
  <div
    v-if="isTextarea"
    class="base-textarea"
    :class="[
      `base-textarea--${size}`,
      { 'base-textarea--disabled': disabled },
    ]"
  >
    <div
      ref="inputRef"
      class="base-textarea__input"
      :contenteditable="!disabled && !readonly"
      role="textbox"
      :aria-disabled="disabled"
      :aria-readonly="readonly"
      :data-placeholder="placeholder"
      :data-maxlength="maxlength"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >{{ modelValue }}</div>
    <span v-if="maxlength" class="base-textarea__count">
      {{ String(modelValue ?? '').length }}/{{ maxlength }}
    </span>
  </div>

  <!-- input（无原生 input，用 contenteditable） -->
  <div
    v-else
    class="base-input"
    :class="[
      `base-input--${size}`,
      {
        'base-input--disabled': disabled,
        'base-input--focused': isFocused,
        'base-input--clearable': clearable,
      },
    ]"
  >
    <!-- 前缀 -->
    <span v-if="prefixIcon || $slots.prefix" class="base-input__prefix">
      <slot name="prefix">
        <i v-if="prefixIcon" :class="prefixIcon" />
      </slot>
    </span>

    <div
      ref="inputRef"
      class="base-input__input"
      :contenteditable="!disabled && !readonly"
      role="textbox"
      :aria-disabled="disabled"
      :aria-readonly="readonly"
      :data-placeholder="placeholder"
      :data-type="inputType"
      :data-maxlength="maxlength"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @mouseenter="showClear = true"
      @mouseleave="showClear = false"
    >{{ inputType === 'password' && !showPwd ? '••••••' : modelValue }}</div>

    <!-- 清空按钮 -->
    <span
      v-if="isClearable && showClear"
      class="base-input__clear"
      @mousedown.prevent
      @click="handleClear"
    >
      <i class="icon-close" />
    </span>

    <!-- 密码显隐 -->
    <span
      v-if="isShowPassword"
      class="base-input__password"
      @mousedown.prevent
      @click="showPwd = !showPwd"
    >
      <i :class="showPwd ? 'icon-eye-off' : 'icon-eye'" />
    </span>

    <!-- 后缀 -->
    <span v-if="suffixIcon || $slots.suffix" class="base-input__suffix">
      <slot name="suffix">
        <i v-if="suffixIcon" :class="suffixIcon" />
      </slot>
    </span>
  </div>
</template>
```

### 3. 事件处理

```typescript
function handleInput(e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', e)
}

function handleChange(e: Event) {
  emit('change', e)
}

function handleFocus(e: FocusEvent) {
  isFocused.value = true
  emit('focus', e)
}

function handleBlur(e: FocusEvent) {
  isFocused.value = false
  emit('blur', e)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => inputRef.value?.focus())
}

function handleKeydown(e: KeyboardEvent) {
  emit('keydown', e)
}
```

### 4. 样式

```vue
<style scoped>
.base-input {
  display: inline-flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.base-input:hover {
  border-color: var(--color-border-strong);
}

.base-input--focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-input--disabled {
  opacity: 0.6;
  pointer-events: none;
  background: var(--color-bg-secondary);
}

.base-input__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-base);
  color: var(--color-text-primary);
  padding: 0 var(--space-3);
  min-width: 0;
}

.base-input__input::placeholder {
  color: var(--color-text-muted);
}

.base-input__prefix,
.base-input__suffix,
.base-input__clear,
.base-input__password {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.base-input__prefix {
  padding-left: var(--space-3);
}

.base-input__suffix,
.base-input__clear,
.base-input__password {
  padding-right: var(--space-3);
}

.base-input__clear {
  cursor: pointer;
  color: var(--color-text-secondary);
}

.base-input__clear:hover {
  color: var(--color-text-primary);
}

.base-input__password {
  cursor: pointer;
}

.base-input__password:hover {
  color: var(--color-primary);
}

/* 尺寸 */
.base-input--sm { height: var(--height-input-sm); }
.base-input--md { height: var(--height-input-md); }
.base-input--lg { height: var(--height-input-lg); }

.base-input--sm .base-input__input { font-size: var(--font-sm); }
.base-input--lg .base-input__input { font-size: var(--font-lg); }

/* textarea */
.base-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.base-textarea:hover {
  border-color: var(--color-border-strong);
}

.base-textarea:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-textarea--disabled {
  opacity: 0.6;
  pointer-events: none;
  background: var(--color-bg-secondary);
}

.base-textarea__input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-base);
  color: var(--color-text-primary);
  padding: var(--space-3);
  resize: vertical;
  box-sizing: border-box;
}

.base-textarea__input::placeholder {
  color: var(--color-text-muted);
}

.base-textarea__count {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-3);
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}

/* search 类型 */
.base-input--search .base-input__input {
  padding-left: var(--space-2);
}
</style>
```

### 5. 密码切换图标

> 使用 CSS 伪元素或内联 SVG 实现眼睛图标，不引入图标库。

```css
.icon-eye::before { content: '👁'; }
.icon-eye-off::before { content: '👁‍🗨'; }
.icon-close::before { content: '✕'; }
```

### 6. 容器原则

```vue
<!-- 正确：独立使用 -->
<base-card title="搜索">
  <base-input v-model="keyword" placeholder="搜索..." clearable />
</base-card>

<!-- 正确：表单内使用 -->
<base-card title="用户信息">
  <base-form :model="form">
    <base-form-item label="姓名" prop="name" required>
      <base-input v-model="form.name" />
    </base-form-item>
  </base-form>
</base-card>
```
