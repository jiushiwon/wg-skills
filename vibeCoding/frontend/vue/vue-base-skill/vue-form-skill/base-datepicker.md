# base-datepicker

> 日期选择器组件。支持日期、日期范围、月份、年份选择。
>
> 必须作为 `<base-form-item>` 的子组件或独立使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `Date \| string \| null` | `null` | 绑定值 |
| `type` | `'date' \| 'daterange' \| 'month' \| 'year'` | `'date'` | 选择类型 |
| `format` | `string` | `'YYYY-MM-DD'` | 显示格式 |
| `placeholder` | `string` | `'请选择日期'` | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用 |
| `clearable` | `boolean` | `true` | 可清空 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `minDate` | `Date \| string` | `undefined` | 可选最小日期 |
| `maxDate` | `Date \| string` | `undefined` | 可选最大日期 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `Date \| string \| null` | 值变化 |
| `change` | `Date \| string \| null` | 值变化 |

## 实现要点

### 1. 核心逻辑

```typescript
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<BaseDatepickerProps>(), {
  modelValue: null,
  type: 'date',
  format: 'YYYY-MM-DD',
  placeholder: '请选择日期',
  disabled: false,
  clearable: true,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | string | null]
  change: [value: Date | string | null]
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement>()
const panelRef = ref<HTMLElement>()

// 当前面板显示的年月
const viewDate = ref(new Date())
const viewYear = computed(() => viewDate.value.getFullYear())
const viewMonth = computed(() => viewDate.value.getMonth())

// 选中的日期
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  if (props.modelValue instanceof Date) return props.modelValue
  return new Date(props.modelValue)
})

// 格式化后的显示文本
const displayText = computed(() => {
  if (!selectedDate.value) return ''
  return formatDate(selectedDate.value, props.format)
})
```

### 2. 日期网格计算

```typescript
// 生成日历网格（6 行 x 7 列）
const calendarGrid = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value

  // 本月第一天是周几（0=周日）
  const firstDay = new Date(year, month, 1).getDay()
  // 本月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const grid: Array<{ date: Date; day: number; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }> = []

  // 上月补位
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i)
    grid.push({
      date: d,
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: isDateDisabled(d),
    })
  }

  // 本月
  const today = new Date()
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    grid.push({
      date: d,
      day: i,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      isSelected: selectedDate.value ? isSameDay(d, selectedDate.value) : false,
      isDisabled: isDateDisabled(d),
    })
  }

  // 下月补位（凑满 42 格）
  const remaining = 42 - grid.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    grid.push({
      date: d,
      day: i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: isDateDisabled(d),
    })
  }

  return grid
})

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isDateDisabled(date: Date): boolean {
  if (props.minDate) {
    const min = props.minDate instanceof Date ? props.minDate : new Date(props.minDate)
    if (date < min) return true
  }
  if (props.maxDate) {
    const max = props.maxDate instanceof Date ? props.maxDate : new Date(props.maxDate)
    if (date > max) return true
  }
  return false
}
```

### 3. 渲染结构

```vue
<template>
  <div
    ref="triggerRef"
    class="base-datepicker"
    :class="[
      `base-datepicker--${size}`,
      {
        'base-datepicker--open': isOpen,
        'base-datepicker--disabled': disabled,
      },
    ]"
    @click="toggle"
  >
    <div class="base-datepicker__trigger">
      <span v-if="displayText" class="base-datepicker__value">{{ displayText }}</span>
      <span v-else class="base-datepicker__placeholder">{{ placeholder }}</span>

      <i v-if="clearable && displayText" class="base-datepicker__clear" @click.stop="handleClear" />
      <i class="base-datepicker__icon" />
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="base-datepicker__panel"
        :style="panelStyle"
        @click.stop
      >
        <!-- 头部：年月切换（无 button，用 div + role="button"） -->
        <div class="base-datepicker__header">
          <div class="base-datepicker__nav" role="button" tabindex="0" aria-label="上一年" @click="prevYear" @keydown.enter="prevYear" @keydown.space.prevent="prevYear">«</div>
          <div class="base-datepicker__nav" role="button" tabindex="0" aria-label="上一月" @click="prevMonth" @keydown.enter="prevMonth" @keydown.space.prevent="prevMonth">‹</div>
          <span class="base-datepicker__title">{{ viewYear }}年{{ viewMonth + 1 }}月</span>
          <div class="base-datepicker__nav" role="button" tabindex="0" aria-label="下一月" @click="nextMonth" @keydown.enter="nextMonth" @keydown.space.prevent="nextMonth">›</div>
          <div class="base-datepicker__nav" role="button" tabindex="0" aria-label="下一年" @click="nextYear" @keydown.enter="nextYear" @keydown.space.prevent="nextYear">»</div>
        </div>

        <!-- 星期头部 -->
        <div class="base-datepicker__weekdays">
          <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>

        <!-- 日期网格 -->
        <div class="base-datepicker__grid">
          <span
            v-for="(cell, idx) in calendarGrid"
            :key="idx"
            class="base-datepicker__cell"
            :class="{
              'base-datepicker__cell--other': !cell.isCurrentMonth,
              'base-datepicker__cell--today': cell.isToday,
              'base-datepicker__cell--selected': cell.isSelected,
              'base-datepicker__cell--disabled': cell.isDisabled,
            }"
            @click="handleSelectDate(cell)"
          >
            {{ cell.day }}
          </span>
        </div>

        <!-- 底部：今天（无 button，用 div + role="button"） -->
        <div class="base-datepicker__footer">
          <div class="base-datepicker__today" role="button" tabindex="0" @click="handleSelectToday" @keydown.enter="handleSelectToday" @keydown.space.prevent="handleSelectToday">今天</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
```

