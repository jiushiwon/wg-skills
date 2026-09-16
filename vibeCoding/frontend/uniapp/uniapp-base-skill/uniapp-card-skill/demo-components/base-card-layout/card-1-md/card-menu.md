# card-menu 菜单卡片

> 九宫格图标菜单卡片，功能入口展示。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |

## 适用场景

- 个人中心功能菜单
- 首页功能入口
- 工具快捷入口

## HTML 演示

[card-menu.html](html/card-menu.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'">
  <view class="menu-grid" :style="{ gridTemplateColumns: 'repeat(' + columns + ', 1fr)' }">
    <view class="menu-item" v-for="item in items" :key="item.id">
      <view class="menu-icon" :style="{ background: item.bg }">
        <image :src="item.icon" />
      </view>
      <text class="menu-label">{{ item.label }}</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | array | [] | 菜单项列表 |
| columns | number | 4 | 列数 3/4/5 |
| showBadge | boolean | false | 显示徽标 |
