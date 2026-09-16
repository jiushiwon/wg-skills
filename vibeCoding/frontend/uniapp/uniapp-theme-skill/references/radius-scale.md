# 圆角系统

本文件定义 uniapp-theme-skill 使用的 CSS 变量圆角系统。

## 设计原则

1. **两状态设计**：有无圆角两种状态
2. **CSS 变量优先**：所有圆角使用 CSS 自定义属性
3. **语义化命名**：提供组件级别的圆角变量

## 圆角结构

### 基础圆角

```css
:root {
  /* 基础圆角值 */
  --radius-none: 0rpx;
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 9999rpx;
}
```

### 组件圆角（语义化）

```css
:root {
  /* 按钮圆角 */
  --radius-btn: var(--radius-md);

  /* 卡片圆角 */
  --radius-card: var(--radius-md);

  /* 输入框圆角 */
  --radius-input: var(--radius-sm);

  /* 标签圆角 */
  --radius-tag: var(--radius-sm);

  /* 图片圆角 */
  --radius-image: var(--radius-sm);

  /* 头像圆角 */
  --radius-avatar: var(--radius-full);
}
```

## 两状态系统

### 有圆角状态

```css
[data-radius="on"] {
  --radius-btn: var(--radius-full);
  --radius-card: var(--radius-lg);
  --radius-input: var(--radius-md);
  --radius-tag: var(--radius-md);
  --radius-image: var(--radius-md);
}
```

### 无圆角状态

```css
[data-radius="off"] {
  --radius-btn: var(--radius-none);
  --radius-card: var(--radius-none);
  --radius-input: var(--radius-none);
  --radius-tag: var(--radius-none);
  --radius-image: var(--radius-none);
}
```

## 预设主题圆角

### cute 可爱风（胶囊）

```css
[data-theme="cute"] {
  --radius-btn: 9999rpx;
  --radius-card: 32rpx;
  --radius-input: 20rpx;
  --radius-tag: 12rpx;
  --radius-image: 24rpx;
}
```

### minimal 极简风（小圆角）

```css
[data-theme="minimal"] {
  --radius-btn: 8rpx;
  --radius-card: 8rpx;
  --radius-input: 8rpx;
  --radius-tag: 4rpx;
  --radius-image: 4rpx;
}
```

### cyber 硬核风（直角）

```css
[data-theme="cyber"] {
  --radius-btn: 4rpx;
  --radius-card: 4rpx;
  --radius-input: 2rpx;
  --radius-tag: 2rpx;
  --radius-image: 2rpx;
}
```

### business 商务风（小圆角）

```css
[data-theme="business"] {
  --radius-btn: 8rpx;
  --radius-card: 12rpx;
  --radius-input: 8rpx;
  --radius-tag: 4rpx;
  --radius-image: 8rpx;
}
```

### fresh 清新风（中圆角）

```css
[data-theme="fresh"] {
  --radius-btn: 9999rpx;
  --radius-card: 32rpx;
  --radius-input: 20rpx;
  --radius-tag: 16rpx;
  --radius-image: 20rpx;
}
```

### retro 复古风（小圆角）

```css
[data-theme="retro"] {
  --radius-btn: 4rpx;
  --radius-card: 4rpx;
  --radius-input: 4rpx;
  --radius-tag: 2rpx;
  --radius-image: 4rpx;
}
```

### glass 玻璃风（中圆角）

```css
[data-theme="glass"] {
  --radius-btn: 9999rpx;
  --radius-card: 24rpx;
  --radius-input: 16rpx;
  --radius-tag: 16rpx;
  --radius-image: 16rpx;
}
```

## 使用方式

```vue
<template>
  <button class="btn">按钮</button>
  <view class="card">卡片</view>
  <input class="input" />
</template>

<style>
.btn {
  border-radius: var(--radius-btn);
}

.card {
  border-radius: var(--radius-card);
}

.input {
  border-radius: var(--radius-input);
}
</style>
```

## 圆角切换

### 方式1：通过主题切换

```vue
<!-- 切换主题时圆角自动变化 -->
<view data-theme="cute">
  <!-- 按钮是胶囊形状 -->
</view>

<view data-theme="cyber">
  <!-- 按钮是直角 -->
</view>
```

### 方式2：通过 radius 属性切换

```vue
<!-- 强制有圆角 -->
<view data-radius="on">
  <button>圆角按钮</button>
</view>

<!-- 强制无圆角 -->
<view data-radius="off">
  <button>直角按钮</button>
</view>
```

## 验证清单

- [ ] 所有圆角使用 CSS 变量
- [ ] 主题切换时圆角正确变化
- [ ] 两状态系统正常工作
