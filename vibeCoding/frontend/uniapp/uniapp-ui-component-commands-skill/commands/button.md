# 按钮指令详解

## 指令列表

### btn-primary

**触发关键词**：主按钮、确定、提交、primary、主要按钮

**样式**：
- 高度：40px (可配置 --btn-height-md)
- 圆角：10px (可配置 --radius-md)
- 背景：var(--primary)
- 文字色：var(--text-inverse)
- 字号：16px (可配置 --btn-font-md)

**使用示例**：

```vue
<button class="btn-primary">
  <text>确定</text>
</button>

<!-- 大号 -->
<button class="btn-primary btn-primary--large">
  <text>确定</text>
</button>

<!-- 块级 -->
<button class="btn-primary btn-primary--block">
  <text>确定</text>
</button>
```

---

### btn-secondary

**触发关键词**：次按钮、取消、返回、secondary、灰色按钮

**样式**：
- 高度：40px
- 圆角：10px
- 背景：var(--bg-secondary)
- 文字色：var(--text-primary)

---

### btn-ghost

**触发关键词**：幽灵按钮、透明按钮、空心按钮、ghost、outline

**样式**：
- 高度：40px
- 圆角：10px
- 背景：transparent
- 边框：1px solid var(--primary)
- 文字色：var(--primary)

---

### btn-icon

**触发关键词**：图标按钮、icon按钮、纯图标

**样式**：
- 尺寸：40x40px
- 圆角：10px
- 背景：transparent

---

## 尺寸变体

| 变体 | 类名 | 高度 | 字号 |
|------|------|------|------|
| 小号 | `--small` | 32px | 14px |
| 中号 | (默认) | 40px | 16px |
| 大号 | `--large` | 48px | 18px |

## 块级变体

添加 `--block` 类名使按钮宽度为100%

## 禁用状态

使用 `disabled` 属性或 `disabled` 类名

```vue
<button class="btn-primary" disabled>
  <text>禁用</text>
</button>
```

## 点击态

无需额外代码，CSS已定义 `:active` 样式
