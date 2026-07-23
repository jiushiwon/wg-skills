# modal 组件

居中弹窗，带遮罩和进入/退出过渡。

## 文件

- `modal.vue`：组件源码

## Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| visible | boolean | false | 是否显示 |
| title | string | '提示' | 标题 |
| content | string | '' | 内容文本 |
| showCancel | boolean | true | 是否显示取消按钮 |
| showConfirm | boolean | true | 是否显示确认按钮 |
| cancelText | string | '取消' | 取消按钮文字 |
| confirmText | string | '确认' | 确认按钮文字 |

## Events

| 事件 | 说明 |
|---|---|
| confirm | 点击确认按钮 |
| cancel | 点击取消按钮 |
| close | 点击遮罩关闭 |

## 使用示例

```vue
<template>
  <view>
    <view class="demo-btn" @click="show = true">打开弹窗</view>
    <modal-basic
      :visible="show"
      title="确认删除"
      content="删除后无法恢复，是否继续？"
      @confirm="onConfirm"
      @cancel="show = false"
      @close="show = false"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import ModalBasic from '@/components/uniapp-vue3/modal/modal.vue'

const show = ref(false)

function onConfirm() {
  uni.showToast({ title: '已删除', icon: 'success' })
  show.value = false
}
</script>
```
