# card-set 配置卡片

> 设置项卡片，包含图标、标签、开关/箭头。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |

## 适用场景

- 设置页、偏好配置
- 权限管理、系统设置
- 功能开关

## HTML 演示

[card-set.html](html/card-set.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'">
  <view class="card-title" v-if="title">{{ title }}</view>
  <view class="set-item" v-for="item in items">
    <image class="set-icon" :src="item.icon" v-if="showIcon" />
    <text class="set-label">{{ item.label }}</text>
    <switch class="set-switch" v-if="item.type === 'switch'" :checked="item.checked" />
    <text class="set-arrow" v-else-if="item.type === 'arrow'">></text>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 卡片标题 |
| items | array | [] | 配置项列表 |
| showIcon | boolean | true | 显示图标 |
| itemType | string | 'arrow' | 项类型 switch/arrow/button |
