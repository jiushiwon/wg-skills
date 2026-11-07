# picker 使用示例

> 底部弹出的多列滚轮选择器，基于 `BasePopup` 容器（`direction="bottom"`），内部用
> `picker-view` + `picker-view-column` 实现真实滑轮。`show` 为受控属性，用 `v-model:show` 双向绑定。

## 基础用法（单列）

```vue
<template>
  <view>
    <view @click="visible = true">打开选择器</view>

    <picker
      v-model:show="visible"
      v-model="selected"
      :columns="['北京', '上海', '广州']"
      title="选择城市"
      @confirm="onConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const selected = ref<string[]>([])

function onConfirm(values: (string | number)[]) {
  console.log('选中城市', values[0])
}
</script>
```

## 多列联动（省 / 市）

```vue
<template>
  <picker
    v-model:show="visible"
    v-model="area"
    :columns="[provinces, cities]"
    column-types="['string', 'string']"
    title="选择地区"
    @confirm="onConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const provinces = ['广东省', '浙江省']
const cities = ['广州市', '深圳市']
const area = ref<string[]>(['广东省', '广州市'])

function onConfirm(values: (string | number)[]) {
  console.log('选中地区', values)
}
</script>
```

## 对象选项与数字列

选项支持 `{ value, label }` 对象；`column-types` 声明每列类型，`number` 列的绑定值按数字输出。

```vue
<template>
  <picker
    v-model:show="visible"
    v-model="score"
    :columns="[[{ value: 1, label: '一档' }, { value: 2, label: '二档' }], [10, 20, 30]]"
    :column-types="['number', 'number']"
    @confirm="onConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const score = ref<(string | number)[]>([1, 10])

function onConfirm(values: (string | number)[]) {
  console.log('选中评分', values)
}
</script>
```

## 说明

- `show` 用 `v-model:show` 绑定；`mask-closable` 控制点击遮罩是否关闭，`safe-area` 控制底部安全区适配。
- `v-model` 绑定的是**各列选中值数组**，不是下标数组；取消时不会写回绑定值。
- 事件：`change`（滚动即触发）、`confirm`（点击确认，带选中值数组）、`cancel`（点击取消）。
- 插槽 `header-right` 可在弹窗标题栏右侧放置自定义内容。
