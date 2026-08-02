---
name: uniapp-style-skill
description: uniapp 微信小程序设计系统与组件规范。覆盖 Design Tokens 架构、主题配置、排版系统、间距系统、语义变量、SCSS 函数与混入、动画过渡、组件规范、屏幕适配、深色模式。支持扫描项目中硬编码颜色/字号/间距等设计违规并自动修复。触发词："样式规范"、"uniapp 设计系统"、"Design Tokens"、"组件规范"、"屏幕适配"、"字体大小"、"间距规范"、"深色模式"、"设计审计"、"修复硬编码样式"
---

# uniapp 设计系统与组件规范 Skill

## Overview

本 skill 提供 uniapp 微信小程序项目的设计系统与组件开发规范。

**与相关 skill 的定位边界**：

| Skill | 职责 | 与本 skill 的关系 |
|-------|------|-------------------|
| [uniapp-standard-skill](../uniapp-standard-skill/) | 通用开发规范（红线规则、目录结构、接口规范） | 前置依赖，本 skill 专注 UI 与视觉层面 |
| [uniapp-theme-skill](../uniapp-theme-skill/) | 主题系统引擎：基于 CSS 变量的三维度（色阶+尺寸+圆角）一键换肤 | 互补关系。本 skill 定义 SCSS 设计与组件规范，theme-skill 负责 CSS 变量运行时主题切换。两者可共存：design-skill 的 SCSS 变量编译时注入，theme-skill 的 CSS 变量运行时覆盖 |
| [uniapp-components-skill](../uniapp-components-skill/) | 登录鉴权与安全规范 | 正交关系，无直接交集 |

## When to Use

- "样式规范是什么"
- "uniapp 设计系统"
- "Design Tokens"
- "组件规范"
- "屏幕适配"
- "uniapp 样式怎么写"
- "主题配置"
- "颜色变量"
- "字体大小规范"
- "间距规范"
- "深色模式"
- "dark mode"
- "设计审计"
- "扫描硬编码样式"
- "修复硬编码"

## 快速索引

| 规范主题 | 位置 | 说明 |
|----------|------|------|
| **红线规则** | #一-红线规则 | 专属强制规范（32 条） |
| **Design Tokens** | #二-Design-Tokens-架构 | 四层 Token 架构 |
| **主题配置** | #三-主题配置 | 品牌色、功能色、深色模式开关 |
| **排版系统** | #四-排版系统 | 字号、行高、字重、字体家族、文本层级（H1-H4+Body+Caption） |
| **间距系统** | #五-间距系统 | 基于 4rpx 基数的间距阶梯 + Page Gutter + 模块间距 |
| **语义变量** | #六-语义变量 | 文字颜色（基色自动派生）/背景/功能色/边框/圆角/阴影/Z 层级 |
| **SCSS 函数与混入** | #七-SCSS-函数与混入 | 色板生成、布局/文本/安全区/细线混入 |
| **动画与过渡** | #八-动画与过渡 | 时长、缓动曲线 Token |
| **按钮组件** | #九-按钮组件规范 | Button 组件 + 底部固定按钮全局样式 |
| **核心组件** | #十-核心组件规范 | Card/Modal/Toast/Input/NavBar/Popup/Divider/Badge/ListItem/Avatar/Checkbox/Grid/Image/状态组件 |
| **交互状态** | #十一-交互状态 | 8 种交互状态 + 最小触摸区域 44pt |
| **组件开发** | #十二-组件开发规范 | 目录结构、命名、props/emit/slots、禁止第三方组件库 |
| **屏幕适配** | #十三-屏幕适配规范 | 安全区/rpx/滚动/横屏/鸿蒙/胶囊/自定义导航栏/底部菜单全局实施 |
| **深色模式** | #十四-深色模式 | prefers-color-scheme 适配策略与 Token 参考值 |
| **设计审计** | #十五-设计合规审计 | 扫描硬编码颜色/字号/间距 + 自动修复 |
| **Utility 工具类** | #十六-Utility-全局工具类 | Flex/间距/文字/背景/圆角/阴影等高频原子类 |

---

## 一、红线规则

| 编号 | 规则 | 说明 |
|------|------|------|
| D01 | **SCSS 必须用 Token** | 禁止硬编码颜色/字号/间距/圆角/shadow/z-index，统一引用语义变量 |
| D02 | **组件样式用 scoped** | 组件样式必须使用 `scoped` 避免污染；穿透子组件用 `:deep()` |
| D03 | **props 用 TS 接口** | 组件 Props 必须使用 TypeScript 接口 + `withDefaults` |
| D04 | **屏幕适配走规范** | useNavBarHeight() + safe-area-bottom mixin |
| D05 | **鸿蒙降级处理** | 不支持的 API 必须按 SOP 降级 |
| D06 | **字号禁止硬编码** | 必须使用 `$font-size-*` 语义变量，不得直接写 `font-size: 32rpx` |
| D07 | **SCSS 嵌套 ≤ 3 层** | 防止过深选择器产生特异性和性能问题 |
| D08 | **动画限用 transform/opacity** | 小程序性能要求，避免触发 layout/paint 重排 |
| D09 | **z-index 禁止硬编码** | 必须引用 `$z-*` 层级 token |
| D10 | **深色模式可切换** | 页面级组件必须兼容 `prefers-color-scheme: dark` 或 `data-theme="dark"` |
| D11 | **全页滚动禁止 scroll-view** | 页面级滚动走 page 原生流，不套 `<scroll-view>`。局部滚动才用且 padding 必须加在直系子元素上 |
| D12 | **自定义导航栏必须对齐胶囊** | 标题/搜索栏/自定义内容必须与胶囊按钮同一行水平居中对齐，右侧留出胶囊区域不侵入，向下排列 |
| D13 | **Popup 必须有进出场动画** | 所有 Popup 必须滑入滑出（slide-in/slide-out），禁止无动画突然出现消失。内边距统一用公共样式 |
| D14 | **页面外边距必须统一** | 所有页面左右外边距及内部模块距边界距离必须保持一致，使用公共 `.page-container` 或 `$page-gutter` Token |
| D15 | **底部菜单必须全局统一** | 启用自定义 TabBar 则所有 tab 页面必须使用自定义，禁止部分自定义部分默认混用。新增 tab 页面也必须用自定义 |
| D16 | **自定义头部必须全局统一 + 对齐胶囊** | 启用自定义导航栏则所有页面必须去掉默认头部。新增页面禁止使用默认头。自定义头部内容第一行必须与胶囊按钮水平居中对齐，绝对不允许遮挡或跑到胶囊上方 |
| D17 | **模块间距必须一致** | 同一页面内所有模块（任意标签或组件）的内边距、外间距必须统一。A 模块和 B 模块用同样的 padding，A 和 B 之间的 gap 也统一。禁止不同模块各自写不同的 padding/margin 值 |
| D18 | **圆角必须全局统一** | 所有元素的圆角必须使用 `$radius-*` Token。组件/标签/卡片/弹窗/按钮的圆角值从同一套主题变量中取值，禁止各自写死不同值 |
| D19 | **底部悬浮按钮走全局样式** | 页面级底部固定按钮必须使用 `.btn-fixed-bottom` 公共类，禁止各页面各自写样式。主题色/圆角/高度/宽度由全局统一定义 |
| D20 | **分割线必须统一** | 所有 Divider 使用 `.divider` 公共类或 `$divider-color` / `$divider-width` Token |
| D21 | **徽标标签必须统一** | Badge/Tag 使用公共样式类 `.badge` / `.tag-*`，颜色/字号/圆角/内边距统一 |
| D22 | **列表项必须统一** | ListItem 使用公共结构（图标+标题+副标题+右箭头），间距/字号/颜色统一 |
| D23 | **文本层级必须统一** | 标题/正文/辅助文字使用预设类 `.text-h1`~`.text-h4` `.text-body` `.text-caption`，禁止裸写 font-size |
| D24 | **可点击区域 ≥ 44pt** | 所有交互元素点击区域最小 44x44pt（≈88rpx），低于此值视为违规 |
| D25 | **头像必须统一** | Avatar 使用公共样式，尺寸/圆角/默认占位图统一 |
| D26 | **表单控件必须统一** | Checkbox/Radio/Switch 样式统一，颜色/尺寸/间距从 Token 取值 |
| D27 | **宫格必须统一** | Grid 宫格使用公共 `.grid-*` 类，列数/间距/图标尺寸统一 |
| D28 | **图片必须有占位和兜底** | 所有 `<image>` 必须设 mode + 占位图 + error 兜底 |
| D29 | **禁止第三方组件库** | 统一使用 uni 官方组件 + 原生标签，禁止引入第三方 UI 组件库（如 uView/Vant/ColorUI） |
| D30 | **Utility 类必须统一** | 常用 flex/间距/文字对齐等必须用全局 utility class（`.flex` `.flex-between` `.gap-*` `.text-center` 等），禁止各处重复写同样的内联样式 |
| D31 | **文字颜色必须从基色派生** | 次级/三级/禁用文字色由 `$color-text-primary` 自动派生（tint），不是硬编码。改主文字色一处，全部联动 |
| D32 | **空列表必须用 Empty 组件** | 任何存在列表渲染的页面，数据为空时必须使用 `<Empty>` 组件。禁止各页面各自写"暂无数据"的样式 |

---

## 二、Design Tokens 架构

### 2.1 四层架构

```
styles/
├── config/
│   └── _theme-config.scss     # 唯一人工配置
├── tokens/
│   ├── _primitive.scss        # 基础色板/尺寸阶梯（自动生成）
│   └── _semantic.scss        # 语义变量（业务代码唯一引用入口）
├── _functions.scss           # SCSS 函数
├── _mixins.scss              # 混入
└── variables.scss            # 统一出口
```

