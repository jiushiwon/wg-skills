---
name: vue-input-skill
description: Vue3 输入框组件技能，提供 base-input 组件。触发词："Vue 输入框"、"vue-input"、"输入框组件"。
---

# Vue Input Skill

> **容器原则**：必须嵌入 `<base-card>` 使用  
> **零 HTML5 标签**：使用 `<div contenteditable role="textbox">` 模拟

输入框组件，详细规范见 [base-input.md](base-input.md)

## 引用组件

引用 `vue-form-skill/base-input.md` 的实现规范。

## 使用方式

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseInput } from 'vue-form-skill';

const value = ref('');
</script>

<template>
  <BaseInput v-model="value" placeholder="请输入内容" />
</template>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string \| number` | `''` | v-model 绑定值 |
| type | `'text' \| 'password' \| 'search' \| 'textarea'` | `'text'` | 类型 |
| placeholder | `string` | `'请输入'` | 占位符 |
| disabled | `boolean` | `false` | 是否禁用 |
| readonly | `boolean` | `false` | 是否只读 |
| maxlength | `number` | - | 最大字符数 |
| clearable | `boolean` | `false` | 是否可清空 |
| showPassword | `boolean` | `false` | 密码显隐切换 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `(value: string \| number)` | 值变化 |
| input | `(e: Event)` | 输入时 |
| change | `(e: Event)` | 失焦或回车时 |
| focus | `(e: FocusEvent)` | 获得焦点 |
| blur | `(e: FocusEvent)` | 失去焦点 |
| clear | `()` | 点击清空 |
| enter | `(e: KeyboardEvent)` | 回车键 |

## 插槽

| 插槽 | 说明 |
|------|------|
| prefix | 前缀内容（图标） |
| suffix | 后缀内容（图标） |

## 组件代码

### BaseInput.vue

```vue
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

interface Props {
  modelValue?: string | number;
  type?: 'text' | 'password' | 'search' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
  clearable?: boolean;
  showPassword?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '请输入',
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: false,
  size: 'md',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  input: [e: Event];
  change: [e: Event];
  focus: [e: FocusEvent];
  blur: [e: FocusEvent];
  clear: [];
  enter: [e: KeyboardEvent];
}>();

const inputRef = ref<HTMLDivElement>();
const isFocused = ref(false);
const isHover = ref(false);
const showPwd = ref(false);

const isTextarea = computed(() => props.type === 'textarea');

const isClearable = computed(() =>
  props.clearable && (isFocused.value || isHover.value) && !!props.modelValue,
);

const isShowPassword = computed(
  () => props.type === 'password' && props.showPassword,
);

const inputType = computed(() => {
  if (props.type === 'password' && showPwd.value) return 'text';
  return props.type;
});

// 密码模式：按真实长度生成掩码
const displayValue = computed(() => {
  const val = props.modelValue ?? '';
  if (props.type === 'password' && !showPwd.value) {
    return '●'.repeat(String(val).length);
  }
  return val;
});

// 是否达到 maxlength
const isMaxed = computed(() => {
  if (!props.maxlength) return false;
  return String(props.modelValue ?? '').length >= props.maxlength;
});

function handleBeforeInput(e: InputEvent) {
  if (isMaxed.value && e.inputType.startsWith('insert')) {
    e.preventDefault();
  }
}

function handleInput(e: Event) {
  const target = e.target as HTMLDivElement;
  const val = target.innerText;
  emit('update:modelValue', val);
  emit('input', e);
}

function handleFocus(e: FocusEvent) {
  isFocused.value = true;
  emit('focus', e);
}

function handleBlur(e: FocusEvent) {
  isFocused.value = false;
  emit('blur', e);
  emit('change', e);
}

function handleClear() {
  emit('update:modelValue', '');
  emit('clear');
  nextTick(() => inputRef.value?.focus());
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !isTextarea.value) {
    e.preventDefault();
    emit('enter', e);
  }
}

// 外部值变化时同步 DOM
watch(
  () => props.modelValue,
  (val) => {
    if (inputRef.value && inputRef.value.innerText !== String(val ?? '')) {
      inputRef.value.innerText = String(val ?? '');
    }
  },
);
</script>

