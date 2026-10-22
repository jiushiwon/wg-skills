# 主题系统接入（页面组件层）

本文件说明**页面组件**（`uniapp-page-components-skill`）如何接入 `uniapp-theme-skill` 的主题系统，
以及在没有主题系统时的硬编码替换方案。

> 上位规范：[uniapp/AGENTS.md](../../AGENTS.md)
> 变量真源：`uniapp-theme-skill/templates/src/static/css/base.css`
> 容器真源：`uniapp-base-skill/containers/`

## 一、接入方式

### 1.1 引入变量

把 `base.css` 拷到项目 `src/static/css/base.css`，在 `App.vue` 全局样式引入：

```scss
@i@import '@/static/css/base.css';
```

`base.css` 是**唯一变量真源**。页面组件、容器层、样式层都从这里取变量，
**任何模块不得重复定义同名变量**。

### 1.2 切换主题

主题通过根节点 `data-theme` 属性切换，`base.css` 内置 8 套主题：

```html
<view data-theme="business">...</view>
```

| 主题值 | 定位 |
|--------|------|
| `cute` | 可爱风（大圆角、暖色） |
| `business` | 商务风（方正、克制） |
| `fresh` | 清新风（绿系） |
| `cyber` | 赛博风（高对比紫） |
| `retro` | 复古风（暖棕） |
| `glass` | 玻璃拟态（半透明） |
| `minimal` | 极简风（无装饰） |
| `warm` | 温暖风（橙棕） |

切换方式：给页面根节点（或 `App.vue` 的根 view）动态改 `data-theme`，
所有引用 `var(--color-primary)` 的组件自动跟随，**不需要重渲染业务逻辑**。

### 1.3 深色模式

深色模式同样通过 `data-theme` 表达，**不要**用 `@media (prefers-color-scheme: dark)`
在组件里写分支。组件永远只写 `var(--xxx, 兜底)`，主题由 `base.css` 决定。

## 二、页面组件的变量使用规则

### 2.1 只用 `base.css` 里的变量

按语义分组取用（完整清单见 `base.css`）：

| 语义 | 变量 |
|------|------|
| 页面背景 | `--bg-page` |
| 卡片 / 弹层背景 | `--bg-card` |
| 次级背景 / 标签底 | `--bg-light` |
| 三级背景 / 按压态 | `--bg-tertiary` |
| 遮罩 | `--bg-overlay` |
| 主文字 | `--text-primary` |
| 次要文字 | `--text-secondary` |
| 弱化文字 / 占位 | `--text-tertiary` / `--text-placeholder` |
| 反色文字 | `--text-inverse` |
| 描边 / 细分隔线 | `--border` / `--border-light` |
| 主色 | `--color-primary`（另有 `--primary-50…900` 色阶） |
| 语义色 | `--color-success` / `--color-warning` / `--color-error` / `--color-info` |
| 间距 | `--space-0 … --space-24` |
| 圆角 | `--radius-none / sm / md / lg / xl / 2xl / full / card / image / input / tag / avatar` |
| 字号 | `--font-2xs / xs / sm / md / lg / xl / 2xl / 3xl` |
| 固定高度 | `--height-btn-sm / md / lg / xl`、`--height-navbar`、`--height-avatar-sm / md / lg / xl` |
| 图标尺寸 | `--icon-xs / sm / md / lg / xl` |
| 阴影 | `--shadow-sm / md / lg / xl` |
| 过渡 | `--transition-fast / normal / slow`、`--ease-out / --ease-in-out` |
| 层级 | `--z-index-base / dropdown / sticky / fixed / modal-backdrop / modal / toast` |

### 2.2 必须带兜底值

统一写成 `var(--token, 兜底)`，兜底值必须与 `base.css` 真值一致：

```scss
/*/* 正确 */
color: var(--text-secondary, #525252);
border-radius: var(--radius-card, 24rpx);

/* 错误：变量改名会静默失效 */
color: var(--text-secondary);
```

