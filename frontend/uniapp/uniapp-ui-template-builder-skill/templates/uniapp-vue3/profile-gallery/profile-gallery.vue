<template>
  <view class="profile-shell" :data-theme="dark ? 'dark' : data.theme" :class="'scene-' + data.scenario">
    <BaseNavbar title="我的" :show-back="false" :status-bar-height="statusBarHeight" />
    <view class="profile-content">
      <BaseCard v-if="state === 'loading'" :padding="cardPadding">
        <view class="loading-lines" aria-busy="true"><view /><view /><view /><text>正在加载个人资料…</text></view>
      </BaseCard>
      <BaseCard v-else-if="state === 'error'" :padding="cardPadding">
        <Empty text="个人资料加载失败" description="请检查连接后重试" action-text="重试" @action-click="emit('retry')" />
      </BaseCard>
      <BaseCard v-else-if="state === 'guest'" :padding="cardPadding">
        <Empty text="登录后查看个人中心" description="登录状态由页面容器管理" action-text="模拟登录" @action-click="emit('login')" />
      </BaseCard>
      <template v-else>
        <BaseCard :padding="cardPadding" :background="heroBackground">
          <view class="identity-row">
            <BaseAvatar :src="data.avatar" :name="data.nickname" size="lg" @click="act('profile', '个人资料')" />
            <view class="identity-copy"><text class="nickname">{{ data.nickname }}</text><text class="subtitle">{{ data.subtitle }}</text></view>
            <BaseButton type="ghost" size="lg" text="编辑" @click="act('profile', '个人资料')" />
          </view>
          <view v-if="data.scenario === 'member'" class="membership">
            <view class="split"><text class="membership-name">{{ data.memberLevel }}</text><text class="caption">距下一等级还差 {{ Math.max(0, 3000 - data.points) }}</text></view>
            <text class="member-number">成长值 {{ data.points }}</text>
            <progress :percent="data.progress" :activeColor="progressColor" :backgroundColor="progressTrack" :stroke-width="4" />
          </view>
        </BaseCard>

        <BaseCard v-if="data.scenario === 'enterprise'" :padding="cardPadding">
          <view class="split"><view class="inline"><image class="icon" :src="icon('building')" mode="aspectFit" /><text class="section-label">{{ data.organization }}</text></view><BaseButton type="text" size="lg" text="切换企业" @click="act('organization', '切换企业')" /></view>
        </BaseCard>

        <BaseCard :padding="cardPadding">
          <view class="stats-row"><view v-for="item in data.stats" :key="item.id" class="stat-action" role="button" :tabindex="0" :aria-label="item.label" @keydown.enter="emit('action', item)" @tap="emit('action', item)"><text class="stat-value">{{ item.id === 'points' ? data.points : item.value }}</text><text class="caption">{{ item.label }}</text></view></view>
        </BaseCard>

        <BaseCard v-if="data.scenario === 'service'" title="我的预约" :padding="cardPadding">
          <view class="appointment"><image class="icon" :src="icon('calendar-days')" mode="aspectFit" /><view class="grow"><text class="section-label">{{ data.appointment }}</text><text class="caption">到店服务 · 提前 10 分钟到达</text></view></view>
          <template #footer><BaseButton type="ghost" size="lg" block text="查看预约详情" @click="act('appointment', '预约详情')" /></template>
        </BaseCard>

        <BaseCard v-if="data.scenario === 'commerce'" title="我的订单" :padding="cardPadding">
          <template #header-right><BaseButton type="text" size="lg" text="全部订单" @click="act('orders', '全部订单')" /></template>
          <view class="order-grid"><view v-for="item in data.orders" :key="item.id" class="grid-action" role="button" :tabindex="0" :aria-label="item.label" @keydown.enter="emit('action', item)" @tap="emit('action', item)"><view class="icon-badge"><image class="icon" :src="icon(item.icon)" mode="aspectFit" /><text v-if="item.badge" class="count-badge">{{ item.badge }}</text></view><text class="grid-label">{{ item.label }}</text></view></view>
          <template #footer><view class="split"><view class="grow"><text class="section-label">{{ data.orderTitle }}</text><text class="accent caption">{{ data.orderStatus }}</text></view><BaseButton type="ghost" size="lg" text="查看物流" @click="act('tracking', '物流进度')" /></view></template>
        </BaseCard>

        <BaseCard v-if="data.scenario === 'member'" title="每日签到" :padding="cardPadding">
          <template #header-right><BaseButton size="lg" :disabled="data.checkedIn || busy" :loading="busy" :text="data.checkedIn ? '今日已签到' : '立即签到'" @click="emit('checkin')" /></template>
          <view class="week-row"><view v-for="day in weekDays" :key="day.id" class="day-cell"><text class="caption">{{ day.label }}</text><image class="day-icon" :src="icon(day.id < 4 || (day.id === 4 && data.checkedIn) ? 'circle-check' : 'circle')" mode="aspectFit" /></view></view>
          <template #footer><text class="caption">连续签到领取积分 · 演示状态仅保存在本次页面</text></template>
        </BaseCard>

        <BaseCard v-if="data.tools.length" :title="toolsTitle" :padding="cardPadding">
          <view class="tool-grid" :class="{ 'tool-grid-three': data.scenario === 'enterprise' || data.scenario === 'member' }"><view v-for="item in data.tools" :key="item.id" class="grid-action" role="button" :tabindex="0" :aria-label="item.label" @keydown.enter="emit('action', item)" @tap="emit('action', item)"><image class="icon" :src="icon(item.icon)" mode="aspectFit" /><text class="grid-label">{{ item.label }}</text></view></view>
        </BaseCard>

        <BaseCard v-if="hasProducts" :title="data.scenario === 'member' ? '积分兑换' : '为你推荐'" :padding="cardPadding">
          <Empty v-if="state === 'empty' || !data.products.length" text="暂时没有商品" description="稍后再来看看" />
          <view v-else class="product-grid"><BaseCard v-for="item in data.products" :key="item.id" :padding="smallPadding" :background="productBackground" :border="true" clickable @click="emit('product', item)">
            <image v-if="item.image && !imageErrors[item.id]" class="product-image" :src="item.image" mode="aspectFill" @error="imageErrors[item.id] = true" /><view v-else class="product-placeholder"><image class="icon" :src="icon('package')" mode="aspectFit" /><text class="caption">图片暂不可用</text></view>
            <text class="product-name">{{ item.name }}</text><text class="product-price">{{ item.price }} <text class="caption">{{ item.unit }}</text></text>
          </BaseCard></view>
        </BaseCard>

        <BaseCard :padding="listPadding">
          <view v-for="item in data.menus" :key="item.id" class="menu-row" role="button" :tabindex="0" :aria-label="item.label" @keydown.enter="emit('action', item)" @tap="emit('action', item)"><image class="menu-icon" :src="icon(item.icon)" mode="aspectFit" /><text class="grow">{{ item.label }}</text><text class="chevron">›</text></view>
        </BaseCard>
        <text class="page-note">{{ data.scenario === 'simple' ? '简单一点，专注自己的生活' : '演示页面 · 业务数据与服务接口待接入' }}</text>
      </template>
      <BaseTabbar :items="tabs" :model-value="activeTab" max-width="560px" @change="tab => emit('tab', String(tab.key))">
        <template #item="{ item, active }"><image class="tab-icon" :src="active && item.activeIcon ? item.activeIcon : item.icon" mode="aspectFit" /><text class="tab-label" :class="{ 'tab-active': active }">{{ item.text }}</text></template>
      </BaseTabbar>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import BaseCard from '../../../../uniapp-base-skill/containers/base-card/index.vue'
