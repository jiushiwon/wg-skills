<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar" :class="{ solid: navSolid }">
      <view class="nav-left" @click="goBack">
        <view class="nav-btn">
          <view class="icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </view>
        </view>
      </view>
      <view class="nav-tabs" v-if="navSolid">
        <view class="nav-tab" :class="{ active: activeTab === 'detail' }" @click="scrollToTab('detail')">商品</view>
        <view class="nav-tab" :class="{ active: activeTab === 'review' }" @click="scrollToTab('review')">评价</view>
        <view class="nav-tab" :class="{ active: activeTab === 'recommend' }" @click="scrollToTab('recommend')">推荐</view>
      </view>
      <view class="nav-title" v-else>商品详情</view>
      <view class="nav-right">
        <view class="nav-btn" @click="onShare">
          <view class="icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </view>
        </view>
        <view class="nav-btn" style="margin-left: 8px;">
          <view class="icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </view>
        </view>
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="gallery-section">
      <swiper
        class="gallery-swiper"
        indicator-dots
        indicator-active-color="#FF6B6B"
        autoplay
        circular
        interval="3000"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(img, index) in product.images" :key="index">
          <image class="gallery-image" :src="img" mode="aspectFill" @click="previewImage(index)" />
        </swiper-item>
      </swiper>
      <view class="image-indicator" v-if="product.images.length > 1">{{ currentImage + 1 }} / {{ product.images.length }}</view>
      <view class="video-tag" v-if="product.hasVideo">
        <view class="icon-svg icon-small">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </view>
      </view>
    </view>

    <!-- 价格区 -->
    <view class="info-section">
      <view class="price-row">
        <view class="price-main">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ formatPrice(product.price) }}</text>
          <view class="price-tags">
            <view class="price-tag">券后价</view>
          </view>
        </view>
        <view class="price-extra">
          <text class="original-price">价格 ¥{{ formatPrice(product.originalPrice) }}</text>
          <view class="sold-info">已售 {{ formatNumber(product.sales) }}</view>
        </view>
      </view>

      <view class="coupon-row" v-if="product.coupons && product.coupons.length">
        <view class="coupon-item" v-for="(coupon, index) in product.coupons" :key="index">
          <text class="coupon-text">{{ coupon.name }}</text>
        </view>
      </view>

      <view class="title-row">
        <view class="title-content">
          <text class="product-title">{{ product.name }}</text>
          <view class="product-tags">
            <view class="tag" v-for="(tag, index) in product.tags" :key="index">{{ tag }}</view>
          </view>
        </view>
        <view class="favorite-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
          <view class="icon-svg">
            <svg viewBox="0 0 24 24" :fill="isFavorite ? '#FF6B6B' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </view>
          <text class="favorite-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </view>
      </view>

      <view class="meta-row">
        <view class="meta-item">
          <view class="rating-stars">
            <text v-for="n in 5" :key="n" class="star" :class="{ active: n <= Math.round(product.rating) }">★</text>
          </view>
          <text class="meta-text">{{ product.rating }}</text>
        </view>
        <view class="meta-divider"></view>
        <view class="meta-item">
          <text class="meta-text">{{ product.comments }}+ 评价</text>
        </view>
        <view class="meta-divider"></view>
        <view class="meta-item">
          <text class="meta-text">{{ product.goodRate }}% 好评</text>
        </view>
      </view>
    </view>

    <!-- 规格选择 -->
    <view class="cell-section" @click="showSpecPopup">
      <view class="cell-left">
        <text class="cell-label">选择</text>
        <text class="cell-value">{{ selectedSpec }}</text>
      </view>
      <view class="cell-right">
        <view class="icon-svg icon-small">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </view>
      </view>
    </view>

    <!-- 活动/服务 -->
    <view class="service-section">
      <view class="service-item" v-for="(item, index) in services" :key="index">
        <view class="icon-svg icon-small" style="color: #FF6B6B;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            v-html="item.icon"></svg>
        </view>
        <text class="service-text">{{ item.text }}</text>
      </view>
    </view>

    <!-- 店铺信息 -->
    <view class="shop-section">
      <view class="shop-info">
        <view class="shop-logo">
          <image class="shop-logo-img" :src="shop.logo" mode="aspectFill" />
        </view>
        <view class="shop-detail">
          <text class="shop-name">{{ shop.name }}</text>
          <text class="shop-desc">{{ shop.fans }} 人关注 · 好评率 {{ shop.rate }} · {{ shop.goods }} 件商品</text>
        </view>
      </view>
      <view class="shop-actions">
        <view class="shop-btn shop-btn-primary">进店</view>
        <view class="shop-btn">关注</view>
      </view>
    </view>

    <!-- 推荐商品 -->
    <view class="recommend-section">
      <view class="section-header">
        <view class="section-title">看了又看</view>
      </view>
      <scroll-view class="recommend-scroll" scroll-x enhanced :show-scrollbar="false">
        <view class="recommend-list">
          <view class="recommend-item" v-for="(item, index) in recommendList" :key="index">
            <image class="recommend-image" :src="item.image" mode="aspectFill" />
            <text class="recommend-title">{{ item.name }}</text>
            <text class="recommend-price">¥{{ item.price }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Tab 切换 -->
    <view class="tabs-section" id="content-tabs">
      <view class="tabs-bar">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'detail' }"
          @click="switchTab('detail')"
        >
          <text class="tab-text">商品详情</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'review' }"
          @click="switchTab('review')"
        >
          <text class="tab-text">评价晒单</text>
          <text class="tab-count">({{ product.comments }})</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'recommend' }"
          @click="switchTab('recommend')"
        >
          <text class="tab-text">相关推荐</text>
        </view>
      </view>
    </view>

    <!-- 商品详情内容 -->
    <view class="tab-content" v-show="activeTab === 'detail'">
      <view class="detail-params">
        <view class="params-title">规格参数</view>
        <view class="params-list">
          <view class="params-item" v-for="(param, index) in params" :key="index">
            <text class="params-label">{{ param.label }}</text>
            <text class="params-value">{{ param.value }}</text>
          </view>
        </view>
      </view>
      <view class="detail-images">
        <image v-for="(img, index) in detailImages" :key="index" :src="img" mode="widthFix" class="detail-image" />
      </view>
    </view>

    <!-- 评价内容 -->
    <view class="tab-content" v-show="activeTab === 'review'">
      <view class="review-summary">
        <view class="review-rate">
          <text class="rate-value">{{ product.rating }}</text>
          <view class="rate-stars">
            <text v-for="n in 5" :key="n" class="star" :class="{ active: n <= Math.round(product.rating) }">★</text>
          </view>
          <text class="rate-text">{{ product.goodRate }}% 好评</text>
        </view>
        <view class="review-tags">
          <view class="review-tag" v-for="(tag, index) in reviewTags" :key="index">{{ tag.name }} {{ tag.count }}</view>
        </view>
      </view>
      <view class="comment-list">
        <view class="comment-item" v-for="(item, index) in comments" :key="index">
          <view class="comment-user">
            <image class="comment-avatar" :src="item.avatar" mode="aspectFill" />
            <view class="comment-user-info">
              <text class="comment-name">{{ item.userName }}</text>
              <view class="comment-rating">
                <text v-for="n in 5" :key="n" class="star" :class="{ active: n <= item.score }">★</text>
              </view>
            </view>
          </view>
          <text class="comment-content">{{ item.content }}</text>
          <view class="comment-images" v-if="item.images && item.images.length">
            <image
              v-for="(img, imgIndex) in item.images"
              :key="imgIndex"
              class="comment-image"
              :src="img"
              mode="aspectFill"
            />
          </view>
          <view class="comment-meta">
            <text class="comment-spec">{{ item.spec }}</text>
            <text class="comment-date">{{ item.date }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 相关推荐 -->
    <view class="tab-content" v-show="activeTab === 'recommend'">
      <view class="recommend-grid">
        <view class="grid-item" v-for="(item, index) in recommendGrid" :key="index">
          <image class="grid-image" :src="item.image" mode="aspectFill" />
          <text class="grid-title">{{ item.name }}</text>
          <view class="grid-price-row">
            <text class="grid-price">¥{{ item.price }}</text>
            <text class="grid-sales">{{ item.sales }}人付款</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="bottom-left">
        <view class="action-item" @click="contactService">
          <view class="icon-svg icon-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </view>
          <text class="action-label">客服</text>
        </view>

        <view class="action-item" @click="goShop">
          <view class="icon-svg icon-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </view>
          <text class="action-label">店铺</text>
        </view>

        <view class="action-item" @click="goCart">
          <view class="icon-svg icon-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </view>
          <text class="action-label">购物车</text>
          <view v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</view>
        </view>
      </view>

      <view class="bottom-right">
        <view class="btn-cart" @click="addCart">加入购物车</view>
        <view class="btn-buy" @click="buyNow">立即购买</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const systemInfo = uni.getSystemInfoSync()
const safeAreaBottom = ref(systemInfo.safeAreaInsets?.bottom || 0)

const currentImage = ref(0)
const isFavorite = ref(false)
const cartCount = ref(2)
const navSolid = ref(false)
const activeTab = ref('detail')

const product = ref({
  name: 'Apple/苹果 iPhone 15 Pro Max 256GB 原色钛金属 支持移动联通电信5G 双卡双待手机',
  price: 9999,
  originalPrice: 10999,
  sales: 12580,
  rating: 4.9,
  comments: 3280,
  goodRate: 98,
  hasVideo: true,
  tags: ['官方正品', '顺丰包邮', '分期免息'],
  coupons: [
    { name: '满8000减500', value: 500 },
    { name: '12期免息', value: 0 }
  ],
  images: [
    'https://picsum.photos/750/750?random=1',
    'https://picsum.photos/750/750?random=2',
    'https://picsum.photos/750/750?random=3',
    'https://picsum.photos/750/750?random=4'
  ]
})

const selectedSpec = ref('原色钛金属 / 256GB / 官方标配')

const shop = ref({
  name: 'Apple官方旗舰店',
  logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=apple',
  fans: '856万',
  rate: '99%',
  goods: 126
})

const services = ref([
  { icon: '<polyline points="20 6 9 17 4 12" />', text: '正品保证' },
  { icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />', text: '7天无理由' },
  { icon: '<rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />', text: '信用卡分期' },
  { icon: '<circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" />', text: '运费险' }
])

const recommendList = ref([
  { name: 'iPhone 15 Pro 128GB', price: 7999, image: 'https://picsum.photos/200/200?random=11' },
  { name: 'AirPods Pro 2', price: 1899, image: 'https://picsum.photos/200/200?random=12' },
  { name: 'MagSafe 充电器', price: 329, image: 'https://picsum.photos/200/200?random=13' },
  { name: '硅胶保护壳', price: 399, image: 'https://picsum.photos/200/200?random=14' }
])

const params = ref([
  { label: '品牌', value: 'Apple/苹果' },
  { label: '型号', value: 'iPhone 15 Pro Max' },
  { label: '机身颜色', value: '原色钛金属' },
  { label: '存储容量', value: '256GB' },
  { label: '屏幕尺寸', value: '6.7英寸' },
  { label: '网络类型', value: '5G全网通' }
])

const reviewTags = ref([
  { name: '拍照清晰', count: 1234 },
  { name: '运行流畅', count: 986 },
  { name: '续航不错', count: 756 },
  { name: '手感好', count: 543 }
])

const comments = ref([
  {
    userName: '用户***8',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8',
    score: 5,
    content: '手机非常好用，拍照清晰，运行流畅，钛金属质感很棒，物流也很快！',
    images: ['https://picsum.photos/150/150?random=21', 'https://picsum.photos/150/150?random=22'],
    spec: '原色钛金属；256GB',
    date: '2024-01-15'
  },
  {
    userName: '用户***2',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    score: 5,
    content: '是正品，包装完整，发货速度快，客服态度很好，会回购。',
    images: [],
    spec: '原色钛金属；256GB',
    date: '2024-01-14'
  }
])

const recommendGrid = ref([
  { name: 'iPhone 15 Pro 保护壳', price: 399, sales: 2300, image: 'https://picsum.photos/300/300?random=31' },
  { name: 'MagSafe 磁吸充电宝', price: 749, sales: 1800, image: 'https://picsum.photos/300/300?random=32' },
  { name: 'AirPods Pro 第二代', price: 1899, sales: 5600, image: 'https://picsum.photos/300/300?random=33' },
  { name: 'USB-C 充电线', price: 145, sales: 12000, image: 'https://picsum.photos/300/300?random=34' }
])

const detailImages = ref([
  'https://picsum.photos/750/1000?random=41',
  'https://picsum.photos/750/1000?random=42',
  'https://picsum.photos/750/1000?random=43'
])

function formatPrice(price) {
  return price.toLocaleString('zh-CN')
}

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

function onSwiperChange(e) {
  currentImage.value = e.detail.current
}

function previewImage(index) {
  uni.previewImage({
    current: product.value.images[index],
    urls: product.value.images
  })
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
}

function showSpecPopup() {
  uni.showToast({ title: '选择规格', icon: 'none' })
}

function goBack() {
  uni.navigateBack()
}

function onShare() {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

function goShop() {
  uni.navigateTo({ url: '/pages/shop/index' })
}

function goCart() {
  uni.switchTab({ url: '/pages/cart/index' })
}

function contactService() {
  uni.showToast({ title: '联系客服', icon: 'none' })
}

function addCart() {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

function buyNow() {
  uni.navigateTo({ url: '/pages/order/confirm' })
}

function switchTab(tab) {
  activeTab.value = tab
}

function scrollToTab(tab) {
  activeTab.value = tab
  // 滚动到 tabs 位置
}

onMounted(() => {
  // 监听滚动，切换导航栏样式
})
</script>

<style lang="scss" scoped>
.page-container {
  --primary: #FF6B6B;
  --primaryLight: #FF8E53;
  --gradientEnd: #FF8E53;
  --tagBg: #FFF0F0;
  --couponStart: #FFF5F5;
  --bg: #FFF5F5;
  --surface: #FFFFFF;
  --surfaceSecondary: #FFF9F0;
  --border: #FFE4E4;
  --textPrimary: #1A1A1A;
  --textSecondary: #666666;
  --textTertiary: #999999;
  --textInverse: #FFFFFF;
  --starActive: #FF8E53;
  --navSolidBg: rgba(255, 255, 255, 0.98);
  --cardRadius: 16px;
  --shadowMd: 0 4px 16px rgba(255, 107, 107, 0.2);
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 90px;
}

/* 图标基础 */
.icon-svg {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;

  svg {
    width: 100%;
    height: 100%;
  }
}

.icon-small {
  width: 16px;
  height: 16px;
}

.icon-action {
  width: 22px;
  height: 22px;
  color: var(--textSecondary);
}

/* 导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  z-index: 100;
  background: transparent;
  transition: background 0.3s ease;

  &.solid {
    background: var(--navSolidBg);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
}

.nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.4);
  color: var(--textInverse);

  .nav-bar.solid & {
    background: rgba(0, 0, 0, 0.06);
    color: var(--textPrimary);
  }
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--textInverse);
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);

  .nav-bar.solid & {
    color: var(--textPrimary);
    text-shadow: none;
  }
}

.nav-tabs {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-tab {
  position: relative;
  font-size: 15px;
  color: var(--textSecondary);
  padding: 4px 0;

  &.active {
    color: var(--textPrimary);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background: var(--primary);
      border-radius: 2px;
    }
  }
}

/* 轮播图 */
.gallery-section {
  position: relative;
  padding-top: 0;
  background: var(--surface);
}

.gallery-swiper {
  height: 375px;
}

.gallery-image {
  width: 100%;
  height: 100%;
}

.image-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  font-size: 12px;
  color: var(--textInverse);
}

.video-tag {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 18px;
  color: var(--textInverse);
}

/* 信息区 */
.info-section {
  background: var(--surface);
  padding: 12px 16px 16px;
  margin-bottom: 10px;
}

.price-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-symbol {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
}

.price-tags {
  display: flex;
  gap: 6px;
}

.price-tag {
  padding: 2px 8px;
  background: var(--tagBg);
  border-radius: 4px;
  font-size: 11px;
  color: var(--primary);
}

.price-extra {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.original-price {
  font-size: 12px;
  color: var(--textTertiary);
  text-decoration: line-through;
}

.sold-info {
  font-size: 12px;
  color: var(--textTertiary);
}

.coupon-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.coupon-item {
  padding: 4px 10px;
  background: linear-gradient(135deg, #FFF5F5, #FFF0F0);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
  color: var(--primary);
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.title-content {
  flex: 1;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--textPrimary);
  line-height: 1.5;
  margin-bottom: 8px;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 6px;
  background: var(--bg);
  border-radius: 3px;
  font-size: 10px;
  color: var(--textSecondary);
}

.favorite-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--bg);
  min-width: 44px;

  &.active {
    background: var(--tagBg);
    color: var(--primary);
  }
}

.favorite-text {
  margin-top: 2px;
  font-size: 10px;
  color: var(--textSecondary);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-stars {
  display: flex;
  gap: 1px;
}

.star {
  font-size: 12px;
  color: var(--textTertiary);

  &.active {
    color: var(--primaryLight);
  }
}

.meta-text {
  font-size: 12px;
  color: var(--textSecondary);
}

.meta-divider {
  width: 1px;
  height: 12px;
  background: var(--border);
}

/* 单元格 */
.cell-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  padding: 14px 16px;
  margin-bottom: 10px;
}

.cell-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cell-label {
  font-size: 13px;
  color: var(--textTertiary);
  flex-shrink: 0;
}

.cell-value {
  font-size: 13px;
  color: var(--textPrimary);
}

.cell-right {
  color: var(--textTertiary);
}

/* 服务 */
.service-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  background: var(--surface);
  padding: 12px 16px;
  margin-bottom: 10px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.service-text {
  font-size: 11px;
  color: var(--textSecondary);
}

/* 店铺 */
.shop-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  padding: 14px 16px;
  margin-bottom: 10px;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shop-logo {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: var(--bg);
  overflow: hidden;
}

.shop-logo-img {
  width: 100%;
  height: 100%;
}

.shop-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shop-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--textPrimary);
}

.shop-desc {
  font-size: 11px;
  color: var(--textTertiary);
}

.shop-actions {
  display: flex;
  gap: 8px;
}

.shop-btn {
  padding: 5px 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  font-size: 12px;
  color: var(--textSecondary);
}

.shop-btn-primary {
  border-color: var(--primary);
  color: var(--primary);
}

/* 推荐商品横向滚动 */
.recommend-section {
  background: var(--surface);
  padding: 14px 0;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--textPrimary);
}

