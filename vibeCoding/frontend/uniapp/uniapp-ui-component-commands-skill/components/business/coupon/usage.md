# coupon 使用示例

## 基础用法

```vue
<coupon
  type="money"
  value="10"
  condition="满100可用"
  title="新人专惠"
  date="2024.01.01-2024.12.31"
/>
```

## 折扣券

```vue
<coupon
  type="discount"
  value="8"
  condition="无门槛"
  title="8折券"
/>
```

## 禁用状态

```vue
<coupon
  value="10"
  title="已使用"
  :disabled="true"
/>
```
