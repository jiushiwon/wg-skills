<!--
  BaseAvatar 头像容器
  ============================================================
  统一头像渲染：图片 / 文字兜底 / 尺寸档 / 形状 / 点击事件。
  业务侧只传 src + name，不再各自实现兜底与尺寸表。
-->
<template>
  <view
    class="base-avatar"
    :class="`is-${size}`"
    :style="avatarStyle"
    @click="onClick"
  >
    <image
      v-if="src && !imgError"
      class="ba-img"
      :src="src"
      :mode="mode"
      @error="onError"
    />
    <view v-else class="ba-ph">
      <text class="ba-ph-text">{{ fallbackText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface AvatarProps {
  /** 图片地址 */
  src?: string
  /** 昵称：优先取末两字，缺省取首字 */
  name?: string
  /** 尺寸档 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 是否圆形（false 时用圆角矩形） */
  round?: boolean
  /** 图片裁剪模式 */
  mode?: 'aspectFill' | 'aspectFit' | 'widthFix' | 'scaleToFill'
  /** 兜底文字（不传则由 name 推导） */
  fallback?: string
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: '',
  name: '',
  size: 'md',
  round: true,
  mode: 'aspectFill',
  fallback: '',
})

const emit = defineEmits<{ click: [] }>()

const imgError = ref(false)

// src 变化时重置错误态，避免换图后一直显示兜底
watch(
  () => props.src,
  () => {
    imgError.value = false
  },
)

const SIZE_MAP: Record<AvatarProps['size'] & string, string> = {
  sm: 'var(--height-avatar-sm, 56rpx)',
  md: 'var(--height-avatar-md, 80rpx)',
  lg: 'var(--height-avatar-lg, 120rpx)',
  xl: 'var(--height-avatar-xl, 160rpx)',
}

const avatarStyle = computed(() => ({
  width: SIZE_MAP[props.size] ?? SIZE_MAP.md,
  height: SIZE_MAP[props.size] ?? SIZE_MAP.md,
  borderRadius: props.round ? 'var(--radius-avatar, 9999rpx)' : 'var(--radius-image, 16rpx)',
}))

const fallbackText = computed(() => {
  if (props.fallback) return props.fallback
  if (!props.name) return '?'
  // 中文名取末两字更符合国内习惯；单字名直接用
  return props.name.length > 1 ? props.name.slice(-2) : props.name
})

function onError() {
  imgError.value = true
}

function onClick() {
  emit('click')
}
</script>

<style scoped>
.base-avatar {
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light, #f5f5f5);
}

.ba-img {
  width: 100%;
  height: 100%;
}

.ba-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.ba-ph-text {
  font-size: var(--font-md, 28rpx);
  font-weight: 500;
  color: var(--text-secondary, #525252);
}

.is-lg .ba-ph-text,
.is-xl .ba-ph-text {
  font-size: var(--font-xl, 32rpx);
}
</style>
