---
name: vue-card-skill
description: Vue 卡片组件技能。基于「一切皆容器」思想，双层架构：base-card 根容器（L0，6 维度参数矩阵）+ base-wg-card 业务卡片（L1，11 种 variant）。所有组件必须嵌入 base-card，base-wg-card 内部必须包裹 base-card。提供 11 种业务卡片变体：basic/product/profile/friend/set/vip/menu/grid/image/notify/comment。触发词："vue 卡片"、"base-card"、"做一个卡片"、"商品卡片"、"个人中心卡片"、"VIP 卡片"、"九宫格菜单"、"通知卡片"、"评论卡片"。
trigger: |
  # 基础容器
  帮我做一个卡片 | 做一个基础卡片 | 做一个图片卡片 | 做一个列表卡片
  做一个设置卡片 | 做一个菜单卡片 | 做一个商品卡片
  做一个个人中心卡片 | 做一个 VIP 卡片 | 做一个通知卡片 | 做一个评论卡片
  做一个功能网格卡片 | 做一个好友卡片 | 做一个九宫格卡片
  # 容器原则
  所有组件都要 base-card 包裹 | base-card 是根容器 | 容器原则
  # 业务卡片组件
  base-wg-card | 业务卡片组件 | wg-card
---

# vue-card-skill

> 基于「一切皆容器」思想的 Vue 卡片组件技能。**双层架构**：`base-card`（L0 根容器）+ `base-wg-card`（L1 业务卡片），二者严格分层、互不替代。
>
> **本技能严格镜像 [uniapp-card-skill](../../uniapp/uniapp-base-skill/uniapp-card-skill/)**，命名 100% 对齐。
>
> **零样式标签铁律**：实现代码仅使用 `<div>` / `<span>` + CSS3，禁止 `<p>` `<h1~h6>` `<header>` `<footer>` `<section>` `<article>` `<aside>` `<nav>` `<main>` `<button>` `<table>` `<input>` `<select>` `<form>` `<label>` `<fieldset>` `<option>` `<img>` `<strong>` `<em>` 等带默认样式的标签。图片用 `<div>` + `background-image` 实现，图标用 `<div>` + CSS mask data URI。

## 核心组件

| 组件 | 层级 | 角色 | 文档 |
|------|------|------|------|
| **base-card** | L0 | 根容器（6 维度参数矩阵） | [../../base-card.md](../../base-card.md) |
| **base-wg-card** | L1 | 业务卡片组件（11 种 variant） | [base-wg-card.md](base-wg-card.md) |

**职责划分**：

- `base-card`：定义容器的"形"（圆角 / 内边距 / 阴影 / 边框 / 色调 / 加载态），**不关心**容器内放什么
- `base-wg-card`：定义卡片的"意"（基础 / 商品 / 个人中心 / 好友 / 设置 / VIP / 九宫格 / 功能网格 / 图片流 / 通知 / 评论），**必须**内部包裹 base-card

## 11 种业务卡片 variant

| # | variant | 风格 | 触发词 |
|---|---------|------|--------|
| 1 | `basic` | 标题 + 描述 + 操作 | "做一个基础卡片" |
| 2 | `product` | 封面 + 名称 + 价格 + 操作 | "做一个商品卡片" |
| 3 | `profile` | 封面 + 头像 + 昵称 + 统计 | "做一个个人中心卡片" |
| 4 | `friend` | 头像 + 昵称 + 签名 + 箭头 | "做一个好友卡片" |
| 5 | `set` | 图标 + 标签 + 开关/箭头（列表） | "做一个设置卡片" |
| 6 | `vip` | 渐变 + 头像 + 等级 + 权益 | "做一个 VIP 卡片" |
| 7 | `menu` | 九宫格图标 + 标签 | "做一个九宫格菜单" |
| 8 | `grid` | N 列功能网格 | "做一个功能网格卡片" |
| 9 | `image` | 大图 + 标题 + 描述 + 底部 | "做一个图片卡片" |
| 10 | `notify` | 图标 + 标题 + 描述 + 时间 + 徽标 | "做一个通知卡片" |
| 11 | `comment` | 头像 + 昵称 + 时间 + 内容 + 点赞（支持嵌套回复） | "做一个评论卡片" |

## 命名对齐矩阵（与 uniapp-card-skill 完全对齐）

