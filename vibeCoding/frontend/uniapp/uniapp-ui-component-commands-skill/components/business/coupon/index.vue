<template>
  <view :class="['coupon', { 'coupon--disabled': disabled }]" @click="handleClick">
    <!-- 左侧金额 -->
    <view class="coupon__left">
      <view v-if="type === 'discount'" class="coupon__discount">
        <text class="coupon__value">{{ value }}</text>
        <text class="coupon__unit">折</text>
      </view>
      <view v-else class="coupon__amount">
        <text class="coupon__symbol">¥</text>
        <text class="coupon__value">{{ value }}</text>
      </view>
      <view class="coupon__condition">{{ condition }}</view>
    </view>

    <!-- 右侧信息 -->
    <view class="coupon__right">
      <view class="coupon__title">{{ title }}</view>
      <view v-if="desc" class="coupon__desc">{{ desc }}</view>
      <view class="coupon__footer">
        <view v-if="date" class="coupon__date">{{ date }}</view>
        <view v-if="!disabled && showReceive" class="coupon__receive">{{ received ? '已领取' : '立即领取' }}</view>
      </view>
    </view>

    <!-- 锯齿 -->
    <view class="coupon__notch coupon__notch--top" />
    <view class="coupon__notch coupon__notch--bottom" />
  </view>
</template>

<script>
export default {
  name: 'Coupon',
  props: {
    type: {
      type: String,
      default: 'money',
      validator: v => ['money', 'discount'].includes(v)
    },
    value: {
      type: [String, Number],
      default: 0
    },
    condition: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showReceive: {
      type: Boolean,
      default: false
    },
    received: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon {
  position: relative;
  display: flex;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  border-radius: 8px;
  overflow: hidden;

  &--disabled {
    background: #ccc;
    opacity: 0.7;
  }

  &__left {
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 8px;
    border-right: 1px dashed rgba(255, 255, 255, 0.5);
  }

  &__amount,
  &__discount {
    display: flex;
    align-items: baseline;
    color: #fff;
  }

  &__symbol {
    font-size: 14px;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
  }

  &__unit {
    font-size: 14px;
    margin-left: 2px;
  }

  &__condition {
    margin-top: 4px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
  }

  &__right {
    flex: 1;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  &__desc {
    margin-top: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__date {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
  }

  &__receive {
    font-size: 12px;
    color: #fff;
    font-weight: 500;
  }

  &__notch {
    position: absolute;
    left: 100px;
    width: 16px;
    height: 16px;
    background: #f5f5f5;
    border-radius: 50%;

    &--top {
      top: -8px;
    }

    &--bottom {
      bottom: -8px;
    }
  }
}
</style>
