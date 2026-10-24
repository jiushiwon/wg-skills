<!--
  ProfilePage 我的 / 设置 / 通知 / 购物车 组件化页面
  ============================================================
  结构：顶部用户信息头 + 分组列表（每组一个 BaseCard，每行 = 图标 + 标签 + 右侧 value/badge + 箭头）
  通用性：
    - 右侧箭头可整体关闭（itemArrow=false），换"图片左置"即变成购物车列表（item.icon 传图片 URL）；
    - groups 结构驱动，设置 / 通知 / 收藏 / 地址等页通用；
    - header / group / item 均有 slot，可整体替换。
-->
<template>
  <view class="profile">
    <view class="profile-header" :style="{ background: headerBackground }">
      <slot name="header">
        <view class="profile-user" @click="$emit('headerClick')">
          <view class="profile-avatar">
            <base-avatar :src="userInfo.avatar" :name="userInfo.nickname || '我'" size="lg" />
          </view>
          <view class="profile-user-info">
            <text class="profile-user-name">{{ userInfo.nickname || '未登录' }}</text>
            <text v-if="userInfo.subtitle" class="profile-user-sub">{{ userInfo.subtitle }}</text>
          </view>
        </view>
      </slot>
    </view>

    <view class="profile-groups">
      <view v-for="group in groups" :key="group.id" class="profile-group">
        <slot name="group" :group="group">
          <base-card v-bind="cardProps">
            <view
              v-for="item in group.items"
              :key="item.id"
              class="profile-item"
              :class="{ 'is-clickable': itemClickable }"
              @click="$emit('itemClick', item, group)"
            >
              <slot name="item" :item="item" :group="group">
                <image
                  v-if="item.icon && !itemIconErrors.has(item.id)"
                  class="profile-item-icon"
                  :src="item.icon"
                  mode="aspectFill"
                  @error="onItemIconError(item)"
                />
                <view
                  v-else-if="item.icon || item.iconText"
                  class="profile-item-icon-text"
                  :style="{ background: item.iconColor || 'var(--bg-light, #f5f5f5)', color: item.iconTextColor || 'var(--color-primary, #14b8a6)' }"
                >
                  <text class="profile-item-icon-text-char">{{ (item.iconText || item.label).slice(0, 1) }}</text>
                </view>

                <text class="profile-item-label">{{ item.label }}</text>

                <view class="profile-item-right">
                  <text v-if="item.value" class="profile-item-value">{{ item.value }}</text>
                  <view v-if="item.badge" class="profile-item-badge">
                    <text class="profile-item-badge-text">{{ item.badge }}</text>
                  </view>
                  <text v-if="itemArrow && item.arrow !== false" class="profile-item-arrow">›</text>
                </view>
              </slot>
            </view>
          </base-card>
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface UserInfo {
  avatar?: string
  nickname?: string
  subtitle?: string
}

interface ProfileItem {
  id: string | number
  label: string
  /** 左侧图标/图片 URL（传图即购物车风格） */
  icon?: string
  /** 左侧文字图标（首字 + 背景块） */
  iconText?: string
  iconColor?: string
  iconTextColor?: string
  /** 右侧文字 */
  value?: string
  /** 右侧角标 */
  badge?: string | number
  /** 是否显示右侧箭头（默认跟随 itemArrow） */
  arrow?: boolean
}

interface ProfileGroup {
  id: string | number
  items: ProfileItem[]
}

interface Props {
  /** 用户信息（header slot 默认展示） */
  userInfo?: UserInfo
  /** 头区背景，默认主题色 */
  headerBackground?: string
  /** 分组列表 */
  groups?: ProfileGroup[]
  /** 是否显示右侧箭头 */
  itemArrow?: boolean
  /** 列表行是否可点击 */
  itemClickable?: boolean
  /** 透传给内部 BaseCard 的入参 */
  cardProps?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  userInfo: () => ({}),
  headerBackground: 'var(--color-primary, #14b8a6)',
  groups: () => [
    {
      id: 'g1',
      items: [
        { id: 'order', label: '我的订单' },
        { id: 'address', label: '收货地址' },
        { id: 'favorites', label: '我的收藏' },
      ],
    },
    {
      id: 'g2',
      items: [
        { id: 'coupon', label: '优惠券', value: '3' },
        { id: 'setting', label: '设置' },
      ],
    },
  ],
  itemArrow: true,
  itemClickable: true,
  cardProps: () => ({}),
})

const emit = defineEmits<{
  headerClick: []
  itemClick: [item: ProfileItem, group: ProfileGroup]
}>()

const itemIconErrors = reactive(new Set<string | number>())

function onItemIconError(item: ProfileItem) {
  itemIconErrors.add(item.id)
}
</script>

<style lang="scss" scoped>
.profile {
  min-height: 100%;
  background: var(--bg-page, #fafafa);
}

/* ---- 头区 ---- */
.profile-header {
  padding: var(--space-12, 48rpx) var(--space-8, 32rpx);
}

.profile-user {
  display: flex;
  align-items: center;
}

.profile-avatar {
  flex-shrink: 0;
  border-radius: var(--radius-avatar, 9999rpx);
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
}

.profile-user-info {
  margin-left: var(--space-6, 24rpx);
}

.profile-user-name {
  font-size: var(--font-2xl, 40rpx);
  font-weight: 600;
  color: var(--text-inverse, #ffffff);
}

.profile-user-sub {
  display: block;
  margin-top: var(--space-2, 8rpx);
  font-size: var(--font-sm, 26rpx);
  color: rgba(255, 255, 255, 0.85);
}

/* ---- 分组列表 ---- */
.profile-groups {
  margin-top: calc(-1 * var(--space-8, 32rpx));
  padding: 0 var(--space-8, 32rpx) var(--space-16, 64rpx);
}

.profile-group {
  margin-bottom: var(--space-6, 24rpx);
}

.profile-item {
  display: flex;
  align-items: center;
  min-height: var(--height-btn-xl, 96rpx);
  padding: var(--space-4, 16rpx) 0;

  &.is-clickable:active {
    opacity: 0.7;
  }
}

.profile-item-icon {
  width: var(--icon-lg, 72rpx);
  height: var(--icon-lg, 72rpx);
  border-radius: var(--radius-sm, 8rpx);
  margin-right: var(--space-6, 24rpx);
  flex-shrink: 0;
}

.profile-item-icon-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg, 72rpx);
  height: var(--icon-lg, 72rpx);
  border-radius: var(--radius-sm, 8rpx);
  margin-right: var(--space-6, 24rpx);
  flex-shrink: 0;
}

.profile-item-icon-text-char {
  font-size: var(--font-md, 28rpx);
  font-weight: 600;
  color: inherit;
}

.profile-item-label {
  flex: 1;
  font-size: var(--font-md, 28rpx);
  color: var(--text-primary, #171717);
}

.profile-item-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.profile-item-value {
  font-size: var(--font-sm, 26rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.profile-item-badge {
  min-width: var(--icon-sm, 36rpx);
  height: var(--icon-sm, 36rpx);
  padding: 0 var(--space-2, 8rpx);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-error, #EF4444);
  margin-left: var(--space-4, 16rpx);
}

.profile-item-badge-text {
  font-size: var(--font-xs, 24rpx);
  color: var(--text-inverse, #ffffff);
  line-height: 1;
}

.profile-item-arrow {
  margin-left: var(--space-4, 16rpx);
  font-size: var(--font-lg, 30rpx);
  color: var(--text-tertiary, #a3a3a3);
  line-height: 1;
}
</style>
