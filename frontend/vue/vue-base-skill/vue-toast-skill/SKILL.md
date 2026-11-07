---
name: vue-toast-skill
description: Vue3 轻提示组件技能，提供 base-toast 组件。支持 4 种 type、3 种位置、自动关闭、纯 CSS 动画。触发词："Vue 提示"、"vue-toast"、"消息提示"、"操作反馈"、"toast"。
trigger: |
  帮我做一个提示 | 做一个消息提示 | 做一个 toast
  做一个操作反馈 | 做一个成功提示 | 做一个错误提示
  做一个轻提示 | 做一个通知条
---

# vue-toast-skill

> **零 HTML5 标签**：使用 `<div role="alert">` 模拟
> **零第三方依赖**：纯 CSS3 动画 + JS 计时器

轻提示组件，用于操作反馈（保存成功、删除完成、网络错误等）。

详细规范见 [base-toast.md](base-toast.md)

## 核心组件

| 组件 | 说明 |
|------|------|
| **base-toast** | 轻提示（4 type × 3 position） |

## Props 矩阵

| 维度 | 可选值 |
|------|--------|
| `type` | success（默认）/ warning / danger / info |
| `position` | top（默认）/ center / bottom |
| `duration` | `number`（ms），默认 3000，0 = 不自动关闭 |
| `message` | `string` 提示文字 |
| `closable` | `boolean` 是否可手动关闭 |

## 使用方式

```vue
<script setup lang="ts">
import { useToast } from './composables/useToast';

const toast = useToast();

function handleSave() {
  api.save().then(() => {
    toast.success('保存成功');
  }).catch(() => {
    toast.error('保存失败，请重试');
  });
}
</script>

<template>
  <!-- 全局挂载点 -->
  <BaseToast />
</template>
```

## 设计 Token

```css
.base-toast {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  font-size: var(--font-sm);
}
```

**禁止硬编码任何颜色 / 间距 / 字号 / 圆角值。**
**禁止左侧彩色边框（AI 味），用图标圆底传达类型。**

## 文件结构

```
vue-toast-skill/
├── SKILL.md
├── README.md
├── base-toast.md
└── demo-components/
    └── base-toast/
        └── html/
            └── 00-showcase.html
```

## 跨技能协同

- **vue-button-skill**：Toast 常在按钮点击后触发
- **vue-crud-skill**：CRUD 操作后反馈
- **vue-form-skill**：表单提交后反馈
- **vue-theme-skill**：所有 Token 来源

## 第三方组件库

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue。
