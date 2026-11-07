<!--
  BaseTabbar 自定义底部菜单（底部导航）
  ============================================================
  结构：2~5 个菜单项（图标 + 文字 + 角标），激活项主题色高亮
  用途：
    - 页面内底部菜单（切换本页内容视图）；
    - 或作为"自定义 tabBar"的骨架（配合 pages.json custom-tab-bar 方案时，
      页面根需另包 custom-tab-bar 容器，本项目提供菜单 UI 与交互事件）。
  特性：底部固定 + 安全区适配；角标 red-dot / 数字；点击项自定义 slot；
       fixed 时自动渲染等高占位（spacer），页面内容不会被底栏遮住。
-->
<template>
  <view class="bt-wrapper">
    <view v-if="fixed && placeholder" class="bt-placeholder" :style="placeholderStyle" />

    <view class="base-tabbar" :class="{ 'is-fixed': fixed, 'is-safe': safeArea }">
    <view v-for="item in items" :key="item.key" class="bt-item" :class="{ 'is-active': item.key === modelValue }" @click="onItemClick(item)">
      <slot name="item" :item="item" :active="item.key === modelValue">
        <view class="bt-icon-wrap">
          <image
            v-if="item.icon"
            class="bt-icon"
            :src="item.key === modelValue && item.activeIcon ? item.activeIcon : item.icon"
            mode="aspectFit"
          />
          <text v-else class="bt-icon-ph">{{ (item.text || '·').slice(0, 1) }}</text>
          <view v-if="item.badge" class="bt-badge">
            <text class="bt-badge-text">{{ item.badge }}</text>
          </view>
        </view>
        <text class="bt-text">{{ item.text }}</text>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TabbarItem {
  key: string | number
  text: string
  icon?: string
  activeIcon?: string
  /** 角标（数字/字符串，原样显示；如超出显示需要 99+ 请在父层预格式化为 '99+'） */
  badge?: string | number
}

interface Props {
  /** 菜单项（2~5 个） */
  items?: TabbarItem[]
  /** 当前激活 key（v-model） */
  modelValue?: string | number
  /** 是否底部固定 */
  fixed?: boolean
  /** 是否适配安全区 */
  safeArea?: boolean
  /** 固定时是否渲染等高占位（避免内容被底栏遮挡） */
  placeholder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [
    { key: 'home', text: '首页' },
    { key: 'discover', text: '发现' },
    { key: 'profile', text: '我的' },
  ],
  modelValue: 'home',
  fixed: true,
  safeArea: true,
  placeholder: true,
})

// 占位高度 = 菜单项高度（+ 安全区），与底栏实际高度保持一致
const placeholderStyle = computed(() => ({
  height: props.safeArea
    ? 'calc(var(--height-btn-xl, 96rpx) + env(safe-area-inset-bottom))'
    : 'var(--height-btn-xl, 96rpx)',
}))

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [item: TabbarItem]
}>()

function onItemClick(item: TabbarItem) {
  if (item.key === props.modelValue) return
  emit('update:modelValue', item.key)
  emit('change', item)
}
</script>

<style lang="scss" scoped>
.bt-placeholder {
  width: 100%;
}

.base-tabbar {
  display: flex;
  background: var(--bg-card, #ffffff);
  border-top: 1rpx solid var(--border-light, #f5f5f5);

  &.is-fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-index-fixed, 300);
  }

  &.is-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.bt-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: var(--height-btn-xl, 96rpx);
}

.bt-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bt-icon {
  width: var(--icon-lg, 72rpx);
  height: var(--icon-lg, 72rpx);
}

.bt-icon-ph {
  font-size: var(--font-lg, 30rpx);
  color: var(--text-tertiary, #a3a3a3);
  line-height: 1;
}

.bt-text {
  font-size: var(--font-xs, 24rpx);
  color: var(--text-secondary, #525252);
  margin-top: var(--space-1, 4rpx);
  transition: color 150ms ease-out;
}

.bt-item.is-active .bt-text {
  color: var(--color-primary, #14b8a6);
  font-weight: 600;
}

.bt-badge {
  position: absolute;
  top: -8rpx;
  right: -16rpx;
  min-width: var(--icon-xs, 24rpx);
  height: var(--icon-xs, 24rpx);
  padding: 0 6rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full, 9999rpx);
  background: var(--color-error, #EF4444);
}

.bt-badge-text {
  font-size: var(--font-2xs, 20rpx);
  color: var(--text-inverse, #ffffff);
  line-height: 1;
}
</style>
