<script setup lang="ts">
import { computed } from 'vue';
import { COLOR_BG_PRIMARY, COLOR_TEXT_PRIMARY } from '@/constants/colors';

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

const TITLE_ROW_RPX = 88; // 与 $comp-navbar-title-height 默认值对齐

const systemInfo = uni.getSystemInfoSync();
const menuInfo =
  (uni.getMenuButtonBoundingClientRect && uni.getMenuButtonBoundingClientRect()) || null;

const statusBarHeight = computed(() => systemInfo.statusBarHeight || 0);

const screenWidth = computed(
  () => systemInfo.screenWidth || systemInfo.windowWidth || 375,
);

// rpx → px，与 SCSS 中的 rpx token 在当前屏宽下保持一致
const titleRowHeight = computed(() => Math.round((TITLE_ROW_RPX * screenWidth.value) / 750));

// 胶囊带：胶囊独占一行，左右对称留出与胶囊顶部相同的间距，返回图标在此带内垂直居中
const capsuleBandHeight = computed(() => {
  const capsuleTop = menuInfo ? menuInfo.top : statusBarHeight.value + 8;
  const capsuleHeight = menuInfo ? menuInfo.height : 32;
  const gapAbove = capsuleTop - statusBarHeight.value;
  return gapAbove * 2 + capsuleHeight;
});

// 导航栏总高 = 胶囊带 + 标题行（标题在胶囊带下方独立一行，绝不进入胶囊带）
const navBarHeight = computed(() => capsuleBandHeight.value + titleRowHeight.value);

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
        <text class="app-navbar__back-icon">←</text>
      </view>
    </view>

    <!-- 标题行：位于胶囊带下方，与胶囊不重叠 -->
    <view class="app-navbar__title-row" :style="{ height: `${titleRowHeight}px` }">
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
