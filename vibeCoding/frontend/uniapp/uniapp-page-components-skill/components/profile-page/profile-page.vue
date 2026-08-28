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
            <base-avatar :src="userInfo.avatar" :nickname="userInfo.nickname || '我'" size="lg" />
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
                  :style="{ background: item.iconColor || 'var(--color-bg-tinted)', color: item.iconTextColor || 'var(--color-primary)' }"
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
  headerBackground: 'var(--color-primary)',
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
  background: var(--color-bg-page);
}

/* ---- 头区 ---- */
.profile-header {
  padding: var(--spacing-xl) var(--spacing-lg);
}

.profile-user {
  display: flex;
  align-items: center;
}

.profile-avatar {
  flex-shrink: 0;
  border-radius: var(--radius-avatar);
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
}

.profile-user-info {
  margin-left: var(--spacing-md);
}

.profile-user-name {
  font-size: var(--font-2xl);
  font-weight: 600;
  color: var(--white);
}

.profile-user-sub {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.85);
}

/* ---- 分组列表 ---- */
.profile-groups {
  margin-top: calc(-1 * var(--spacing-lg));
  padding: 0 var(--spacing-lg) var(--spacing-2xl);
}

.profile-group {
  margin-bottom: var(--spacing-md);
}

.profile-item {
  display: flex;
  align-items: center;
  min-height: var(--height-btn-xl);
  padding: var(--spacing-sm) 0;

  &.is-clickable:active {
    opacity: 0.7;
  }
}

.profile-item-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
  border-radius: var(--radius-sm);
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.profile-item-icon-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg);
  height: var(--icon-lg);
  border-radius: var(--radius-sm);
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.profile-item-icon-text-char {
  font-size: var(--font-md);
  font-weight: 600;
  color: inherit;
}

.profile-item-label {
  flex: 1;
  font-size: var(--font-md);
  color: var(--color-text-primary);
}

.profile-item-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.profile-item-value {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.profile-item-badge {
  min-width: var(--icon-sm);
  height: var(--icon-sm);
  padding: 0 var(--spacing-xs);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-error);
  margin-left: var(--spacing-sm);
}

.profile-item-badge-text {
  font-size: var(--font-xs);
  color: var(--white);
  line-height: 1;
}

.profile-item-arrow {
  margin-left: var(--spacing-sm);
  font-size: var(--font-lg);
  color: var(--color-text-tertiary);
  line-height: 1;
}
</style>
