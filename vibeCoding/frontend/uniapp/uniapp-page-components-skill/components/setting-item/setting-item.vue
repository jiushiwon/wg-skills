<!--
  SettingItem 设置/菜单行（业务组件）
  ============================================================
  基于 base-card 空壳组件组合实现，不改空壳。
  场景：设置项、我的菜单行、通知行、购物车行（左图 + 右箭头/角标/开关）。
  触发词：设置行 / 菜单项 / 设置项 / 带开关的列表行
-->
<template>
  <view class="si" :class="{ 'is-clickable': clickable }" @click="onClick">
    <image
      v-if="icon && !iconError"
      class="si-icon"
      :src="icon"
      mode="aspectFill"
      @error="iconError = true"
    />
    <view
      v-else-if="iconText"
      class="si-icon-text"
      :style="{ background: iconColor || 'var(--bg-light, #f5f5f5)', color: iconTextColor || 'var(--color-primary, #14b8a6)' }"
    >
      <text class="si-icon-text-char">{{ iconText.slice(0, 1) }}</text>
    </view>

    <view class="si-main">
      <text class="si-label">{{ label }}</text>
      <text v-if="desc" class="si-desc">{{ desc }}</text>
    </view>

    <view class="si-right">
      <text v-if="value" class="si-value">{{ value }}</text>
      <view v-if="badge" class="si-badge"><text class="si-badge-text">{{ badge }}</text></view>
      <switch
        v-if="showSwitch"
        class="si-switch"
        :checked="modelValue"
        color="var(--color-primary, #14b8a6)"
        @change="onSwitchChange"
      />
      <text v-if="arrow && !showSwitch" class="si-arrow">›</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  icon?: string
  iconText?: string
  iconColor?: string
  iconTextColor?: string
  label?: string
  desc?: string
  value?: string
  badge?: string | number
  arrow?: boolean
  clickable?: boolean
  /** 是否显示开关（v-model） */
  showSwitch?: boolean
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  iconText: '',
  iconColor: '',
  iconTextColor: '',
  label: '',
  desc: '',
  value: '',
  badge: '',
  arrow: true,
  clickable: true,
  showSwitch: false,
  modelValue: false,
})

const emit = defineEmits<{ click: []; 'update:modelValue': [value: boolean]; switchChange: [value: boolean] }>()

const iconError = ref(false)

function onClick() {
  if (props.clickable && !props.showSwitch) emit('click')
}

function onSwitchChange(e: any) {
  const v = !!e.detail.value
  emit('update:modelValue', v)
  emit('switchChange', v)
}
</script>

<style lang="scss" scoped>
.si {
  display: flex;
  align-items: center;
  min-height: var(--height-btn-xl, 96rpx);
  padding: var(--space-4, 16rpx) 0;
  border-bottom: 1rpx solid var(--border-light, #f5f5f5);

  &:last-child {
    border-bottom: none;
  }

  &.is-clickable:active {
    opacity: 0.7;
  }
}

.si-icon {
  flex-shrink: 0;
  width: var(--icon-lg, 72rpx);
  height: var(--icon-lg, 72rpx);
  border-radius: var(--radius-sm, 8rpx);
  margin-right: var(--space-6, 24rpx);
}

.si-icon-text {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg, 72rpx);
  height: var(--icon-lg, 72rpx);
  border-radius: var(--radius-sm, 8rpx);
  margin-right: var(--space-6, 24rpx);
}

.si-icon-text-char {
  font-size: var(--font-md, 28rpx);
  font-weight: 600;
  color: inherit;
}

.si-main {
  flex: 1;
  min-width: 0;
}

.si-label {
  display: block;
  font-size: var(--font-md, 28rpx);
  color: var(--text-primary, #171717);
}

.si-desc {
  display: block;
  margin-top: 2rpx;
  font-size: var(--font-xs, 24rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.si-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.si-value {
  font-size: var(--font-sm, 26rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.si-badge {
  min-width: var(--icon-sm, 36rpx);
  height: var(--icon-sm, 36rpx);
  padding: 0 var(--space-2, 8rpx);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full, 9999rpx);
  background: var(--color-error, #EF4444);
  margin-left: var(--space-4, 16rpx);
}

.si-badge-text {
  font-size: var(--font-xs, 24rpx);
  color: var(--text-inverse, #ffffff);
  line-height: 1;
}

.si-arrow {
  margin-left: var(--space-4, 16rpx);
  font-size: var(--font-lg, 30rpx);
  color: var(--text-tertiary, #a3a3a3);
  line-height: 1;
}

.si-switch {
  transform: scale(0.8);
  transform-origin: right center;
}
</style>
