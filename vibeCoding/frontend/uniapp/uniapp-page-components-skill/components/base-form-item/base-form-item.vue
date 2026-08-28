<!--
  BaseFormItem 表单行（自定义表单的基础单元）
  ============================================================
  结构：label（可必填星号）+ 右侧控件 slot + 底部错误提示
  用途：配合原生 input / picker / switch / textarea 使用，统一表单行的
       对齐、间距、错误态；多个 base-form-item 组成 form-page 的表单区。
  特性：
    - required 自动加红色星号；
    - error 传入即显示错误提示，并把行边框标红（由外部控制校验时机）；
    - labelWidth 可调，行内 label 与控件自适应。
-->
<template>
  <view class="bfi" :class="{ 'is-error': !!error }">
    <view class="bfi-row">
      <view class="bfi-label" :style="{ width: labelWidth }">
        <text v-if="required" class="bfi-star">*</text>
        <slot name="label">
          <text class="bfi-label-text">{{ label }}</text>
        </slot>
      </view>

      <view class="bfi-content">
        <slot />
      </view>
    </view>

    <view v-if="error" class="bfi-error">
      <slot name="error">
        <text class="bfi-error-text">{{ error }}</text>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 标签文案 */
  label?: string
  /** 必填（左侧红色星号） */
  required?: boolean
  /** 错误提示（非空即显示 + 行标红） */
  error?: string
  /** 标签列宽 */
  labelWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  required: false,
  error: '',
  labelWidth: '160rpx',
})
</script>

<style lang="scss" scoped>
.bfi {
  min-height: var(--height-btn-xl);
}

.bfi-row {
  display: flex;
  align-items: center;
  min-height: var(--height-btn-xl);
  border-bottom: 1rpx solid var(--color-border-light);
}

.bfi-label {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.bfi-label-text {
  font-size: var(--font-md);
  color: var(--color-text-primary);
}

.bfi-star {
  margin-right: 4rpx;
  font-size: var(--font-md);
  color: var(--color-error);
  line-height: 1;
}

.bfi-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.bfi-error {
  margin-top: var(--spacing-xs);
}

.bfi-error-text {
  font-size: var(--font-xs);
  color: var(--color-error);
}

.is-error .bfi-row {
  border-bottom-color: var(--color-error);
}
</style>
