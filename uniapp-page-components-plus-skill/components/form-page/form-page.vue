<!--
  FormPage 表单组件化页面
  ============================================================
  结构：导航栏 + 滚动区（表单 slot）+ 底部固定提交按钮
  用途：设置资料 / 发布 / 意见反馈 / 地址填写 等一切"表单 + 提交"页面。
  核心：表单区完全 slot 化（推荐配合 base-form-item + 原生控件），
       底部提交按钮用 base-button（type=primary），loading 态自动禁用。
-->
<template>
  <view class="form-page">
    <slot name="navbar">
      <base-navbar :title="title" :show-back="showBack" :fixed="true" :placeholder="true" @back="$emit('back')" />
    </slot>

    <scroll-view class="fp-body" scroll-y>
      <view class="fp-body-inner">
        <slot name="form">
          <view class="fp-placeholder">
            <text class="fp-placeholder-text">表单区（用 base-form-item + 原生控件填充）</text>
          </view>
        </slot>

        <slot />
      </view>
    </scroll-view>

    <view v-if="showFooter" class="fp-footer">
      <slot name="footer">
        <base-button type="primary" :block="true" :loading="loading" :disabled="disabled" @click="$emit('submit')">
          {{ submitText }}
        </base-button>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 导航栏标题 */
  title?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 底部提交按钮文案 */
  submitText?: string
  /** 是否显示底部提交栏 */
  showFooter?: boolean
  /** 提交中（按钮 loading + 禁用） */
  loading?: boolean
  /** 提交禁用（如未通过校验） */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '表单',
  showBack: true,
  submitText: '提交',
  showFooter: true,
  loading: false,
  disabled: false,
})

const emit = defineEmits<{ back: []; submit: [] }>()
</script>

<style lang="scss" scoped>
.form-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-page);
}

.fp-body {
  flex: 1;
  min-height: 0;
}

.fp-body-inner {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-2xl);
}

.fp-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) 0;
}

.fp-placeholder-text {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.fp-footer {
  flex-shrink: 0;
  background: var(--color-bg-surface);
  border-top: 1rpx solid var(--color-border-light);
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
}
</style>
