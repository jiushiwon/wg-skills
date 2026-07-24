# 模板预览

> 打开 `preview.html` 查看所有内置模板的可视化效果

## 快速预览

直接在浏览器中打开 `preview.html` 文件，可以看到：

### 移动端模板 (uniapp)
- TabBar 底部导航（4套风格）
- Profile 个人中心（4套风格）
- Product Detail 商品详情（4套风格）
- Cart 购物车（1套风格）
- Product List 商品列表（1套风格）
- Order List 订单列表（1套风格）

### PC端模板 (React)
- Login 登录页（3套风格）
- Register 注册页（1套风格）
- Dashboard 数据大屏（1套风格）

## 风格对应关系

| 模板 | 风格 | 预览标签 |
|------|------|----------|
| TabBar | 简约线条 | style-1-simple |
| TabBar | 活力炫彩 | style-2-vibrant |
| TabBar | 高端暗金 | style-3-premium |
| TabBar | 清新自然 | style-4-nature |
| Profile | 简约现代 | style-1-simple |
| Profile | 活力炫彩 | style-2-vibrant |
| Profile | 高端商务 | style-3-premium |
| Profile | 清新自然 | style-4-nature |
| Product Detail | 简约现代 | style-1-simple |
| Product Detail | 活力炫彩 | style-2-vibrant |
| Product Detail | 高端商务 | style-3-premium |
| Product Detail | 清新自然 | style-4-nature |
| Cart | 简约现代 | style-1-simple |
| Product List | 简约现代 | style-1-simple |
| Order List | 简约现代 | style-1-simple |
| Login | 简约现代 | style-1-simple |
| Login | 活力炫彩 | style-2-vibrant |
| Login | 深色科技 | style-3-dark |
| Register | 简约现代 | style-1-simple |
| Dashboard | 科技深蓝 | style-1-tech |

## 使用方式

### 1. 可视化预览
```bash
# 直接在浏览器打开
open templates/preview.html
# 或
start templates/preview.html
```

### 2. 代码使用

#### uniapp 组件
```vue
<template>
  <view class="page">
    <!-- 内容区 -->
    <tabbar-simple :current="0" />
  </view>
</template>

<script setup>
import tabbarSimple from './templates/tabbar/style-1-simple.vue'
</script>
```

#### React 组件
```tsx
// Login
import LoginPage from './templates/login/style-1-simple'

// Register
import RegisterPage from './templates/register/style-1-simple'

// Dashboard
import Dashboard from './templates/dashboard/style-1-tech'
```

## 目录结构

```
templates/
├── preview.html              # 可视化预览页面
├── uniapp-vue3/
│   ├── tabbar/              # 底部导航
│   │   ├── style-1-simple.vue
│   │   ├── style-2-vibrant.vue
│   │   ├── style-3-premium.vue
│   │   └── style-4-nature.vue
│   ├── profile/              # 个人中心
│   │   ├── style-1-simple.vue
│   │   ├── style-2-vibrant.vue
│   │   ├── style-3-premium.vue
│   │   └── style-4-nature.vue
│   ├── product-detail/       # 商品详情
│   │   ├── style-1-simple.vue
│   │   ├── style-2-vibrant.vue
│   │   ├── style-3-premium.vue
│   │   └── style-4-nature.vue
│   ├── cart/                 # 购物车
│   │   └── style-1-simple.vue
│   ├── product-list/         # 商品列表
│   │   └── style-1-simple.vue
│   └── order-list/           # 订单列表
│       └── style-1-simple.vue
│
└── pc-react/
    ├── login/               # 登录页
    │   ├── style-1-simple.tsx + css
    │   ├── style-2-vibrant.tsx + css
    │   └── style-3-dark.tsx + css
    ├── register/            # 注册页
    │   └── style-1-simple.tsx + css
    └── dashboard/            # 数据大屏
        └── style-1-tech.tsx + css
```