```
vue-card-skill          ←   uniapp-card-skill
base-card               ←   base-card
base-wg-card            ←   base-wg-card
variant=basic           ←   variant=basic
variant=product         ←   variant=product
variant=profile         ←   variant=profile
variant=friend          ←   variant=friend
variant=set             ←   variant=set
variant=vip             ←   variant=vip
variant=menu            ←   variant=menu
variant=grid            ←   variant=grid
variant=image           ←   variant=image
variant=notify          ←   variant=notify
variant=comment         ←   variant=comment
```

跨技能命名严格保持一致：组件名、variant 名、Token、文件结构、容器原则。

## 🚫 零样式标签铁律（.md 文档约束）

> **所有 `.md` 文档中的实现代码（`<template>` / `<script>` / `<style>` / 代码片段）必须仅使用 `<div>` / `<span>` + CSS3。**

### 严禁使用清单（实现代码）

| HTML 标签 | 必须替换为 |
|----------|-----------|
| `<p>` `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` | `<div>` + CSS `font-weight` / `font-size` |
| `<header>` `<footer>` `<section>` `<article>` `<aside>` `<nav>` `<main>` | `<div class="*-header/footer/...">` |
| `<button>` `<input>` `<select>` `<form>` `<label>` `<fieldset>` `<option>` `<textarea>` `<checkbox>` `<radio>` | 对应 base-* 组件（如 `<base-button>`）或 `<div role="button">` |
| `<table>` `<tr>` `<td>` `<th>` `<thead>` `<tbody>` | `<base-table>` 或 `<div>` + CSS grid |
| `<img>` | `<div>` + `background-image: url(...)` |
| `<strong>` `<em>` `<b>` `<i>` `<u>` `<s>` | `<span>` + CSS `font-weight` / `font-style` / `text-decoration` |
| `<a>`（除显式链接） | `<div>` + `@click`（链接也建议 `router-link` 或 `<div>`） |
| `<ul>` `<ol>` `<li>` | `<div>` + CSS 列表样式 |

### 唯一例外

✅ **Demo HTML 文件**（`demo-components/**/*.html`）允许使用 HTML5 标签 —— 仅给用户查看的运行示例，与生产组件实现隔离。
✅ **SKILL.md 反例代码块**：为教学目的保留违规反例，已用注释明确标注 `<!-- ❌ 严禁 -->`。

### 反例 vs 正例

```vue
<!-- ❌ 严禁：base-card.md / base-wg-card.md 中不能出现这些标签 -->
<header class="card-header">
  <h3>标题</h3>
  <p>描述</p>
</header>
<footer class="card-footer">
  <button>确定</button>
</footer>
<section>区块内容</section>
<table>
  <tr><td>...</td></tr>
</table>
```

```vue
<!-- ✅ 正确：必须用 div/span + CSS3 -->
<div class="base-card__header">
  <div class="base-card__title">标题</div>
  <div class="base-card__desc">描述</div>
</div>
<div class="base-card__footer">
  <base-button>确定</base-button>
</div>
<div class="base-card__section">区块内容</div>
<base-table :data="data" :columns="columns" />
```

### 审计命令

每次新增或修改 `base-*.md` 文件必须执行：

```bash
# 强化审计：覆盖全部违规标签（仅 .md 实现文件，SKILL.md 反例块已豁免）
grep -rnE '<(p|header|footer|section|article|aside|nav|main|h[1-6]|button|table|input|select|form|label|fieldset|option|textarea|img|strong|em|b |i |u |s |a |ul|ol|li)' \
  --include="base-*.md" \
  ./vibeCoding/frontend/vue/vue-card-skill

# 输出为空才算合规。SKILL.md 的反例代码块除外（已标注 ❌ 严禁）。
```

## 设计 Token

所有组件统一引用 [vue-theme-skill](../../vue-theme-skill/)：

| 类别 | 命名规范 | 示例 |
|------|----------|------|
| 颜色 | `--color-{name}-{50~950}` / `--color-{name}` | `--color-primary` `--color-surface` |
| 间距 | `--space-{n}` | `--space-4`(16px) |
| 字号 | `--font-{2xs~3xl}` | `--font-lg`(16px) |
| 圆角 | `--radius-{sm~xl,full}` | `--radius-lg`(16px) |
| 高度 | `--height-{comp}-{sm,md,lg}` | `--height-card-md`(120px) |
| 阴影 | `--shadow-{sm,md,lg}` | `--shadow-sm` |
| 字重 | `--weight-{normal~bold}` | `--weight-semibold`(600) |

