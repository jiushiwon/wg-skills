# vue-dropdown-skill

> Vue 万能浮层组件技能——一个组件 5 种 mode，融合下拉 / 气泡 / 选择器 / 多选 / 右键菜单。

## 快速开始

```vue
<template>
  <!-- 1. 下拉菜单 -->
  <base-dropdown mode="dropdown" :items="menuItems">
    <template #trigger>操作</template>
  </base-dropdown>

  <!-- 2. 气泡框 -->
  <base-dropdown mode="popover" position="top" arrow>
    <template #trigger>悬停看提示</template>
    <div>气泡内容</div>
  </base-dropdown>

  <!-- 3. 单选选择器 -->
  <base-dropdown
    mode="select"
    v-model="city"
    :options="cityOptions"
    searchable
    clearable
  />

  <!-- 4. 多选选择器 -->
  <base-dropdown
    mode="multi-select"
    v-model="tags"
    :options="tagOptions"
    searchable
    :max="5"
  />

  <!-- 5. 右键菜单 -->
  <base-dropdown mode="menu" trigger="contextmenu" :items="menuItems" />
</template>
```

## 核心特性

- **5 mode × 12 position × 5 trigger × 3 size × 5 tone = 4500+ 组合**
- **能力齐全**：本地搜索 / 远程搜索 / 虚拟滚动 / 多选 tag / 加载态 / 禁用态 / 受控显隐
- **容器铁律**：panel 内部统一走 base-card 容器
- **零样式标签**：实现代码仅 `<div>` / `<span>`
- **Token 唯一**：所有样式走 vue-theme-skill，无硬编码

## 文档

- [SKILL.md](SKILL.md) — 父技能入口
- [base-dropdown.md](base-dropdown.md) — 万能浮层组件规格
- [../base-card.md](../base-card.md) — 根容器规格（panel 容器）

## Demo

- [demo-components/base-dropdown/html/00-showcase.html](demo-components/base-dropdown/html/00-showcase.html) — 总览（5 mode + 12 position + 5 trigger + API 参数表）

## 依赖技能

- vue-theme-skill · vue-style-skill · vue-card-skill · vue-button-skill · vue-tag-skill