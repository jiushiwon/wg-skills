# 个人中心

> 渐变用户信息头部 + 数据统计 + VIP 会员卡 + 订单入口 + 功能网格，适合个人中心、创作者中心、会员中心

## 风格

- 头部圆角 → `0 0 var(--radius-lg) var(--radius-lg)`
- 内容卡片圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-3)`
- 渐变头部 → `linear-gradient(135deg, ...)`
- 功能网格 → `grid-template-columns: repeat(4, 1fr)`

## 页面结构

```
┌─────────────────────────────────────┐
│  [消息] [礼物]                        │  ← 顶部操作
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │  ← 渐变头部
│  [头像] Jisom26823                   │
│  宝石ID: ST283918391                 │
├─────────────────────────────────────┤  ← base-card
│  123    293    762                   │
│  获赞    粉丝    关注                │
├─────────────────────────────────────┤  ← base-card（VIP）
│  宝石会员 VIP              了解更多>>│
│  [皇冠图标]会员日 [皇冠图标]奖励翻倍 [皇冠图标]商品折扣...       │
├─────────────────────────────────────┤  ← base-card
│  我的订单                查看详情>>  │
│  待付款 待发货 待收货 已完成 售后    │
├─────────────────────────────────────┤  ← base-card
│  [宝石图标]钱包 [星星图标]宝石库 [记录图标]记录 [需求图标]需求        │
│  [活动图标]活动 [反馈图标]反馈 [客服图标]客服 [设置图标]设置          │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 统计卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'var(--space-4) 0'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 三列数据 -->
</base-card>

<!-- VIP 卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'var(--space-4)'"
  :background="'linear-gradient(135deg, #2c2c2c, #4a4a4a)'"
>
  <!-- VIP 权益 -->
</base-card>

<!-- 功能网格卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- grid 4列 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 个人中心
- 创作者中心
- 会员中心
- 我的页面

## 触发词

```markdown
/uniapp-base-skill 做一个个人中心，渐变头部，数据统计，VIP卡片，功能网格
```

## 演示

[查看 HTML 演示](html/profile-detail.html)
