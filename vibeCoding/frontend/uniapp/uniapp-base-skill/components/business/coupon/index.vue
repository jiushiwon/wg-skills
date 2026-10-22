<!--
  Coupon 优惠券卡面
  ============================================================
  外壳使用根容器 BaseCard（圆角/背景/阴影由容器提供），本组件只负责卡面内容排布。
  主题变量真源：uniapp-theme-skill/templates/src/static/css/base.css
-->
<template>
  <BaseCard
    class="coupon"
    :class="{ 'coupon--inactive': inactive }"
    :padding="0"
    :radius="'var(--radius-card, 24rpx)'"
    :background="cardBackground"
    :clickable="!inactive"
    @click="onClick"
  >
    <view class="coupon__inner">
      <!-- 左侧金额 -->
      <view class="coupon__left">
        <view class="coupon__amount">
          <text v-if="type !== 'discount'" class="coupon__symbol">{{ currency }}</text>
          <text class="coupon__value">{{ value }}</text>
          <text v-if="type === 'discount'" class="coupon__unit">折</text>
        </view>
        <text v-if="condition" class="coupon__condition">{{ condition }}</text>
      </view>

      <!-- 右侧信息 -->
      <view class="coupon__right">
        <text class="coupon__title">{{ title }}</text>
        <text v-if="desc" class="coupon__desc">{{ desc }}</text>
        <view class="coupon__footer">
          <text v-if="date" class="coupon__date">{{ date }}</text>
          <text v-if="showReceive" class="coupon__receive">{{ receiveText }}</text>
        </view>
      </view>
    </view>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '../../containers/base-card/index.vue'

interface CouponProps {
  /** 券类型：money 金额券 / discount 折扣券 */
  type?: 'money' | 'discount'
  /** 优惠值 */
  value?: string | number
  /** 使用条件 */
  condition?: string
  /** 标题 */
  title?: string
  /** 描述 */
  desc?: string
  /** 有效期 */
  date?: string
  /** 状态 */
  status?: 'unused' | 'used' | 'expired'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示领取文案 */
  showReceive?: boolean
  /** 是否已领取 */
  received?: boolean
  /** 货币符号 */
  currency?: string
}

const props = withDefaults(defineProps<CouponProps>(), {
  type: 'money',
  value: 0,
  condition: '',
  title: '',
  desc: '',
  date: '',
  status: 'unused',
  disabled: false,
  showReceive: false,
  received: false,
  currency: '¥',
})

const emit = defineEmits<{ click: [] }>()

/** 已使用 / 已过期 / 禁用  置灰且不可点击 */
const inactive = computed(() => props.disabled || props.status !== 'unused')

const cardBackground = computed(() =>
  inactive.value
    ? 'var(--bg-light, #f5f5f5)'
    : 'linear-gradient(135deg, var(--color-primary, #14b8a6), var(--color-secondary, #6366f1))',
)

const receiveText = computed(() => {
  if (props.status === 'used') return '已使用'
  if (props.status === 'expired') return '已过期'
  return props.received ? '已领取' : '立即领取'
})

function onClick() {
  if (inactive.value) return
  emit('click')
}
</script>

<style lang="scss" scoped>
.coupon__inner {
  display: flex;
  width: 100%;
}

.coupon__left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: var(--space-24, 96rpx);
  padding: var(--space-4, 16rpx) var(--space-2, 8rpx);
  color: var(--text-inverse, #ffffff);
  border-right: 1rpx dashed currentColor;
}

.coupon__amount {
  display: flex;
  align-items: baseline;
}

.coupon__symbol {
  font-size: var(--font-sm, 26rpx);
}

.coupon__value {
  font-size: var(--font-xl, 32rpx);
  font-weight: 700;
}

.coupon__unit {
  margin-left: var(--space-1, 4rpx);
  font-size: var(--font-sm, 26rpx);
}

.coupon__condition {
  margin-top: var(--space-1, 4rpx);
  font-size: var(--font-2xs, 20rpx);
  opacity: 0.8;
}

.coupon__right {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-3, 12rpx) var(--space-4, 16rpx);
  color: var(--text-inverse, #ffffff);
}

.coupon__title {
  font-size: var(--font-md, 28rpx);
  font-weight: 600;
}

.coupon__desc {
  margin-top: var(--space-1, 4rpx);
  font-size: var(--font-xs, 24rpx);
  opacity: 0.8;
}

.coupon__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-2, 8rpx);
}

.coupon__date {
  font-size: var(--font-2xs, 20rpx);
  opacity: 0.7;
}

.coupon__receive {
  font-size: var(--font-xs, 24rpx);
  font-weight: 500;
}

/* 置灰态：文字转灰 */
.coupon--inactive .coupon__left,
.coupon--inactive .coupon__right {
  color: var(--text-tertiary, #a3a3a3);
}
</style>
