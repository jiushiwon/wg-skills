<template>
  <view class="cart-page">
    <!-- 顶部标题栏 -->
    <view class="cart-header">
      <text class="header-title">购物车({{ totalCount }})</text>
      <text class="header-action" @click="toggleEdit">{{ isEdit ? '完成' : '管理' }}</text>
    </view>

    <!-- 购物车列表 -->
    <view class="cart-list">
      <view class="shop-group" v-for="(shop, shopIndex) in cartList" :key="shop.shopId">
        <view class="shop-name" @click="toggleShop(shopIndex)">
          <view class="checkbox" :class="{ checked: shop.checked }"></view>
          <text>{{ shop.shopName }}</text>
        </view>

        <view class="cart-item" v-for="(item, itemIndex) in shop.products" :key="item.id">
          <view class="checkbox" :class="{ checked: item.checked }" @click="toggleItem(shopIndex, itemIndex)"></view>
          <image class="item-image" :src="item.image" mode="aspectFill" />
          <view class="item-info">
            <text class="item-title">{{ item.name }}</text>
            <text class="item-spec" @click="showSpecPopup(shopIndex, itemIndex)">{{ item.specs }}</text>
            <view class="item-bottom">
              <text class="item-price"><text class="price-symbol">¥</text>{{ formatPrice(item.price) }}</text>
              <view class="quantity">
                <view class="qty-btn" @click="decrease(shopIndex, itemIndex)">-</view>
                <text class="qty-value">{{ item.quantity }}</text>
                <view class="qty-btn" @click="increase(shopIndex, itemIndex)">+</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="cart-bottom" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="select-all" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: allChecked }"></view>
        <text>全选</text>
      </view>
      <view class="total-section" v-if="!isEdit">
        <text class="total-price">合计：<text class="total-amount">¥{{ formatPrice(totalAmount) }}</text></text>
        <view class="settlement-btn" @click="settlement">去结算({{ selectedCount }})</view>
      </view>
      <view class="edit-actions" v-else>
        <view class="delete-btn" @click="deleteSelected">删除</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const systemInfo = uni.getSystemInfoSync()
const safeAreaBottom = ref(systemInfo.safeAreaInsets?.bottom || 0)

const isEdit = ref(false)

const cartList = ref([
  {
    shopId: 's001',
    shopName: 'Apple官方旗舰店',
    checked: true,
    products: [
      {
        id: 'p001',
        name: 'Apple/苹果 iPhone 15 Pro Max 256GB 原色钛金属',
        image: 'https://picsum.photos/200/200?random=1',
        specs: '原色钛金属；256GB；官方标配',
        price: 9999,
        quantity: 1,
        stock: 99,
        checked: true
      },
      {
        id: 'p002',
        name: 'AirPods Pro 第二代 主动降噪无线蓝牙耳机',
        image: 'https://picsum.photos/200/200?random=3',
        specs: '白色；官方标配',
        price: 1899,
        quantity: 1,
        stock: 99,
        checked: true
      }
    ]
  },
  {
    shopId: 's002',
    shopName: '小米官方旗舰店',
    checked: false,
    products: [
      {
        id: 'p003',
        name: '小米14 Pro 16GB+512GB 黑色 5G手机',
        image: 'https://picsum.photos/200/200?random=5',
        specs: '黑色；16GB+512GB',
        price: 5499,
        quantity: 1,
        stock: 50,
        checked: false
      }
    ]
  }
])

const totalCount = computed(() => {
  return cartList.value.reduce((sum, shop) => sum + shop.products.length, 0)
})

const selectedCount = computed(() => {
  return cartList.value.reduce((sum, shop) => {
    return sum + shop.products.filter(item => item.checked).reduce((s, item) => s + item.quantity, 0)
  }, 0)
})

const totalAmount = computed(() => {
  return cartList.value.reduce((sum, shop) => {
    return sum + shop.products.filter(item => item.checked).reduce((s, item) => s + item.price * item.quantity, 0)
  }, 0)
})

const allChecked = computed(() => {
  if (cartList.value.length === 0) return false
  return cartList.value.every(shop =>
    shop.checked && shop.products.every(item => item.checked)
  )
})

function formatPrice(price) {
  return price.toLocaleString('zh-CN')
}

function toggleEdit() {
  isEdit.value = !isEdit.value
}

function toggleShop(shopIndex) {
  const shop = cartList.value[shopIndex]
  shop.checked = !shop.checked
  shop.products.forEach(item => {
    item.checked = shop.checked
  })
}

function toggleItem(shopIndex, itemIndex) {
  const item = cartList.value[shopIndex].products[itemIndex]
  item.checked = !item.checked
  const shop = cartList.value[shopIndex]
  shop.checked = shop.products.every(i => i.checked)
}

function toggleSelectAll() {
  const newValue = !allChecked.value
  cartList.value.forEach(shop => {
    shop.checked = newValue
    shop.products.forEach(item => {
      item.checked = newValue
    })
  })
}

function increase(shopIndex, itemIndex) {
  const item = cartList.value[shopIndex].products[itemIndex]
  if (item.quantity < item.stock) {
    item.quantity += 1
  } else {
    uni.showToast({ title: '已达库存上限', icon: 'none' })
  }
}

function decrease(shopIndex, itemIndex) {
  const item = cartList.value[shopIndex].products[itemIndex]
  if (item.quantity > 1) {
    item.quantity -= 1
  }
}

function showSpecPopup(shopIndex, itemIndex) {
  const item = cartList.value[shopIndex].products[itemIndex]
  uni.showToast({ title: `选择规格：${item.specs}`, icon: 'none' })
}

function settlement() {
  if (selectedCount.value === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/order/confirm' })
}

function deleteSelected() {
  cartList.value = cartList.value.map(shop => ({
    ...shop,
    products: shop.products.filter(item => !item.checked)
  })).filter(shop => shop.products.length > 0)
  if (cartList.value.length === 0) {
    uni.showToast({ title: '已清空购物车', icon: 'success' })
  }
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 100px;
}

.cart-header {
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

.header-action {
  font-size: 13px;
  color: #666666;
}

.cart-list {
  padding: 10px 12px;
}

.shop-group {
  background: #FFFFFF;
  margin-bottom: 10px;
  border-radius: 8px;
  padding: 12px;
}

.shop-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid #CCCCCC;
  border-radius: 50%;
  flex-shrink: 0;

  &.checked {
    background: #FF2D55;
    border-color: #FF2D55;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 6px;
      width: 4px;
      height: 8px;
      border: 2px solid #FFFFFF;
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }
  }
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }

  .checkbox {
    margin-top: 31px;
  }
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #F5F5F5;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 13px;
  color: #333333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 4px;
}

.item-spec {
  font-size: 11px;
  color: #999999;
  background: #F5F5F5;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #FF2D55;
}

.price-symbol {
  font-size: 11px;
}

.quantity {
  display: flex;
  align-items: center;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666666;
  background: #FFFFFF;
}

.qty-value {
  width: 28px;
  text-align: center;
  font-size: 12px;
  color: #333333;
  border-left: 1px solid #E5E5E5;
  border-right: 1px solid #E5E5E5;
}

.cart-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-top: 1px solid #F0F0F0;
  padding: 8px 12px;
  z-index: 100;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #333333;
}

.total-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-price {
  font-size: 14px;
  color: #333333;
}

.total-amount {
  color: #FF2D55;
  font-size: 16px;
  font-weight: 600;
}

.settlement-btn {
  min-width: 110px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #FF2D55 0%, #FF6B6B 100%);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.delete-btn {
  min-width: 80px;
  padding: 8px 18px;
  background: #FF2D55;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
