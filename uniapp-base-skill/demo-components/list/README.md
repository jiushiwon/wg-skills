# 列表页案例集

> 6 种不同风格的列表页，展示 base-card 参数组合的多样性

## 六大案例

| 案例 | 风格 | 适用场景 |
|------|------|----------|
| [friend-list](friend-list.md) | 圆角+间距+圆形头像 | 好友、联系人 |
| [follow-list](follow-list.md) | 圆角+间距+方形封面 | 关注、订阅 |
| [like-list](like-list.md) | 圆角+间距+Tab切换 | 获赞、收藏 |
| [points-center](points-center.md) | 圆角+间距+渐变头部 | 积分、资产 |
| [collection-settings](collection-settings.md) | 大卡片套小卡片 | 设置、偏好 |
| [order-after-sale](order-after-sale.md) | 圆角+间距+状态栏 | 订单、售后 |

## 统一风格

所有案例采用统一的布局模式：

```
┌─────────────────────────────────────┐
│           页面头部                   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │           卡片1                  ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │           卡片2                  ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │           卡片3                  ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## 核心参数模板

```vue
<!-- 通用卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
/>

<!-- 设置项 - 大卡片套小卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <base-card
    :radius="'var(--radius-none)'"
    :border="'1rpx solid var(--color-border)'"
    clickable
  />
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

---

> ⚠️ Demo 案例仅供參考，非完美實現
