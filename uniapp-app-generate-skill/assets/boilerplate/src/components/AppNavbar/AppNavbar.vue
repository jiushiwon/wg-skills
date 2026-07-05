<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  showBack?: boolean;
  bgColor?: string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  bgColor: '#ffffff',
  color: '#111827',
});

const emit = defineEmits<{
  back: [];
}>();

// 胶囊按钮信息：用于计算导航栏高度与标题位置
const menuInfo = uni.getMenuButtonBoundingClientRect();
const systemInfo = uni.getSystemInfoSync();

const statusBarHeight = computed(() => systemInfo.statusBarHeight || 0);

// 导航栏总高度 = 状态栏高度 + 胶囊按钮占用区域高度
const navBarHeight = computed(() => {
  const menuTop = menuInfo.top || statusBarHeight.value + 8;
  const menuHeight = menuInfo.height || 32;
  return statusBarHeight.value + (menuTop - statusBarHeight.value) * 2 + menuHeight;
});

// 胶囊按钮左侧安全边距，确保标题不会被遮挡
const safePaddingRight = computed(() => {
  const screenWidth = systemInfo.screenWidth || systemInfo.windowWidth || 375;
  const menuRight = menuInfo.right || screenWidth - 8;
  return screenWidth - menuRight + menuInfo.width;
});

function handleBack() {
  emit('back');
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  }
}
</script>

<template>
  <view
    class="app-navbar"
    :style="{
      height: `${navBarHeight}px`,
      paddingTop: `${statusBarHeight}px`,
      backgroundColor: bgColor,
      color: color,
    }"
  >
    <view
      class="app-navbar__content"
      :style="{ paddingRight: `${safePaddingRight}px` }"
    >
      <view
        v-if="showBack"
        class="app-navbar__back"
        @click="handleBack"
      >
        <text class="app-navbar__back-icon">←</text>
      </view>

      <text class="app-navbar__title">{{ title }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
:root {
  --navbar-height: v-bind(navBarHeight + 'px');
}

.app-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-sizing: border-box;

  &__content {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 $spacing-md;
    box-sizing: border-box;
  }

  &__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 100%;
    margin-right: $spacing-sm;
  }

  &__back-icon {
    font-size: $font-title;
    line-height: 1;
  }

  &__title {
    flex: 1;
    font-size: $font-title;
    font-weight: 600;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
