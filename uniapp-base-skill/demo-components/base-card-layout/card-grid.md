# card-grid 功能网格卡片

> 每行3列的图标按钮网格，功能入口展示。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |
| 列数 | 3列 |
| 分隔线 | 行分隔线（默认） |

## 适用场景

- 个人中心功能菜单
- 设置页入口
- 订单/商品/客服等功能导航

## HTML 演示

[card-grid.html](html/card-grid.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'">
  <view 
    class="grid-row" 
    v-for="(row, rowIndex) in gridData" 
    :key="rowIndex"
    :class="['grid-' + lineStyle]"
  >
    <view 
      class="grid-item" 
      v-for="item in row" 
      :key="item.id"
      @click="handleClick(item)"
    >
      <view class="grid-icon" :style="{ background: item.bg }">
        <image :src="item.icon" />
        <view class="grid-badge" v-if="item.badge">{{ item.badge }}</view>
      </view>
      <text class="grid-label">{{ item.label }}</text>
    </view>
  </view>
</base-card>
```

## 数据结构

```js
// gridData: 二维数组，每行一个数组
const gridData = [
  // 第1行
  [
    { id: 1, icon: '/icons/order.png', label: '订单', bg: '#e8f5e9', badge: 3 },
    { id: 2, icon: '/icons/shop.png', label: '商品', bg: '#fff3e0' },
    { id: 3, icon: '/icons/friend.png', label: '好友', bg: '#e3f2fd' }
  ],
  // 第2行
  [
    { id: 4, icon: '/icons/heart.png', label: '关注', bg: '#fce4ec' },
    { id: 5, icon: '/icons/eye.png', label: '浏览', bg: '#f3e5f5' },
    { id: 6, icon: '/icons/history.png', label: '足迹', bg: '#e0f7fa' }
  ],
  // 第3行
  [
    { id: 7, icon: '/icons/cog.png', label: '配置', bg: '#fff8e1' },
    { id: 8, icon: '/icons/headset.png', label: '客服', bg: '#efebe9' },
    { id: 9, icon: '/icons/setting.png', label: '设置', bg: '#ede7f6' }
  ]
]
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| gridData | array | [] | 二维数组，每行一个数组 |
| lineStyle | string | 'row' | 分隔线样式 inner/row/none |
| padding | string | 'var(--spacing-lg)' | 内边距 |
| showBadge | boolean | true | 显示徽标 |
| iconStyle | string | 'rounded' | 图标样式 circle/square/rounded |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | item | 点击图标时触发，返回点击的菜单项 |

```js
// 使用示例
<card-grid 
  :grid-data="menuData" 
  @click="handleMenuClick" 
/>
```

## 变体参考

- 3列网格 → card-grid（默认）
- 行分隔线 → card-grid（lineStyle: 'row'）
- 格子内部分割线 → card-grid（lineStyle: 'inner'）
- 无分隔线 → card-grid（lineStyle: 'none'）
- 带徽标 → card-grid（showBadge: true）
