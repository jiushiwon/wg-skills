<!--
  BaseTabbar 自定义底部菜单（底部导航）
  ============================================================
  结构：2~5 个菜单项（图标 + 文字 + 角标），激活项主题色高亮
  用途：
    - 页面内底部菜单（切换本页内容视图）；
    - 或作为"自定义 tabBar"的骨架（配合 pages.json custom-tab-bar 方案时，
      页面根需另包 custom-tab-bar 容器，本项目提供菜单 UI 与交互事件）。
  特性：底部固定 + 安全区适配；角标 red-dot / 数字；点击项自定义 slot。
-->
<template>
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
})

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
.base-tabbar {
  display: flex;
  background: var(--color-bg-surface);
  border-top: 1rpx solid var(--color-border-light);

  &.is-fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 400;
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
  height: var(--height-btn-xl);
  gap: 2rpx;
}

.bt-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bt-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.bt-icon-ph {
  font-size: var(--font-lg);
  color: var(--color-text-tertiary);
  line-height: 1;
}

.bt-text {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  transition: color 150ms ease-out;
}

.bt-item.is-active .bt-text {
  color: var(--color-primary);
  font-weight: 600;
}

.bt-badge {
  position: absolute;
  top: -8rpx;
  right: -16rpx;
  min-width: var(--icon-xs);
  height: var(--icon-xs);
  padding: 0 6rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-error);
}

.bt-badge-text {
  font-size: 18rpx;
  color: var(--white);
  line-height: 1;
}
</style>
