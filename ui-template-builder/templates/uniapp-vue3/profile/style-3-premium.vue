<template>
  <view class="page-container">
    <!-- 头部 -->
    <view class="profile-header style-premium">
      <view class="header-content">
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <view class="vip-tag">
            <text class="vip-icon">👑</text>
            <text class="vip-text">{{ userInfo.level }}</text>
          </view>
        </view>
      </view>
      <view class="header-decoration"></view>
    </view>

    <!-- 资产卡片 -->
    <view class="asset-card">
      <view class="asset-title">我的资产</view>
      <view class="asset-list">
        <view class="asset-item" v-for="(item, index) in assets" :key="index">
          <text class="asset-value">{{ item.value }}</text>
          <text class="asset-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 订单 -->
    <view class="order-section">
      <view class="section-header">
        <text class="section-title">订单中心</text>
      </view>
      <view class="order-grid">
        <view class="order-item" v-for="(item, index) in orderTypes" :key="index">
          <text class="order-icon">{{ item.icon }}</text>
          <text class="order-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-section">
      <view class="menu-item" v-for="(item, index) in menuItems" :key="index">
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-text">{{ item.label }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
// 通过 props 接收数据，结构参考同目录 mock.json
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({
      avatar: 'https://picsum.photos/200/200',
      nickname: '用户昵称',
      level: '黄金会员'
    })
  },
  assets: {
    type: Array,
    default: () => [
      { label: '余额', value: '¥1,280.00' },
      { label: '积分', value: '28,888' },
      { label: '优惠券', value: '12张' },
      { label: '礼品卡', value: '3张' }
    ]
  },
  orderTypes: {
    type: Array,
    default: () => [
      { icon: '💳', label: '待付款' },
      { icon: '📦', label: '待发货' },
      { icon: '🚚', label: '待收货' },
      { icon: '⭐', label: '待评价' },
      { icon: '🔄', label: '退款/售后' }
    ]
  },
  menuItems: {
    type: Array,
    default: () => [
      { icon: '🎫', label: '优惠券' },
      { icon: '⭐', label: '我的收藏' },
      { icon: '📍', label: '收货地址' },
      { icon: '💳', label: '银行卡' },
      { icon: '🚚', label: '物流查询' },
      { icon: '🎧', label: '客服中心' }
    ]
  }
})
</script>

<style lang="scss" scoped>
/* 风格3：高端商务 - 深色背景，金色点缀 */
.page-container {
  min-height: 100vh;
  background: #0A0A12;
}

.profile-header {
  position: relative;
  padding: 60px 20px 40px;
  background: #12121F;
  overflow: hidden;

  .header-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 36px;
    border: 2px solid #D4AF37;
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
  }

  .user-info {
    margin-left: 16px;
  }

  .nickname {
    font-size: 22px;
    font-weight: 600;
    color: #FFFFFF;
  }

  .vip-tag {
    display: inline-flex;
    align-items: center;
    margin-top: 8px;
    padding: 4px 14px;
    background: linear-gradient(135deg, #D4AF37 0%, #E5C76B 100%);
    border-radius: 12px;

    .vip-icon {
      font-size: 12px;
    }

    .vip-text {
      margin-left: 4px;
      font-size: 12px;
      color: #12121F;
      font-weight: 600;
    }
  }

  .header-decoration {
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  }
}

/* 资产卡片 */
.asset-card {
  margin: 16px;
  padding: 20px;
  background: #16162A;
  border-radius: 16px;
  border: 1px solid #2A2A40;

  .asset-title {
    font-size: 15px;
    font-weight: 500;
    color: #D4AF37;
    margin-bottom: 20px;
  }

  .asset-list {
    display: flex;
  }

  .asset-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    &:not(:last-child) {
      border-right: 1px solid #2A2A40;
    }
  }

  .asset-value {
    font-size: 18px;
    font-weight: 600;
    color: #FFFFFF;
  }

  .asset-label {
    margin-top: 6px;
    font-size: 12px;
    color: #8888A0;
  }
}

/* 订单区域 */
.order-section {
  margin: 0 16px 16px;
  background: #16162A;
  border-radius: 16px;
  border: 1px solid #2A2A40;
  overflow: hidden;

  .section-header {
    padding: 16px;
    border-bottom: 1px solid #2A2A40;
  }

  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #FFFFFF;
  }

  .order-grid {
    display: flex;
    padding: 20px 0;
  }

  .order-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .order-icon {
    font-size: 24px;
  }

  .order-label {
    margin-top: 8px;
    font-size: 12px;
    color: #B8B8C8;
  }
}

/* 菜单区域 */
.menu-section {
  margin: 0 16px;
  background: #16162A;
  border-radius: 16px;
  border: 1px solid #2A2A40;
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 16px;
    border-bottom: 1px solid #2A2A40;

    &:last-child {
      border-bottom: none;
    }
  }

  .menu-left {
    display: flex;
    align-items: center;
  }

  .menu-icon {
    font-size: 20px;
    margin-right: 12px;
  }

  .menu-text {
    font-size: 14px;
    color: #E5E5F0;
  }

  .menu-arrow {
    font-size: 18px;
    color: #6666880;
  }
}
</style>
