# coupon 使用示例

## 基础用法

```vue
<template>
<coupon
  type="money"
  value="10"
  condition="满100可用"
  title="新人专惠"
  date="2024.01.01-2024.12.31"
/>
</template>


```

## 折扣券

```vue
<template>
<coupon
  type="discount"
  value="8"
  condition="无门槛"
  title="8折券"
/>
</template>


```

## 领取态

```vue
<template>
<coupon value="10" title="新人专惠" show-receive :received="true" />
</template>


```

## 已使用 / 已过期

```vue
<template>
<coupon value="10" title="新人专惠" status="used" />
<coupon value="10" title="新人专惠" status="expired" />
</template>


```

## 禁用与点击

```vue
<template>
<coupon value="10" title="已抢光" :disabled="true" @click="onReceive" />
</template>


```

## 说明

- 外壳使用根容器 `BaseCard`，圆角、背景由容器提供，组件内不重复设置。
- `status` 为 `used` / `expired` 或 `disabled` 为真时，卡面置灰且不再抛出 `click`。
- `showReceive` 控制领取文案，`received` 为真时文案为「已领取」。
