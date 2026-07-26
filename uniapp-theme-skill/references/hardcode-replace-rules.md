# 硬编码替换规则

本文档定义 uniapp-theme-skill 的硬编码替换规则。

## 核心原则

**所有硬编码必须替换为 CSS 变量，不允许任何裸值。**

## 颜色替换规则

### 基础色

| 原始值 | 替换为 |
|--------|--------|
| `#fff`, `#ffffff`, `white` | `var(--white)` |
| `#000`, `#000000`, `black` | `var(--gray-900)` |

### 灰色系

| 原始值 | 替换为 |
|--------|--------|
| `#fafafa` | `var(--gray-50)` |
| `#f5f5f5` | `var(--gray-100)` |
| `#f0f0f0` | `var(--gray-100)` |
| `#e5e5e5` | `var(--gray-200)` |
| `#d4d4d4` | `var(--gray-300)` |
| `#a3a3a3` | `var(--gray-400)` |
| `#737373` | `var(--gray-500)` |
| `#525252` | `var(--gray-600)` |
| `#404040` | `var(--gray-700)` |
| `#262626` | `var(--gray-800)` |
| `#171717` | `var(--gray-900)` |

### 文字色

| 原始值 | 替换为 |
|--------|--------|
| `#333`, `#333333` | `var(--text-primary)` |
| `#666`, `#666666` | `var(--text-secondary)` |
| `#999`, `#999999` | `var(--text-tertiary)` |
| `#ccc`, `#cccccc` | `var(--text-tertiary)` |

### 状态色

| 原始值 | 替换为 |
|--------|--------|
| `red`, `#f00` | `var(--error)` |
| `blue`, `#00f` | `var(--info)` |
| `green` | `var(--success)` |
| `yellow` | `var(--warning)` |

### 主色替换

项目主色 HEX 全部替换为 `var(--primary-500)` 及其色阶变量。

## 尺寸替换规则（rpx）

### 字号

| 原始值 | 替换为 |
|--------|--------|
| `20rpx` | `var(--font-xs)` |
| `22rpx` | `var(--font-xs)` |
| `24rpx` | `var(--font-sm)` |
| `26rpx` | `var(--font-md)` |
| `28rpx` | `var(--font-md)` |
| `30rpx` | `var(--font-lg)` |
| `32rpx` | `var(--font-lg)` |
| `34rpx` | `var(--font-xl)` |
| `36rpx` | `var(--font-xl)` |
| `40rpx` | `var(--font-2xl)` |

### 间距

| 原始值 | 替换为 |
|--------|--------|
| `0rpx`, `0` | `var(--space-0)` |
| `2rpx` | `var(--space-1)` |
| `4rpx` | `var(--space-1)` |
| `6rpx` | `var(--space-2)` |
| `8rpx` | `var(--space-2)` |
| `10rpx` | `var(--space-3)` |
| `12rpx` | `var(--space-3)` |
| `14rpx` | `var(--space-4)` |
| `16rpx` | `var(--space-4)` |
| `18rpx` | `var(--space-5)` |
| `20rpx` | `var(--space-5)` |
| `22rpx` | `var(--space-6)` |
| `24rpx` | `var(--space-6)` |
| `28rpx` | `var(--space-7)` |
| `32rpx` | `var(--space-8)` |
| `40rpx` | `var(--space-10)` |
| `48rpx` | `var(--space-12)` |
| `56rpx` | `var(--space-14)` |
| `64rpx` | `var(--space-16)` |

### 圆角

| 原始值 | 替换为 |
|--------|--------|
| `0`, `0rpx` | `var(--radius-none)` |
| `4rpx` | `var(--radius-sm)` |
| `6rpx` | `var(--radius-sm)` |
| `8rpx` | `var(--radius-sm)` |
| `10rpx` | `var(--radius-md)` |
| `12rpx` | `var(--radius-md)` |
| `14rpx` | `var(--radius-md)` |
| `16rpx` | `var(--radius-md)` |
| `20rpx` | `var(--radius-lg)` |
| `24rpx` | `var(--radius-lg)` |
| `28rpx` | `var(--radius-xl)` |
| `32rpx` | `var(--radius-xl)` |
| `999rpx`, `9999rpx` | `var(--radius-full)` |

### 高度

| 原始值 | 替换为 |
|--------|--------|
| `44rpx` | `var(--height-btn-sm)` |
| `56rpx` | `var(--height-btn-sm)` |
| `60rpx` | `var(--height-btn-md)` |
| `72rpx` | `var(--height-btn-md)` |
| `80rpx` | `var(--height-btn-lg)` |
| `88rpx` | `var(--height-btn-lg)` |

### 图标尺寸

| 原始值 | 替换为 |
|--------|--------|
| `20rpx` | `var(--icon-xs)` |
| `24rpx` | `var(--icon-xs)` |
| `28rpx` | `var(--icon-sm)` |
| `32rpx` | `var(--icon-sm)` |
| `36rpx` | `var(--icon-sm)` |
| `40rpx` | `var(--icon-md)` |
| `48rpx` | `var(--icon-md)` |
| `56rpx` | `var(--icon-lg)` |
| `64rpx` | `var(--icon-lg)` |
| `72rpx` | `var(--icon-lg)` |
| `96rpx` | `var(--icon-xl)` |

## 扫描范围

- `.vue` 文件中的 `<style>` 块
- `.scss` 文件
- `.less` 文件
- `.css` 文件

## 忽略规则

- `node_modules/` 目录
- `dist/` 目录
- 已使用变量的文件不重复替换
