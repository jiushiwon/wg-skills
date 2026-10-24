<!--
  Picker 多列滚轮选择器
  ============================================================
  外壳：根容器 BasePopup（direction="bottom"）
  内部：picker-view + picker-view-column 实现真实滑轮
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

    <!-- 滑轮：多列 -->
    <picker-view class="picker__view" :value="selectedIndexes" @change="onChange">
      <picker-view-column v-for="(col, colIndex) in columnOptions" :key="colIndex">
        <view v-for="(opt, optIndex) in col" :key="optIndex" class="picker__item">
          <text class="picker__item-text">{{ opt.label }}</text>
        </view>
      </picker-view-column>
    </picker-view>

    <template #footer>
      <view class="picker__footer">
        <text class="picker__btn" @click="onCancel">{{ cancelText }}</text>
        <text class="picker__btn picker__btn--primary" @click="onConfirm">{{ confirmText }}</text>
      </view>
    </template>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BasePopup from '../../../containers/base-popup/index.vue'

/** 列值类型：string 文本 / number 数字 / date 日期 */
type ColumnType = 'string' | 'number' | 'date'

/** 单个选项：可以是原始值，也可以是 { value, label } 对象 */
interface PickerOption {
  value?: string | number | Date
  label?: string
}

type PickerItem = string | number | Date | PickerOption

/** 归一化后的选项 */
interface NormalizedOption {
  value: string | number
  label: string
}

interface PickerProps {
  /** 各列选中值（v-model 双向绑定） */
  modelValue?: (string | number)[]
  /** 弹层是否显示 */
  show?: boolean
  /** 列数据：多列传二维数组，单列传一维数组 */
  columns?: (PickerItem[] | PickerItem)[]
  /** 每列的类型：string / number / date */
  columnTypes?: ColumnType[]
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

const props = withDefaults(defineProps<PickerProps>(), {
  modelValue: () => [],
  show: false,
  columns: () => [],
  columnTypes: () => [],
  title: '请选择',
  confirmText: '确认',
  cancelText: '取消',
  maskClosable: true,
  safeArea: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  'update:show': [value: boolean]
  'change': [value: (string | number)[]]
  'confirm': [value: (string | number)[]]
  'cancel': []
}>()

/** 弹层开合（受控） */
const popupVisible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

/** 日期  YYYY-MM-DD */
function toDateText(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 原始选项  { value, label } */
function toOption(item: PickerItem): NormalizedOption {
  if (item instanceof Date) {
    const text = toDateText(item)
    return { value: text, label: text }
  }
  if (item !== null && typeof item === 'object') {
    const option = item as PickerOption
    const raw = option.value !== undefined ? option.value : (option.label ?? '')
    const value = raw instanceof Date ? toDateText(raw) : raw
    return { value, label: String(option.label ?? value) }
  }
  return { value: item, label: String(item) }
}

/** 列数据归一化为二维数组（单列自动包一层） */
const columnOptions = computed<NormalizedOption[][]>(() => {
  const raw = props.columns
  if (!raw.length) return []
  const multi = Array.isArray(raw[0])
  const cols = multi ? (raw as PickerItem[][]) : [raw as PickerItem[]]
  return cols.map((col) => col.map(toOption))
})

/** 每列类型，缺省 string */
const columnTypeList = computed<ColumnType[]>(() =>
  columnOptions.value.map((_, index) => props.columnTypes[index] ?? 'string')
)

/** 按列类型归一化值，用于比较与输出 */
function normalizeValue(value: unknown, type: ColumnType): string | number {
  if (type === 'number') {
    const num = Number(value)
    return Number.isNaN(num) ? 0 : num
  }
  if (type === 'date') {
    if (value instanceof Date) return toDateText(value)
    return String(value ?? '')
  }
  return String(value ?? '')
}

/** 当前每列选中项的下标 */
const selectedIndexes = ref<number[]>([])

/** 当前每列选中值 */
const selectedValues = computed<(string | number)[]>(() =>
  columnOptions.value.map((col, index) => {
    const option = col[selectedIndexes.value[index] ?? 0]
    return option ? normalizeValue(option.value, columnTypeList.value[index]) : ''
  })
)

/** 依据 modelValue 同步下标（打不开或值不匹配时落在第一项） */
function syncIndexes() {
  selectedIndexes.value = columnOptions.value.map((col, index) => {
    const target = props.modelValue[index]
    if (target === undefined || target === null || target === '') return 0
    const type = columnTypeList.value[index]
    const wanted = normalizeValue(target, type)
    const found = col.findIndex((opt) => normalizeValue(opt.value, type) === wanted)
    return found >= 0 ? found : 0
  })
}

// 打开时按绑定值定位
watch(
  () => props.show,
  (visible) => {
    if (visible) syncIndexes()
  },
  { immediate: true }
)

// 外部绑定值变化时同步
watch(
  () => props.modelValue,
  () => syncIndexes(),
  { deep: true }
)

// 列数据变化时同步
watch(columnOptions, () => syncIndexes())

/** 滑轮滚动 */
function onChange(e: { detail: { value: number[] } }) {
  selectedIndexes.value = e.detail.value.slice(0, columnOptions.value.length)
  emit('change', selectedValues.value)
}

/** 确认 */
function onConfirm() {
  const values = selectedValues.value
  emit('update:modelValue', values)
  emit('confirm', values)
  popupVisible.value = false
}

/** 取消：回滚到绑定值 */
function onCancel() {
  syncIndexes()
  emit('cancel')
  popupVisible.value = false
}
</script>

<style scoped>
.picker__view {
  height: 400rpx;
  width: 100%;
}

.picker__item {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
}

.picker__item-text {
  font-size: var(--font-lg, 30rpx);
  color: var(--text-primary, #171717);
}

.picker__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-1, 4rpx);
}

.picker__btn {
  flex: 1;
  text-align: center;
  font-size: var(--font-md, 28rpx);
  color: var(--text-secondary, #525252);
}

.picker__btn--primary {
  color: var(--color-primary, #14b8a6);
  font-weight: 600;
}
</style>
