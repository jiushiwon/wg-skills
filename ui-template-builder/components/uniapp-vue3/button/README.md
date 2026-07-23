# button 组件

简约现代风格的通用按钮，支持多种变体、尺寸和状态。

## 文件

- `button.vue`：组件源码

## Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| type | string | 'primary' | 变体：primary / secondary / ghost / danger |
| size | string | 'md' | 尺寸：sm / md / lg |
| disabled | boolean | false | 禁用 |
| loading | boolean | false | 加载中 |
| block | boolean | false | 块状（宽度 100%） |
| round | boolean | false | 圆角胶囊 |

## Events

| 事件 | 说明 |
|---|---|
| click | 点击事件（禁用/加载时不触发） |

## 使用示例

```vue
<template>
  <view>
    <t-button type="primary" @click="onClick">主要按钮</t-button>
    <t-button type="secondary" size="sm">次要</t-button>
    <t-button type="ghost" size="lg">幽灵</t-button>
    <t-button type="danger" loading>删除</t-button>
    <t-button type="primary" block>块状按钮</t-button>
  </view>
</template>

<script setup>
import TButton from '@/components/uniapp-vue3/button/button.vue'

function onClick() {
  uni.showToast({ title: '点击', icon: 'none' })
}
</script>
```