### 2.3 尺寸一律 rpx

页面组件里不允许出现 `px`（`env(safe-area-inset-*)` 除外）。
换算：`1px = 2rpx`，`44px = 88rpx`。

### 2.4 变体色用 `color-mix`

需要主色的浅/深变体时，用 `color-mix` 基于变量派生，**不要**硬编码 HEX：

```scss
background: color-mix(in srgb, var(--color-primary) 12%, transparent);
```

## 三、容器与主题的关系

### 3.1 整页组件不套容器

整页组件（页面级布局）**不使用** `BaseCard` / `BasePopup` 外壳，
它自己就是外壳，直接用 `--bg-page` 作为页面底色。

### 3.2 局部内容件必须套容器

页面内部的**局部内容件**（卡片、列表项、面板）必须基于容器层实现：

| 场景 | 容器 |
|------|------|
| 卡片、面板、列表项 | `BaseCard`（`uniapp-base-skill/containers/base-card/`） |
| 弹窗、抽屉、面板弹层 | `BasePopup`（`uniapp-base-skill/containers/base-popup/`） |
| 带标签的表单行 | `BaseFormItem`（`uniapp-base-skill/containers/base-form-item/`） |
| 头像 | `BaseAvatar`（`uniapp-base-skill/containers/base-avatar/`） |

容器已经封装了圆角、背景、边框、阴影与安全区。
**子类不要重复设置**这些属性，避免双层边框与双层圆角。

```vue
<script setup lang="ts">
import BaseCard from '../../../uniapp-base-skill/containers/base-card/index.vue'
</script>

<template>
  <BaseCard :title="title" :shadow="true">
    <text class="pc-desc">{{ description }}</text>
  </BaseCard>
</template>
```

### 3.3 容器参数一律走 token

容器 props 的默认值已经是 token 化字符串（如 `padding="var(--space-4, 16rpx)"`）。
页面层覆盖时也传 token 化字符串，不要传裸值：

```vue
<template>
<!-- 正确 -->
<BaseCard :padding="'var(--space-6, 24rpx)'" :radius="'var(--radius-lg, 24rpx)'" />

<!-- 错误 -->
<BaseCard padding="24rpx" radius="16rpx" />
</template>


```

## 四、图片尺寸例外白名单（P04）

图片尺寸通常应走 `--height-avatar-*` / `--icon-*`。
但当设计稿明确要求某个尺寸、且该尺寸不在 token 阶梯上时，
**允许保留原始 rpx 值**，并必须满足：

1. 在该处加注释说明原因（例如 `/* 设计稿 220rpx，token 阶梯无对应值，按稿走 */`）；
2. 在本页面的"硬编码豁免清单"里登记一行（尺寸 + 原因）；
3. 禁止以"其他组件也是这样"为由扩大豁免。

## 五、没有主题系统时的降级

目标项目**没有** `uniapp-theme-skill` 时：

1. 不自己造变量体系，直接用本文件 §2.1 的变量名写 `var(--xxx, 兜底)`；
2. 兜底值就是 `base.css` 的真值，视觉与接入主题时一致；
3. 变量未定义时 CSS 变量回退到兜底值，页面正常渲染；
4. 不要为"没有主题"而删掉 `var()` 包装——那是把降级能力变成写死。

## 六、自检清单

- [ ] 页面组件未定义任何 `--xxx:` 变量
- [ ] 所有 `var()` 都带兜底值，且兜底值与 `base.css` 一致
- [ ] 无 `px` 尺寸（安全区除外）
- [ ] 局部内容件已套 `BaseCard` / `BasePopup` / `BaseFormItem` / `BaseAvatar`
- [ ] 容器 props 传的是 token 化字符串，不是裸值
- [ ] 图片尺寸豁免已登记并加注释
- [ ] 深色模式没有写 `@media (prefers-color-scheme)` 分支
