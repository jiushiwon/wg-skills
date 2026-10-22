<!--
  EmptyState 空状态
  ============================================================
  用途：列表 / 页面无数据时的占位展示（纯展示件）。
  约定：
    - 图标优先用 image 插槽或 image 属性（图片地址），
      未提供时退化为 CSS 形状占位，绝不使用 emoji；
    - 操作区优先用 action 插槽，未提供时按 buttonText + showButton 渲染。
-->
<template>
  <view class="empty-state">
    <view class="empty-state__visual">
      <slot name="icon">
        <image v-if="image" class="empty-state__image" :src="image" mode="aspectFit" />
        <view v-else class="empty-state__shape" />
      </slot>
    </view>

    <text v-if="title" class="empty-state__title">{{ title }}</text>
    <text v-if="desc" class="empty-state__desc">{{ desc }}</text>

    <view class="empty-state__action">
      <slot name="action">
        <view v-if="showButton && buttonText" class="empty-state__button" @click="onClick">
          <text class="empty-state__button-text">{{ buttonText }}</text>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface EmptyStateProps {
  /** 插图 / 图标图片地址（为空时使用 CSS 形状占位） */
  image?: string
  /** 标题 */
  title?: string
  /** 描述文字 */
  desc?: string
  /** 操作按钮文字 */
  buttonText?: string
  /** 是否显示操作按钮（需配合 buttonText） */
  showButton?: boolean
}

withDefaults(defineProps<EmptyStateProps>(), {
  image: '',
  title: '',
  desc: '',
  buttonText: '',
  showButton: false,
})

const emit = defineEmits<{ click: [] }>()

function onClick() {
  emit('click')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12, 48rpx) var(--space-5, 20rpx);
}

.empty-state__visual {
  margin-bottom: var(--space-4, 16rpx);
}

.empty-state__image {
  width: 240rpx;
  height: 240rpx;
}

/* 无图片时的 CSS 形状占位 */
.empty-state__shape {
  position: relative;
  width: var(--icon-xl, 96rpx);
  height: var(--icon-xl, 96rpx);
  border: 4rpx solid var(--border, #e5e5e5);
  border-radius: var(--radius-lg, 24rpx);
}

.empty-state__shape::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 48rpx;
  height: 6rpx;
  transform: translate(-50%, -50%);
  border-radius: var(--radius-full, 9999rpx);
  background: var(--border, #e5e5e5);
}

.empty-state__title {
  font-size: var(--font-lg, 30rpx);
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary, #171717);
  text-align: center;
}

.empty-state__desc {
  margin-top: var(--space-2, 8rpx);
  font-size: var(--font-sm, 26rpx);
  line-height: 1.6;
  color: var(--text-secondary, #525252);
  text-align: center;
}

.empty-state__action {
  margin-top: var(--space-6, 24rpx);
}

.empty-state__button {
  height: var(--height-btn-md, 72rpx);
  padding: 0 var(--space-8, 32rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-btn, 9999rpx);
  background: var(--color-primary, #14b8a6);
  transition: opacity var(--transition-fast, 150ms ease);
}

.empty-state__button:active {
  opacity: 0.8;
}

.empty-state__button-text {
  font-size: var(--font-md, 28rpx);
  line-height: 1;
  color: var(--text-inverse, #ffffff);
}
</style>
