<template>
  <view class="side-menu-wrapper">
    <!-- 遮罩层 -->
    <view v-if="show" class="side-menu__mask" @click="handleClose" />

    <!-- 侧边栏 -->
    <view :class="['side-menu', { 'side-menu--show': show }]" :style="sideStyle">
      <view class="side-menu__header">
        <slot name="header">
          <text class="side-menu__title">{{ title }}</text>
        </slot>
        <view class="side-menu__close" @click="handleClose">
          <text class="side-menu__close-text">×</text>
        </view>
      </view>

      <scroll-view class="side-menu__content" scroll-y>
        <slot>
          <view v-for="item in items" :key="item.key" class="side-menu__group">
            <view class="side-menu__row" @click="handleToggle(item)">
              <text class="side-menu__row-text">{{ item.text }}</text>
              <text
                v-if="hasChildren(item) && collapsible"
                class="side-menu__arrow"
                :class="{ 'side-menu__arrow--open': isExpanded(item) }"
              >
                ›
              </text>
            </view>
            <view
              v-if="hasChildren(item)"
              class="side-menu__children"
              :style="childrenStyle(item)"
            >
              <view
                v-for="child in item.children || []"
                :key="child.key"
                class="side-menu__row side-menu__row--child"
                @click="handleSelect(child, item)"
              >
                <text class="side-menu__row-text">{{ child.text }}</text>
              </view>
            </view>
          </view>
        </slot>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SideMenuItem {
  /** 唯一标识 */
  key: string
  /** 展示文案 */
  text: string
  /** 子项列表（可选） */
  children?: SideMenuItem[]
}

interface SideMenuProps {
  /** 抽屉是否显示 */
  show?: boolean
  /** 抽屉标题 */
  title?: string
  /** 抽屉宽度 */
  width?: string
  /** 抽屉背景色 */
  background?: string
  /** 菜单项列表，可含子项 */
  items?: SideMenuItem[]
  /** 已展开的菜单项 key 集合 */
  modelValue?: string[]
  /** 是否允许折叠子项 */
  collapsible?: boolean
}

const props = withDefaults(defineProps<SideMenuProps>(), {
  show: false,
  title: '菜单',
  width: '80%',
  background: 'var(--bg-card, #ffffff)',
  items: () => [],
  modelValue: () => [],
  collapsible: true,
})

const emit = defineEmits<{
  /** 点击遮罩或关闭按钮 */
  close: []
  /** 抽屉显示状态变化 */
  'update:show': [show: boolean]
  /** 展开项集合变化 */
  'update:modelValue': [keys: string[]]
  /** 展开项变化，参数为 key 与展开状态 */
  change: [key: string, expanded: boolean]
  /** 点击菜单项 */
  select: [item: SideMenuItem, parent?: SideMenuItem]
}>()

const sideStyle = computed(() => ({
  width: props.width,
  background: props.background,
}))

function hasChildren(item: SideMenuItem): boolean {
  return !!(item.children && item.children.length)
}

function isExpanded(item: SideMenuItem): boolean {
  return props.modelValue.indexOf(item.key) >= 0
}

/**
 * 子项面板高度：每行固定一个 --height-btn-md，用 calc 相乘得到总高，
 * 收起时为 0；动画只发生在 height 上，不触碰其他布局属性。
 */
function childrenStyle(item: SideMenuItem): Record<string, string> {
  const open = !props.collapsible || isExpanded(item)
  const count = item.children ? item.children.length : 0
  return {
    height: open ? `calc(var(--height-btn-md, 72rpx) * ${count})` : '0rpx',
  }
}

function handleToggle(item: SideMenuItem) {
  if (!hasChildren(item) || !props.collapsible) return
  const expanded = isExpanded(item)
  const keys = expanded
    ? props.modelValue.filter((key) => key !== item.key)
    : props.modelValue.concat(item.key)
  emit('update:modelValue', keys)
  emit('change', item.key, !expanded)
}

function handleSelect(item: SideMenuItem, parent?: SideMenuItem) {
  emit('select', item, parent)
}

function handleClose() {
  emit('close')
  emit('update:show', false)
}
</script>

<style scoped>
.side-menu-wrapper {
  position: relative;
}

.side-menu__mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay, rgba(0, 0, 0, 0.5));
  z-index: var(--z-index-modal-backdrop, 400);
}

.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: var(--z-index-modal, 500);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform var(--transition-normal, 200ms ease);
}

.side-menu--show {
  transform: translateX(0);
}

.side-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--height-navbar, 88rpx);
  padding: 0 var(--space-4, 16rpx);
  border-bottom: 1rpx solid var(--border, #e5e5e5);
}

.side-menu__title {
  font-size: var(--font-lg, 30rpx);
  font-weight: 600;
  color: var(--text-primary, #171717);
}

.side-menu__close {
  padding: var(--space-2, 8rpx);
}

.side-menu__close-text {
  font-size: var(--font-xl, 32rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.side-menu__content {
  flex: 1;
  overflow: hidden;
}

.side-menu__group {
  box-sizing: border-box;
}

.side-menu__row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--height-btn-md, 72rpx);
  padding: 0 var(--space-4, 16rpx);
}

.side-menu__row--child {
  padding-left: var(--space-8, 32rpx);
  background: var(--bg-light, #f5f5f5);
}

.side-menu__row-text {
  font-size: var(--font-md, 28rpx);
  color: var(--text-primary, #171717);
}

.side-menu__arrow {
  font-size: var(--font-lg, 30rpx);
  color: var(--text-tertiary, #a3a3a3);
  transform: rotate(0deg);
  transition: transform var(--transition-normal, 200ms ease);
}

.side-menu__arrow--open {
  transform: rotate(90deg);
}

/* 子项面板：仅 height 参与动画，展开收起不产生额外重排 */
.side-menu__children {
  overflow: hidden;
  transition: height var(--transition-normal, 200ms ease);
}
</style>
