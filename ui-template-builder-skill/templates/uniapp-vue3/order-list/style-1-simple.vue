<template>
  <view class="order-list-page">
    <!-- 页面标题 -->
    <view class="order-header">
      <text>我的订单</text>
    </view>

    <!-- 状态 Tabs -->
    <scroll-view class="order-tabs" scroll-x enhanced :show-scrollbar="false">
      <view class="tabs-wrapper">
        <view
          class="order-tab"
          :class="{ active: activeTab === tab.value }"
          v-for="(tab, index) in tabs"
          :key="tab.value"
          @click="switchTab(tab.value)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view
        class="order-card"
        v-for="(order, index) in filteredOrders"
        :key="order.id"
        @click="goDetail(order)"
      >
        <view class="card-header">
          <view class="shop-info">
            <text class="shop-name">{{ order.shopName }}</text>
          </view>
          <text class="order-status">{{ order.statusText }}</text>
        </view>

        <view
          class="order-item"
          v-for="(item, itemIndex) in order.items"
          :key="item.id"
        >
          <image class="order-image" :src="item.image" mode="aspectFill" />
          <view class="order-info">
            <text class="order-title">{{ item.name }}</text>
            <text class="order-spec" v-if="item.specs">{{ item.specs }}</text>
            <text class="order-price">¥{{ formatPrice(item.price) }} × {{ item.quantity }}</text>
          </view>
        </view>

        <view class="order-total">
          <text>共{{ order.totalCount }}件 合计：<text class="total-amount">¥{{ formatPrice(order.totalAmount) }}</text></text>
        </view>

        <view class="order-actions">
          <view
            class="order-btn"
            :class="{ 'order-btn-primary': action.primary }"
            v-for="(action, actionIndex) in order.actions"
            :key="actionIndex"
            @click.stop="handleAction(order, action)"
          >
            <text>{{ action.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredOrders.length === 0">
      <text class="empty-text">暂无{{ activeTabLabel }}订单</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('all')

const tabs = ref([
  { value: 'all', label: '全部' },
  { value: 'pendingPay', label: '待付款' },
  { value: 'pendingShip', label: '待发货' },
  { value: 'pendingReceive', label: '待收货' },
  { value: 'completed', label: '已完成' }
])

const orderList = ref([
  {
    id: 'o001',
    orderNo: '202401151234567890',
    status: 'pendingReceive',
    statusText: '待收货',
    shopName: 'Apple官方旗舰店',
    totalCount: 1,
    totalAmount: 9999,
    items: [
      {
        id: 'i001',
        name: 'Apple/苹果 iPhone 15 Pro Max 256GB 原色钛金属',
        image: 'https://picsum.photos/200/200?random=1',
        specs: '原色钛金属；256GB；官方标配',
        price: 9999,
        quantity: 1
      }
    ],
    actions: [
      { label: '查看物流', primary: false },
      { label: '确认收货', primary: true }
    ]
  },
  {
    id: 'o002',
    orderNo: '202401161234567890',
    status: 'pendingShip',
    statusText: '待发货',
    shopName: 'Apple官方旗舰店',
    totalCount: 1,
    totalAmount: 1899,
    items: [
      {
        id: 'i002',
        name: 'AirPods Pro 第二代 主动降噪无线蓝牙耳机',
        image: 'https://picsum.photos/200/200?random=3',
        specs: '白色；官方标配',
        price: 1899,
        quantity: 1
      }
    ],
    actions: [
      { label: '提醒发货', primary: false },
      { label: '申请退款', primary: false }
    ]
  },
  {
    id: 'o003',
    orderNo: '202401171234567890',
    status: 'pendingPay',
    statusText: '待付款',
    shopName: '小米官方旗舰店',
    totalCount: 1,
    totalAmount: 5499,
    items: [
      {
        id: 'i003',
        name: '小米14 Pro 16GB+512GB 黑色 徕卡影像 5G手机',
        image: 'https://picsum.photos/200/200?random=5',
        specs: '黑色；16GB+512GB',
        price: 5499,
        quantity: 1
      }
    ],
    actions: [
      { label: '取消订单', primary: false },
      { label: '去支付', primary: true }
    ]
  }
])

const activeTabLabel = computed(() => {
  const tab = tabs.value.find(t => t.value === activeTab.value)
  return tab ? tab.label : ''
})

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orderList.value
  return orderList.value.filter(order => order.status === activeTab.value)
})

function formatPrice(price) {
  return price.toLocaleString('zh-CN')
}

function switchTab(value) {
  activeTab.value = value
}

function goDetail(order) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}

function handleAction(order, action) {
  if (action.label === '确认收货') {
    uni.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          uni.showToast({ title: '已确认收货', icon: 'success' })
        }
      }
    })
  } else if (action.label === '去支付') {
    uni.navigateTo({ url: `/pages/payment/pay?orderId=${order.id}` })
  } else if (action.label === '提醒发货') {
    uni.showToast({ title: '已提醒卖家发货', icon: 'success' })
  } else if (action.label === '申请退款') {
    uni.navigateTo({ url: `/pages/order/refund?id=${order.id}` })
  } else if (action.label === '取消订单') {
    uni.showModal({
      title: '取消订单',
      content: '确认取消该订单？',
      success: (res) => {
        if (res.confirm) {
          uni.showToast({ title: '已取消订单', icon: 'success' })
        }
      }
    })
  } else {
    uni.showToast({ title: action.label, icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  background: #FFFFFF;
  border-bottom: 1px solid #F0F0F0;
  font-size: 15px;
  font-weight: 600;
  color: #333333;
}

.order-tabs {
  background: #FFFFFF;
  border-bottom: 1px solid #F0F0F0;
}

.tabs-wrapper {
  display: flex;
  padding: 0 8px;
}

.order-tab {
  flex-shrink: 0;
  padding: 12px 14px;
  font-size: 13px;
  color: #666666;
  position: relative;

  &.active {
    color: #FF2D55;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: #FF2D55;
      border-radius: 1px;
    }
  }
}

.order-list {
  padding: 10px 12px;
}

.order-card {
  background: #FFFFFF;
  margin-bottom: 10px;
  border-radius: 8px;
  padding: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.shop-name {
  font-size: 13px;
  font-weight: 600;
  color: #333333;
}

.order-status {
  font-size: 12px;
  color: #FF2D55;
}

.order-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F7;

  &:last-child {
    border-bottom: none;
  }
}

.order-image {
  width: 70px;
  height: 70px;
  border-radius: 6px;
  object-fit: cover;
  background: #F5F5F5;
  flex-shrink: 0;
}

.order-info {
  flex: 1;
  min-width: 0;
}

.order-title {
  font-size: 12px;
  color: #333333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 4px;
}

.order-spec {
  font-size: 11px;
  color: #999999;
  margin-bottom: 6px;
}

.order-price {
  font-size: 12px;
  color: #999999;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
  font-size: 12px;
  color: #666666;
  border-bottom: 1px solid #F5F5F7;
}

.total-amount {
  color: #FF2D55;
  font-size: 14px;
  font-weight: 600;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 10px;
}

.order-btn {
  min-width: 72px;
  padding: 5px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 14px;
  font-size: 12px;
  color: #666666;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.order-btn-primary {
    border-color: #FF2D55;
    color: #FF2D55;
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-text {
  font-size: 14px;
  color: #999999;
}
</style>
