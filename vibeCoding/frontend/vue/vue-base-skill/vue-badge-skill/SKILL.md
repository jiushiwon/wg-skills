---
name: vue-badge-skill
description: Vue 徽标组件技能。用于消息计数、状态指示、角标。5 种形态：圆点/数字/文字/红点/最大值。触发词：徽标、徽章、badge、小红点、消息计数、角标。
trigger: |
  做一个徽标 | 做一个徽章 | 做一个 badge
  消息计数 | 角标 | 小红点
  数字徽标 | 状态徽标
---

# vue-badge-skill

> Vue 徽标组件技能。基于 vue-theme-skill 的 Token 实现。

## 核心组件

| 组件 | 说明 |
|------|------|
| **base-badge** | 通用徽标（5 种形态） |

## 形态矩阵

| 形态 | 说明 | 场景 |
|------|------|------|
| `dot` | 圆点 | 在线状态、待处理 |
| `count` | 数字 | 消息数量、购物车 |
| `text` | 文字 | NEW、HOT、热门 |
| `max` | 最大值 | 99+、999+ |
| `dot-pulse` | 脉冲红点 | 重要通知 |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'dot' \| 'count' \| 'text' \| 'max'` | `'count'` | 徽标类型 |
| `value` | `number \| string` | `0` | 数值或文字 |
| `max` | `number` | `99` | 最大显示值 |
| `showZero` | `boolean` | `false` | 是否显示 0 |
| `pulse` | `boolean` | `false` | 是否脉冲动画 |
| `color` | `string` | `'error'` | 颜色主题 |

## 使用示例

```vue
<!-- 数字徽标 -->
<base-badge :value="5" />
<base-badge :value="100" :max="99" />

<!-- 圆点徽标 -->
<base-badge type="dot" />

<!-- 文字徽标 -->
<base-badge type="text" value="NEW" />

<!-- 脉冲红点 -->
<base-badge type="dot" :pulse="true" />

<!-- 购物车数量 -->
<base-badge :value="cartCount" :max="99" />
```

## 样式 Token

| 变量 | 说明 |
|------|------|
| `--badge-bg` | 徽标背景色 |
| `--badge-text` | 徽标文字色 |
| `--badge-size` | 徽标尺寸 |
| `--badge-font-size` | 字号 |

## 跨技能协同

| 技能 | 用途 |
|------|------|
| vue-theme-skill | Token 样式 |
| vue-icon-skill | 图标徽标组合 |
| vue-button-skill | 按钮徽标组合 |
| vue-menu-skill | 菜单徽标 |
| vue-dropdown-skill | 下拉徽标 |

## 红线

- ❌ 禁止硬编码颜色
- ❌ 禁止第三方 UI 库

## 文件结构

```
vue-badge-skill/
├── SKILL.md
├── README.md
├── base-badge.md
├── components/
│   └── BaseBadge.vue
└── demo-components/
    └── base-badge/
        └── html/
            └── 00-showcase.html
```
