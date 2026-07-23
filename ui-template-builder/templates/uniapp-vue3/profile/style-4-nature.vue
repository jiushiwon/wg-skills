<template>
  <view class="page-container">
    <!-- 头部 -->
    <view class="profile-header style-nature">
      <view class="header-content">
        <view class="avatar-wrap">
          <image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
          <view class="avatar-edit">
            <text>✏️</text>
          </view>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <text class="user-id">ID: 888888</text>
        </view>
      </view>
    </view>

    <!-- 会员卡 -->
    <view class="member-card">
      <view class="member-bg">
        <view class="member-content">
          <view class="member-top">
            <text class="member-level">🌿 {{ memberCard.level }}</text>
            <text class="member-rights">{{ memberCard.rights }}</text>
          </view>
          <view class="member-stats">
            <view class="member-stat">
              <text class="ms-value">{{ memberCard.points }}</text>
              <text class="ms-label">积分</text>
            </view>
            <view class="member-stat">
              <text class="ms-value">{{ memberCard.coupons }}</text>
              <text class="ms-label">优惠券</text>
            </view>
            <view class="member-stat">
              <text class="ms-value">{{ memberCard.balance }}</text>
              <text class="ms-label">余额</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单 -->
    <view class="order-card">
      <view class="card-header">
        <text class="card-title">我的订单</text>
        <text class="card-more">全部 ›</text>
      </view>
      <view class="order-types">
        <view class="type-item" v-for="(item, index) in orderTypes" :key="index">
          <view class="type-icon-box">
            <text class="type-icon">{{ item.icon }}</text>
          </view>
          <text class="type-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-card">
      <view class="menu-item" v-for="(item, index) in menuItems" :key="index">
        <view class="menu-left">
          <view class="menu-icon-box">
            <text class="menu-icon">{{ item.icon }}</text>
          </view>
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
  memberCard: {
    type: Object,
    default: () => ({
      level: '绿卡会员',
      rights: '享9折优惠',
      points: '1,280',
      coupons: '5',
      balance: '¥128'
    })
  },
  orderTypes: {
    type: Array,
    default: () => [
      { icon: '💰', label: '待付款' },
      { icon: '📦', label: '待发货' },
      { icon: '🚚', label: '待收货' },
      { icon: '✅', label: '已完成' },
      { icon: '💳', label: '退款售后' }
    ]
  },
  menuItems: {
    type: Array,
    default: () => [
      { icon: '🎫', label: '优惠券' },
      { icon: '📍', label: '收货地址' },
      { icon: '🔔', label: '消息通知' },
      { icon: '⚙️', label: '设置' },
      { icon: '❓', label: '帮助中心' }
    ]
  }
})
</script>

<style lang="scss" scoped>
/* 风格4：清新自然 - 浅绿背景，圆角卡片 */
.page-container {
  min-height: 100vh;
  background: #F5FBF8;
}

.profile-header {
  padding: 50px 20px 30px;
  background: linear-gradient(180deg, #E8F5E9 0%, #F5FBF8 100%);

  .header-content {
    display: flex;
    align-items: center;
  }

  .avatar-wrap {
    position: relative;
  }

  .avatar {
    width: 68px;
    height: 68px;
    border-radius: 34px;
    border: 3px solid #FFFFFF;
    box-shadow: 0 4px 16px rgba(46, 204, 113, 0.15);
  }

  .avatar-edit {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 22px;
    height: 22px;
    background: #2ECC71;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }

  .user-info {
    margin-left: 14px;
  }

  .nickname {
    font-size: 21px;
    font-weight: 600;
    color: #1A3D1C;
  }

  .user-id {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: #7CB684;
  }
}

/* 会员卡 */
.member-card {
  margin: 0 16px 16px;

  .member-bg {
    background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
    border-radius: 20px;
    padding: 3px;
  }

  .member-content {
    background: linear-gradient(135deg, #2ECC71 0%, #1E8449 100%);
    border-radius: 18px;
    padding: 20px;
  }

  .member-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .member-level {
    font-size: 18px;
    font-weight: 600;
    color: #FFFFFF;
  }

  .member-rights {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 10px;
    border-radius: 10px;
  }

  .member-stats {
    display: flex;
  }

  .member-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    &:not(:last-child) {
      border-right: 1px solid rgba(255, 255, 255, 0.3);
    }
  }

  .ms-value {
    font-size: 18px;
    font-weight: 700;
    color: #FFFFFF;
  }

  .ms-label {
    margin-top: 4px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
  }
}

/* 订单卡片 */
.order-card {
  margin: 0 16px 16px;
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 2px 16px rgba(46, 204, 113, 0.08);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 16px 14px;
    border-bottom: 1px solid #F0F9F4;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1A3D1C;
  }

  .card-more {
    font-size: 13px;
    color: #7CB684;
  }

  .order-types {
    display: flex;
    padding: 16px 0;
  }

  .type-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .type-icon-box {
    width: 44px;
    height: 44px;
    background: #E8F5E9;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .type-icon {
    font-size: 22px;
  }

  .type-label {
    margin-top: 8px;
    font-size: 12px;
    color: #2D5A3D;
  }
}

/* 菜单卡片 */
.menu-card {
  margin: 0 16px;
  background: #FFFFFF;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(46, 204, 113, 0.08);

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #F5FBF8;

    &:last-child {
      border-bottom: none;
    }
  }

  .menu-left {
    display: flex;
    align-items: center;
  }

  .menu-icon-box {
    width: 36px;
    height: 36px;
    background: #F0F9F4;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }

  .menu-icon {
    font-size: 18px;
  }

  .menu-text {
    font-size: 15px;
    color: #1A3D1C;
  }

  .menu-arrow {
    font-size: 18px;
    color: #C8E6C9;
  }
}
</style>
