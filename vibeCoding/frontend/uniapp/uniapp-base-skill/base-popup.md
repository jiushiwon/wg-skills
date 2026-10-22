---
name: base-popup
description: 通用弹窗/抽屉组件（根目录容器）。slide in/out 动画 + 4 方向弹出 + 内置 base-card 容器。内部封装 base-card，可直接传递 card 参数。
---

# base-popup 弹窗容器（根目录通用容器）

> **根目录通用容器**（与 `base-card` / `base-input` 同级），弹窗/抽屉/抽屉菜单的容器基底。
> **内置 base-card**：弹窗内容默认就是 base-card 容器，自动遵守容器原则。
> 可与 base-card、base-select 等组件自由组合。

## 容器原则

> **所有弹窗/抽屉场景，必须使用 `base-popup` 作为容器基底。**
> - 操作菜单 → base-popup 包裹
> - 抽屉 / 侧滑 → base-popup 包裹
> - 顶部通知 → base-popup 包裹
> - 选择器面板 → base-popup + picker 组件组合

`base-popup` **内置** `base-card` 作为内容容器，外部传入的卡片参数（title/padding/header-right）会被自动转发。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` / `v-model:show` | boolean | `false` | 是否显示 |
| `direction` | `'top'` \| `'bottom'` \| `'left'` \| `'right'` \| `'center'` | `'bottom'` | 弹出方向（`center` = 居中缩放弹窗） |
| `radius` | string | `'var(--radius-lg, 24rpx)'` | 弹窗圆角（四角，按方向智能应用） |
| `height` | string | `'auto'` | 高度（top/bottom 生效） |
| `width` | string | `'560rpx'` | 宽度（left/right/center 生效） |
| `padding` | `'default'` \| `'sm'` \| `'none'` | `'default'` | 内边距档位（转发给内部 base-card） |
| `title` | string | `''` | 标题（转发给内部 base-card） |
| `mask` | boolean | `true` | 是否显示遮罩层 |
| `maskClosable` | boolean | `true` | 点击遮罩是否关闭 |
| `duration` | number | `300` | 动画时长（ms） |
| `safeArea` | boolean | `true` | 是否适配底部安全区域（`bottom` 方向生效） |

## Slots

| Slot | 说明 |
|------|------|
| 默认 | 弹窗内容（渲染在内部 base-card 的 body 区） |
| `header-right` | 头部右侧（转发给内部 base-card 的 header-right） |
| `footer` | 底部操作区（转发给内部 base-card 的 footer） |

## Events

| Event | 说明 |
|-------|------|
| `update:show` | 显示状态变化 |
| `close` | 关闭时触发 |

## 核心实现（内置 base-card）

`base-popup` 与 `base-card` 同在 `containers/` 目录，`<script setup>` 下直接 import：

```vue
<script setup lang="ts">
import BaseCard from '../base-card/index.vue'
</script>

<template>
  <!-- 遮罩层 -->
  <view
    v-if="show && mask"
    class="popup-mask"
    :class="{ show }"
    :style="{ transitionDuration: `${duration}ms` }"
    @click="onMaskClick"
  />

  <!-- 弹窗主体 -->
  <view
    v-if="show"
    class="popup"
    :class="[`popup-${direction}`, { show }]"
    :style="{ ...popupStyle, ...radiusStyle }"
    @click="preventClose"
    @transitionend="onTransitionEnd"
  >
    <!-- 内置 base-card：弹窗内容自动遵守容器原则 -->
    <BaseCard
      :title="title"
      :padding="PADDING_MAP[padding]"
      :radius="radiusStyle.borderRadius"
      background="transparent"
    >
      <template v-if="$slots['header-right']" #header-right>
        <slot name="header-right" />
      </template>
      <slot />
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </BaseCard>
  </view>
</template>
```

> 弹窗主体只负责「位置 + 动画 + 圆角 + 遮罩」，内容排版（标题 / 头尾 / 内边距）全部交给内部 `base-card`，
> 所以弹窗内容天然满足容器原则，不用在业务页面里手写卡片外壳。

## 使用示例

### 基础底部弹窗（最简形式）

```vue
<base-popup v-model:show="show" direction="bottom" title="提示">
  <text>这里是弹窗内容</text>
