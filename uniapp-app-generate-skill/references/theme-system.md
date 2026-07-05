# 主题系统规范

> 本参考文档定义 UniApp 小程序应采用的动态主题系统。核心目标：通过一个主参数（主色 + 间距基数 + 字体基数）自动生成足够的颜色阶、间距阶、字体阶，避免硬编码。

## 设计原则

1. **单一配置入口**：人工只修改 `src/styles/config/_theme-config.scss` 中的少量变量。
2. **参数化生成**：颜色、间距、字体、圆角、阴影全部由基础参数通过函数/映射生成。
3. **语义化使用**：业务代码只使用语义 Token，如 `$color-primary`、`$spacing-default`、`$font-body`。
4. **JS/SCSS 同源**：JS 侧颜色常量 `src/constants/colors.ts` 与 SCSS 变量保持数值一致。

## 主题配置询问清单

在 Skill 初始化项目时，向用户询问以下配置项。若用户未指定，使用默认值。

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| 主色 | `#10b981` | 品牌主色，派生完整主色阶 |
| 成功色 | `#4caf50` | 成功状态 |
| 警告色 | `#ff9800` | 警告状态 |
| 错误色 | `#f44336` | 错误状态 |
| 信息色 | `#2196f3` | 信息提示 |
| 灰阶基准 | `#6b7280` | 派生灰阶 50~950 |
| 间距基数 | `4rpx` | 派生 4/8/12/16/24/32/40/48rpx |
| 字体基数 | `12rpx` | 派生 12/14/16/18/24/30rpx |
| 圆角基数 | `4rpx` | 派生 4/8/12/16rpx |

收集回答后写入 `theme.json`（项目根目录唯一人工源头），然后运行 `npm run theme:sync`，由 `scripts/sync-theme.js` 自动生成：

1. `src/styles/config/_theme-config.scss`；
2. `src/constants/colors.ts`。

`_primitive.scss` 与 `_semantic.scss` 中的原始变量通过引用 `$theme-*` 配置间接生效，无需单独重新生成。

`npm run dev:*` / `npm run build:*` 前会自动执行同步。

## SCSS 配置入口

### _theme-config.scss

> 本文件由 `theme.json` 经 `npm run theme:sync` 自动生成，请勿直接手动修改。

```scss
// 主色：所有品牌色由其派生
$theme-primary: #10b981;

// 功能色
$theme-success: #4caf50;
$theme-warning: #ff9800;
$theme-error: #f44336;
$theme-info: #2196f3;

// 灰阶：自动生成 50 ~ 950
$theme-gray-base: #6b7280;

// 间距基数：4rpx
$theme-spacing-base: 4rpx;

// 字体基数：12rpx
$theme-font-base: 12rpx;

// 圆角基数：4rpx
$theme-radius-base: 4rpx;
```

如需改色，请编辑项目根目录的 `theme.json` 并运行 `npm run theme:sync`。

## 自动生成规则

### 颜色阶

#### 主色阶

由 `$theme-primary` 生成 50 / 100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900：

```scss
@function primary-palette($level) {
  $mix-white: (50, 100, 200, 300, 400);
  $mix-black: (600, 700, 800, 900);

  @if list.index($mix-white, $level) {
    $ratio: (1000 - $level) / 1000 * 90%;
    @return color.mix(#ffffff, $theme-primary, $ratio);
  }

  @if list.index($mix-black, $level) {
    $ratio: ($level - 500) / 1000 * 90%;
    @return color.mix(#000000, $theme-primary, $ratio);
  }

  @return $theme-primary; // 500
}
```

生成示例（主色 #10b981）：

| Token | 生成方式 | 用途 |
|-------|---------|------|
| `$primary-50` | 90% 白 + 主色 | 极浅背景 |
| `$primary-100` | 80% 白 + 主色 | 轻背景 |
| `$primary-200` | 60% 白 + 主色 | hover 背景 |
| `$primary-500` | 主色 | 主按钮、强调 |
| `$primary-700` | 20% 黑 + 主色 | 按下态 |
| `$primary-900` | 40% 黑 + 主色 | 深色强调 |

