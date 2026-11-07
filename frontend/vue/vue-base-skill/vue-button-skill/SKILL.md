---
name: vue-button-skill
description: Vue 按钮组件技能。提供 6 type × 3 variant × 3 size 按钮矩阵，零第三方组件库。
trigger: |
  帮我做一个按钮 | 做一个主色按钮 | 做一个实心按钮 | 做一个描边按钮
  做一个幽灵按钮 | 做一个文字按钮 | 做一个危险按钮
  做一个禁用按钮 | 做一个加载中按钮 | 做一个块级按钮
  做一个固定底部按钮 | 做一个底部悬浮按钮 | 做一个提交按钮
---

# vue-button-skill

> Vue 按钮组件技能。基于 vue-theme-skill 的 Token 实现，零第三方组件库。

## 核心组件

| 组件 | 说明 |
|------|------|
| **base-button** | 通用按钮（6 type × 3 variant × 3 size） |

## Props 矩阵

| 维度 | 可选值 |
|------|--------|
| `type` | default / primary / success / warning / danger / info |
| `variant` | solid（默认）/ outline / text |
| `size` | sm / md（默认）/ lg |
| `disabled` | boolean |
| `loading` | boolean |
| `block` | boolean（块级铺满） |

## 文件结构

```
vue-button-skill/
├── SKILL.md
├── README.md
├── base-button.md
└── demo-components/
    └── base-button/
        ├── README.md
        ├── html/01-types.html
        ├── html/02-variants.html
        └── html/03-sizes.html
```

## 容器原则

> 所有按钮组、操作栏都应嵌入 `<base-card>` 容器（[vue-card-skill](../vue-card-skill/)）。

```vue
<base-card title="商品管理">
  <template #header-right>
    <base-button>取消</base-button>
    <base-button type="primary">保存</base-button>
  </template>

  <div class="demo-row">
    <base-button>默认</base-button>
    <base-button type="primary" variant="outline">主要描边</base-button>
    <base-button type="danger" :loading="saving">删除</base-button>
  </div>
</base-card>
```

## 设计 Token

```css
.base-button {
  height: var(--height-button-md);     /* 36px */
  padding: 0 var(--space-4);           /* 16px */
  border-radius: var(--radius-md);     /* 6px */
  background: var(--color-surface);
  color: var(--color-text);
}
.base-button--type-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}
```

**禁止硬编码任何颜色 / 间距 / 行高 / 圆角值。**

## 第三方组件库

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue。