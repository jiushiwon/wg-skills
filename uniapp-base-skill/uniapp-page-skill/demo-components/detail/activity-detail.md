# 活动详情

> 头图状态角标 + 标题价格 + 时间地点信息列表 + 底部报名，适合活动、线路、课程详情

## 风格

- 圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-3)`
- 状态角标 → absolute 定位，胶囊形状
- 信息列表 → 图标 + 标题 + 内容
- 底部报名栏 → `position: sticky; bottom: 0`

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card
│ [活动大图]              进行中      │
│ 当前参与 21/48      [评论图标] 6778         │
├─────────────────────────────────────┤  ← base-card
│ ¥132.00   格尔木昆仑山大峡谷-寻石之旅│
│ 5天4夜，自驾...                      │
├─────────────────────────────────────┤  ← base-card
│ [时钟图标] 活动报名时间 2025-08-20 至...    │
│ [时钟图标] 活动开始时间 2025-10-21 至...    │
│ [定位图标] 活动地点 广东省-深圳市...         │
│ [信息图标] 退出条件 活动开始前一周            │
├─────────────────────────────────────┤  ← base-card
│ 活动详情                            │
│ 该石形成需同时具备...               │
├─────────────────────────────────────┤  ← 底部报名栏
│ 合计：¥132.00      [立即报名]        │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 头图卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 头图 + 状态角标 -->
</base-card>

<!-- 标题价格卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 价格、标题、副标题 -->
</base-card>

<!-- 信息列表卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- info-item 列表 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 活动详情
- 线路详情
- 课程详情
- 报名页

## 触发词

```markdown
/uniapp-base-skill 做一个活动详情页，顶部大图带状态角标，时间地点信息，底部报名按钮
```

## 演示

[查看 HTML 演示](html/activity-detail.html)
