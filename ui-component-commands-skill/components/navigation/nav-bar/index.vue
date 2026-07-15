<template>
  <!-- nav-bar 自定义导航栏 -->
  <view :class="['nav-bar', { 'nav-bar--fixed': fixed }]" :style="navBarStyle">
    <!-- 左侧区域 -->
    <view class="nav-bar__left" @click="handleBack">
      <view v-if="showBack" class="nav-bar__back">
        <text class="nav-bar__back-icon">‹</text>
      </view>
      <slot name="left"></slot>
    </view>

    <!-- 标题区域 -->
    <view class="nav-bar__title">
      <slot>{{ title }}</slot>
    </view>

    <!-- 右侧区域 -->
    <view class="nav-bar__right" @click="handleRightClick">
      <view v-if="capsuleRight && capsuleRight.length" class="nav-bar__capsule">
        <view
          v-for="(item, index) in capsuleRight"
          :key="index"
          class="nav-bar__capsule-item"
          @click.stop="handleCapsuleClick(item)"
        >
          <text>{{ item.text }}</text>
        </view>
      </view>
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: true
    },
    fixed: {
      type: Boolean,
      default: false
    },
    background: {
      type: String,
      default: '#ffffff'
    },
    titleColor: {
      type: String,
      default: '#1C1C1E'
    },
    capsuleRight: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    navBarStyle() {
      return {
        background: this.background,
        color: this.titleColor
      }
    }
  },
  methods: {
    handleBack() {
      this.$emit('back')
    },
    handleRightClick() {
      this.$emit('rightClick')
    },
    handleCapsuleClick(item) {
      this.$emit('capsuleClick', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: var(--bg-primary, #fff);

  &--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  &__left {
    display: flex;
    align-items: center;
    flex: 1;
  }

  &__back {
    display: flex;
    align-items: center;
    padding: 4px 0;
  }

  &__back-icon {
    font-size: 24px;
    font-weight: 300;
  }

  &__title {
    flex: 2;
    text-align: center;
    font-size: 17px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
  }

  &__capsule {
    display: flex;
    gap: 8px;
  }

  &__capsule-item {
    padding: 4px 12px;
    background: var(--bg-secondary, #f2f2f7);
    border-radius: 16px;
    font-size: 14px;
  }
}
</style>
