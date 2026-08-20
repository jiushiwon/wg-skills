# base-input 搜索栏：扁平（flat）

> 0 圆角 + 白底，无阴影，工具类 / 极简风搜索栏。

## 风格

- 高度 → 44px
- 圆角 → `0` 直角
- 背景 → `var(--color-surface)` 白色
- 阴影 → 无
- 图标 → 左侧搜索 icon，右侧清除 icon
- padding → `0 var(--space-3)` 水平内边距

## 页面结构

```
┌─────────────────────────────────────┐
│ ┌────────────────────────────────┐ │ ← base-input search-flat
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

<!-- 外层容器（实现 flat 视觉） -->
<view style="
  background: var(--color-surface);
  border-radius: 0;
  height: 44px;
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
| `var(--color-surface)` | 搜索栏背景（与页面背景形成对比） |
| `var(--color-text-tertiary)` | 搜索图标、清除按钮 |

## 适用场景

- 工具类 App
- B 端后台
- 极简风格页面
- 控制台搜索

## 触发词

```markdown
/uniapp-base-skill 做一个扁平搜索栏
/uniapp-base-skill 做一个极简搜索
```

## 演示

[查看 HTML 演示](html/base-input-search-flat.html)
