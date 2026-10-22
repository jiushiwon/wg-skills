<!--
  Loading 加载态
  ============================================================
  用途：纯展示的加载指示器（纯展示件，不套容器）。
  约定：
    - 组件内不写 @keyframes：旋转动画由全局关键帧真源提供
      （uniapp-base-skill/styles/animation.scss 的 .ui-spin），
      组件只引用该类，不重复定义动画。
-->
<template>
  <view v-if="loading" class="loading">
    <view class="loading__spinner ui-spin" :style="spinnerStyle" />
    <text v-if="text" class="loading__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface LoadingProps {
  /** 是否显示加载态 */
  loading?: boolean
  /** 加载文字 */
  text?: string
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<LoadingProps>(), {
  loading: true,
  text: '',
  size: 'medium',
})

const SIZE_MAP = {
  small: 'var(--icon-sm, 36rpx)',
  medium: 'var(--icon-md, 48rpx)',
  large: 'var(--icon-lg, 72rpx)',
} as const

const spinnerStyle = computed(() => ({
  width: SIZE_MAP[props.size],
  height: SIZE_MAP[props.size],
}))
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-5, 20rpx);
}

.loading__spinner {
  box-sizing: border-box;
  border: 4rpx solid var(--border, #e5e5e5);
  border-top-color: var(--color-primary, #14b8a6);
  border-radius: var(--radius-full, 9999rpx);
}

.loading__text {
  margin-top: var(--space-3, 12rpx);
  font-size: var(--font-sm, 26rpx);
  line-height: 1.4;
  color: var(--text-secondary, #525252);
  text-align: center;
}
</style>
