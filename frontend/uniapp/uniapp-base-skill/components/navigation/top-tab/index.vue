<template>
  <view class="top-tab">
    <scroll-view
      class="top-tab__scroll"
      :scroll-x="scroll"
      :scroll-with-animation="true"
      :scroll-into-view="activeAnchor"
    >
      <view class="top-tab__wrap">
        <view
          v-for="(item, index) in items"
          :id="anchorId(index)"
          :key="item.key"
          class="top-tab__item"
          :class="{ 'top-tab__item--active': item.key === modelValue }"
          @click="handleClick(item, index)"
        >
          <view class="top-tab__main">
            <text
              class="top-tab__text"
              :style="{ color: item.key === modelValue ? activeColor : inactiveColor }"
            >
              {{ item.text }}
            </text>
            <text v-if="badgeText(item)" class="top-tab__badge">{{ badgeText(item) }}</text>
          </view>
          <view class="top-tab__indicator" :style="{ background: activeColor }" />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TopTabItem {
  /** 唯一标识，配合 modelValue 使用 */
  key: string
  /** 展示文案 */
  text: string
  /** 角标内容（数字或文本，为空不展示） */
  badge?: number | string
}

interface TopTabProps {
  /** 页签列表 */
  items?: TopTabItem[]
  /** 当前选中项的 key */
  modelValue?: string
  /** 选中态颜色 */
  activeColor?: string
  /** 未选中态颜色 */
  inactiveColor?: string
  /** 超出宽度时是否横向滚动 */
  scroll?: boolean
}

const props = withDefaults(defineProps<TopTabProps>(), {
  items: () => [],
  modelValue: '',
  activeColor: 'var(--color-primary, #14b8a6)',
  inactiveColor: 'var(--text-secondary, #525252)',
  scroll: true,
})

const emit = defineEmits<{
  /** 选中项变化，参数为 key 与下标 */
  'update:modelValue': [key: string]
  change: [key: string, index: number]
}>()

const activeIndex = computed(() => props.items.findIndex((item) => item.key === props.modelValue))

/** 当前选中项的锚点，用于横向滚动定位（scroll-into-view 只接受 id，无像素尺寸） */
const activeAnchor = computed(() =>
  activeIndex.value >= 0 ? anchorId(activeIndex.value) : '',
)

function anchorId(index: number): string {
  return `top-tab-item-${index}`
}

/** 角标文案，数字超过 99 显示 99+ */
function badgeText(item: TopTabItem): string {
  if (item.badge === undefined || item.badge === null || item.badge === '') return ''
  if (typeof item.badge === 'number') return item.badge > 99 ? '99+' : String(item.badge)
  return String(item.badge)
}

function handleClick(item: TopTabItem, index: number) {
  if (item.key === props.modelValue) return
  emit('update:modelValue', item.key)
  emit('change', item.key, index)
}
</script>

<style scoped>
.top-tab {
  background: var(--bg-card, #ffffff);
  border-bottom: 1rpx solid var(--border-light, #f5f5f5);
}

.top-tab__scroll {
  white-space: nowrap;
}

.top-tab__wrap {
  display: inline-flex;
  padding: 0 var(--space-4, 16rpx);
}

.top-tab__item {
  position: relative;
  padding: var(--space-3, 12rpx) var(--space-4, 16rpx);
}

.top-tab__main {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8rpx);
}

.top-tab__text {
  font-size: var(--font-md, 28rpx);
  transition: color var(--transition-fast, 150ms ease);
}

.top-tab__badge {
  min-width: var(--space-6, 24rpx);
  padding: 0 var(--space-2, 8rpx);
  height: var(--space-6, 24rpx);
  line-height: var(--space-6, 24rpx);
  text-align: center;
  border-radius: var(--radius-full, 9999rpx);
  background: var(--color-error, #EF4444);
  color: var(--text-inverse, #ffffff);
  font-size: var(--font-2xs, 20rpx);
}

/* 底部指示条：仅用 transform/opacity 做动画，不触碰 width/left 等重排属性 */
.top-tab__indicator {
  position: absolute;
  left: var(--space-4, 16rpx);
  right: var(--space-4, 16rpx);
  bottom: 0;
  height: var(--space-1, 4rpx);
  border-radius: var(--radius-full, 9999rpx);
  background: var(--color-primary, #14b8a6);
  transform: scaleX(0);
  transform-origin: center center;
  opacity: 0;
  transition:
    transform var(--transition-normal, 200ms ease),
    opacity var(--transition-normal, 200ms ease);
}

.top-tab__item--active .top-tab__indicator {
  transform: scaleX(1);
  opacity: 1;
}
</style>
