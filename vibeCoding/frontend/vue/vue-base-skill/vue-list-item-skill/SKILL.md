---
name: vue-list-item-skill
description: Vue 列表项抽象基座技能。menu / tree / dropdown / select / tabs / breadcrumb 等所有「列表类」组件的共同基础。4 个槽位（expander / icon / label / meta）+ 6 种内置风格（basic / finder / win / vscode / admin / notion / nav）。触发词："列表项抽象"、"base-list-item"、"BaseListItem"、"通用列表项"、"菜单项基础"。
trigger: |
  # 列表项抽象
  列表项抽象 | 列表项基础 | 通用列表项
  base-list-item | BaseListItem
  菜单项基础 | 树节点抽象 | 选择项抽象 | 标签项抽象
---

# vue-list-item-skill

> Vue 列表项抽象基座。**所有「列表类」组件（menu / tree / dropdown / select / tabs / breadcrumb）的共同底层**。
>
> **本技能与 uniapp-list-item-skill 严格镜像**（待补），命名 100% 对齐。
>
> **零样式标签铁律**：实现代码仅使用 `<div>` / `<span>` + CSS3，禁止 `<p>` `<h1~h6>` `<header>` `<footer>` `<section>` `<article>` `<aside>` `<nav>` `<main>` `<button>` `<table>` `<input>` `<select>` `<form>` `<label>` `<img>` 等带默认样式的标签。

## 为什么需要列表项抽象

观察所有「列表类」组件：

| 组件 | 项的数据形态 |
|------|-------------|
| `base-tree` | `{ id, label, icon?, children?, meta? }` |
| `base-contextmenu` | `{ id, label, icon?, shortcut?, divider? }` |
| `base-dropdown` | `{ id, label, icon?, group? }` |
| `base-select` | `{ id, label, icon?, desc? }` |
| `base-tabs` | `{ id, label, icon?, badge? }` |
| `base-breadcrumb` | `{ label, href?, icon? }` |

每一类都在干同一件事——**渲染一行可点击的项**。如果不抽象，每个组件自己实现一遍 expander / icon / hover / active / disabled / divider，必然导致：

- 样式碎片化
- 交互不一致
- 代码重复 6 份

**vue-list-item-skill 把"项"这件事抽象到基座**，6 个上层组件都消费它。

## 核心组件

| 组件 | 角色 | 文档 |
|------|------|------|
| **base-list-item** | 列表项基座（4 槽位 + 6 风格） | [base-list-item.md](base-list-item.md) |

**职责**：
- 定义列表项的"形"：4 个槽位（expander / icon / label / meta）+ 6 种风格
- 不关心上层是什么组件（menu / tree / dropdown / select / tabs / breadcrumb）
- 上层组件只需要传 `items` 数据 + 视觉风格 class 即可

## 4 个槽位

```
┌─ [expander] [icon] [label] [meta] ─┐
```

| 槽位 | 数据字段 | 说明 |
|------|---------|------|
| `[expander]` | `children` | 有 children 就显示箭头，点击折叠/展开 |
| `[icon]` | `icon` | 图标（emoji / Unicode / CSS mask） |
| `[label]` | `label` | 主文本（必填） |
| `[meta]` | `meta` / `badge` / `shortcut` | 右侧附加 |

## 6 种内置风格

每种风格对应一种真实产品的视觉风格，**选择风格 = 选择产品基调**：

| # | 风格 class | 视觉基调 | 适用产品 |
|---|-----------|---------|---------|
| 1 | `basic` | 中性浅灰 + 蓝色高亮 | 后台管理、通用场景 |
| 2 | `finder` | macOS 蓝色选中 + 紧凑行高 | 个人文件、Finder 类 |
| 3 | `win` | 浅蓝 hover + 蓝边选中 | Windows 资源管理器 |
| 4 | `vscode` | 深色主题 + 等宽 meta | IDE、编辑器、终端 |
| 5 | `admin` | 方框箭头 + 浅蓝高亮 | Ant Design / Element UI 类后台 |
| 6 | `notion` | 灰色 hover + 纯文本层级 | Notion 文档、笔记类 |
| 7 | `nav` | 渐变选中 + 强引导阴影 | 侧边导航、菜单面板 |

> 7 种风格中 `nav` 风格视觉差异最大（强引导选中），其余 6 种都是细节微调。**生产项目通常默认使用 `basic`**，需要品牌差异化时切换其他风格。

