<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DatePickerProps, DatePickerEmits, Shortcut } from '../types/datepicker';

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

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Date[] = [];

  const firstWeekDay = firstDay.getDay();
  for (let i = firstWeekDay - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

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

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const displayValue = computed(() => {
  if (props.type === 'daterange') {
    if (!selectedRange.value[0]) return '';
    if (!selectedRange.value[1]) return '开始日期 - 结束日期';
    return `${formatDate(selectedRange.value[0])} - ${formatDate(selectedRange.value[1])}`;
  }
  if (!selectedDate.value) return '';
  return formatDate(selectedDate.value);
});

function isSameDay(d1: Date, d2: Date | null): boolean {
  if (!d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isInRange(date: Date): boolean {
  if (props.type !== 'daterange') return false;
  if (!selectedRange.value[0] || !selectedRange.value[1]) return false;

  const time = date.getTime();
  return time >= selectedRange.value[0].getTime() && time <= selectedRange.value[1].getTime();
}

function isStartOrEnd(date: Date): boolean {
  if (props.type !== 'daterange') return isSameDay(date, selectedDate.value);
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

const defaultShortcuts = [
  { text: '今天', value: () => new Date() },
  { text: '昨天', value: () => new Date(Date.now() - 86400000) },
  { text: '近7天', value: () => [new Date(Date.now() - 6 * 86400000), new Date()] },
  { text: '近30天', value: () => [new Date(Date.now() - 29 * 86400000), new Date()] },
];

const shortcuts = computed(() => (props.shortcuts.length ? props.shortcuts : defaultShortcuts));
</script>

<template>
  <div
    class="base-datepicker"
    :class="{ 'is-disabled': disabled, 'is-opened': visible }"
  >
    <div class="base-datepicker__trigger" @click="visible = !visible">
      <span v-if="!displayValue" class="base-datepicker__placeholder">{{ placeholder }}</span>
      <span v-else class="base-datepicker__value">{{ displayValue }}</span>
      <span class="base-datepicker__icon">
        <span
          v-if="clearable && displayValue"
          class="base-datepicker__clear"
          role="button"
          aria-label="清空"
          tabindex="0"
          @click.stop="clear"
          @keydown.enter.stop="clear"
        >x</span>
        <span v-else>date</span>
      </span>
    </div>

    <Transition name="fade">
      <div v-if="visible" class="base-datepicker__dropdown">
        <div v-if="shortcuts.length" class="base-datepicker__shortcuts">
          <span
            v-for="shortcut in shortcuts"
            :key="shortcut.text"
            class="base-datepicker__shortcut"
            role="button"
            tabindex="0"
            @click="selectShortcut(shortcut)"
            @keydown.enter="selectShortcut(shortcut)"
          >
            {{ shortcut.text }}
          </span>
        </div>

        <div class="base-datepicker__header">
          <span
            class="base-datepicker__nav"
            role="button"
            tabindex="0"
            aria-label="上个月"
            @click="prevMonth"
            @keydown.enter="prevMonth"
          >&lt;</span>
          <span class="base-datepicker__current">{{ monthText }}</span>
          <span
            class="base-datepicker__nav"
            role="button"
            tabindex="0"
            aria-label="下个月"
            @click="nextMonth"
            @keydown.enter="nextMonth"
          >&gt;</span>
        </div>

        <div class="base-datepicker__week">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>

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
              'is-disabled': !!disabledDate?.(date),
            }"
            role="button"
            tabindex="0"
            @click="selectDate(date)"
            @mouseenter="hoverDate = date"
            @keydown.enter="selectDate(date)"
          >
            {{ date.getDate() }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
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
  border-radius: var(--radius-md, 4px);
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
  font-size: var(--font-base, 14px);
}

.base-datepicker__icon {
  color: var(--color-text-tertiary, #c0c4cc);
  font-size: var(--font-base, 14px);
}

.base-datepicker__clear {
  margin-right: 8px;
  cursor: pointer;
}

.base-datepicker__clear:hover {
  color: var(--color-primary, #409eff);
}

.base-datepicker__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 12px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: var(--radius-md, 4px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.base-datepicker__shortcuts {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.base-datepicker__shortcut {
  padding: 4px 10px;
  font-size: var(--font-xs, 12px);
  color: var(--color-primary, #409eff);
  background: var(--color-primary-light, #ecf5ff);
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
}

.base-datepicker__shortcut:hover {
  background: var(--color-primary-light, #d9ecff);
}

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
  border-radius: var(--radius-sm, 4px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.base-datepicker__nav:hover {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-datepicker__current {
  font-size: var(--font-base, 14px);
  font-weight: 500;
  color: var(--color-text, #303133);
}

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
  font-size: var(--font-xs, 12px);
  color: var(--color-text-secondary, #909399);
}

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
  font-size: var(--font-xs, 12px);
  color: var(--color-text, #606266);
  cursor: pointer;
  border-radius: var(--radius-sm, 4px);
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>