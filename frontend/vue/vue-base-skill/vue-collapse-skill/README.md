# vue-collapse-skill

> Vue 折叠面板组件 `base-collapse`，支持单面板 + 手风琴模式，纯 HTML/CSS 实现。

## 快速上手

```vue
<base-card title="常见问题">
  <base-collapse v-model="active" :items="faqs" accordion />
</base-card>
```

## 能力

- 单面板折叠
- 手风琴模式（`accordion`）
- 禁用项（`disabled`）
- 自定义标题（`title` 插槽）

## 容器原则

必须嵌入 `<base-card>` 使用；标题栏用 `<div role="button">` 模拟，零原生 HTML5 标签。

## 规格文档

- [base-collapse.md](base-collapse.md) — 折叠面板规格（props/events/slots/交互态）

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-card-skill](../vue-card-skill/SKILL.md) — base-card 容器
- [vue-theme-skill](../../vue-theme-skill/SKILL.md) — 主题 Token

## 详细规范 → [SKILL.md](SKILL.md)
