<template>
  <view
    class="t-form-item"
    :class="{
      't-form-item--error': errorMessage,
      't-form-item--required': isRequired
    }"
  >
    <view
      class="t-form-item__label"
      :style="{ width: labelWidth, flex: labelPosition === 'top' ? 'none' : 'none' }"
    >
      <text class="t-form-item__label-text">{{ label }}</text>
    </view>
    <view class="t-form-item__content">
      <slot />
      <view v-if="errorMessage" class="t-form-item__error">
        {{ errorMessage }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { inject, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { validateField } from '../../common/validators'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  prop: {
    type: String,
    default: ''
  },
  rules: {
    type: Array,
    default: () => []
  }
})

const form = inject('t-form', {})
const errorMessage = ref('')

// 是否必填
const isRequired = computed(() => {
  const formRules = form.rules?.[props.prop] || []
  const localRules = props.rules || []
  const allRules = [...formRules, ...localRules]

  return allRules.some(rule => rule.required)
})

const labelWidth = computed(() => form.labelWidth || '80px')
const labelPosition = computed(() => form.labelPosition || 'left')

// 验证（复用通用校验逻辑）
async function validate() {
  const formRules = form.rules?.[props.prop] || []
  const localRules = props.rules || []
  const allRules = [...formRules, ...localRules]
  const value = form.model?.[props.prop]

  errorMessage.value = await validateField(value, allRules, form.model) || ''
  return !errorMessage.value
}

// 清除验证
function clearValidate() {
  errorMessage.value = ''
}

// 重置
function resetField() {
  errorMessage.value = ''
  if (form.model && props.prop) {
    form.model[props.prop] = ''
  }
}

// 注册到表单
onMounted(() => {
  if (form.addField) {
    form.addField({
      prop: props.prop,
      validate,
      clearValidate,
      resetField
    })
  }
})

// 移除
onBeforeUnmount(() => {
  if (form.removeField) {
    form.removeField({
      prop: props.prop,
      validate,
      clearValidate,
      resetField
    })
  }
})

defineExpose({
  validate,
  clearValidate,
  resetField
})
</script>

<style lang="scss" scoped>
.t-form-item {
  margin-bottom: var(--space-4, 16px);
}

.t-form-item__label {
  display: flex;
  align-items: center;
  padding-right: var(--space-2, 8px);
}

.t-form-item--top .t-form-item__label {
  margin-bottom: var(--space-1, 4px);
}

.t-form-item__label-text {
  font-size: var(--text-sm, 14px);
  color: var(--color-text-primary, #374151);
}

.t-form-item--required .t-form-item__label-text::before {
  content: '*';
  color: var(--color-error, #ef4444);
  margin-right: var(--space-1, 4px);
}

.t-form-item__content {
  position: relative;
  flex: 1;
}

.t-form-item__error {
  margin-top: var(--space-1, 4px);
  font-size: var(--text-xs, 12px);
  color: var(--color-error, #ef4444);
}
</style>
