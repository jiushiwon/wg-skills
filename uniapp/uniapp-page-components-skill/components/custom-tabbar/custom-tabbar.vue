<!--
  CustomTabbar 微信小程序自定义 tabBar 组件
  ============================================================
  用于替换微信原生 tabBar，需配合 pages.json 的 "custom": true 使用。
  内部使用 base-tabbar 渲染，一处维护所有 tab 页面。
  使用方式：
    1. pages.json 设置 "custom": true
    2. 创建 src/custom-tab-bar/index.vue，内容引用本组件
    3. 本组件会自动同步当前页面并处理切换
-->
<template>
  <base-tabbar
    :model-value="current"
    :items="items"
    :fixed="false"
    :safe-area="true"
    @change="onSwitch"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

interface TabbarItem {
  key: string
  text: string
  icon?: string
  activeIcon?: string
  badge?: string | number
}

interface Props {
  /** 菜单项（默认 3 个 tab） */
  items?: TabbarItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [
    { key: '/pages/index/index', text: '首页' },
    { key: '/pages/cart/cart', text: '购物车' },
    { key: '/pages/profile/profile', text: '我的' },
  ],
})

const current = ref(props.items[0]?.key || '')

// 切换 tab
function onSwitch(item: TabbarItem) {
  current.value = item.key
  uni.switchTab({ url: item.key })
}

// 每次页面显示时同步当前 tab
onShow(() => {
  const pages = getCurrentPages()
  if (pages.length) {
    const route = '/' + pages[pages.length - 1].route
    // 精确匹配或前缀匹配
    const matched = props.items.find(i => i.key === route)
    if (matched) {
      current.value = matched.key
    }
  }
})
</script>
