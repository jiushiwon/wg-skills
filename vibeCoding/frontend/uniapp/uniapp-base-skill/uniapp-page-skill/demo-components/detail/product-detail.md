# 商品详情

> 轮播大图 + 信息卡片 + 规格配送 + 服务保障 + 底部操作，适合商品、服务、课程详情

## 风格

- 圆角 → `var(--radius-lg)` 或 `var(--radius-card)`
- 间距分割 → `var(--space-3)`
- 价格强调 → `var(--color-price)`
- 阴影 → `var(--shadow-sm)`
- 底部操作栏 → `position: sticky; bottom: 0`

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card
│ [商品大图轮播]                       │
│  ●  ○  ○                            │
├─────────────────────────────────────┤  ← base-card
│ ¥132.0    ¥188.0                    │
│ 象形·太湖石                          │
│ 热情奔放的骑士红...                  │
├─────────────────────────────────────┤  ← base-card
│ [包裹图标] 已选  05号 高山流水    ›         │
│ [卡车图标] 配送  物流配送         ›         │
│ [问号图标] 保障  7天无理由退货    ›         │
├─────────────────────────────────────┤  ← base-card
│ [对勾图标] 正品保障  [对勾图标] 极速退款  [对勾图标] 全场包邮│
├─────────────────────────────────────┤  ← base-card
│ 奇石介绍                            │
│ 编号 / 种类 / 产地 / 尺寸           │
├─────────────────────────────────────┤  ← 底部操作栏
│ [客服] [收藏] [加入购物车] [立即购买]│
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 轮播图卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 轮播图 -->
</base-card>

<!-- 标题价格卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 价格、标题、描述 -->
</base-card>

<!-- 规格配送卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- info-cell 列表 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 商品详情
- 服务详情
- 课程详情
- 作品详情

## 触发词

```markdown
/uniapp-base-skill 做一个商品详情页，顶部轮播图，标题价格，规格配送，底部购买按钮
```

## 演示

[查看 HTML 演示](html/product-detail.html)
