<template>
  <view>
    <!-- 遮罩层 -->
    <view v-if="show" class="side-menu-mask" @click="handleClose" />

    <!-- 侧边栏 -->
    <view :class="['side-menu', { 'side-menu--show': show }]" :style="sideMenuStyle">
      <view class="side-menu__header">
        <slot name="header">
          <text class="side-menu__title">{{ title }}</text>
        </slot>
        <view class="side-menu__close" @click="handleClose">×</view>
      </view>
      <scroll-view class="side-menu__content" scroll-y>
        <slot></slot>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SideMenu',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '菜单'
    },
    width: {
      type: String,
      default: '80%'
    },
    background: {
      type: String,
      default: '#ffffff'
    }
  },
  computed: {
    sideMenuStyle() {
      return {
        width: this.width,
        background: this.background
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
      this.$emit('update:show', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.side-menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  &--show {
    transform: translateX(0);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 16px;
    border-bottom: 1px solid #eee;
  }

  &__title {
    font-size: 17px;
    font-weight: 600;
  }

  &__close {
    font-size: 24px;
    color: #999;
    padding: 4px;
  }

  &__content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
