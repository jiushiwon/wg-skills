# input-field 使用示例

## 基础用法

```vue
<template>
<input-field v-model="username" label="用户名" placeholder="请输入用户名" />
</template>


```

```vue
<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
</script>
```

## 带清除按钮

```vue
<template>
<input-field v-model="keyword" placeholder="搜索" :clearable="true" />
</template>


```

## 错误状态

`error` 为 `true` 时输入框描边转红，`errorMessage` 显示在控件下方。

```vue
<template>
<input-field
  v-model="phone"
  label="手机号"
  placeholder="请输入手机号"
  :error="!isValid"
  error-message="手机号格式不正确"
/>
</template>


```

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const phone = ref('')
const isValid = computed(() => /^1\d{10}$/.test(phone.value))
</script>
```

## 数字输入与长度限制

```vue
<template>
<input-field v-model="amount" label="金额" type="number" :maxlength="8" />
</template>


```

## 说明

- 组件外壳使用根容器 `BaseFormItem`，标签、错误提示由容器统一排版。
- `label` 为空字符串时隐藏标签列，控件独占整行。
- `labelWidth` 可调整标签列宽，默认 `160rpx`。
- `v-model` 双向绑定；`input` 事件随输入触发，`blur` / `focus` 透传原生事件对象。
- `clearable` 为 `true` 且有内容时展示清除按钮，点击后清空并抛出 `clear`。
