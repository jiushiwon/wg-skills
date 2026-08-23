# card-vip VIP会员卡片

> VIP会员展示卡片，深色渐变背景，等级徽章，权益展示。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | 渐变深色 (#1a1a2e → #16213e) |
| 阴影 | shadow-md |

## 适用场景

- 个人中心VIP区域
- 会员权益展示
- 开通会员入口

## HTML 演示

[card-vip.html](html/card-vip.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-md'" :background="'linear-gradient(135deg, #1a1a2e, #16213e)'">
  <view class="vip-header">
    <image class="vip-avatar" :src="avatar" />
    <view class="vip-info">
      <text class="vip-name">{{ name }}</text>
      <view class="vip-level">{{ level }}</view>
    </view>
  </view>
  <text class="vip-desc">{{ desc }}</text>
  <view class="vip-rights" v-if="showRights">
    <view class="vip-right" v-for="right in rights">
      <text class="vip-right-icon">{{ right.icon }}</text>
      <text class="vip-right-text">{{ right.label }}</text>
    </view>
  </view>
  <button class="vip-btn">{{ btnText }}</button>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| avatar | string | - | 头像 |
| name | string | - | 用户名 |
| level | string | 'VIP会员' | 会员等级 |
| desc | string | - | 描述 |
| rights | array | [] | 权益列表 |
| showRights | boolean | true | 显示权益 |
| theme | string | 'gold' | 主题色 gold/purple/blue |
| btnText | string | '立即开通' | 按钮文字 |
