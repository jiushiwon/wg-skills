---
name: vue-dropdown-skill
description: Vue 万能浮层组件技能。基于「一个组件 5 种 mode」思想，核心是 base-dropdown：单一组件 + mode 切换，融合下拉菜单（dropdown）、气泡框（popover）、单选选择器（select）、多选选择器（multi-select）、右键菜单（menu）5 种浮层形态。面板统一由 base-card 容器承载。支持 12 种 position × 5 种 trigger × 3 种 size × 5 种 tone = 3600+ 组合。支持本地搜索 / 远程搜索 / 虚拟滚动 / 多选 tag / 加载态 / 禁用态。触发词："vue 下拉框"、"vue 气泡框"、"vue 选择器"、"vue 下拉菜单"、"做一个下拉"、"做一个气泡"、"做一个 select"、"替代 select"、"select 远程搜索"、"select 虚拟滚动"。
trigger: |
  # 下拉菜单
  帮我做一个下拉菜单 | 做一个下拉 | 操作下拉 | 菜单下拉
  # 气泡框
  做一个气泡框 | 做一个气泡 | popover | tooltip | 悬停提示
  # 选择器
  做一个 select | 做一个选择器 | 替代 select | 自定义下拉框
  单选 select | 多选 select | 搜索 select
  # 远程 + 虚拟
  远程搜索 select | 远程加载下拉 | 虚拟滚动 select | 大数据 select
  # 容器原则
  base-card 包裹浮层 | base-dropdown
---

# vue-dropdown-skill

> 基于「一个组件 5 种 mode」思想的 Vue 万能浮层组件技能。base-dropdown 是核心，融合 5 种浮层形态（dropdown / popover / select / multi-select / menu），单组件 + mode 切换。
>
> **本技能严格镜像 [uniapp-dropdown-skill](../../uniapp/uniapp-base-skill/uniapp-dropdown-skill/)**，命名 100% 对齐。
>
> **容器铁律**：所有 panel 必须由 base-card 容器承载。
>
> **零样式标签铁律**：模板内仅使用 `<div>` / `<span>`，禁止 `<p>` `<h1~h6>` `<header>` `<footer>` `<section>` `<article>` `<aside>` `<nav>` `<main>` `<button>` `<table>` `<input>` `<select>` `<form>` `<label>` `<fieldset>` `<option>` `<img>` `<strong>` `<em>` `<ul>` `<ol>` `<li>` `<a>` 等带默认样式的标签。图标用 `<div>` + CSS mask data URI。

## 核心组件

| 组件 | 层级 | 角色 | 文档 |
|------|------|------|------|
| **base-card** | L0 | 根容器（panel 内部必包） | [../base-card.md](../base-card.md) |
| **base-dropdown** | L1 | 万能浮层（5 mode × 12 position × 5 trigger = 300+ 组合） | [base-dropdown.md](base-dropdown.md) |

## 5 种 mode 速查

| # | mode | 替代 | 关键能力 |
|---|------|------|----------|
| 1 | `dropdown` | 操作下拉 / 筛选菜单 | click trigger · 菜单项分组 / 分隔线 / danger |
| 2 | `popover` | tooltip / 详情预览 | hover/focus trigger · 12 位置 · 箭头 · 富内容 |
| 3 | `select` | 原生 `<select>` | click trigger · v-model · 搜索 / 清空 / 远程 / 虚拟滚动 |
| 4 | `multi-select` | 多选 `<select>` | click trigger · v-model array · tag pill · max 限制 |
| 5 | `menu` | contextmenu | 右键 trigger · 鼠标定位 · 快捷键后缀 |

## 维度矩阵

| 维度 | 入参 | 默认 | 可选值 |
|------|------|------|--------|
| 模式 | `mode` | `dropdown` | `dropdown` / `popover` / `select` / `multi-select` / `menu` |
| 位置 | `position` | `bottom-start` | `bottom-start/end/bottom` / `top-start/end/top` / `left-start/end/left` / `right-start/end/right` |
| 触发 | `trigger` | 随 mode | `click` / `hover` / `focus` / `manual` / `contextmenu` |
| 尺寸 | `size` | `md` | `sm` / `md` / `lg` |
| 色调 | `tone` | `neutral` | `neutral` / `primary` / `success` / `warning` / `danger` |

