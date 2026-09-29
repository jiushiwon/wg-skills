# 底部TabBar模板

## 页面概述

App底部导航栏，提供页面切换入口，是移动端App的核心导航组件。

## ⚠️ 重要约束

**以下约束必须严格遵守，违反会导致用户体验极差：**

1. **禁止使用 scroll-view** 实现整页滚动
2. **胶囊按钮适配**：uniapp必须处理右上角胶囊按钮
3. **安全区域**：底部必须适配 `safe-area-inset-bottom`
4. **切换性能**：禁止使用滑动动画，使用 view 切换

## 模板结构

```
tabbar/
├── tabbar.vue           # 主组件
├── tab-item.vue         # 单个Tab
└── config.js            # 配置
```

## 配置结构

```js
export const tabList = [
  {
    pagePath: '/pages/index/index',
    text: '首页',
    icon: 'home',
    activeIcon: 'home-active'
  },
  {
    pagePath: '/pages/category/category',
    text: '分类',
    icon: 'category',
    activeIcon: 'category-active'
  },
  {
    pagePath: '/pages/cart/cart',
    text: '购物车',
    icon: 'cart',
    activeIcon: 'cart-active',
    badge: 0  // 角标
  },
  {
    pagePath: '/pages/profile/profile',
    text: '我的',
    icon: 'profile',
    activeIcon: 'profile-active'
  }
]
```

## 风格变体

### 风格1：简约线条

```scss
--bg-color: #FFFFFF;
--text-color: #999999;
--text-active: #333333;
--border-color: #E5E5E5;
--icon-size: 24px;
--font-size: 10px;
--height: 50px;
```

**特点**：
- 线性图标（描边）
- 文字在图标下方
- 简洁纯粹
- 适合工具类App

**图标示例**：
```vue
<view class="tab-icon">
  <!-- 未选中：线性图标 -->
  <text class="iconfont icon-home-line"></text>
</view>
```

### 风格2：活力填充

```scss
--bg-color: #FFFFFF;
--text-color: #666666;
--text-active: #FF6B6B;
--active-bg: #FFF0F0;
--gradient: linear-gradient(135deg, #FF6B6B, #FF8E53);
--icon-size: 24px;
--height: 56px;
--radius: 28px;
```

**特点**：
- 填充图标
- 选中态有背景色/渐变
- 活跃氛围
- 适合电商/社交

**图标示例**：
```vue
<view class="tab-icon" :class="{ active: active }">
  <!-- 选中：填充图标 -->
  <text class="iconfont icon-home-fill"></text>
</view>
```

### 风格3：高端暗金

```scss
--bg-color: #1A1A2E;
--text-color: #666666;
--text-active: #D4AF37;
--icon-active: #D4AF37;
--border-color: #2A2A3E;
--height: 60px;
```

**特点**：
- 深色背景
- 金色点缀
- 质感强
- 适合金融/高端

### 风格4：清新圆角

```scss
--bg-color: #F0F9F6;
--text-color: #666666;
--text-active: #2ECC71;
--bg-card: #FFFFFF;
--radius-lg: 16px;
--height: 64px;
--shadow: 0 4px 12px rgba(46, 204, 113, 0.15);
```

**特点**：
- 圆角容器包裹
- 柔和阴影
- 亲和力强
- 适合健康/母婴

### 风格5：暗黑科技

```scss
--bg-color: #0D0D0D;
--text-color: #666666;
--text-active: #00FFFF;
--icon-active: #00FFFF;
--glow: 0 0 10px rgba(0, 255, 255, 0.5);
--height: 60px;
```

**特点**：
- 纯黑背景
- 霓虹发光效果
- 赛博朋克
- 适合游戏/科技

## 代码实现

### uniapp Vue3 + uView

```vue
<template>
  <view class="tabbar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      :class="{ active: current === index }"
      @click="switchTab(item, index)"
    >
      <view class="tab-icon">
        <text :class="current === index ? item.activeIcon : item.icon"></text>
        <view v-if="item.badge" class="badge">{{ item.badge }}</view>
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useSystemInfo } from '@/hooks/useSystemInfo'

const { safeAreaBottom } = useSystemInfo()

const props = defineProps({
  current: {
    type: Number,
    default: 0
  },
  tabList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change'])

function switchTab(item, index) {
  if (props.current === index) return
  uni.switchTab({ url: item.pagePath })
  emit('change', index)
}
</script>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50px;
}

.tab-icon {
  position: relative;
  width: 24px;
  height: 24px;
}

.tab-text {
  margin-top: 4px;
  font-size: var(--font-size, 10px);
  color: var(--text-color);
}

.tab-item.active .tab-text {
  color: var(--text-active);
}

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
  color: #fff;
  text-align: center;
  line-height: 16px;
}
</style>
```

## 胶囊按钮适配

### 问题说明

uniapp默认导航栏会遮挡页面内容，自定义tabbar需要考虑胶囊按钮区域。

### 解决方案

```scss
// App.vue 或全局样式
.safe-area-inset-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

```js
// 获取系统信息
uni.getSystemInfo({
  success: (res) => {
    // statusBarHeight - 状态栏高度
    // safeAreaInsets.bottom - 底部安全区域
  }
})
```

## 图标方案

### 推荐方案

1. **iconfont**：阿里图标库，按需引入
2. **uni-icons**：uniapp内置图标
3. **uView图标**：uView UI图标

### 注意事项

- 线性图标和填充图标分开定义
- 准备两套图标（active/inactive）
- 图标颜色使用CSS变量控制

## Mock数据

```json
{
  "tabList": [
    {
      "pagePath": "/pages/index/index",
      "text": "首页",
      "icon": "icon-home",
      "activeIcon": "icon-home-active"
    },
    {
      "pagePath": "/pages/category/category",
      "text": "分类",
      "icon": "icon-category",
      "activeIcon": "icon-category-active"
    },
    {
      "pagePath": "/pages/cart/cart",
      "text": "购物车",
      "icon": "icon-cart",
      "activeIcon": "icon-cart-active",
      "badge": 3
    },
    {
      "pagePath": "/pages/profile/profile",
      "text": "我的",
      "icon": "icon-profile",
      "activeIcon": "icon-profile-active"
    }
  ]
}
```

## 验证清单

生成后请验证：

- [ ] 底部tabbar固定在底部
- [ ] 切换页面流畅，无闪烁
- [ ] 胶囊按钮区域无遮挡
- [ ] 底部安全区域适配正确
- [ ] 角标位置正确显示
- [ ] 选中态颜色正确
