<template>
  <view class="calendar-root">
    <view class="calendar-header">
      <view class="calendar-nav" @click="prevMonth">
        <text class="calendar-nav-icon">‹</text>
      </view>
      <text class="calendar-title">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="calendar-nav" @click="nextMonth">
        <text class="calendar-nav-icon">›</text>
      </view>
    </view>

    <view class="calendar-weeks">
      <text v-for="(week, index) in weekLabels" :key="index" class="calendar-week">{{ week }}</text>
    </view>

    <view class="calendar-days">
      <view
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'is-current': day.currentMonth,
          'is-today': isToday(day.date),
          'is-selected': isSelected(day.date),
          'is-disabled': isDisabled(day.date)
        }"
        @click="onDayClick(day)"
      >
        <text class="calendar-day-text">{{ day.date.getDate() }}</text>
      </view>
    </view>

    <view class="calendar-footer">
      <view class="calendar-btn" @click="onConfirm">
        <text class="calendar-btn-text">确定</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  value: { type: String, default: '' },
  minDate: { type: String, default: '' },
  maxDate: { type: String, default: '' }
})

const emit = defineEmits(['update:value', 'change', 'confirm'])

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const selectedDate = computed(() => parseDate(props.value))
const minDate = computed(() => parseDate(props.minDate))
const maxDate = computed(() => parseDate(props.maxDate))

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)

watch(
  () => props.value,
  (val) => {
    const d = parseDate(val)
    if (d) {
      currentYear.value = d.getFullYear()
      currentMonth.value = d.getMonth() + 1
    }
  },
  { immediate: true }
)

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value - 1
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const totalDays = lastDay.getDate()
  const startWeekDay = firstDay.getDay()

  const days = []
  const prevLastDay = new Date(year, month, 0).getDate()

  for (let i = 0; i < startWeekDay; i++) {
    const d = prevLastDay - startWeekDay + i + 1
    days.push({ date: new Date(year, month - 1, d), currentMonth: false })
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), currentMonth: false })
  }

  return days
})

function parseDate(str) {
  if (!str) return null
  const parts = str.split('-')
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map(Number)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null
  return new Date(y, m - 1, d)
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isSameDay(d1, d2) {
  return (
    d1 && d2 &&
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function isToday(date) {
  return isSameDay(date, today)
}

function isSelected(date) {
  return isSameDay(date, selectedDate.value)
}

function isDisabled(date) {
  if (minDate.value && date < minDate.value) return true
  if (maxDate.value && date > maxDate.value) return true
  return false
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function onDayClick(day) {
  if (isDisabled(day.date)) return
  const dateStr = formatDate(day.date)
  emit('update:value', dateStr)
  emit('change', dateStr)
}

function onConfirm() {
  emit('confirm', props.value)
}
</script>

<style lang="scss" scoped>
.calendar-root {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.calendar-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.calendar-nav {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #F5F5F5;
}

.calendar-nav-icon {
  font-size: 18px;
  color: #666666;
  line-height: 1;
}

.calendar-weeks {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.calendar-week {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: #999999;
}

.calendar-days {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: 14.28%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:not(.is-disabled):active {
    background: #F5F5F5;
    border-radius: 50%;
  }
}

.calendar-day-text {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #CCCCCC;
  border-radius: 50%;
}

.calendar-day.is-current .calendar-day-text {
  color: #333333;
}

.calendar-day.is-today .calendar-day-text {
  border: 1px solid #2563EB;
  color: #2563EB;
}

.calendar-day.is-selected .calendar-day-text {
  background: #2563EB;
  color: #FFFFFF;
}

.calendar-day.is-disabled .calendar-day-text {
  color: #CCCCCC;
}

.calendar-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F0F0F0;
}

.calendar-btn {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2563EB;
  border-radius: 8px;
}

.calendar-btn-text {
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
