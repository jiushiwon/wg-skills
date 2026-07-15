<template>
  <view :class="['list-item', { 'list-item--arrow': arrow, 'list-item--disabled': disabled }]" @click="handleClick">
    <!-- 左侧图标 -->
    <view v-if="icon" class="list-item__icon">
      <image :src="icon" mode="aspectFit" />
    </view>

    <!-- 左侧插槽 -->
    <slot name="icon"></slot>

    <!-- 内容 -->
    <view class="list-item__content">
      <view v-if="title" class="list-item__title">{{ title }}</view>
      <view v-if="label" class="list-item__label">{{ label }}</view>
      <slot></slot>
    </view>

    <!-- 右侧内容 -->
    <view class="list-item__right">
      <slot name="right"></slot>
      <view v-if="value" class="list-item__value">{{ value }}</view>
      <view v-if="arrow" class="list-item__arrow">›</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ListItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    arrow: {
      type: Boolean,
      default: false
    },
    disabled: {
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
.list-item {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 12px 16px;
  background: var(--bg-primary, #fff);
  border-bottom: 1px solid #eee;

  &--arrow {
    cursor: pointer;
  }

  &--disabled {
    opacity: 0.5;
  }

  &__icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;

    image {
      width: 100%;
      height: 100%;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 16px;
    color: var(--text-primary, #1C1C1E);
  }

  &__label {
    margin-top: 4px;
    font-size: 13px;
    color: var(--text-secondary, #6C6C70);
  }

  &__right {
    display: flex;
    align-items: center;
    margin-left: 12px;
  }

  &__value {
    font-size: 15px;
    color: var(--text-secondary, #6C6C70);
  }

  &__arrow {
    margin-left: 8px;
    font-size: 18px;
    color: #ccc;
  }
}
</style>