### 2.2 自动注入

```typescript
// vite.config.ts
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

> **与 uniapp-theme-skill 的共存**：theme-skill 使用 CSS 变量（`--primary-500`）实现运行时主题切换。本 skill 的 SCSS 变量在编译时注入，两者可共存：SCSS 变量编译为静态值，CSS 变量在运行时覆盖。详细桥接方案见 `references/design-tokens.md` §7。

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

// 字号基数
$theme-font-size-base: 2rpx;

// 深色模式开关
$theme-dark-enabled: true;
```

**一键换肤**：只需修改 `$theme-primary`，所有引用 `$color-primary` 的地方自动变色。

---

## 四、排版系统

### 4.1 字号阶梯

```scss
$font-size-xs: $theme-font-size-base * 10;   // 20rpx — 辅助文字
$font-size-sm: $theme-font-size-base * 12;   // 24rpx — 标签、说明
$font-size-md: $theme-font-size-base * 14;   // 28rpx — 正文、列表
$font-size-lg: $theme-font-size-base * 16;   // 32rpx — 标题、按钮
$font-size-xl: $theme-font-size-base * 18;   // 36rpx — 大标题
$font-size-xxl: $theme-font-size-base * 20;  // 40rpx — 页面主标题
$font-size-xxxl: $theme-font-size-base * 24; // 48rpx — 特殊场景（营销数字）
```

### 4.2 行高

```scss
$line-height-tight: 1.2;    // 标题
$line-height-normal: 1.5;   // 正文
$line-height-relaxed: 1.8;  // 长文本、说明
```

### 4.3 字重

```scss
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### 4.4 字体家族

```scss
$font-family-base: -apple-system, BlinkMacSystemFont, "Helvetica Neue",
                   "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
                   "Segoe UI", Roboto, sans-serif;
$font-family-number: "DIN Alternate", "Helvetica Neue", Arial, sans-serif;
```

### 4.5 文本层级（H1-H4 + Body + Caption）

禁止各页面裸写 font-size/font-weight/line-height，统一使用预设类：

```scss
// src/styles/_typography.scss

// 页面主标题 — 每个页面只有一个
.text-h1 {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  color: $color-text-primary;
}

// 区块标题
.text-h2 {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
  color: $color-text-primary;
}

// 卡片/列表项标题
.text-h3 {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  line-height: $line-height-normal;
  color: $color-text-primary;
}

// 小标题
.text-h4 {
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  line-height: $line-height-normal;
  color: $color-text-primary;
}

// 正文
.text-body {
  font-size: $font-size-md;
  font-weight: $font-weight-normal;
  line-height: $line-height-relaxed;
  color: $color-text-secondary;
}

// 辅助文字/说明/时间戳
.text-caption {
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  line-height: $line-height-normal;
  color: $color-text-tertiary;
}

// 价格/数字
.text-price {
  font-family: $font-family-number;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-error;
}
```

使用示例：
```vue
<text class="text-h1">页面标题</text>
<text class="text-h2">区块标题</text>
<text class="text-body">正文内容正文内容...</text>
<text class="text-caption">2024-01-01</text>
```

---

## 五、间距系统

基于 `$theme-spacing-base: 4rpx` 的间距阶梯：

```scss
$spacing-0: 0;
$spacing-1: $theme-spacing-base * 1;    // 4rpx  — 极小间距
$spacing-2: $theme-spacing-base * 2;    // 8rpx  — 紧凑间距
$spacing-3: $theme-spacing-base * 3;    // 12rpx — 常规内边距
$spacing-4: $theme-spacing-base * 4;    // 16rpx — 标准间距
$spacing-5: $theme-spacing-base * 5;    // 20rpx
$spacing-6: $theme-spacing-base * 6;    // 24rpx — 卡片内边距
$spacing-8: $theme-spacing-base * 8;    // 32rpx — 页面水平边距
$spacing-10: $theme-spacing-base * 10;  // 40rpx — 区块间距
$spacing-12: $theme-spacing-base * 12;  // 48rpx — 大区块间距
$spacing-16: $theme-spacing-base * 16;  // 64rpx — 页面上下留白
```

**使用约定**：
- 页面左右边距：`$spacing-8`（32rpx）
- 卡片内边距：`$spacing-6`（24rpx）
- 列表项间距：`$spacing-4`（16rpx）
- 元素内边距：`$spacing-3`（12rpx）

### 5.2 页面级外边距（Page Gutter）

#### 硬规则

> 所有页面的左右外边距、内部模块距离页面左右边界的距离必须保持一致。不允许 A 页面用 32rpx、B 页面用 24rpx、C 页面某个模块用 40rpx。

#### 定义 Page Gutter Token

```scss
// src/styles/tokens/_semantic.scss

$page-gutter: $spacing-8;  // 页面左右外边距，全局唯一
```

#### 公共页面容器样式

```scss
// src/styles/_page.scss — 全局引入

.page-container {
  padding: 0 $page-gutter;
}

.page-section {
  margin: $spacing-6 $page-gutter;
}

// 页面第一个 section 紧贴顶部
.page-section-first {
  margin: 0 $page-gutter;
}

// 页面最后一个 section 底部加安全区
.page-section-last {
  margin: $spacing-6 $page-gutter;
  padding-bottom: $spacing-16;
}

// 通栏区域（需要背景色撑满时用）
.page-fullwidth {
  margin-left: -$page-gutter;
  margin-right: -$page-gutter;
  padding: $spacing-6 $page-gutter;
  background: $color-bg-secondary;
}
```

#### 使用方式

```vue
<!-- ✅ 正确：全页面统一 -->
<template>
  <view class="page">
    <!-- 顶部区域：左右统一边距 -->
    <view class="page-section-first">
      <text class="section-title">标题</text>
      ...
    </view>

    <!-- 模块区域：左右边距一致 -->
    <view class="page-section">
      <Card :bordered="true">
        ...
      </Card>
    </view>

    <!-- 通栏背景区域 -->
    <view class="page-fullwidth">
      <text>撑满整行的背景色区域</text>
    </view>

    <!-- 模块区域：边距不变 -->
    <view class="page-section page-section-last">
      ...
    </view>
  </view>
</template>
```

```vue
<!-- ❌ 错误：各自为政 -->
<template>
  <view class="page">
    <view style="padding: 0 32rpx">...</view>
    <view style="margin: 24rpx 24rpx">...</view>
    <view style="padding-left: 40rpx">...</view>
  </view>
</template>
```

#### 视觉对比

```
❌ 各模块边距不一致                     ✅ 统一 Page Gutter
┌──────────────────────────┐           ┌──────────────────────────┐
│  ← 32rpx  [标题]  32rpx →│           │  ← 32rpx  [标题]  32rpx →│
├──────────────────────────┤           ├──────────────────────────┤
│← 24rpx [卡片A] 24rpx    →│           │  ← 32rpx  [卡片A] 32rpx →│
├──────────────────────────┤           ├──────────────────────────┤
│←40rpx→ [Banner]  ←40rpx→│           │  ← 32rpx [Banner] 32rpx →│
├──────────────────────────┤           ├──────────────────────────┤
│   ← 32rpx [列表]  32rpx →│           │  ← 32rpx  [列表]  32rpx →│
└──────────────────────────┘           └──────────────────────────┘
```

#### 例外情况

以下场景允许偏离 `$page-gutter`，但必须用注释说明原因：

| 场景 | 允许做法 | 原因 |
|------|----------|------|
| 轮播图/通栏 Banner | 负 margin 撑破到 0 | 视觉需要满屏，内部文字仍需 `$page-gutter` |
| 沉浸式头图 | 0 边距 | 内容区以下才恢复 `$page-gutter` |
| 左右滑动的 Tab/分类栏 | 0 边距 | 交互需要边缘对齐，第一个/最后一个选项需 `$page-gutter` 左/右缩进 |

### 5.3 模块间距规范

#### 硬规则

> 同一页面内所有模块（section/卡片/列表/标签/组件），**内边距**彼此相同，**外间距**彼此相同。禁止不同模块各自定义不同的 padding 和 margin。

#### 定义模块间距 Token

```scss
// src/styles/tokens/_semantic.scss

$section-padding: $spacing-6;   // 模块内边距，全局唯一
$section-margin: $spacing-4;    // 模块间距，全局唯一
```

#### 公共模块样式

```scss
// src/styles/_page.scss

.section {
  margin: 0 $page-gutter $section-margin;
  padding: $section-padding;
  background: $color-bg-primary;
  border-radius: $radius-medium;

  &:last-child {
    margin-bottom: $spacing-16; // 最后一个模块底部留白（适配安全区）
  }
}

// 无背景无圆角的纯内容模块
.section-plain {
  margin: 0 $page-gutter $section-margin;

  &:last-child {
    margin-bottom: $spacing-16;
  }
}
```

#### 使用方式

```vue
<!-- ✅ 正确：所有模块统一用 .section -->
<template>
  <view class="page">
    <CustomNavbar title="页面标题" />

    <view class="page-body" :style="{ paddingTop: layout.totalNavBarHeight + 'px' }">
      <!-- 模块 1 -->
      <view class="section">
        <text class="section-title">用户信息</text>
        <Avatar />
      </view>

      <!-- 模块 2 — 内边距和模块 1 完全一致 -->
      <view class="section">
        <text class="section-title">订单列表</text>
        <OrderItem />
        <OrderItem />
      </view>

      <!-- 模块 3 — 间距不变 -->
      <view class="section">
        <text class="section-title">常用功能</text>
        <Grid />
      </view>

      <!-- 纯文本模块 — 也用统一间距 -->
      <view class="section-plain">
        <text class="section-title">说明</text>
        <text>一些文本内容...</text>
      </view>
    </view>
  </view>