import BaseAvatar from '../../../../uniapp-base-skill/containers/base-avatar/index.vue'
import BaseNavbar from '../../../../uniapp-base-skill/containers/base-navbar/index.vue'
import BaseTabbar from '../../../../uniapp-base-skill/containers/base-tabbar/index.vue'
import BaseButton from '../../../../uniapp-base-skill/components/form/base-button/index.vue'
import Empty from '../../../../uniapp-page-components-skill/components/empty/empty.vue'
import type { ProfileAction, ProfileData, ProfileProduct, PageState } from './types'
const props = withDefaults(defineProps<{ data: ProfileData; dark?: boolean; state?: PageState; busy?: boolean; activeTab?: string; statusBarHeight?: string; iconRoot?: string }>(), { dark: false, state: 'ready', busy: false, activeTab: 'profile', statusBarHeight: '0px', iconRoot: '/static/profile-icons' })
const emit = defineEmits<{ action: [item: ProfileAction]; product: [item: ProfileProduct]; checkin: []; retry: []; login: []; tab: [key: string] }>()
const cardPadding = 'var(--space-6, 24rpx)'
const smallPadding = 'var(--space-3, 12rpx)'
const listPadding = '0 var(--space-6, 24rpx)'
const productBackground = 'var(--bg-card, #ffffff)'
const heroBackground = computed(() => props.data.scenario === 'member' ? 'linear-gradient(135deg, var(--primary-950, #042f2e), var(--primary-800, #115e59))' : 'linear-gradient(135deg, var(--bg-card, #ffffff), var(--primary-50, #f0fdfa))')
const progressColor = 'var(--tertiary-300, #fcd34d)'
const progressTrack = 'var(--primary-800, #115e59)'
const toolsTitle = computed(() => props.data.scenario === 'enterprise' ? '我的工作' : props.data.scenario === 'member' ? '专属权益' : '常用服务')
const hasProducts = computed(() => props.data.scenario === 'commerce' || props.data.scenario === 'member')
const imageErrors = reactive<Record<string, boolean>>({})
watch(() => props.data.products, () => { Object.keys(imageErrors).forEach(key => delete imageErrors[key]) })
const weekDays = [{ id: 1, label: '周一' }, { id: 2, label: '周二' }, { id: 3, label: '周三' }, { id: 4, label: '周四' }, { id: 5, label: '周五' }, { id: 6, label: '周六' }, { id: 7, label: '周日' }]
function icon(name: string) { return `${props.iconRoot}/${props.dark ? 'dark/' : ''}${name}.png` }
function act(id: string, label: string) { emit('action', { id, label, icon: 'user' }) }
const tabs = computed(() => [{ key: 'home', text: '首页', icon: icon('house') }, { key: 'services', text: props.data.scenario === 'commerce' ? '商城' : '服务', icon: icon('layout-grid') }, { key: 'messages', text: '消息', icon: icon('bell') }, { key: 'profile', text: '我的', icon: icon('user'), activeIcon: icon('user-active') }])
</script>