#### 灰阶

由 `$theme-gray-base` 同样生成 50 ~ 950，用于文字、边框、背景：

```scss
$gray-50: gray-palette(50);   // 近白背景
$gray-100: gray-palette(100); // 页面背景
$gray-300: gray-palette(300); // 边框
$gray-500: gray-palette(500); // 次要文字
$gray-700: gray-palette(700); // 正文
$gray-900: gray-palette(900); // 标题
```

#### 语义颜色 Token

```scss
$color-primary: $primary-500;
$color-primary-light: $primary-100;
$color-primary-dark: $primary-700;

$color-text-primary: $gray-900;
$color-text-secondary: $gray-500;
$color-text-tertiary: $gray-400;
$color-text-placeholder: $gray-300;

$color-bg-primary: #ffffff;
$color-bg-secondary: $gray-50;
$color-bg-tertiary: $gray-100;

$color-border: $gray-200;
$color-border-light: $gray-100;

$color-success: $theme-success;
$color-warning: $theme-warning;
$color-error: $theme-error;
$color-info: $theme-info;
```

### 间距阶

基数 `$theme-spacing-base: 4rpx`，生成 8 级：

```scss
$space-1: $theme-spacing-base * 1;   // 4rpx
$space-2: $theme-spacing-base * 2;   // 8rpx
$space-3: $theme-spacing-base * 3;   // 12rpx
$space-4: $theme-spacing-base * 4;   // 16rpx
$space-5: $theme-spacing-base * 6;   // 24rpx
$space-6: $theme-spacing-base * 8;   // 32rpx
$space-7: $theme-spacing-base * 10;  // 40rpx
$space-8: $theme-spacing-base * 12;  // 48rpx
```

语义 Token：

```scss
$spacing-xs: $space-1;
$spacing-sm: $space-2;
$spacing-default: $space-3;
$spacing-md: $space-4;
$spacing-lg: $space-5;
$spacing-xl: $space-6;
$spacing-xxl: $space-8;
```

### 字体阶

基数 `$theme-font-base: 12rpx`，生成 6 级：

```scss
$font-xs: $theme-font-base * 1;      // 12rpx
$font-sm: $theme-font-base * 1.1667; // 14rpx
$font-md: $theme-font-base * 1.3333; // 16rpx
$font-lg: $theme-font-base * 1.5;    // 18rpx
$font-xl: $theme-font-base * 2;      // 24rpx
$font-xxl: $theme-font-base * 2.5;   // 30rpx
```

语义 Token：

```scss
$font-caption: $font-xs;
$font-body: $font-sm;
$font-subtitle: $font-md;
$font-title: $font-lg;
$font-headline: $font-xl;
$font-display: $font-xxl;
```

### 圆角阶

基数 `$theme-radius-base: 4rpx`：

```scss
$radius-sm: $theme-radius-base * 1;  // 4rpx
$radius-md: $theme-radius-base * 2;  // 8rpx
$radius-lg: $theme-radius-base * 3;  // 12rpx
$radius-xl: $theme-radius-base * 4;  // 16rpx
$radius-full: 9999rpx;
```

### 阴影阶

由主色/灰色派生，保持低饱和度：

```scss
$shadow-1: 0 2rpx 8rpx rgba-with-alpha($gray-900, 0.04);
$shadow-2: 0 4rpx 12rpx rgba-with-alpha($gray-900, 0.08);
$shadow-3: 0 8rpx 24rpx rgba-with-alpha($gray-900, 0.12);
```

## SCSS 工具函数

```scss
@use 'sass:color';

// 为任意颜色附加透明度
@function rgba-with-alpha($base-color, $alpha) {
  @return rgba(color.red($base-color), color.green($base-color), color.blue($base-color), $alpha);
}

// 主色阶取色
@function primary-palette($level) { /* ... */ }

// 灰阶取色
@function gray-palette($level) { /* ... */ }
```

## JS 侧同步

`src/constants/colors.ts` 中定义与 SCSS 同值的常量：

```typescript
export const COLOR_PRIMARY = '#10b981';
export const COLOR_TEXT_PRIMARY = '#111827';
export const COLOR_TEXT_SECONDARY = '#6b7280';
// ...
```