### 4. 事件处理

```typescript
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

function toggle() {
  if (props.disabled) return
  isOpen.value ? close() : open()
}

function open() {
  isOpen.value = true
  // 初始化面板到选中日期或今天
  viewDate.value = selectedDate.value ? new Date(selectedDate.value) : new Date()
}

function close() {
  isOpen.value = false
}

function prevYear() {
  viewDate.value = new Date(viewYear.value - 1, viewMonth.value, 1)
}

function nextYear() {
  viewDate.value = new Date(viewYear.value + 1, viewMonth.value, 1)
}

function prevMonth() {
  viewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1)
}

function nextMonth() {
  viewDate.value = new Date(viewYear.value, viewMonth.value + 1, 1)
}

function handleSelectDate(cell: { date: Date; isDisabled: boolean; isCurrentMonth: boolean }) {
  if (cell.isDisabled) return
  emit('update:modelValue', cell.date)
  emit('change', cell.date)
  close()
}

function handleSelectToday() {
  const today = new Date()
  if (!isDateDisabled(today)) {
    emit('update:modelValue', today)
    emit('change', today)
    close()
  }
}

function handleClear() {
  emit('update:modelValue', null)
  emit('change', null)
}
```

### 5. 点击外部关闭

```typescript
function handleClickOutside(e: MouseEvent) {
  if (
    isOpen.value &&
    !triggerRef.value?.contains(e.target as Node) &&
    !panelRef.value?.contains(e.target as Node)
  ) {
    close()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
```

### 6. 面板定位

```typescript
const panelStyle = computed(() => {
  if (!triggerRef.value) return {}
  const rect = triggerRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    zIndex: 1000,
  }
})
```

### 7. 日期格式化

```typescript
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}
```

### 8. 样式

```vue
<style scoped>
.base-datepicker {
  display: inline-flex;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.base-datepicker:hover {
  border-color: var(--color-border-strong);
}

.base-datepicker--open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-datepicker--disabled {
  opacity: 0.6;
  pointer-events: none;
  background: var(--color-bg-secondary);
}

.base-datepicker__trigger {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 var(--space-3);
  gap: var(--space-2);
}

.base-datepicker__value {
  flex: 1;
  font-size: var(--font-base);
  color: var(--color-text-primary);
}

.base-datepicker__placeholder {
  flex: 1;
  font-size: var(--font-base);
  color: var(--color-text-muted);
}

.base-datepicker__clear {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.base-datepicker__clear:hover {
  color: var(--color-text-primary);
}

.base-datepicker__icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.base-datepicker__icon::before {
  content: '📅';
}

/* 尺寸 */
.base-datepicker--sm { height: var(--height-input-sm); }
.base-datepicker--md { height: var(--height-input-md); }
.base-datepicker--lg { height: var(--height-input-lg); }
</style>

<style>
/* 面板（Teleport 到 body，不能 scoped） */
.base-datepicker__panel {
  width: 280px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-3);
}

.base-datepicker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.base-datepicker__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: var(--font-lg);
}

.base-datepicker__nav:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.base-datepicker__title {
  font-size: var(--font-base);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
}

.base-datepicker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  margin-bottom: var(--space-1);
}

.base-datepicker__weekdays span {
  text-align: center;
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  padding: var(--space-1) 0;
}

.base-datepicker__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.base-datepicker__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: var(--font-sm);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.1s;
}

.base-datepicker__cell:hover {
  background: var(--color-bg-secondary);
}

.base-datepicker__cell--other {
  color: var(--color-text-muted);
}

.base-datepicker__cell--today {
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.base-datepicker__cell--selected {
  background: var(--color-primary);
  color: var(--color-white);
}

.base-datepicker__cell--selected:hover {
  background: var(--color-primary-hover);
}

.base-datepicker__cell--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.base-datepicker__footer {
  display: flex;
  justify-content: center;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.base-datepicker__today {
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: var(--font-sm);
  cursor: pointer;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
}

.base-datepicker__today:hover {
  background: var(--color-bg-secondary);
}
</style>
```

### 9. 容器原则

```vue
<base-card title="活动时间">
  <base-form :model="form">
    <base-form-item label="开始日期" prop="startDate" required>
      <base-datepicker v-model="form.startDate" :max-date="form.endDate" />
    </base-form-item>
    <base-form-item label="结束日期" prop="endDate" required>
      <base-datepicker v-model="form.endDate" :min-date="form.startDate" />
    </base-form-item>
  </base-form>
</base-card>
```
