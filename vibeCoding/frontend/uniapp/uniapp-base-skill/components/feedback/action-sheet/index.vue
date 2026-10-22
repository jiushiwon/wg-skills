<!--
  ActionSheet 操作菜单
  ============================================================
  用途：基于 BasePopup（direction="bottom"）的底部操作菜单。
  约定：
    - 外壳（遮罩、圆角、安全区、进出场）全部由 BasePopup 提供；
    - actions 每项：text（文案）、danger（危险色）、disabled（不可点击）、
      value（业务标识，选中时原样回传）；
    - 选中任一项或点击取消都会关闭自身并派发 close。
-->
<template>
  <BasePopup :show="show" direction="bottom" padding="none" @update:show="onPopupShow">
    <view class="action-sheet">
      <view v-if="title" class="action-sheet__title">
        <text class="action-sheet__title-text">{{ title }}</text>
      </view>

      <view class="action-sheet__list">
        <view
          v-for="(item, index) in actions"
          :key="index"
          class="action-sheet__item"
          :class="{ 'is-danger': item.danger, 'is-disabled': item.disabled }"
          @click="onSelect(item)"
        >
          <text class="action-sheet__item-text">{{ itemText(item) }}</text>
        </view>
      </view>

      <view v-if="showCancel" class="action-sheet__cancel" @click="onCancel">
        <text class="action-sheet__cancel-text">{{ cancelText }}</text>
      </view>
    </view>
  </BasePopup>
</template>

<script setup lang="ts">
import BasePopup from '../../containers/base-popup/index.vue'

/** 操作项 */
interface ActionSheetItem {
  /** 文案（兼容 name 字段） */
  text?: string
  /** 文案别名 */
  name?: string
  /** 业务标识，选中时原样回传 */
  value?: string | number
  /** 危险态：使用错误色 */
  danger?: boolean
  /** 不可点击 */
  disabled?: boolean
}

interface ActionSheetProps {
  /** 显示状态（v-model:show） */
  show?: boolean
  /** 标题 */
  title?: string
  /** 操作项列表 */
  actions?: ActionSheetItem[]
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 取消按钮文字 */
  cancelText?: string
}

withDefaults(defineProps<ActionSheetProps>(), {
  show: false,
  title: '',
  actions: () => [],
  showCancel: true,
  cancelText: '取消',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
  select: [item: ActionSheetItem]
}>()

function itemText(item: ActionSheetItem): string {
  return item.text || item.name || ''
}

// BasePopup 遮罩点击时关闭
function onPopupShow(value: boolean) {
  emit('update:show', value)
  if (!value) emit('close')
}

function close() {
  emit('update:show', false)
  emit('close')
}

function onCancel() {
  close()
}

function onSelect(item: ActionSheetItem) {
  if (item.disabled) return
  emit('select', item)
  close()
}
</script>

<style scoped>
.action-sheet {
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #ffffff);
}

.action-sheet__title {
  padding: var(--space-4, 16rpx);
  text-align: center;
  border-bottom: 1rpx solid var(--border-light, #f5f5f5);
}

.action-sheet__title-text {
  font-size: var(--font-sm, 26rpx);
  color: var(--text-secondary, #525252);
}

.action-sheet__list {
  display: flex;
  flex-direction: column;
}

.action-sheet__item {
  height: var(--height-btn-lg, 88rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid var(--border-light, #f5f5f5);
  transition: opacity var(--transition-fast, 150ms ease);
}

.action-sheet__item:active {
  opacity: 0.7;
}

.action-sheet__item-text {
  font-size: var(--font-lg, 30rpx);
  line-height: 1;
  color: var(--text-primary, #171717);
}

.action-sheet__item.is-danger .action-sheet__item-text {
  color: var(--color-error, #EF4444);
}

.action-sheet__item.is-disabled {
  opacity: 0.5;
}

.action-sheet__item.is-disabled .action-sheet__item-text {
  color: var(--text-disabled, #d4d4d4);
}

.action-sheet__cancel {
  height: var(--height-btn-lg, 88rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1rpx solid var(--border-light, #f5f5f5);
  transition: opacity var(--transition-fast, 150ms ease);
}

.action-sheet__cancel:active {
  opacity: 0.7;
}

.action-sheet__cancel-text {
  font-size: var(--font-lg, 30rpx);
  line-height: 1;
  color: var(--color-primary, #14b8a6);
}
</style>