**5 × 12 × 5 × 3 × 5 = 4500+ 种组合**。

## 能力清单（select / multi-select 专属）

| 能力 | prop | 默认 | 说明 |
|------|------|------|------|
| 本地搜索 | `searchable` | `false` | 关键字高亮过滤 |
| 一键清空 | `clearable` | `false` | trigger 内显示 × 按钮 |
| 多选 | `multiple` 或 `mode='multi-select'` | `false` | tag pill 展示 |
| 最多选几项 | `max` | `Infinity` | multi-select 用 |
| 远程搜索 | `remote` | `false` | 配合 `remote-function` |
| 防抖 | `debounce` | `300` | ms |
| 虚拟滚动 | `virtual` | `false` | > 100 选项建议开启 |
| 虚拟行高 | `rowHeight` | `36` | px |

## 命名对齐矩阵（与 uniapp-dropdown-skill 完全对齐）

```
vue-dropdown-skill            ←   uniapp-dropdown-skill
base-dropdown                 ←   base-dropdown
mode='dropdown'               ←   mode='dropdown'
mode='popover'                ←   mode='popover'
mode='select'                 ←   mode='select'
mode='multi-select'           ←   mode='multi-select'
mode='menu'                   ←   mode='menu'
trigger='click/hover/...'     ←   trigger='click/hover/...'
position='bottom-start/...'   ←   position='bottom-start/...'
tone='primary/...'            ←   tone='primary/...'
searchable / clearable        ←   searchable / clearable
remote / virtual              ←   remote / virtual
```

跨技能命名严格保持一致：组件名、mode 名、prop 名、Token、文件结构、容器原则。

## 🚫 零样式标签铁律（.md 文档约束）

> **所有 `.md` 文档中的实现代码必须仅使用 `<div>` / `<span>` + CSS3。**

### 严禁使用清单（实现代码）

| HTML 标签 | 必须替换为 |
|----------|-----------|
| `<p>` `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` | `<div>` + CSS `font-weight` / `font-size` |
| `<header>` `<footer>` `<section>` `<article>` `<aside>` `<nav>` `<main>` | `<div class="*-header/footer/...">` |
| `<button>` `<input>` `<select>` `<form>` `<label>` `<fieldset>` `<option>` `<textarea>` `<checkbox>` `<radio>` | 对应 base-* 组件或 `<div role="button">` |
| `<table>` `<tr>` `<td>` `<th>` `<thead>` `<tbody>` | `<base-table>` 或 `<div>` + CSS grid |
| `<img>` | `<div>` + `background-image: url(...)` |
| `<strong>` `<em>` `<b>` `<i>` `<u>` `<s>` | `<span>` + CSS `font-weight` / `font-style` |
| `<a>`（除显式链接） | `<div>` + `@click` |
| `<ul>` `<ol>` `<li>` | `<div>` + CSS 列表样式 |

### 唯一例外

✅ **Demo HTML 文件**（`demo-components/**/*.html`）允许使用 HTML5 标签 —— 仅给用户查看的运行示例，与生产组件实现隔离。
✅ **SKILL.md 反例代码块**：为教学目的保留违规反例，已用注释明确标注 `<!-- ❌ 严禁 -->`。

### 反例 vs 正例

```vue
<!-- ❌ 严禁：base-dropdown.md 中不能出现这些标签 -->
<select class="dropdown">
  <option value="bj">北京</option>
  <option value="sh">上海</option>
</select>
<button class="trigger">操作</button>
<ul class="menu">
  <li>编辑</li>
  <li>删除</li>
</ul>
```

```vue
<!-- ✅ 正确：必须用 div/span + base-card 容器 -->
<base-dropdown mode="select" :options="opts" v-model="value" />
<base-dropdown mode="dropdown" :items="items">
  <template #trigger>操作</template>
</base-dropdown>
<base-dropdown mode="dropdown" :items="items" />  <!-- 内部分组 + 分割线 + danger 全 div -->
```

### 审计命令

每次新增或修改 `base-*.md` 文件必须执行：

