<!--
  NoticeBar 通知/公告栏（业务组件）
  ============================================================
  轻量业务组件（不依赖 base-card）。
  场景：公告、活动提示、系统通知、跑马灯。
  触发词：通知栏 / 公告栏 / 跑马灯 / 提示条
-->
<template>
  <view
    class="notice-bar"
    :class="{ 'is-marquee': scrollable }"
    :style="bg ? { background: bg } : undefined"
    @click="$emit('click')"
  >
    <slot name="icon">
      <text v-if="icon" class="nb-icon">{{ icon }}</text>
      <text v-else class="nb-icon">🔔</text>
    </slot>

    <view class="nb-body">
      <slot>
        <text class="nb-text">{{ text }}</text>
      </slot>
    </view>

    <view v-if="closable" class="nb-close" @click.stop="$emit('close')">
      <text class="nb-close-icon">×</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 通知文案 */
  text?: string
  /** 左侧图标（emoji/字符，或 #icon slot） */
  icon?: string
  /** 是否可关闭 */
  closable?: boolean
  /** 跑马灯滚动 */
  scrollable?: boolean
  /** 背景色（默认主题浅色强调底） */
  bg?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  icon: '',
  closable: true,
  scrollable: false,
  bg: '',
})

const emit = defineEmits<{ click: []; close: [] }>()
</script>

<style lang="scss" scoped>
.notice-bar {
  display: flex;
  align-items: center;
  min-height: var(--height-btn-md);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-tag);
  background: var(--color-bg-tinted);
  overflow: hidden;
}

.nb-icon {
  flex-shrink: 0;
  margin-right: var(--spacing-sm);
  font-size: var(--font-md);
}

.nb-body {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.nb-text {
  display: inline-block;
  font-size: var(--font-sm);
  color: var(--color-text-primary);
  white-space: nowrap;

  .is-marquee & {
    animation: nb-marquee 8s linear infinite;
  }
}

@keyframes nb-marquee {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

.nb-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 44rpx;
  margin-right: calc(-1 * var(--spacing-sm));
}

.nb-close-icon {
  font-size: var(--font-md);
  color: var(--color-text-tertiary);
  line-height: 1;
}
</style>
