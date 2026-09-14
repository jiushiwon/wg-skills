# ContextMenu 最佳实践

## 目录

1. [基础用法](#基础用法)
2. [与表格配合](#与表格配合)
3. [与树组件配合](#与树组件配合)
4. [权限控制](#权限控制)
5. [性能优化](#性能优化)
6. [样式定制](#样式定制)
7. [常见陷阱](#常见陷阱)

---

## 基础用法

### 推荐：使用 ref 管理状态

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ContextMenu, type MenuOption } from '@/components/ContextMenu'

// 推荐：使用 reactive 管理位置
const position = reactive({ x: 0, y: 0 })
const visible = ref(false)

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  position.x = event.clientX
  position.y = event.clientY
  visible.value = true
}
</script>
```

### 避免：在循环中创建菜单

```vue
<!-- ✗ 错误：每个项都有菜单实例 -->
<template>
  <div v-for="item in list" :key="item.id">
    <div @contextmenu="handleContextMenu(item, $event)">
      {{ item.name }}
    </div>
    <!-- 不要在这里放 ContextMenu -->
  </div>

  <!-- ✓ 正确：共享一个菜单实例 -->
  <ContextMenu
    v-model:visible="visible"
    :x="position.x"
    :y="position.y"
    :options="currentOptions"
  />
</template>
```

---

## 与表格配合

### 表格行右键菜单

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ContextMenu, type MenuOption } from '@/components/ContextMenu'

const tableData = ref([...])
const currentRow = ref<any>(null)
const visible = ref(false)
const position = reactive({ x: 0, y: 0 })

// 动态菜单：根据行数据决定
const options = computed<MenuOption[]>(() => {
  if (!currentRow.value) return []

  return [
    {
      label: '查看详情',
      command: 'view',
      icon: '👁️'
    },
    {
      label: '编辑',
      command: 'edit',
      icon: '✏️',
      show: currentRow.value.status !== 'deleted'
    },
    { divided: true },
    {
      label: '删除',
      command: 'delete',
      icon: '🗑️',
      disabled: currentRow.value.status === 'locked'
    }
  ]
})

const handleRowContextMenu = (row: any, event: MouseEvent) => {
  event.preventDefault()
  currentRow.value = row
  position.x = event.clientX
  position.y = event.clientY
  visible.value = true
}

const handleCommand = async (command: string | number) => {
  const row = currentRow.value
  if (!row) return

  switch (command) {
    case 'view':
      await viewDetail(row)
      break
    case 'edit':
      await editRow(row)
      break
    case 'delete':
      await deleteRow(row)
      break
  }
}
</script>

<template>
  <div class="table">
    <div
      v-for="row in tableData"
      :key="row.id"
      class="table-row"
      @contextmenu="handleRowContextMenu(row, $event)"
    >
      {{ row.name }}
    </div>
  </div>

  <ContextMenu
    v-model:visible="visible"
    :x="position.x"
    :y="position.y"
    :options="options"
    @select="handleCommand"
  />
</template>
```

---

## 与树组件配合

### 树节点右键菜单

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ContextMenu, type MenuOption } from '@/components/ContextMenu'

const menuVisible = ref(false)
const menuPosition = reactive({ x: 0, y: 0 })
const currentNode = ref<TreeNode | null>(null)

// 根据节点类型生成菜单
const getOptions = (node: TreeNode): MenuOption[] => {
  const isDir = node.type === 'directory'
  const isRoot = node.level === 0

  return [
    {
      label: '新增子节点',
      command: 'add-child',
      icon: '➕',
      show: isDir
    },
    { label: '重命名', command: 'rename', icon: '✏️' },
    { label: '复制', command: 'copy', icon: '📋' },
    { divided: true },
    {
      label: '删除',
      command: 'delete',
      icon: '🗑️',
      disabled: isRoot
    }
  ]
}

const handleNodeContextMenu = (node: TreeNode, event: MouseEvent) => {
  event.preventDefault()
  currentNode.value = node
  menuPosition.x = event.clientX
  menuPosition.y = event.clientY
  menuVisible.value = true
}

const handleCommand = async (command: string | number) => {
  const node = currentNode.value
  if (!node) return

  switch (command) {
    case 'add-child':
      await addChildNode(node)
      break
    case 'rename':
      await renameNode(node)
      break
    case 'delete':
      await deleteNode(node)
      break
  }
}
</script>

<template>
  <Tree
    :data="treeData"
    @node-contextmenu="handleNodeContextMenu"
  />

  <ContextMenu
    v-model:visible="menuVisible"
    :x="menuPosition.x"
    :y="menuPosition.y"
    :options="currentNode ? getOptions(currentNode) : []"
    @select="handleCommand"
  />
</template>
```

---

## 权限控制

### 方式一：动态 show 属性

```typescript
const options = computed<MenuOption[]>(() => [
  {
    label: '编辑',
    command: 'edit',
    show: hasPermission('edit', currentRow.value)
  },
  {
    label: '删除',
    command: 'delete',
    show: hasPermission('delete', currentRow.value)
  }
])
```

### 方式二：disabled 属性

```typescript
const options = computed<MenuOption[]>(() => [
  {
    label: '编辑',
    command: 'edit',
    disabled: !hasPermission('edit', currentRow.value)
  }
])
```

### 推荐场景

| 方式 | 场景 | 用户体验 |
|------|------|----------|
| `show` | 完全隐藏无权限操作 | 菜单项更少，更清晰 |
| `disabled` | 需要展示但不可操作 | 用户知道功能存在 |

---

## 性能优化

### 1. 使用 v-if 延迟渲染

组件默认使用 `v-if`，菜单不显示时不会创建 DOM。

### 2. 避免不必要的响应式

```typescript
// ✗ 错误：每次渲染都创建新数组
const options = [
  { label: '复制', command: 'copy' }
]

// ✓ 正确：使用 computed 缓存
const options = computed(() => [
  { label: '复制', command: 'copy' }
])
```

### 3. 大量菜单项的虚拟滚动

对于超长菜单（50+ 项），考虑实现虚拟滚动：

```vue
<ContextMenu
  v-model:visible="visible"
  :x="x"
  :y="y"
  :options="options"
  virtual
  :height="300"
/>
```

### 4. 防抖处理

```typescript
import { useDebounceFn } from '@vueuse/core'

const handleContextMenu = useDebounceFn((event: MouseEvent) => {
  event.preventDefault()
  position.x = event.clientX
  position.y = event.clientY
  visible.value = true
}, 100)
```

---

## 样式定制

### 使用设计 Token

```scss
.context-menu {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-lg);
}

.menu-item {
  padding: var(--space-2) var(--space-4);
  color: var(--color-text);

  &:hover {
    background: var(--color-fill);
  }

  &--disabled {
    color: var(--color-text-disabled);
  }
}
```

### 主题适配

```scss
// 暗色主题
[data-theme='dark'] {
  .context-menu {
    background: var(--color-bg-dark);
    border-color: var(--color-border-dark);
  }
}
```

### 自定义动画

```vue
<ContextMenu transition="fade-slide" />

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
```

---

## 常见陷阱

### 1. 事件冒泡导致菜单立即关闭

```typescript
// ✗ 错误：点击菜单项时事件冒泡到 document
document.addEventListener('click', () => {
  visible.value = false
})

// ✓ 正确：使用 capture 阶段或判断点击目标
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    visible.value = false
  }
}
```

### 2. 坐标系错误

```typescript
// ✗ 错误：使用 pageX/Y（包含滚动距离）
position.x = event.pageX
position.y = event.pageY

// ✓ 正确：使用 clientX/Y（相对于视口）
position.x = event.clientX
position.y = event.clientY
```

### 3. 未阻止默认右键菜单

```typescript
// ✓ 正确：阻止浏览器默认右键菜单
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  // ...
}
```

### 4. 动态菜单未使用 computed

```typescript
// ✗ 错误：依赖变化时菜单不更新
const options = [
  { label: '编辑', disabled: !canEdit }
]

