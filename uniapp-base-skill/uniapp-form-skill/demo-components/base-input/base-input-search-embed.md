# base-input 搜索栏：嵌入式（embed）

> 浅底填充 + 8px 圆角 + 无阴影，头部轻搜索风格，与页面背景融为一体。

## 风格

- 高度 → 36px（紧凑）
- 圆角 → `var(--radius-md)` 8px
- 背景 → `var(--color-bg)` 浅灰（与页面背景同色系）
- 阴影 → 无
- 图标 → 左侧搜索 icon，右侧清除 icon
- padding → `0 var(--space-3)` 水平内边距

## 页面结构

```
┌─────────────────────────────────────┐
│ ┌────────────────────────────────┐ │ ← base-input search-embed
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

<!-- 外层容器（实现 embed 视觉） -->
<view style="
  background: var(--color-bg);
  border-radius: var(--radius-md);
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  gap: var(--space-2);
">
  <!-- 上面 base-input 放在这里 -->
</view>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg)` | 搜索栏背景（浅底嵌入） |
| `var(--color-text-tertiary)` | 搜索图标、清除按钮 |
| `var(--radius-md)` | 圆角（8px） |

## 适用场景

- 头部轻搜索
- 二级页面搜索
- 卡片内嵌搜索
- 折叠面板中的搜索

## 触发词

```markdown
/uniapp-base-skill 做一个嵌入式搜索栏
/uniapp-base-skill 做一个头部轻搜索
```

## 演示

[查看 HTML 演示](html/base-input-search-embed.html)
