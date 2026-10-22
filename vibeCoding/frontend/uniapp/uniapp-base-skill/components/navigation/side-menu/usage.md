# side-menu 使用示例

## 基础用法

```vue
<side-menu
  :show="showDrawer"
  title="导航菜单"
  @update:show="showDrawer = $event"
  @close="showDrawer = false"
>
  <view class="menu-list">
    <view class="menu-item">首页</view>
    <view class="menu-item">分类</view>
    <view class="menu-item">我的</view>
  </view>
</side-menu>

<script setup lang="ts">
import { ref } from 'vue'

const showDrawer = ref(false)
</script>
```

## 内置菜单项与子项展开

```vue
<side-menu
  v-model:show="showDrawer"
  v-model:model-value="expandedKeys"
  :items="[
    { key: 'home', text: '首页' },
    {
      key: 'order',
      text: '我的订单',
      children: [
        { key: 'order-all', text: '全部订单' },
        { key: 'order-unpay', text: '待付款' },
      ],
    },
  ]"
  @select="onSelect"
/>

<script setup lang="ts">
import { ref } from 'vue'

const showDrawer = ref(false)
const expandedKeys = ref<string[]>(['order'])

function onSelect(item: { key: string; text?: string }) {
  console.log('选中菜单项', item.key)
  showDrawer.value = false
}
</script>
```

## 自定义头部

```vue
<template>
<side-menu v-model:show="showDrawer">
  <template #header>
    <view class="custom-header">自定义头部</view>
  </template>
  <view>内容</view>
</side-menu>
</template>


```

## 说明

- 抽屉通过 `show` 控制显隐，遮罩与关闭按钮都会触发 `close` 与 `update:show`。
- `items` 每项为 `{ key, text, children }`，`children` 可选；带 `children` 的项可展开收起。
- `modelValue` 为已展开项的 `key` 集合，展开状态变化时同步 `update:modelValue` 与 `change`。
- `collapsible` 为 `false` 时子项始终展开，不显示箭头。
- 展开收起动画只作用于 `height`（子项面板）与 `transform`（抽屉位移、箭头旋转），不使用关键帧动画。
