# base-input 搜索栏：迷你胶囊（mini）

> 999px 迷你胶囊 + 浅底 + 36px 紧凑高度，头像旁内联的小搜索。

## 风格

- 高度 → 36px
- 圆角 → `var(--radius-full)` 999px 胶囊
- 背景 → `var(--color-bg)` 浅灰
- 阴影 → 无
- 图标 → 左侧搜索 icon（紧凑尺寸）
- padding → `0 var(--space-3)` 水平内边距

## 页面结构

```
┌─────────────────────────────────────┐
│ ┌──────────────────────────────┐   │ ← base-input search-mini
│ │ 🔍 搜索...                  │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

## base-input 参数

```vue
<base-input
  v-model="keyword"
  type="text"
  placeholder="搜索..."
  border="none"
>
  <template #prefix>
    <svg class="prefix-icon" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </svg>
  </template>
</base-input>

<!-- 外层容器（实现 mini 视觉） -->
<view style="
  background: var(--color-bg);
  border-radius: var(--radius-full);
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
| `var(--color-bg)` | 搜索栏背景（浅底） |
| `var(--color-text-tertiary)` | 搜索图标 |
| `var(--radius-full)` | 圆角（999px 胶囊） |

## 适用场景

- 头像旁内联搜索
- 工具栏内联搜索
- 卡片顶部迷你搜索
- 桌面端辅助搜索

## 触发词

```markdown
/uniapp-base-skill 做一个迷你搜索栏
/uniapp-base-skill 做一个内联搜索
```

## 演示

[查看 HTML 演示](html/base-input-search-mini.html)
