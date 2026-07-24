<template>
  <view class="product-list-page">
    <!-- 顶部标题栏 -->
    <view class="list-header">
      <text class="header-title">商品列表</text>
      <view class="header-icon" @click="showMenu">
        <text>☰</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-item"
        :class="{ active: activeFilter === 'comprehensive' }"
        @click="setFilter('comprehensive')"
      >
        <text>综合</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeFilter === 'sales' }"
        @click="setFilter('sales')"
      >
        <text>销量</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeFilter === 'price', desc: priceDesc }"
        @click="togglePriceSort"
      >
        <text>价格</text>
        <view class="sort-arrows">
          <text class="arrow" :class="{ active: activeFilter === 'price' && !priceDesc }">▲</text>
          <text class="arrow" :class="{ active: activeFilter === 'price' && priceDesc }">▼</text>
        </view>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeFilter === 'new' }"
        @click="setFilter('new')"
      >
        <text>新品</text>
      </view>
      <view class="filter-item filter-more" @click="showFilterPanel"
      >
        <text>筛选</text>
        <text class="filter-arrow">▾</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="state-loading">
      <text class="state-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="state-error" @click="handleRetry">
      <text class="state-text">{{ errorText }}</text>
      <text class="state-action">点击重试</text>
    </view>

    <!-- 商品网格 -->
    <view v-else class="product-grid">
      <view
        class="product-card"
        v-for="(item, index) in filteredList"
        :key="item.id"
        @click="goDetail(item)"
      >
        <image class="product-image" :src="item.image" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <view class="product-price-row">
            <text class="product-price"><text class="price-symbol">¥</text>{{ formatPrice(item.price) }}</text>
            <text class="product-original" v-if="item.originalPrice">¥{{ formatPrice(item.originalPrice) }}</text>
          </view>
          <text class="product-sales">已售 {{ formatSales(item.sales) }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!loading && !error && filteredList.length === 0" class="state-empty">
      <text class="state-text">暂无商品</text>
    </view>

    <!-- 底部加载提示 -->
    <view v-if="!loading && !error && filteredList.length > 0" class="load-more">
      <text>{{ loadMoreText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  errorText: { type: String, default: '加载失败，请稍后重试' },
  productList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['retry', 'load-more'])

const activeFilter = ref('comprehensive')
const priceDesc = ref(false)
const loadMoreText = ref('上拉加载更多')

// 默认示例数据（实际项目中应通过 props 传入，并替换为真实业务图片地址）
const defaultProductList = [
  {
    id: 'p001',
    name: 'Apple/苹果 iPhone 15 Pro Max 256GB 原色钛金属',
    image: 'https://picsum.photos/300/300?random=1',
    price: 9999,
    originalPrice: 10999,
    sales: 12580
  },
  {
    id: 'p002',
    name: 'iPhone 15 Pro 128GB 钛金属 支持移动联通电信5G',
    image: 'https://picsum.photos/300/300?random=2',
    price: 7999,
    originalPrice: 8999,
    sales: 8560
  },
  {
    id: 'p003',
    name: 'AirPods Pro 第二代 主动降噪无线蓝牙耳机',
    image: 'https://picsum.photos/300/300?random=3',
    price: 1899,
    originalPrice: 1999,
    sales: 56320
  },
  {
    id: 'p004',
    name: 'MagSafe 磁吸充电器 15W快充 适配 iPhone 15',
    image: 'https://picsum.photos/300/300?random=4',
    price: 329,
    originalPrice: 399,
    sales: 23100
  },
  {
    id: 'p005',
    name: '小米14 Pro 16GB+512GB 黑色 徕卡影像 5G手机',
    image: 'https://picsum.photos/300/300?random=5',
    price: 5499,
    originalPrice: 5999,
    sales: 18900
  },
  {
    id: 'p006',
    name: '华为 Mate 60 Pro 12GB+512GB 雅川青 卫星通话',
    image: 'https://picsum.photos/300/300?random=6',
    price: 6999,
    originalPrice: 6999,
    sales: 45200
  }
]

// 优先使用外部传入的数据，兼容默认写死数据
const productList = computed(() => props.productList.length > 0 ? props.productList : defaultProductList)

const filteredList = computed(() => {
  const list = [...productList.value]
  if (activeFilter.value === 'price') {
    list.sort((a, b) => priceDesc.value ? b.price - a.price : a.price - b.price)
  } else if (activeFilter.value === 'sales') {
    list.sort((a, b) => b.sales - a.sales)
  }
  return list
})

function formatPrice(price) {
  return price.toLocaleString('zh-CN')
}

function formatSales(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

function setFilter(type) {
  activeFilter.value = type
  if (type !== 'price') {
    priceDesc.value = false
  }
  uni.showToast({ title: `已切换到${getFilterName(type)}`, icon: 'none' })
}

function togglePriceSort() {
  if (activeFilter.value === 'price') {
    priceDesc.value = !priceDesc.value
  } else {
    activeFilter.value = 'price'
    priceDesc.value = false
  }
}

function getFilterName(type) {
  const map = {
    comprehensive: '综合',
    sales: '销量',
    price: '价格',
    new: '新品'
  }
  return map[type] || '综合'
}

function showFilterPanel() {
  uni.showToast({ title: '打开筛选面板', icon: 'none' })
}

function showMenu() {
  uni.showToast({ title: '更多菜单', icon: 'none' })
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` })
}

function handleRetry() {
  emit('retry')
}

function loadMore() {
  loadMoreText.value = '加载中...'
  emit('load-more', () => {
    loadMoreText.value = '没有更多了'
  })
}
</script>

<style lang="scss" scoped>
.product-list-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 14px;
  background: #FFFFFF;
  border-bottom: 1px solid #F0F0F0;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
}

.header-icon {
  font-size: 20px;
  color: #333333;
}

.filter-bar {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  padding: 10px 14px;
  gap: 20px;
  border-bottom: 1px solid #F0F0F0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: #666666;

  &.active {
    color: #FF2D55;
    font-weight: 600;
  }
}

.sort-arrows {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}

.arrow {
  font-size: 8px;
  line-height: 1;
  color: #CCCCCC;

  &.active {
    color: #FF2D55;
  }
}

.filter-more {
  margin-left: auto;
}

.filter-arrow {
  font-size: 10px;
  margin-left: 2px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px;
}

.product-card {
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #F5F5F5;
}

.product-info {
  padding: 8px;
}

.product-name {
  font-size: 12px;
  color: #333333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 6px;
}

.product-price-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-price {
  font-size: 14px;
  font-weight: 600;
  color: #FF2D55;
}

.price-symbol {
  font-size: 10px;
}

.product-original {
  font-size: 10px;
  color: #999999;
  text-decoration: line-through;
}

.product-sales {
  font-size: 10px;
  color: #999999;
  margin-top: 4px;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-size: 12px;
  color: #999999;
}

// 状态占位样式
.state-loading,
.state-error,
.state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.state-text {
  font-size: 14px;
  color: #999999;
}

.state-action {
  margin-top: 8px;
  font-size: 13px;
  color: #2563EB;
}
</style>
