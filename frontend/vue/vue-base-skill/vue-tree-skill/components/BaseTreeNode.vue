<template>
  <li
    class="base-tree-node"
    role="treeitem"
    :aria-expanded="hasChildren ? isOpen : undefined"
    :aria-disabled="node.disabled || undefined"
    :aria-selected="undefined"
  >
    <div
      class="base-tree-node__content"
      :class="{
        'base-tree-node__content--disabled': node.disabled,
        'is-leaf': !hasChildren,
      }"
      :style="{ paddingLeft: `${level * 16 + 8}px` }"
      @click="handleClick"
    >
      <span
        v-if="hasChildren"
        class="base-tree-node__expand"
        :class="{ 'is-open': isOpen }"
        role="button"
        :aria-label="isOpen ? '收起' : '展开'"
        tabindex="0"
        @click.stop="toggle"
        @keydown.enter.stop.prevent="toggle"
      >
        <span class="base-tree-node__expand-shape" />
      </span>
      <span v-else class="base-tree-node__expand base-tree-node__expand--leaf" />

      <span
        v-if="showCheckbox"
        class="base-tree-node__checkbox"
        :class="checkboxClass"
        role="checkbox"
        :aria-checked="isChecked ? 'true' : isIndeterminate ? 'mixed' : 'false'"
        tabindex="0"
        @click.stop="handleCheck"
        @keydown.enter.stop.prevent="handleCheck"
        @keydown.space.stop.prevent="handleCheck"
      />

      <span class="base-tree-node__label">
        <slot :node="node">{{ node.label }}</slot>
      </span>
    </div>

    <ul v-if="hasChildren && isOpen" role="group" class="base-tree-node__children">
      <BaseTreeNode
        v-for="child in node.children"
        :key="String(child[nodeKey])"
        :node="child"
        :node-key="nodeKey"
        :level="level + 1"
        :show-checkbox="showCheckbox"
        :check-strictly="checkStrictly"
        :default-expand-all="defaultExpandAll"
        :expand-on-click-node="expandOnClickNode"
        :checked-keys="checkedKeys"
        :indeterminate-keys="indeterminateKeys"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
        @check="(n: TreeNode, c: boolean) => $emit('check', n, c)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TreeNode {
  id?: string | number
  [key: string]: unknown
  label: string
  children?: TreeNode[]
  disabled?: boolean
  open?: boolean
}

export interface BaseTreeNodeProps {
  node: TreeNode
  nodeKey: string
  level: number
  showCheckbox: boolean
  checkStrictly: boolean
  defaultExpandAll: boolean
  expandOnClickNode: boolean
  checkedKeys: (string | number)[]
  indeterminateKeys: (string | number)[]
}

const props = defineProps<BaseTreeNodeProps>()

const emit = defineEmits<{
  toggle: [node: TreeNode]
  select: [node: TreeNode]
  check: [node: TreeNode, checked: boolean]
}>()

const hasChildren = computed(() => !!props.node.children && props.node.children.length > 0)

const isOpen = computed(() => props.defaultExpandAll || !!props.node.open)

const isChecked = computed(() => props.checkedKeys.includes(props.node[props.nodeKey] as string | number))

const isIndeterminate = computed(
  () => !isChecked.value && props.indeterminateKeys.includes(props.node[props.nodeKey] as string | number)
)

const checkboxClass = computed(() => ({
  'is-checked': isChecked.value,
  'is-indeterminate': isIndeterminate.value,
}))

function toggle(): void {
  emit('toggle', props.node)
}

function handleClick(): void {
  if (props.node.disabled) return
  emit('select', props.node)
  if (props.expandOnClickNode && hasChildren.value) toggle()
}

function handleCheck(): void {
  if (props.node.disabled) return
  emit('check', props.node, !isChecked.value)
}
</script>

<style scoped>
.base-tree-node {
  list-style: none;
}

.base-tree-node__content {
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: 0 var(--space-2, 8px);
  min-height: var(--height-input-md, 32px);
  border-radius: var(--radius-sm, 2px);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition-fast, 0.15s);
}

.base-tree-node__content:hover {
  background: var(--color-background, #f5f7fa);
}

.base-tree-node__content--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-tree-node__expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.base-tree-node__expand:not(.base-tree-node__expand--leaf) {
  cursor: pointer;
  border-radius: var(--radius-sm, 2px);
}

.base-tree-node__expand:not(.base-tree-node__expand--leaf):hover {
  background: var(--color-border, #ebeef5);
}

.base-tree-node__expand-shape {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid var(--color-text-secondary, #606266);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  transition: transform var(--transition-fast, 0.15s);
}

.base-tree-node__expand.is-open .base-tree-node__expand-shape {
  transform: rotate(90deg);
}

.base-tree-node__expand--leaf {
  visibility: hidden;
}

.base-tree-node__checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-sm, 2px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast, 0.15s);
  position: relative;
}

.base-tree-node__checkbox:hover {
  border-color: var(--color-primary, #409eff);
}

.base-tree-node__checkbox:focus-visible {
  outline: 2px solid var(--color-primary, #409eff);
  outline-offset: 2px;
}

.base-tree-node__checkbox.is-checked,
.base-tree-node__checkbox.is-indeterminate {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
}

.base-tree-node__checkbox.is-checked::after {
  content: '';
  width: 3px;
  height: 7px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}

.base-tree-node__checkbox.is-indeterminate::after {
  content: '';
  width: 7px;
  height: 2px;
  background: #fff;
  border-radius: 1px;
}

.base-tree-node__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-tree-node__children {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
