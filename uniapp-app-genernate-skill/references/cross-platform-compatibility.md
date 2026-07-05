# 跨平台兼容性规范

> 本参考文档定义 `uniapp-app-genernate-skill` 生成代码时应遵循的跨平台兼容性规则。uni-app 可同时编译到微信小程序、H5、App 三端，但各端支持的语法和能力存在差异。本 Skill 以**微信小程序语法规范为优先**，同时兼顾 H5 和 App。

## 核心原则

1. **小程序语法优先**：模板、样式、API 优先保证微信小程序可正常运行。
2. **避免 H5 专属标签**：不使用 `div`、`span`、`p`、`h1~h6`、`section`、`article` 等 HTML 标签。
3. **避免 H5 专属 CSS**：不使用小程序支持不完整或有兼容风险的 CSS 属性。
4. **条件编译兜底**：当某端确实需要特殊处理时，使用 uni-app 条件编译 `#ifdef` / `#ifndef`。
5. **图片用组件，不用背景图**：需要展示图片时，使用 `<image>` 组件，避免 `background-image: url(...)`。

## 模板标签规范

### 必须使用的 uni-app 组件

| 用途 | 正确组件 | 禁止使用的 H5 标签 |
|------|---------|-------------------|
| 容器 | `view` | `div`、`section`、`article`、`main` |
| 文本 | `text` | `span`、`p`、`h1~h6`、`label` |
| 图片 | `image` | `img` |
| 滚动 | `scroll-view` | 自定义 div + overflow |
| 轮播 | `swiper` / `swiper-item` | 自定义 div |
| 输入 | `input`、`textarea`、`picker` | 原生 input/textarea |
| 按钮 | `button` | `a`、`button`（H5 原生） |
| 列表 | `view` + `v-for` | `ul`、`li`、`ol` |
| 表单 | `form`、`checkbox`、`radio` | 原生表单元素 |

### 示例

```vue
<!-- 正确 -->
<view class="card">
  <image class="card__cover" src="/static/images/banner.png" mode="aspectFill" />
  <view class="card__content">
    <text class="card__title">标题</text>
    <text class="card__desc">描述文字</text>
  </view>
</view>

<!-- 错误 -->
<div class="card">
  <img class="card__cover" src="/static/images/banner.png" />
  <div class="card__content">
    <h3 class="card__title">标题</h3>
    <p class="card__desc">描述文字</p>
  </div>
</div>
```

## CSS 规范

### 推荐使用的属性

- 布局：`display: flex`、`flex-direction`、`justify-content`、`align-items`、`position: relative/absolute/fixed`
- 尺寸：`width`、`height`、`padding`、`margin`、`border-radius`
- 文字：`font-size`、`font-weight`、`color`、`text-align`、`line-height`
- 背景：`background-color`
- 阴影：`box-shadow`（小程序支持，但避免过大阴影）

### 禁止或谨慎使用的属性

| 属性 | 原因 | 替代方案 |
|------|------|----------|
| `background-image: url(...)` | 小程序部分场景不支持或表现不一致 | 使用 `<image>` 组件 |
| `background-attachment: fixed` | 小程序不支持 | 使用固定定位的 `<image>` |
| `background-size: cover` | 小程序对背景图支持有限 | 使用 `image` 组件 `mode="aspectFill"` |
| `object-fit` | 小程序不支持 | 使用 `image` 组件的 `mode` 属性 |
| CSS 自定义属性 `var(--xxx)` | 部分低版本基础库不支持 | 使用 SCSS 变量 `$xxx` |
| `calc()` | 部分场景兼容性一般 | 使用固定 rpx 值或 flex 布局 |
| `vw/vh` | 小程序支持但不推荐 | 使用 `rpx` 或百分比 |
| `overflow: scroll` | 小程序需用 `scroll-view` | 使用 `scroll-view` 组件 |
| `z-index` 过大 | 小程序层级管理复杂 | 控制在 1~999 之间 |

### 图片展示正确做法

```vue
<!-- 正确：用 image 组件 -->
<image class="banner" src="/static/images/banner.png" mode="aspectFill" />

<style lang="scss" scoped>
.banner {
  width: 100%;
  height: 300rpx;
  border-radius: $radius-lg;
}
</style>
```

```vue
<!-- 错误：用背景图 -->
<view class="banner"></view>

<style lang="scss" scoped>
.banner {
  width: 100%;
  height: 300rpx;
  background-image: url('/static/images/banner.png'); /* 小程序不显示 */
  background-size: cover;
}
</style>
```

## API 规范

### 优先使用 uni-app 统一 API

```typescript
// 正确
uni.request({ url: '...' });
uni.navigateTo({ url: '...' });
uni.showToast({ title: '...' });

// 错误
fetch('...');
window.location.href = '...';
alert('...');
```

### 平台差异化处理

当必须区分平台时，使用条件编译：

```vue
<script setup lang="ts">
// #ifdef MP-WEIXIN
console.log('微信小程序');
// #endif

// #ifdef H5
console.log('H5');
// #endif

// #ifdef APP-PLUS
console.log('App');
// #endif
</script>
```

```vue
<template>
  <view>
    <!-- #ifdef MP-WEIXIN -->
    <text>微信小程序专属内容</text>
    <!-- #endif -->
  </view>
</template>
```

