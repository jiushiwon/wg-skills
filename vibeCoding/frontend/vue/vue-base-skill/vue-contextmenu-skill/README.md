# vue-contextmenu-skill

> Vue3 右键菜单组件技能，基于 `vue-list-item-skill`，8 种形态通过 options 配置启用。

## 文档入口

- 📘 [SKILL.md](SKILL.md) —— 技能入口（trigger / 形态一览 / 命名对齐 / 跨技能协同）
- 📐 [base-contextmenu.md](base-contextmenu.md) —— 完整组件规格（Props / Events / Slots / 完整实现 / 反例 vs 正例）

## 演示

打开 `demo-components/base-contextmenu/html/00-showcase.html` 查看 8 种形态 + 4 种联动场景。

## 依赖

```
base-card                 ← 容器（vue-card-skill）
└─ 业务组件               ← 触发 @contextmenu
   ↳ base-contextmenu     ← 本技能（Teleport 到 body）
      └─ base-list-item   ← 菜单项渲染（vue-list-item-skill）
```