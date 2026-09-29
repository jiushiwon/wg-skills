# Calendar 日历组件

月视图日历组件，支持选择日期、禁用区间、显示今天与选中状态。

## 使用方式

```vue
<template>
  <view class="page">
    <calendar
      v-model="selectedDate"
      min-date="2026-01-01"
      max-date="2026-12-31"
      @change="onDateChange"
      @confirm="onDateConfirm"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Calendar from '@/components/uniapp-vue3/calendar/calendar.vue'

const selectedDate = ref('2026-07-23')

function onDateChange(date) {
  console.log('选择日期：', date)
}

function onDateConfirm(date) {
  console.log('确认日期：', date)
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | String | '' | 当前选中的日期，格式 YYYY-MM-DD |
| minDate | String | '' | 最小可选日期，格式 YYYY-MM-DD |
| maxDate | String | '' | 最大可选日期，格式 YYYY-MM-DD |

## Events

| 事件 | 说明 | 参数 |
|------|------|------|
| change | 点击可用日期时触发 | date: YYYY-MM-DD |
| confirm | 点击确认按钮时触发 | date: YYYY-MM-DD |

## 样式说明

- 今天：蓝色边框高亮
- 选中：蓝色填充背景
- 禁用：灰色文字且不可点击
- 非当月日期：浅灰色文字
