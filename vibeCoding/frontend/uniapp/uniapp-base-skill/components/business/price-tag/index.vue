<!--
  PriceTag 价格展示
  ============================================================
  展示价格（可选货币符号、划线原价），字号走主题变量。
  主题变量真源：uniapp-theme-skill/templates/src/static/css/base.css
-->
<template>
  <view class="price-tag">
    <text v-if="symbol" :class="['price-tag__symbol', `price-tag__symbol--${size}`]">{{ currency }}</text>
    <text :class="['price-tag__value', `price-tag__value--${size}`]">{{ showPrice }}</text>
    <text v-if="originalPrice" :class="['price-tag__original', `price-tag__original--${size}`]">
      {{ currency }}{{ originalPrice }}
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PriceTagProps {
  /** 价格 */
  price?: string | number
  /** 原价（划线显示） */
  originalPrice?: string | number
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 货币符号 */
  currency?: string
  /** 是否显示货币符号 */
  symbol?: boolean
  /** 数字价格是否保留两位小数 */
  decimal?: boolean
}

const props = withDefaults(defineProps<PriceTagProps>(), {
  price: '0.00',
  originalPrice: '',
  size: 'medium',
  currency: '¥',
  symbol: true,
  decimal: true,
})

const showPrice = computed(() => {
  const p = props.price
  if (typeof p === 'number') return p.toFixed(props.decimal ? 2 : 0)
  return p
})
</script>

<style lang="scss" scoped>
.price-tag {
  display: inline-flex;
  align-items: baseline;
}

.price-tag__symbol {
  color: var(--color-error, #EF4444);
}

.price-tag__value {
  color: var(--color-error, #EF4444);
  font-weight: 600;
}

.price-tag__original {
  margin-left: var(--space-3, 12rpx);
  color: var(--text-tertiary, #a3a3a3);
  text-decoration: line-through;
}

/* ---- 尺寸 ---- */
.price-tag__symbol--small {
  font-size: var(--font-xs, 24rpx);
}

.price-tag__symbol--medium {
  font-size: var(--font-sm, 26rpx);
}

.price-tag__symbol--large {
  font-size: var(--font-md, 28rpx);
}

.price-tag__value--small {
  font-size: var(--font-lg, 30rpx);
}

.price-tag__value--medium {
  font-size: var(--font-xl, 32rpx);
}

.price-tag__value--large {
  font-size: var(--font-2xl, 40rpx);
}

.price-tag__original--small {
  font-size: var(--font-xs, 24rpx);
}

.price-tag__original--medium {
  font-size: var(--font-sm, 26rpx);
}

.price-tag__original--large {
  font-size: var(--font-md, 28rpx);
}
</style>
