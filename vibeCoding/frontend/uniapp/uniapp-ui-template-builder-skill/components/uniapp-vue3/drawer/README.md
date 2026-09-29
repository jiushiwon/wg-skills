# Drawer 抽屉组件

简约现代的抽屉组件，支持从右侧、底部、左侧滑出，点击遮罩关闭。

## 使用方式

```vue
<template>
  <view class="page">
    <button @click="showDrawer = true">打开抽屉</button>

    <drawer
      :visible="showDrawer"
      position="right"
      title="设置"
      width="280px"
      @close="showDrawer = false"
    >
      <view class="drawer-content">
        <text>抽屉内容</text>
      </view>
    </drawer>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Drawer from '@/components/uniapp-vue3/drawer/drawer.vue'

const showDrawer = ref(false)
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 是否显示 |
| position | String | 'right' | 抽屉位置：right / bottom / left |
| title | String | '' | 标题 |
| width | String / Number | '280px' | 左右抽屉宽度 |
| height | String / Number | '40vh' | 底部抽屉高度 |

## Events

| 事件 | 说明 | 参数 |
|------|------|------|
| close | 关闭抽屉时触发 | 无 |

## 插槽

| 名称 | 说明 |
|------|------|
| default | 抽屉主体内容 |
