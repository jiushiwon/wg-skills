# 结果页

> 状态图标 + 文案 + 操作按钮 + 推荐内容，适合支付结果、提交成功、空状态、404

## 风格

- 圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-3)`
- 状态图标 → 圆形背景 + 白色图标
- 成功 → 绿色，失败 → 红色，空状态 → 灰色
- 推荐内容 → 双列网格卡片

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card
│                                     │
│        [对勾图标]  支付成功                   │
│   您的订单已支付成功...              │
│   [返回首页]  [查看订单]             │
│                                     │
├─────────────────────────────────────┤  ← base-card
│  推荐商品              查看更多>>   │
│  [图]象形·太湖石  [图]象形·灵璧石   │
│  ¥132.0            ¥132.0           │
│  [图]水晶原石     [图]玛瑙手串      │
│  ¥89.0             ¥156.0           │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 状态结果卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'48px var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 图标 + 标题 + 描述 + 按钮 -->
</base-card>

<!-- 推荐内容卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 推荐标题 + 双列网格 -->
</base-card>
```

## 状态变体

| 状态 | 背景色 | 图标 |
|------|--------|------|
| success | `var(--color-success)` | check |
| error | `var(--color-error)` | x |
| empty | `#e0e0e0` | help-circle / search |

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 支付结果
- 提交成功
- 404 页面
- 空状态
- 无网络

## 触发词

```markdown
/uniapp-base-skill 做一个支付成功结果页，状态图标，操作按钮，推荐商品
```

## 演示

[查看 HTML 演示](html/result-detail.html)
