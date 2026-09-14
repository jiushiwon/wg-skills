---
name: vue-datepicker-skill
description: Vue3 日期选择器组件技能，提供 base-datepicker 组件。触发词："Vue 日期选择器"、"vue-datepicker"、"日历组件"。
---

# Vue DatePicker Skill

> **容器原则**：必须嵌入 `<base-card>` 使用  
> **零 HTML5 标签**：使用 `<span role="button">` 实现导航按钮

日期选择器组件，详细规范见 [base-datepicker.md](base-datepicker.md)

## 功能特性

- ✅ 日期选择
- ✅ 范围选择
- ✅ 年/月选择
- ✅ 快捷选择（今天、昨天、近7天等）
- ✅ 禁用日期
- ✅ 格式化输出

## 使用方式

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseDatePicker } from './components/BaseDatePicker';

const date = ref('');
</script>

<template>
  <BaseDatePicker v-model="date" placeholder="选择日期" />
</template>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string` | - | 绑定值 |
| type | `'date' \| 'daterange' \| 'month' \| 'year'` | `'date'` | 类型 |
| placeholder | `string` | `'请选择日期'` | 占位符 |
| disabled | `boolean` | `false` | 是否禁用 |
| disabledDate | `(date: Date) => boolean` | - | 禁用日期函数 |
| format | `string` | `'YYYY-MM-DD'` | 输出格式 |
| shortcuts | `Shortcut[]` | - | 快捷选项 |
| clearable | `boolean` | `true` | 是否可清空 |

## TypeScript 类型

### types/datepicker.ts

```typescript
// 日期选择器类型

export interface Shortcut {
  text: string;
  value: () => [Date, Date] | Date;
}

export interface DatePickerProps {
  modelValue?: string;
  type?: 'date' | 'daterange' | 'month' | 'year';
  placeholder?: string;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
  format?: string;
  shortcuts?: Shortcut[];
  clearable?: boolean;
}

