<!--
  ProductCard 商品卡片
  ============================================================
  卡片外壳由根容器 BaseCard 提供（圆角/背景/边框），本组件只负责内部排布。
-->
<template>
  <BaseCard
    class="pc-card"
    :padding="'var(--space-0, 0rpx)'"
    :clickable="true"
    @click="onClick"
  >
    <!-- 封面图 -->
    <view class="pc-media">
      <image
        v-if="image && !imgError"
        class="pc-img"
        :src="image"
        mode="aspectFill"
        @error="onImgError"
      />
      <view v-else class="pc-img pc-img--ph">
        <text class="pc-ph-text">暂无图片</text>
      </view>
    </view>

    <!-- 内容 -->
    <view class="pc-content">
      <view v-if="title" class="pc-title">{{ title }}</view>
      <view v-if="desc" class="pc-desc">{{ desc }}</view>

      <view class="pc-bottom">
        <view class="pc-price">
          <text class="pc-price-symbol">¥</text>
          <text class="pc-price-value">{{ price }}</text>
          <text v-if="originalPrice" class="pc-price-original">¥{{ originalPrice }}</text>
        </view>
        <text v-if="sales" class="pc-sales">销量 {{ sales }}</text>
      </view>

      <view v-if="tags.length" class="pc-tags">
        <text v-for="(tag, i) in tags" :key="i" class="pc-tag">{{ tag }}</text>
      </view>
    </view>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseCard from '../../containers/base-card/index.vue'

interface ProductCardProps {
  /** 商品图片地址 */
  image?: string
  /** 商品标题 */
  title?: string
  /** 商品描述 */
  desc?: string
  /** 售价 */
  price?: string | number
  /** 原价（展示时带删除线） */
  originalPrice?: string | number
  /** 销量 */
  sales?: string | number
  /** 标签数组 */
  tags?: string[]
}

const props = withDefaults(defineProps<ProductCardProps>(), {
  image: '',
  title: '',
  desc: '',
  price: '0.00',
  originalPrice: '',
  sales: '',
  tags: () => [],
})

const emit = defineEmits<{ click: [] }>()

const imgError = ref(false)

// 换图后重置错误态
watch(
  () => props.image,
  () => {
    imgError.value = false
  },
)

function onImgError() {
  imgError.value = true
}

function onClick() {
  emit('click')
}
</script>

<style scoped>
.pc-media {
  width: 100%;
  height: 360rpx;
  background: var(--bg-light, #f5f5f5);
}

.pc-img {
  width: 100%;
  height: 100%;
}

.pc-img--ph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-ph-text {
  font-size: var(--font-sm, 26rpx);
  color: var(--text-tertiary, #a3a3a3);
}

.pc-content {
  padding: var(--space-3, 12rpx);
}

.pc-title {
  font-size: var(--font-md, 28rpx);
  font-weight: 600;
  color: var(--text-primary, #171717);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pc-desc {
  margin-top: var(--space-2, 8rpx);
  font-size: var(--font-sm, 26rpx);
  color: var(--text-secondary, #525252);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pc-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-3, 12rpx);
}

.pc-price {
  display: flex;
  align-items: baseline;
}

.pc-price-symbol {
  font-size: var(--font-sm, 26rpx);
  color: var(--color-error, #EF4444);
}

.pc-price-value {
  font-size: var(--font-xl, 32rpx);
  font-weight: 600;
  color: var(--color-error, #EF4444);
}

.pc-price-original {
  margin-left: var(--space-2, 8rpx);
  font-size: var(--font-xs, 24rpx);
  color: var(--text-tertiary, #a3a3a3);
  text-decoration: line-through;
}

.pc-sales {
  font-size: var(--font-xs, 24rpx);
  color: var(--text-secondary, #525252);
}

.pc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 8rpx);
  margin-top: var(--space-3, 12rpx);
}

.pc-tag {
  padding: var(--space-2, 8rpx);
  font-size: var(--font-2xs, 20rpx);
  color: var(--color-error, #EF4444);
  background: var(--bg-light, #f5f5f5);
  border-radius: var(--radius-tag, 8rpx);
}
</style>
