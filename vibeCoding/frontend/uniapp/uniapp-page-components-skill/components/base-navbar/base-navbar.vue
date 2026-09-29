<!--
  BaseNavbar 自定义头部导航（头部菜单）
  ============================================================
  结构：状态栏占位（可配）+ 单行导航（左侧返回 + 居中标题 + 右侧插槽）
  特性：
    - 状态栏高度走 CSS 变量 --status-bar-height（App.vue 定义，小程序端
      uni.getSystemInfoSync().statusBarHeight），默认 0；
    - fixed + placeholder 可吸顶并占位，避免内容被遮；
    - 右侧 right slot 可放菜单/按钮；
    - 简易通用版：未做微信胶囊对齐（那是 app-generate-skill 的 AppNavbar 强约束场景），
      小程序自定义导航如需胶囊对齐请用 AppNavbar 或本组件 #title slot 自行处理。
-->
<template>
  <view>
    <view v-if="fixed" :style="{ height: placeholder ? totalHeight : 0 }" />

    <view class="base-navbar" :class="{ 'is-fixed': fixed, 'is-transparent': transparent }" :style="navbarStyle">
      <slot name="status-bar">
        <view v-if="showStatusBar" class="bn-status-bar" :style="{ height: statusBarHeight }" />
      </slot>

      <view class="bn-main">
        <view class="bn-side bn-side-left">
          <slot name="left">
            <view v-if="showBack" class="bn-back" @click="$emit('back')">
              <text class="bn-back-icon">‹</text>
            </view>
          </slot>
        </view>

        <view class="bn-title-wrap">
          <slot name="title">
            <text class="bn-title">{{ title }}</text>
          </slot>
        </view>

        <view class="bn-side bn-side-right">
          <slot name="right">
            <view v-if="rightText" class="bn-right" @click="$emit('rightClick')">
              <text class="bn-right-text">{{ rightText }}</text>
            </view>
          </slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 标题 */
  title?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 透明背景（沉浸式，配合导航下内容滚动） */
  transparent?: boolean
  /** 是否吸顶 */
  fixed?: boolean
  /** 吸顶时是否占位（避免遮挡内容） */
  placeholder?: boolean
  /** 状态栏高度（rpx / px / CSS 变量），小程序端建议传 var(--status-bar-height) */
  statusBarHeight?: string
  /** 是否渲染状态栏占位行（true 时用 statusBarHeight） */
  showStatusBar?: boolean
  /** 右侧文字按钮 */
  rightText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  transparent: false,
  fixed: false,
  placeholder: true,
  statusBarHeight: '0',
  showStatusBar: true,
  rightText: '',
})

const emit = defineEmits<{ back: []; rightClick: [] }>()

const navbarStyle = computed(() => ({
  background: props.transparent ? 'transparent' : 'var(--color-bg-surface)',
  borderBottom: props.transparent ? 'none' : '1rpx solid var(--color-border-light)',
}))

const totalHeight = computed(() =>
  props.showStatusBar ? `calc(${props.statusBarHeight} + var(--height-btn-xl))` : 'var(--height-btn-xl)',
)
</script>

<style lang="scss" scoped>
.base-navbar {
  width: 100%;
  box-sizing: border-box;

  &.is-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 500;
  }

  &.is-transparent {
    .bn-title {
      color: var(--white);
    }

    .bn-back-icon {
      color: var(--white);
    }
  }
}

.bn-status-bar {
  width: 100%;
}

.bn-main {
  display: flex;
  align-items: center;
  height: var(--height-btn-xl);
  padding: 0 var(--spacing-md);
}

.bn-side {
  display: flex;
  align-items: center;
  min-width: 96rpx;

  &-right {
    justify-content: flex-end;
  }
}

.bn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 88rpx;
}

.bn-back-icon {
  font-size: var(--font-2xl);
  color: var(--color-text-primary);
  line-height: 1;
}

.bn-title-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bn-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.bn-right {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 88rpx;
}

.bn-right-text {
  font-size: var(--font-md);
  color: var(--color-primary);
}
</style>