## 数据契约

```typescript
interface ListItem {
  id: string                  // 唯一标识（必填）
  label: string               // 显示文本（必填）
  icon?: string               // 图标 key 或字符
  meta?: string               // 次要文本（如 "12 人"、"2.4KB"）
  badge?: string | number     // 徽章（如 "3"、"新人"）
  shortcut?: string           // 快捷键（如 "Ctrl+C"）
  disabled?: boolean          // 禁用
  danger?: boolean            // 危险项（红色样式）
  open?: boolean              // 是否展开（仅子项时有效）
  children?: ListItem[]       // 子项
  divider?: boolean           // 是否为分隔线
}
```

## 🚫 零样式标签铁律（.md 文档约束）

> **所有 `.md` 文档中的实现代码必须仅使用 `<div>` / `<span>` + CSS3。**

### 严禁使用清单

| HTML 标签 | 必须替换为 |
|----------|-----------|
| `<p>` `<h1~h6>` | `<div>` + CSS `font-weight` / `font-size` |
| `<header>` `<footer>` `<section>` `<article>` `<aside>` `<nav>` `<main>` | `<div class="*-header/footer/...">` |
| `<button>` `<input>` `<select>` `<form>` `<label>` `<textarea>` | 对应 base-* 组件 或 `<div role="button">` |
| `<table>` `<tr>` `<td>` | `<div>` + CSS grid |
| `<img>` | `<div>` + `background-image: url(...)` |
| `<strong>` `<em>` `<b>` `<i>` `<u>` `<s>` | `<span>` + CSS `font-weight` / `font-style` |
| `<ul>` `<ol>` `<li>` | `<div>` + CSS 列表样式 |
| `<a>` | `<div>` + `@click` 或 `<router-link>` |

### 唯一例外

✅ **Demo HTML 文件**（`demo-components/**/*.html`）允许使用 HTML5 标签 —— 仅给用户查看的运行示例，与生产组件实现隔离。

### 反例 vs 正例

```vue
<!-- ❌ 严禁：base-list-item.md 中不能出现这些标签 -->
<ul class="menu">
  <li><span>📋</span> 复制</li>
  <li><button>确定</button></li>
</ul>
```

```vue
<!-- ✅ 正确：必须用 div/span + CSS3 -->
<div class="list">
  <div class="list-item" @click="onSelect(item)">
    <span class="list-item__icon">📋</span>
    <span class="list-item__label">复制</span>
  </div>
  <div role="button" class="base-button" @click="confirm">确定</div>
</div>
```

## 命名对齐矩阵

```
vue-list-item-skill     ←   uniapp-list-item-skill（待补）
base-list-item          ←   base-list-item
slot=expander           ←   slot=expander
slot=icon               ←   slot=icon
slot=label              ←   slot=label
slot=meta               ←   slot=meta
variant=basic           ←   variant=basic
variant=finder          ←   variant=finder
variant=win             ←   variant=win
variant=vscode          ←   variant=vscode
variant=admin           ←   variant=admin
variant=notion          ←   variant=notion
variant=nav             ←   variant=nav
```

跨技能命名严格保持一致：组件名、slot、variant、Token、文件结构、容器原则。

## 与其他 Skill 的关系

```
┌─ vue-list-item-skill（列表项抽象基座）──┐
│                                          │
├─ vue-tree-skill ─────────────────────────┤
├─ vue-contextmenu-skill ──────────────────┤
├─ vue-dropdown-skill ────────────────────┤  全部消费 base-list-item
├─ vue-select-skill（待建）────────────────┤
├─ vue-tabs-skill（待建）──────────────────┤
└─ vue-breadcrumb-skill（待建）────────────┘
```

**所有"列表类"组件必须基于本 skill**，禁止在 tree / menu / dropdown / select / tabs 中重新实现列表项结构。

## 容器原则

> **一切皆容器**。所有使用 `base-list-item` 的组件必须被 `base-card` 包裹。

```vue
<base-card title="组织架构">
  <base-list-item
    v-for="node in treeData"
    :key="node.id"
    :item="node"
    variant="basic"
  />
</base-card>
```

## 演示

查看 `demo-components/base-list-item/html/00-showcase.html` —— 一个 HTML 文件演示 6 种风格 + 多种数据形态（树形 / 扁平 / 菜单）。

文件大小 < 30 KB，单一可运行示例，无多套重复 demo。