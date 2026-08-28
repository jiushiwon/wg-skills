<!--
  BaseAvatar 头像（基础组件）
  ============================================================
  用途：统一头像渲染——图片/兜底首字/尺寸/点击事件，一处维护五处用。
  使用方：user-card / comment-item / chat-page / moments-page / profile-page
-->
<template>
  <view
    class="base-avatar"
    :class="[`is-${size}`]"
    :style="{ width: avatarSize, height: avatarSize }"
    @click="$emit('click')"
  >
    <image
      v-if="src && !imgError"
      class="ba-img"
      :src="src"
      :mode="mode"
      @error="onError"
    />
    <view v-else class="ba-ph">
      <text class="ba-ph-text">{{ initial }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  /** 图片地址 */
  src?: string
  /** 昵称（兜底显示首字） */
  nickname?: string
  /** 尺寸 sm=64rpx / md=96rpx / lg=128rpx */
  size?: 'sm' | 'md' | 'lg'
  /** 图片裁剪模式 */
  mode?: 'aspectFill' | 'aspectFit' | 'widthFix' | 'scaleToFill'
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  nickname: '',
  size: 'sm',
  mode: 'aspectFill',
})

const emit = defineEmits<{ click: [] }>()

const imgError = ref(false)

const avatarSize = computed(() => {
  const map: Record<string, string> = {
    sm: 'var(--height-avatar-sm)',
    md: 'var(--height-avatar-md)',
    lg: 'var(--height-avatar-lg)',
  }
  return map[props.size] || map.sm
})

const initial = computed(() => (props.nickname || '用').slice(0, 1))

function onError() {
  imgError.value = true
}
</script>

<style lang="scss" scoped>
.base-avatar {
  flex-shrink: 0;
  border-radius: var(--radius-avatar);
  overflow: hidden;
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
  background: var(--color-bg-tinted);
}

.ba-ph-text {
  font-size: var(--font-lg);
  color: var(--color-primary);
}

.is-md .ba-ph-text,
.is-lg .ba-ph-text {
  font-size: var(--font-2xl);
}
</style>
