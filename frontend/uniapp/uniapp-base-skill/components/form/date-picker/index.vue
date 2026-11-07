<!--
  DatePicker 日期滑轮选择器
  ============================================================
  外壳：根容器 BasePopup（direction="bottom"）
  内部：picker-view 三列（年 / 月 / 日），含闰年联动
  主题变量真源：uniapp-theme-skill/templates/src/static/css/base.css
-->
<template>
  <BasePopup
    v-model:show="popupVisible"
    direction="bottom"
    :title="title"
    padding="default"
    :mask-closable="maskClosable"
    :safe-area="safeArea"
  >
    <template v-if="$slots['header-right']" #header-right>
      <slot name="header-right" />
    </template>

    <picker-view class="date-picker__view" :value="selectedIndexes" @change="onChange">
      <picker-view-column>
        <view v-for="year in yearOptions" :key="year" class="date-picker__item">
          <text class="date-picker__item-text">{{ year }}年</text>
        </view>
      </picker-view-column>

      <picker-view-column>
        <view v-for="month in monthOptions" :key="month" class="date-picker__item">
          <text class="date-picker__item-text">{{ month }}月</text>
        </view>
      </picker-view-column>

      <picker-view-column>
        <view v-for="day in dayOptions" :key="day" class="date-picker__item">
          <text class="date-picker__item-text">{{ day }}日</text>
        </view>
      </picker-view-column>
    </picker-view>

    <template #footer>
      <view class="date-picker__footer">
        <text class="date-picker__btn" @click="onCancel">{{ cancelText }}</text>
        <text class="date-picker__btn date-picker__btn--primary" @click="onConfirm">{{ confirmText }}</text>
      </view>
    </template>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BasePopup from '../../../containers/base-popup/index.vue'

interface DatePickerProps {
  /** 选中日期，格式 YYYY-MM-DD（v-model 双向绑定） */
  modelValue?: string
  /** 弹层是否显示 */
  show?: boolean
  /** 最小年份 */
  min?: number
  /** 最大年份 */
  max?: number
  /** 展示与确认载荷格式，支持 YYYY / MM / DD 占位 */
  format?: string
  /** 弹窗标题 */
  title?: string
  /** 确认按钮文案 */
  confirmText?: string
  /** 取消按钮文案 */
  cancelText?: string
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean
  /** 底部是否适配安全区 */
  safeArea?: boolean
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  modelValue: '',
  show: false,
  min: 1970,
  max: 2100,
  format: 'YYYY-MM-DD',
  title: '选择日期',
  confirmText: '确认',
  cancelText: '取消',
  maskClosable: true,
  safeArea: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:show': [value: boolean]
  'change': [value: string]
  'confirm': [value: string]
  'cancel': []
}>()

/** 弹层开合（受控） */
const popupVisible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

/** 闰年判定：四年一闰，百年不闰，四百年再闰 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/** 某年某月的天数（2 月按闰年判定） */
function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2 && isLeapYear(year)) return 29
  return days[month - 1]
}

/** 年份范围 */
const yearOptions = computed<number[]>(() => {
  const from = Math.min(props.min, props.max)
  const to = Math.max(props.min, props.max)
  const list: number[] = []
  for (let year = from; year <= to; year++) list.push(year)
  return list
})

/** 月份范围 */
const monthOptions = computed<number[]>(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])

/** 当前选中的年 / 月 / 日 */
const selectedYear = ref(props.min)
const selectedMonth = ref(1)
const selectedDay = ref(1)

/** 日列随年月变化：28 / 29 / 30 / 31 */
const dayOptions = computed<number[]>(() => {
  const total = daysInMonth(selectedYear.value, selectedMonth.value)
  const list: number[] = []
  for (let day = 1; day <= total; day++) list.push(day)
  return list
})

/** 滑轮下标 */
const selectedIndexes = computed<number[]>(() => [
  Math.max(0, selectedYear.value - yearOptions.value[0]),
  selectedMonth.value - 1,
  Math.min(selectedDay.value, dayOptions.value.length) - 1,
])

/** 归一化到合法范围（年份越界夹紧，天数按当月裁剪） */
function clampDate(year: number, month: number, day: number) {
  const from = yearOptions.value[0]
  const to = yearOptions.value[yearOptions.value.length - 1]
  const safeYear = Math.min(Math.max(year, from), to)
  const safeMonth = Math.min(Math.max(month, 1), 12)
  const safeDay = Math.min(Math.max(day, 1), daysInMonth(safeYear, safeMonth))
  selectedYear.value = safeYear
  selectedMonth.value = safeMonth
  selectedDay.value = safeDay
}

/** 解析 YYYY-MM-DD，非法或为空时取今天 */
function applyModelValue() {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(props.modelValue || '')
  if (matched) {
    clampDate(Number(matched[1]), Number(matched[2]), Number(matched[3]))
    return
  }
  const now = new Date()
  clampDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/** 打开时按绑定值定位 */
watch(
  () => props.show,
  (visible) => {
    if (visible) applyModelValue()
  },
  { immediate: true }
)

// 外部绑定值变化时同步
watch(() => props.modelValue, () => applyModelValue())

// 日列长度变化时兜底裁剪（例如 2 月 29 日切到平年后）
watch(dayOptions, (days) => {
  if (selectedDay.value > days.length) selectedDay.value = days.length
})

/** 滑轮滚动：换年 / 换月后重算日列并做闰年夹取 */
function onChange(e: { detail: { value: number[] } }) {
  const [yearIndex, monthIndex, dayIndex] = e.detail.value
  const year = yearOptions.value[yearIndex] ?? selectedYear.value
  const month = monthIndex + 1
  let day = dayIndex + 1

  // 闰年联动：2 月 29 日遇到平年自动夹到 28 日
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    day = 28
  }
  // 月份天数变化（如 1 月 31 日切到 2 月）按当月天数裁剪
  day = Math.min(day, daysInMonth(year, month))

  clampDate(year, month, day)
  emit('change', formatDate())
}

/** 生成 YYYY-MM-DD */
function formatDate(): string {
  const month = `${selectedMonth.value}`.padStart(2, '0')
  const day = `${selectedDay.value}`.padStart(2, '0')
  return `${selectedYear.value}-${month}-${day}`
}

/** 按 format 占位符输出展示文本（YYYY / MM / DD） */
function formatByPattern(date: string): string {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!matched) return date
  return props.format
    .replace(/YYYY/g, matched[1])
    .replace(/MM/g, matched[2])
    .replace(/DD/g, matched[3])
}

/** 确认：输出格式化后的文本，同时把规范日期回写绑定值 */
function onConfirm() {
  const canonical = formatDate()
  const display = formatByPattern(canonical)
  emit('update:modelValue', canonical)
  emit('confirm', display)
  popupVisible.value = false
}

/** 取消：回滚到绑定值 */
function onCancel() {
  applyModelValue()
  emit('cancel')
  popupVisible.value = false
}
</script>

<style scoped>
.date-picker__view {
  height: 400rpx;
  width: 100%;
}

.date-picker__item {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
}

.date-picker__item-text {
  font-size: var(--font-lg, 30rpx);
  color: var(--text-primary, #171717);
}

.date-picker__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-1, 4rpx);
}

.date-picker__btn {
  flex: 1;
  text-align: center;
  font-size: var(--font-md, 28rpx);
  color: var(--text-secondary, #525252);
}

.date-picker__btn--primary {
  color: var(--color-primary, #14b8a6);
  font-weight: 600;
}
</style>
