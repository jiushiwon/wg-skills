# 主题色阶系统

本文件定义 uniapp-theme-skill 使用的 CSS 变量色阶系统。

## 设计原则

1. **CSS 变量优先**：所有颜色使用 CSS 自定义属性（--variable）
2. **语义化命名**：提供语义化变量（如 --color-primary）指向色阶变量
3. **uni-app 兼容**：所有颜色值使用 HEX 或 rgba

## 色阶结构

### 主色阶 (Primary Scale)

每个主题的主色包含 50-900 共 9 个色阶：

```css
:root {
  --primary-50: #xxx;
  --primary-100: #xxx;
  --primary-200: #xxx;
  --primary-300: #xxx;
  --primary-400: #xxx;
  --primary-500: #xxx;  /* 主色 */
  --primary-600: #xxx;
  --primary-700: #xxx;
  --primary-800: #xxx;
  --primary-900: #xxx;
}
```

### 灰色阶 (Gray Scale)

```css
:root {
  --gray-50: #xxx;
  --gray-100: #xxx;
  --gray-200: #xxx;
  --gray-300: #xxx;
  --gray-400: #xxx;
  --gray-500: #xxx;
  --gray-600: #xxx;
  --gray-700: #xxx;
  --gray-800: #xxx;
  --gray-900: #xxx;
}
```

### 语义化变量

```css
:root {
  /* 基础语义 */
  --color-primary: var(--primary-500);
  --color-secondary: var(--secondary-500);
  --color-accent: var(--accent-500);

  /* 背景语义 */
  --color-bg-page: var(--gray-50);
  --color-bg-surface: #ffffff;
  --color-bg-tinted: var(--primary-50);

  /* 文字语义 */
  --color-text-primary: var(--gray-900);
  --color-text-secondary: var(--gray-600);
  --color-text-tertiary: var(--gray-400);

  /* 状态语义 */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* 边框语义 */
  --color-border: var(--gray-200);
  --color-border-light: var(--gray-100);
}
```

## 预设主题色阶

### cute 可爱风

```css
[data-theme="cute"] {
  --primary-50: #FFF5F8;
  --primary-100: #FFEDF3;
  --primary-200: #FFD6E4;
  --primary-300: #FFB6D9;
  --primary-400: #FF8FB1;
  --primary-500: #FF8FB1;
  --primary-600: #FF7AA3;
  --primary-700: #FF6B8A;
  --primary-800: #4A3B4A;
  --primary-900: #2D242D;
}
```

### minimal 极简风

```css
[data-theme="minimal"] {
  --primary-50: #FAFAFA;
  --primary-100: #F5F5F5;
  --primary-200: #E5E5E5;
  --primary-300: #D4D4D4;
  --primary-400: #A3A3A3;
  --primary-500: #333333;
  --primary-600: #262626;
  --primary-700: #171717;
  --primary-800: #0A0A0A;
  --primary-900: #000000;
}
```

### cyber 硬核风

```css
[data-theme="cyber"] {
  --primary-50: #E6FEFF;
  --primary-100: #B3FAFF;
  --primary-200: #80F5FF;
  --primary-300: #4DF0FF;
  --primary-400: #1AEFFF;
  --primary-500: #00F0FF;
  --primary-600: #00D0E0;
  --primary-700: #00B0C0;
  --primary-800: #007A80;
  --primary-900: #004D50;
}
```

### business 商务风

```css
[data-theme="business"] {
  --primary-50: #EFF6FF;
  --primary-100: #DBEAFE;
  --primary-200: #BFDBFE;
  --primary-300: #93C5FD;
  --primary-400: #60A5FA;
  --primary-500: #2563EB;
  --primary-600: #1D4ED8;
  --primary-700: #1E40AF;
  --primary-800: #1E3A8A;
  --primary-900: #172554;
}
```

### fresh 清新风

```css
[data-theme="fresh"] {
  --primary-50: #ECFDF5;
  --primary-100: #D1FAE5;
  --primary-200: #A7F3D0;
  --primary-300: #6EE7B7;
  --primary-400: #34D399;
  --primary-500: #34D399;
  --primary-600: #10B981;
  --primary-700: #059669;
  --primary-800: #047857;
  --primary-900: #064E3B;
}
```

### retro 复古风

```css
[data-theme="retro"] {
  --primary-50: #FFFBEB;
  --primary-100: #FEF3C7;
  --primary-200: #FDE68A;
  --primary-300: #FCD34D;
  --primary-400: #FBBF24;
  --primary-500: #D97706;
  --primary-600: #B45309;
  --primary-700: #92400E;
  --primary-800: #78350F;
  --primary-900: #451A03;
}
```

### glass 玻璃风

```css
[data-theme="glass"] {
  --primary-50: #F5F3FF;
  --primary-100: #EDE9FE;
  --primary-200: #DDD6FE;
  --primary-300: #C4B5FD;
  --primary-400: #A78BFA;
  --primary-500: #8B5CF6;
  --primary-600: #7C3AED;
  --primary-700: #6D28D9;
  --primary-800: #5B21B6;
  --primary-900: #4C1D95;
}
```

## 使用方式

```vue
<template>
  <button class="btn">按钮</button>
</template>

<style>
.btn {
  background-color: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-btn);
}
</style>
```

## 验证清单

- [ ] 所有颜色使用 CSS 变量
- [ ] 语义化变量正确指向色阶变量
- [ ] 主题切换时颜色正确切换
