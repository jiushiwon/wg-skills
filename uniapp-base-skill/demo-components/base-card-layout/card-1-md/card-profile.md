# card-profile 个人中心卡片

> 包含封面图、头像、昵称、会员等级、统计数据。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |
| 封面高度 | 100px |

## 适用场景

- 个人主页、用户主页
- 个人中心顶部区域

## HTML 演示

[card-profile.html](html/card-profile.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :padding="0" :shadow="'shadow-sm'">
  <view class="profile-cover">
    <image class="cover-img" :src="cover" mode="aspectFill" />
  </view>
  <view class="profile-main">
    <image class="profile-avatar" :src="avatar" />
    <view class="profile-info">
      <text class="profile-name">{{ name }}</text>
      <text class="profile-id">ID: {{ userId }}</text>
      <view class="profile-badge" v-if="showBadge">{{ badge }}</view>
    </view>
    <button class="profile-edit" v-if="showEdit">编辑资料</button>
  </view>
  <view class="profile-stats" v-if="showStats">
    <view class="stat-item" v-for="stat in stats">
      <text class="stat-value">{{ stat.value }}</text>
      <text class="stat-label">{{ stat.label }}</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| cover | string | - | 封面图 |
| avatar | string | - | 头像 |
| name | string | - | 用户名 |
| userId | string | - | 用户ID |
| badge | string | - | 会员等级 |
| showBadge | boolean | true | 显示徽章 |
| showEdit | boolean | true | 显示编辑按钮 |
| showStats | boolean | true | 显示统计 |
| stats | array | [] | 统计数据 |

## 变体参考

- 封面+头像+统计 → card-profile（默认）
- 仅头像+昵称 → card-profile（隐藏stats）
- 带编辑按钮 → card-profile（showEdit: true）
