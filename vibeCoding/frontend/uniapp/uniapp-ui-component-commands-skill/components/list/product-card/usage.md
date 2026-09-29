# product-card 使用示例

## 基础用法

```vue
<product-card
  image="/static/product.jpg"
  title="商品名称"
  desc="商品描述"
  price="99.00"
  @click="goToDetail"
/>
```

## 带销量和标签

``````vue
<product-card
  image="/static/product.jpg"
  title="商品名称"
  price="99.00"
  sales="1000"
  :tags="['新品', '热销']"
/>
```

## 带原价

```vue
<product-card
  image="/static/product.jpg"
  title="商品名称"
  price="99.00"
  original-price="199.00"
/>
```
