<!--
  CountDown 倒计时
  ============================================================
  三种倒计时起算方式：
    - target（结束时间戳，ms）
    - timestamp（结束时间戳，ms，兼容旧属性名）
    - seconds（相对秒数）
  展示方式：
    - format 非空  按 HH:mm:ss / DD:HH:mm:ss 模板渲染
    - 默认插槽  由业务自行渲染分段（slot 上带 day/hour/minute/second）
    - 两者都无  默认分段样式（天/时/分/秒）
  主题变量真源：uniapp-theme-skill/templates/src/static/css/base.css
-->
<template>
  <view class="count-down">
    <slot v-if="!isEnd" v-bind="segments">
      <text v-if="format" class="count-down__text">{{ formatted }}</text>
      <template v-else>
        <view v-if="showDay && day > 0" class="count-down__item">
          <text class="count-down__num">{{ dayText }}</text>
          <text v-if="showUnit" class="count-down__unit">天</text>
        </view>
        <view class="count-down__item">
          <text class="count-down__num">{{ hourText }}</text>
          <text v-if="showUnit" class="count-down__unit">:</text>
        </view>
        <view class="count-down__item">
          <text class="count-down__num">{{ minuteText }}</text>
          <text v-if="showUnit" class="count-down__unit">:</text>
        </view>
        <view class="count-down__item">
          <text class="count-down__num">{{ secondText }}</text>
        </view>
      </template>
    </slot>
    <view v-else class="count-down__end">
      <slot name="end">{{ endText }}</slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

interface CountDownProps {
  /** 结束时间戳（毫秒），与 seconds 二选一 */
  target?: number
  /** 结束时间戳（毫秒），兼容旧属性名，等价于 target */
  timestamp?: number
  /** 相对秒数（从现在起倒计时），target 为 0 时生效 */
  seconds?: number
  /** 展示格式模板，支持 DD/HH/mm/ss 占位符；为空则走默认分段样式 */
  format?: string
  /** 是否显示天数（默认分段样式下生效） */
  showDay?: boolean
  /** 是否显示单位分隔（默认分段样式下生效） */
  showUnit?: boolean
  /** 倒计时结束文案 */
  endText?: string
  /** 是否自动开始 */
  autostart?: boolean
}

const props = withDefaults(defineProps<CountDownProps>(), {
  target: 0,
  timestamp: 0,
  seconds: 0,
  format: '',
  showDay: false,
  showUnit: true,
  endText: '已结束',
  autostart: true,
})

const emit = defineEmits<{ finish: []; end: [] }>()

const remaining = ref(0)
const isEnd = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
/** 结束事件只触发一次 */
let finished = false

/** 结束时间戳（ms），target 优先，其次兼容的 timestamp */
const endAt = computed(() => props.target || props.timestamp)

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function finish() {
  stop()
  remaining.value = 0
  isEnd.value = true
  if (finished) return
  finished = true
  emit('finish')
  emit('end')
}

function start() {
  stop()
  finished = false
  isEnd.value = false
  if (!props.autostart) return

  const total = endAt.value ? endAt.value - Date.now() : props.seconds * 1000
  if (total <= 0) {
    remaining.value = 0
    finish()
    return
  }
  remaining.value = total
  timer = setInterval(() => {
    remaining.value -= 1000
    if (remaining.value <= 0) finish()
  }, 1000)
}

const day = computed(() => Math.floor(remaining.value / 86400000))
const hour = computed(() => Math.floor((remaining.value / 3600000) % 24))
const minute = computed(() => Math.floor((remaining.value / 60000) % 60))
const second = computed(() => Math.floor((remaining.value / 1000) % 60))

const dayText = computed(() => String(day.value).padStart(2, '0'))
const hourText = computed(() => String(hour.value).padStart(2, '0'))
const minuteText = computed(() => String(minute.value).padStart(2, '0'))
const secondText = computed(() => String(second.value).padStart(2, '0'))

/** 按 format 模板渲染；天数大于 0 且模板未含 DD 时自动补在最前 */
const formatted = computed(() => {
  const template = props.format
  if (!template) return ''
  const map: Record<string, string> = {
    DD: dayText.value,
    HH: hourText.value,
    mm: minuteText.value,
    ss: secondText.value,
  }
  const body = template.replace(/DD|HH|mm|ss/g, (token) => map[token] ?? token)
  if (day.value > 0 && !template.includes('DD')) {
    return `${dayText.value}${props.showUnit ? '天' : ''}:${body}`
  }
  return body
})

/** 默认插槽可用的分段数据 */
const segments = computed(() => ({
  day: day.value,
  hour: hour.value,
  minute: minute.value,
  second: second.value,
  dayText: dayText.value,
  hourText: hourText.value,
  minuteText: minuteText.value,
  secondText: secondText.value,
  formatted: formatted.value,
  isEnd: isEnd.value,
}))

watch(
  () => [endAt.value, props.seconds, props.autostart],
  () => start(),
  { immediate: true },
)

onUnmounted(stop)
</script>

<style lang="scss" scoped>
.count-down {
  display: inline-flex;
  align-items: center;
}

.count-down__item {
  display: flex;
  align-items: center;
}

.count-down__num {
  display: inline-block;
  min-width: var(--space-10, 40rpx);
  padding: var(--space-1, 4rpx) var(--space-2, 8rpx);
  border-radius: var(--radius-sm, 8rpx);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #171717);
  font-size: var(--font-md, 28rpx);
  font-weight: 600;
  text-align: center;
}

.count-down__text {
  color: var(--text-primary, #171717);
  font-size: var(--font-lg, 30rpx);
  font-weight: 600;
}

.count-down__unit {
  margin: 0 var(--space-2, 8rpx);
  color: var(--text-secondary, #525252);
  font-size: var(--font-sm, 26rpx);
}

.count-down__end {
  color: var(--text-tertiary, #a3a3a3);
  font-size: var(--font-md, 28rpx);
}
</style>