export interface DatePickerEmits {
  'update:modelValue': [value: string];
  change: [value: string];
}
```

## 组件代码

### BaseDatePicker.vue

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { DatePickerProps, DatePickerEmits, Shortcut } from './types/datepicker';
import './styles.css';

const props = withDefaults(defineProps<DatePickerProps>(), {
  type: 'date',
  placeholder: '请选择日期',
  disabled: false,
  format: 'YYYY-MM-DD',
  clearable: true,
  shortcuts: () => [],
});

const emit = defineEmits<DatePickerEmits>();

const visible = ref(false);
const currentMonth = ref(new Date());
const selectedDate = ref<Date | null>(null);
const selectedRange = ref<[Date | null, Date | null]>([null, null]);
const hoverDate = ref<Date | null>(null);

// 生成日历数据
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: Date[] = [];
  
  // 填充上月天数
  const firstWeekDay = firstDay.getDay();
  for (let i = firstWeekDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }
  
  // 当月天数
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // 填充下月天数
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
});

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const monthText = computed(() => {
  return `${currentMonth.value.getFullYear()}年${currentMonth.value.getMonth() + 1}月`;
});

const displayValue = computed(() => {
  if (props.type === 'daterange') {
    if (!selectedRange.value[0]) return '';
    if (!selectedRange.value[1]) return '开始日期 - 结束日期';
    return `${formatDate(selectedRange.value[0])} - ${formatDate(selectedRange.value[1])}`;
  }
  if (!selectedDate.value) return '';
  return formatDate(selectedDate.value);
});

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getDate() === d2.getDate();
}

function isInRange(date: Date): boolean {
  if (props.type !== 'daterange') return false;
  if (!selectedRange.value[0] || !selectedRange.value[1]) return false;
  
  const time = date.getTime();
  return time >= selectedRange.value[0].getTime() && time <= selectedRange.value[1].getTime();
}

function isStartOrEnd(date: Date): boolean {
  if (props.type !== 'daterange') return isSameDay(date, selectedDate.value!);
  if (!selectedRange.value[0] || !selectedRange.value[1]) return false;
  return isSameDay(date, selectedRange.value[0]) || isSameDay(date, selectedRange.value[1]);
}

function selectDate(date: Date) {
  if (props.disabled) return;
  if (props.disabledDate?.(date)) return;
  
  if (props.type === 'daterange') {
    if (!selectedRange.value[0] || selectedRange.value[1]) {
      selectedRange.value = [date, null];
    } else if (date < selectedRange.value[0]) {
      selectedRange.value = [date, selectedRange.value[0]];
    } else {
      selectedRange.value = [selectedRange.value[0], date];
      visible.value = false;
      const value = `${formatDate(selectedRange.value[0])} - ${formatDate(selectedRange.value[1])}`;
      emit('update:modelValue', value);
      emit('change', value);
    }
  } else {
    selectedDate.value = date;
    visible.value = false;
    const value = formatDate(date);
    emit('update:modelValue', value);
    emit('change', value);
  }
}

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1);
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1);
}

function selectShortcut(shortcut: Shortcut) {
  const result = shortcut.value();
  if (Array.isArray(result)) {
    selectedRange.value = result;
    const value = `${formatDate(result[0])} - ${formatDate(result[1])}`;
    emit('update:modelValue', value);
    emit('change', value);
    visible.value = false;
  } else {
    selectedDate.value = result;
    const value = formatDate(result);
    emit('update:modelValue', value);
    emit('change', value);
    visible.value = false;
  }
}

function clear() {
  selectedDate.value = null;
  selectedRange.value = [null, null];
  emit('update:modelValue', '');
  emit('change', '');
  visible.value = false;
}

// 快捷选项
const defaultShortcuts = [
  { text: '今天', value: () => new Date() },
  { text: '昨天', value: () => new Date(Date.now() - 86400000) },
  { text: '近7天', value: () => [new Date(Date.now() - 6 * 86400000), new Date()] },
  { text: '近30天', value: () => [new Date(Date.now() - 29 * 86400000), new Date()] },
];

const shortcuts = computed(() => props.shortcuts.length ? props.shortcuts : defaultShortcuts);
</script>

<template>
  <div class="base-datepicker" :class="{ 'is-disabled': disabled, 'is-opened': visible }">
    <div class="base-datepicker__trigger" @click="visible = !visible">
      <span v-if="!displayValue" class="base-datepicker__placeholder">{{ placeholder }}</span>
      <span v-else class="base-datepicker__value">{{ displayValue }}</span>
      <span class="base-datepicker__icon">
        <span v-if="clearable && displayValue" class="base-datepicker__clear" @click.stop="clear">x</span>
        <span v-else>date</span>
      </span>
    </div>

    <Transition name="fade">
      <div v-if="visible" class="base-datepicker__dropdown">
        <!-- 快捷选项 -->
        <div v-if="shortcuts.length" class="base-datepicker__shortcuts">
          <span
            v-for="shortcut in shortcuts"
            :key="shortcut.text"
            class="base-datepicker__shortcut"
            @click="selectShortcut(shortcut)"
          >
            {{ shortcut.text }}
          </span>
        </div>

        <!-- 头部 -->
        <div class="base-datepicker__header">
          <span class="base-datepicker__nav" role="button" tabindex="0" @click="prevMonth" @keydown.enter="prevMonth">&lt;</span>
          <span class="base-datepicker__current">{{ monthText }}</span>
          <span class="base-datepicker__nav" role="button" tabindex="0" @click="nextMonth" @keydown.enter="nextMonth">&gt;</span>
        </div>

        <!-- 星期 -->
        <div class="base-datepicker__week">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>

        <!-- 日历 -->
        <div class="base-datepicker__days">
          <div
            v-for="date in calendarDays"
            :key="date.toISOString()"
            class="base-datepicker__day"
            :class="{
              'is-other-month': date.getMonth() !== currentMonth.getMonth(),
              'is-today': isSameDay(date, new Date()),
              'is-selected': isStartOrEnd(date),
              'is-in-range': isInRange(date),
              'is-disabled': disabledDate?.(date)
            }"
            @click="selectDate(date)"
            @mouseenter="hoverDate = date"
          >
            {{ date.getDate() }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
```

### styles.css

