<!--
  ListItem 列表项
  ============================================================
  卡片外壳由根容器 BaseCard 提供（圆角/背景/边框），本组件只负责内部排布。
-->
<template>
  <BaseCard
    class="li-card"
    :class="{ 'is-disabled': disabled }"
    :padding="'var(--space-4, 16rpx)'"
    :min-height="'var(--height-btn-lg, 88rpx)'"
    :border="true"
    :clickable="!disabled"
    @click="onClick"
  >
    <view class="li">
      <!-- 左侧图标 -->
      <view v-if="icon && !iconError" class="li-icon">
        <image class="li-icon-img" :src="icon" mode="aspectFit" @error="onIconError" />
      </view>

      <!-- 左侧自定义插槽 -->
      <slot name="icon" />

      <!-- 内容 -->
      <view class="li-content">
        <view v-if="title" class="li-title">{{ title }}</view>
        <view v-if="label" class="li-label">{{ label }}</view>
        <slot />
      </view>

      <!-- 右侧内容 -->
      <view class="li-right">
        <slot name="right" />
        <text v-if="value" class="li-value">{{ value }}</text>
        <text v-if="arrow" class="li-arrow">›</text>
      </view>
    </view>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseCard from '../../../containers/base-card/index.vue'

interface ListItemProps {
  /** 左侧图标地址（图片加载失败时自动隐藏） */
  icon?: string
  /** 标题 */
  title?: string
  /** 描述文字 */
  label?: string
  /** 右侧值 */
  value?: string
  /** 是否显示右侧箭头 */
  arrow?: boolean
  /** 禁用态：置灰且不触发 click */
  disabled?: boolean
}

const props = withDefaults(defineProps<ListItemProps>(), {
  icon: '',
  title: '',
  label: '',
  value: '',
  arrow: false,
  disabled: false,
})

const emit = defineEmits<{ click: [] }>()

const iconError = ref(false)

// 换图后重置错误态
watch(
  () => props.icon,
  () => {
    iconError.value = false
  },
)

function onIconError() {
  iconError.value = true
}

function onClick() {
  if (props.disabled) return
  emit('click')
}
</script>

<style scoped>
.li {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12rpx);
  width: 100%;
}

.is-disabled {
  opacity: 0.5;
}

.li-icon {
  width: var(--icon-md, 48rpx);
  height: var(--icon-md, 48rpx);
  flex-shrink: 0;
}

.li-icon-img {
  width: 100%;
  height: 100%;
}

.li-content {
  flex: 1;
  min-width: 0;
}

.li-title {
  font-size: var(--font-md, 28rpx);
  color: var(--text-primary, #171717);
}

.li-label {
  margin-top: var(--space-2, 8rpx);
  font-size: var(--font-sm, 26rpx);
  color: var(--text-secondary, #525252);
}

.li-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: var(--space-3, 12rpx);
}

.li-value {
  font-size: var(--font-sm, 26rpx);
  color: var(--text-secondary, #525252);
}

.li-arrow {
  margin-left: var(--space-2, 8rpx);
  font-size: var(--font-lg, 30rpx);
  color: var(--text-disabled, #d4d4d4);
}
</style>
