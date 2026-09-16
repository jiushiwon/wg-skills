---
name: vue-card-skill
description: Vue 卡片容器组件技能。base-card 是所有组件的根容器，承载业务区块、表单、表格。零 HTML5 标签，用 div + CSS3 实现。支持 title / shadow / hoverable / bordered 变体，对齐 vue-theme-skill CSS 变量。当用户说"卡片组件"、"base-card"、"容器组件"时触发。
---

# vue-card-skill

> 容器原则：所有业务区块、表单、表格都必须嵌入 `<base-card>`，无例外。

## 组件规格

```vue
<!-- base-card.vue -->
<template>
  <div :class="['base-card', { 'base-card--hoverable': hoverable, 'base-card--bordered': bordered }]">
    <div v-if="title || $slots.header" class="base-card__header">
      <slot name="header">
        <span class="base-card__title">{{ title }}</span>
        <span v-if="extra" class="base-card__extra">{{ extra }}</span>
      </slot>
    </div>
    <div class="base-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | `''` | 卡片标题 |
| extra | `string` | `''` | 右上角附加信息 |
| shadow | `boolean` | `true` | 是否显示阴影 |
| hoverable | `boolean` | `false` | hover 时上浮效果 |
| bordered | `boolean` | `true` | 是否显示边框 |

## Slots

| 名称 | 说明 |
|------|------|
| default | 主内容区 |
| header | 自定义头部（覆盖 title） |
| footer | 底部区域 |

## 样式规范

```css
.base-card {
  background: var(--color-bg);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
}
.base-card--bordered { border: 1px solid var(--color-border); }
.base-card--hoverable {
  transition: transform 0.2s, box-shadow 0.2s;
}
.base-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.base-card__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}
.base-card__title {
  font-size: var(--font-size-md, 15px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text);
}
.base-card__extra {
  font-size: var(--font-size-sm, 13px);
  color: var(--color-text-secondary);
}
.base-card__body { padding: 20px; }
.base-card__footer {
  padding: 12px 20px;
  border-top: 1px solid var(--color-border);
}
```

## 业务变体

### 信息卡片
```vue
<base-card title="用户信息" extra="编辑">
  <div>用户名：张三</div>
</base-card>
```

### 可点击卡片
```vue
<base-card hoverable @click="goDetail">
  <h3>项目名称</h3>
  <p>项目描述...</p>
</base-card>
```

### 嵌套容器（表单/表格必须嵌入）
```vue
<base-card title="订单列表">
  <base-table :columns="cols" :data="list" />
</base-card>
```
