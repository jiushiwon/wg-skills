---
name: vue-tree-skill
description: Vue3 树形组件技能。基于 vue-list-item-skill（4 槽位复用），通过 prop 开关叠加 8 种形态：基础树 / 复选框树 / 懒加载树 / 可拖拽树 / 右键菜单树 / 可搜索树 / 可编辑树 / 节点图标树。所有节点渲染统一收敛到 base-list-item，业务只关心数据契约 TreeNode。触发词："Vue 树组件"、"树形菜单"、"组织架构树"、"文件树"、"分类树"、"做一个树"。
trigger: |
  帮我做一个树 | 做一个树形菜单 | 做一个组织架构树
  做一个文件树 | 做一个分类树 | 做一个目录树
  做一个带复选框的树 | 树支持懒加载 | 树支持拖拽
  树节点支持编辑 | 树节点支持搜索 | 树节点右键菜单
  树 + 右键菜单 联动
---

# vue-tree-skill

> **树形组件技能**。节点渲染 = `base-list-item`，业务只关心 `TreeNode` 数据契约 + 8 个 prop 开关。

> **底层依赖**：[vue-list-item-skill](../vue-list-item-skill/SKILL.md)（节点渲染基座）+ [vue-contextmenu-skill](../vue-contextmenu-skill/SKILL.md)（右键菜单联动）
>
> **容器原则**：必须用 [vue-card-skill](../vue-card-skill/SKILL.md) 的 `<base-card>` 包裹。

## 与 vue-card-skill 的关系

```
base-card                 ← L0 容器
└─ base-tree              ← L1 树形菜单（本技能）
```

**禁止裸用 `<base-tree>`**（违反容器原则）。

```vue
<!-- ✅ 正确 -->
<base-card title="组织架构">
  <base-tree :data="orgData" @select="onSelect" @contextmenu="onCtxMenu" />
</base-card>

<!-- ❌ 错误 -->
<base-tree :data="orgData" />
```

## 8 种形态（prop 开关叠加）

| # | 形态 | prop | 默认 |
|---|------|------|------|
| 1 | **基础树** | — | ✅ 默认 |
| 2 | **复选框树** | `checkbox` | ❌ |
| 3 | **懒加载树** | `lazy` + `load` | ❌ |
| 4 | **可拖拽树** | `draggable` | ❌ |
| 5 | **右键菜单树** | `@contextmenu` 事件 | — |
| 6 | **可搜索树** | `v-model:search` + `filter-node` | ❌ |
| 7 | **可编辑树** | `editable` | ❌ |
| 8 | **节点图标树** | `TreeNode.icon` | — |

形态可叠加：`<base-tree :data :checkbox :draggable :editable />`

## 数据契约 TreeNode

```typescript
interface TreeNode {
  id: string                  // 唯一标识
  label: string               // 显示文本
  icon?: string               // 节点图标
  meta?: string               // 右侧次要文本（KB / 人数 / 数量）
  badge?: string | number     // 徽标（新人 / P0）
  disabled?: boolean          // 禁用
  open?: boolean              // 默认展开
  children?: TreeNode[]       // 子节点
  isLeaf?: boolean            // 懒加载标记
}
```

完整组件规格（Props / Events / Slots / 完整实现 / 反例 vs 正例）见 [base-tree.md](base-tree.md)。

## 命名对齐矩阵（与 uniapp / list-item 一致）

| 本技能 | vue-list-item-skill | uniapp-tree-skill |
|--------|---------------------|---------------------|
| `base-tree` | — | `base-tree` |
| `TreeNode` | `ListItem` | `TreeNode` |
| 节点渲染 | `base-list-item` | `uni-list-item` |

## 跨技能协同

- **vue-list-item-skill**：每个节点 = 一个 `base-list-item`
- **vue-contextmenu-skill**：右键节点弹 contextmenu，传递 `TreeNode`
- **vue-card-skill**：必须 base-card 包裹
- **vue-icon-skill**：节点 icon 可引用 icon 组件

## 不做

- 不提供后端数据接口（业务自行 fetch）
- 不处理权限控制
- 不内置主题（用 vue-theme-skill）
- ❌ 禁止用 `<div>` 替代 `<base-card>` 作为容器
- ❌ 禁止脱离 `base-list-item` 重新实现节点渲染

## 文件结构

```
vue-tree-skill/
├── SKILL.md                      # 本文件
├── README.md
├── base-tree.md                  # 完整组件规格
└── demo-components/
    ├── shared/                   # 共享 CSS（tokens / list-item / demo / tree）
    └── base-tree/
        └── html/
            └── 00-showcase.html  # 单一 showcase（8 形态对比）
```