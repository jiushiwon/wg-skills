---
name: vue-dialog-skill
description: Vue3 对话框组件技能，提供 base-dialog（通用弹窗）和 base-confirm（确认对话框）。触发词："Vue 弹窗"、"vue-dialog"、"确认弹窗"、"对话框"、"confirm"、"modal"。
trigger: |
  帮我做一个弹窗 | 做一个确认弹窗 | 做一个对话框
  做一个删除确认 | 做一个 modal | 做一个 confirm
  做一个提示弹窗 | 做一个操作确认
---

# vue-dialog-skill

> **零 HTML5 标签**：按钮用 `<span role="button">`，关闭用 `<span role="button">`
> **零第三方依赖**：纯 CSS3 过渡 + Teleport

对话框组件技能，提供两种形态：

| 组件 | 场景 | 说明 |
|------|------|------|
| **base-dialog** | 通用弹窗 | 自定义标题、内容、底部按钮 |
| **base-confirm** | 确认对话框 | 带图标的确认/取消，常用于删除确认 |

详细规范见 [base-dialog.md](base-dialog.md)

## Props 矩阵

### base-dialog

| 维度 | 说明 |
|------|------|
| `visible` | `boolean` 控制显示 |
| `title` | `string` 标题 |
| `width` | `string` 宽度，默认 `'500px'` |
| `closable` | `boolean` 是否显示关闭按钮，默认 `true` |
| `maskClosable` | `boolean` 点击遮罩关闭，默认 `true` |
| `footer` | `boolean` 是否显示底部，默认 `true` |

### base-confirm

| 维度 | 说明 |
|------|------|
| `visible` | `boolean` 控制显示 |
| `type` | `warning`（默认）/ `danger` / `info` |
| `title` | `string` 标题 |
| `message` | `string` 描述文字 |
| `confirmText` | `string` 确认按钮文字，默认 `'确认'` |
| `cancelText` | `string` 取消按钮文字，默认 `'取消'` |
| `confirmType` | `string` 确认按钮类型，默认 `'primary'` |

## 使用方式

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseDialog, BaseConfirm } from './components';

const dialogVisible = ref(false);
const confirmVisible = ref(false);

function handleDelete(row) {
  confirmVisible.value = true;
}
</script>

<template>
  <BaseDialog v-model:visible="dialogVisible" title="编辑用户">
    <!-- 自定义内容 -->
  </BaseDialog>

  <BaseConfirm
    v-model:visible="confirmVisible"
    type="danger"
    title="确认删除"
    message="确定要删除该记录吗？此操作不可恢复。"
    @confirm="doDelete"
  />
</template>
```

## 设计 Token

```css
.base-dialog__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
}
.base-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}
```

**禁止硬编码任何颜色 / 间距 / 字号 / 圆角值。**

## 文件结构

```
vue-dialog-skill/
├── SKILL.md
├── README.md
├── base-dialog.md
└── demo-components/
    └── base-dialog/
        └── html/
            └── 00-showcase.html
```

## 跨技能协同

- **vue-button-skill**：弹窗底部按钮
- **vue-crud-skill**：新增/编辑弹窗、删除确认
- **vue-form-skill**：弹窗内嵌表单
- **vue-toast-skill**：确认操作后的反馈
- **vue-theme-skill**：所有 Token 来源

## 第三方组件库

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue。