</template>
```

```vue
<!-- ❌ 错误：各模块各自为政 -->
<template>
  <view class="page">
    <view style="margin: 24rpx 32rpx; padding: 24rpx">...</view>
    <view style="margin: 20rpx 32rpx; padding: 16rpx">...</view>
    <view style="margin: 32rpx 24rpx; padding: 20rpx">...</view>
  </view>
</template>
```

#### 例外情况

| 场景 | 做法 |
|------|------|
| 模块内部子元素间距 | 可以不同，例：标题距内容 16rpx、列表项之间 12rpx |
| 粘性定位模块 | padding 不变，但 margin 可为 0（如固定在顶部的筛选栏） |
| 弹窗内模块 | 走 `.popup-content` 规则，不适用 `$page-gutter` |

---

## 六、语义变量

### 6.1 文字颜色

> 所有文字颜色由 `$color-text-primary` 自动派生，**不硬编码**。改基色一处，全部联动。

```scss
// 基色：全局唯一文字主色（接近黑色）
$color-text-primary: #2b2e31;

// 自动派生的文字色阶（tint = 混入白色 = 变浅）
$color-text-secondary: tint($color-text-primary, 30%);   // 副标题、说明文字
$color-text-tertiary: tint($color-text-primary, 50%);    // 时间、作者、左下角/右下角信息
$color-text-disabled: tint($color-text-primary, 70%);    // 禁用、占位符
$color-text-placeholder: tint($color-text-primary, 70%);

// 独立色（不参与派生）
$color-text-inverse: #ffffff;                            // 深色背景上的反色文字
$color-text-link: #3498db;                               // 链接色
```

使用约定：

| 场景 | 变量 | 示例 |
|------|------|------|
| 卡片/列表标题 | `$color-text-primary` | `font-size: $font-size-lg` |
| 副标题、描述 | `$color-text-secondary` | `font-size: $font-size-sm` |
| 时间戳、作者名、左下角/右下角信息 | `$color-text-tertiary` | `font-size: $font-size-xs` |
| 禁用态、占位符 | `$color-text-disabled` | — |

> 想换整体文字风格？改 `$color-text-primary` 的 hex 值，次级色自动变浅。

### 6.2 背景颜色

```scss
$color-bg-primary: #ffffff;
$color-bg-secondary: #fafafa;
$color-bg-tertiary: #f5f5f5;
$color-bg-warm: #fff8e1;
$color-bg-error-light: #ffebee;
$color-bg-success-light: #e8f5f0;
$color-bg-mask: rgba(0, 0, 0, 0.6);
```

### 6.3 功能色

```scss
$color-success: $theme-success;
$color-warning: $theme-warning;
$color-error: $theme-error;
$color-info: $theme-info;
```

### 6.4 边框

```scss
$color-border: #e5e7eb;
$color-border-light: #f0f0f0;
$border-width-base: 2rpx;
```

### 6.5 圆角

```scss
$radius-none: 0;
$radius-small: $theme-radius-base;        // 8rpx  — 标签、小按钮
$radius-medium: $theme-radius-base * 2;   // 16rpx — 卡片、弹窗
$radius-large: $theme-radius-base * 3;    // 24rpx — 大卡片
$radius-round: 999rpx;                    // 胶囊按钮
$radius-circle: 50%;                      // 圆形（头像）
```

**使用约定**：
- 卡片：`$radius-medium`
- 弹窗：`$radius-medium`
- 按钮：`$radius-round`（胶囊）/ `$radius-small`（小按钮）
- 标签：`$radius-small`
- 输入框：`$radius-small`
- 头像：`$radius-circle`

> **禁止**任何元素使用不在上述列表中的圆角值，也禁止组件内自定义 `border-radius: 12rpx` 之类，必须从 `$radius-*` 中取值。

### 6.6 阴影

```scss
$shadow-sm: 0 2rpx 4rpx rgba(0, 0, 0, 0.06);
$shadow-md: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
$shadow-none: none;
```

### 6.7 Z 层级

```scss
$z-base: 0;         // 默认内容层
$z-dropdown: 100;   // 下拉菜单
$z-sticky: 200;     // 吸顶元素
$z-overlay: 300;    // 蒙层
$z-modal: 400;      // 弹窗/对话框
$z-toast: 500;      // Toast/消息提示
$z-tooltip: 600;    // 气泡提示
$z-max: 999;        // 最高层（loading 全屏遮罩）
```

### 6.8 使用方式

```scss
.my-component {
  background: $color-bg-primary;
  color: $color-text-primary;
  font-size: $font-size-md;
  line-height: $line-height-normal;
  padding: $spacing-4;
  border-radius: $radius-medium;
  box-shadow: $shadow-sm;
  z-index: $z-sticky;
}
```

---

## 七、SCSS 函数与混入

### 7.1 色板生成函数

```scss
// src/styles/_functions.scss

// 生成浅色变体（tint）
@function tint($color, $weight) {
  @return mix(white, $color, $weight);
}

// 生成深色变体（shade）
@function shade($color, $weight) {
  @return mix(black, $color, $weight);
}

// 通用色阶（兼容旧写法）
@function color-scale($color, $weight, $mode: 'light') {
  @if $mode == 'dark' {
    @return mix(black, $color, $weight);
  }
  @return mix(white, $color, $weight);
}
```

### 7.2 完整主色色板

```scss
// 浅色
$color-primary-50: tint($theme-primary, 95%);
$color-primary-100: tint($theme-primary, 90%);
$color-primary-200: tint($theme-primary, 70%);
$color-primary-300: tint($theme-primary, 50%);
$color-primary-400: tint($theme-primary, 30%);
$color-primary-500: $theme-primary;
// 深色
$color-primary-600: shade($theme-primary, 10%);
$color-primary-700: shade($theme-primary, 20%);
$color-primary-800: shade($theme-primary, 40%);
$color-primary-900: shade($theme-primary, 60%);
```

### 7.3 布局混入

```scss
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

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### 7.4 文本混入

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

### 7.5 卡片混入

```scss
@mixin card-container {
  margin: $spacing-4 $spacing-8;
  background-color: $color-bg-primary;
  border-radius: $radius-medium;
  padding: $spacing-6;
  box-shadow: $shadow-sm;
}
```

### 7.6 安全区混入

```scss
@mixin safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

@mixin safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
```

### 7.7 1px 细线边框

```scss
@mixin hairline($color: $color-border, $direction: all) {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    pointer-events: none;

    @if $direction == 'top' {
      top: 0;
      left: 0;
      right: 0;
      border-top: 1px solid $color;
      transform: scaleY(0.5);
    } @else if $direction == 'bottom' {
      bottom: 0;
      left: 0;
      right: 0;
      border-bottom: 1px solid $color;
      transform: scaleY(0.5);
    } @else if $direction == 'left' {
      top: 0;
      left: 0;
      bottom: 0;
      border-left: 1px solid $color;
      transform: scaleX(0.5);
    } @else if $direction == 'right' {
      top: 0;
      right: 0;
      bottom: 0;
      border-right: 1px solid $color;
      transform: scaleX(0.5);
    } @else {
      top: 0;
      left: 0;
      width: 200%;
      height: 200%;
      border: 1px solid $color;
      transform: scale(0.5);
      transform-origin: 0 0;
    }
  }
}
```

---

## 八、动画与过渡

### 8.1 时长 Token

```scss
$transition-duration-fast: 150ms;    // 微交互（hover、active）
$transition-duration-normal: 250ms;  // 常规过渡（展开、收起）
$transition-duration-slow: 400ms;    // 大型动画（弹窗出入、页面切换）
```

### 8.2 缓动曲线

```scss
$ease-in: cubic-bezier(0.4, 0, 1, 1);
$ease-out: cubic-bezier(0, 0, 0.2, 1);
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
$ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 8.3 使用示例

```scss
.card {
  transition: transform $transition-duration-normal $ease-out,
              box-shadow $transition-duration-normal $ease-out;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}
```

---

## 九、按钮组件规范

```vue
<!-- src/components/common/Button/index.vue -->
<template>
  <view
    :class="['btn', type, size, { disabled, loading, block, round }]"
    :hover-class="disabled || loading ? '' : 'btn-hover'"
    @click="handleClick"
  >
    <view v-if="loading" class="btn-loading">
      <view class="loading-icon" />
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'ghost' | 'gray' | 'danger'
  size?: 'normal' | 'small'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'normal',
  disabled: false,
  loading: false,
  block: true,
  round: false,
})

const emit = defineEmits<{ click: [] }>()

function handleClick() {
  if (!props.disabled && !props.loading) emit('click')
}
</script>