```bash
# 强化审计：覆盖全部违规样式标签（仅 .md 实现文件）
grep -rnE '<(p|header|footer|section|article|aside|nav|main|h[1-6]|button|table|input|select|form|label|fieldset|option|textarea|img|strong|em|b |i |u |s |a |ul|ol|li)' \
  --include="base-*.md" \
  ./vibeCoding/frontend/vue/vue-base-skill/vue-dropdown-skill

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
| 阴影 | `--shadow-{sm,md,lg,xl}` | `--shadow-lg`(浮层用) |
| 字重 | `--weight-{normal~bold}` | `--weight-semibold`(600) |

**禁止硬编码任何颜色 / 间距 / 字号 / 圆角 / 阴影值。**

## 容器原则（铁律）

> **所有 panel（浮层面板）都必须使用 base-card 作为容器基底**

- dropdown panel → base-card 包裹
- popover panel → base-card 包裹（带 arrow）
- select panel → base-card 包裹（带 search + options）
- multi-select panel → base-card 包裹
- menu panel → base-card 包裹

**即：base-dropdown 是 base-card 的浮层形态封装，panel 内部必走 base-card。**

## 文件结构

```
vue-base-skill/
├── base-card.md                      # L0 根容器规格（公共，源头）
└── vue-dropdown-skill/               # ← 本技能目录
    ├── SKILL.md                      # 父技能入口
    ├── README.md
    ├── base-dropdown.md              # L1 万能浮层组件（5 mode × 12 position × 5 trigger）
    └── demo-components/
        ├── shared/
        │   ├── tokens.css            # 复用 vue-theme-skill Token
        │   ├── icons.css             # 28 个 SVG mask 图标
        │   ├── dropdown.css          # base-dropdown 全部样式
        │   └── demo.css              # 演示页布局样式
        └── base-dropdown/
            └── html/
                └── 00-showcase.html  # 总览（5 mode + 12 position + 5 trigger + API 参数表）
```

**base-card 是 vue-base-skill 顶层的公共组件**，本目录不再重复定义；所有 base-card 相关规格请前往 `../base-card.md` 查看。

## 第三方组件库禁令

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue / 任何第三方 UI 库的下拉 / 气泡 / 选择器组件。

## 跨技能协同

- **vue-theme-skill**：所有 Token 的唯一来源
- **vue-style-skill**：通用样式规范
- **vue-card-skill**：base-dropdown panel 内部必包 base-card 容器
- **vue-button-skill**：dropdown trigger 内嵌按钮
- **vue-tag-skill**：select 选项 / multi-select tag 内嵌标签
- **vue-form-skill**：select 在表单中作为字段

## 红线

- ❌ 禁止用 `<div>` 替代 `<base-dropdown>` 作为浮层
- ❌ 禁止在 panel 内部自定义背景色（必须用 Token）
- ❌ 禁止跨端硬编码 rpx / rem
- ❌ 禁止修改 base-dropdown 的圆角 / 阴影 Token
- ❌ 禁止使用 `<select>` `<option>` `<input>` `<button>` 等原生表单标签（必须 base-dropdown）
- ❌ 禁止使用 `<p>` `<h1~h6>` `<header>` `<footer>` `<section>` `<article>` `<aside>` `<nav>` `<main>` `<button>` `<table>` `<input>` `<select>` `<form>` `<label>` `<fieldset>` `<option>` `<textarea>` `<img>` `<strong>` `<em>` `<b>` `<i>` `<u>` `<s>` `<a>` `<ul>` `<ol>` `<li>` 等带默认样式的标签
- ❌ 禁止混入 Element Plus / 任何第三方下拉 / 气泡 / 选择器组件
- ❌ **禁止 base-dropdown panel 脱离 base-card 容器**（破坏容器原则）

## 容器原则（必读）

> 所有浮层面板必须嵌入 `<base-card>`，无例外。

```vue
<!-- ✅ 正确：panel 内部包 base-card -->
<base-dropdown mode="popover">
  <template #trigger>悬停看气泡</template>
  <base-card padding="sm" radius="md">
    <div>气泡内容</div>
  </base-card>
</base-dropdown>

<!-- ❌ 错误：裸 div 替代 base-card -->
<base-dropdown mode="popover">
  <div>气泡内容</div>
</base-dropdown>
```