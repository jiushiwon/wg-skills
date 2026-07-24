<template>
  <view class="page-container">
    <!-- 头部 -->
    <view class="profile-header style-vibrant">
      <view class="header-content">
        <view class="user-row">
          <image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
          <view class="user-info">
            <text class="nickname">{{ userInfo.nickname }}</text>
            <view class="level-badge">
              <text class="level-text">{{ userInfo.level }}</text>
            </view>
          </view>
        </view>
        <view class="stats-row">
          <view class="stat-item" v-for="(item, index) in stats" :key="index">
            <text class="stat-value">{{ item.value }}</text>
            <text class="stat-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单区域 -->
    <view class="order-card">
      <view class="card-header">
        <text class="card-title">我的订单</text>
        <view class="card-more">
          <text>全部</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view class="order-types">
        <view class="type-item" v-for="(item, index) in orderTypes" :key="index">
          <view class="type-icon-wrap">
            <text class="type-icon">{{ item.icon }}</text>
            <view v-if="item.badge" class="type-badge">{{ item.badge }}</view>
          </view>
          <text class="type-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-card">
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
  stats: {
    type: Array,
    default: () => [
      { label: '待付款', value: 2 },
      { label: '待发货', value: 1 },
      { label: '待收货', value: 3 },
      { label: '已完成', value: 28 }
    ]
  },
  orderTypes: {
    type: Array,
    default: () => [
      { icon: '💰', label: '待付款', badge: 2 },
      { icon: '📦', label: '待发货', badge: 1 },
      { icon: '🚚', label: '待收货', badge: 0 },
      { icon: '⭐', label: '评价', badge: 0 },
      { icon: '🔄', label: '退款', badge: 0 }
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
/* 风格2：活力炫彩 - 渐变头部，卡片布局 */
.page-container {
  min-height: 100vh;
  background: #F8F8FF;
}

.profile-header {
  padding: 50px 20px 30px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFB347 100%);
  border-radius: 0 0 24px 24px;

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .user-row {
    display: flex;
    align-items: center;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 32px;
    border: 3px solid rgba(255, 255, 255, 0.5);
  }

  .user-info {
    margin-left: 14px;
  }

  .nickname {
    font-size: 22px;
    font-weight: 700;
    color: #FFFFFF;
  }

  .level-badge {
    display: inline-block;
    margin-top: 6px;
    padding: 3px 12px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 12px;

    .level-text {
      font-size: 12px;
      color: #FFFFFF;
      font-weight: 500;
    }
  }

  .stats-row {
    display: flex;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 16px 0;

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
        height: 24px;
        background: rgba(255, 255, 255, 0.3);
      }
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .stat-label {
      margin-top: 4px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

/* 订单卡片 */
.order-card {
  margin: 20px 16px 16px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.08);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #FFF5F5;
  }

  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: #333333;
  }

  .card-more {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #999999;

    .arrow {
      margin-left: 4px;
      font-size: 18px;
    }
  }

  .order-types {
    display: flex;
    padding: 20px 0 12px;
  }

  .type-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .type-icon-wrap {
    position: relative;
  }

  .type-icon {
    font-size: 26px;
  }

  .type-badge {
    position: absolute;
    top: -4px;
    right: -8px;
    min-width: 15px;
    height: 15px;
    padding: 0 4px;
    background: #FF4400;
    border-radius: 7px;
    font-size: 10px;
    color: #FFFFFF;
    text-align: center;
    line-height: 15px;
  }

  .type-label {
    margin-top: 8px;
    font-size: 12px;
    color: #666666;
  }
}

/* 菜单卡片 */
.menu-card {
  margin: 0 16px;
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.08);

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #FFF8F8;

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
    font-size: 15px;
    color: #333333;
  }

  .menu-arrow {
    font-size: 18px;
    color: #CCCCCC;
  }
}
</style>
