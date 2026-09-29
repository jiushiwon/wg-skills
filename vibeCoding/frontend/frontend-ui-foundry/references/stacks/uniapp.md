# 技术栈：uniapp

跨端：小程序 + H5 + App。一套代码多端运行。

---

## 项目结构

```
project/
├── pages/                      # 页面（uniapp 必需）
│   ├── index/
│   │   └── index.vue
│   ├── about/
│   └── dashboard/
├── components/                 # 公共组件
│   ├── ui/
│   └── features/
├── static/                     # 静态资源
│   ├── images/
│   └── fonts/
├── store/                      # Pinia / Vuex
├── utils/
├── api/                        # 接口封装
├── platform/                   # 平台特定代码
│   ├── mp-weixin/             # 微信小程序特定
│   ├── h5/                    # H5 特定
│   └── app/                   # App 特定
├── uni.scss                    # 全局 SCSS 变量
├── pages.json                  # 路由配置
├── manifest.json               # 应用配置
├── App.vue
└── main.ts
```

## 初始化

```bash
# 使用 vue3 + ts 模板
npx degit dcloudio/uni-preset-vue#vite-ts my-project
cd my-project
npm install
```

## pages.json

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationStyle": "custom",
        "enablePullDownRefresh": false
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "项目名",
    "navigationBarBackgroundColor": "#fafaf5",
    "backgroundColor": "#fafaf5"
  },
  "easycom": {
    "autoscan": true,
    "custom": {
      "^ui-(.*)": "@/components/ui/$1.vue"
    }
  }
}
```

## 入口

```vue
<!-- App.vue -->
<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('App Launch');
  // 初始化用户信息、主题等
});
</script>

<style lang="scss">
@import '@/static/css/tokens.css';

/* 全局样式 */
page {
  background: var(--color-surface);
  color: var(--color-on-surface);
  font-family: var(--font-family-sans);
  font-size: 16px;  /* 避免 iOS 自动缩放 */
}
</style>
```

## 全局 Token（uni.scss）

```scss
/* uni.scss - 编译时变量 */
$primary: #c45c48;
$secondary: #d4a574;
$success: #4ade80;
$warning: #fbbf24;
$error: #ef4444;
$info: #3b82f6;

$text-primary: #1a1a1a;
$text-muted: #6b6b6b;

$bg-page: #fafaf5;
$bg-elevated: #ffffff;
$border: #e5e5e0;
```

## 基础组件

```vue
<!-- components/ui/ui-button/ui-button.vue -->
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
});

const emit = defineEmits<{ click: [event: any] }>();
</script>

<template>
  <button
    class="ui-button"
    :class="[
      `ui-button--${variant}`,
      `ui-button--${size}`,
      { 'ui-button--block': block, 'ui-button--loading': loading },
    ]"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <view v-if="loading" class="ui-button__spinner" />
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-radius: 16rpx;
  font-weight: 500;
  transition: opacity 200ms;

  &--primary {
    background: $primary;
    color: #fff;
  }
  &--secondary {
    background: $bg-elevated;
    color: $text-primary;
    border: 1px solid $border;
  }
  &--ghost {
    background: transparent;
    color: $text-primary;
  }

  &--sm { height: 56rpx; padding: 0 24rpx; font-size: 24rpx; }
  &--md { height: 72rpx; padding: 0 32rpx; font-size: 28rpx; }
  &--lg { height: 88rpx; padding: 0 48rpx; font-size: 32rpx; }

  &--block { width: 100%; }
  &--loading { opacity: 0.7; }

  &:active { opacity: 0.8; }
  &:disabled { opacity: 0.4; pointer-events: none; }
}

