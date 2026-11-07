# base-collapse 折叠面板规格

> **容器原则**：内容区外壳来自 `base-card`，标题栏用 `<div role="button">` 模拟。
> **零 HTML5 标签**：不使用 `<details>` / `<summary>` / `<button>`。

## 组件定位

折叠面板：标题栏 + 可展开/收起的内容区。支持单面板与手风琴（accordion）两种模式。

## Props 契约

| prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| null` | `null` | 当前展开项的 key（accordion）或 `''`（单面板） |
| `items` | `CollapseItem[]` | `[]` | 面板项数组 `{ key, title, content, disabled? }` |
| `accordion` | `boolean` | `false` | 手风琴模式：同时仅一项展开 |
| `collapsible` | `boolean` | `true` | 是否允许全部收起（accordion 下才生效） |

```ts
interface CollapseItem {
  key: string | number;
  title: string;
  content: string;
  disabled?: boolean;
}
```

## Events

| 事件 | 载荷 | 说明 |
|------|------|------|
| `update:modelValue` | `key \| null` | 展开项变化 |
| `change` | `{ key, expanded }` | 展开/收起回调 |

## Slots

| 插槽 | 说明 |
|------|------|
| `default` | 默认内容（当用 items 方式时） |
| `title` | 自定义标题（作用域 `{ item, expanded }`） |

## 用法示例

```vue
<base-card title="常见问题">
  <base-collapse v-model="active" :items="faqs" accordion />
</base-card>
```

```ts
const active = ref<string | null>('q1')
const faqs: CollapseItem[] = [
  { key: 'q1', title: '如何重置密码？', content: '进入设置页...' },
  { key: 'q2', title: '如何更换手机号？', content: '绑定新手机号...' },
]
```

## 结构要求

```vue
<template>
  <div class="base-collapse">
    <div
      v-for="item in items"
      :key="item.key"
      class="base-collapse__item"
      :class="{ 'is-expanded': isExpanded(item), 'is-disabled': item.disabled }"
    >
      <div
        role="button"
        tabindex="0"
        class="base-collapse__header"
        :aria-expanded="isExpanded(item)"
        :aria-disabled="item.disabled || undefined"
        @click="toggle(item)"
        @keydown.enter.prevent="toggle(item)"
        @keydown.space.prevent="toggle(item)"
      >
        <slot name="title" :item="item" :expanded="isExpanded(item)">
          <span class="base-collapse__title">{{ item.title }}</span>
        </slot>
        <span class="base-collapse__arrow" :class="{ 'is-rotated': isExpanded(item) }">⌄</span>
      </div>
      <div v-show="isExpanded(item)" role="region" class="base-collapse__content">
        <slot :item="item">{{ item.content }}</slot>
      </div>
    </div>
  </div>
</template>
```

## 交互态

| 状态 | 类名 | 表现 |
|------|------|------|
| 展开 | `.is-expanded` | 内容可见，箭头旋转 |
| 禁用 | `.is-disabled` | 标题不可点，`aria-disabled` |

## Token 对齐

| 属性 | Token |
|------|-------|
| 圆角 | `--radius-md` |
| 分隔线 | `--color-border` |
| 标题字重 | `--weight-medium` |
| 箭头颜色 | `--color-text-secondary` |
| 动效 | `--transition-normal` |
