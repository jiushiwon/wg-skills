# 全局尺寸系统

本文件定义 uniapp-theme-skill 使用的 CSS 变量尺寸系统。

## 设计原则

1. **CSS 变量优先**：所有尺寸使用 CSS 自定义属性
2. **uni-app 兼容**：使用 rpx 单位
3. **语义化命名**：提供语义化变量指向基础变量

## 尺寸结构

### 间距 (Spacing)

```css
:root {
  --spacing-xs: 8rpx;
  --spacing-sm: 16rpx;
  --spacing-md: 24rpx;
  --spacing-lg: 32rpx;
  --spacing-xl: 48rpx;
  --spacing-2xl: 64rpx;
  --spacing-3xl: 96rpx;
}
```

### 字号 (Font Size)

```css
:root {
  --font-xs: 22rpx;
  --font-sm: 24rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --font-xl: 36rpx;
  --font-2xl: 44rpx;
  --font-3xl: 56rpx;
}
```

### 高度 (Height)

```css
:root {
  /* 按钮高度 */
  --height-btn-xs: 48rpx;
  --height-btn-sm: 56rpx;
  --height-btn-md: 72rpx;
  --height-btn-lg: 88rpx;
  --height-btn-xl: 96rpx;

  /* 输入框高度 */
  --height-input-sm: 56rpx;
  --height-input-md: 64rpx;
  --height-input-lg: 72rpx;

  /* 头像尺寸 */
  --height-avatar-sm: 64rpx;
  --height-avatar-md: 96rpx;
  --height-avatar-lg: 128rpx;
}
```

### 图标 (Icon)

```css
:root {
  --icon-xs: 24rpx;
  --icon-sm: 32rpx;
  --icon-md: 40rpx;
  --icon-lg: 48rpx;
  --icon-xl: 64rpx;
}
```

## 预设主题尺寸

### cute 可爱风（宽松）

```css
[data-theme="cute"] {
  --spacing-md: 24rpx;
  --spacing-lg: 32rpx;
  --font-md: 28rpx;
  --font-lg: 36rpx;
  --height-btn-md: 80rpx;
}
```

### minimal 极简风（紧凑）

```css
[data-theme="minimal"] {
  --spacing-md: 16rpx;
  --spacing-lg: 24rpx;
  --font-md: 26rpx;
  --font-lg: 30rpx;
  --height-btn-md: 72rpx;
}
```

### cyber 硬核风（极限紧凑）

```css
[data-theme="cyber"] {
  --spacing-md: 16rpx;
  --spacing-lg: 20rpx;
  --font-md: 26rpx;
  --font-lg: 28rpx;
  --height-btn-md: 72rpx;
}
```

### business 商务风（标准）

```css
[data-theme="business"] {
  --spacing-md: 24rpx;
  --spacing-lg: 32rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --height-btn-md: 72rpx;
}
```

### fresh 清新风（自然）

```css
[data-theme="fresh"] {
  --spacing-md: 24rpx;
  --spacing-lg: 32rpx;
  --font-md: 28rpx;
  --font-lg: 36rpx;
  --height-btn-md: 80rpx;
}
```

### retro 复古风（紧凑）

```css
[data-theme="retro"] {
  --spacing-md: 16rpx;
  --spacing-lg: 24rpx;
  --font-md: 26rpx;
  --font-lg: 30rpx;
  --height-btn-md: 72rpx;
}
```

### glass 玻璃风（适中）

```css
[data-theme="glass"] {
  --spacing-md: 20rpx;
  --spacing-lg: 28rpx;
  --font-md: 28rpx;
  --font-lg: 36rpx;
  --height-btn-md: 80rpx;
}
```

## 使用方式

```vue
<template>
  <view class="container">
    <text class="title">标题</text>
    <button class="btn">按钮</button>
  </view>
</template>

<style>
.container {
  padding: var(--spacing-lg);
}

.title {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-md);
}

.btn {
  height: var(--height-btn-md);
  padding: 0 var(--spacing-lg);
  font-size: var(--font-md);
}
</style>
```

## 验证清单

- [ ] 所有尺寸使用 CSS 变量
- [ ] 使用 rpx 单位
- [ ] 主题切换时尺寸正确切换
