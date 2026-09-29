# Picker 选择器组件

底部弹出的单列选择器，支持点击选项高亮、确认/取消事件。

## 使用方式

```vue
<template>
  <view class="page">
    <button @click="showPicker = true">选择城市</button>
    <text>已选择：{{ selectedCity }}</text>

    <picker
      :visible="showPicker"
      title="选择城市"
      :options="cities"
      v-model="selectedCity"
      @confirm="showPicker = false"
      @cancel="showPicker = false"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Picker from '@/components/uniapp-vue3/picker/picker.vue'

const showPicker = ref(false)
const selectedCity = ref('beijing')

const cities = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' }
]
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 是否显示 |
| title | String | '请选择' | 标题 |
| options | Array | [] | 选项列表，支持字符串数组或 `{ label, value }` 对象数组 |
| value | String / Number | '' | 当前选中值 |

## Events

| 事件 | 说明 | 参数 |
|------|------|------|
| change | 选项改变时触发 | value |
| confirm | 点击确定时触发 | value |
| cancel | 点击取消/遮罩时触发 | 无 |

## 注意事项

- 组件使用 `v-model` 时，会自动监听 `change` 事件更新父级值。
- 选择器在底部弹出，超出高度时列表区域可滚动。
