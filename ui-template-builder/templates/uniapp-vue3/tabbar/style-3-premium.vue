<template>
  <view class="tabbar-container" :style="{ paddingBottom: safeAreaBottom + 'px' }">
    <view class="tabbar style-premium">
      <view
        v-for="(item, index) in tabList"
        :key="index"
        class="tab-item"
        :class="{ active: current === index }"
        @click="switchTab(item, index)"
      >
        <view class="tab-icon">
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
  tabList: { type: Array, default: () => [] }
})

function switchTab(item, index) {
  if (props.current === index) return
  uni.switchTab({ url: item.pagePath })
}
</script>

<style lang="scss" scoped>
/* 风格3：高端暗金 - 深色背景，金色点缀 */
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.tabbar {
  display: flex;
  height: 60px;
  background: #1A1A2E;
  border-top: 1px solid #2D2D44;
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
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;

  .iconfont {
    font-size: 22px;
    color: #666666;
    transition: color 0.3s ease;
  }
}

.tab-item.active .tab-icon .iconfont {
  color: #D4AF37;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.tab-text {
  margin-top: 4px;
  font-size: 11px;
  color: #666666;
  transition: color 0.3s ease;
}

.tab-item.active .tab-text {
  color: #D4AF37;
  font-weight: 500;
}

.badge {
  position: absolute;
  top: -2px;
  right: -6px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  background: linear-gradient(135deg, #D4AF37, #E5C76B);
  border-radius: 7px;
  font-size: 9px;
  color: #1A1A2E;
  text-align: center;
  line-height: 14px;
  font-weight: 600;
}
</style>