<template>
  <!-- textarea 模式 -->
  <div
    v-if="isTextarea"
    class="base-textarea"
    :class="[
      `base-textarea--${size}`,
      {
        'base-textarea--disabled': disabled,
        'base-textarea--focused': isFocused,
      },
    ]"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div
      ref="inputRef"
      class="base-textarea__input"
      :contenteditable="!disabled && !readonly"
      role="textbox"
      :aria-disabled="disabled"
      :aria-readonly="readonly"
      :data-placeholder="placeholder"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    <span v-if="maxlength" class="base-textarea__count">
      {{ String(modelValue ?? '').length }}/{{ maxlength }}
    </span>
  </div>

  <!-- input 模式 -->
  <div
    v-else
    class="base-input"
    :class="[
      `base-input--${size}`,
      `base-input--${inputType}`,
      {
        'base-input--disabled': disabled,
        'base-input--readonly': readonly,
        'base-input--focused': isFocused,
        'base-input--hover': isHover,
        'base-input--clearable': clearable,
      },
    ]"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <span class="base-input__prefix">
      <slot name="prefix" />
    </span>

    <div
      ref="inputRef"
      class="base-input__input"
      :contenteditable="!disabled && !readonly"
      role="textbox"
      :aria-disabled="disabled"
      :aria-readonly="readonly"
      :data-placeholder="placeholder"
      @input="handleInput"
      @beforeinput="handleBeforeInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <span class="base-input__suffix">
      <span
        v-if="isClearable"
        class="base-input__clear"
        role="button"
        aria-label="清空"
        tabindex="-1"
        @mousedown.prevent
        @click="handleClear"
      >
        x
      </span>

      <span
        v-if="isShowPassword"
        class="base-input__password"
        role="button"
        :aria-label="showPwd ? '隐藏密码' : '显示密码'"
        tabindex="-1"
        @mousedown.prevent
        @click="showPwd = !showPwd"
      >
        {{ showPwd ? 'x' : '*' }}
      </span>

      <slot name="suffix" />
    </span>
  </div>
</template>

<style scoped>
.base-input {
  display: inline-flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg, #fff);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.base-input:hover {
  border-color: var(--color-border-strong, #d1d5db);
}

.base-input--focused {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(64, 158, 255, 0.1));
}

.base-input--disabled {
  opacity: 0.6;
  pointer-events: none;
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-input__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-base, 14px);
  color: var(--color-text, #303133);
  padding: 0 var(--space-3, 12px);
  min-width: 0;
  white-space: pre;
  overflow: hidden;
}

.base-input__input:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-tertiary, #c0c4cc);
  pointer-events: none;
}

.base-input__prefix,
.base-input__suffix {
  display: flex;
  align-items: center;
  color: var(--color-text-secondary, #909399);
  flex-shrink: 0;
}

.base-input__prefix {
  padding-left: var(--space-3, 12px);
}

.base-input__suffix {
  padding-right: var(--space-3, 12px);
  gap: var(--space-2, 8px);
}

.base-input__clear,
.base-input__password {
  cursor: pointer;
  color: var(--color-text-secondary, #909399);
}

.base-input__clear:hover,
.base-input__password:hover {
  color: var(--color-text, #303133);
}

/* 尺寸 */
.base-input--sm { height: 32px; }
.base-input--md { height: 40px; }
.base-input--lg { height: 48px; }

.base-input--sm .base-input__input { font-size: 12px; }
.base-input--lg .base-input__input { font-size: 16px; }

/* textarea */
.base-textarea {
  width: 100%;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg, #fff);
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.base-textarea:hover {
  border-color: var(--color-border-strong, #d1d5db);
}

.base-textarea:focus-within {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(64, 158, 255, 0.1));
}

.base-textarea--disabled {
  opacity: 0.6;
  pointer-events: none;
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-textarea__input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-base, 14px);
  color: var(--color-text, #303133);
  padding: var(--space-3, 12px);
  resize: vertical;
  box-sizing: border-box;
  min-height: 80px;
  white-space: pre-wrap;
  word-break: break-word;
}

.base-textarea__input:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-tertiary, #c0c4cc);
  pointer-events: none;
}

.base-textarea__count {
  position: absolute;
  bottom: var(--space-2, 8px);
  right: var(--space-3, 12px);
  font-size: var(--font-xs, 12px);
  color: var(--color-text-tertiary, #c0c4cc);
}
</style>
```

## 使用示例

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseInput } from 'vue-form-skill';

const username = ref('');
const password = ref('');
</script>

<template>
  <BaseInput v-model="username" placeholder="请输入用户名" clearable />
  <BaseInput v-model="password" type="password" show-password placeholder="请输入密码" />
</template>
```

## 触发词

- "Vue 输入框"
- "vue-input"
- "输入框组件"
- "BaseInput"