</base-popup>
```

### 底部操作菜单（带 footer）

```vue
<base-popup
  v-model:show="showMenu"
  direction="bottom"
  title="分享到"
  padding="default"
>
  <view class="menu-list">
    <view class="menu-item" @click="shareTo('wechat')">
      <text>微信好友</text>
    </view>
    <view class="menu-item" @click="shareTo('qq')">
      <text>QQ</text>
    </view>
  </view>
  <template #footer>
    <button @click="showMenu = false">取消</button>
  </template>
</base-popup>
```

### 左侧抽屉（导航菜单）

```vue
<base-popup
  v-model:show="showDrawer"
  direction="left"
  width="560rpx"
  title="个人中心"
>
  <view class="menu-item">
    <text>个人资料</text>
  </view>
  <view class="menu-item">
    <text>设置</text>
  </view>
</base-popup>
```

### 右侧筛选面板

```vue
<base-popup
  v-model:show="showFilter"
  direction="right"
  width="640rpx"
  title="筛选"
>
  <view class="filter-section">
    <text>价格区间</text>
  </view>
  <template #footer>
    <button @click="reset">重置</button>
    <button type="primary" @click="apply">确定</button>
  </template>
</base-popup>
```

### 顶部通知

```vue
<base-popup
  v-model:show="showNotice"
  direction="top"
  height="auto"
  title="新消息"
>
  <text>您有 3 条未读消息</text>
</base-popup>
```

### 与 picker 组合（选择器面板）

> `picker` / `date-picker` 已内置 BasePopup，直接用组件即可；此处演示手工组合的场景。

```vue
<base-popup v-model:show="showPicker" direction="bottom" title="选择城市">
  <picker
    :columns="cityColumns"
    @confirm="onCityConfirm"
  />
</base-popup>
```

## 动画 & 圆角

通过 `direction` + `radius` 控制滑入方向与圆角位置：

| 方向 | 圆角默认位置 | 典型圆角值 |
|------|--------------|-----------|
| `bottom` | 顶部左右两角 | `24rpx 24rpx 0 0` |
| `top` | 底部左右两角 | `0 0 24rpx 24rpx` |
| `left` | 右侧上下两角 | `0 24rpx 24rpx 0` |
| `right` | 左侧上下两角 | `24rpx 0 0 24rpx` |
| `center` | 四角等圆 | `24rpx` |

```css
.popup-bottom { border-radius: var(--radius-lg, 24rpx) var(--radius-lg, 24rpx) 0 0; }
.popup-top    { border-radius: 0 0 var(--radius-lg, 24rpx) var(--radius-lg, 24rpx); }
.popup-left   { border-radius: 0 var(--radius-lg, 24rpx) var(--radius-lg, 24rpx) 0; }
.popup-right  { border-radius: var(--radius-lg, 24rpx) 0 0 var(--radius-lg, 24rpx); }
.popup-center { border-radius: var(--radius-lg, 24rpx); }  /* 缩放淡入 */
```

## 常见场景速查

按场景选方向与结构，demo 为可运行参考实现：

| 场景 | direction | 依赖组件 | 关键结构 | Demo |
|------|-----------|----------|----------|------|
| 支付方式选择 | `bottom` | `radio-group` | radio 列表 + 底部合计栏 | [popup-pay-method.html](demo-components/base-popup/html/popup-pay-method.html) |
| 加入购物车（多维规格） | `bottom` | `stepper` | 规格联动禁用 + 数量 stepper | [popup-cart-spec.html](demo-components/base-popup/html/popup-cart-spec.html) |
| 优惠券选择 | `bottom` | `coupon` | 可用/不可用分组 + 单选 | [popup-coupon.html](demo-components/base-popup/html/popup-coupon.html) |
| 搜索面板（历史/热词） | `top` | `search-bar` | 顶部下拉 + chips | [popup-search-panel.html](demo-components/base-popup/html/popup-search-panel.html) |
| 居中确认/危险操作 | `center` | - | 标题+描述+双按钮 | [popup-dialog.html](demo-components/base-popup/html/popup-dialog.html) |
| 底部操作菜单 | `bottom` | `action-sheet` | options 数组 + 取消按钮 | popup-all-scenes.html |

> 依赖组件已全部迁入 `uniapp-base-skill/components/`（本模块）：`radio-group` / `stepper` / `coupon` / `search-bar` / `action-sheet`。
> 居中确认弹窗直接用 `base-popup direction="center"`（容器原则），不依赖 `modal` 组件。

### 居中确认弹窗

```vue
<base-popup v-model:show="showConfirm" direction="center" width="640rpx" :maskClosable="false">
  <view class="dialog-body">
    <text class="dialog-title">确认删除账号？</text>
    <text class="dialog-desc">删除后无法恢复</text>
  </view>
  <template #footer>
    <button @click="showConfirm = false">取消</button>
    <button type="primary" @click="confirmDelete">删除</button>
  </template>
