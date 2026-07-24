<template>
  <view class="tabbar-container" :style="{ paddingBottom: safeAreaBottom + 'px' }">
    <!-- TabBar -->
    <view class="tabbar" :class="['style-simple']">
      <view
        v-for="(item, index) in tabList"
        :key="index"
        class="tab-item"
        :class="{ active: current === index }"
        @click="switchTab(item, index)"
      >
        <view class="tab-icon">
          <!-- 优先使用 emoji/文字图标，避免默认依赖未加载的 iconfont 字体 -->
          <text v-if="item.iconText" class="tab-icon-text" :class="{ active: current === index }">{{ item.iconText }}</text>
          <!-- 兼容 iconfont：使用前必须在项目中引入对应字体文件 -->
          <text v-else class="iconfont" :class="current === index ? item.activeIcon : item.icon"></text>
          <!-- 角标 -->
          <view v-if="item.badge && item.badge > 0" class="badge">{{ item.badge }}</view>
        </view>
        <text class="tab-text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 获取系统信息
const systemInfo = uni.getSystemInfoSync()
const safeAreaBottom = computed(() => systemInfo.safeAreaInsets?.bottom || 0)

const props = defineProps({
  current: {
    type: Number,
    default: 0
  },
  tabList: {
    type: Array,
    default: () => [
      { pagePath: '/pages/index/index', text: '首页', iconText: '🏠', icon: 'icon-home-line', activeIcon: 'icon-home-fill', badge: 0 },
      { pagePath: '/pages/category/index', text: '分类', iconText: '☰', icon: 'icon-category-line', activeIcon: 'icon-category-fill', badge: 0 },
      { pagePath: '/pages/cart/index', text: '购物车', iconText: '🛒', icon: 'icon-cart-line', activeIcon: 'icon-cart-fill', badge: 3 },
      { pagePath: '/pages/profile/index', text: '我的', iconText: '👤', icon: 'icon-user-line', activeIcon: 'icon-user-fill', badge: 0 }
    ]
  }
})

function switchTab(item, index) {
  if (props.current === index) return
  uni.switchTab({ url: item.pagePath })
}
</script>

<style lang="scss" scoped>
/* 风格1：简约线条 - 白色背景，线性图标，简洁纯粹 */
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  z-index: 999;
}

.tabbar {
  display: flex;
  height: 50px;
  background: #FFFFFF;
  border-top: 1px solid #E5E5E5;
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
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  .iconfont {
    font-size: 22px;
    color: #999999;
    transition: color 0.2s ease;
  }

  .tab-icon-text {
    font-size: 20px;
    line-height: 1;
    transition: transform 0.2s ease;

    &.active {
      transform: scale(1.1);
    }
  }
}

.tab-item.active .tab-icon .iconfont {
  color: #333333;
}

.tab-text {
  margin-top: 2px;
  font-size: 10px;
  color: #999999;
  transition: color 0.2s ease;
}

.tab-item.active .tab-text {
  color: #333333;
  font-weight: 500;
}

/* 角标 */
.badge {
  position: absolute;
  top: -4px;
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
</style>
