<template>
  <ul class="base-tree" :class="`base-tree--${size}`" role="tree">
    <BaseTreeNode
      v-for="node in data"
      :key="String(node[nodeKey])"
      :node="node"
      :node-key="nodeKey"
      :level="0"
      :show-checkbox="showCheckbox"
      :check-strictly="checkStrictly"
      :default-expand-all="defaultExpandAll"
      :expand-on-click-node="expandOnClickNode"
      :checked-keys="checkedKeys"
      :indeterminate-keys="indeterminateKeys"
      @toggle="onToggle"
      @select="onSelect"
      @check="onCheck"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template>
    </BaseTreeNode>
  </ul>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseTreeNode from './BaseTreeNode.vue'
import type { TreeNode } from './BaseTreeNode.vue'

// ponytail: 仅实现基础树 + 复选框形态。懒加载/拖拽/编辑/搜索/右键菜单 作为 props 预留但不实现。
export interface BaseTreeProps {
  data: TreeNode[]
  nodeKey?: string
  showCheckbox?: boolean
  defaultExpandAll?: boolean
  expandOnClickNode?: boolean
  checkStrictly?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<BaseTreeProps>(), {
  nodeKey: 'id',
  showCheckbox: false,
  defaultExpandAll: false,
  expandOnClickNode: true,
  checkStrictly: false,
  size: 'md',
})

const emit = defineEmits<{
  'node-click': [node: TreeNode]
  'check-change': [checkedKeys: (string | number)[], node: TreeNode]
  'expand-change': [node: TreeNode, expanded: boolean]
  'update:checkedKeys': [keys: (string | number)[]]
}>()

const checkedKeys = ref<(string | number)[]>([])
const indeterminateKeys = ref<(string | number)[]>([])

function flatten(nodes: TreeNode[]): TreeNode[] {
  const out: TreeNode[] = []
  for (const n of nodes) {
    out.push(n)
    if (n.children?.length) out.push(...flatten(n.children))
  }
  return out
}

const flatList = computed(() => flatten(props.data))

function computeCheckState(): void {
  if (props.checkStrictly) return
  // ponytail: 父子联动 — 子全选则父自动选;父选则子全选。indeterminate 用作半选展示。
  const map = new Map<string | number, TreeNode>()
  for (const n of flatList.value) map.set(n[props.nodeKey] as string | number, n)
  const checkedSet = new Set(checkedKeys.value)
  const half: (string | number)[] = []
  for (const n of props.data) syncDown(n, checkedSet)
  for (const n of flatList.value) syncUp(n, checkedSet, half)
  checkedKeys.value = [...checkedSet]
  indeterminateKeys.value = half
}

function syncDown(node: TreeNode, set: Set<string | number>): void {
  const key = node[props.nodeKey] as string | number
  const allChildren = node.children?.length ? node.children : null
  if (!allChildren) return
  const allChecked = allChildren.every((c) => set.has(c[props.nodeKey] as string | number))
  if (allChecked) set.add(key)
  else set.delete(key)
  for (const c of allChildren) syncDown(c, set)
}

function syncUp(node: TreeNode, set: Set<string | number>, half: (string | number)[]): void {
  if (!node.children?.length) return
  const childKeys = node.children.map((c) => c[props.nodeKey] as string | number)
  const all = childKeys.every((k) => set.has(k))
  const none = childKeys.every((k) => !set.has(k))
  const k = node[props.nodeKey] as string | number
  if (all) {
    set.add(k)
    const idx = half.indexOf(k)
    if (idx > -1) half.splice(idx, 1)
  } else if (none) {
    set.delete(k)
    const idx = half.indexOf(k)
    if (idx > -1) half.splice(idx, 1)
  } else {
    half.push(k)
  }
  for (const c of node.children) syncUp(c, set, half)
}

watch(
  () => props.data,
  () => computeCheckState(),
  { immediate: true }
)

function onToggle(node: TreeNode): void {
  node.open = !(node.open ?? false)
  emit('expand-change', node, node.open ?? false)
}

function onSelect(node: TreeNode): void {
  emit('node-click', node)
}

function onCheck(node: TreeNode, checked: boolean): void {
  const key = node[props.nodeKey] as string | number
  const set = new Set(checkedKeys.value)
  toggleCheck(node, checked, set)
  checkedKeys.value = [...set]
  emit('update:checkedKeys', checkedKeys.value)
  emit('check-change', checkedKeys.value, node)
  computeCheckState()
}

function toggleCheck(node: TreeNode, checked: boolean, set: Set<string | number>): void {
  const key = node[props.nodeKey] as string | number
  if (checked) set.add(key)
  else set.delete(key)
  if (props.checkStrictly) return
  if (node.children?.length) {
    for (const c of node.children) toggleCheck(c, checked, set)
  }
}
</script>

<style scoped>
.base-tree {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--font-size-base, 14px);
  color: var(--color-text, #303133);
}

.base-tree--sm { font-size: var(--font-size-sm, 13px); }
</style>
