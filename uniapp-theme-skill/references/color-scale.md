# 主题色阶系统

本文件定义 uniapp-theme-skill 使用的 CSS 变量色阶系统。

## 设计原则

1. **CSS 变量优先**：所有颜色使用 CSS 自定义属性（--variable）
2. **语义化命名**：提供语义化变量（如 --color-primary）指向色阶变量
3. **uni-app 兼容**：所有颜色值使用 HEX 格式，CSS 变量带 fallback
4. **HSL 算法生成**：色阶在 HSL 色彩空间生成，保持色相绝对稳定
5. **多主题支持**：支持 primary/secondary/tertiary/quaternary/quinary 五级色阶
6. **全端兼容**：CSS 变量带 fallback，静态 rpx，无 calc()

## 色阶结构

### 主色阶（Primary Scale 50-950）

每个主题的主色包含 50-950 共 11 个色阶：

```css
:root {
  --primary-50: #f0fdfa;
  --primary-100: #ccfbf1;
  --primary-200: #99f6e4;
  --primary-300: #5eead4;
  --primary-400: #2dd4bf;
  --primary-500: #14b8a6;  /* 主色 */
  --primary-600: #0d9488;
  --primary-700: #0f766e;
  --primary-800: #115e59;
  --primary-900: #134e4a;
  --primary-950: #042f2e;
}
```

### 第二主题色阶（Secondary Scale 50-950）

```css
:root {
  --secondary-50: #eef2ff;
  --secondary-100: #e0e7ff;
  --secondary-200: #c7d2fe;
  --secondary-300: #a5b4fc;
  --secondary-400: #818cf8;
  --secondary-500: #6366f1;  /* 第二主题色 */
  --secondary-600: #4f46e5;
  --secondary-700: #4338ca;
  --secondary-800: #3730a3;
  --secondary-900: #312e81;
  --secondary-950: #1e1b4b;
}
```

### 第三主题色阶（Tertiary Scale 50-950）

```css
:root {
  --tertiary-50: #fffbeb;
  --tertiary-100: #fef3c7;
  --tertiary-200: #fde68a;
  --tertiary-300: #fcd34d;
  --tertiary-400: #fbbf24;
  --tertiary-500: #f59e0b;  /* 第三主题色 */
  --tertiary-600: #d97706;
  --tertiary-700: #b45309;
  --tertiary-800: #92400e;
  --tertiary-900: #78350f;
  --tertiary-950: #451a03;
}
```

### 灰色阶（Gray Scale 50-950）

```css
:root {
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #e5e5e5;
  --gray-300: #d4d4d4;
  --gray-400: #a3a3a3;
  --gray-500: #737373;
  --gray-600: #525252;
  --gray-700: #404040;
  --gray-800: #262626;
  --gray-900: #171717;
  --gray-950: #0a0a0a;
}
```

### 语义化变量

```css
:root {
  /* 基础语义 */
  --color-primary: var(--primary-500, #14b8a6);
  --color-secondary: var(--secondary-500, #6366f1);
  --color-tertiary: var(--tertiary-500, #f59e0b);

  /* 背景语义 */
  --color-bg-page: var(--gray-50, #fafafa);
  --color-bg-surface: #ffffff;
  --color-bg-tinted: var(--primary-50, #f0fdfa);

  /* 文字语义 */
  --color-text-primary: var(--gray-900, #171717);
  --color-text-secondary: var(--gray-600, #525252);
  --color-text-tertiary: var(--gray-400, #a3a3a3);
  --color-text-inverse: #ffffff;

  /* 状态语义 */
  --color-success: var(--success-500, #10B981);
  --color-warning: var(--warning-500, #F59E0B);
  --color-error: var(--error-500, #EF4444);
  --color-info: var(--info-500, #3B82F6);

  /* 边框语义 */
  --color-border: var(--gray-200, #e5e5e5);
  --color-border-light: var(--gray-100, #f5f5f5);
}
```

## HSL 色阶算法

核心思想：在 HSL 色彩空间生成色阶，**保持色相绝对稳定**，仅调整明度和饱和度。

| 档位 | 饱和度 S | 明度 L |
|------|----------|--------|
| 50 | ×0.12 | 98% |
| 100 | ×0.22 | 94% |
| 200 | ×0.38 | 86% |
| 300 | ×0.56 | 74% |
| 400 | ×0.78 | 60% |
| 500 | 基准 | 基准 |
| 600 | ×1.06 | max(L-10, 18%) |
| 700 | ×1.10 | max(L-20, 14%) |
| 800 | ×1.14 | max(L-30, 10%) |
| 900 | ×1.08 | max(L-40, 8%) |
| 950 | ×0.92 | max(L-48, 5%) |

**效果**：无论主色是蓝色、红色还是绿色，生成的色阶色相始终一致，不会出现「蓝色主色换完变成灰紫色」的问题。

## 预设主题色阶（8 套完整）

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
  --primary-950: #1A151A;
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
  --primary-950: #0C1445;
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
  --primary-950: #022C22;
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
  --primary-950: #002A2D;
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
  --primary-950: #2A0E00;
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
  --primary-950: #2E1065;
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
  --primary-950: #000000;
}
```

### warm 暖风

```css
[data-theme="warm"] {
  --primary-50: #FFF7ED;
  --primary-100: #FFEDD5;
  --primary-200: #FED7AA;
  --primary-300: #FDBA74;
  --primary-400: #FB923C;
  --primary-500: #F97316;
  --primary-600: #EA580C;
  --primary-700: #C2410C;
  --primary-800: #9A3412;
  --primary-900: #7C2D12;
  --primary-950: #431407;
}
```

## 使用方式

```vue
<template>
  <button class="btn">按钮</button>
</template>

<style>
.btn {
  background-color: var(--color-primary, #14b8a6);
  color: var(--color-text-inverse, #ffffff);
  border-radius: var(--radius-btn, 9999rpx);
}
</style>
```

## 验证清单

- [ ] 所有颜色使用 CSS 变量
- [ ] 语义化变量正确指向色阶变量
- [ ] 主题切换时颜色正确切换
- [ ] CSS 变量带 fallback 值
- [ ] 色相在切换主题时保持稳定（HSL 算法）