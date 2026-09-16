# base-input 搜索栏：小圆角卡片（card）

> 8px 圆角 + 白底 + 阴影，搜索结果页内嵌的搜索栏。

## 风格

- 高度 → 36px（紧凑）
- 圆角 → `var(--radius-md)` 8px
- 背景 → `var(--color-bg-surface)` 白色
- 阴影 → `var(--shadow-sm)` 轻微浮起
- 图标 → 左侧搜索 icon，右侧清除 icon
- padding → `0 var(--space-3)` 水平内边距

## 页面结构

```
┌─────────────────────────────────────┐
│ ┌────────────────────────────────┐ │ ← base-input search-card
│ │ 🔍 ________________________ ✕ │ │
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

```vue
<base-input
  v-model="keyword"
  type="text"
  placeholder="搜索..."
  border="none"
  show-clear
>
  <template #prefix>
    <svg class="prefix-icon" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </svg>
  </template>
</base-input>

<!-- 外层容器（实现 card 视觉） -->
<view style="
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  box-shadow: var(--shadow-sm);
  gap: var(--space-2);
">
  <!-- 上面 base-input 放在这里 -->
</view>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg-surface)` | 搜索栏背景 |
| `var(--color-text-tertiary)` | 搜索图标、清除按钮 |
| `var(--shadow-sm)` | 阴影 |
| `var(--radius-md)` | 圆角（8px） |

## 适用场景

- 搜索结果页内嵌搜索栏
- 列表头部搜索
- 订单筛选搜索
- 表格上方搜索

## 触发词

```markdown
/uniapp-base-skill 做一个卡片式搜索栏
/uniapp-base-skill 做一个结果页搜索栏
```

## 演示

[查看 HTML 演示](html/base-input-search-card.html)
