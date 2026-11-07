# base-card 基础卡片

> **核心地位**：base-card 是 uniapp-base-skill 的根容器，所有**内容型**组件的外壳都来自它。
>
> 实现：`containers/base-card/index.vue`
> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)　个体规范：[STANDARD.md](STANDARD.md)

## 为什么一切皆卡片？

```
┌─┌─────────────────────────────────────┐
│  页面 = 多个卡片 + 布局            │
│  ┌─────────┐  ┌─────────┐          │
│  │  卡片1  │  │  卡片2  │          │
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  卡片 = 容器属性 + 内容             │
│  ┌─────────────────────────────┐    │
│  │  背景/圆角/边框/阴影       │    │
│  │  ┌──────────┬───────────┐  │    │
│  │  │ 标题栏   │  内容区   │  │    │
│  │  └──────────┴───────────┘  │    │
│  │  ┌─────────────────────┐  │    │
│  │  │      底部栏         │  │    │
│  │  └─────────────────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Props

> 主题变量真源：`uniapp-theme-skill/templates/src/static/css/base.css`（唯一真源，本模块不重复定义）。
> 默认值一律是**带兜底的 token 字符串**，保证变量未加载时也能正确渲染。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | string | `''` | 卡片标题（也可用 `header` 插槽完全自定义） |
| `radius` | string | `var(--radius-card, 24rpx)` | 圆角 |
| `padding` | string | `var(--space-4, 16rpx)` | 内边距 |
| `background` | string | `var(--bg-card, #ffffff)` | 背景色 |
| `margin` | string | `'0'` | 外边距 |
| `width` | string | `'100%'` | 宽度 |
| `height` | string | `'auto'` | 高度 |
| `minHeight` | string | `''` | 最小高度 |
| `border` | boolean \| string | `false` | `true` 用主题 `--border`；字符串则原样作为 CSS 边框值 |
| `shadow` | boolean \| string | `false` | `true` 用主题 `--shadow-sm`；字符串则原样作为 CSS 阴影值 |
| `clickable` | boolean | `false` | 是否可点击（触发 `click` 事件并带按压反馈） |
| `gap` | string | `var(--space-3, 12rpx)` | 标题栏 / 内容区 / 底部栏之间的垂直间距 |
| `image` | string | `''` | 左侧图片地址 |
| `imageSize` | string | `var(--height-avatar-md, 80rpx)` | 左侧图片尺寸 |
| `imageRadius` | string | `var(--radius-image, 16rpx)` | 左侧图片圆角 |

## Slots

| 插槽 | 说明 |
|------|------|
| 默认 | 内容区 |
| `header` | 标题栏（整块替换，含 `title` 的默认渲染） |
| `header-right` | 标题栏右侧（更多操作、标签等） |
| `footer` | 底部栏（操作按钮、说明等） |

## Events

| 事件 | 载荷 | 触发条件 |
|------|------|----------|
| `click` | - | `clickable` 为 `true` 且被点击时 |

## 代码

```vue
<template>
  <view
    class="base-card"
    :class="{ 'is-clickable': clickable, 'is-bordered': !!border, 'is-shadowed': !!shadow }"
    :style="cardStyle"
    @click="onClick"
  >
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
  title?: string
  radius?: string
  padding?: string
  background?: string
  margin?: string
  width?: string
  height?: string
  minHeight?: string
  border?: boolean | string
  shadow?: boolean | string
  clickable?: boolean
  gap?: string
  image?: string
  imageSize?: string
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
```

> 完整样式见 `containers/base-card/index.vue` 的 `<style scoped>`。

## 组合示例

### 按钮 = 卡片 + 文字

```vue
<template>
<BaseCard
  :padding="'var(--space-3, 12rpx) var(--space-6, 24rpx)'"
  :radius="'var(--radius-btn, 9999rpx)'"
  background="var(--color-primary, #14b8a6)"
  clickable
>
  <text style="color: var(--text-inverse, #ffffff)">按钮</text>
</BaseCard>
</template>


```

### 带标题与底部操作的卡片

```vue
<template>
<BaseCard title="订单信息" :shadow="true">
  <text class="desc">共 3 件商品，合计 ¥199</text>

  <template #footer>
    <text class="link" @click="goDetail">查看详情</text>
  </template>
</BaseCard>
</template>


```

### 带图片的卡片

```vue
<template>
<BaseCard
  image="/avatar.png"
  image-size="var(--height-avatar-lg, 120rpx)"
  image-radius="var(--radius-image, 16rpx)"
  :radius="'var(--radius-lg, 24rpx)'"
  :margin="'var(--space-3, 12rpx)'"
  clickable
>
  <view>
    <text>标题</text>
    <text>描述内容</text>
  </view>
</BaseCard>
</template>


```

### 列表项 = 卡片 + 紧凑配置

```vue
<template>
<BaseCard
  :padding="'var(--space-4, 16rpx)'"
  :radius="'var(--radius-none, 0rpx)'"
  border="1rpx solid var(--border, #e5e5e5)"
  clickable
  @click="onSelect"
>
  <text>设置项</text>
</BaseCard>
</template>


```

## 使用场景

| 场景 | 配置 |
|------|------|
| 通用卡片 | `radius: var(--radius-card, 24rpx)`、`padding: var(--space-4, 16rpx)` |
| 紧凑行 | `radius: var(--radius-none, 0rpx)`、`padding: var(--space-4, 16rpx)` |
| 悬浮卡片 | `shadow` 传 `true`（用主题 `--shadow-sm`）或自定义阴影值 |
| 幽灵按钮 | `background: transparent`、`border: 1rpx solid var(--border, #e5e5e5)` |
| 带图片卡片 | `image` + `imageSize` + `imageRadius` |
| 圆形头像容器 | `width`/`height` 相同、`radius: var(--radius-full, 9999rpx)`、`padding: 0` |

## 子类注意事项

1. **不要重复设置**容器已提供的属性（圆角、背景、边框、阴影），否则会出现双层边框与双层圆角。
2. **传 token 化字符串**，不要传裸值（例：`:padding="'var(--space-6, 24rpx)'"`）。
3. 容器可嵌容器：`BasePopup` 内部就是 `BaseCard`。
