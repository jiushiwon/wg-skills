---
name: uniapp-design-skill
description: uniapp 微信小程序设计系统与组件规范。覆盖 Design Tokens 架构、主题配置、语义变量、按钮组件、组件开发规范、屏幕适配等。触发词："样式规范是什么"、"uniapp 设计系统"、"Design Tokens"、"组件规范"、"屏幕适配"
---

# uniapp 设计系统与组件规范 Skill

## Overview

本 skill 提供 uniapp 微信小程序项目的设计系统与组件开发规范。

**前置依赖**：建议配合 [uniapp-standard-skill](../uniapp-standard-skill/) 使用（红线规则、目录结构、接口规范）

## When to Use

- "样式规范是什么"
- "uniapp 设计系统"
- "Design Tokens"
- "组件规范"
- "屏幕适配"
- "uniapp 样式怎么写"
- "主题配置"
- "颜色变量"

## 快速索引

| 规范主题 | 位置 | 说明 |
|----------|------|------|
| **红线规则** | #一-红线规则 | 专属强制规范 |
| **Design Tokens** | #二-Design-Tokens-架构 | 四层 Token 架构 |
| **主题配置** | #三-主题配置 | 品牌色、功能色、间距 |
| **语义变量** | #四-语义变量 | 文字/背景/功能色 |
| **SCSS 函数与混入** | #五-SCSS-函数与混入 | 色板生成、布局混入 |
| **按钮组件** | #六-按钮组件规范 | 完整组件示例 |
| **组件开发** | #七-组件开发规范 | 目录结构、命名 |
| **屏幕适配** | #八-屏幕适配规范 | 刘海屏、安全区、鸿蒙 |

---

## 一、红线规则

| 编号 | 规则 | 说明 |
|------|------|------|
| D01 | **SCSS 必须用 Token** | 禁止硬编码颜色/字号/间距，统一引用语义变量 |
| D02 | **组件样式用 scoped** | 组件样式必须使用 `scoped` 避免污染 |
| D03 | **props 用 TS 接口** | 组件 Props 必须使用 TypeScript 接口 + `withDefaults` |
| D04 | **屏幕适配走规范** | useNavBarHeight() + safe-area-bottom mixin |
| D05 | **鸿蒙降级处理** | 不支持的 API 必须按 SOP 降级 |

---

## 二、Design Tokens 架构

### 2.1 四层架构

```
styles/
├── config/
│   └── _theme-config.scss     # 唯一人工配置
├── tokens/
│   ├── _primitive.scss        # 基础色板（自动生成）
│   └── _semantic.scss        # 语义变量
├── _functions.scss           # SCSS 函数
├── _mixins.scss              # 混入
└── variables.scss            # 统一出口
```

通过 `vite.config.ts` 自动注入：

```typescript
css: {
  preprocessorOptions: {
    scss: {
      api: 'modern',
      additionalData: `@use "@/styles/variables.scss" as *;`,
    },
  },
},
```

所有组件和页面中无需显式 `@import`，直接使用 `$color-primary` 等变量。

---

## 三、主题配置

```scss
// src/styles/config/_theme-config.scss

// 品牌主色
$theme-primary: #1CC8C4;

// 语义色映射（由主色自动派生，业务层引用）
$color-primary: $theme-primary;

// 功能色（独立于主色）
$theme-success: #22c55e;
$theme-warning: #f59e0b;
$theme-error: #ef4444;
$theme-info: #3b82f6;

// 间距基数
$theme-spacing-base: 4rpx;

// 圆角基数
$theme-radius-base: 8rpx;
```

### 一键换肤

只需修改 `_theme-config.scss` 中的 `$theme-primary`，所有引用 `$color-primary` 的地方自动变色。

---

## 四、语义变量

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

### 4.4 圆角

```scss
$radius-small: $theme-radius-base;       // 8rpx
$radius-medium: $theme-radius-base * 2;   // 16rpx
$radius-large: $theme-radius-base * 3;    // 24rpx
```

### 4.5 阴影

```scss
$shadow-sm: 0 2rpx 4rpx rgba(0, 0, 0, 0.06);
$shadow-md: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
```

### 4.6 边框

```scss
$color-border: #e5e7eb;
$color-border-light: #f0f0f0;
```

### 4.7 使用方式

```scss
.my-component {
  background: $color-bg-primary;
  color: $color-text-primary;
  padding: $spacing-4;
  border-radius: $radius-medium;
}
```

---

## 五、SCSS 函数与混入

### 5.1 色板生成函数

```scss
// src/styles/_functions.scss

@function color-scale($color, $weight) {
  @return mix(white, $color, $weight);
}
```

### 5.2 布局混入

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

### 5.3 文本混入

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

### 5.4 安全区混入

```scss
@mixin safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 六、按钮组件规范

```vue
<!-- src/components/common/Button/index.vue -->
<template>
  <view :class="['btn', type, size, { disabled }]" @click="handleClick">
    <slot />
  </view>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'ghost' | 'gray' | 'danger';
  size?: 'normal' | 'small';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'normal',
  disabled: false,
});

const emit = defineEmits<{ click: [] }>();

function handleClick() {
  if (!props.disabled) emit('click');
}
</script>

<style lang="scss" scoped>
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-weight: 600;
  transition: all 0.2s ease;

  &.normal {
    height: 96rpx;
    border-radius: 48rpx;
    font-size: 32rpx;
  }

  &.small {
    height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
  }

  &.primary {
    background: $color-primary;
    color: $color-text-inverse;
  }

  &.ghost {
    background: $color-bg-primary;
    color: $color-primary;
    border: 2rpx solid $color-primary;
  }

  &.gray {
    background: $color-bg-tertiary;
    color: $color-text-secondary;
  }

  &.danger {
    background: $color-error;
    color: $color-text-inverse;
  }

  &.disabled {
    opacity: 0.5;
  }
}
</style>
```

---

## 七、组件开发规范

### 7.1 目录结构

```
components/
├── common/
│   ├── Button/
│   │   ├── index.vue
│   │   └── index.json
│   ├── Card/
│   │   ├── index.vue
│   │   └── index.json
│   └── index.ts
└── index.ts
```

### 7.2 规范要求

- **props**：使用 TypeScript 接口定义，默认值使用 `withDefaults`
- **emit**：使用 `defineEmits` 泛型
- **样式**：使用 `scoped`，必须通过 Design Tokens 引用
- **命名**：目录即命名空间，index.vue 为入口

---

## 八、屏幕适配规范

### 8.1 顶部适配

```typescript
// src/composables/useNavBarHeight.ts
export function useNavBarHeight() {
  const systemInfo = uni.getSystemInfoSync();
  const statusBarHeight = systemInfo.statusBarHeight || 0;
  return { statusBarHeight, navBarHeight };
}
```

### 8.2 底部安全区

```scss
// src/styles/_mixins.scss
@mixin safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 8.3 鸿蒙降级

```typescript
// src/utils/platform.ts
export function isHarmonyOS(): boolean;

export function checkCapability(capability: string): boolean {
  // 检测平台能力，不支持时降级处理
}
```

---

## References

- `references/design-tokens.md` — Design Tokens 架构详解（含 CSS 变量、JS 导出、一键换肤脚本）