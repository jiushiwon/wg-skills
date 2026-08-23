# card-friend 好友卡片

> 好友列表卡片，包含头像、昵称、签名、箭头。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |

## 适用场景

- 好友列表、联系人列表
- 关注列表、粉丝列表
- 群成员列表

## HTML 演示

[card-friend.html](html/card-friend.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'">
  <view class="card-header" v-if="showHeader">
    <text class="card-title">{{ title }}</text>
    <text class="card-more">更多</text>
  </view>
  <view class="friend-item" v-for="friend in list">
    <image class="item-avatar" :src="friend.avatar" />
    <view class="item-content">
      <text class="item-name">{{ friend.name }}</text>
      <text class="item-desc">{{ friend.desc }}</text>
    </view>
    <text class="item-arrow" v-if="showArrow">></text>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '我的好友' | 标题 |
| list | array | [] | 好友列表 |
| avatarSize | string | '44px' | 头像尺寸 |
| showHeader | boolean | true | 显示头部 |
| showArrow | boolean | true | 显示箭头 |
