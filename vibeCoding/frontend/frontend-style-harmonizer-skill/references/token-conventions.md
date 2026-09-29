# 变量命名与分层约定

## 1. 双层变量体系

### 编译期变量（SCSS / SASS）

适用于 uniapp 的 `uni.scss`、Vue 的 `variables.scss`。

```scss
// uni.scss

// ===== 颜色 =====
$primary: #c45c48;
$secondary: #d4a574;
$success: #4ade80;
$warning: #fbbf24;
$error: #ef4444;
$info: #3b82f6;

$text-primary: #1a1a1a;
$text-secondary: #6b6b6b;
$text-muted: #a3a3a3;

$bg-page: #fafaf5;
$bg-elevated: #ffffff;
$border: #e5e5e0;

// ===== 间距 =====
$space-1: 4rpx;
$space-2: 8rpx;
$space-3: 16rpx;
$space-4: 24rpx;
$space-5: 32rpx;
$space-6: 48rpx;
$space-7: 64rpx;
$space-8: 96rpx;

// ===== 字号 =====
$text-xs: 20rpx;
$text-sm: 24rpx;
$text-base: 28rpx;
$text-lg: 32rpx;
$text-xl: 40rpx;
$text-2xl: 48rpx;
$text-3xl: 56rpx;

// ===== 圆角 =====
$radius-sm: 4rpx;
$radius-md: 16rpx;
$radius-lg: 24rpx;
$radius-xl: 32rpx;
$radius-full: 999rpx;

// ===== 阴影 =====
$shadow-sm: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
$shadow-md: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
```

### 运行期变量（CSS Custom Properties）

适用于 `tokens.css`、Web 端运行主题切换。

```css
/* tokens.css */

:root {
  /* 颜色 */
  --color-primary: #c45c48;
  --color-secondary: #d4a574;
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  --color-on-surface: #1a1a1a;
  --color-text-secondary: #6b6b6b;
  --color-text-muted: #a3a3a3;

  --color-surface: #fafaf5;
  --color-surface-elevated: #ffffff;
  --color-border: #e5e5e0;

  /* 间距 */
  --space-1: 4rpx;
  --space-2: 8rpx;
  --space-3: 16rpx;
  --space-4: 24rpx;
  --space-5: 32rpx;
  --space-6: 48rpx;
  --space-7: 64rpx;
  --space-8: 96rpx;

  /* 字号 */
  --text-xs: 20rpx;
  --text-sm: 24rpx;
  --text-base: 28rpx;
  --text-lg: 32rpx;
  --text-xl: 40rpx;
  --text-2xl: 48rpx;
  --text-3xl: 56rpx;

  /* 圆角 */
  --radius-sm: 4rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 999rpx;

  /* 阴影 */
  --shadow-sm: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}
```

---

## 2. 命名规范

### 颜色

| 用途 | SCSS 变量 | CSS 变量 |
|------|-----------|----------|
| 主色 | `$primary` | `--color-primary` |
| 副色 | `$secondary` | `--color-secondary` |
| 成功 | `$success` | `--color-success` |
| 警告 | `$warning` | `--color-warning` |
| 错误 | `$error` | `--color-error` |
| 信息 | `$info` | `--color-info` |
| 主文字 | `$text-primary` | `--color-on-surface` |
| 次要文字 | `$text-secondary` | `--color-text-secondary` |
| 弱化文字 | `$text-muted` | `--color-text-muted` |
| 页面背景 | `$bg-page` | `--color-surface` |
| 浮层背景 | `$bg-elevated` | `--color-surface-elevated` |
| 边框 | `$border` | `--color-border` |

### 间距

| 档位 | 值 | SCSS | CSS |
|------|-----|------|-----|
| 1 | 4rpx | `$space-1` | `--space-1` |
| 2 | 8rpx | `$space-2` | `--space-2` |
| 3 | 16rpx | `$space-3` | `--space-3` |
| 4 | 24rpx | `$space-4` | `--space-4` |
| 5 | 32rpx | `$space-5` | `--space-5` |
| 6 | 48rpx | `$space-6` | `--space-6` |
| 7 | 64rpx | `$space-7` | `--space-7` |
| 8 | 96rpx | `$space-8` | `--space-8` |

### 字号

| 档位 | 值 | SCSS | CSS |
|------|-----|------|-----|
| xs | 20rpx | `$text-xs` | `--text-xs` |
| sm | 24rpx | `$text-sm` | `--text-sm` |
| base | 28rpx | `$text-base` | `--text-base` |
| lg | 32rpx | `$text-lg` | `--text-lg` |
| xl | 40rpx | `$text-xl` | `--text-xl` |
| 2xl | 48rpx | `$text-2xl` | `--text-2xl` |
| 3xl | 56rpx | `$text-3xl` | `--text-3xl` |

### 圆角

| 档位 | 值 | SCSS | CSS |
|------|-----|------|-----|
| sm | 4rpx | `$radius-sm` | `--radius-sm` |
| md | 16rpx | `$radius-md` | `--radius-md` |
| lg | 24rpx | `$radius-lg` | `--radius-lg` |
| xl | 32rpx | `$radius-xl` | `--radius-xl` |
| full | 999rpx | `$radius-full` | `--radius-full` |

---

## 3. 分层结构

### 推荐的目录结构

```
src/
├── styles/
│   ├── tokens.css       # CSS 变量（运行期）
│   ├── uni.scss         # SCSS 变量（编译期，uniapp 用）
│   ├── variables.scss   # SCSS 变量（编译期，Vue/React 用）
│   ├── common.scss      # 公共样式类（复用抽取）
│   └── components.scss  # 组件级样式
├── components/
│   └── ui/
│       └── button/
│           └── button.vue
└── pages/
    └── index/
        └── index.vue
```

### 引入方式

#### uniapp

```vue
<!-- App.vue -->
<style lang="scss">
@import '@/static/css/tokens.css';
@import '@/uni.scss';
</style>
```

#### Vue 3

```typescript
// main.ts
import './assets/styles/tokens.css'
```

---

## 4. 迁移策略

### 渐进式迁移

1. **阶段 1**：新增内容使用变量
2. **阶段 2**：逐步替换高频裸值
3. **阶段 3**：清理未使用的旧值

### 过渡映射

如需兼容旧代码，保留旧值并映射到新变量：

```scss
// _migration.scss
$primary-color: $primary;
$primary: $primary; // 兼容旧写法
```

---

## 5. 暗色模式（可选）

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-on-surface: #fafaf5;
    --color-text-secondary: #a3a3a3;
    --color-surface: #171717;
    --color-surface-elevated: #262626;
    --color-border: #404040;
  }
}
```
