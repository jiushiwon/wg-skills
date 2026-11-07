# action-sheet 使用示例

## 基础用法

```vue
<template>
<action-sheet
  v-model:show="showSheet"
  title="请选择操作"
  :actions="[
    { text: '分享', value: 'share' },
    { text: '收藏', value: 'favorite' }
  ]"
  @select="onSelect"
/>
</template>


```

## 危险操作与禁用项

```vue
<template>
<action-sheet
  v-model:show="showSheet"
  :actions="[
    { text: '复制链接', value: 'copy' },
    { text: '举报', value: 'report', danger: true },
    { text: '删除', value: 'delete', danger: true },
    { text: '暂不可用', value: 'later', disabled: true }
  ]"
  cancel-text="取消"
  @select="onSelect"
/>
</template>


```

## 不显示取消按钮

```vue
<template>
<action-sheet
  v-model:show="showSheet"
  :show-cancel="false"
  :actions="[{ text: '确认', value: 'ok' }]"
/>
</template>


```

## 说明

- 外壳（遮罩、圆角、安全区适配、进出场）由 `BasePopup` 提供，组件不重复实现。
- 每项支持 `text`（文案）、`value`（业务标识）、`danger`（错误色）、`disabled`（不可点击）。
- `disabled` 的项点击无效，也不会派发 `select`。
- 选中任一项后组件自动关闭并派发 `select` 与 `close`。