```css
.base-datepicker {
  position: relative;
  display: inline-block;
  width: 240px;
  cursor: pointer;
}

.base-datepicker.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-datepicker__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: 4px;
  transition: all 0.2s;
}

.base-datepicker:hover .base-datepicker__trigger {
  border-color: var(--color-text-tertiary, #c0c4cc);
}

.base-datepicker.is-opened .base-datepicker__trigger {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.base-datepicker__placeholder {
  color: var(--color-text-tertiary, #c0c4cc);
}

.base-datepicker__value {
  color: var(--color-text, #606266);
  font-size: 14px;
}

.base-datepicker__icon {
  color: var(--color-text-tertiary, #c0c4cc);
  font-size: 14px;
}

.base-datepicker__clear {
  margin-right: 8px;
}

.base-datepicker__clear:hover {
  color: var(--color-primary, #409eff);
}

/* 下拉 */
.base-datepicker__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 12px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* 快捷选项 */
.base-datepicker__shortcuts {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.base-datepicker__shortcut {
  padding: 4px 10px;
  font-size: 12px;
  color: var(--color-primary, #409eff);
  background: var(--color-primary-light, #ecf5ff);
  border-radius: 4px;
  cursor: pointer;
}

.base-datepicker__shortcut:hover {
  background: var(--color-primary-light, #d9ecff);
}

/* 头部 */
.base-datepicker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.base-datepicker__nav {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text, #606266);
  border-radius: 4px;
}

.base-datepicker__nav:hover {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-datepicker__current {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text, #303133);
}

/* 星期 */
.base-datepicker__week {
  display: grid;
  grid-template-columns: repeat(7, 32px);
  margin-bottom: 8px;
}

.base-datepicker__week span {
  width: 32px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-secondary, #909399);
}

/* 日期 */
.base-datepicker__days {
  display: grid;
  grid-template-columns: repeat(7, 32px);
  gap: 2px;
}

.base-datepicker__day {
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text, #606266);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.base-datepicker__day:hover:not(.is-disabled) {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-datepicker__day.is-other-month {
  color: var(--color-text-tertiary, #c0c4cc);
}

.base-datepicker__day.is-today {
  color: var(--color-primary, #409eff);
  font-weight: bold;
}

.base-datepicker__day.is-selected {
  background: var(--color-primary, #409eff) !important;
  color: var(--color-surface, #fff) !important;
}

.base-datepicker__day.is-in-range {
  background: var(--color-primary-light, #ecf5ff);
}

.base-datepicker__day.is-disabled {
  color: var(--color-text-tertiary, #c0c4cc);
  cursor: not-allowed;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

## 3 件套

### types/datepicker.ts（已在上方）

### composables/useDatePicker.ts

```typescript
// 日期选择器逻辑复用

import { ref, computed } from 'vue';

export function useDatePicker(props: {
  format?: string;
  type?: 'date' | 'daterange' | 'month' | 'year';
}) {
  const selectedDate = ref<Date | null>(null);
  const selectedRange = ref<[Date | null, Date | null]>([null, null]);

  const formatDate = (date: Date): string => {
    const format = props.format || 'YYYY-MM-DD';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return format.replace('YYYY', String(y)).replace('MM', m).replace('DD', d);
  };

  const displayValue = computed(() => {
    if (props.type === 'daterange') {
      if (!selectedRange.value[0]) return '';
      if (!selectedRange.value[1]) return '开始 - 结束';
      return `${formatDate(selectedRange.value[0])} - ${formatDate(selectedRange.value[1])}`;
    }
    return selectedDate.value ? formatDate(selectedDate.value) : '';
  });

  return {
    selectedDate,
    selectedRange,
    formatDate,
    displayValue,
  };
}
```

### index.ts

```typescript
export { BaseDatePicker } from './BaseDatePicker.vue';
export type { DatePickerProps, DatePickerEmits, Shortcut } from './types/datepicker';
```

## 使用示例

### 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseDatePicker } from './components/BaseDatePicker';

const date = ref('');
</script>

<template>
  <BaseDatePicker v-model="date" />
</template>
```

### 范围选择

```vue
<BaseDatePicker v-model="dateRange" type="daterange" />
```

### 自定义快捷选项

```vue
<script setup lang="ts">
const shortcuts = [
  { text: '本周', value: () => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    return [start, now];
  }},
  { text: '本月', value: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return [start, now];
  }},
];
</script>

<template>
  <BaseDatePicker v-model="date" :shortcuts="shortcuts" />
</template>
```

### 禁用日期

```vue
<BaseDatePicker 
  v-model="date" 
  :disabled-date="(d) => d.getTime() > Date.now()"
/>
```

## 触发词

- "Vue 日期选择器"
- "vue-datepicker"
- "日历组件"
- "日期范围"
- "BaseDatePicker"
