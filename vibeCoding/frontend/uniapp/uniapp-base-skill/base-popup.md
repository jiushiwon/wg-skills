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
> - 选择器面板 → base-popup + base-select 组合

`base-popup` **内置** `base-card` 作为内容容器，外部传入的卡片参数（title/padding/header-right）会被自动转发。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` / `v-model:show` | boolean | `false` | 是否显示 |
| `direction` | `'top'` \| `'bottom'` \| `'left'` \| `'right'` | `'bottom'` | 弹出方向 |
| `radius` | string | `'16px'` | 弹窗圆角（四角，按方向智能应用） |
| `height` | string | `'auto'` | 高度（top/bottom 生效） |
| `width` | string | `'280px'` | 宽度（left/right 生效） |
| `padding` | string | `'default'` | 内边距：`default` / `sm` / `none`（转发给内部 base-card） |
| `title` | string | - | 标题（转发给内部 base-card） |
| `headerRight` | string | - | 头部右侧 slot（转发给内部 base-card） |
| `mask` | boolean | `true` | 是否显示遮罩层 |
| `maskClosable` | boolean | `true` | 点击遮罩是否关闭 |
| `duration` | number | `300` | 动画时长（ms） |
| `safeArea` | boolean | `true` | 是否适配安全区域 |

## Events

| Event | 说明 |
|-------|------|
| `update:show` | 显示状态变化 |
| `close` | 关闭时触发 |

## 核心实现（内置 base-card）

```vue
<template>
  <!-- 遮罩层 -->
  <view v-if="show && mask" class="popup-mask"
    :class="{ show }" :style="{ opacity: show ? 1 : 0 }"
    @click="onMaskClick" />

  <!-- 弹窗主体 -->
  <view v-if="show" class="popup"
    :class="[`popup-${direction}`, { show }]"
    :style="popupStyle">
    <view class="popup-content">
      <!-- 🔥 内置 base-card：自动遵守容器原则 -->
      <base-card
        :padding="padding"
        :title="title"
      >
        <template v-if="headerRight" #header-right>
          <slot name="header-right" />
        </template>
        <slot />
        <template v-if="$slots.footer" #footer>
          <slot name="footer" />
        </template>
      </base-card>
    </view>
  </view>
</template>
```

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
  width="280px"
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
  width="320px"
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

### 与 base-select 组合（选择器面板）

```vue
<base-popup v-model:show="showPicker" direction="bottom">
  <base-select
    v-model="city"
    :options="cities"
    type="cascade"
  />
</base-popup>
```

## 动画 & 圆角

通过 `direction` + `radius` 控制滑入方向与圆角位置：

| 方向 | 圆角默认位置 | 典型圆角值 |
|------|--------------|-----------|
| `bottom` | 顶部左右两角 | `16px 16px 0 0` |
| `top` | 底部左右两角 | `0 0 16px 16px` |
| `left` | 右侧上下两角 | `0 16px 16px 0` |
| `right` | 左侧上下两角 | `16px 0 0 16px` |

```css
.popup-bottom { border-radius: var(--radius-top, 16px) var(--radius-top, 16px) 0 0; }
.popup-top    { border-radius: 0 0 var(--radius-bottom, 16px) var(--radius-bottom, 16px); }
.popup-left   { border-radius: 0 var(--radius-right, 16px) var(--radius-right, 16px) 0; }
.popup-right  { border-radius: var(--radius-left, 16px) 0 0 var(--radius-left, 16px); }
```

## HTML Demo

- [demo-components/base-popup/html/popup-bottom.html](demo-components/base-popup/html/popup-bottom.html) — 底部弹出
- [demo-components/base-popup/html/popup-top.html](demo-components/base-popup/html/popup-top.html) — 顶部通知
- [demo-components/base-popup/html/popup-left.html](demo-components/base-popup/html/popup-left.html) — 左侧抽屉
- [demo-components/base-popup/html/popup-right.html](demo-components/base-popup/html/popup-right.html) — 右侧筛选
- [demo-components/base-popup/html/00-showcase.html](demo-components/base-popup/html/00-showcase.html) — 4 方向总览

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg-surface)` | 弹窗背景 |
| `var(--radius-lg)` | 弹窗圆角 |
| `var(--space-3/4)` | 弹窗内边距 |
| `var(--color-primary)` | 强调色（关闭按钮等） |

## 触发词

```markdown
/uniapp-base-skill 做一个底部弹窗
/uniapp-base-skill 做一个顶部通知
/uniapp-base-skill 做一个左侧抽屉
/uniapp-base-skill 做一个右侧筛选面板
/uniapp-base-skill 做一个弹窗
```

## 相关组件

- [base-card.md](base-card.md) — 卡片容器（base-popup 内置）
- [base-input.md](base-input.md) — 输入框（根目录通用）
- [uniapp-form-skill](../uniapp-form-skill/) — 表单子技能（含 base-select）
- [uniapp-page-skill](../uniapp-page-skill/) — 页面子技能