# 硬编码替换规则

本文件定义 uniapp-theme-skill 的硬编码替换规则。

## 核心原则

**所有硬编码必须替换为 CSS 变量，不允许任何裸值。**

替换时根据 CSS 属性上下文分类匹配（A/B/C/D/E 五类），确保语义正确。

## 上下文分类

| 类别 | CSS 属性上下文 | 替换策略 |
|------|---------------|----------|
| A | font-size / line-height | 替换为 `--font-{size}` |
| B | padding / margin / gap | 替换为 `--space-{n}` |
| C | width / height | 替换为 `--height-{comp}-{size}` 或 `--icon-{size}` |
| D | border-radius | 替换为 `--radius-{size}` |
| E | px 单位（遗留兼容） | 替换为对应的 rpx 变量 |

## A 类：font-size / line-height 上下文

| 原始值 | 替换为 |
|--------|--------|
| `20rpx` | `var(--font-2xs, 20rpx)` |
| `22rpx` | `var(--font-2xs, 20rpx)` |
| `24rpx` | `var(--font-xs, 24rpx)` |
| `26rpx` | `var(--font-sm, 26rpx)` |
| `28rpx` | `var(--font-md, 28rpx)` |
| `30rpx` | `var(--font-lg, 30rpx)` |
| `32rpx` | `var(--font-xl, 32rpx)` |
| `34rpx` | `var(--font-xl, 32rpx)` |
| `36rpx` | `var(--font-xl, 32rpx)` |

## B 类：padding / margin / gap 上下文

| 原始值 | 替换为 |
|--------|--------|
| `0rpx`, `0` | `var(--space-0, 0rpx)` |
| `2rpx` | `var(--space-1, 2rpx)` |
| `4rpx` | `var(--space-1, 4rpx)` |
| `6rpx` | `var(--space-2, 6rpx)` |
| `8rpx` | `var(--space-2, 8rpx)` |
| `10rpx` | `var(--space-3, 10rpx)` |
| `12rpx` | `var(--space-3, 12rpx)` |
| `14rpx` | `var(--space-4, 14rpx)` |
| `16rpx` | `var(--space-4, 16rpx)` |
| `18rpx` | `var(--space-5, 18rpx)` |
| `20rpx` | `var(--space-5, 20rpx)` |
| `22rpx` | `var(--space-6, 22rpx)` |
| `24rpx` | `var(--space-6, 24rpx)` |
| `28rpx` | `var(--space-7, 28rpx)` |
| `32rpx` | `var(--space-8, 32rpx)` |
| `40rpx` | `var(--space-10, 40rpx)` |
| `48rpx` | `var(--space-12, 48rpx)` |
| `56rpx` | `var(--space-14, 56rpx)` |
| `64rpx` | `var(--space-16, 64rpx)` |

## C 类：width / height 上下文

### 按钮高度

| 原始值 | 替换为 |
|--------|--------|
| `44rpx` | `var(--height-btn-sm, 44rpx)` |
| `56rpx` | `var(--height-btn-sm, 56rpx)` |
| `60rpx` | `var(--height-btn-md, 60rpx)` |
| `72rpx` | `var(--height-btn-md, 72rpx)` |
| `80rpx` | `var(--height-btn-lg, 80rpx)` |
| `88rpx` | `var(--height-btn-lg, 88rpx)` |

### 图标尺寸

| 原始值 | 替换为 |
|--------|--------|
| `24rpx` | `var(--icon-xs, 24rpx)` |
| `36rpx` | `var(--icon-sm, 36rpx)` |
| `48rpx` | `var(--icon-md, 48rpx)` |
| `72rpx` | `var(--icon-lg, 72rpx)` |
| `96rpx` | `var(--icon-xl, 96rpx)` |

### 通用宽度/高度

| 原始值 | 替换为 | 说明 |
|--------|--------|------|
| `40rpx` | `var(--icon-xs, 40rpx)` | 小图标 |
| `60rpx` | `var(--icon-sm, 60rpx)` | 中图标 |
| `80rpx` | `var(--icon-md, 80rpx)` | 大图标 |
| `100rpx` | `var(--size-md, 100rpx)` | 通用尺寸 |
| `120rpx` | `var(--size-img-sm, 120rpx)` | 图片小 |
| `200rpx` | `var(--size-img-md, 200rpx)` | 图片中 |
| `300rpx` | `var(--size-img-lg, 300rpx)` | 图片大 |

