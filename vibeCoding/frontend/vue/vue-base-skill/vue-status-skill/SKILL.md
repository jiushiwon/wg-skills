---
name: vue-status-skill
description: Vue 通用状态/标签组件。Vue3 + TypeScript 泛型，支持 7 种 type（primary/success/warning/danger/info/default/neutral）、5 种 variant（solid/light/outline/ghost/dot）、3 种 size（sm/md/lg）、圆角/方形/可关闭/带图标。零第三方组件库。
trigger: |
  帮我做一个标签 | 做一个状态标签 | 做一个徽章
  做一个 success 标签 | 做一个 danger 标签 | 做一个 warning 标签
  做一个 info 标签 | 做一个带点的标签 | 做一个可关闭的标签
  做一个带图标的标签 | 做一个不同大小的标签
  做一个状态指示器 | 做一个标记 | 做一个 chip
---

# vue-status-skill

> Vue 通用状态/标签/徽章组件，Vue3 + TypeScript，零第三方依赖。

## 核心组件

| 组件 | 说明 |
|------|------|
| **base-status** | 状态/标签/徽章 |

## 设计要点

- ✅ 7 种 type：primary / success / warning / danger / info / default / neutral
- ✅ 5 种 variant：solid / light / outline / ghost / dot（仅圆点）
- ✅ 3 种 size：sm / md / lg
- ✅ 圆角 / 方形可切换
- ✅ 可关闭、可带图标、可带数字徽标
- ✅ 支持禁用、动画、闪烁

## 文件结构

```
vue-status-skill/
├── SKILL.md
├── README.md
├── base-status.md                      # 状态/标签组件
└── demo-components/
    └── base-status/
        └── html/
            └── base-status.html        # 所有形态展示
```

## 容器原则

> **必须嵌入 `<base-card>` 使用。**

```vue
<!-- ✅ 正确 -->
<base-card title="订单状态">
  <base-status type="success">已支付</base-status>
</base-card>

<!-- ❌ 错误 -->
<base-status type="success">已支付</base-status>
```

## 设计 Token

```css
.base-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: var(--weight-medium);
}
```

## 跨技能协同

- **base-card**（[vue-card-skill](../vue-card-skill/)）：所有标签的容器
- **vue-theme-skill**（[../../vue-theme-skill/](../../vue-theme-skill/)）：所有 Token 来源
- **vue-button-skill**：标签通常和按钮组合使用
