<!--
  Timeline 时间线
  ============================================================
  整条时间线由根容器 BaseCard 承载，节点与连线在卡片内部实现。
-->
<template>
  <BaseCard class="tl-card" :padding="'var(--space-5, 20rpx)'">
    <view class="tl">
      <view v-for="(item, index) in items" :key="index" class="tl-item">
        <!-- 节点与连线 -->
        <view class="tl-node">
          <view class="tl-dot" :class="{ 'is-active': isActive(item, index) }" />
          <view v-if="index < items.length - 1" class="tl-line" />
        </view>

        <!-- 内容 -->
        <view class="tl-content">
          <view v-if="item.time" class="tl-time">{{ item.time }}</view>
          <view v-if="item.title" class="tl-title">{{ item.title }}</view>
          <view v-if="item.desc" class="tl-desc">{{ item.desc }}</view>
          <slot :item="item" :index="index" />
        </view>
      </view>
    </view>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '../../../containers/base-card/index.vue'

/** 时间线节点数据 */
interface TimelineItem {
  /** 时间文本 */
  time?: string
  /** 标题 */
  title?: string
  /** 描述 */
  desc?: string
  /** 是否为当前节点 */
  active?: boolean
}

interface TimelineProps {
  /** 时间线节点列表 */
  items?: TimelineItem[]
}

withDefaults(defineProps<TimelineProps>(), {
  items: () => [],
})

// 首项默认高亮，其余按 active 标记
function isActive(item: TimelineItem, index: number): boolean {
  return index === 0 || item.active === true
}
</script>

<style scoped>
.tl {
  width: 100%;
}

.tl-item {
  display: flex;
  align-items: stretch;
  gap: var(--space-4, 16rpx);
}

.tl-node {
  width: var(--icon-sm, 36rpx);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tl-dot {
  width: 20rpx;
  height: 20rpx;
  margin-top: var(--space-2, 8rpx);
  border-radius: var(--radius-full, 9999rpx);
  background: var(--border, #e5e5e5);
}

.tl-dot.is-active {
  background: var(--color-primary, #14b8a6);
}

.tl-line {
  flex: 1;
  width: 2rpx;
  margin: var(--space-2, 8rpx) 0;
  background: var(--border, #e5e5e5);
}

.tl-content {
  flex: 1;
  min-width: 0;
  padding-bottom: var(--space-6, 24rpx);
}

.tl-item:last-child .tl-content {
  padding-bottom: 0;
}

.tl-time {
  margin-bottom: var(--space-2, 8rpx);
  font-size: var(--font-xs, 24rpx);
  color: var(--text-secondary, #525252);
}

.tl-title {
  margin-bottom: var(--space-2, 8rpx);
  font-size: var(--font-md, 28rpx);
  font-weight: 600;
  color: var(--text-primary, #171717);
}

.tl-desc {
  font-size: var(--font-sm, 26rpx);
  line-height: 1.5;
  color: var(--text-secondary, #525252);
}
</style>
