<template>
  <view
    class="t-button"
    :class="[
      `t-button--${type}`,
      `t-button--${size}`,
      {
        't-button--block': block,
        't-button--round': round,
        't-button--disabled': disabled,
        't-button--loading': loading
      }
    ]"
    :aria-disabled="disabled || loading"
    @click="handleClick"
  >
    <view v-if="loading" class="t-button__spinner"></view>
    <view class="t-button__text">
      <slot>按钮</slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  round?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  round: false
})

const emit = defineEmits<{ (e: 'click'): void }>()

function handleClick() {
  if (props.disabled || props.loading) return
  emit('click')
}
</script>

<style lang="scss" scoped>
.t-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-weight: 500;
  line-height: 1;
  color: #333333;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;
  min-width: 0;
}

.t-button__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.t-button__spinner {
  width: 1em;
  height: 1em;
  margin-right: 6px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: t-button-spin 0.8s linear infinite;
  flex-shrink: 0;
}

/* 尺寸 */
.t-button--sm {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

.t-button--md {
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
}

.t-button--lg {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
}

/* 变体 */
.t-button--primary {
  background: #333333;
  color: #FFFFFF;
}

.t-button--secondary {
  background: #F5F5F5;
  color: #333333;
  border-color: #E5E5E5;
}

.t-button--ghost {
  background: transparent;
  color: #333333;
  border-color: #E5E5E5;
}

.t-button--danger {
  background: #EF4444;
  color: #FFFFFF;
}

/* 形状 */
.t-button--round {
  border-radius: 9999px;
}

.t-button:not(.t-button--round) {
  border-radius: 8px;
}

.t-button--block {
  display: flex;
  width: 100%;
}

/* 状态 */
.t-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.t-button--loading {
  cursor: wait;
}

.t-button:not(.t-button--disabled):not(.t-button--loading):active {
  transform: scale(0.98);
}

.t-button--secondary .t-button__spinner,
.t-button--ghost .t-button__spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: currentColor;
}

@keyframes t-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<!-- 使用示例 -->
<!--
<template>
  <view class="demo">
    <t-button type="primary" @click="onClick">主要按钮</t-button>
    <t-button type="secondary" size="sm">次要按钮</t-button>
    <t-button type="ghost" size="lg">幽灵按钮</t-button>
    <t-button type="danger" loading>删除中</t-button>
    <t-button type="primary" block>块状按钮</t-button>
  </view>
</template>

<script setup>
import TButton from '@/components/uniapp-vue3/button/button.vue'

function onClick() {
  uni.showToast({ title: '点击', icon: 'none' })
}
</script>
-->
