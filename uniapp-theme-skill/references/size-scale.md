# 全局尺寸系统

本文件定义 uniapp-theme-skill 使用的 CSS 变量尺寸系统。

## 设计原则

1. **CSS 变量优先**：所有尺寸使用 CSS 自定义属性
2. **uni-app 兼容**：使用 rpx 单位
3. **语义化命名**：统一命名 `--space-{n}` / `--font-{size}` / `--height-{comp}-{size}` / `--icon-{size}`
4. **静态值**：所有 rpx 值为静态，禁止 calc()，确保微信小程序兼容
5. **APP 兼容**：CSS 变量带 fallback 值

## 尺寸结构

### 间距（Spacing）

```css
:root {
  --space-0: 0rpx;
  --space-1: 4rpx;
  --space-2: 8rpx;
  --space-3: 12rpx;
  --space-4: 16rpx;
  --space-5: 20rpx;
  --space-6: 24rpx;
  --space-7: 28rpx;
  --space-8: 32rpx;
  --space-10: 40rpx;
  --space-12: 48rpx;
  --space-14: 56rpx;
  --space-16: 64rpx;
  --space-20: 80rpx;
  --space-24: 96rpx;
}
```

### 字号（Font Size）

```css
:root {
  --font-2xs: 20rpx;
  --font-xs: 24rpx;
  --font-sm: 26rpx;
  --font-md: 28rpx;
  --font-lg: 30rpx;
  --font-xl: 32rpx;
  --font-2xl: 40rpx;
  --font-3xl: 48rpx;
}
```

### 高度（Height）

```css
:root {
  /* 按钮高度 */
  --height-btn-sm: 56rpx;
  --height-btn-md: 72rpx;
  --height-btn-lg: 88rpx;

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

### 图标（Icon）

```css
:root {
  --icon-xs: 24rpx;
  --icon-sm: 36rpx;
  --icon-md: 48rpx;
  --icon-lg: 72rpx;
  --icon-xl: 96rpx;
}
```

### 圆角（Radius）

```css
:root {
  --radius-none: 0rpx;
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 9999rpx;
}
```

## 预设主题尺寸

### cute 可爱风（宽松）

```css
[data-theme="cute"] {
  --space-md: 24rpx;
  --space-lg: 32rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --height-btn-md: 80rpx;
}
```

### minimal 极简风（紧凑）

```css
[data-theme="minimal"] {
  --space-md: 16rpx;
  --space-lg: 24rpx;
  --font-md: 26rpx;
  --font-lg: 30rpx;
  --height-btn-md: 72rpx;
}
```

### cyber 硬核风（极限紧凑）

```css
[data-theme="cyber"] {
  --space-md: 16rpx;
  --space-lg: 20rpx;
  --font-md: 26rpx;
  --font-lg: 28rpx;
  --height-btn-md: 72rpx;
}
```

### business 商务风（标准）

```css
[data-theme="business"] {
  --space-md: 24rpx;
  --space-lg: 32rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --height-btn-md: 72rpx;
}
```

### fresh 清新风（自然）

```css
[data-theme="fresh"] {
  --space-md: 24rpx;
  --space-lg: 32rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --height-btn-md: 80rpx;
}
```

### retro 复古风（紧凑）

```css
[data-theme="retro"] {
  --space-md: 16rpx;
  --space-lg: 24rpx;
  --font-md: 26rpx;
  --font-lg: 30rpx;
  --height-btn-md: 72rpx;
}
```

### glass 玻璃风（适中）

```css
[data-theme="glass"] {
  --space-md: 20rpx;
  --space-lg: 28rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --height-btn-md: 80rpx;
}
```

### warm 暖风（适中）

```css
[data-theme="warm"] {
  --space-md: 20rpx;
  --space-lg: 28rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --height-btn-md: 76rpx;
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
  padding: var(--space-lg, 32rpx);
}

.title {
  font-size: var(--font-lg, 30rpx);
  margin-bottom: var(--space-md, 24rpx);
}

.btn {
  height: var(--height-btn-md, 72rpx);
  padding: 0 var(--space-lg, 32rpx);
  font-size: var(--font-md, 28rpx);
}
</style>
```

## 验证清单

- [ ] 所有尺寸使用 CSS 变量
- [ ] 使用 rpx 单位
- [ ] 无 calc() 表达式
- [ ] CSS 变量带 fallback 值
- [ ] 主题切换时尺寸正确切换