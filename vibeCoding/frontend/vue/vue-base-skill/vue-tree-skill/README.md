# vue-tree-skill

> Vue3 树形组件技能，基于 `vue-list-item-skill`，8 种形态通过 prop 开关叠加。

## 文档入口

- 📘 [SKILL.md](SKILL.md) —— 技能入口（trigger / 形态一览 / 命名对齐 / 跨技能协同）
- 📐 [base-tree.md](base-tree.md) —— 完整组件规格（Props / Events / Slots / 完整实现 / 反例 vs 正例）

## 演示

打开 `demo-components/base-tree/html/00-showcase.html` 查看 8 种形态的整合 showcase。

## 依赖

```
base-card            ← 容器（vue-card-skill）
└─ base-tree         ← 本技能
   └─ base-list-item ← 节点渲染（vue-list-item-skill）
      ↳ 右键弹 base-contextmenu（vue-contextmenu-skill）
```