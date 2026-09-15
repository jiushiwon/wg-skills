# vue-toast-skill

> 轻提示组件技能。操作反馈，自动消失，纯 CSS 动画。

## 快速上手

```vue
<script setup>
import { useToast } from './composables/useToast';
const toast = useToast();

toast.success('保存成功');
toast.error('网络错误，请重试');
toast.warning('文件大小超出限制');
toast.info('已复制到剪贴板');
</script>

<template>
  <BaseToast />
</template>
```

## 规格文档

- [base-toast.md](base-toast.md) — Toast 规格

## Demos

| Demo | 内容 |
|------|------|
| [html/00-showcase.html](demo-components/base-toast/html/00-showcase.html) | 4 种 type + 3 种位置 + 动画 |

## Token 对齐

| 属性 | Token |
|------|-------|
| 内边距 | `--space-3` `--space-5` |
| 字号 | `--font-sm`(14px) |
| 圆角 | `--radius-full`(胶囊) |
| 阴影 | `--shadow-md` |
| 图标底色 | `--color-success` / `--color-danger` / `--color-warning` / `--color-primary` |

## 相关技能

- [vue-button-skill](../vue-button-skill/SKILL.md) — 按钮（Toast 在按钮操作后触发）
- [vue-crud-skill](../vue-complex-skill/vue-crud-skill/SKILL.md) — CRUD 页面（操作反馈）
- [vue-form-skill](../vue-form-skill/SKILL.md) — 表单（提交反馈）
