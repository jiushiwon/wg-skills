# search-bar 使用示例

## 基础用法

```vue
<template>
<search-bar v-model="keyword" placeholder="请输入关键词" @search="onSearch" />
</template>


```

```vue
<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')

function onSearch(value: string) {
  console.log('搜索：', value)
}
</script>
```

## 带取消按钮

```vue
<template>
<search-bar
  v-model="keyword"
  placeholder="搜索"
  :show-cancel="true"
  @search="onSearch"
  @cancel="onCancel"
/>
</template>


```

## 禁用输入

```vue
<template>
<search-bar v-model="keyword" disabled />
</template>


```

## 说明

- `v-model` 双向绑定当前关键词；`input` 事件在每次输入时抛出，`search` 事件在点击键盘确认时抛出。
- `clearable`（默认 `true`）在有内容时展示清除按钮，点击后清空并抛出 `clear`。
- `showCancel` 为 `true` 时展示取消按钮，点击后清空并抛出 `cancel`。
- 组件为纯展示控件，不套容器。
