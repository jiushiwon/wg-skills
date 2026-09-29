# BaseTree —— 树形菜单

> 节点渲染 = `base-list-item`（4 槽位复用），业务只关心 `TreeNode` 数据契约 + 8 个 prop 开关。

## 组件层级

```
base-card                ← 容器（L0）
└─ base-tree             ← 树形菜单（L1，本组件）
   └─ base-list-item     ← 节点渲染（L1，依赖）
      ↳ 右键弹 base-contextmenu
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `TreeNode[]` | `[]` | 树数据（必填） |
| `variant` | `string` | `'basic'` | 继承自 list-item：basic / finder / win / vscode / admin / notion / nav |
| `checkbox` | `boolean` | `false` | 显示复选框（形态 2） |
| `lazy` | `boolean` | `false` | 懒加载模式（形态 3） |
| `load` | `(node) => Promise<TreeNode[]>` | — | 懒加载回调 |
| `draggable` | `boolean` | `false` | 可拖拽（形态 4） |
| `search` | `string` | `''` | 搜索关键字（形态 6） |
| `filterNode` | `(keyword, node) => boolean` | — | 自定义过滤 |
| `editable` | `boolean` | `false` | 节点可编辑（形态 7） |
| `defaultExpandAll` | `boolean` | `false` | 默认全部展开 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `select` | `(node: TreeNode)` | 节点点击 |
| `contextmenu` | `(node, event)` | 右键节点（联动 contextmenu-skill） |
| `toggle` | `(node)` | 展开/折叠 |
| `check` | `(checked, halfChecked)` | 复选框变化 |
| `drop` | `(dragNode, dropNode, type)` | 拖拽完成 |
| `update:node` | `(node)` | 编辑节点 |

## Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 自定义节点内容（不推荐，破坏 list-item 抽象） |
| `node-{id}` | 单节点自定义 |

## 完整组件实现

```vue
<template>
  <div class="base-tree">
    <base-list-item
      v-for="node in visibleData"
      :key="node.id"
      :item="toListItem(node)"
      :variant="variant"
      :open="node.open"
      :indent="0"
      @select="onSelect(node, $event)"
      @contextmenu="onContextMenu(node, $event)"
      @toggle="onToggle(node)"
    >
      <!-- 复选框槽位 -->
      <template v-if="checkbox" #icon>
        <div
          class="tree-checkbox"
          :class="checkboxClass(node)"
          @click.stop="onCheck(node)"
        />
      </template>

      <!-- 搜索高亮 -->
      <template v-if="search && matchNode(node, search)" #label>
        <span v-html="highlight(node.label, search)" />
      </template>

      <!-- 节点编辑 -->
      <template v-else-if="editingId === node.id" #label>
        <input
          v-model="editValue"
          class="tree-edit-input"
          @blur="commitEdit(node)"
          @keydown.enter="commitEdit(node)"
        />
      </template>

      <!-- 拖拽手柄 -->
      <template v-if="draggable" #meta>
        <span class="tree-handle" @mousedown.stop="startDrag(node)">⋮⋮</span>
      </template>
    </base-list-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseListItem from '@/components/BaseListItem.vue'
import type { ListItem } from '@/components/BaseListItem.vue'
import type { TreeNode } from './types'

const props = withDefaults(defineProps<{
  data: TreeNode[]
  variant?: 'basic' | 'finder' | 'win' | 'vscode' | 'admin' | 'notion' | 'nav'
  checkbox?: boolean
  lazy?: boolean
  load?: (node: TreeNode) => Promise<TreeNode[]>
  draggable?: boolean
  search?: string
  filterNode?: (kw: string, node: TreeNode) => boolean
  editable?: boolean
  defaultExpandAll?: boolean
}>(), {
  variant: 'basic',
  checkbox: false,
  lazy: false,
  draggable: false,
  search: '',
  editable: false,
  defaultExpandAll: false
})

