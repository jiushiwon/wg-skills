# base-input 搜索栏：弹窗卡片（bubble）

> 12px 大圆角 + 中等阴影，全局搜索弹窗式搜索栏，高级感。

## 风格

- 高度 → 44px（更舒展）
- 圆角 → `var(--radius-lg)` 12px
- 背景 → `var(--color-bg-surface)` 白色
- 阴影 → `var(--shadow-md)` 中等浮起
- 图标 → 左侧搜索 icon，右侧清除 icon
- padding → `0 var(--space-3)` 水平内边距

## 页面结构

```
┌─────────────────────────────────────┐
│ ┌────────────────────────────────┐ │ ← base-input search-bubble
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

<!-- 外层容器（实现 bubble 视觉） -->
<view style="
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  box-shadow: var(--shadow-md);
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
| `var(--shadow-md)` | 中等阴影 |
| `var(--radius-lg)` | 圆角（12px） |

## 适用场景

- 全局搜索弹窗
- 命令面板（⌘K）
- App 顶部悬浮搜索
- 强调搜索的页面入口

## 触发词

```markdown
/uniapp-base-skill 做一个弹窗搜索栏
/uniapp-base-skill 做一个全局搜索面板
```

## 演示

[查看 HTML 演示](html/base-input-search-bubble.html)
