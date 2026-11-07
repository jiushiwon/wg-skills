# 底部TabBar模板

> uniapp底部导航栏，4套风格可选

## 目录结构

```
tabbar/
├── style-1-simple.vue    # 风格1：简约线条
├── style-2-vibrant.vue  # 风格2：活力炫彩
├── style-3-premium.vue  # 风格3：高端暗金
└── style-4-nature.vue   # 风格4：清新自然
```

## 风格预览

### 风格1：简约线条
- 白色背景
- 线性图标
- 简洁纯粹
- 适合工具类App

### 风格2：活力炫彩
- 圆角胶囊容器
- 渐变图标背景
- 活跃氛围
- 适合电商/社交

### 风格3：高端暗金
- 深色背景 (#1A1A2E)
- 金色点缀 (#D4AF37)
- 发光效果
- 适合金融/高端

### 风格4：清新自然
- 浅绿背景 (#F0F9F6)
- 圆角卡片
- 柔和阴影
- 适合健康/母婴

## 使用方式

```vue
<template>
  <tabbar-simple :current="0" />
  <!-- 或 -->
  <tabbar-vibrant :current="1" />
  <!-- 或 -->
  <tabbar-premium :current="2" />
  <!-- 或 -->
  <tabbar-nature :current="3" />
</template>

<script setup>
import tabbarSimple from './templates/tabbar/style-1-simple.vue'
// ... 注册组件
</script>
```

## 重要约束

⚠️ **生成时必须遵守：**
1. 禁止使用 `scroll-view` 实现整页滚动
2. 胶囊按钮区域必须 `safe-area` 适配
3. 底部安全距离使用 `safe-area-inset-bottom`
4. 图标使用 iconfont 或 uni-icons
