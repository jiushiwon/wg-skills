# breadcrumb 使用示例

## 基础用法

```vue
<template>
<breadcrumb
  :items="[
    { text: '首页', url: '/pages/index/index' },
    { text: '分类', url: '/pages/category/category' },
    { text: '详情' },
  ]"
  @click="onBreadcrumbClick"
/>
</template>


```

## 自定义分隔符与图标

```vue
<template>
<breadcrumb
  :items="[
    { text: '首页', icon: '/static/icons/home.png', url: '/pages/index/index' },
    { text: '我的订单', url: '/pages/order/list' },
    { text: '订单详情' },
  ]"
  separator=" / "
/>
</template>


```

## 说明

- `items` 每项为 `{ text, icon, url }`，`icon` 传图片地址，`url` 传跳转地址。
- 最后一项为当前页，固定不可点击，也不会触发 `click` 事件。
- `click` 事件参数为 `(item, index)`，在父组件里自行跳转：

```vue
<script setup lang="ts">
function onBreadcrumbClick(item: { text?: string; url?: string }, index: number) {
  if (item.url) {
    uni.navigateTo({ url: item.url })
  }
}
</script>
```
