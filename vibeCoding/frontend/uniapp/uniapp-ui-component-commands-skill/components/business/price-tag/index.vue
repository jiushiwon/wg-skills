<template>
  <view class="price-tag">
    <text v-if="needSymbol" :class="['price-tag__symbol', `price-tag__symbol--${size}`]">¥</text>
    <text :class="['price-tag__value', `price-tag__value--${size}`]">{{ showPrice }}</text>
    <text v-if="originalPrice" :class="['price-tag__original', `price-tag__original--${size}`]">
      ¥{{ originalPrice }}
    </text>
  </view>
</template>

<script>
export default {
  name: 'PriceTag',
  props: {
    price: {
      type: [String, Number],
      default: '0.00'
    },
    originalPrice: {
      type: [String, Number],
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: v => ['small', 'medium', 'large'].includes(v)
    },
    symbol: {
      type: Boolean,
      default: true
    },
    decimal: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    needSymbol() {
      return this.symbol
    },
    showPrice() {
      let p = this.price
      if (typeof p === 'number') {
        p = p.toFixed(this.decimal ? 2 : 0)
      }
      return p
    }
  }
}
</script>

<style lang="scss" scoped>
.price-tag {
  display: inline-flex;
  align-items: baseline;

  &__symbol {
    color: #ff4d4f;

    &--small {
      font-size: 12px;
    }

    &--medium {
      font-size: 14px;
    }

    &--large {
      font-size: 16px;
    }
  }

  &__value {
    color: #ff4d4f;
    font-weight: 600;

    &--small {
      font-size: 14px;
    }

    &--medium {
      font-size: 18px;
    }

    &--large {
      font-size: 24px;
    }
  }

  &__original {
    margin-left: 6px;
    color: #999;
    text-decoration: line-through;

    &--small {
      font-size: 12px;
    }

    &--medium {
      font-size: 13px;
    }

    &--large {
      font-size: 14px;
    }
  }
}
</style>
