# product-card 使用示例

> 卡片外壳由根容器 `BaseCard` 提供（圆角、背景、边框），业务侧只传内容。

## 基础用法

```vue
<template>
<product-card
  image="/static/product.jpg"
  title="商品名称"
  desc="商品描述"
  price="99.00"
  @click="goToDetail"
/>
</template>


```

## 带销量和标签

```vue
<template>
<product-card
  image="/static/product.jpg"
  title="商品名称"
  price="99.00"
  sales="1000"
  :tags="['新品', '热销']"
/>
</template>


```

## 带原价

```vue
<template>
<product-card
  image="/static/product.jpg"
  title="商品名称"
  price="99.00"
  original-price="199.00"
/>
</template>


```

## 说明

- `image` 加载失败时自动显示「暂无图片」占位。
- `originalPrice` 存在时按原价样式带删除线展示。
