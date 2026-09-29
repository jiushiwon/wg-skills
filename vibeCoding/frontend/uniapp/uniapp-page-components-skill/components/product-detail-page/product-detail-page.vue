<!--
  ProductDetailPage 商品详情组件化页面
  ============================================================
  结构：导航栏 + 滚动区（头图 / 信息卡 / 多卡片 sections）+ 底部操作栏
  核心思路：整个页面 = 多个 BaseCard（空卡片）依次排列，sections slot 里自由堆卡片；
            内部默认的 gallery / info 也基于 BaseCard，用户可整体用 slot 替换。
  底部操作栏：bottomActions 数组驱动，type=primary 高亮主题色填充按钮。
-->
<template>
  <view class="pdp">
    <view class="pdp-navbar">
      <slot name="navbar">
        <view class="pdp-navbar-inner" :class="{ 'is-transparent': navbarTransparent }">
          <view class="pdp-navbar-back" @click="$emit('back')">
            <text class="pdp-navbar-back-icon">‹</text>
          </view>
          <text class="pdp-navbar-title">{{ title }}</text>
          <view class="pdp-navbar-right">
            <slot name="navbar-right" />
          </view>
        </view>
      </slot>
    </view>

    <scroll-view class="pdp-body" scroll-y @scrolltolower="$emit('reachBottom')">
      <view class="pdp-body-inner">
        <slot name="gallery">
          <base-card :radius="'0'" :padding="'0'" :margin="'0 0 var(--spacing-md)'">
            <view class="pdp-gallery-ph">
              <text class="pdp-gallery-ph-text">商品头图区（可放轮播，用 gallery slot 替换）</text>
            </view>
          </base-card>
        </slot>

        <slot name="info">
          <base-card>
            <view class="pdp-info">
              <text class="pdp-info-price">¥{{ price }}</text>
              <text class="pdp-info-title">{{ goodsTitle }}</text>
              <text v-if="goodsDesc" class="pdp-info-desc">{{ goodsDesc }}</text>
            </view>
          </base-card>
        </slot>

        <slot name="sections" />

        <slot />
      </view>
    </scroll-view>

    <view v-if="bottomBarVisible" class="pdp-footer">
      <slot name="footer">
        <view class="pdp-actions">
          <view
            v-for="act in bottomActions"
            :key="act.key"
            class="pdp-action"
            :class="`is-${act.type || 'text'}`"
            @click="$emit('action', act)"
          >
            <image v-if="act.icon" class="pdp-action-icon" :src="act.icon" mode="aspectFit" />
            <text class="pdp-action-text">{{ act.text }}</text>
          </view>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface BottomAction {
  key: string
  text: string
  icon?: string
  /** primary 主题色填充 / ghost 浅底主题色文字 / text 纯文字小按钮 */
  type?: 'primary' | 'ghost' | 'text'
}

interface Props {
  title?: string
  /** 透明导航栏（适合头图沉浸式） */
  navbarTransparent?: boolean
  /** 商品价格（info slot 默认展示用） */
  price?: string | number
  /** 商品标题（info slot 默认展示用） */
  goodsTitle?: string
  /** 商品副标题（info slot 默认展示用） */
  goodsDesc?: string
  /** 底部操作栏 */
  bottomActions?: BottomAction[]
  /** 是否显示底部操作栏 */
  bottomBarVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '商品详情',
  navbarTransparent: false,
  price: '0.00',
  goodsTitle: '商品标题',
  goodsDesc: '',
  bottomActions: () => [
    { key: 'service', text: '客服' },
    { key: 'cart', text: '购物车' },
    { key: 'add-cart', text: '加入购物车', type: 'ghost' },
    { key: 'buy', text: '立即购买', type: 'primary' },
  ],
  bottomBarVisible: true,
})

const emit = defineEmits<{ back: []; action: [act: BottomAction]; reachBottom: [] }>()
</script>

<style lang="scss" scoped>
.pdp {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-page);
}

/* ---- 导航栏 ---- */
.pdp-navbar {
  position: relative;
  z-index: 300;
  flex-shrink: 0;
}

.pdp-navbar-inner {
  display: flex;
  align-items: center;
  height: var(--height-btn-xl);
  padding: 0 var(--spacing-md);
  background: var(--color-bg-surface);
  border-bottom: 1rpx solid var(--color-border-light);

  &.is-transparent {
    background: transparent;
    border-bottom: none;
  }
}

.pdp-navbar-back {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 88rpx;
}

.pdp-navbar-back-icon {
  font-size: var(--font-2xl);
  color: var(--color-text-primary);
  line-height: 1;
}

.pdp-navbar-title {
  flex: 1;
  text-align: center;
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.pdp-navbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 88rpx;
}

/* ---- 滚动区 ---- */
.pdp-body {
  flex: 1;
  min-height: 0;
}

.pdp-body-inner {
  padding-bottom: var(--spacing-2xl);
}

.pdp-gallery-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 480rpx;
  background: var(--color-bg-tinted);
}

.pdp-gallery-ph-text {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.pdp-info-price {
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--color-error);
}

.pdp-info-title {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-xl);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text-primary);
}

.pdp-info-desc {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* ---- 底部操作栏 ---- */
.pdp-footer {
  flex-shrink: 0;
  background: var(--color-bg-surface);
  border-top: 1rpx solid var(--color-border-light);
  padding: var(--spacing-sm) var(--spacing-lg);
  padding-bottom: calc(var(--spacing-sm) + env(safe-area-inset-bottom));
}

.pdp-actions {
  display: flex;
  align-items: center;
}

.pdp-action {
  margin-right: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: var(--height-btn-md);
  border-radius: var(--radius-btn);

  &.pdp-action:last-child {
  margin-right: 0;
}
.is-primary {
    flex: 1.6;
    height: var(--height-btn-lg);
    background: var(--color-primary);
  }

  &.is-ghost {
    flex: 1.2;
    height: var(--height-btn-lg);
    background: var(--color-bg-tinted);
  }

  &.is-text {
    color: var(--color-text-secondary);
  }
}

.pdp-action-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  margin-bottom: 2rpx;
}

.pdp-action-text {
  font-size: var(--font-sm);
  color: inherit;

  .is-primary &,
  .is-ghost & {
    font-size: var(--font-md);
    font-weight: 600;
  }
}

.is-primary .pdp-action-text {
  color: var(--white);
}

.is-ghost .pdp-action-text {
  color: var(--color-primary);
}
</style>
