# base-input 多行反馈

> 意见反馈 / 留言 / 备注场景：多行文本 + 字数计数，使用 `base-input` 的 `textarea` 形态。

## 风格

- 容器 → 白色卡片，`var(--radius-lg)` 大圆角
- 输入区 → 8px 圆角 + 全边框，最小高度 120px（5 行）
- 顶部标签 → 左侧字段名 + 右侧字数计数（`xx / 500`）
- 提交按钮 → 主色胶囊（`var(--radius-full)`），强调 CTA

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card 12px
│ 提交反馈                             │ ← 标题
│ 您的反馈将帮助我们改进产品体验         │ ← 描述
├─────────────────────────────────────┤
│ 反馈内容                     0/500   │
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ │ 请输入您的反馈...              │ │
│ │                                │ │
│ │                                │ │ ← base-input type=textarea
│ │                                │ │   rows=5 maxlength=500
│ │                                │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌────────────────────────────────┐ │
│ │         提交反馈              │ │ ← 胶囊主按钮
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

```vue
<base-input
  v-model="form.feedback"
  type="textarea"
  label="反馈内容"
  :rows="5"
  :maxlength="500"
  border="all"
  placeholder="请输入您的反馈..."
>
  <template #label>
    <view style="display:flex;justify-content:space-between;width:100%;">
      <text>反馈内容</text>
      <text style="color:var(--color-text-tertiary);font-size:12px;">
        {{ form.feedback.length }} / 500
      </text>
    </view>
  </template>
</base-input>

<!-- 提交按钮 -->
<base-card
  width="100%"
  height="44px"
  radius="var(--radius-full)"
  background="var(--color-primary)"
  clickable
  @click="onSubmit"
>
  <text style="color:#fff;">提交反馈</text>
</base-card>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-surface)` | 卡片背景、输入框背景 |
| `var(--color-border)` | 输入框边框 |
| `var(--color-text-tertiary)` | 字数计数 |
| `var(--color-primary)` | 提交按钮背景 |
| `var(--radius-lg)` | 卡片圆角 |
| `var(--radius-full)` | 按钮圆角（胶囊） |

## 适用场景

- 意见反馈
- 用户留言
- 商品备注
- 申请说明
- 自我介绍

## 触发词

```markdown
/uniapp-base-skill 做一个意见反馈页
/uniapp-base-skill 做一个多行输入表单
```

## 演示

[查看 HTML 演示](html/base-input-feedback.html)
