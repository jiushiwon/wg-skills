<!--
  BaseCard 空卡片托底组件
  ============================================================
  用途：所有组件化页面的"套壳"基础组件，统一圆角 / 内边距 / 背景 / 描边 / 阴影。
      商品详情页、我的页面、Tab 列表页、图片卡片均以此组件为托底。
  说明：
    - 所有默认值来自 uniapp-theme-skill 的 CSS 变量（禁止写死）；
    - 其余页面组件内部引用本组件时，可通过 cardProps 透传这些入参；
    - 内容完全由 slot 决定，自由填充。
-->
<template>
  <view
    class="base-card"
    :class="{ 'is-clickable': clickable, 'is-bordered': border, 'is-shadowed': shadow }"
    :style="cardStyle"
    @click="onClick"
  >
    <view v-if="$slots.header || title" class="bc-header" :style="headerStyle">
      <slot name="header">
        <text class="bc-header-title">{{ title }}</text>
      </slot>
    </view>

    <view class="bc-body">
      <slot />
    </view>

    <view v-if="$slots.footer" class="bc-footer" :style="footerStyle">
      <slot name="footer" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 卡片标题（也可用 header slot 完全自定义） */
  title?: string
  /** 圆角，默认取主题 --radius-card */
  radius?: string
  /** 内边距，默认取主题 --spacing-lg（32rpx） */
  padding?: string
  /** 背景色，默认取主题 --color-bg-surface */
  background?: string
  /** 外边距，默认底部留白 */
  margin?: string
  /** 是否描边（1rpx 细线，--color-border-light） */
  border?: boolean
  /** 是否阴影 */
  shadow?: boolean
  /** 是否可点击（点击触发 click 事件并带按压反馈） */
  clickable?: boolean
  /** header / body / footer 之间的垂直间距 */
  gap?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  radius: 'var(--radius-card)',
  padding: 'var(--spacing-lg)',
  background: 'var(--color-bg-surface)',
  margin: '0 0 var(--spacing-md)',
  border: false,
  shadow: false,
  clickable: false,
  gap: 'var(--spacing-sm)',
})

const emit = defineEmits<{ click: [] }>()

const cardStyle = computed(() => ({
  borderRadius: props.radius,
  padding: props.padding,
  background: props.background,
  margin: props.margin,
}))

const headerStyle = computed(() => ({ marginBottom: props.gap }))
const footerStyle = computed(() => ({ marginTop: props.gap }))

function onClick() {
  if (props.clickable) emit('click')
}
</script>

<style lang="scss" scoped>
.base-card {
  overflow: hidden;
  box-sizing: border-box;
}

.is-bordered {
  border: 1rpx solid var(--color-border-light);
}

.is-shadowed {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.is-clickable {
  transition: transform 150ms ease-out, opacity 150ms ease-out;

  &:active {
    transform: scale(0.985);
    opacity: 0.9;
  }
}

.bc-header-title {
  display: block;
  font-size: var(--font-lg);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text-primary);
}
</style>
