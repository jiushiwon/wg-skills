# 主题系统接入与 fallback

本文件说明本 skill 组件如何接入 uniapp-theme-skill 主题系统，以及无主题系统时的硬编码替换方案。与 [uniapp-page-components-skill](../uniapp-page-components-skill/references/theme-integration.md) 同一套变量体系，本文件只列本技能用到的差异点与状态栏适配。

## 1. 主题变量清单（组件使用到的）

### 颜色

| 变量 | 组件使用场景 |
|------|--------------|
| `--color-primary` | 按钮填充、菜单激活、链接/登录按钮文字、logo |
| `--color-bg-page` | 页面背景 |
| `--color-bg-surface` | 导航栏底、输入行底、标签底 |
| `--color-bg-tinted` | ghost 按钮底、logo 底、热门标签底 |
| `--color-text-primary` / `--color-text-secondary` / `--color-text-tertiary` | 主/次/弱文字 |
| `--color-border` / `--color-border-light` | 边框、分割线、复选框描边 |
| `--color-error` | 必填星号、错误提示、角标、danger 按钮 |
| `--white` | 主题色上的文字 |

### 尺寸

| 变量 | 组件使用场景 |
|------|--------------|
| `--spacing-xs/sm/md/lg/xl/2xl/3xl` | 间距阶梯 |
| `--font-xs/sm/md/lg/xl/2xl` | 字号阶梯 |
| `--height-btn-sm/md/lg/xl` | 按钮/输入行/导航高度 |
| `--height-avatar-lg` | 登录 logo 尺寸 |
| `--height-input-*` | 输入框高度（若项目用到） |
| `--icon-xs/sm/md/lg` | 图标/复选框/角标尺寸 |
| `--status-bar-height` | 状态栏高度（base-navbar，需项目自定义，见 §4） |

### 圆角

| 变量 | 组件使用场景 |
|------|--------------|
| `--radius-btn` | 按钮/搜索框圆角 |
| `--radius-tag` | 搜索标签圆角 |
| `--radius-sm` | 协议复选框圆角 |
| `--radius-lg` | logo 圆角 |
| `--radius-full` | round 按钮、角标 |

## 2. 无主题系统 fallback 硬编码替换表

> 项目无主题系统且用户选择硬编码时，把每个 `var(--xxx)` 替换为下表默认值（business 商务风，可按品牌色调整）。

| 变量 | 默认值 |
|------|--------|
| `--color-primary` | `#2563EB` |
| `--color-bg-page` | `#F5F6F8` |
| `--color-bg-surface` | `#FFFFFF` |
| `--color-bg-tinted` | `#EFF6FF` |
| `--color-text-primary` | `#171717` |
| `--color-text-secondary` | `#737373` |
| `--color-text-tertiary` | `#A3A3A3` |
| `--color-border` | `#E5E7EB` |
| `--color-border-light` | `#F0F0F0` |
| `--color-error` | `#EF4444` |
| `--white` | `#FFFFFF` |
| `--spacing-xs/sm/md/lg/xl/2xl/3xl` | `8rpx / 16rpx / 24rpx / 32rpx / 48rpx / 64rpx / 96rpx` |
| `--font-xs/sm/md/lg/xl/2xl` | `22rpx / 24rpx / 28rpx / 32rpx / 36rpx / 44rpx` |
| `--height-btn-sm/md/lg/xl` | `56rpx / 72rpx / 88rpx / 96rpx` |
| `--height-avatar-lg` | `128rpx` |
| `--icon-xs/sm/md/lg` | `24rpx / 32rpx / 40rpx / 48rpx` |
| `--radius-btn` | `16rpx` |
| `--radius-tag` | `8rpx` |
| `--radius-lg` | `24rpx` |
| `--radius-full` | `9999rpx` |
| `--status-bar-height` | `0`（H5/非小程序无需） |

> 推荐做法：与其逐个替换，不如在项目全局（`App.vue` 的 `<style>` 或 `static/css/`）一次性定义这组 CSS 变量，组件原样复制，日后接入 uniapp-theme-skill 零改动。

## 3. easycom 注册

**方式 A：autoscan（推荐）**

```json
// pages.json
{
  "easycom": { "autoscan": true }
}
```

`components/base-button/base-button.vue` → `<base-button>`，`components/search-page/search-page.vue` → `<search-page>`，全局生效。

**方式 B：custom 规则（组件放公共子目录时）**

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^base-(.*)": "@/components/base/$1/$1.vue",
      "^page-(.*)": "@/components/page/$1/$1.vue"
    }
  }
}
```

**方式 C：手动导入**

```vue
<script setup lang="ts">
import BaseButton from '@/components/base-button/base-button.vue'
import SearchPage from '@/components/search-page/search-page.vue'
</script>
```

## 4. 状态栏适配（base-navbar）

`base-navbar` 的状态栏高度由内部的 `.bn-status-bar` 占位行承担（`showStatusBar=true` 时 `height: statusBarHeight`），吸顶占位高度 = `statusBarHeight + --height-btn-xl`。三种方式任选：

```css
/* 方式 1：App.vue 全局定义（小程序端推荐，值来自 uni.getSystemInfoSync().statusBarHeight） */
page { --status-bar-height: 44px; }
```

```vue
<!-- 方式 2：页面传 prop -->
<base-navbar status-bar-height="44px" ... />
```

```vue
<!-- 方式 3：JS 动态传入 -->
<base-navbar :status-bar-height="`${statusBarHeight}px`" ... />
<script setup lang="ts">
import { ref } from 'vue'
const statusBarHeight = ref(0)
uni.getSystemInfoSync().statusBarHeight && (statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight)
</script>
```

> H5 / 非小程序端无需状态栏占位，保持默认 0 即可（`showStatusBar` 仍渲染 0 高占位行，无害）。

## 5. 与其他技能的协同

- **与主技能混用**：`form-page` 表单区、`home-page` 列表区可放主技能的 `base-card` / `tab-list-page` / `image-card`；两技能组件风格一致（同一套主题变量）。
- **与 app-generate 的关系**：app-generate 的 `AppButton` / `AppNavbar` / `AppTab` 是项目骨架共享组件；本技能的 `base-*` 是"复制即用"的自定义实现。同一项目二选一使用，避免两套按钮/导航并存。
- **与 style-skill 的 SCSS token**：编译期 SCSS 变量与运行时 CSS 变量二选一保持单一来源；推荐 CSS 变量作唯一来源，SCSS 反向引用。
- **数据层**：搜索/提交/登录/加载副作用由页面层走 `uniapp-request-skill`（登录对接 `auth-skill`），组件只展示 + emit，禁止组件内直接 `uni.request`。
