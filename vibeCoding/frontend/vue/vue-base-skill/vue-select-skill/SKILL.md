---
name: vue-select-skill
description: Vue3 下拉选择器组件技能，提供 base-select 组件。触发词："Vue 选择器"、"vue-select"、"下拉组件"。
---

# Vue Select Skill

> **容器原则**：必须嵌入 `<base-card>` 使用  
> **零 HTML5 标签**：使用 `<div contenteditable role="textbox">` 实现搜索

下拉选择器组件，详细规范见 [base-select.md](base-select.md)

## 引用组件

引用 `vue-form-skill/base-select.md` 的实现规范。

## 使用方式

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseSelect } from './components/BaseSelect';

const value = ref('');
const options = [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' },
];
</script>

<template>
  <BaseSelect v-model="value" :options="options" placeholder="请选择" />
</template>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `unknown` | - | 绑定值 |
| options | `SelectOption[]` | `[]` | 选项列表 |
| placeholder | `string` | `'请选择'` | 占位符 |
| disabled | `boolean` | `false` | 是否禁用 |
| multiple | `boolean` | `false` | 是否多选 |
| searchable | `boolean` | `false` | 是否可搜索 |
| clearable | `boolean` | `false` | 是否可清空 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| maxTagCount | `number` | `3` | 多选最多显示标签数 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `(value: unknown)` | 值变化 |
| change | `(value: unknown)` | 变化后 |
| clear | `()` | 点击清空 |

## TypeScript 类型

### types/select.ts

```typescript
// Select 选项类型
export interface SelectOption {
  label: string;
  value: unknown;
  disabled?: boolean;
  group?: string;
}

// Select Props
export interface SelectProps {
  modelValue?: unknown;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxTagCount?: number;
}

export interface SelectEmits {
  'update:modelValue': [value: unknown];
  change: [value: unknown];
  clear: [];
}
```

## 组件代码

### BaseSelect.vue

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { SelectProps, SelectEmits, SelectOption } from './types/select';

const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  multiple: false,
  searchable: false,
  clearable: false,
  size: 'md',
  maxTagCount: 3,
});

const emit = defineEmits<SelectEmits>();

const isOpen = ref(false);
const searchQuery = ref('');
const triggerRef = ref<HTMLDivElement>();
const dropdownRef = ref<HTMLDivElement>();
const searchInputRef = ref<HTMLDivElement>();

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(query)
  );
});

// 当前选中项的标签
const selectedLabel = computed(() => {
  if (props.multiple) return '';
  const opt = props.options.find(o => o.value === props.modelValue);
  return opt?.label ?? '';
});

// 多选时的 tag 列表
const selectedTags = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return [];
  return props.modelValue.slice(0, props.maxTagCount).map(val => {
    const opt = props.options.find(o => o.value === val);
    return { value: val, label: opt?.label ?? String(val) };
  });
});

const overflowCount = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return 0;
  return Math.max(0, props.modelValue.length - props.maxTagCount);
});

const hasValue = computed(() => {
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  return props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '';
});

function toggle() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.searchable) {
    setTimeout(() => searchInputRef.value?.focus(), 0);
  }
}

function close() {
  isOpen.value = false;
  searchQuery.value = '';
}

function isSelected(val: unknown): boolean {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(val);
  }
  return props.modelValue === val;
}

function handleSelect(opt: SelectOption) {
  if (opt.disabled || props.disabled) return;

  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const idx = arr.indexOf(opt.value);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(opt.value);
    }
    emit('update:modelValue', arr);
    emit('change', arr);
  } else {
    emit('update:modelValue', opt.value);
    emit('change', opt.value);
    close();
  }
}

function removeTag(val: unknown) {
  if (props.disabled) return;
  const arr = [...(props.modelValue as unknown[])];
  const idx = arr.indexOf(val);
  if (idx > -1) {
    arr.splice(idx, 1);
    emit('update:modelValue', arr);
    emit('change', arr);
  }
}

function handleClear() {
  if (props.multiple) {
    emit('update:modelValue', []);
  } else {
    emit('update:modelValue', undefined);
  }
  emit('clear');
}

// 点击外部关闭
function handleClickOutside(e: Event) {
  if (triggerRef.value?.contains(e.target as Node)) return;
  if (dropdownRef.value?.contains(e.target as Node)) return;
  close();
}
</script>

