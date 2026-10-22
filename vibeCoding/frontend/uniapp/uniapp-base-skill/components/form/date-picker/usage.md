# date-picker 使用示例

> 底部弹出的年 / 月 / 日三列滑轮选择器，基于 `BasePopup` 容器（`direction="bottom"`），
> 内部用 `picker-view` + `picker-view-column` 实现真实滑轮，日列天数随年月联动并自动处理闰年。
> `show` 为受控属性，用 `v-model:show` 双向绑定。

## 基础用法

```vue
<template>
  <view>
    <view @click="visible = true">{{ date || '请选择日期' }}</view>

    <date-picker
      v-model:show="visible"
      v-model="date"
      :min="2020"
      :max="2030"
      title="选择出生日期"
      @confirm="onConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const date = ref('2024-06-01')

function onConfirm(text: string) {
  console.log('选中日期', text)
}
</script>
```

## 定制展示格式

`format` 支持 `YYYY` / `MM` / `DD` 占位，`confirm` 事件带格式化后的文本；
`v-model` 始终回写规范格式 `YYYY-MM-DD`。

```vue
<template>
  <date-picker
    v-model:show="visible"
    v-model="date"
    format="YYYY年MM月DD日"
    title="选择日期"
    @confirm="onConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const date = ref('')

function onConfirm(text: string) {
  console.log('格式化结果', text)
}
</script>
```

## 说明

- `v-model` 的值必须是 `YYYY-MM-DD`；非法值或空值时弹层打开会落到今天（并夹到 `min` / `max` 年份范围内）。
- 闰年联动：2 月 29 日切换到非闰年时，日列自动夹到 28 日；日列天数始终按当前年月取 28 / 29 / 30 / 31。
- 事件：`change`（滚动即触发，带规范日期）、`confirm`（点击确认，带格式化文本）、`cancel`（点击取消）。
- 插槽 `header-right` 可在弹窗标题栏右侧放置自定义内容。
