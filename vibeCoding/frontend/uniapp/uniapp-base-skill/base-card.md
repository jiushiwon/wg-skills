# base-card 基础卡片

> **核心地位**：base-card 是 uniapp-base-skill 的基石，所有组件和页面都是由它组合而成。

## 为什么一切皆卡片？

```
┌─────────────────────────────────────┐
│  页面 = 多个卡片 + 布局            │
│  ┌─────────┐  ┌─────────┐          │
│  │  卡片1  │  │  卡片2  │          │
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  卡片 = 容器属性 + 内容             │
│  ┌─────────────────────────────┐    │
│  │  背景/圆角/边框/阴影       │    │
│  │  ┌─────────────────────┐  │    │
│  │  │      内容区          │  │    │
│  │  └─────────────────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | string | `'100%'` | 宽度 |
| `height` | string | `'auto'` | 高度 |
| `minHeight` | string | - | 最小高度 |
| `background` | string | `var(--color-bg-surface)` | 背景色 |
| `radius` | string | `var(--radius-md)` | 圆角 |
| `padding` | string | `var(--spacing-lg)` | 内边距 |
| `margin` | string | - | 外边距 |
| `border` | string | - | 边框 |
| `shadow` | string | - | 阴影 |
| `clickable` | boolean | `false` | 是否可点击 |
| `image` | string | - | 左侧图片地址 |
| `imageSize` | string | `'80rpx'` | 图片尺寸 |
| `imageRadius` | string | `var(--radius-sm)` | 图片圆角 |

## 代码

```vue
<template>
  <view
    class="base-card"
    :class="{ 'is-clickable': clickable }"
    :style="cardStyle"
    @click="onClick"
  >
    <!-- 左侧图片 -->
    <image
      v-if="image"
      class="card-image"
      :src="image"
      :style="imageStyle"
      mode="aspectFill"
    />
    <!-- 内容 -->
    <view class="card-content">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  width?: string
  height?: string
  minHeight?: string
  background?: string
  radius?: string
  padding?: string
  margin?: string
  border?: string
  shadow?: string
  clickable?: boolean
  image?: string
  imageSize?: string
  imageRadius?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 'auto',
  background: 'var(--color-bg-surface)',
  radius: 'var(--radius-md)',
  padding: 'var(--spacing-lg)',
  imageSize: '80rpx',
  imageRadius: 'var(--radius-sm)',
  clickable: false,
})

const emit = defineEmits<{ click: [] }>()

const cardStyle = computed(() => ({
  width: props.width,
  height: props.height,
  minHeight: props.minHeight,
  background: props.background,
  borderRadius: props.radius,
  padding: props.image ? `var(--spacing-sm) var(--spacing-md)` : props.padding,
  margin: props.margin,
  border: props.border,
  boxShadow: props.shadow,
}))

const imageStyle = computed(() => ({
  width: props.imageSize,
  height: props.imageSize,
  borderRadius: props.imageRadius,
}))

function onClick() {
  if (props.clickable) emit('click')
}
</script>

<style scoped>
.base-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: opacity 0.2s;
}
.is-clickable:active {
  opacity: 0.7;
}
.card-image {
  flex-shrink: 0;
}
.card-content {
  flex: 1;
  min-width: 0;
}
</style>
```

## 组合示例

### 按钮 = 卡片 + 文字

```vue
<base-card
  :padding="'16rpx 32rpx'"
  :radius="'var(--radius-sm)'"
  background="var(--color-primary)"
  clickable
>
  <text style="color:var(--white)">按钮</text>
</base-card>
```

### 头像 = 卡片 + 图片

```vue
<base-card
  :width="'80rpx'"
  :height="'80rpx'"
  :radius="'50%'"
  :padding="'0'"
  :overflow="'hidden'"
>
  <image src="/avatar.png" mode="aspectFill" />
</base-card>
```

### 设置项 = 卡片 + flex布局

```vue
<base-card :radius="'0'" :margin="'0'" :padding="'var(--spacing-lg)'" clickable>
  <view style="display:flex;align-items:center;">
    <base-avatar src="/icon.png" />
    <text style="flex:1;margin-left:var(--spacing-md);">设置项</text>
    <text style="color:var(--color-text-tertiary);">›</text>
  </view>
</base-card>
```

### 带图片的卡片 = 卡片 + 左侧图片

```vue
<base-card
  image="/avatar.png"
  image-size="80rpx"
  image-radius="var(--radius-sm)"
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  clickable
>
  <view>
    <text>标题</text>
    <text>描述内容</text>
  </view>
</base-card>
```

## 使用场景

| 场景 | 配置 |
|------|------|
| 通用卡片 | `radius: var(--radius-md), padding: var(--spacing-lg)` |
| 紧凑行 | `radius: 0, padding: var(--spacing-lg)` |
| 圆形 | `radius: 50%` |
| 方形 | `radius: 0` |
| 幽灵按钮 | `background: transparent, border: 1rpx solid var(--color-border)` |
| 悬浮卡片 | `shadow: var(--shadow-md)` |
| 带图片卡片 | `image: '/xxx.png', imageSize: '80rpx', imageRadius: 'var(--radius-sm)'` |
