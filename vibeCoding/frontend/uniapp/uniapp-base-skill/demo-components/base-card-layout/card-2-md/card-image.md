# card-image 大图卡片

> 大图封面 + 标题 + 描述 + 底部操作栏的信息流卡片。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | `var(--radius-md)` |
| 背景 | `var(--bg-card)` |
| 阴影 | `var(--shadow-sm)` |
| 封面比例 | 16:9（`aspectFill` 裁剪） |

## 适用场景

- 图册、相册、封面墙
- 专题、专栏入口
- 活动海报位

## HTML 演示

[card-image.html](../card-2-html/card-image.html)

## 组件代码

```vue
<template>
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'" :padding="'0'">
  <image class="card-cover" :src="cover" mode="aspectFill" />
  <view class="card-body">
    <view class="card-title">{{ title }}</view>
    <text class="card-desc">{{ desc }}</text>
    <view class="card-footer">
      <text class="card-time">{{ time }}</text>
      <text class="card-action">查看详情</text>
    </view>
  </view>
</base-card>
</template>


```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| cover | string | - | 封面图地址 |
| title | string | - | 标题 |
| desc | string | - | 描述 |
| time | string | - | 底部时间 |
| action | string | '查看详情' | 底部操作文案 |
| showAction | boolean | true | 是否显示底部操作 |