// ✓ 正确：使用 computed 响应变化
const options = computed(() => [
  { label: '编辑', disabled: !canEdit.value }
])
```

### 5. 多个菜单实例冲突

```vue
<!-- ✗ 错误：每个列表项都有菜单 -->
<div v-for="item in list">
  <ContextMenu :options="item.options" />
</div>

<!-- ✓ 正确：共享一个菜单 -->
<ContextMenu :options="currentOptions" />
```

---

## 组件设计原则

### 1. 单一职责

ContextMenu 只负责：
- 显示/隐藏菜单
- 处理键盘导航
- 边缘检测

不负责：
- 权限判断（业务层）
- 菜单数据获取（业务层）
- 命令执行逻辑（业务层）

### 2. 可组合性

```typescript
// 与其他组件组合
const contextMenu = useContextMenu()

// 表格使用
const tableContextMenu = contextMenu.useWithTable(options)

// 树使用
const treeContextMenu = contextMenu.useWithTree(options)
```

### 3. 可测试性

```typescript
// 单元测试示例
describe('ContextMenu', () => {
  it('should show at correct position', async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 200,
        options: [{ label: 'Test', command: 'test' }]
      }
    })

    const menu = wrapper.find('.context-menu')
    expect(menu.attributes('style')).toContain('left: 100px')
    expect(menu.attributes('style')).toContain('top: 200px')
  })

  it('should emit select on click', async () => {
    const wrapper = mount(/* ... */)
    await wrapper.find('.menu-item').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual(['test'])
  })
})
```

---

## 总结

### Do

- ✓ 使用 `v-model:visible` 控制显示
- ✓ 使用 `computed` 创建动态菜单
- ✓ 共享菜单实例，避免重复创建
- ✓ 使用设计 Token，不硬编码样式
- ✓ 处理键盘导航和可访问性

### Don't

- ✗ 在循环中创建菜单实例
- ✗ 使用 `pageX/Y` 坐标
- ✗ 忘记阻止默认右键菜单
- ✗ 硬编码颜色/间距值
- ✗ 在菜单中放置复杂业务逻辑
