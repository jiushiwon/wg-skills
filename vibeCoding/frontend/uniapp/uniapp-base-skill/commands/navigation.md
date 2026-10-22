# 导航类组件（navigation）

> 实现真源：`vibeCoding/frontend/uniapp/uniapp-base-skill/`（本模块即实现层）
> 本文件由 `components/_registry.json` + 各组件 `props.json` 同步生成，**改实现必须重新生成本文件**。
> 重新生成：`node scripts/gen-commands.js`

## 总览

| 组件 | 说明 | 别名 | 类型 |
|------|------|------|------|
| `breadcrumb` | 路径导航面包屑，最后一级为当前页不可点击 | 面包屑导航 / breadcrumb / 路径导航 / 层级路径 | 组件 |
| `side-menu` | 抽屉式侧边栏菜单，支持二级子项展开收起 | 侧边栏 / side-menu / 折叠菜单 / 抽屉菜单 | 组件 |
| `top-tab` | 顶部横向页签切换，指示条使用 transform 动画 | 顶部标签 / top-tab / 选项卡 / 页签导航 | 组件 |

---

## breadcrumb 面包屑

**说明**：路径导航面包屑，最后一级为当前页不可点击

**别名**：面包屑导航、breadcrumb、路径导航、层级路径

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/navigation/breadcrumb/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `array` | `[]` | 路径项列表 [{text, icon, url}]，最后一项为当前页 |
| `separator` | `string` | `›` | 分隔符 |

**事件**：

- `click`

**用法**：见 [usage.md](../components/navigation/breadcrumb/usage.md)

---

## side-menu 侧边菜单

**说明**：抽屉式侧边栏菜单，支持二级子项展开收起

**别名**：侧边栏、side-menu、折叠菜单、抽屉菜单

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/navigation/side-menu/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | `false` | 抽屉显示状态 |
| `title` | `string` | `菜单` | 抽屉标题 |
| `width` | `string` | `80%` | 抽屉宽度 |
| `background` | `string` | `var(--bg-card, #ffffff)` | 抽屉背景色 |
| `items` | `array` | `[]` | 菜单项列表 [{key, text, children}] |
| `modelValue` | `string[]` | `[]` | 已展开的菜单项 key 集合 |
| `collapsible` | `boolean` | `true` | 是否允许折叠子项 |

**事件**：

- `close`
- `update:show`
- `update:modelValue`
- `change`
- `select`

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 菜单内容，默认渲染 items |
| `header` | 自定义抽屉头部 |

**用法**：见 [usage.md](../components/navigation/side-menu/usage.md)

---

## top-tab 顶部页签

**说明**：顶部横向页签切换，指示条使用 transform 动画

**别名**：顶部标签、top-tab、选项卡、页签导航

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/navigation/top-tab/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `array` | `[]` | 页签列表 [{key, text, badge}] |
| `modelValue` | `string` |  | 当前选中项的 key |
| `activeColor` | `string` | `var(--color-primary, #14b8a6)` | 选中态颜色 |
| `inactiveColor` | `string` | `var(--text-secondary, #525252)` | 未选中态颜色 |
| `scroll` | `boolean` | `true` | 超出宽度时是否横向滚动 |

**事件**：

- `update:modelValue`
- `change`

**用法**：见 [usage.md](../components/navigation/top-tab/usage.md)
