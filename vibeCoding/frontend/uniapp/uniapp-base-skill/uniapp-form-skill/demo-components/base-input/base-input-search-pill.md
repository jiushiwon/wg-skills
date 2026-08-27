# base-input 搜索栏：胶囊（pill）

> 999px 胶囊形态 + 浅阴影，搜索页主流样式。顶部导航 + 搜索图标 + input + 清除按钮。

## 风格

- 高度 → 36px（紧凑）
- 圆角 → `var(--radius-full)` 胶囊（999px）
- 背景 → `var(--color-bg-surface)` 白色
- 阴影 → `var(--shadow-sm)` 轻微浮起
- 图标 → 左侧搜索 icon，右侧清除 icon（输入时显示）
- padding → `0 var(--space-3)` 水平内边距

## 页面结构

```
┌─────────────────────────────────────┐
│ ┌────────────────────────────────┐ │ ← base-input search-pill
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

<!-- 外层容器（实现 pill 视觉） -->
<view style="
  background: var(--color-bg-surface);
  border-radius: var(--radius-full);
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
| `var(--radius-full)` | 圆角（胶囊） |
| `var(--space-3)` | 水平内边距 |

## 适用场景

- 顶部导航搜索入口
- App 首页搜索栏
- 电商 / 内容平台通用搜索

## 触发词

```markdown
/uniapp-base-skill 做一个胶囊搜索栏
/uniapp-base-skill 做一个顶部搜索栏
```

## 演示

[查看 HTML 演示](html/base-input-search-pill.html)