<style scoped lang="scss">
.tab-icon { width: var(--icon-md, 48rpx); height: var(--icon-md, 48rpx); }
.tab-label { font-size: var(--font-2xs, 20rpx); margin-top: var(--space-1, 4rpx); color: var(--text-secondary, #525252); }
.tab-active { color: var(--primary-700, #0f766e); font-weight: 600; }
.profile-shell { min-height: 100vh; background: var(--bg-page, #fafafa); color: var(--text-primary, #171717); font-size: var(--font-md, 28rpx); }
.profile-content { box-sizing: border-box; width: 100%; max-width: 560px; margin: 0 auto; padding: var(--space-6, 24rpx); padding-left: max(var(--space-6, 24rpx), env(safe-area-inset-left)); padding-right: max(var(--space-6, 24rpx), env(safe-area-inset-right)); display: flex; flex-direction: column; gap: var(--space-6, 24rpx); }
.identity-row, .inline, .split, .appointment { display: flex; align-items: center; gap: var(--space-4, 16rpx); }
.split { justify-content: space-between; }
.identity-copy, .grow { flex: 1; min-width: 0; }
.nickname { display: block; font-size: var(--font-2xl, 40rpx); font-weight: 650; line-height: 1.4; overflow-wrap: anywhere; }
.subtitle { display: block; color: var(--text-secondary, #525252); font-size: var(--font-xs, 24rpx); margin-top: var(--space-2, 8rpx); line-height: 1.6; overflow-wrap: anywhere; }
.caption { color: var(--text-secondary, #525252); font-size: var(--font-xs, 24rpx); display: block; line-height: 1.6; }
.section-label { font-weight: 600; line-height: 1.6; overflow-wrap: anywhere; }
.stats-row { display: flex; }
.stat-action { flex: 1; min-width: 0; min-height: var(--height-btn-xl, 96rpx); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2, 8rpx); }
.stat-action + .stat-action { border-left: 1px solid var(--border-light, #f5f5f5); }
.stat-value { font-size: var(--font-2xl, 40rpx); font-weight: 650; }
.tool-grid, .order-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-2, 8rpx); }
.tool-grid-three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.order-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.grid-action { min-height: var(--height-avatar-lg, 120rpx); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-3, 12rpx); text-align: center; }
.icon { width: var(--icon-md, 48rpx); height: var(--icon-md, 48rpx); flex-shrink: 0; }
.grid-label { font-size: var(--font-xs, 24rpx); line-height: 1.6; }
.icon-badge { position: relative; }
.count-badge { position: absolute; top: 0; right: 0; transform: translate(50%, -50%); background: var(--color-error, #EF4444); color: var(--text-inverse, #ffffff); border-radius: var(--radius-full, 9999rpx); min-width: var(--icon-xs, 24rpx); text-align: center; font-size: var(--font-2xs, 20rpx); }
.menu-row { display: flex; align-items: center; gap: var(--space-4, 16rpx); min-height: var(--height-avatar-lg, 120rpx); }
.menu-row + .menu-row { border-top: 1px solid var(--border-light, #f5f5f5); }
.menu-icon { width: var(--icon-sm, 36rpx); height: var(--icon-sm, 36rpx); }
.chevron { color: var(--text-secondary, #525252); font-size: var(--font-xl, 32rpx); }
.appointment { padding: var(--space-4, 16rpx) 0; }
.membership { margin-top: var(--space-6, 24rpx); }
.membership-name { font-weight: 600; }
.member-number { display: block; font-size: var(--font-xl, 32rpx); margin: var(--space-4, 16rpx) 0; }
.scene-member .nickname, .scene-member .membership-name, .scene-member .member-number { color: var(--text-inverse, #ffffff); }
.scene-member .identity-copy .subtitle, .scene-member .membership .caption { color: var(--primary-100, #ccfbf1); }
.week-row { display: flex; gap: var(--space-2, 8rpx); padding: var(--space-4, 16rpx) 0; }
.day-cell { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-3, 12rpx); }
.day-icon { width: var(--icon-sm, 36rpx); height: var(--icon-sm, 36rpx); }
.product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4, 16rpx); }
.product-image, .product-placeholder { width: 100%; height: var(--height-avatar-xl, 160rpx); }
.product-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-light, #f5f5f5); }
.product-name { display: block; margin-top: var(--space-3, 12rpx); line-height: 1.6; font-size: var(--font-sm, 26rpx); }
.product-price { display: block; color: var(--error-dark, #dc2626); font-weight: 650; margin-top: var(--space-2, 8rpx); }
.product-price .caption { display: inline; }
.accent { color: var(--primary-700, #0f766e); }
.page-note { display: block; text-align: center; color: var(--text-secondary, #525252); font-size: var(--font-xs, 24rpx); padding: var(--space-6, 24rpx) 0; }
.loading-lines { display: flex; flex-direction: column; gap: var(--space-6, 24rpx); }
.loading-lines view { min-height: var(--height-btn-xl, 96rpx); background: var(--bg-light, #f5f5f5); }
@media (min-width: 768px) { .profile-content { padding: var(--space-8, 32rpx); } }
@media (prefers-reduced-motion: reduce) { .profile-shell :deep(*) { transition: none !important; animation: none !important; } }
</style>
