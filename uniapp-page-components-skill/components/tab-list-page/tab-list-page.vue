<!--
  TabListPage Tab + 列表组件化页面
  ============================================================
  适用：我的订单（全部/待付款/已发货/已完成）、消息中心、商品列表、任意 Tab 分组的卡片列表页。
  结构：顶部 Tab 栏（吸顶） + 滚动列表（每项自动包一层 BaseCard）
  自由化：
    - item slot 拿到 { item, index }，自行决定卡片内部内容；
    - cardProps 透传 BaseCard 入参（radius / padding / margin / border / shadow...）；
    - empty / header / tab / footer 均有 slot。
-->
<template>
  <view class="tlp">
    <slot name="header" />

    <view v-if="tabs.length" class="tlp-tabs" :class="{ 'is-sticky': tabFixed }">
      <slot name="tab" :tabs="tabs" :active="modelValue">
        <view class="tlp-tabs-inner">
          <view
            v-for="tab in tabs"
            :key="tabKey(tab)"
            class="tlp-tab"
            :class="{ 'is-active': tab.value === modelValue }"
            @click="onTabChange(tab)"
          >
            <text class="tlp-tab-label">{{ tab.label }}</text>
            <view v-if="tab.badge" class="tlp-tab-badge">
              <text class="tlp-tab-badge-text">{{ tab.badge }}</text>
            </view>
          </view>
        </view>
      </slot>
    </view>

    <scroll-view
      class="tlp-list"
      scroll-y
      :scroll-with-animation="true"
      :scroll-anchoring="true"
      @scrolltolower="onLoadMore"
    >
      <view class="tlp-list-inner">
        <template v-if="list.length">
          <view v-for="(item, index) in list" :key="itemKey(item, index)" class="tlp-item">
            <base-card v-bind="cardProps" :clickable="true" @click="$emit('itemClick', item, index)">
              <slot name="item" :item="item" :index="index" />
            </base-card>
          </view>

          <view v-if="loading" class="tlp-tip">
            <text class="tlp-tip-text">加载中...</text>
          </view>
          <view v-else-if="finished && list.length" class="tlp-tip">
            <text class="tlp-tip-text">没有更多了</text>
          </view>
        </template>

        <slot v-else name="empty">
          <view class="tlp-empty">
            <text class="tlp-empty-text">暂无数据</text>
          </view>
        </slot>
      </view>
    </scroll-view>

    <slot name="footer" />
  </view>
</template>

<script setup lang="ts">
interface TabItem {
  label: string
  value: string | number
  /** 角标数字 */
  badge?: number
}

interface Props {
  /** Tab 集合 */
  tabs?: TabItem[]
  /** 当前激活 Tab 的 value（v-model） */
  modelValue?: string | number
  /** 列表数据 */
  list?: any[]
  /** 是否吸顶 */
  tabFixed?: boolean
  /** 透传给内部 BaseCard 的入参（radius/padding/margin/border/shadow/gap...） */
  cardProps?: Record<string, unknown>
  /** 是否加载中（底部显示"加载中..."） */
  loading?: boolean
  /** 是否已全部加载完 */
  finished?: boolean
  /** 列表项 key 取值字段 */
  itemKeyField?: string
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [
    { label: '全部', value: '' },
    { label: '进行中', value: 'active' },
    { label: '已完成', value: 'done' },
  ],
  modelValue: '',
  list: () => [],
  tabFixed: true,
  cardProps: () => ({}),
  loading: false,
  finished: false,
  itemKeyField: 'id',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [tab: TabItem]
  itemClick: [item: any, index: number]
  loadMore: []
}>()

let lastKey = ''

function tabKey(tab: TabItem) {
  return String(tab.value)
}

function itemKey(item: any, index: number) {
  return item && item[props.itemKeyField] != null ? item[props.itemKeyField] : index
}

function onTabChange(tab: TabItem) {
  if (tab.value === props.modelValue) return
  emit('update:modelValue', tab.value)
  emit('change', tab)
}

function onLoadMore() {
  const key = `${props.modelValue}:${props.list.length}`
  if (key === lastKey) return
  lastKey = key
  emit('loadMore')
}
</script>

<style lang="scss" scoped>
.tlp {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-page);
}

.tlp-tabs {
  flex-shrink: 0;
  background: var(--color-bg-surface);

  &.is-sticky {
    position: sticky;
    top: 0;
    z-index: 200;
  }
}

.tlp-tabs-inner {
  display: flex;
  height: var(--height-btn-lg);
  align-items: center;
  padding: 0 var(--spacing-lg);
  border-bottom: 1rpx solid var(--color-border-light);
}

.tlp-tab {
  margin-right: var(--spacing-lg);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  height: 100%;
}

.tlp-tab-label {
  font-size: var(--font-lg);
  color: var(--color-text-secondary);
}

.tlp-tab.is-active .tlp-tab-label {
  color: var(--color-primary);
  font-weight: 600;
}

.tlp-tab.is-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: var(--color-primary);
  transform: translateX(-50%);
}

.tlp-tab-badge {
  position: absolute;
  top: 8rpx;
  right: -12rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: var(--color-error);
}

.tlp-tab-badge-text {
  font-size: var(--font-xs);
  color: var(--white);
  line-height: 1;
}

.tlp-list {
  flex: 1;
  min-height: 0;
}

.tlp-list-inner {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-2xl);
  box-sizing: border-box;
}

.tlp-item {
  margin-bottom: var(--spacing-md);
}

.tlp-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.tlp-tip-text {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.tlp-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) 0;
}

.tlp-empty-text {
  font-size: var(--font-md);
  color: var(--color-text-tertiary);
}

.tlp-tab:last-child {
  margin-right: 0;
}
</style>
