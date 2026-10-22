<template>
  <view class="breadcrumb">
    <view v-for="(item, index) in items" :key="index" class="breadcrumb__item">
      <view
        :class="[
          'breadcrumb__link',
          {
            'breadcrumb__link--clickable': isClickable(index),
            'breadcrumb__link--current': isLast(index),
          },
        ]"
        @click="handleClick(item, index)"
      >
        <image v-if="item.icon" class="breadcrumb__icon" :src="item.icon" mode="aspectFit" />
        <text class="breadcrumb__text">{{ item.text }}</text>
      </view>
      <view v-if="!isLast(index)" class="breadcrumb__separator">
        <text class="breadcrumb__separator-text">{{ separator }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  /** 标题文案 */
  text?: string
  /** 图标地址（可选） */
  icon?: string
  /** 跳转地址，最后一项（当前页）不可点击 */
  url?: string
}

interface BreadcrumbProps {
  /** 路径项列表，最后一项为当前页 */
  items?: BreadcrumbItem[]
  /** 分隔符 */
  separator?: string
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  items: () => [],
  separator: '›',
})

const emit = defineEmits<{
  /** 点击可点击项时触发，参数为该项与其下标 */
  click: [item: BreadcrumbItem, index: number]
}>()

/** 是否为最后一项（当前页，不可点击） */
function isLast(index: number): boolean {
  return index === props.items.length - 1
}

/** 是否可点击：非当前页且带跳转地址 */
function isClickable(index: number): boolean {
  return !isLast(index) && !!props.items[index]?.url
}

function handleClick(item: BreadcrumbItem, index: number) {
  if (!isClickable(index)) return
  emit('click', item, index)
}
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: var(--space-3, 12rpx) var(--space-4, 16rpx);
  font-size: var(--font-sm, 26rpx);
  line-height: 1.5;
}

.breadcrumb__item {
  display: flex;
  align-items: center;
}

.breadcrumb__link {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8rpx);
  color: var(--text-secondary, #525252);
}

.breadcrumb__link--clickable {
  color: var(--color-primary, #14b8a6);
}

.breadcrumb__link--current {
  color: var(--text-primary, #171717);
  font-weight: 600;
}

.breadcrumb__icon {
  width: var(--icon-xs, 24rpx);
  height: var(--icon-xs, 24rpx);
  flex-shrink: 0;
}

.breadcrumb__text {
  font-size: var(--font-sm, 26rpx);
}

.breadcrumb__separator {
  margin: 0 var(--space-2, 8rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.breadcrumb__separator-text {
  font-size: var(--font-sm, 26rpx);
}
</style>