.recommend-scroll {
  width: 100%;
}

.recommend-list {
  display: flex;
  gap: 10px;
  padding: 0 16px;
}

.recommend-item {
  width: 100px;
  flex-shrink: 0;
}

.recommend-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  background: var(--bg);
}

.recommend-title {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--textPrimary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-price {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

/* Tabs */
.tabs-section {
  background: var(--surface);
  position: sticky;
  top: 44px;
  z-index: 50;
}

.tabs-bar {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 0;
  position: relative;
}

.tab-text {
  font-size: 14px;
  color: var(--textSecondary);
}

.tab-count {
  font-size: 12px;
  color: var(--textTertiary);
}

.tab-item.active {
  .tab-text,
  .tab-count {
    color: var(--textPrimary);
    font-weight: 600;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    background: var(--primary);
    border-radius: 2px;
  }
}

/* Tab 内容 */
.tab-content {
  background: var(--surface);
  margin-bottom: 10px;
}

/* 详情参数 */
.detail-params {
  padding: 16px;
}

.params-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 12px;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.params-item {
  display: flex;
  font-size: 13px;
}

.params-label {
  width: 80px;
  color: var(--textTertiary);
  flex-shrink: 0;
}

.params-value {
  flex: 1;
  color: var(--textPrimary);
}

.detail-images {
  width: 100%;
}

.detail-image {
  width: 100%;
  display: block;
}

/* 评价汇总 */
.review-summary {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.review-rate {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.rate-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primaryLight);
}

.rate-stars {
  display: flex;
  gap: 1px;
}

.rate-text {
  font-size: 12px;
  color: var(--textTertiary);
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.review-tag {
  padding: 4px 10px;
  background: var(--bg);
  border-radius: 12px;
  font-size: 12px;
  color: var(--textSecondary);
}

/* 评价列表 */
.comment-list {
  padding: 0 16px;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: var(--bg);
}

.comment-user-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.comment-name {
  font-size: 13px;
  color: var(--textSecondary);
}

.comment-rating {
  display: flex;
  gap: 1px;
}

.comment-content {
  font-size: 14px;
  color: var(--textPrimary);
  line-height: 1.6;
}

.comment-images {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.comment-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  background: var(--bg);
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 11px;
  color: var(--textTertiary);
}

.comment-spec {
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 推荐网格 */
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: var(--border);
}

.grid-item {
  background: var(--surface);
  padding: 10px;
}

.grid-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  background: var(--bg);
}

.grid-title {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--textPrimary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.grid-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

.grid-sales {
  font-size: 10px;
  color: var(--textTertiary);
}

.bottom-placeholder {
  height: 80px;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 8px 12px;
  z-index: 999;
}

.bottom-left {
  display: flex;
  align-items: center;
  padding-right: 12px;
}

.action-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 2px 4px;
}

.action-label {
  margin-top: 4px;
  font-size: 10px;
  color: var(--textSecondary);
}

.cart-badge {
  position: absolute;
  top: -2px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--primary);
  border-radius: 8px;
  font-size: 10px;
  color: var(--textInverse);
  text-align: center;
  line-height: 16px;
}

.bottom-right {
  flex: 1;
  display: flex;
  gap: 8px;
}

.btn-cart,
.btn-buy {
  flex: 1;
  min-width: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  color: var(--textInverse);
  padding: 0 12px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-cart {
  background: var(--primaryLight);
}

.btn-buy {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
}


/* 卡片圆角 */
.gallery-section,
.info-section,
.cell-section,
.service-section,
.shop-section,
.tabs-section,
.tab-content {
  border-radius: var(--cardRadius);
  box-shadow: var(--shadowMd);
  overflow: hidden;
}

.recommend-section {
  border-radius: var(--cardRadius);
  box-shadow: var(--shadowMd);
}

.tabs-section {
  border-radius: var(--cardRadius) var(--cardRadius) 0 0;
}
</style>
