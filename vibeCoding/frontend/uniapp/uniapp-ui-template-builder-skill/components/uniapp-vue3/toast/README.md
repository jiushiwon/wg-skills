# toast 组件

页面轻提示，支持位置、类型和自动关闭。

## 文件

- `toast.vue`：组件源码

## Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| visible | boolean | false | 是否显示 |
| type | string | 'text' | 类型：success / error / loading / text |
| message | string | '' | 提示文案 |
| position | string | 'middle' | 位置：top / middle / bottom |
| duration | number | 2000 | 自动关闭时长（毫秒），loading 建议手动关闭 |

## Events

| 事件 | 说明 |
|---|---|
| close | 关闭时触发 |
| update:visible | 支持 v-model:visible |

## 使用示例

```vue
<template>
  <view>
    <view class="demo-btn" @click="showToast = true">显示 Toast</view>
    <toast-basic
      v-model:visible="showToast"
      type="success"
      message="保存成功"
      position="middle"
      :duration="2000"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import ToastBasic from '@/components/uniapp-vue3/toast/toast.vue'

const showToast = ref(false)
</script>
```
