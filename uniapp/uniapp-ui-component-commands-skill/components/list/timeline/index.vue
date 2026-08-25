<template>
  <view class="timeline">
    <view
      v-for="(item, index) in items"
      :key="index"
      class="timeline__item"
    >
      <!-- 节点 -->
      <view class="timeline__node">
        <view :class="['timeline__dot', { 'timeline__dot--active': index === 0 || item.active }]" />
      </view>

      <!-- 内容 -->
      <view class="timeline__content">
        <view v-if="item.time" class="timeline__time">{{ item.time }}</view>
        <view v-if="item.title" class="timeline__title">{{ item.title }}</view>
        <view v-if="item.desc" class="timeline__desc">{{ item.desc }}</view>
        <slot :item="item" :index="index"></slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.timeline {
  padding: 16px;

  &__item {
    position: relative;
    padding-bottom: 24px;
    padding-left: 24px;

    &:last-child {
      padding-bottom: 0;

      .timeline__node::after {
        display: none;
      }
    }
  }

  &__node {
    position: absolute;
    left: 0;
    top: 0;

    &::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 12px;
      width: 1px;
      height: calc(100% - 4px);
      background: #e0e0e0;
    }
  }

  &__dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #e0e0e0;

    &--active {
      background: var(--primary, #007AFF);
    }
  }

  &__time {
    font-size: 12px;
    color: var(--text-secondary, #6C6C70);
    margin-bottom: 4px;
  }

  &__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary, #1C1C1E);
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 14px;
    color: var(--text-secondary, #6C6C70);
    line-height: 1.5;
  }
}
</style>
