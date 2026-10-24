<script setup lang="ts">
import { COLOR_BG_PRIMARY, COLOR_TEXT_PRIMARY } from '@/constants/colors';
import { getNavbarMetrics } from '@/utils/navbar';

interface Props {
  title?: string;
  showBack?: boolean;
  bgColor?: string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  bgColor: COLOR_BG_PRIMARY,
  color: COLOR_TEXT_PRIMARY,
});

const emit = defineEmits<{
  back: [];
}>();

// 尺寸口径统一由 utils/navbar 提供：胶囊带 + 标题行，页面避让用同一份数据
const { statusBarHeight, titleRowHeight, capsuleBandHeight, navBarHeight } = getNavbarMetrics();

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
    <!-- 胶囊带：独占一行，仅返回图标可与之同排（左），右侧留给系统胶囊 -->
    <view class="app-navbar__capsule" :style="{ height: `${capsuleBandHeight}px` }">
      <view
        v-if="showBack"
        class="app-navbar__back"
        @tap="handleBack"
      >
        <text class="app-navbar__back-icon"></text>
      </view>
    </view>

    <!-- 标题行：位于胶囊带下方，与胶囊不重叠 -->
    <view class="app-navbar__title-row" :style="{ height: `${titleRowHeight}px` }">
      <text class="app-navbar__title">{{ title }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.app-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-index-navbar;
  box-sizing: border-box;

  &__capsule {
    display: flex;
    align-items: center;
    padding: 0 $spacing-md;
    box-sizing: border-box;
  }

  &__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
  }

  &__back-icon {
    font-size: $font-title;
    line-height: 1;
  }

  &__title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 $spacing-md;
    box-sizing: border-box;
  }

  &__title {
    max-width: 70%;
    font-size: $font-title;
    font-weight: 600;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
