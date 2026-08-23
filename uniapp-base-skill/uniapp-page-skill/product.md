# product-page 商品详情页

> ⚠️ **Demo 组件**：本文件是 demo 案例，非完美实现，仅供参考。展示如何基于 base-card 思想组合出商品详情页面。

## 结构拆解

```
┌─────────────────────────────┐
│  导航栏（固定顶部）        │  ← headerHeight, headerBg
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │  ← 商品图片区
│  │       图片          │   │  ← coverHeight, coverRadius
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │  ← 价格信息卡片
│  │ ¥99  │ 标题       │   │  ← cardRadius, cardPadding
│  │ 描述  │             │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │  ← 详情区（slot）
│  │      详情内容        │   │
│  └─────────────────────┘   │
│                             │
├─────────────────────────────┤
│  底部操作栏（固定底部）    │  ← footerHeight, footerBg + safe-area
└─────────────────────────────┘
```

## Props

| Prop | 默认值 | 说明 |
|------|--------|------|
| `pageBg` | `var(--color-bg)` | 页面背景色 |
| `headerHeight` | `88rpx` | 导航栏高度 |
| `headerBg` | `var(--color-bg-surface)` | 导航栏背景色 |
| `coverHeight` | `600rpx` | 商品图片高度 |
| `coverRadius` | `0` | 图片圆角 |
| `cardRadius` | `16rpx` | 卡片圆角 |
| `cardPadding` | `24rpx` | 卡片内边距 |
| `cardMargin` | `0 24rpx 24rpx` | 卡片外边距 |
| `cardBg` | `var(--color-bg-surface)` | 卡片背景色 |
| `footerHeight` | `100rpx` | 底部操作栏高度 |
| `footerBg` | `var(--color-bg-surface)` | 底部操作栏背景色 |
| `title` | `商品详情` | 导航标题 |
| `image` | - | 商品图片地址 |
| `price` | `¥0.00` | 价格 |
| `productTitle` | `商品标题` | 商品标题 |
| `description` | - | 商品描述 |

## 完整代码

```vue
<template>
  <view class="product-page" :style="pageStyle">

    <!-- 导航栏 -->
    <view class="product-header" :style="headerStyle">
      <text class="product-title">{{ title }}</text>
    </view>

    <!-- 滚动内容区 -->
    <view class="product-body">

      <!-- 商品图片：基于 base-card 思想 -->
      <view class="product-cover" :style="coverStyle">
        <image :src="image" mode="aspectFill" />
      </view>

      <!-- 价格卡片 -->
      <view class="product-card" :style="cardStyle">
        <text class="product-price">{{ price }}</text>
        <text class="product-title">{{ productTitle }}</text>
        <text v-if="description" class="product-desc">{{ description }}</text>
      </view>

      <!-- 详情区 -->
      <view v-if="$slots.default" class="product-detail">
        <slot />
      </view>

    <!-- 底部操作栏 -->
    <view class="product-footer" :style="footerStyle">
      <view class="product-actions">
        <view
          v-for="action in actions"
          :key="action.key"
          class="product-action"
          :class="`is-${action.type}`"
          @click="$emit('action', action)"
        >
          <text>{{ action.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface BottomAction {
  key: string
  text: string
  type: 'primary' | 'ghost'
}

// ===== 入参：控制宽高圆角背景色 =====
interface Props {
  pageBg?: string
  headerHeight?: string
  headerBg?: string
  coverHeight?: string
  coverRadius?: string
  cardRadius?: string
  cardPadding?: string
  cardMargin?: string
  cardBg?: string
  footerHeight?: string
  footerBg?: string
  title?: string
  image?: string
  price?: string
  productTitle?: string
  description?: string
  actions?: BottomAction[]
}

const props = withDefaults(defineProps<Props>(), {
  pageBg: 'var(--color-bg)',
  headerHeight: '88rpx',
  headerBg: 'var(--color-bg-surface)',
  coverHeight: '600rpx',
  coverRadius: '0',
  cardRadius: '16rpx',
  cardPadding: '24rpx',
  cardMargin: '0 24rpx 24rpx',
  cardBg: 'var(--color-bg-surface)',
  footerHeight: '100rpx',
  footerBg: 'var(--color-bg-surface)',
  title: '商品详情',
  image: '',
  price: '¥0.00',
  productTitle: '商品标题',
  description: '',
  actions: () => [
    { key: 'cart', text: '购物车', type: 'ghost' },
    { key: 'buy', text: '立即购买', type: 'primary' },
  ],
})

// ===== 计算样式 =====
const pageStyle = computed(() => ({
  background: props.pageBg,
  minHeight: '100vh',
  paddingTop: props.headerHeight,
  paddingBottom: props.footerHeight,
  boxSizing: 'border-box',
}))

const headerStyle = computed(() => ({
  position: 'fixed' as const,
  top: '0' as const,
  left: '0' as const,
  right: '0' as const,
  height: props.headerHeight,
  background: props.headerBg,
  zIndex: '100' as const,
}))

const coverStyle = computed(() => ({
  height: props.coverHeight,
  borderRadius: props.coverRadius,
}))

const cardStyle = computed(() => ({
  padding: props.cardPadding,
  margin: props.cardMargin,
  borderRadius: props.cardRadius,
  background: props.cardBg,
}))

const footerStyle = computed(() => ({
  position: 'fixed' as const,
  bottom: '0' as const,
  left: '0' as const,
  right: '0' as const,
  height: props.footerHeight,
  background: props.footerBg,
  zIndex: '100' as const,
  paddingBottom: 'env(safe-area-inset-bottom)',
}))

defineEmits<{ action: [action: BottomAction] }>()
</script>

<style scoped>
.product-page { overflow: hidden; }

.product-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid var(--color-border);
}

.product-title { font-size: var(--font-lg); font-weight: 600; }

.product-cover image { width: 100%; height: 100%; }

.product-card {
  background: var(--color-bg-surface);
}

.product-price {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-error);
}

.product-title {
  display: block;
  margin-top: 16rpx;
  font-size: var(--font-lg);
  font-weight: 600;
}

.product-desc {
  display: block;
  margin-top: 8rpx;
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.product-footer {
  flex-shrink: 0;
  border-top: 1rpx solid var(--color-border);
}

.product-actions {
  display: flex;
  height: 100%;
}

.product-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-action.is-primary { background: var(--color-primary); color: var(--white); }
.product-action.is-ghost { background: var(--color-bg); color: var(--color-text-primary); }
</style>
```

## 参数化示例

```vue
<!-- 圆形图片商品详情 -->
<product-page cover-radius="24rpx" />

<!-- 大圆角卡片风格 -->
<product-page card-radius="24rpx" card-padding="32rpx" />

<!-- 紧凑布局 -->
<product-page header-height="64rpx" footer-height="80rpx" cover-height="400rpx" />

<!-- 暗黑模式 -->
<product-page page-bg="#1a1a1a" header-bg="#2a2a2a" footer-bg="#2a2a2a" card-bg="#333" />
```

## 核心思想

1. **固定 header/footer**：与 chat-page 相同的布局模式
2. **图片区域参数化**：高度、圆角独立控制
3. **卡片参数化**：圆角、内边距、外边距、背景色都可配置
4. **底部操作栏**：支持自定义 actions，自动适配安全区域
5. **slot 扩展**：详情区通过 slot 预留，可填入任意内容