<template>
  <div
    ref="triggerRef"
    class="base-select"
    :class="[
      `base-select--${size}`,
      {
        'base-select--open': isOpen,
        'base-select--disabled': disabled,
        'base-select--multiple': multiple,
      },
    ]"
    @click="toggle"
  >
    <div class="base-select__trigger">
      <!-- 多选 tag -->
      <template v-if="multiple && selectedTags.length > 0">
        <span
          v-for="tag in selectedTags"
          :key="String(tag.value)"
          class="base-select__tag"
          @click.stop
        >
          {{ tag.label }}
          <span class="base-select__tag-close" @click.stop="removeTag(tag.value)">x</span>
        </span>
        <span v-if="overflowCount > 0" class="base-select__tag-overflow">
          +{{ overflowCount }}
        </span>
      </template>

      <!-- 单选文本 -->
      <span v-else-if="selectedLabel" class="base-select__value">
        {{ selectedLabel }}
      </span>

      <!-- 占位文本 -->
      <span v-else class="base-select__placeholder">{{ placeholder }}</span>

      <!-- 搜索输入（contenteditable） -->
      <div
        v-if="searchable && isOpen"
        ref="searchInputRef"
        class="base-select__search"
        role="textbox"
        contenteditable="true"
        :data-placeholder="placeholder"
        @click.stop
        @input="searchQuery = ($event.target as HTMLElement).textContent || ''"
        @keydown.escape="close"
      />

      <!-- 清空按钮 -->
      <span
        v-if="clearable && hasValue"
        class="base-select__clear"
        role="button"
        @click.stop="handleClear"
      >
        x
      </span>

      <!-- 箭头 -->
      <span class="base-select__arrow" :class="{ 'base-select__arrow--up': isOpen }">v</span>
    </div>

    <!-- 下拉面板 -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="base-select__dropdown"
      >
        <div v-if="filteredOptions.length === 0" class="base-select__empty">
          暂无数据
        </div>

        <div
          v-for="opt in filteredOptions"
          :key="String(opt.value)"
          class="base-select__option"
          :class="{
            'base-select__option--selected': isSelected(opt.value),
            'base-select__option--disabled': opt.disabled,
          }"
          @click.stop="handleSelect(opt)"
        >
          <span>{{ opt.label }}</span>
          <span v-if="isSelected(opt.value)" class="base-select__check">*</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.base-select {
  position: relative;
  display: inline-block;
  width: 240px;
  cursor: pointer;
}

.base-select--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--height-input-md, 40px);
  padding: 0 32px 0 12px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
  transition: all 0.2s;
}

.base-select:hover .base-select__trigger {
  border-color: var(--color-text-tertiary, #c0c4cc);
}

.base-select--open .base-select__trigger {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.base-select__placeholder {
  color: var(--color-text-tertiary, #c0c4cc);
}

.base-select__value {
  color: var(--color-text, #606266);
  font-size: var(--font-base, 14px);
}

.base-select__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.base-select__tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  background: var(--color-bg-secondary, #f0f2f5);
  border-radius: var(--radius-md, 4px);
  font-size: 12px;
  color: var(--color-text, #606266);
}

.base-select__tag-close {
  margin-left: 4px;
  cursor: pointer;
  color: var(--color-text-secondary, #909399);
}

.base-select__tag-close:hover {
  color: var(--color-primary, #409eff);
}

.base-select__tag-overflow {
  font-size: 12px;
  color: var(--color-text-secondary, #909399);
}

.base-select__arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary, #c0c4cc);
  font-size: 10px;
}

.base-select__arrow--up {
  transform: translateY(-50%) rotate(180deg);
}

.base-select__clear {
  margin-right: 4px;
  cursor: pointer;
  color: var(--color-text-secondary, #909399);
}

.base-select__clear:hover {
  color: var(--color-primary, #409eff);
}

/* 搜索框 */
.base-select__search {
  flex: 1;
  min-width: 60px;
  border: none;
  outline: none;
  font-size: var(--font-base, 14px);
}

.base-select__search:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-tertiary, #c0c4cc);
}

/* 下拉列表 */
.base-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 240px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 100;
}

.base-select__empty {
  padding: 20px;
  text-align: center;
  color: var(--color-text-secondary, #909399);
}

.base-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.base-select__option:hover {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-select__option--selected {
  color: var(--color-primary, #409eff);
  background: var(--color-primary-light, #ecf5ff);
}

.base-select__option--disabled {
  color: var(--color-text-tertiary, #c0c4cc);
  cursor: not-allowed;
}

.base-select__check {
  font-weight: bold;
}

/* 尺寸 */
.base-select--sm .base-select__trigger { height: 32px; }
.base-select--md .base-select__trigger { height: 40px; }
.base-select--lg .base-select__trigger { height: 48px; }
</style>
```

### index.ts

```typescript
export { BaseSelect } from './BaseSelect.vue';
export type { SelectProps, SelectEmits, SelectOption } from './types/select';
```

## 使用示例

### 单选

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseSelect } from './components/BaseSelect';

const value = ref('');
const options = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '广州', value: 'gz' },
];
</script>

<template>
  <BaseSelect v-model="value" :options="options" placeholder="请选择城市" />
</template>
```

### 多选

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseSelect } from './components/BaseSelect';

const value = ref<string[]>([]);
const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
];
</script>

<template>
  <BaseSelect v-model="value" :options="options" multiple placeholder="请选择水果" />
</template>
```

## 触发词

- "Vue 选择器"
- "vue-select"
- "下拉组件"
- "BaseSelect"