当修改 `_theme-config.scss` 的主色时，必须同步修改 `colors.ts` 顶部常量。未来可接入构建脚本自动生成。

## 使用示例

```vue
<style lang="scss" scoped>
.card {
  padding: $spacing-md;
  background: $color-bg-secondary;
  border-radius: $radius-lg;
  box-shadow: $shadow-1;

  &__title {
    font-size: $font-title;
    color: $color-text-primary;
  }

  &__desc {
    margin-top: $spacing-sm;
    font-size: $font-body;
    color: $color-text-secondary;
  }
}
</style>
```

## 组件级尺寸 Token

除了颜色、间距、字体、圆角之外，业务中常见组件（按钮、TabBar、导航栏、列表项、头像、空状态、卡片等）的高度 / 宽度 / 圆角 / 边距应统一抽取为组件级 Token，放在 `src/styles/tokens/_components.scss` 中，并通过 `variables.scss` 自动注入。

### 命名约定

- 统一以 `$comp-` 为前缀。
- 颜色、间距、字体、圆角仍优先使用语义 Token（`$color-*`、`$spacing-*`、`$font-*`、`$radius-*`），避免重复定义。
- 仅当尺寸服务于“组件级布局”时才在 `_components.scss` 中定义。

### 默认 Token 表

| Token | 默认值 | 用途 |
|-------|--------|------|
| `$comp-button-height-sm` | `56rpx` | 小按钮高度 |
| `$comp-button-height-md` | `80rpx` | 中按钮高度（默认） |
| `$comp-button-height-lg` | `104rpx` | 大按钮高度 |
| `$comp-button-padding-x-sm` | `$spacing-sm` | 小按钮水平内边距 |
| `$comp-button-padding-x-md` | `$spacing-md` | 中按钮水平内边距 |
| `$comp-button-padding-x-lg` | `$spacing-lg` | 大按钮水平内边距 |
| `$comp-button-radius` | `$radius-md` | 按钮圆角 |
| `$comp-tab-bar-height` | `100rpx` | 底部 TabBar 高度 |
| `$comp-navbar-height` | `88rpx` | 顶部导航栏高度（不含状态栏） |
| `$comp-avatar-size-sm` | `80rpx` | 小头像 |
| `$comp-avatar-size-md` | `120rpx` | 中头像 |
| `$comp-avatar-size-lg` | `160rpx` | 大头像 |
| `$comp-list-item-min-height` | `96rpx` | 列表项最小高度 |
| `$comp-list-item-padding-x` | `$spacing-md` | 列表项水平内边距 |
| `$comp-list-item-border-width` | `1rpx` | 列表分隔线/细边框宽度 |
| `$comp-empty-image-size` | `240rpx` | 空状态占位图尺寸 |
| `$comp-user-info-padding-y` | `$spacing-xl` | 用户信息区垂直内边距 |
| `$comp-page-min-height` | `100vh` | 页面最小高度 |
| `$comp-page-padding` | `$spacing-md` | 页面内容区边距 |
| `$comp-card-padding` | `$spacing-lg` | 卡片内边距 |
| `$comp-card-radius` | `$radius-lg` | 卡片圆角 |
| `$comp-hairline-width` | `1rpx` | 通用细边框宽度 |

### 使用示例

```vue
<style lang="scss" scoped>
.menu-item {
  display: flex;
  align-items: center;
  min-height: $comp-list-item-min-height;
  padding: 0 $comp-list-item-padding-x;
  border-bottom: $comp-list-item-border-width solid $color-border;
}

.user-avatar {
  width: $comp-avatar-size-md;
  height: $comp-avatar-size-md;
  border-radius: $radius-full;
}
</style>
```

## 禁止事项

- 禁止在 `.vue` / `.scss` 中直接写 `#10b981`、`rgb(16, 185, 129)`、具体 `24rpx`。
- 禁止新增 Token 时不经过 `_theme-config.scss` 或 `tokens/`。
- 禁止业务代码使用 `_primitive.scss` 中的基础变量，必须通过语义 Token。