## D 类：border-radius 上下文

| 原始值 | 替换为 |
|--------|--------|
| `0`, `0rpx` | `var(--radius-none, 0rpx)` |
| `4rpx` | `var(--radius-sm, 4rpx)` |
| `6rpx` | `var(--radius-sm, 6rpx)` |
| `8rpx` | `var(--radius-sm, 8rpx)` |
| `10rpx` | `var(--radius-md, 10rpx)` |
| `12rpx` | `var(--radius-md, 12rpx)` |
| `14rpx` | `var(--radius-md, 14rpx)` |
| `16rpx` | `var(--radius-md, 16rpx)` |
| `20rpx` | `var(--radius-lg, 20rpx)` |
| `24rpx` | `var(--radius-lg, 24rpx)` |
| `28rpx` | `var(--radius-xl, 28rpx)` |
| `32rpx` | `var(--radius-xl, 32rpx)` |
| `999rpx`, `9999rpx` | `var(--radius-full, 9999rpx)` |

## E 类：px 单位（遗留兼容）

| 原始值 | 替换为 |
|--------|--------|
| `8px` | `var(--space-2, 8rpx)` |
| `12px` | `var(--space-3, 12rpx)` |
| `16px` | `var(--space-4, 16rpx)` |

## 颜色替换规则

### 基础色

| 原始值 | 替换为 |
|--------|--------|
| `#fff`, `#ffffff`, `white` | `var(--text-inverse, #ffffff)` |
| `#000`, `#000000`, `black` | `var(--gray-900, #171717)` |

### 灰色系

| 原始值 | 替换为 |
|--------|--------|
| `#fafafa` | `var(--gray-50, #fafafa)` |
| `#f5f5f5` | `var(--gray-100, #f5f5f5)` |
| `#f0f0f0` | `var(--gray-100, #f5f5f5)` |
| `#e5e5e5` | `var(--gray-200, #e5e5e5)` |
| `#d4d4d4` | `var(--gray-300, #d4d4d4)` |
| `#a3a3a3` | `var(--gray-400, #a3a3a3)` |
| `#737373` | `var(--gray-500, #737373)` |
| `#525252` | `var(--gray-600, #525252)` |
| `#404040` | `var(--gray-700, #404040)` |
| `#262626` | `var(--gray-800, #262626)` |
| `#171717` | `var(--gray-900, #171717)` |

### 文字色

| 原始值 | 替换为 |
|--------|--------|
| `#333`, `#333333` | `var(--text-primary, #171717)` |
| `#666`, `#666666` | `var(--text-secondary, #525252)` |
| `#999`, `#999999` | `var(--text-tertiary, #a3a3a3)` |
| `#ccc`, `#cccccc` | `var(--text-tertiary, #a3a3a3)` |

### 状态色

| 原始值 | 替换为 |
|--------|--------|
| `red`, `#f00` | `var(--error, #EF4444)` |
| `blue`, `#00f` | `var(--info, #3B82F6)` |
| `green` | `var(--success, #10B981)` |
| `yellow` | `var(--warning, #F59E0B)` |

### 主色替换

项目主色 HEX 全部替换为 `var(--color-primary)` 及其色阶变量。

## 扫描范围

- `.vue` 文件中的 `<style>` 块
- `.scss` 文件
- `.less` 文件
- `.css` 文件

## 忽略规则

- `node_modules/` 目录
- `dist/` 目录
- 已使用变量的文件不重复替换

## 执行步骤

1. 扫描 `.vue`, `.scss`, `.less`, `.css` 文件
2. 使用正则匹配硬编码值
3. 根据 CSS 属性上下文分类（A/B/C/D/E）
4. 按映射表替换为 CSS 变量（带 fallback）
5. 备份原文件 `.bak`
6. 生成替换报告