<style lang="scss" scoped>
.btn {
  @include flex-center;
  display: inline-flex;
  font-weight: $font-weight-semibold;
  transition: opacity $transition-duration-fast $ease-out,
              transform $transition-duration-fast $ease-out;

  &.block { width: 100%; display: flex; }

  &.normal {
    height: 96rpx;
    border-radius: 48rpx;
    font-size: $font-size-lg;
    padding: 0 $spacing-8;
  }

  &.small {
    height: 64rpx;
    border-radius: 32rpx;
    font-size: $font-size-md;
    padding: 0 $spacing-6;
  }

  &.round { border-radius: $radius-round; }

  &.primary {
    background: $color-primary;
    color: $color-text-inverse;
  }

  &.ghost {
    background: $color-bg-primary;
    color: $color-primary;
    border: $border-width-base solid $color-primary;
  }

  &.gray {
    background: $color-bg-tertiary;
    color: $color-text-secondary;
  }

  &.danger {
    background: $color-error;
    color: $color-text-inverse;
  }

  &.disabled, &.loading {
    opacity: 0.5;
    pointer-events: none;
  }

  &-hover {
    opacity: 0.8;
    transform: scale(0.97);
  }

  .btn-loading { margin-right: $spacing-2; }

  .loading-icon {
    width: $font-size-lg;
    height: $font-size-lg;
    border: 3rpx solid currentColor;
    border-top-color: transparent;
    border-radius: $radius-circle;
    animation: btn-spin 800ms linear infinite;
  }
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
</style>
```

### 9.5 底部固定按钮全局样式

不是组件——是一个全局 CSS 类，所有页面直接套用。

#### 定义

```scss
// src/styles/_page.scss — 全局引入

.btn-fixed-bottom {
  position: fixed;
  left: $page-gutter;
  right: $page-gutter;
  bottom: $spacing-8;
  height: 96rpx;
  border-radius: $radius-round;
  background: $color-primary;
  color: $color-text-inverse;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-sticky;
  @include safe-area-bottom;

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// 双按钮版本：左侧次要 + 右侧主要
.btn-fixed-bottom-double {
  position: fixed;
  left: $page-gutter;
  right: $page-gutter;
  bottom: $spacing-8;
  height: 96rpx;
  display: flex;
  gap: $spacing-4;
  z-index: $z-sticky;
  @include safe-area-bottom;

  .btn-secondary {
    flex: 1;
    height: 100%;
    border-radius: $radius-round;
    background: $color-bg-secondary;
    color: $color-text-secondary;
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    @include flex-center;
    &:active { opacity: 0.8; transform: scale(0.98); }
  }

  .btn-primary {
    flex: 1;
    height: 100%;
    border-radius: $radius-round;
    background: $color-primary;
    color: $color-text-inverse;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    @include flex-center;
    &:active { opacity: 0.8; transform: scale(0.98); }
  }
}
```

#### 使用方式

```vue
<!-- 单按钮 -->
<template>
  <view class="page">
    <view class="page-body" :style="{ paddingBottom: safeBottom + 'px' }">
      ...
    </view>
    <view class="btn-fixed-bottom" @click="onSubmit">确认提交</view>
  </view>
</template>
```

```vue
<!-- 双按钮 -->
<template>
  <view class="page">
    <view class="page-body" :style="{ paddingBottom: safeBottom + 'px' }">
      ...
    </view>
    <view class="btn-fixed-bottom-double">
      <view class="btn-secondary" @click="onCancel">取消</view>
      <view class="btn-primary" @click="onConfirm">确认</view>
    </view>
  </view>
</template>

<script setup lang="ts">
const safeBottom = computed(() => 96 + 16 + 'rpx') // 按钮高 + bottom间距
</script>
```

> **页面内容区必须加 `padding-bottom`**，否则底部内容被按钮遮挡。

---

## 十、核心组件规范

### 10.1 Card 卡片

```
目录：components/common/Card/index.vue
Props: title, padding, shadow, radius, bordered
Slots: default, header, footer
样式：bg-white + radius-medium + shadow-sm，padding-$spacing-6
```

### 10.2 Modal 弹窗

```
目录：components/common/Modal/index.vue
Props: visible, title, showClose, maskClosable, zIndex ($z-modal)
Slots: default, footer
适配：底部安全区 + safe-area-bottom
动画：fade-in + slide-up，duration-normal
```

### 10.3 Toast 轻提示

```
目录：components/common/Toast/index.vue
Props: message, type (success/error/warning/info), duration, zIndex ($z-toast)
动画：fade-in-out，duration-fast
```

### 10.4 Input 输入框要求

```
Props: modelValue, placeholder, type, maxlength, clearable, disabled, prefixIcon, suffixIcon, error
状态：default → focus → filled → error → disabled
样式：height 96rpx，border-bottom hairline，font-size-md，placeholder $color-text-placeholder
错误态：border-color $color-error，error slot 显示红色提示 font-size-sm
```

### 10.5 NavBar 导航栏要求

```
Props: title, showBack, backgroundColor, fixed
适配：自动注入 statusBarHeight
Slot: left, center, right
高度：statusBarHeight + 44px（导航栏）
```

### 10.6.Empty 空状态组件

#### 硬规则

> 任何存在列表渲染的页面，数据为空时必须使用 `<Empty>` 组件。禁止各页面各自写 `<text>暂无数据</text>` 或自定义空态样式。

#### 组件约定

- **禁止滚动**：组件外层 `overflow: hidden`，不随页面内容滚动
- **垂直居中**：内容区在可视区域内垂直居中
- **默认图标**：内置默认空态占位图，`src` prop 可自定义
- **默认文字**："暂无数据"，`$color-text-tertiary`（自动从基色派生）
- **禁止页面各自写**空态样式

#### 完整实现

```vue
<!-- src/components/common/Empty/index.vue -->
<template>
  <view class="empty">
    <image
      class="empty-icon"
      :src="image || defaultIcon"
      mode="aspectFit"
    />
    <text class="empty-text">{{ text }}</text>
    <slot />
  </view>
</template>

<script setup lang="ts">
import DEFAULT_EMPTY from '@/static/images/empty.png'

interface Props {
  text?: string
  image?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '暂无数据',
})

const defaultIcon = DEFAULT_EMPTY
</script>

<style lang="scss" scoped>
.empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;  // 禁止滚动
}

.empty-icon {
  width: 240rpx;
  height: 240rpx;
}

.empty-text {
  margin-top: $spacing-6;
  font-size: $font-size-md;
  color: $color-text-tertiary;
}
</style>
```

#### 使用方式

```vue
<template>
  <view class="page">
    <!-- 列表有数据 -->
    <view v-if="list.length > 0" class="page-body">
      <view v-for="item in list" :key="item.id" class="list-item">...</view>
    </view>

    <!-- 列表为空：必须用 Empty -->
    <Empty v-else />

    <!-- 自定义图标+文字 -->
    <Empty v-else image="/static/icons/no-order.png" text="暂无订单" />
  </view>
</template>
```

### 10.6 状态组件（Loading / Skeleton / ErrorState）

| 组件 | 目录 | Props | Emit |
|------|------|-------|------|
| **Loading** | `loading/index.vue` | visible, text, mask | — |
| **Skeleton** | `skeleton/index.vue` | loading, animated, rows | — |
| **ErrorState** | `error-state/index.vue` | message, showRetry | retry |

### 10.7 Popup 弹出层规范

#### 硬规则

> 所有 Popup 必须**滑入滑出**，禁止无动画突然出现消失。内边距统一用公共样式类 `popup-content`。

#### 动画配置

```scss
// src/styles/_popup-animations.scss

// 底部弹出
@keyframes popup-slide-up-in {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes popup-slide-up-out {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}

// 居中弹出
@keyframes popup-zoom-in {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes popup-zoom-out {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.8); opacity: 0; }
}

// 右侧滑出
@keyframes popup-slide-right-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes popup-slide-right-out {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}
```

#### 统一内边距公共样式

```scss
// src/styles/_popup-mixins.scss

.popup-content {
  padding: $spacing-6 $spacing-8;
}

.popup-header {
  padding: $spacing-6 $spacing-8;
  border-bottom: $border-width-base solid $color-border-light;
}

.popup-footer {
  padding: $spacing-4 $spacing-8;
  @include safe-area-bottom;
}
```

> 所有 Popup 内层内容区必须使用 `.popup-content` 类，**禁止各 Popup 各自定义不同 padding**。

#### 完整组件

```vue
<!-- src/components/common/Popup/index.vue -->
<template>
  <view v-if="visible || animating" class="popup-root">
    <!-- 蒙层：渐进渐出 -->
    <view
      class="popup-mask"
      :class="{ 'mask-visible': visible }"
      :style="{ zIndex: zIndex || 400 /* $z-modal */ }"
      @click="onMaskClick"
    />

    <!-- 内容面板：滑入滑出 -->
    <view
      class="popup-panel"
      :class="[
        `panel-${position}`,
        { 'panel-visible': visible, 'panel-leave': !visible && animating }
      ]"
      :style="{ zIndex: (zIndex || 400 /* $z-modal */) + 1 }"
      @animationend="onAnimationEnd"
    >
      <!-- 头部（可选） -->
      <view v-if="$slots.header || title" class="popup-header">
        <slot name="header">
          <text class="popup-title">{{ title }}</text>
          <view v-if="showClose" class="popup-close" @click="onClose">
            <text class="icon-close">✕</text>
          </view>
        </slot>
      </view>

      <!-- 内容区域：统一内边距 -->
      <scroll-view v-if="scrollable" scroll-y class="popup-scroll">
        <view class="popup-content">
          <slot />
        </view>
      </scroll-view>
      <view v-else class="popup-content">
        <slot />
      </view>

      <!-- 底部（可选） -->
      <view v-if="$slots.footer" class="popup-footer">
        <slot name="footer" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  visible: boolean
  title?: string
  showClose?: boolean
  maskClosable?: boolean
  scrollable?: boolean
  position?: 'bottom' | 'center' | 'right'
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  showClose: true,
  maskClosable: true,
  scrollable: false,
  position: 'bottom',
  zIndex: 400,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
  open: []
}>()

const animating = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    animating.value = true
    nextTick(() => emit('open'))
  } else {
    animating.value = true
  }
})

function onMaskClick() {
  if (props.maskClosable) onClose()
}

function onClose() {
  emit('update:visible', false)
  emit('close')
}

function onAnimationEnd() {
  if (!props.visible) animating.value = false
}
</script>

<style lang="scss" scoped>
.popup-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

