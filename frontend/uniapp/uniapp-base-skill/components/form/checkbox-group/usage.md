# checkbox-group 使用示例

## 基础用法

```vue
<template>
<checkbox-group
  v-model="checked"
  label="爱好"
  :options="[
    { label: '篮球', value: 'basketball' },
    { label: '足球', value: 'football' },
    { label: '游泳', value: 'swimming' }
  ]"
/>
</template>


```

```vue
<script setup lang="ts">
import { ref } from 'vue'

const checked = ref<string[]>(['basketball'])
</script>
```

## 监听变更

`change` 事件在每次勾选/取消后抛出完整的新数组。

```vue
<template>
<checkbox-group v-model="checked" :options="options" @change="onChange" />
</template>


```

```vue
<script setup lang="ts">
function onChange(value: (string | number)[]) {
  console.log('当前选中：', value)
}
</script>
```

## 禁用整组

```vue
<template>
<checkbox-group v-model="checked" :options="options" disabled />
</template>


```

## 说明

- 组件为纯展示控件，不套容器；点击整块选项区域即可切换。
- `options` 中每项必须包含 `label`（展示文案）与 `value`（选中后写入绑定数组的值）。
- `modelValue` 为数组类型，`value` 可为 string 或 number。