</base-popup>
```

## HTML Demo

- [demo-components/base-popup/html/00-showcase.html](demo-components/base-popup/html/00-showcase.html) — 方向总览
- [demo-components/base-popup/html/popup-bottom.html](demo-components/base-popup/html/popup-bottom.html) — 底部弹出
- [demo-components/base-popup/html/popup-top.html](demo-components/base-popup/html/popup-top.html) — 顶部通知
- [demo-components/base-popup/html/popup-left.html](demo-components/base-popup/html/popup-left.html) — 左侧抽屉
- [demo-components/base-popup/html/popup-right.html](demo-components/base-popup/html/popup-right.html) — 右侧筛选
- [demo-components/base-popup/html/popup-all-scenes.html](demo-components/base-popup/html/popup-all-scenes.html) — 全场景合集
- [demo-components/base-popup/html/popup-pay-method.html](demo-components/base-popup/html/popup-pay-method.html) — 支付方式选择
- [demo-components/base-popup/html/popup-cart-spec.html](demo-components/base-popup/html/popup-cart-spec.html) — 加入购物车（多维规格）
- [demo-components/base-popup/html/popup-coupon.html](demo-components/base-popup/html/popup-coupon.html) — 优惠券选择
- [demo-components/base-popup/html/popup-search-panel.html](demo-components/base-popup/html/popup-search-panel.html) — 顶部搜索面板
- [demo-components/base-popup/html/popup-dialog.html](demo-components/base-popup/html/popup-dialog.html) — 居中确认弹窗

## 主题变量

> 变量真源：`uniapp-theme-skill/templates/src/static/css/base.css`（唯一真源，本模块不重复定义）。下表"真值"即 base.css 中的定义。

| 变量 | 用途 | 真值 |
|------|------|------|
| `var(--bg-card)` | 弹窗背景 | `#ffffff` |
| `var(--bg-overlay)` | 遮罩背景 | `rgba(0, 0, 0, 0.5)` |
| `var(--z-index-modal-backdrop)` | 遮罩层级 | `400` |
| `var(--z-index-modal)` | 弹窗层级 | `500` |
| `var(--border)` | 卡片头尾分割线 | `--gray-200` / `#e5e5e5` |
| `var(--text-primary)` | 标题文字色 | `--gray-900` / `#171717` |
| `var(--space-3)` | 卡片头尾间距 / sm 档内边距 | `12rpx` |
| `var(--space-4)` | default 档内边距 | `16rpx` |
| `var(--radius-lg)` | 弹窗圆角 | `24rpx` |

## 触发词

```markdown
/uniapp-base-skill 做一个底部弹窗
/uniapp-base-skill 做一个顶部通知
/uniapp-base-skill 做一个左侧抽屉
/uniapp-base-skill 做一个右侧筛选面板
/uniapp-base-skill 做一个弹窗
/uniapp-base-skill 做一个支付方式选择弹窗
/uniapp-base-skill 做一个确认弹窗
/uniapp-base-skill 做一个搜索面板
/uniapp-base-skill 做一个优惠券选择弹窗
/uniapp-base-skill 做一个加入购物车弹窗
```

## 相关组件

- [base-card.md](base-card.md) — 卡片容器（base-popup 内置）
- [input-field.md](input-field.md) — 表单类组件（input-field / search-bar）
- [../uniapp-ui-component-commands-skill/commands/feedback.md](../uniapp-ui-component-commands-skill/commands/feedback.md) — 弹层类组件索引