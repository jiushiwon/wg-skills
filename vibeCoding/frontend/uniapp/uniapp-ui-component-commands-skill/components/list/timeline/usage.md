# timeline 使用示例

## 基础用法

```vue
<timeline :items="[
  { time: '2024-01-01 10:00', title: '已下单', desc: '订单已创建' },
  { time: '2024-01-01 14:00', title: '已发货', desc: '商品已发出' },
  { time: '2024-01-02 09:00', title: '已送达', desc: '商品已签收' }
]" />
```

## 当前状态高亮

```vue
<timeline :items="[
  { time: '2024-01-01 10:00', title: '已下单', desc: '订单已创建', active: true },
  { time: '2024-01-01 14:00', title: '运输中', desc: '正在配送' },
  { time: '2024-01-02 09:00', title: '已送达' }
]" />
```
