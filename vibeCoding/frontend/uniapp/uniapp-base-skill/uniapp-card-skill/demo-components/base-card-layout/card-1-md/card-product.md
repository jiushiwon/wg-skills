# card-product 商品卡片

> 电商场景专用卡片，包含图片、标题、描述、价格、按钮。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |
| 图片高度 | 160px |

## 适用场景

- 商品列表、商品详情
- 购物车 item
- 收藏、足迹

## HTML 演示

[card-product.html](html/card-product.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :padding="0" :shadow="'shadow-sm'">
  <image class="card-img" :src="image" mode="aspectFill" />
  <view class="card-body">
    <text class="card-title">{{ title }}</text>
    <text class="card-desc" v-if="showDesc">{{ desc }}</text>
    <view class="card-footer">
      <text class="card-price">¥{{ price }}</text>
      <button class="card-btn" v-if="showBtn">{{ btnText }}</button>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| image | string | - | 商品图片 |
| title | string | - | 商品名称 |
| desc | string | - | 商品描述 |
| price | string | - | 价格 |
| showDesc | boolean | true | 是否显示描述 |
| showPrice | boolean | true | 是否显示价格 |
| showBtn | boolean | true | 是否显示按钮 |
| btnText | string | '加入购物车' | 按钮文字 |
