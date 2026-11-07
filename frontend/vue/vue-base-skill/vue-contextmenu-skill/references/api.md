# ContextMenu API 文档

## 组件导出

```typescript
import { ContextMenu, MenuItem, SubMenu } from '@/components/ContextMenu'
import type { MenuOption, ContextMenuProps, ContextMenuEmits } from '@/components/ContextMenu'
```

## ContextMenu 组件

### Props

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| options | `MenuOption[]` | `[]` | 是 | 菜单选项配置 |
| x | `number` | `0` | 是 | 菜单显示位置 X 坐标（相对于视口） |
| y | `number` | `0` | 是 | 菜单显示位置 Y 坐标（相对于视口） |
| visible | `boolean` | `false` | 否 | 控制菜单显示/隐藏，支持 `v-model:visible` |
| width | `number` | `180` | 否 | 菜单宽度（px） |
| z-index | `number` | `1000` | 否 | 菜单层级 |
| trigger | `'contextmenu' \| 'click'` | `'contextmenu'` | 否 | 触发方式 |
| adjust-position | `boolean` | `true` | 否 | 是否开启边缘检测自动调整位置 |
| transition | `string` | `'contextmenu'` | 否 | 过渡动画名称 |

### Events

| 事件名 | 回调参数 | 说明 |
|--------|----------|------|
| select | `(command: string \| number)` | 菜单项被点击时触发 |
| update:visible | `(visible: boolean)` | 显示状态变化时触发，用于 v-model |
| show | - | 菜单显示后触发 |
| hide | - | 菜单隐藏后触发 |

### Slots

| 插槽名 | 作用域 | 说明 |
|--------|--------|------|
| default | - | 自定义菜单内容，替代 options 渲染 |

---

## MenuOption 类型

```typescript
interface MenuOption {
  /** 菜单项显示文本 */
  label?: string

  /** 点击时传递的命令标识 */
  command?: string | number

  /** 图标：可以是组件对象或 emoji 字符串 */
  icon?: string | Component

  /** 是否禁用 */
  disabled?: boolean

  /** 是否在此项上方显示分割线 */
  divided?: boolean

  /** 子菜单项，存在时自动渲染为子菜单 */
  children?: MenuOption[]

  /**
   * 是否显示此项
   * - boolean: 直接控制
   * - function: 动态计算，返回 false 时不渲染
   */
  show?: boolean | (() => boolean)

  /** 可访问性标签，不设置时使用 label */
  ariaLabel?: string

  /** 快捷键显示文本（仅显示，不绑定实际快捷键） */
  shortcut?: string
}
```

### 示例

```typescript
const options: MenuOption[] = [
  {
    label: '复制',
    command: 'copy',
    icon: '📋',
    shortcut: 'Ctrl+C'
  },
  {
    label: '粘贴',
    command: 'paste',
    icon: '📄',
    shortcut: 'Ctrl+V',
    disabled: !hasClipboard
  },
  { divided: true }, // 分割线
  {
    label: '更多',
    icon: '⚡',
    children: [
      { label: '子选项 1', command: 'sub1' },
      { label: '子选项 2', command: 'sub2' }
    ]
  },
  {
    label: '管理员',
    command: 'admin',
    show: () => userStore.isAdmin
  }
]
```

---

## 边缘检测

当 `adjust-position` 为 `true` 时，组件会自动检测菜单位置：

1. **右侧溢出**：菜单左移，确保不超出视口右边缘
2. **底部溢出**：菜单上移，确保不超出视口底边缘
3. **间距**：保留 8px 的安全距离

```typescript
// 边缘检测逻辑
if (x + menuWidth > viewportWidth) {
  x = viewportWidth - menuWidth - 8
}
if (y + menuHeight > viewportHeight) {
  y = viewportHeight - menuHeight - 8
}
```

---

## 子菜单定位

子菜单自动在父菜单项右侧弹出，如果右侧空间不足则在左侧弹出：

```typescript
// 子菜单定位逻辑
const rect = parentMenuItem.getBoundingClientRect()
let submenuX = rect.right + 4
let submenuY = rect.top

// 右侧空间不足时
if (submenuX + submenuWidth > viewportWidth) {
  submenuX = rect.left - submenuWidth - 4
}
```

---

## 键盘导航

组件内置完整的键盘导航支持：

| 按键 | 操作 | 说明 |
|------|------|------|
| `↑` | 上移焦点 | 移动到上一个可用菜单项 |
| `↓` | 下移焦点 | 移动到下一个可用菜单项 |
| `→` | 展开子菜单 | 当前项有子菜单时展开 |
| `←` | 收起子菜单 | 关闭当前子菜单，返回父菜单 |
| `Enter` | 选择 | 触发当前焦点项的 select 事件 |
| `Escape` | 关闭 | 关闭整个菜单 |

### 焦点管理

- 菜单打开时，焦点自动移动到第一个可用项
- 禁用项在键盘导航时会被跳过
- 子菜单关闭时，焦点返回到父菜单项

---

## 可访问性属性

组件自动添加以下 ARIA 属性：

```html
<!-- 主菜单容器 -->
<div role="menu" aria-orientation="vertical">

  <!-- 菜单项 -->
  <div role="menuitem" aria-disabled="false" aria-label="复制">

  <!-- 带子菜单的项 -->
  <div role="menuitem" aria-haspopup="true" aria-expanded="false">

  <!-- 分割线 -->
  <div role="separator">
```

---

## 使用模式

### 1. v-model 双向绑定

```vue
<ContextMenu
  v-model:visible="menuVisible"
  :x="x"
  :y="y"
  :options="options"
/>
```

### 2. 单向绑定 + 事件

```vue
<ContextMenu
  :visible="menuVisible"
  :x="x"
  :y="y"
  :options="options"
  @update:visible="menuVisible = $event"
  @select="handleSelect"
/>
```

### 3. 自定义内容（插槽）

```vue
<ContextMenu
  v-model:visible="visible"
  :x="x"
  :y="y"
  @select="handleSelect"
>
  <div class="custom-content">
    <!-- 自定义内容 -->
  </div>
</ContextMenu>
```

---

## 性能优化

1. **v-if 条件渲染**：菜单不显示时不会创建 DOM
2. **Teleport**：菜单渲染到 body，避免父容器 overflow 裁剪
3. **事件委托**：使用事件委托减少事件监听器数量
4. **按需渲染**：子菜单只在展开时渲染

---

## 常见问题

### Q: 菜单被父容器裁剪？

A: 组件使用 Teleport 渲染到 body，不会被父容器裁剪。如果仍有问题，检查是否有全局的 `overflow: hidden`。

### Q: 如何自定义动画？

A: 通过 `transition` prop 指定动画名称，然后定义对应的 CSS transition：

```vue
<ContextMenu transition="my-animation" />

<style>
.my-animation-enter-active,
.my-animation-leave-active {
  transition: opacity 0.3s;
}
.my-animation-enter-from,
.my-animation-leave-to {
  opacity: 0;
}
</style>
```

### Q: 如何在表格行上使用？

A: 监听行的 `contextmenu` 事件，获取行数据并显示菜单：

```typescript
const handleRowContextMenu = (row: any, event: MouseEvent) => {
  event.preventDefault()
  currentRow.value = row
  position.value = { x: event.clientX, y: event.clientY }
  visible.value = true
}
```

### Q: 如何处理权限控制？

A: 使用 `show` 或 `disabled` 属性动态控制：

```typescript
const options = computed(() => [
  {
    label: '删除',
    command: 'delete',
    show: hasDeletePermission,  // 控制是否显示
    disabled: !canDelete        // 控制是否可点击
  }
])
```
