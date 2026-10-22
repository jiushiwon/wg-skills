# stepper 使用示例

## 基础用法

```vue
<template>
<stepper v-model="count" />
</template>


```

## 限制范围

```vue
<template>
<stepper v-model="count" :min="1" :max="10" />
</template>


```

## 步长

```vue
<template>
<stepper v-model="count" :step="2" />
</template>


```

## 禁用与只读

```vue
<template>
<!-- 整个控件禁用 -->
<stepper v-model="count" :disabled="true" />
<!-- 只能点加减，不能直接输入 -->
<stepper v-model="count" :editable="false" />
</template>


```

## 监听变更

```vue
<template>
<stepper v-model="count" @change="onCountChange" />
</template>


```

## 说明

- 达到 `min` / `max` 边界时对应按钮自动置灰，且不会触发变更事件。
- 直接输入的值在失焦时按 `min` / `max` 截断后再回写。
- 变更时同时抛出 `update:modelValue` 与 `change`。
