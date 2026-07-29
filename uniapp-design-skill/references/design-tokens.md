# Design Tokens 架构详解

## 1. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│  config/_theme-config.scss                                  │
│  （唯一人工配置入口）                                        │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  _functions.scss                                           │
│  （色板生成算法、阴影生成）                                  │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  tokens/_primitive.scss                                    │
│  （基础色板、尺寸，自动生成）                                │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  tokens/_semantic.scss                                     │
│  （语义变量，业务代码引用）                                  │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  _mixins.scss                                              │
│  （常用样式混入）                                            │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  variables.scss                                             │
│  （全局样式聚合，自动注入）                                  │
└─────────────────────────────────────────────────────────────┘
```

## 2. 配置层

### 2.1 主题配置

```scss
// src/styles/config/_theme-config.scss

// 品牌主色
$theme-primary: #1CC8C4;

// 功能色
$theme-success: #22c55e;
$theme-warning: #f59e0b;
$theme-error: #ef4444;
$theme-info: #3b82f6;

// 间距基数
$theme-spacing-base: 4rpx;

// 圆角基数
$theme-radius-base: 8rpx;

// 字号基数
$theme-font-size-base: 2rpx;
```

## 3. 原语层

### 3.1 基础色板生成

```scss
// src/styles/_functions.scss

@function color-scale($color, $weight) {
  @return mix(white, $color, $weight);
}

// 主色 10 档色板
$color-primary-50: color-scale($theme-primary, 95%);
$color-primary-100: color-scale($theme-primary, 90%);
// ...
$color-primary-500: $theme-primary;
// 深色
$color-primary-600: mix(black, $theme-primary, 10%);
$color-primary-700: mix(black, $theme-primary, 20%);
// ...
```

### 3.2 间距

```scss
$spacing-1: $theme-spacing-base * 1;   // 4rpx
$spacing-2: $theme-spacing-base * 2;   // 8rpx
$spacing-3: $theme-spacing-base * 3;   // 12rpx
$spacing-4: $theme-spacing-base * 4;   // 16rpx
// ...
```

## 4. 语义层

### 4.1 文字颜色

```scss
// src/styles/tokens/_semantic.scss

$color-text-primary: #2b2e31;
$color-text-secondary: #5b6167;
$color-text-tertiary: #737a82;
$color-text-disabled: #b5b9bf;
$color-text-placeholder: #b5b9bf;
$color-text-inverse: #ffffff;
$color-text-link: #3498db;
```

### 4.2 背景颜色

```scss
$color-bg-primary: #ffffff;
$color-bg-secondary: #fafafa;
$color-bg-tertiary: #f5f5f5;
$color-bg-warm: #fff8e1;
$color-bg-error-light: #ffebee;
$color-bg-success-light: #e8f5f0;
```

### 4.3 功能色

```scss
$color-success: $theme-success;
$color-warning: $theme-warning;
$color-error: $theme-error;
$color-info: $theme-info;
```

### 4.4 边框色

```scss
$color-border: #e5e7eb;
$color-border-light: #f0f0f0;
```

### 4.5 圆角

```scss
$radius-small: $theme-radius-base;       // 8rpx
$radius-medium: $theme-radius-base * 2;   // 16rpx
$radius-large: $theme-radius-base * 3;    // 24rpx
```

### 4.6 阴影

```scss
$shadow-sm: 0 2rpx 4rpx rgba(0, 0, 0, 0.06);
$shadow-md: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
```

## 5. 混合层

### 5.1 布局混入

```scss
// src/styles/_mixins.scss

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-row-center {
  display: flex;
  align-items: center;
}

@mixin flex-col-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

### 5.2 文本混入

```scss
@mixin text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@mixin text-ellipsis-multi($lines: 2) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: $lines;
  overflow: hidden;
}
```

### 5.3 卡片混入

```scss
@mixin card-container {
  margin: $spacing-4;
  background-color: $color-bg-primary;
  border-radius: $radius-medium;
  padding: $spacing-4;
  box-shadow: $shadow-sm;
}
```

> **注意**：mixin 方式适用于简单场景。对于交互复杂、含逻辑的 UI 元素，优先使用组件方式。

### 5.4 按钮混入（旧版兼容，优先使用组件方式）

> 按钮混入适用于无法使用组件的场景（如第三方页面嵌入）。新开发优先使用 `components/common/Button/index.vue`。

```scss
@mixin btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  background: $color-primary;
  color: #fff;
  border: none;
}

@mixin btn-ghost {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  background: #fff;
  color: $color-primary;
  border: 2rpx solid $color-primary;
}
```

### 5.5 安全区混入

```scss
@mixin safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 5.6 1px 边框

```scss
@mixin hairline($color: $color-border, $direction: all) {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    // ...
  }
}
```

## 6. 统一出口

### 6.1 自动注入

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },
});
```

### 6.2 使用方式

```scss
// 无需导入，直接使用
.my-component {
  background: $color-primary;
  color: $color-text-primary;
  padding: $spacing-4;
  border-radius: $radius-medium;
}
```

## 7. CSS 变量

### 7.1 运行时使用

```scss
// src/styles/variables.scss

page {
  --color-primary: #{$color-primary};
  --color-text-primary: #{$color-text-primary};
  --spacing-4: #{$spacing-4};
}
```

### 7.2 JS 中使用

```typescript
const primary = getComputedStyle(pageNode).getPropertyValue('--color-primary');
```

## 8. 一键换肤

只需修改一个配置：

```scss
// src/styles/config/_theme-config.scss
$theme-primary: #新的颜色值;

// 运行生成脚本
npm run generate:colors

// 所有使用 $color-primary 的地方自动变色
```

## 9. 颜色常量导出

### 9.1 自动生成

```typescript
// src/constants/colors.ts（自动生成）

export const COLOR_PRIMARY = '#1CC8C4';
export const COLOR_TEXT_PRIMARY = '#2b2e31';
export const COLOR_SUCCESS = '#22c55e';
// ...
```

### 9.2 生成脚本

```javascript
// scripts/generate-theme-colors.js
const fs = require('fs');
const path = require('path');

// 读取 _theme-config.scss
// 解析 $theme-primary
// 生成 colors.ts
```

## 10. 兼容性别名

```scss
// src/styles/variables.scss

// 简写别名
$primary: $color-primary;
$text-primary: $color-text-primary;
$bg-primary: $color-bg-primary;
```

---

## 11. 组件示例

```vue
<template>
  <view class="card">
    <text class="title">标题</text>
    <text class="desc">描述内容</text>
  </view>
</template>

<style lang="scss" scoped>
.card {
  background: $color-bg-primary;
  border-radius: $radius-medium;
  padding: $spacing-4;
  box-shadow: $shadow-md;

  .title {
    color: $color-text-primary;
    font-size: $font-size-lg;
    font-weight: 600;
  }

  .desc {
    color: $color-text-secondary;
    font-size: $font-size-md;
    margin-top: $spacing-2;
  }
}
</style>
```
