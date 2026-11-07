---
name: vue-contextmenu-skill
description: Vue3 右键菜单组件技能。基于 vue-list-item-skill（4 槽位复用），通过 prop / options 配置启用 8 种形态：基础菜单 / 嵌套子菜单 / 图标菜单 / 分割线菜单 / 动态条件菜单 / 左键点击触发 / 键盘导航 / 边缘检测。所有菜单项渲染统一收敛到 base-list-item。触发词："Vue 右键菜单"、"contextmenu"、"右键弹出菜单"、"菜单嵌套"、"做一个右键菜单"。
trigger: |
  帮我做一个右键菜单 | 做一个 contextmenu | 做一个右键弹出菜单
  嵌套菜单 | 多级子菜单 | 菜单带图标 | 菜单分割线
  动态菜单 | 根据权限显示菜单项 | 菜单支持键盘导航
  边缘检测 | 菜单位置自适应
---

# vue-contextmenu-skill

> **右键菜单组件技能**。菜单项渲染 = `base-list-item`，业务只关心 `MenuOption[]` 数据契约 + 4 个 prop 开关。

> **底层依赖**：[vue-list-item-skill](../vue-list-item-skill/SKILL.md)（菜单项渲染基座）
>
> **容器原则**：菜单弹层使用 Teleport 到 body，宿主容器使用 [vue-card-skill](../vue-card-skill/SKILL.md) 的 `<base-card>`。

## 与 vue-card-skill 的关系

```
base-card                  ← L0 容器（宿主）
└─ 业务组件                ← 触发 contextmenu
   ↳ base-contextmenu      ← L1 右键弹层（本技能，Teleport 到 body）
      └─ base-list-item    ← 菜单项渲染（依赖）
```

## 8 种形态（options / prop 叠加）

| # | 形态 | 启用方式 |
|---|------|---------|
| 1 | **基础菜单** | options 数组 |
| 2 | **嵌套子菜单** | `option.children` |
| 3 | **图标菜单** | `option.icon` |
| 4 | **分割线菜单** | `option.divider: true` |
| 5 | **动态条件菜单** | `option.show` |
| 6 | **左键点击触发** | `trigger="click"` |
| 7 | **键盘导航** | 内置（↑↓ Enter Esc） |
| 8 | **边缘检测** | 内置 `adjustPosition` |

## 数据契约 MenuOption

```typescript
interface MenuOption {
  id: string                  // 唯一标识
  label?: string               // 显示文本
  icon?: string               // 图标
  shortcut?: string           // 快捷键（Ctrl+C）
  command?: string | number   // 业务命令（select 回调参数）
  disabled?: boolean          // 禁用
  danger?: boolean            // 危险项（红色）
  divider?: boolean           // 是否为分割线
  show?: boolean              // 条件渲染
  children?: MenuOption[]     // 子菜单
}
```

完整组件规格（Props / Events / Slots / 完整实现 / 反例 vs 正例）见 [base-contextmenu.md](base-contextmenu.md)。

## 命名对齐矩阵（与 vue-list-item 一致）

| ContextMenu 槽位 | list-item 槽位 |
|------------------|----------------|
| `option.icon`    | `[icon]` |
| `option.label`   | `[label]` |
| `option.shortcut`| `[shortcut]` |
| `option.divider` | `[divider]` |
| `option.children`| 递归 base-list-item |

## 跨技能协同

- **vue-list-item-skill**：菜单项 = `base-list-item`（复用 variant）
- **vue-tree-skill**：`<base-tree>` 的 `@contextmenu` 事件触发本组件
- **vue-table-skill**：表格行右键菜单
- **vue-card-skill**：宿主容器必须 base-card 包裹

## 与 vue-tree-skill 联动示例

```vue
<template>
  <base-card title="文件树">
    <base-tree :data="files" @contextmenu="onRightClick" />

    <base-contextmenu
      v-model:visible="ctx.visible"
      :x="ctx.x" :y="ctx.y"
      :options="fileMenuOptions"
      @select="onCommand"
    />
  </base-card>
</template>
```

## 不做

- 不提供后端数据接口（业务自行 fetch）
- 不处理权限控制（用 `option.show` 在业务层判断）
- ❌ 禁止脱离 `base-list-item` 重新实现菜单项渲染
- ❌ 禁止用 `<ul> <li>` 原生标签实现菜单结构

## 文件结构

```
vue-contextmenu-skill/
├── SKILL.md                      # 本文件
├── README.md
├── base-contextmenu.md           # 完整组件规格
└── demo-components/
    ├── shared/                   # 共享 CSS
    └── base-contextmenu/
        └── html/
            └── 00-showcase.html  # 单一 showcase（8 形态 + 4 联动场景）
```