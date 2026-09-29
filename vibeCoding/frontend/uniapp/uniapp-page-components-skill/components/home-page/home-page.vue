<!--
  HomePage 首页/商城组件化页面
  ============================================================
  结构：导航栏 + 可滚动区（各区块 slot 自由堆叠）+ 可选底部 tabbar
  区块 slot：search（搜索条）/ banner（轮播）/ category（金刚区）/
            grid（宫格）/ sections（任意卡片区）/ list（列表流）
  特性：
    - 下拉刷新（refresher 事件） + 滚动到底 loadMore；
    - 底部 base-tabbar 可复用于页面内切换视图，或作为自定义 tabBar 骨架；
    - 空内容自动显示 empty（可 slot 替换）。
-->
<template>
  <view class="home-page">
    <slot name="navbar">
      <base-navbar v-if="showNavbar" :title="navbarTitle" :show-back="false" :fixed="true" :placeholder="true" />
    </slot>

    <scroll-view
      class="hp-body"
      scroll-y
      :refresher-enabled="enablePullRefresh"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view class="hp-body-inner">
        <slot name="search" />
        <slot name="banner" />
        <slot name="category" />
        <slot name="grid" />
        <slot name="sections" />

        <view class="hp-list">
          <slot name="list">
            <view v-if="!list.length" class="hp-empty">
              <slot name="empty">
                <text class="hp-empty-text">暂无内容</text>
              </slot>
            </view>
            <view v-else>
              <slot name="listItem" :list="list" />
            </view>
          </slot>
        </view>

        <view v-if="list.length && loading" class="hp-tip">
          <text class="hp-tip-text">加载中...</text>
        </view>
        <view v-else-if="list.length && finished" class="hp-tip">
          <text class="hp-tip-text">没有更多了</text>
        </view>
      </view>
    </scroll-view>

    <base-tabbar
      v-if="tabbarItems.length"
      :model-value="activeTab"
      :items="tabbarItems"
      :fixed="true"
      :safe-area="true"
      @update:model-value="$emit('update:activeTab', $event)"
      @change="$emit('tabChange', $event)"
    />
  </view>
</template>

<script setup lang="ts">
interface TabbarItem {
  key: string | number
  text: string
  icon?: string
  activeIcon?: string
  badge?: string | number
}

interface Props {
  /** 导航栏标题 */
  navbarTitle?: string
  /** 是否显示默认导航栏 */
  showNavbar?: boolean
  /** 底部菜单项（空则不显示） */
  tabbarItems?: TabbarItem[]
  /** 底部菜单激活 key（v-model） */
  activeTab?: string | number
  /** 列表数据（默认 list 区渲染用，通常走 #list slot） */
  list?: any[]
  /** 加载中（底部提示） */
  loading?: boolean
  /** 是否已全部加载 */
  finished?: boolean
  /** 是否启用下拉刷新 */
  enablePullRefresh?: boolean
  /** 下拉刷新中 */
  refreshing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  navbarTitle: '首页',
  showNavbar: true,
  tabbarItems: () => [],
  activeTab: 'home',
  list: () => [],
  loading: false,
  finished: false,
  enablePullRefresh: true,
  refreshing: false,
})

const emit = defineEmits<{
  'update:activeTab': [value: string | number]
  tabChange: [item: TabbarItem]
  refresh: []
  loadMore: []
}>()

function onRefresh() {
  emit('refresh')
}

function onLoadMore() {
  emit('loadMore')
}
</script>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-page);
}

.hp-body {
  flex: 1;
  min-height: 0;
}

.hp-body-inner {
  padding-bottom: var(--spacing-2xl);
}

.hp-list {
  padding: 0 var(--spacing-lg);
}

.hp-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) 0;
}

.hp-empty-text {
  font-size: var(--font-md);
  color: var(--color-text-tertiary);
}

.hp-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.hp-tip-text {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}
</style>