## rpx 与响应式

- 统一使用 `rpx` 作为尺寸单位，基准宽度 750rpx。
- 字体大小也建议使用 `rpx`，但在 H5 上可能偏大/偏小，可通过 `uni.getSystemInfoSync` 动态调整或接受轻微差异。
- 不要混合使用 `px` 和 `rpx`。

## 安全区与刘海屏

```scss
.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

## 表单与输入

- 使用 `input`、`textarea`、`picker` 等 uni-app 组件。
- 不要用 `v-model` 直接绑定复杂对象，绑定基础类型。
- 键盘弹起时注意页面滚动，必要时使用 `adjust-position` 属性。

## 禁止事项

- 禁止使用 `div`、`span`、`p`、`h1~h6` 等 H5 标签。
- 禁止使用 `background-image: url(...)` 展示重要图片。
- 禁止使用 CSS 自定义属性 `var(--xxx)` 做主题切换（编译时 SCSS 变量更可靠）。
- 禁止直接操作 DOM（`document.querySelector`、`getElementById`）。
- 禁止使用 `window`、`document`、`localStorage` 等浏览器全局对象（用 `uni` 和 `uni.getStorageSync`）。
- 禁止在模板中写原生 HTML 字符串渲染。

## 平台抽象层

为减少三端差异对业务代码的侵入，项目应使用 `src/utils/platform*.ts` 中的一组平台抽象函数。

### platform.ts

提供平台判断、安全区、状态栏高度等通用能力：

```typescript
import { getPlatform, isH5, isMpWeixin, isApp, getSafeAreaBottom } from '@/utils/platform';

const platform = getPlatform(); // 'mp-weixin' | 'h5' | 'app' | ...
const bottom = getSafeAreaBottom();
```

### platform-auth.ts

统一登录入口，内部按平台分发：

```typescript
import { platformLogin } from '@/utils/platform-auth';

const result = await platformLogin();
```

- 微信小程序：`uni.login` 获取 code；
- H5：提示使用账号/第三方 OAuth；
- App：可集成原生登录或微信 SDK。

### platform-share.ts

统一分享入口：

```typescript
import { platformShare } from '@/utils/platform-share';

platformShare({
  title: '分享标题',
  path: '/pages/index/index',
  url: 'https://example.com',
});
```

- 微信小程序：在 `onShareAppMessage` 中返回配置；
- H5：调用 Web Share API 或复制链接；
- App：调用系统分享。

### platform-image.ts

统一图片选择与 URL 处理：

```typescript
import { chooseImage, resolveImageUrl } from '@/utils/platform-image';

const paths = await chooseImage(3);
const displayUrl = await resolveImageUrl(remoteUrl);
```

- H5 可直接展示远程图片；
- 小程序/App 展示远程 HTTPS 图片通常也可直接显示，需要本地处理时调用 `downloadImage`。

## 网络请求三端差异

`src/utils/request.ts` 已内置平台化 baseURL：

```typescript
// .env
VITE_BASE_URL=https://api.example.com      // 微信小程序
VITE_H5_BASE_URL=/api                      // H5 开发代理
VITE_APP_BASE_URL=https://api.example.com  // App
```

注意事项：
- 微信小程序：必须在「开发设置 → request 合法域名」中配置；
- H5：开发阶段需要配置代理或后端开启 CORS；
- App：默认可访问任意 HTTPS，上线打包时注意 SSL 证书问题。

## 登录态与存储

- 统一使用 `uni.getStorageSync` / `uni.setStorageSync`；
- Token 注入在 `request.ts` 中统一处理；
- 401 统一跳登录或调用 `platformLogin`。

## App 端特别注意事项

1. **图标与启动图**：需在 `manifest.json → app-plus → distribute` 中配置；
2. **权限**：Android/iOS 权限需在 manifest 中声明；
3. **原生能力**：扫码、定位、推送等需测试真机；
4. **离线包**：App 支持 wgt 热更新，需单独配置；
5. **刘海屏/灵动岛**：使用 `getSafeArea()` 获取安全区，避免内容被遮挡。

## H5 端特别注意事项

1. **路由模式**：默认 `hash`，如需 `history` 需后端配合；
2. **浏览器兼容性**：避免使用小程序专属 API；
3. **响应式**：`rpx` 在 H5 以 750px 为基准，必要时对大屏做额外适配；
4. **分享**：H5 没有 `onShareAppMessage`，需使用 Web Share API 或复制链接；
5. **登录**：H5 无法使用 `uni.login`，需接入账号体系或 OAuth。

## 微信小程序端特别注意事项

1. **合法域名**：request、uploadFile、downloadFile、web-view 都需配置；
2. **用户隐私**：需配置《用户隐私保护指引》；
3. **版本更新**：使用 `uni.getUpdateManager()`；
4. **分包**：主包 ≤ 2MB，总体 ≤ 20MB；
5. **审核**：避免 web-view 绕过审核、避免诱导分享。

## 验证建议

- 微信小程序：微信开发者工具 + 真机预览；
- H5：`npm run dev:h5`，在 Chrome/Safari/微信内置浏览器测试；
- App：`npm run dev:app`，在 iOS/Android 模拟器或真机测试。

**建议至少完成微信小程序 + H5 的冒烟测试，App 端根据项目目标决定是否投入真机测试。**
