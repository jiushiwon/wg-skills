# timeline 使用示例

> 整条时间线由根容器 `BaseCard` 承载，节点与连线在卡片内部实现。

## 基础用法

```vue
<template>
<timeline :items="[
  { time: '2024-01-01 10:00', title: '已下单', desc: '订单已创建' },
  { time: '2024-01-01 14:00', title: '已发货', desc: '商品已发出' },
  { time: '2024-01-02 09:00', title: '已送达', desc: '商品已签收' }
]" />
</template>


```

## 当前状态高亮

```vue
<template>
<timeline :items="[
  { time: '2024-01-01 10:00', title: '已下单', desc: '订单已创建', active: true },
  { time: '2024-01-01 14:00', title: '运输中', desc: '正在配送' },
  { time: '2024-01-02 09:00', title: '已送达' }
]" />
</template>


```

## 节点内容扩展

```vue
<template>
<timeline :items="[
  { time: '2024-01-01 10:00', title: '已下单' }
]">
  <template #default="{ item }">
    <text class="extra">{{ item.title }} 详情</text>
  </template>
</timeline>
</template>


```

## 说明

- 首项默认高亮，其余节点按 `active` 标记高亮。
- 默认插槽作用域参数为 `{ item, index }`，用于在节点内追加内容。