// 蒙层
.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-bg-mask;
  opacity: 0;
  transition: opacity $transition-duration-normal $ease-out;
  pointer-events: none;

  &.mask-visible {
    opacity: 1;
    pointer-events: auto;
  }
}

// 内容面板
.popup-panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: $color-bg-primary;
  pointer-events: auto;

  // 底部弹出（默认）
  &.panel-bottom {
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: $radius-large $radius-large 0 0;
    transform: translateY(100%);
    animation: popup-slide-up-in $transition-duration-normal $ease-out forwards;

    &.panel-leave {
      animation: popup-slide-up-out $transition-duration-normal $ease-in forwards;
    }
  }

  // 居中弹出
  &.panel-center {
    left: 10%;
    right: 10%;
    top: 50%;
    border-radius: $radius-medium;
    transform: translateY(-50%) scale(0.8);
    opacity: 0;
    animation: popup-zoom-in $transition-duration-normal $ease-out forwards;

    &.panel-leave {
      animation: popup-zoom-out $transition-duration-normal $ease-in forwards;
    }
  }

  // 右侧滑出
  &.panel-right {
    top: 0;
    right: 0;
    bottom: 0;
    width: 80%;
    transform: translateX(100%);
    animation: popup-slide-right-in $transition-duration-normal $ease-out forwards;

    &.panel-leave {
      animation: popup-slide-right-out $transition-duration-normal $ease-in forwards;
    }
  }

  &.panel-visible {
    transform: translateY(0);
  }
}

// 统一内边距 — 禁止各 Popup 各自定义
.popup-content {
  padding: $spacing-6 $spacing-8;
}

.popup-header {
  padding: $spacing-6 $spacing-8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: $border-width-base solid $color-border-light;
}

.popup-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.popup-close {
  position: absolute;
  right: $spacing-6;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  @include flex-center;
}

.popup-footer {
  padding: $spacing-4 $spacing-8;
  @include safe-area-bottom;
}

.popup-scroll {
  flex: 1;
  min-height: 0;
}
</style>
```

#### 使用示例

```vue
<template>
  <Popup
    v-model:visible="showShare"
    title="分享到"
    position="bottom"
    :scrollable="true"
  >
    <view class="share-list">
      <view v-for="item in shareItems" :key="item.name" class="share-item">
        ...
      </view>
    </view>
  </Popup>
</template>
```

#### 禁止行为

| ❌ 禁止 | ✅ 必须 |
|---------|---------|
| 各 Popup 各自写 `padding: 24rpx 32rpx` | 统一用 `.popup-content` 公共类 |
| 出现消失无动画 | `@keyframes` slide/zoom + `animation` |
| 动画用 `top/left/height` | 只能用 `transform` + `opacity` |
| 蒙层不变透明度 | transition `opacity` 渐进渐出 |
| 内容区不加 scroll-view 导致超出无法滚动 | `scrollable` prop + `scroll-view` |

### 10.8 Divider 分割线

```scss
// src/styles/_page.scss

.divider {
  width: 100%;
  height: 1px;
  background: $color-border-light;
  transform: scaleY(0.5);  // 1px 细线

  &-inset { margin: 0 $page-gutter; }       // 左右缩进水槽
  &-spaced { margin: $section-margin 0; }    // 带上下间距（模块间用）
}

// 带文字的分割线
.divider-text {
  display: flex;
  align-items: center;
  margin: $section-margin $page-gutter;
  color: $color-text-tertiary;
  font-size: $font-size-sm;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: $color-border-light;
    transform: scaleY(0.5);
  }
  &::before { margin-right: $spacing-4; }
  &::after { margin-left: $spacing-4; }
}
```

### 10.9 Badge / Tag 徽标标签

```scss
// src/styles/_components.scss

// 圆点徽标
.badge-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: $radius-circle;
  background: $color-error;
}

// 数字徽标（右上角悬浮）
.badge {
  position: relative;
  &::after {
    content: attr(data-count);
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    min-width: 32rpx;
    height: 32rpx;
    padding: 0 8rpx;
    border-radius: $radius-round;
    background: $color-error;
    color: $color-text-inverse;
    font-size: $font-size-xs;
    line-height: 32rpx;
    text-align: center;
    white-space: nowrap;
  }
}

// 标签
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2rpx $spacing-2;
  border-radius: $radius-small;
  font-size: $font-size-xs;
  line-height: $line-height-normal;

  &-primary { background: $color-primary-50; color: $color-primary-700; }
  &-success { background: $color-bg-success-light; color: $color-success; }
  &-warning { background: $color-bg-warm; color: $color-warning; }
  &-error { background: $color-bg-error-light; color: $color-error; }
  &-default { background: $color-bg-tertiary; color: $color-text-tertiary; }
}
```

### 10.10 ListItem 列表项

```vue
<!-- components/common/ListItem/index.vue -->
<template>
  <view class="list-item" :class="{ clickable }" @click="onClick">
    <image v-if="icon" :src="icon" class="list-item-icon" />
    <view class="list-item-body">
      <text class="list-item-title">{{ title }}</text>
      <text v-if="subtitle" class="list-item-subtitle">{{ subtitle }}</text>
    </view>
    <view v-if="$slots.extra" class="list-item-extra">
      <slot name="extra" />
    </view>
    <text v-if="showArrow" class="list-item-arrow">›</text>
  </view>
</template>
```

```scss
.list-item {
  display: flex;
  align-items: center;
  padding: $spacing-5 $page-gutter;
  min-height: 96rpx;
  background: $color-bg-primary;

  & + & { border-top: 1px solid $color-border-light; }

  &-icon { width: 48rpx; height: 48rpx; margin-right: $spacing-4; }
  &-body { flex: 1; min-width: 0; }
  &-title { font-size: $font-size-md; color: $color-text-primary; }
  &-subtitle { font-size: $font-size-sm; color: $color-text-tertiary; margin-top: $spacing-1; }
  &-extra { margin-left: $spacing-4; }
  &-arrow { margin-left: $spacing-2; font-size: $font-size-xl; color: $color-text-disabled; }
}
```

### 10.11 Avatar 头像

```scss
.avatar {
  flex-shrink: 0;
  border-radius: $radius-circle;
  overflow: hidden;
  background: $color-bg-tertiary;

  &-sm { width: 64rpx; height: 64rpx; }
  &-md { width: 96rpx; height: 96rpx; }
  &-lg { width: 128rpx; height: 128rpx; }

  &-square { border-radius: $radius-small; }
}
```

### 10.12 Checkbox / Radio / Switch

```scss
// 统一尺寸 token
$control-size: 40rpx;       // 勾选/单选图标尺寸
$control-color: $color-primary;
$control-border: $color-border;

.radio-group, .checkbox-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.radio-item, .checkbox-item {
  display: flex;
  align-items: center;
  min-height: 88rpx;  // ≥44pt
  padding: 0 $spacing-3;
  gap: $spacing-3;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  padding: 0 $page-gutter;
}
```

### 10.13 Grid 宫格

```scss
.grid {
  display: flex;
  flex-wrap: wrap;

  &-2 > .grid-item { width: 50%; }
  &-3 > .grid-item { width: 33.33%; }
  &-4 > .grid-item { width: 25%; }
  &-5 > .grid-item { width: 20%; }
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-6 $spacing-4;

  .grid-icon { width: 72rpx; height: 72rpx; margin-bottom: $spacing-2; }
  .grid-text { font-size: $font-size-sm; color: $color-text-secondary; }
}
```

### 10.14 Image 图片规范

```vue
<template>
  <image
    :src="src"
    :mode="mode"
    class="img"
    :class="{ 'img-cover': mode === 'aspectFill', 'img-contain': mode === 'aspectFit' }"
    :style="{ borderRadius: radius }"
    @error="onError"
    @load="onLoad"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DEFAULT_PLACEHOLDER from '@/static/images/placeholder.png'
import DEFAULT_ERROR from '@/static/images/image-error.png'

const props = withDefaults(defineProps<{
  src: string
  mode?: 'aspectFill' | 'aspectFit' | 'widthFix' | 'scaleToFill'
  radius?: string
}>(), { mode: 'aspectFill' })

const displaySrc = ref(props.src)

function onError() { displaySrc.value = DEFAULT_ERROR }
function onLoad() { /* loaded */ }
</script>
```

```scss
.img {
  background: $color-bg-tertiary;
  &-cover { width: 100%; height: 100%; object-fit: cover; }
  &-contain { width: 100%; height: 100%; object-fit: contain; }
}

