<!--
  ResultPage 结果页（业务组件）
  ============================================================
  基于 base-button 空壳组件组合实现，不改空壳。
  场景：支付结果、提交成功、操作失败、订单状态页。
  触发词：结果页 / 支付结果 / 提交成功 / 操作失败 / 成功页
-->
<template>
  <view class="result-page">
    <view class="rp-icon" :class="`is-${status}`">
      <text class="rp-icon-text">{{ iconMap[status] }}</text>
    </view>

    <text class="rp-title">{{ title }}</text>
    <text v-if="description" class="rp-desc">{{ description }}</text>

    <slot />

    <view class="rp-actions">
      <slot name="actions">
        <base-button
          v-if="primaryText"
          type="primary"
          size="lg"
          :block="true"
          :loading="loading"
          @click="$emit('primaryClick')"
        >
          {{ primaryText }}
        </base-button>
        <base-button
          v-if="secondaryText"
          class="rp-secondary"
          type="ghost"
          size="lg"
          :block="true"
          @click="$emit('secondaryClick')"
        >
          {{ secondaryText }}
        </base-button>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  status?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  description?: string
  primaryText?: string
  secondaryText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'success',
  title: '操作成功',
  description: '',
  primaryText: '完成',
  secondaryText: '',
  loading: false,
})

const emit = defineEmits<{ primaryClick: []; secondaryClick: [] }>()

const iconMap: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
}
</script>

<style lang="scss" scoped>
.result-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  padding: var(--spacing-3xl) var(--spacing-xl);
  overflow: hidden;
  box-sizing: border-box;
  background: var(--color-bg-page);
}

.rp-icon {
  width: var(--height-avatar-lg);
  height: var(--height-avatar-lg);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;

  &.is-success {
    background: var(--color-bg-tinted);
  }

  &.is-error {
    background: rgba(239, 68, 68, 0.1);
  }

  &.is-warning {
    background: rgba(245, 158, 11, 0.12);
  }

  &.is-info {
    background: var(--color-bg-tinted);
  }
}

.rp-icon-text {
  font-size: var(--font-2xl);
  font-weight: 700;

  .is-success & {
    color: var(--color-primary);
  }

  .is-error & {
    color: var(--color-error);
  }

  .is-warning & {
    color: var(--color-warning);
  }

  .is-info & {
    color: var(--color-text-secondary);
  }
}

.rp-title {
  margin-top: var(--spacing-lg);
  font-size: var(--font-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.rp-desc {
  margin-top: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
  text-align: center;
}

.rp-actions {
  width: 100%;
  margin-top: auto;
  padding-top: var(--spacing-2xl);
  display: flex;
  flex-direction: column;
}

.rp-actions > * {
  margin-bottom: var(--spacing-md);
}

.rp-actions > *:last-child {
  margin-bottom: 0;
}
</style>
