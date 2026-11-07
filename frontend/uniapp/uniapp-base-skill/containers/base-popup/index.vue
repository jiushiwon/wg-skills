<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '../base-card/index.vue'

interface PopupProps {
  show: boolean
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  radius?: string
  height?: string
  width?: string
  /** 内边距档位：default / sm / none（转发给内部 base-card） */
  padding?: 'default' | 'sm' | 'none'
  /** 标题（转发给内部 base-card） */
  title?: string
  mask?: boolean
  maskClosable?: boolean
  duration?: number
  safeArea?: boolean
}

const props = withDefaults(defineProps<PopupProps>(), {
  show: false,
  direction: 'bottom',
  radius: 'var(--radius-lg, 24rpx)',
  height: 'auto',
  width: '560rpx',
  padding: 'default',
  title: '',
  mask: true,
  maskClosable: true,
  duration: 300,
  safeArea: true,
})

const emit = defineEmits(['update:show', 'close'])

// 弹出层样式
const popupStyle = computed(() => {
  const style: Record<string, string> = {
    transitionDuration: `${props.duration}ms`,
  }

  if (props.direction === 'top' || props.direction === 'bottom') {
    style.height = props.height
  } else {
    style.width = props.width
  }

  // 居中弹窗：宽度自适应内容，并限制最大宽度
  if (props.direction === 'center') {
    style.width = props.width
    style.maxWidth = '90%'
  }

  // 底部弹窗适配 iOS 安全区域（home indicator）
  if (props.safeArea && props.direction === 'bottom') {
    style.paddingBottom = 'env(safe-area-inset-bottom)'
  }

  return style
})

// 圆角：方向决定圆角位置，内置 base-card 与外层容器共用同一份计算结果
const radiusStyle = computed(() => {
  const r = props.radius
  switch (props.direction) {
    case 'bottom':
      return { borderRadius: `${r} ${r} 0 0` }
    case 'top':
      return { borderRadius: `0 0 ${r} ${r}` }
    case 'left':
      return { borderRadius: `0 ${r} ${r} 0` }
    case 'right':
      return { borderRadius: `${r} 0 0 ${r}` }
    case 'center':
      return { borderRadius: r }
    default:
      return {}
  }
})

// 内边距档位  CSS 值（交给 base-card 落地）
const PADDING_MAP = {
  default: 'var(--space-4, 16rpx)',
  sm: 'var(--space-3, 12rpx)',
  none: '0',
} as const

// 遮罩点击
function onMaskClick() {
  if (props.maskClosable) {
    emit('update:show', false)
    emit('close')
  }
}

// 动画结束
function onTransitionEnd() {
  if (!props.show) {
    emit('close')
  }
}

// 点击穿透阻止
function preventClose(e: Event) {
  e.stopPropagation()
}
</script>

<template>
  <!-- 遮罩层 -->
  <view
    v-if="show && mask"
    class="popup-mask"
    :class="{ show }"
    :style="{ transitionDuration: `${duration}ms` }"
    @click="onMaskClick"
  />

  <!-- 弹窗主体 -->
  <view
    v-if="show"
    class="popup"
    :class="[`popup-${direction}`, { show }]"
    :style="{ ...popupStyle, ...radiusStyle }"
    @click="preventClose"
    @transitionend="onTransitionEnd"
  >
    <!-- 内置 base-card：弹窗内容自动遵守容器原则 -->
    <BaseCard
      :title="title"
      :padding="PADDING_MAP[padding]"
      :radius="radiusStyle.borderRadius"
      background="transparent"
    >
      <template v-if="$slots['header-right']" #header-right>
        <slot name="header-right" />
      </template>
      <slot />
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </BaseCard>
  </view>
</template>

<style scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay, rgba(0, 0, 0, 0.5));
  opacity: 0;
  visibility: hidden;
  z-index: var(--z-index-modal-backdrop, 400);
  transition: opacity linear, visibility linear;
}

.popup-mask.show {
  opacity: 1;
  visibility: visible;
}

.popup {
  position: fixed;
  z-index: var(--z-index-modal, 500);
  background: var(--bg-card, #ffffff);
  transition: transform linear;
}

.popup-top {
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(-100%);
}

.popup-top.show {
  transform: translateY(0);
}

.popup-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(100%);
}

.popup-bottom.show {
  transform: translateY(0);
}

.popup-left {
  top: 0;
  left: 0;
  bottom: 0;
  transform: translateX(-100%);
}

.popup-left.show {
  transform: translateX(0);
}

.popup-right {
  top: 0;
  right: 0;
  bottom: 0;
  transform: translateX(100%);
}

.popup-right.show {
  transform: translateX(0);
}

/* 居中弹窗：缩放淡入 */
.popup-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  opacity: 0;
  transition: transform linear, opacity linear;
}

.popup-center.show {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}
</style>
