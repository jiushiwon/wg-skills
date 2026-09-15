# vue-dialog-skill

> 对话框组件技能。通用弹窗 + 确认对话框，纯 CSS 过渡动画。

## 快速上手

```vue
<script setup>
import { ref } from 'vue';

const confirmVisible = ref(false);

function handleDelete() {
  confirmVisible.value = true;
}
</script>

<template>
  <!-- 通用弹窗 -->
  <BaseDialog v-model:visible="dialogVisible" title="编辑用户">
    <BaseForm>...</BaseForm>
  </BaseDialog>

  <!-- 确认对话框 -->
  <BaseConfirm
    v-model:visible="confirmVisible"
    type="danger"
    title="确认删除"
    message="确定要删除该记录吗？此操作不可恢复。"
    confirm-type="danger"
    @confirm="doDelete"
  />
</template>
```

## 规格文档

- [base-dialog.md](base-dialog.md) — Dialog + Confirm 规格

## Demos

| Demo | 内容 |
|------|------|
| [html/00-showcase.html](demo-components/base-dialog/html/00-showcase.html) | 通用弹窗 + 确认对话框 + 动画 |

## Token 对齐

| 属性 | Token |
|------|-------|
| 内边距 | `--space-4` `--space-5` `--space-6` |
| 字号 | `--font-sm`(14px) / `--font-base`(16px) |
| 圆角 | `--radius-lg`(8px) |
| 阴影 | `--shadow-lg` |
| 遮罩 | `rgba(0,0,0,0.45)` |

## 相关技能

- [vue-button-skill](../vue-button-skill/SKILL.md) — 弹窗底部按钮
- [vue-crud-skill](../vue-complex-skill/vue-crud-skill/SKILL.md) — CRUD 弹窗/确认
- [vue-form-skill](../vue-form-skill/SKILL.md) — 弹窗内嵌表单
- [vue-toast-skill](../vue-toast-skill/SKILL.md) — 确认操作后的反馈
