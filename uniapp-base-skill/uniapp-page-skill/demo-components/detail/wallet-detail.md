# 钱包详情

> 渐变余额卡片 + 交易明细列表，适合钱包、资产中心、积分明细、交易记录

## 风格

- 圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-3)`
- 余额卡片 → 蓝紫渐变背景
- 收入 → `var(--color-income)` 绿色
- 支出 → `var(--color-expense)` 红色
- 交易项 → 图标 + 名称/时间 + 金额

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card（渐变）
│  我的宝石币                  ?       │
│  2,839.00              立即赚取>>    │
│  约等于2839.00RMB                    │
├─────────────────────────────────────┤  ← base-card
│  交易明细              全部 ›        │
├─────────────────────────────────────┤
│  [礼物图标] 任务奖励      +300.00            │
│  [购物车图标] 兑换中心消费   -99.00             │
│  [礼物图标] 任务奖励      +300.00            │
│  [购物车图标] 兑换中心消费   -99.00             │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 余额卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'var(--space-4)'"
  :background="'linear-gradient(135deg, #4a90e2, #7bb1ff)'"
>
  <!-- 余额展示 -->
</base-card>

<!-- 交易明细卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 交易列表 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 钱包
- 资产中心
- 积分明细
- 交易记录

## 触发词

```markdown
/uniapp-base-skill 做一个钱包详情页，渐变余额卡片，交易明细列表
```

## 演示

[查看 HTML 演示](html/wallet-detail.html)