.ui-button__spinner {
  width: 28rpx;
  height: 28rpx;
  border: 2rpx solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

## 页面

```vue
<!-- pages/index/index.vue -->
<script setup lang="ts">
import { ref } from 'vue';

const items = ref([
  { id: 1, name: '项目 1' },
  { id: 2, name: '项目 2' },
]);

function handleItemClick(item: typeof items.value[0]) {
  uni.navigateTo({ url: `/pages/detail/index?id=${item.id}` });
}

// 平台特定：只在 H5 用
// #ifdef H5
onMounted(() => {
  console.log('H5 only');
});
// #endif
</script>

<template>
  <view class="page">
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="title">首页</text>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="hero">
        <text class="hero-title">让设计 <em>重新</em> 有趣</text>
        <text class="hero-subtitle">把 6 周的工作量压缩到 6 分钟</text>
        <view class="hero-ctas">
          <ui-button size="lg">立即开始</ui-button>
          <ui-button size="lg" variant="ghost">观看演示</ui-button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-page;
}

.top-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-elevated;
  border-bottom: 1px solid $border;
}

.hero {
  padding: 64rpx 32rpx;
}

.hero-title {
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  display: block;
}

.hero-subtitle {
  font-size: 32rpx;
  color: $text-muted;
  margin-top: 32rpx;
  display: block;
}

.hero-ctas {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}
</style>
```

## 平台条件编译

```vue
<script setup>
// #ifdef MP-WEIXIN
import { getWechatUserInfo } from '@/platform/mp-weixin/auth';
// #endif

// #ifdef H5
import { initH5Analytics } from '@/platform/h5/analytics';
// #endif

// #ifdef APP-PLUS
import { checkAppUpdate } from '@/platform/app/update';
// #endif
</script>

<template>
  <view>
    <!-- 仅 H5 显示 -->
    <!-- #ifdef H5 -->
    <view class="h5-only">H5 专属内容</view>
    <!-- #endif -->

    <!-- 仅微信小程序显示 -->
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="share">分享</button>
    <!-- #endif -->
  </view>
</template>
```

## 安全区与状态栏

```ts
// utils/system.ts
export function getSafeArea() {
  // #ifdef MP-WEIXIN
  const { safeArea, statusBarHeight } = uni.getSystemInfoSync();
  return { safeArea, statusBarHeight };
  // #endif

  // #ifdef H5 || APP-PLUS
  return {
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
    statusBarHeight: 20,
  };
  // #endif
}
```

```vue
<template>
  <view
    class="safe-top"
    :style="{ height: statusBarHeight + 'px' }"
  />
  <view
    class="safe-bottom"
    :style="{ height: safeBottom + 'px' }"
  />
</template>
```

## rpx 单位

uniapp 用 `rpx`（750rpx = 屏幕宽度）：

| 设备 | 1rpx 实际像素 |
|------|-------------|
| iPhone 6 (375pt) | 0.5px |
| iPhone 12 Pro (390pt) | 0.52px |
| 通用设计稿 | 750rpx = 375pt |

```scss
/* 设计稿 1px = 2rpx */
.hero-title {
  font-size: 72rpx;  /* 36px */
  padding: 32rpx;     /* 16px */
}
```

## 关键约定

- **页面文件在 `pages/` 下**，文件名即路径
- **easycom 自动导入** 组件
- **uni.scss 全局变量** + CSS 变量
- **平台条件编译** 注释语法
- **rpx 单位** 移动端

## 适用场景

- ✅ 微信小程序 / 支付宝小程序
- ✅ 跨端 App（iOS + Android）
- ✅ H5 移动版
- ❌ 不适合桌面端（PC 端建议用 Web 栈）

## 优化建议

- **分包加载**：uniapp 自动
- **图片**：`image` 组件 + 懒加载
- **字体**：本地 woff2，避免网络
- **首屏**：骨架屏 + 预加载
- **缓存**：`uni.setStorage` 持久化

## 验证清单

- [ ] rpx 单位正确
- [ ] 状态栏 + 安全区处理
- [ ] 平台条件编译检查
- [ ] 触摸目标 ≥44pt（88rpx）
- [ ] 字号 ≥16px（32rpx）避免 iOS 缩放
- [ ] 减弱动效模式
- [ ] 暗色模式支持（可选）
- [ ] 没有 AI slop
