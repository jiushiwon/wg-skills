<!--
  BaseCard 卡片容器（根容器）
  ============================================================
  容器原则：所有内容型组件都必须基于本组件扩展，禁止各自手写卡片外壳。
  主题变量真源：uniapp-theme-skill/templates/src/static/css/base.css
  本组件不重复定义主题变量，只引用。
-->
<template>
  <view
    class="base-card"
    :class="{ 'is-clickable': clickable, 'is-bordered': !!border, 'is-shadowed': !!shadow }"
    :style="cardStyle"
    @click="onClick"
  >
    <!-- 左侧图片（可选） -->
    <image
      v-if="image"
      class="bc-image"
      :src="image"
      :style="imageStyle"
      mode="aspectFill"
    />

    <view class="bc-main">
      <view v-if="$slots.header || title" class="bc-header" :style="headerStyle">
        <slot name="header">
          <text class="bc-header-title">{{ title }}</text>
        </slot>
        <slot name="header-right" />
      </view>

      <view class="bc-body">
        <slot />
      </view>

      <view v-if="$slots.footer" class="bc-footer" :style="footerStyle">
        <slot name="footer" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CardProps {
  /** 卡片标题（也可用 header 插槽完全自定义） */
  title?: string
  /** 圆角，默认取主题 --radius-card */
  radius?: string
  /** 内边距，默认取主题 --space-4 */
  padding?: string
  /** 背景色，默认取主题 --bg-card */
  background?: string
  /** 外边距 */
  margin?: string
  /** 宽度，默认 100% */
  width?: string
  /** 高度，默认 auto */
  height?: string
  /** 最小高度 */
  minHeight?: string
  /** 描边：true 用主题 --border，也可直接传 CSS 边框值 */
  border?: boolean | string
  /** 阴影：true 用主题 --shadow-sm，也可直接传 CSS 阴影值 */
  shadow?: boolean | string
  /** 是否可点击（点击触发 click 事件并带按压反馈） */
  clickable?: boolean
  /** header / body / footer 之间的垂直间距 */
  gap?: string
  /** 左侧图片地址 */
  image?: string
  /** 左侧图片尺寸 */
  imageSize?: string
  /** 左侧图片圆角 */
  imageRadius?: string
}

const props = withDefaults(defineProps<CardProps>(), {
  title: '',
  radius: 'var(--radius-card, 24rpx)',
  padding: 'var(--space-4, 16rpx)',
  background: 'var(--bg-card, #ffffff)',
  margin: '0',
  width: '100%',
  height: 'auto',
  minHeight: '',
  border: false,
  shadow: false,
  clickable: false,
  gap: 'var(--space-3, 12rpx)',
  image: '',
  imageSize: 'var(--height-avatar-md, 80rpx)',
  imageRadius: 'var(--radius-image, 16rpx)',
})

const emit = defineEmits<{ click: [] }>()

// 外壳样式：布尔开关落到主题变量，字符串则原样透传
const cardStyle = computed(() => {
  const style: Record<string, string> = {
    borderRadius: props.radius,
    padding: props.padding,
    background: props.background,
    margin: props.margin,
    width: props.width,
    height: props.height,
  }
  if (props.minHeight) style.minHeight = props.minHeight
  if (typeof props.border === 'string') style.border = props.border
  if (typeof props.shadow === 'string') style.boxShadow = props.shadow
  return style
})

const imageStyle = computed(() => ({
  width: props.imageSize,
  height: props.imageSize,
  borderRadius: props.imageRadius,
}))

const headerStyle = computed(() => ({ marginBottom: props.gap }))
const footerStyle = computed(() => ({ marginTop: props.gap }))

function onClick() {
  if (props.clickable) emit('click')
}
</script>

<style scoped>
.base-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--space-4, 16rpx);
  overflow: hidden;
}

.bc-main {
  flex: 1;
  min-width: 0;
}

.bc-image {
  flex-shrink: 0;
}

.is-bordered {
  border: 1rpx solid var(--border, #e5e5e5);
}

.is-shadowed {
  box-shadow: var(--shadow-sm, 0 2rpx 8rpx rgba(0, 0, 0, 0.04));
}

.is-clickable {
  transition: transform var(--transition-fast, 150ms ease), opacity var(--transition-fast, 150ms ease);

  &:active {
    transform: scale(0.985);
    opacity: 0.9;
  }
}

.bc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12rpx);
  padding-bottom: var(--space-3, 12rpx);
  border-bottom: 1rpx solid var(--border, #e5e5e5);
}

.bc-header-title {
  display: block;
  font-size: var(--font-lg, 30rpx);
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary, #171717);
}

.bc-body {
  width: 100%;
}

.bc-footer {
  padding-top: var(--space-3, 12rpx);
  border-top: 1rpx solid var(--border, #e5e5e5);
}
</style>
