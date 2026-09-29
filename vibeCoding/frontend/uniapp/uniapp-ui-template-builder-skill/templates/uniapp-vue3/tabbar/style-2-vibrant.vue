<template>
  <view class="tabbar-container" :style="{ paddingBottom: safeAreaBottom + 'px' }">
    <!-- TabBar -->
    <view class="tabbar style-vibrant">
      <view
        v-for="(item, index) in tabList"
        :key="index"
        class="tab-item"
        :class="{ active: current === index }"
        @click="switchTab(item, index)"
      >
        <view class="tab-icon" :class="{ active: current === index }">
          <text class="iconfont" :class="current === index ? item.activeIcon : item.icon"></text>
          <view v-if="item.badge && item.badge > 0" class="badge">{{ item.badge }}</view>
        </view>
        <text class="tab-text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const systemInfo = uni.getSystemInfoSync()
const safeAreaBottom = computed(() => systemInfo.safeAreaInsets?.bottom || 0)

const props = defineProps({
  current: { type: Number, default: 0 },
  tabList: {
    type: Array,
    default: () => [
      { pagePath: '/pages/index/index', text: '首页', icon: 'icon-home-line', activeIcon: 'icon-home-fill' },
      { pagePath: '/pages/category/index', text: '分类', icon: 'icon-category-line', activeIcon: 'icon-category-fill' },
      { pagePath: '/pages/cart/index', text: '购物车', icon: 'icon-cart-line', activeIcon: 'icon-cart-fill', badge: 3 },
      { pagePath: '/pages/profile/index', text: '我的', icon: 'icon-user-line', activeIcon: 'icon-user-fill' }
    ]
  }
})

function switchTab(item, index) {
  if (props.current === index) return
  uni.switchTab({ url: item.pagePath })
}
</script>

<style lang="scss" scoped>
/* 风格2：活力炫彩 - 渐变背景，填充图标 */
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.tabbar {
  display: flex;
  height: 56px;
  background: #FFFFFF;
  border-radius: 28px 28px 0 0;
  margin: 0 8px;
  box-shadow: 0 -2px 16px rgba(255, 107, 107, 0.12);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tab-icon {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  transition: all 0.25s ease;

  .iconfont {
    font-size: 22px;
    color: #666666;
  }
}

.tab-icon.active {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);

  .iconfont {
    color: #FFFFFF;
  }
}

.tab-text {
  margin-top: 2px;
  font-size: 11px;
  color: #666666;
  transition: color 0.2s ease;
}

.tab-item.active .tab-text {
  color: #FF6B6B;
  font-weight: 500;
}

.badge {
  position: absolute;
  top: -2px;
  right: -4px;
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
</style>
