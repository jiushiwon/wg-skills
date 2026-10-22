<!--
  Stepper 数量步进器
  ============================================================
  数量加减控件：支持最小/最大值限制、步长、禁用与直接输入。
  主题变量真源：uniapp-theme-skill/templates/src/static/css/base.css
-->
<template>
  <view class="stepper" :class="{ 'stepper--disabled': disabled }">
    <view
      class="stepper__btn"
      :class="{ 'stepper__btn--disabled': disabled || value <= min }"
      @click="onMinus"
    >
      <text class="stepper__sign">-</text>
    </view>
    <input
      class="stepper__input"
      type="number"
      :value="display"
      :disabled="disabled || !editable"
      @input="onInput"
      @blur="onBlur"
    />
    <view
      class="stepper__btn"
      :class="{ 'stepper__btn--disabled': disabled || value >= max }"
      @click="onPlus"
    >
      <text class="stepper__sign">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface StepperProps {
  /** 绑定值 */
  modelValue?: number
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 是否禁用整个控件 */
  disabled?: boolean
  /** 是否允许直接输入 */
  editable?: boolean
}

const props = withDefaults(defineProps<StepperProps>(), {
  modelValue: 0,
  min: 0,
  max: 999,
  step: 1,
  disabled: false,
  editable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

/** 内部值，随 modelValue 同步 */
const inner = ref(props.modelValue)
/** 输入框展示值：跟随用户输入，失焦时才按范围回写 */
const display = ref(String(props.modelValue))

watch(
  () => props.modelValue,
  (val) => {
    inner.value = val
    display.value = String(val)
  },
)

function clamp(val: number) {
  return Math.min(props.max, Math.max(props.min, val))
}

const value = computed(() => clamp(inner.value))

function commit(val: number) {
  const next = clamp(val)
  inner.value = next
  display.value = String(next)
  emit('update:modelValue', next)
  emit('change', next)
}

function onMinus() {
  if (props.disabled) return
  if (value.value <= props.min) return
  commit(value.value - props.step)
}

function onPlus() {
  if (props.disabled) return
  if (value.value >= props.max) return
  commit(value.value + props.step)
}

function onInput(e: { detail: { value: string | number } }) {
  display.value = String(e.detail.value)
  const raw = parseFloat(String(e.detail.value))
  inner.value = Number.isNaN(raw) ? props.min : raw
}

function onBlur() {
  commit(inner.value)
}
</script>

<style lang="scss" scoped>
.stepper {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1rpx solid var(--border, #e5e5e5);
  border-radius: var(--radius-sm, 8rpx);
}

.stepper--disabled {
  opacity: 0.6;
}

.stepper__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--height-btn-md, 72rpx);
  height: var(--height-btn-md, 72rpx);
  background: var(--bg-light, #f5f5f5);
}

.stepper__btn--disabled {
  color: var(--text-disabled, #d4d4d4);
}

.stepper__sign {
  color: var(--text-primary, #171717);
  font-size: var(--font-xl, 32rpx);
  line-height: 1;
}

.stepper__btn--disabled .stepper__sign {
  color: var(--text-disabled, #d4d4d4);
}

.stepper__input {
  width: var(--space-24, 96rpx);
  height: var(--height-btn-md, 72rpx);
  border-right: 1rpx solid var(--border, #e5e5e5);
  border-left: 1rpx solid var(--border, #e5e5e5);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #171717);
  font-size: var(--font-md, 28rpx);
  text-align: center;
}
</style>