const emit = defineEmits<{
  (e: 'select', node: TreeNode): void
  (e: 'contextmenu', node: TreeNode, event: MouseEvent): void
  (e: 'toggle', node: TreeNode): void
  (e: 'check', checked: TreeNode[], half: TreeNode[]): void
  (e: 'drop', drag: TreeNode, drop: TreeNode, type: 'before' | 'after' | 'inner'): void
  (e: 'update:node', node: TreeNode): void
}>()

// ListItem 适配（TreeNode → ListItem）
function toListItem(node: TreeNode): ListItem {
  return {
    id: node.id,
    label: node.label,
    icon: node.icon,
    meta: node.meta,
    badge: node.badge,
    disabled: node.disabled,
    open: props.defaultExpandAll ? true : node.open,
    children: node.children?.map(toListItem)
  }
}

// 搜索过滤
const visibleData = computed(() => {
  if (!props.search) return props.data
  return filterTree(props.data, props.search)
})

function filterTree(nodes: TreeNode[], kw: string): TreeNode[] {
  return nodes.reduce((acc, n) => {
    const match = props.filterNode ? props.filterNode(kw, n) : n.label.includes(kw)
    const children = n.children ? filterTree(n.children, kw) : []
    if (match || children.length) {
      acc.push({ ...n, children, open: true })
    }
    return acc
  }, [] as TreeNode[])
}

// 事件
function onSelect(node: TreeNode) {
  if (props.editable) startEdit(node)
  else emit('select', node)
}

function onContextMenu(node: TreeNode, event: MouseEvent) {
  emit('contextmenu', node, event)
}

function onToggle(node: TreeNode) {
  if (props.lazy && !node.children?.length) {
    props.load?.(node).then(children => {
      node.children = children
      node.open = true
    })
  } else {
    node.open = !node.open
    emit('toggle', node)
  }
}

// 复选框状态
const checkedSet = ref<Set<string>>(new Set())
function checkboxClass(node: TreeNode) {
  if (checkedSet.value.has(node.id)) return 'is-checked'
  const half = isHalfChecked(node)
  return half ? 'is-indeterminate' : ''
}

// 拖拽
function startDrag(node: TreeNode) {
  // 简化实现：业务可替换为 vuedraggable / SortableJS
  emit('drop', node, node, 'inner')
}

// 编辑
const editingId = ref<string>('')
const editValue = ref('')
function startEdit(node: TreeNode) {
  editingId.value = node.id
  editValue.value = node.label
}
function commitEdit(node: TreeNode) {
  if (editingId.value && editValue.value) {
    node.label = editValue.value
    emit('update:node', node)
  }
  editingId.value = ''
}
</script>
```

## 与 vue-contextmenu-skill 联动

```vue
<template>
  <base-card title="文件树">
    <base-tree
      :data="files"
      @select="onSelectNode"
      @contextmenu="onRightClick"
    />

    <base-contextmenu
      v-model:visible="ctxVisible"
      :x="ctxX" :y="ctxY"
      :options="ctxOptions"
      @select="onCtxCommand"
    />
  </base-card>
</template>
```

## 反例 vs 正例

```vue
<!-- ❌ 严禁：脱离 base-list-item 重新实现节点 -->
<template>
  <div class="my-tree">
    <div v-for="n in data" :key="n.id">
      <span class="arrow">{{ n.open ? '▼' : '▶' }}</span>
      <span class="icon">{{ n.icon }}</span>
      <span class="label">{{ n.label }}</span>
    </div>
  </div>
</template>
```

```vue
<!-- ✅ 正确：节点渲染 = base-list-item，业务只关心数据 + 事件 -->
<template>
  <base-card title="组织架构">
    <base-tree :data="orgData" @select="onSelect" @contextmenu="onCtx" />
  </base-card>
</template>
```

## 文件结构

```
vue-tree-skill/
├── SKILL.md
├── README.md
├── base-tree.md                    # 本文件
└── demo-components/
    ├── shared/
    │   ├── tokens.css
    │   ├── list-item.css
    │   ├── demo.css
    │   └── tree.css                 # 树专属（复选框 / 拖拽手柄 / 高亮）
    └── base-tree/
        ├── html/
        │   └── 00-showcase.html     # 单一 showcase
        └── screenshots/
            └── 00-showcase.png
```