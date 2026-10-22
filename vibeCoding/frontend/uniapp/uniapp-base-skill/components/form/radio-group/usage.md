# radio-group 使用示例

## 基础用法

```vue
<template>
<radio-group
  v-model="selected"
  label="性别"
  :options="[
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
  ]"
/>
</template>


```

```vue
<script setup lang="ts">
import { ref } from 'vue'

const selected = ref<string>('male')
</script>
```

## 数字型值

`modelValue` 同时支持 string 与 number，绑定值与 `options[].value` 类型一致即可。

```vue
<template>
<radio-group
  v-model="score"
  :options="[
    { label: '一星', value: 1 },
    { label: '二星', value: 2 }
  ]"
/>
</template>


```

## 监听变更

```vue
<template>
<radio-group v-model="selected" :options="options" @change="onChange" />
</template>


```

```vue
<script setup lang="ts">
function onChange(value: string | number) {
  console.log('选中：', value)
}
</script>
```

## 禁用整组

```vue
<template>
<radio-group v-model="selected" :options="options" disabled />
</template>


```

## 说明

- 组件为纯展示控件，不套容器；点击整块选项区域即可选中。
- `options` 中每项必须包含 `label`（展示文案）与 `value`（选中后写入绑定值）。