**禁止硬编码任何颜色 / 间距 / 字号 / 圆角 / 阴影值。**

## 容器原则（铁律）

> **所有涉及内容容器的组件，都必须使用 base-card 作为容器**

- 业务内容 → base-card 包裹
- 按钮容器 → base-card 包裹
- 表格区域 → base-card 包裹（[vue-table-skill](../vue-table-skill/)）
- 列表项 → base-card 承载每行内容
- 页面区块 → base-card 作为卡片容器
- **业务卡片 → base-wg-card 内部必须包 base-card**

**即：base-card 是 vue-base-skill 所有子技能的容器基底；base-wg-card 是 base-card 的业务形态封装。**

## base-card 参数矩阵（6 维度）

> **base-card 是 vue-base-skill 顶层的公共根容器**，完整规格（6 维度 prop / slot / event / template / style）见：
>
> ➡️ [../../base-card.md](../../base-card.md)
>
> 本文件不再重复定义，base-wg-card 必须基于该源头规格实现。

## 文件结构

```
vue-base-skill/
├── base-card.md                      # L0 根容器规格（公共，源头）
└── vue-card-skill/                   # ← 本技能目录
    ├── SKILL.md                      # 父技能入口
    ├── README.md
    ├── base-wg-card.md               # L1 业务卡片组件（11 种 variant）
    └── demo-components/
        ├── shared/
        │   ├── tokens.css            # 复用 vue-theme-skill Token
        │   └── demo.css              # 演示样式
        └── base-wg-card/
            ├── README.md
            └── html/
                └── 00-showcase.html  # 11 种 variant 速查
```

**base-card 是 vue-base-skill 顶层的公共组件**，本目录不再重复定义；所有 base-card 相关规格请前往 `../../base-card.md` 查看。

## 第三方组件库禁令

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue / 任何第三方 UI 库的卡片组件。

## 跨技能协同

- **vue-theme-skill**：所有 Token 的唯一来源
- **vue-style-skill**：通用样式规范（BEM 命名 / 样式组织）
- **vue-button-skill**：base-card / base-wg-card 内嵌按钮（基础卡片 / 商品卡片 / 设置卡片）
- **vue-tag-skill**：base-card / base-wg-card 内嵌标签（基础卡片 / 商品卡片 / VIP 卡片）
- **vue-switch-skill**：base-wg-card (set 变体) 内嵌开关
- **vue-table-skill**：表格必须 base-card 包裹
- **vue-form-skill**：表单必须 base-card 包裹

## 红线

- ❌ 禁止用 `<div>` 替代 `<base-card>` 作为内容容器
- ❌ 禁止在 base-card 内部自定义背景色（必须用 Token）
- ❌ 禁止跨端硬编码 rpx / rem
- ❌ 禁止修改 base-card 的圆角 / 阴影 Token
- ❌ 禁止使用 `<p>` `<h1~h6>` `<header>` `<footer>` `<section>` `<article>` `<aside>` `<nav>` `<main>` `<button>` `<table>` `<input>` `<select>` `<form>` `<label>` `<fieldset>` `<option>` `<textarea>` `<img>` `<strong>` `<em>` `<b>` `<i>` `<u>` `<s>` `<a>` `<ul>` `<ol>` `<li>` 等带默认样式的标签（必须 `<div>` `<span>` + CSS3）
- ❌ 禁止混入 Element Plus / 任何第三方卡片组件
- ❌ **禁止 base-wg-card 脱离 base-card 单独存在**（破坏容器原则）

## 容器原则（必读）

> 所有组件必须嵌入 `<base-card>`，无例外。

```vue
<!-- ✅ 正确 -->
<base-card title="用户列表">
  <base-table :data="users" :columns="columns" />
</base-card>

<!-- ✅ 业务卡片：base-wg-card 内部必须包 base-card -->
<base-wg-card variant="basic" :data="{ title: '标题' }">
  <div>内容</div>
</base-wg-card>

<!-- ❌ 错误 -->
<base-table :data="users" :columns="columns" />

<!-- ❌ 错误：base-wg-card 脱离 base-card -->
<base-wg-card variant="basic" :data="{ title: '标题' }">
  <div>内容</div>
</base-wg-card>
```