// 固定宽高比的图片容器
.img-ratio {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: $color-bg-tertiary;

  &::before { content: ''; display: block; }
  &-1x1::before { padding-top: 100%; }
  &-16x9::before { padding-top: 56.25%; }
  &-4x3::before { padding-top: 75%; }

  image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
```

---

## 十一、交互状态

组件必须覆盖以下交互状态：

| 状态 | 视觉表现 | 触发方式 |
|------|----------|----------|
| **default** | 正常样式 | 基础样式 |
| **hover** | 轻微变亮/变暗（PC 预览） | `:hover` / `hover-class` |
| **active** | scale(0.97-0.98) + 阴影减弱 | `:active` / `hover-class` |
| **focus** | 边框高亮为主色 | `:focus` |
| **disabled** | opacity: 0.5 + pointer-events: none | `.disabled` class |
| **loading** | opacity: 0.5 + spinner + 禁止点击 | `.loading` class |
| **error** | 红色边框 + 错误文字 | `.error` class |
| **success** | 绿色反馈 | `.success` class |

**小程序注意**：因 uni-app 的 `hover-class` 不支持 `:active`，统一使用 `hover-class="xxx-hover"` 实现按下态，同时保留 `:active` 作为 H5 端的补充。

### 11.1 最小触摸区域

> 所有可交互元素（按钮、图标、复选框、列表项、Tab 等）的点击区域 **必须 ≥ 44x44pt**（≈88rpx）。

```scss
// 图标按钮至少撑到 88rpx
.icon-btn {
  width: 88rpx;
  height: 88rpx;
  @include flex-center;
}

// 小文本链接用 padding 撑大点击区
.text-link {
  padding: $spacing-3;
  margin: -$spacing-3;
}

// Checkbox/Radio 默认点击区太小，加 padding
.radio-item, .checkbox-item {
  min-height: 88rpx;
}
```

---

## 十二、组件开发规范

### 12.1 目录结构

```
components/
├── common/
│   ├── Button/
│   │   └── index.vue
│   ├── Card/
│   │   └── index.vue
│   ├── Modal/
│   │   └── index.vue
│   └── index.ts
├── business/
│   └── UserCard/
│       └── index.vue
└── index.ts
```

### 12.2 规范要求

- **props**：使用 TypeScript 接口定义，默认值使用 `withDefaults`
- **emit**：使用 `defineEmits` 泛型，事件名用 kebab-case
- **样式**：使用 `scoped`，必须通过 Design Tokens 引用。穿透子组件用 `:deep(.child-class)`
- **命名**：目录即命名空间，index.vue 为入口
- **Slots**：明确声明命名插槽，提供默认 fallback
- **exports**：`components/common/index.ts` 中集中导出

### 12.3 通用组件索引文件

```typescript
// components/common/index.ts
export { default as Button } from './Button/index.vue'
export { default as Card } from './Card/index.vue'
export { default as Modal } from './Modal/index.vue'
export { default as Toast } from './Toast/index.vue'
export { default as Input } from './Input/index.vue'
export { default as NavBar } from './NavBar/index.vue'
export { default as Loading } from './Loading/index.vue'
export { default as Skeleton } from './Skeleton/index.vue'
export { default as Empty } from './Empty/index.vue'
export { default as ErrorState } from './ErrorState/index.vue'
```

### 12.4 组件库限制

> 禁止引入任何第三方 UI 组件库（uView / Vant Weapp / ColorUI / iView 等）。统一使用 **uni 官方组件 + 原生标签 + 本 skill 定义的公共样式**。

检查清单：
- [ ] `package.json` 中无第三方 UI 库依赖
- [ ] `components/` 下无第三方组件源码
- [ ] 无 `@import '~uview-ui/...'` 或 `import Vant from 'vant-weapp'`

---

### 13.1 顶部适配

```typescript
// src/composables/useNavBarHeight.ts
export function useNavBarHeight() {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  const navBarContentHeight = 44 // 标准导航内容高度(pt)
  const totalNavBarHeight = statusBarHeight + navBarContentHeight

  return { statusBarHeight, navBarContentHeight, totalNavBarHeight }
}
```

### 13.2 底部安全区

```scss
@mixin safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

@mixin safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
```

### 13.3 rpx 换算工具

```typescript
// src/utils/px-to-rpx.ts
const systemInfo = uni.getSystemInfoSync()
const screenWidth = systemInfo.screenWidth

export const rpxToPx = (rpx: number) => (rpx * screenWidth) / 750
export const pxToRpx = (px: number) => (px * 750) / screenWidth
```

- 设计稿以 **750px 宽度**为基准，`1rpx = 屏幕宽度 / 750`
- 组件内部一律使用 `rpx`，仅在调用系统 API 时使用 `px`

### 13.4 滚动行为规范

**全页面滚动** — 禁止用 `<scroll-view>`，走 page 原生流，体验最佳：

```vue
<template>
  <view class="page">
    <view class="section">...</view>
    <view class="section">...</view>
  </view>
</template>
```

**局部滚动** — 必须用 `<scroll-view>` 时，padding/margin 永远加在直系子元素上，否则右侧会被滚动条吃掉：

```vue
<!-- ❌ -->
<scroll-view scroll-y style="padding: 0 32rpx">

<!-- ✅ -->
<scroll-view scroll-y>
  <view class="scroll-inner">
    ...
  </view>
</scroll-view>

<style lang="scss" scoped>
.scroll-inner {
  padding: $spacing-6 $spacing-8;
}
</style>
```

### 13.5 横屏适配

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isLandscape = ref(false)

uni.onWindowResize((res) => {
  isLandscape.value = res.size.windowWidth > res.size.windowHeight
})
</script>
```

### 13.6 鸿蒙降级

```typescript
// src/utils/platform.ts
export function isHarmonyOS(): boolean {
  const sys = uni.getSystemInfoSync() as any
  return sys.platform === 'harmonyos'
}

export function checkCapability<T>(fn: () => T, fallback?: T): T | undefined {
  try {
    return fn()
  } catch {
    console.warn('[Capability] 不支持，使用降级方案')
    return fallback
  }
}
```

### 13.7 胶囊按钮对齐规范

#### 问题场景

当 `pages.json` 中设置 `navigationStyle: "custom"` 后，页面顶部会出现原生胶囊按钮（关闭/更多）。自定义标题、搜索栏若位置不当，会出现：

- **垂直不齐**：标题偏上或偏下，跟胶囊不在同一行
- **水平重叠**：标题/搜索框延伸到胶囊区域，被遮挡
- **左右偏移**：标题居中但胶囊在右，视觉上不是真正的居中

#### 硬规则

> 自定义导航栏中有标题/搜索栏/输入框时，必须与胶囊按钮**同一行水平居中对齐**，右侧内容不得侵入胶囊区域。

#### 核心 API

```typescript
const rect = uni.getMenuButtonBoundingClientRect()
// rect.top      — 胶囊顶部距离屏幕顶部
// rect.bottom   — 胶囊底部距离屏幕顶部
// rect.height   — 胶囊高度
// rect.left     — 胶囊左侧距离屏幕左边
```

#### 完整实现

```typescript
// src/composables/useCapsuleLayout.ts
import { ref, onMounted } from 'vue'

interface CapsuleLayout {
  statusBarHeight: number
  navBarContentHeight: number
  totalNavBarHeight: number
  capsuleHeight: number
  capsuleGap: number
  capsuleCenterY: number
  contentMaxWidth: number
}

export function useCapsuleLayout(): CapsuleLayout {
  const sys = uni.getSystemInfoSync()
  const menu = uni.getMenuButtonBoundingClientRect()

  const statusBarHeight = sys.statusBarHeight || 0
  const capsuleGap = sys.windowWidth - menu.right
  const navBarContentHeight = (menu.bottom - statusBarHeight) + (menu.top - statusBarHeight)
  const totalNavBarHeight = menu.bottom + (menu.top - statusBarHeight)
  const capsuleCenterY = menu.top + menu.height / 2
  const contentMaxWidth = menu.left - capsuleGap * 2

  return {
    statusBarHeight,
    navBarContentHeight,
    totalNavBarHeight,
    capsuleHeight: menu.height,
    capsuleGap,
    capsuleCenterY,
    contentMaxWidth,
  }
}
```

#### 模板布局

```vue
<template>
  <view class="custom-navbar" :style="{ paddingTop: layout.statusBarHeight + 'px' }">
    <view class="navbar-content" :style="{ height: layout.navBarContentHeight + 'px' }">
      <view class="navbar-left" :style="{ width: layout.capsuleGap + 'px' }">
        <slot name="left" />
      </view>

      <view
        class="navbar-center"
        :style="{
          maxWidth: layout.contentMaxWidth + 'px',
          height: layout.capsuleHeight + 'px',
        }"
      >
        <slot name="center">
          <text class="navbar-title">标题</text>
        </slot>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-sticky;
  background: $color-bg-primary;
}

.navbar-content {
  display: flex;
  align-items: center;
}

.navbar-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  @include text-ellipsis;
}
</style>
```

#### 不同内容类型的对齐

```vue
<!-- 纯标题 -->
<view class="navbar-center">
  <text class="navbar-title">页面标题</text>
</view>

<!-- 搜索栏：与胶囊等高 -->
<view class="navbar-center">
  <input
    class="navbar-search"
    :style="{
      height: layout.capsuleHeight + 'px',
      width: layout.contentMaxWidth + 'px',
    }"
    placeholder="搜索"
  />
</view>

<!-- 标题 + 副标题：整体垂直居中 -->
<view class="navbar-center">
  <text class="navbar-title">主标题</text>
  <text class="navbar-subtitle">副标题</text>
</view>
```

#### 常见错误

| 错误 | 后果 | 正确做法 |
|------|------|----------|
| `padding-top: 88rpx` 写死 | 不同机型状态栏高度不同，偏了 | 用 `getMenuButtonBoundingClientRect()` 动态算 |
| 标题 `width: 100%` + `text-align: center` | 视觉偏右，胶囊占了右侧 | 标题区 `maxWidth` = 胶囊左侧 - 左右对称间隙 |
| 搜索框宽度用 `windowWidth` | 伸进胶囊区域，被遮挡 | `maxWidth` 限制 |
| 标题区不设高度 | 各行内容高度不同时，无法与胶囊垂直居中 | `height` = `capsuleHeight`，flexbox align-items: center |

### 13.8 自定义头部全局实施

启用 D16 后，需同步改造两处配置和所有页面：

**`pages.json`**：
```json
{
  "globalStyle": {
    "navigationStyle": "custom"
  }
}
```
`globalStyle` 中设 `custom` 后，所有页面默认无原生导航栏。

**页面模板**：
```vue
<!-- 所有页面统一的壳 -->
<template>
  <view class="page">
    <!-- 自定义导航栏：胶囊对齐见 §13.7 -->
    <CustomNavbar title="页面标题" />

    <!-- 内容区：顶部偏移 = totalNavBarHeight -->
    <view class="page-body" :style="{ paddingTop: layout.totalNavBarHeight + 'px' }">
      <view class="page-section">
        ...
      </view>
    </view>
  </view>
</template>
```

**新增页面检查清单**：
- [ ] 没有 `<navigationBarTitleText>` 残留
- [ ] 引入了 `<CustomNavbar>`
- [ ] 内容区 `paddingTop` = `totalNavBarHeight`
- [ ] 标题/搜索栏等第一行内容与胶囊对齐（D12）

### 13.9 自定义底部菜单全局实施

启用 D15 后，三步完成改造：

**`pages.json`**：
```json
{
  "tabBar": {
    "custom": true,
    "list": [
      { "pagePath": "pages/index/index" },
      { "pagePath": "pages/mine/mine" }
    ]
  }
}
```

**公共组件**：
```vue
<!-- src/components/common/CustomTabBar/index.vue -->
<template>
  <view class="tabbar">
    <view class="tabbar-inner">
      <view
        v-for="item in tabList"
        :key="item.pagePath"
        class="tabbar-item"
        :class="{ active: currentPath === item.pagePath }"
        @click="switchTab(item.pagePath)"
      >
        <image :src="currentPath === item.pagePath ? item.selectedIcon : item.icon" class="tabbar-icon" />
        <text class="tabbar-text">{{ item.text }}</text>
      </view>
    </view>
    <view class="tabbar-safe-area" />
  </view>
</template>
```

**页面挂载**：每个 tab 页面 `onShow` 中调用：
```typescript
onShow(() => {
  const page = getCurrentPages()
  const route = page[page.length - 1]?.route
  if (route) getApp().globalData.currentTabPath = '/' + route
})
```

> TabBar 的 `list` 配置在 `pages.json` 中是一份，组件内 `tabList` 是另一份——两者必须同步。建议抽成公共常量 `src/constants/tabList.ts` 同时给两端引用。

#### 禁止行为

| ❌ 禁止 | ✅ 必须 |
|---------|---------|
| 部分 tab 页用自定义、部分用默认 | 要么全自定义，要么全默认 |
| 在 tab 页内再写一个 `<view class="tabbar">` | 统一用公共 `<CustomTabBar>` 组件 |
| 新增 tab 页忘记挂载 TabBar | 新页面 `onShow` 必须更新当前路由 |
| TabBar icon 硬编码路径 | 配置化，走 tabList 常量 |

---

## 十四、深色模式

### 14.1 适配策略

使用 **SCSS 变量映射 + 媒体查询**方案，兼容微信小程序 `prefers-color-scheme`：

```scss
// src/styles/tokens/_semantic.scss

// 亮色模式默认值
$color-bg-primary: #ffffff;
$color-bg-secondary: #fafafa;
$color-text-primary: #2b2e31;
$color-text-secondary: #5b6167;

// 深色模式 Token 覆盖
// 通过 CSS 变量桥接实现：
page {
  --color-bg-primary: #{$color-bg-primary};
  --color-bg-secondary: #{$color-bg-secondary};
  --color-text-primary: #{$color-text-primary};
  --color-text-secondary: #{$color-text-secondary};
}

@media (prefers-color-scheme: dark) {
  page {
    --color-bg-primary: #1a1a2e;
    --color-bg-secondary: #16213e;
    --color-text-primary: #e4e6eb;
    --color-text-secondary: #b0b3b8;
  }
}
```

### 14.2 深色主题 Token 参考值

| Token | 亮色 | 深色 |
|-------|------|------|
| `$color-bg-primary` | #ffffff | #1a1a2e |
| `$color-bg-secondary` | #fafafa | #16213e |
| `$color-bg-tertiary` | #f5f5f5 | #0f3460 |
| `$color-text-primary` | #2b2e31 | #e4e6eb |
| `$color-text-secondary` | #5b6167 | #b0b3b8 |
| `$color-border` | #e5e7eb | #2a2a3e |
| `$shadow-sm` | rgba(0,0,0,0.06) | rgba(0,0,0,0.3) |

### 14.3 组件中适配

```scss
.my-page {
  background: var(--color-bg-primary, $color-bg-primary);
  color: var(--color-text-primary, $color-text-primary);
}
```

`var(--token, $scss-fallback)` 语法确保深色模式未启用时回退到 SCSS 值。

> 完整深色模式实现（图片资源切换、全局注入策略、`data-theme` 手动切换）见 `references/design-tokens.md` §8。

---

## 十五、设计合规审计

### 15.1 定位

本 skill 专注于**视觉层/皮肉层**的合规扫描与自动修复，**不涉及**：

- 工程架构问题（目录结构、接口封装等）→ 走 `uniapp-standard-skill`
- 安全/性能/跨平台等全景审计 → 走 `uniapp-code-audit-skill`
- 运行时主题系统/一键换肤 → 走 `uniapp-theme-skill`

**只审计**：`.vue`、`.scss`、`.css` 文件中的设计 Token 违规项。

### 15.2 审计流程

```
Phase 1: 扫描范围确认
  → 全量项目 or 仅指定目录/页面
  → 排除 node_modules / uni_modules / .git

Phase 2: 逐条扫描 D01-D10
  → 对每个文件逐条检查，记录违规位置、当前值、建议替换值

Phase 3: 输出审计报告
  → 按 P0/P1/P2 分级，统计各维度违规数量
  → 输出 design-audit-report.md

Phase 4（可选）: 自动修复
  → 用户逐条确认 or 一键全部修复
  → 仅替换 SCSS/CSS 中的硬编码值为 Token 变量
```

### 15.3 扫描规则与修复映射

#### D01/D06 — 颜色硬编码

**扫描**：匹配 `#` 开头的十六进制颜色值或 `rgb()/rgba()`。

```bash
rg "#[0-9a-fA-F]{3,8}\b|rgba?\s*\(" --glob "*.{vue,scss,css}" -n
```

**修复映射**（自动替换为语义变量）：

| 硬编码值 | 替换为 |
|----------|--------|
| `#ffffff` / `#fff` | `$color-bg-primary` |
| `#fafafa` | `$color-bg-secondary` |
| `#f5f5f5` | `$color-bg-tertiary` |
| `#2b2e31` | `$color-text-primary` |
| `#5b6167` | `$color-text-secondary` |
| `#737a82` | `$color-text-tertiary` |
| `#b5b9bf` | `$color-text-placeholder` |
| `#e5e7eb` | `$color-border` |
| `#f0f0f0` | `$color-border-light` |
| `#3498db` | `$color-text-link` |
| `rgba(0,0,0,0.06)` | `$shadow-sm` |
| `rgba(0,0,0,0.08)` | `$shadow-md` |
| `rgba(0,0,0,0.12)` | `$shadow-lg` |
| 其他无法匹配的 `#xxx` | 标记为 "未匹配"，需人工确认 |

> **注意**：只替换 exact match。`#1CC8C4`（品牌色）和功能色（`#22c55e` / `#f59e0b` / `#ef4444` / `#3b82f6`）匹配 `$color-primary` / `$color-success` 等。

#### D01/D06 — 字号硬编码

**扫描**：匹配 CSS 中的 `font-size: Xrpx`。

```bash
rg "font-size:\s*\d+rpx" --glob "*.{vue,scss,css}" -n
```

**修复映射**：

| rpx 值 | 替换为 |
|--------|--------|
| `20rpx` | `$font-size-xs` |
| `24rpx` | `$font-size-sm` |
| `28rpx` | `$font-size-md` |
| `32rpx` | `$font-size-lg` |
| `36rpx` | `$font-size-xl` |
| `40rpx` | `$font-size-xxl` |
| `48rpx` | `$font-size-xxxl` |
| 其他值 | 标记 "未匹配" |

#### D01 — 间距硬编码

**扫描**：匹配 `padding` / `margin` / `gap` 中的 rpx 值（排除 0 和 auto）。

```bash
rg "(padding|margin|gap):\s*[^;]*\d+rpx" --glob "*.{vue,scss,css}" -n
```

**修复映射**：

| rpx 值 | 替换为 |
|--------|--------|
| `4rpx` | `$spacing-1` |
| `8rpx` | `$spacing-2` |
| `12rpx` | `$spacing-3` |
| `16rpx` | `$spacing-4` |
| `20rpx` | `$spacing-5` |
| `24rpx` | `$spacing-6` |
| `32rpx` | `$spacing-8` |
| `40rpx` | `$spacing-10` |
| `48rpx` | `$spacing-12` |
| `64rpx` | `$spacing-16` |
| 其他值 | 标记 "未匹配"（如 100rpx） |

#### D01 — 圆角硬编码

**扫描**：匹配 `border-radius` 后的 rpx 值。

```bash
rg "border-radius:\s*\d+rpx" --glob "*.{vue,scss,css}" -n
```

**修复映射**：

| 值 | 替换为 |
|----|--------|
| `8rpx` | `$radius-small` |
| `16rpx` | `$radius-medium` |
| `24rpx` | `$radius-large` |
| `999rpx` | `$radius-round` |
| `50%` | `$radius-circle` |
| 其他值 | 标记 "未匹配" |

#### D09 — z-index 硬编码

**扫描**：匹配 `z-index: 数字`。

```bash
rg "z-index:\s*\d+" --glob "*.{vue,scss,css}" -n
```

**修复映射**：

| 值范围 | 建议替换 |
|--------|----------|
| 0 | `$z-base` |
| 1-150 | `$z-dropdown` |
| 151-250 | `$z-sticky` |
| 251-350 | `$z-overlay` |
| 351-450 | `$z-modal` |
| 451-550 | `$z-toast` |
| 551-700 | `$z-tooltip` |
| 701+ | `$z-max` |

#### D02 — 缺失 scoped

**扫描**：匹配 `<style lang="scss">` 没有 `scoped` 属性。

```bash
rg "<style\s+lang=\"scss\"\s*>" --glob "components/**/*.vue" -n
```

**修复**：自动追加 `scoped` → `<style lang="scss" scoped>`

#### D07 — SCSS 嵌套过深

**扫描**：在同一 `.vue` 或 `.scss` 文件中检测缩进深度 ≥ 4 层（每层缩进 2 空格）。

```bash
rg "^\s{8,}[&.]" --glob "*.{vue,scss}" -n
```

**修复**：无法自动修复，仅输出警告，建议人工改造。

#### D08 — 非 transform/opacity 动画

**扫描**：匹配 `transition-property` 或 `transition:` 中包含 `width`/`height`/`left`/`top`/`margin`/`padding`/`background` 等触发重排的属性。

```bash
rg "transition(?:-property)?:\s*[^;]*\b(width|height|left|top|margin|padding|background-color)\b" --glob "*.{vue,scss,css}" -n
```

**修复**：仅输出警告，建议替换为 `transform` + `opacity`。

#### D10 — 深色模式硬编码

**扫描**：检测页面级组件中直接使用 `$color-bg-primary: #ffffff` 等 SCSS 变量，但未用 `var(--*)` 包装。

```bash
rg "background:\s*\$color-bg-" --glob "pages/**/*.vue" -n
```

**修复**：`background: $color-bg-primary` → `background: var(--color-bg-primary, $color-bg-primary)`

### 15.4 审计报告格式

```markdown
# 设计合规审计报告

**审计范围**：<范围描述>
**审计时间**：<时间戳>
**违规总数**：X（P0: Y / P1: Z / P2: W）

---

## P0 — 必须修复

| # | 文件:行号 | 违规项 | 当前值 | 建议替换 |
|---|-----------|--------|--------|----------|
| 1 | src/pages/home/index.vue:45 | 颜色硬编码 | `#333` | `$color-text-primary` |
| 2 | src/components/Card.vue:12 | 字号硬编码 | `32rpx` | `$font-size-lg` |

## P1 — 建议修复

| # | 文件:行号 | 违规项 | 当前值 | 说明 |
|---|-----------|--------|--------|------|
| 3 | src/pages/detail.vue:88 | z-index 硬编码 | `999` | 建议 `$z-max` |

## P2 — 优化建议

| # | 文件:行号 | 违规项 | 说明 |
|---|-----------|--------|------|
| 4 | src/pages/list.vue:30 | 非 transform 动画 | `transition: width 0.3s` 触发重排 |
```

### 15.5 自动修复规则

修复时遵守以下原则：

1. **准确匹配优先**：hardcoded 值与 Token 默认值完全匹配 → 直接替换
2. **近似匹配提醒**：值接近但不相同 → 标记为候选，人工确认
3. **不修改映射关系**：不改 `_theme-config.scss` 中的配置值
4. **不修改注释**：CSS 注释中的颜色值不替换
5. **不修改字符串**：`content: "#"` 中的 `#` 不替换
6. **排除目录**：`node_modules/`、`uni_modules/`、`.git/`
7. **修复后自动 lint**：执行 `npm run lint` 验证

### 15.6 排除项（不审计）

以下内容**显式跳过**，不属于"设计层"范畴：

- `_theme-config.scss` — 这是配置源，允许硬编码
- `vite.config.ts` — 构建配置
- `pages.json` / `manifest.json` — 框架配置
- `*.ts` 文件中的颜色常量导出 — 属于 JS 运行时层
- `node_modules/`、`uni_modules/` — 第三方代码
- CSS `@keyframes` 中的中间色 — 动画序列值

### 15.7 使用示例

```
用户: 帮我审计一下 src/pages/ 下面的设计合规性

→ Phase 1: 确认扫描范围 src/pages/
→ Phase 2: 逐条扫描 D01-D10
→ Phase 3: 输出报告，发现 12 处违规：
   P0: 5 处颜色硬编码，3 处字号硬编码，2 处 z-index 硬编码
→ 询问: "是否自动修复 P0 问题？[全部修复 / 逐条确认 / 仅出报告]"

用户: 全部修复

→ Phase 4: 替换 10 处 P0 违规 → 执行 lint → 通过
→ 输出修复摘要
```

---

## 十六、Utility 全局工具类

> 类似 TailwindCSS，但专为小程序精简。高频样式直接用 class，禁止各处重复写相同的行内样式。

### 16.1 Flex 布局

```scss
// src/styles/_utilities.scss

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1; }

.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-start { display: flex; align-items: center; justify-content: flex-start; }
.flex-end { display: flex; align-items: center; justify-content: flex-end; }

.flex-col-center { display: flex; flex-direction: column; align-items: center; }
.flex-col-start { display: flex; flex-direction: column; align-items: flex-start; }

.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
```

### 16.2 间距 Gap

```scss
.gap-1 { gap: $spacing-1; }
.gap-2 { gap: $spacing-2; }
.gap-3 { gap: $spacing-3; }
.gap-4 { gap: $spacing-4; }
.gap-6 { gap: $spacing-6; }
.gap-8 { gap: $spacing-8; }
```

### 16.3 文字对齐 + 溢出

```scss
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.text-ellipsis { @include text-ellipsis; }
.text-ellipsis-2 { @include text-ellipsis-multi(2); }
.text-ellipsis-3 { @include text-ellipsis-multi(3); }
```

### 16.4 文字颜色

```scss
.text-primary { color: $color-text-primary; }
.text-secondary { color: $color-text-secondary; }
.text-tertiary { color: $color-text-tertiary; }
.text-disabled { color: $color-text-disabled; }
.text-inverse { color: $color-text-inverse; }
.text-link { color: $color-text-link; }
```

### 16.5 字号

```scss
.text-xs { font-size: $font-size-xs; }
.text-sm { font-size: $font-size-sm; }
.text-md { font-size: $font-size-md; }
.text-lg { font-size: $font-size-lg; }
.text-xl { font-size: $font-size-xl; }
.text-xxl { font-size: $font-size-xxl; }
```

### 16.6 字重

```scss
.font-normal { font-weight: $font-weight-normal; }
.font-medium { font-weight: $font-weight-medium; }
.font-semibold { font-weight: $font-weight-semibold; }
.font-bold { font-weight: $font-weight-bold; }
```

### 16.7 背景 + 圆角 + 阴影

```scss
.bg-white { background: $color-bg-primary; }
.bg-gray { background: $color-bg-secondary; }
.bg-mask { background: $color-bg-mask; }

.rounded-sm { border-radius: $radius-small; }
.rounded-md { border-radius: $radius-medium; }
.rounded-lg { border-radius: $radius-large; }
.rounded-full { border-radius: $radius-round; }

.shadow-sm { box-shadow: $shadow-sm; }
.shadow-md { box-shadow: $shadow-md; }
```

### 16.8 内边距 Padding

```scss
.p-3 { padding: $spacing-3; }
.p-4 { padding: $spacing-4; }
.p-6 { padding: $spacing-6; }
.px-3 { padding-left: $spacing-3; padding-right: $spacing-3; }
.px-4 { padding-left: $spacing-4; padding-right: $spacing-4; }
.px-8 { padding-left: $spacing-8; padding-right: $spacing-8; }
.py-2 { padding-top: $spacing-2; padding-bottom: $spacing-2; }
.py-4 { padding-top: $spacing-4; padding-bottom: $spacing-4; }
```

### 16.9 外间距 Margin

```scss
.mt-2 { margin-top: $spacing-2; }
.mt-4 { margin-top: $spacing-4; }
.mt-6 { margin-top: $spacing-6; }
.mb-2 { margin-bottom: $spacing-2; }
.mb-4 { margin-bottom: $spacing-4; }
.mb-6 { margin-bottom: $spacing-6; }
.ml-2 { margin-left: $spacing-2; }
.mr-2 { margin-right: $spacing-2; }
```

### 16.10 显示 + 溢出

```scss
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.overflow-hidden { overflow: hidden; }
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }

.w-full { width: 100%; }
.h-full { height: 100%; }
```

### 16.11 使用示例

```vue
<!-- 卡片：flex 左右分布，标题+副标题，统一用 utility -->
<view class="bg-white rounded-md p-4 shadow-sm">
  <view class="flex-between">
    <view class="flex-col flex-1">
      <text class="text-primary text-lg font-semibold text-ellipsis">标题文字</text>
      <text class="text-secondary text-sm mt-2">副标题描述内容</text>
    </view>
    <text class="text-tertiary text-xs ml-2">2024-01-01</text>
  </view>
</view>

<!-- ❌ 等价于 -->
<view style="background: #fff; border-radius: 16rpx; padding: 16rpx; box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.06)">
  <view style="display: flex; align-items: center; justify-content: space-between">
    <view style="display: flex; flex-direction: column; flex: 1">
      <text style="color: #2b2e31; font-size: 32rpx; font-weight: 600; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">标题文字</text>
      <text style="color: #5b6167; font-size: 24rpx; margin-top: 8rpx">副标题描述内容</text>
    </view>
    <text style="color: #737a82; font-size: 20rpx; margin-left: 8rpx">2024-01-01</text>
  </view>
</view>
```

---

## References

- `references/design-tokens.md` — Design Tokens 架构详解（含色板自动生成脚本、CSS 变量桥接、一键换肤流程、深色模式完整方案、小程序平台注意事项）
- `references/design-audit-checklist.md` — 设计合规审计扫描规则清单（D01-D10 逐条 grep 命令与修复策略）
