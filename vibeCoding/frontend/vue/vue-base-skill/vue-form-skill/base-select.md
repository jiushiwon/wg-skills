# base-select

> 选择器组件。支持单选、多选、搜索过滤。
>
> 必须作为 `<base-form-item>` 的子组件或独立使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `unknown` | `undefined` | 绑定值 |
| `options` | `BaseSelectOption[]` | `[]` | 选项列表 |
| `multiple` | `boolean` | `false` | 多选模式 |
| `searchable` | `boolean` | `false` | 可搜索 |
| `clearable` | `boolean` | `false` | 可清空 |
| `placeholder` | `string` | `'请选择'` | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `maxTagCount` | `number` | `3` | 多选模式下最多显示 tag 数 |

## 类型定义

```typescript
interface BaseSelectOption {
  label: string
  value: unknown
  disabled?: boolean
  group?: string
}
```

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `unknown` | 值变化 |
| `change` | `unknown` | 值变化（同上，语义别名） |
| `clear` | — | 清空时 |

## 实现要点

### 1. 核心逻辑

```typescript
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<BaseSelectProps>(), {
  options: () => [],
  multiple: false,
  searchable: false,
  clearable: false,
  placeholder: '请选择',
  disabled: false,
  size: 'md',
  maxTagCount: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [value: unknown]
  clear: []
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(query)
  )
})

// 当前选中项的标签
const selectedLabel = computed(() => {
  if (props.multiple) return ''
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt?.label ?? ''
})

// 多选时的 tag 列表
const selectedTags = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return []
  return props.modelValue.slice(0, props.maxTagCount).map(val => {
    const opt = props.options.find(o => o.value === val)
    return { value: val, label: opt?.label ?? String(val) }
  })
})

const overflowCount = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return 0
  return Math.max(0, props.modelValue.length - props.maxTagCount)
})
```

### 2. 渲染结构

```vue
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
    <!-- 选择区域 -->
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
          <i class="base-select__tag-close" @click.stop="removeTag(tag.value)" />
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

      <!-- 搜索输入（无 input，用 contenteditable） -->
      <div
        v-if="searchable && isOpen"
        ref="searchInputRef"
        class="base-select__search"
        role="textbox"
        :contenteditable="true"
        :data-placeholder="placeholder"
        @click.stop
        @input="searchQuery = ($event.target as HTMLElement).textContent || ''"
        @keydown.escape="close"
      />

      <!-- 清空按钮 -->
      <i
        v-if="clearable && hasValue"
        class="base-select__clear"
        @click.stop="handleClear"
      />

      <!-- 箭头 -->
      <i class="base-select__arrow" :class="{ 'base-select__arrow--up': isOpen }" />
    </div>

    <!-- 下拉面板 -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="base-select__dropdown"
        :style="dropdownStyle"
      >
        <!-- 无数据 -->
        <div v-if="filteredOptions.length === 0" class="base-select__empty">
          暂无数据
        </div>

        <!-- 分组选项 -->
        <template v-for="(group, groupName) in groupedOptions" :key="groupName">
          <div v-if="groupName !== '_default'" class="base-select__group-label">
            {{ groupName }}
          </div>
          <div
            v-for="opt in group"
            :key="String(opt.value)"
            class="base-select__option"
            :class="{
              'base-select__option--selected': isSelected(opt.value),
              'base-select__option--disabled': opt.disabled,
            }"
            @click.stop="handleSelect(opt)"
          >
            <span>{{ opt.label }}</span>
            <i v-if="isSelected(opt.value)" class="base-select__check" />
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>
```

### 3. 事件处理

