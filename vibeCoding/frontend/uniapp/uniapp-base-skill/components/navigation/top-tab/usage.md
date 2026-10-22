# top-tab 使用示例

## 基础用法

```vue
<template>
<top-tab
  v-model:model-value="activeKey"
  :items="[
    { key: 'rec', text: '推荐' },
    { key: 'hot', text: '热门' },
    { key: 'new', text: '最新' },
  ]"
/>
</template>


```

## 带角标

```vue
<template>
<top-tab
  v-model:model-value="activeKey"
  :items="[
    { key: 'all', text: '全部' },
    { key: 'unread', text: '未读', badge: 12 },
    { key: 'sys', text: '系统', badge: '新' },
  ]"
  @change="onTabChange"
/>
</template>


```

## 自定义颜色

```vue
<template>
<top-tab
  v-model:model-value="activeKey"
  :items="items"
  active-color="var(--color-error, #EF4444)"
  inactive-color="var(--text-tertiary, #a3a3a3)"
/>
</template>


```

## 说明

- `items` 每项为 `{ key, text, badge }`，`key` 唯一且用于绑定 `modelValue`。
- `badge` 为数字或文本，为空不展示；数字超过 99 显示 `99+`。
- 底部指示条用 `transform: scaleX` 做动画，选中项自动横向滚动到可视区。
- `change` 事件参数为 `(key, index)`。

```vue
<script setup lang="ts">
const activeKey = ref('rec')

function onTabChange(key: string, index: number) {
  console.log('切换到', key, index)
}
</script>
```
