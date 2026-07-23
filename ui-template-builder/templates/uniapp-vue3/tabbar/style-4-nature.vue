<template>
  <view class="tabbar-container" :style="{ paddingBottom: safeAreaBottom + 'px' }">
    <view class="tabbar style-nature">
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
  tabList: { type: Array, default: () => [] }
})

function switchTab(item, index) {
  if (props.current === index) return
  uni.switchTab({ url: item.pagePath })
}
</script>

<style lang="scss" scoped>
/* 风格4：清新自然 - 浅绿背景，圆角卡片 */
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.tabbar {
  display: flex;
  height: 64px;
  background: #F0F9F6;
  padding: 8px 12px;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.tab-item.active {
  background: #FFFFFF;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.15);
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
    transition: color 0.2s ease;
  }
}

.tab-item.active .tab-icon .iconfont {
  color: #2ECC71;
}

.tab-text {
  margin-top: 2px;
  font-size: 11px;
  color: #666666;
  transition: color 0.2s ease;
}

.tab-item.active .tab-text {
  color: #2ECC71;
  font-weight: 500;
}

.badge {
  position: absolute;
  top: -2px;
  right: -4px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  background: #2ECC71;
  border-radius: 7px;
  font-size: 9px;
  color: #FFFFFF;
  text-align: center;
  line-height: 14px;
}
</style>