```typescript
function toggle() {
  if (props.disabled) return
  isOpen.value ? close() : open()
}

function open() {
  isOpen.value = true
  searchQuery.value = ''
  nextTick(() => searchInputRef.value?.focus())
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
}

function handleSelect(opt: BaseSelectOption) {
  if (opt.disabled) return

  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = arr.indexOf(opt.value)
    if (idx > -1) {
      arr.splice(idx, 1)
    } else {
      arr.push(opt.value)
    }
    emit('update:modelValue', arr)
    emit('change', arr)
  } else {
    emit('update:modelValue', opt.value)
    emit('change', opt.value)
    close()
  }
}

function removeTag(value: unknown) {
  if (!Array.isArray(props.modelValue)) return
  const arr = props.modelValue.filter(v => v !== value)
  emit('update:modelValue', arr)
  emit('change', arr)
}

function handleClear() {
  const empty = props.multiple ? [] : undefined
  emit('update:modelValue', empty)
  emit('change', empty)
  emit('clear')
}

const hasValue = computed(() => {
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.length > 0
  return props.modelValue !== undefined && props.modelValue !== null
})
```

### 4. 点击外部关闭

```typescript
function handleClickOutside(e: MouseEvent) {
  if (
    isOpen.value &&
    !triggerRef.value?.contains(e.target as Node) &&
    !dropdownRef.value?.contains(e.target as Node)
  ) {
    close()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
```

### 5. 下拉面板定位

```typescript
const dropdownStyle = computed(() => {
  if (!triggerRef.value) return {}
  const rect = triggerRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 1000,
  }
})
```

### 6. 分组逻辑

```typescript
const groupedOptions = computed(() => {
  const groups: Record<string, BaseSelectOption[]> = {}
  for (const opt of filteredOptions.value) {
    const key = opt.group ?? '_default'
    if (!groups[key]) groups[key] = []
    groups[key].push(opt)
  }
  return groups
})
```

### 7. 样式

```vue
<style scoped>
.base-select {
  display: inline-flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  position: relative;
}

.base-select:hover {
  border-color: var(--color-border-strong);
}

.base-select--open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-select--disabled {
  opacity: 0.6;
  pointer-events: none;
  background: var(--color-bg-secondary);
}

.base-select__trigger {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 0 var(--space-3);
  gap: var(--space-1);
}

.base-select__value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-base);
  color: var(--color-text-primary);
}

.base-select__placeholder {
  flex: 1;
  font-size: var(--font-base);
  color: var(--color-text-muted);
}

.base-select__search {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-base);
  color: var(--color-text-primary);
  min-width: 0;
}

.base-select__arrow {
  flex-shrink: 0;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--color-text-muted);
  transition: transform 0.2s;
}

.base-select__arrow--up {
  transform: rotate(180deg);
}

.base-select__clear {
  flex-shrink: 0;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.base-select__clear:hover {
  color: var(--color-text-primary);
}

/* 尺寸 */
.base-select--sm { height: var(--height-input-sm); }
.base-select--md { height: var(--height-input-md); }
.base-select--lg { height: var(--height-input-lg); }

/* 多选 tag */
.base-select__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0 var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: var(--color-text-primary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-select__tag-close {
  cursor: pointer;
  color: var(--color-text-muted);
}

.base-select__tag-close:hover {
  color: var(--color-text-primary);
}

.base-select__tag-overflow {
  font-size: var(--font-sm);
  color: var(--color-text-muted);
}
</style>

<style>
/* 下拉面板（Teleport 到 body，不能 scoped） */
.base-select__dropdown {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 272px; /* 约 8 个选项 */
  overflow-y: auto;
  padding: var(--space-1) 0;
}

.base-select__group-label {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-sm);
  color: var(--color-text-muted);
  font-weight: var(--weight-medium);
}

.base-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-base);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 0.1s;
}

.base-select__option:hover {
  background: var(--color-bg-secondary);
}

.base-select__option--selected {
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.base-select__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-select__empty {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.base-select__check {
  color: var(--color-primary);
}

.base-select__check::before {
  content: '✓';
}
</style>
```

### 8. 容器原则

```vue
<base-card title="筛选条件">
  <base-form :model="form">
    <base-form-item label="状态">
      <base-select v-model="form.status" :options="statusOptions" clearable />
    </base-form-item>
    <base-form-item label="标签">
      <base-select v-model="form.tags" :options="tagOptions" multiple />
    </base-form-item>
  </base-form>
</base-card>
```
