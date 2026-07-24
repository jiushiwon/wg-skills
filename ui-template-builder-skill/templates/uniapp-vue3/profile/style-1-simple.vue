<template>
  <view class="page-container">
    <!-- 头部区域 -->
    <view class="profile-header" :class="['style-simple']">
      <view class="header-bg"></view>
      <view class="header-content">
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill" @click="previewAvatar" />
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <view class="level-tag" v-if="userInfo.level">
            <text class="level-icon">⭐</text>
            <text class="level-text">{{ userInfo.level }}</text>
          </view>
        </view>
        <view class="edit-btn" @click="goEdit">
          <text class="edit-icon">✏️</text>
        </view>
      </view>
    </view>

    <!-- 统计区域 -->
    <view class="stats-card">
      <view class="stats-item" v-for="(item, index) in stats" :key="index" @click="goPage(item.path)">
        <text class="stats-value">{{ item.value }}</text>
        <text class="stats-label">{{ item.label }}</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="section-title">
        <text class="title-text">我的订单</text>
        <view class="title-arrow" @click="goOrderList">
          <text>全部</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view class="order-quick">
        <view class="quick-item" v-for="(item, index) in orderTypes" :key="index" @click="goOrderList(item.status)">
          <view class="quick-icon-wrap">
            <text class="quick-icon">{{ item.icon }}</text>
            <view v-if="item.badge" class="quick-badge">{{ item.badge }}</view>
          </view>
          <text class="quick-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-list">
        <view class="menu-item" v-for="(item, index) in menuItems" :key="index" @click="goPage(item.path)">
          <view class="menu-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text class="menu-label">{{ item.label }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
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
      { label: '待付款', value: 2, path: '/pages/order/list?status=0' },
      { label: '待发货', value: 1, path: '/pages/order/list?status=1' },
      { label: '待收货', value: 3, path: '/pages/order/list?status=2' },
      { label: '已完成', value: 28, path: '/pages/order/list?status=3' }
    ]
  },
  orderTypes: {
    type: Array,
    default: () => [
      { icon: '💰', label: '待付款', status: 0, badge: 2 },
      { icon: '📦', label: '待发货', status: 1, badge: 1 },
      { icon: '🚚', label: '待收货', status: 2, badge: 3 },
      { icon: '✅', label: '已完成', status: 3, badge: 0 }
    ]
  },
  menuItems: {
    type: Array,
    default: () => [
      { icon: '🎫', label: '优惠券', path: '/pages/coupon/list' },
      { icon: '⭐', label: '我的收藏', path: '/pages/favorite/list' },
      { icon: '📍', label: '收货地址', path: '/pages/address/list' },
      { icon: '💳', label: '银行卡', path: '/pages/bankcard/list' },
      { icon: '🚚', label: '物流查询', path: '/pages/logistics/list' },
      { icon: '🎧', label: '客服中心', path: '/pages/service/index' }
    ]
  }
})

function previewAvatar() {
  uni.previewImage({ urls: [props.userInfo.avatar] })
}

function goEdit() {
  uni.navigateTo({ url: '/pages/profile/edit' })
}

function goPage(path) {
  uni.navigateTo({ url: path })
}

function goOrderList(status) {
  uni.navigateTo({ url: `/pages/order/list?status=${status || 0}` })
}
</script>

<style lang="scss" scoped>
/* 风格1：简约现代 - 白色背景，线性图标 */
.page-container {
  min-height: 100vh;
  background: #F5F5F5;
}

.profile-header {
  position: relative;
  height: 200px;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 160px;
    background: linear-gradient(180deg, #667EEA 0%, #764BA2 100%);
  }

  .header-content {
    position: relative;
    display: flex;
    align-items: center;
    padding: 60px 20px 20px;
  }

  .avatar {
    width: 70px;
    height: 70px;
    border-radius: 35px;
    border: 3px solid #FFFFFF;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .user-info {
    flex: 1;
    margin-left: 16px;
  }

  .nickname {
    font-size: 20px;
    font-weight: 600;
    color: #FFFFFF;
  }

  .level-tag {
    display: inline-flex;
    align-items: center;
    margin-top: 6px;
    padding: 2px 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;

    .level-icon {
      font-size: 12px;
    }

    .level-text {
      margin-left: 4px;
      font-size: 12px;
      color: #FFFFFF;
    }
  }

  .edit-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 18px;
  }
}

/* 统计卡片 */
.stats-card {
  display: flex;
  margin: -30px 16px 16px;
  padding: 20px 0;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  .stats-item {
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
      height: 30px;
      background: #E5E5E5;
    }
  }

  .stats-value {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
  }

  .stats-label {
    margin-top: 4px;
    font-size: 12px;
    color: #999999;
  }
}

/* 菜单区块 */
.menu-section {
  margin: 0 16px 16px;
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;

  .title-text {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
  }

  .title-arrow {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #999999;

    .arrow {
      margin-left: 4px;
      font-size: 16px;
    }
  }
}

/* 订单快捷入口 */
.order-quick {
  display: flex;
  padding: 16px 0;

  .quick-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .quick-icon-wrap {
    position: relative;
  }

  .quick-icon {
    font-size: 24px;
  }

  .quick-badge {
    position: absolute;
    top: -6px;
    right: -8px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    background: #FF4400;
    border-radius: 8px;
    font-size: 10px;
    color: #FFFFFF;
    text-align: center;
    line-height: 16px;
  }

  .quick-label {
    margin-top: 8px;
    font-size: 12px;
    color: #666666;
  }
}

/* 菜单列表 */
.menu-list {
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #F5F5F5;

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

  .menu-label {
    font-size: 15px;
    color: #333333;
  }

  .menu-arrow {
    font-size: 18px;
    color: #CCCCCC;
  }
}
</style>
