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
      :style="{ background: iconColor || 'var(--color-bg-tinted)', color: iconTextColor || 'var(--color-primary)' }"
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
        color="var(--color-primary)"
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
  min-height: var(--height-btn-xl);
  padding: var(--spacing-sm) 0;
  border-bottom: 1rpx solid var(--color-border-light);

  &:last-child {
    border-bottom: none;
  }

  &.is-clickable:active {
    opacity: 0.7;
  }
}

.si-icon {
  flex-shrink: 0;
  width: var(--icon-lg);
  height: var(--icon-lg);
  border-radius: var(--radius-sm);
  margin-right: var(--spacing-md);
}

.si-icon-text {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg);
  height: var(--icon-lg);
  border-radius: var(--radius-sm);
  margin-right: var(--spacing-md);
}

.si-icon-text-char {
  font-size: var(--font-md);
  font-weight: 600;
  color: inherit;
}

.si-main {
  flex: 1;
  min-width: 0;
}

.si-label {
  display: block;
  font-size: var(--font-md);
  color: var(--color-text-primary);
}

.si-desc {
  display: block;
  margin-top: 2rpx;
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.si-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.si-value {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.si-badge {
  min-width: var(--icon-sm);
  height: var(--icon-sm);
  padding: 0 var(--spacing-xs);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-error);
  margin-left: var(--spacing-sm);
}

.si-badge-text {
  font-size: var(--font-xs);
  color: var(--white);
  line-height: 1;
}

.si-arrow {
  margin-left: var(--spacing-sm);
  font-size: var(--font-lg);
  color: var(--color-text-tertiary);
  line-height: 1;
}

.si-switch {
  transform: scale(0.8);
  transform-origin: right center;
}
</style>
