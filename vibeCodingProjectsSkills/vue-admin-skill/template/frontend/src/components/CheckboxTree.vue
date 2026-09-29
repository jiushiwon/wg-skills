<!--
  CheckboxTree —— 受控复选树（角色「分配菜单」/ 用户「分配角色」共用）

  数据契约见 `types/tree.d.ts` 的 CheckboxTreeNode（全局类型，页面免导入）。

  为什么不用 vue-tree-skill 的 base-tree？
  base-tree@1.0.0 的勾选状态是组件内部 ref（checkedKeys），对外没有可写的
  checkedKeys / modelValue 属性，无法把后端回填的「当前已选 id」预先勾上。
  而分配类弹窗必须回显已选值，否则点确定会把已有分配**覆盖清空**，
  所以这里用 base-checkbox 组装一个受控复选树（v-model 双向绑定 id 列表）。
  → 上游修复建议：给 vue-tree-skill 的 base-tree 增加受控的 checkedKeys 属性。
-->
<script setup lang="ts">
import { computed } from 'vue'
import { BaseCheckbox } from 'vue-checkbox-skill'

const props = defineProps<{
  nodes: CheckboxTreeNode[]
  /** 已选 id 列表（受控值） */
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [ids: number[]]
}>()

interface FlatRow {
  id: number
  name: string
  depth: number
}

const rows = computed<FlatRow[]>(() => {
  const out: FlatRow[] = []
  const walk = (list: CheckboxTreeNode[], depth: number): void => {
    list.forEach((node) => {
      out.push({ id: node.id, name: node.name, depth })
      if (node.children?.length) walk(node.children, depth + 1)
    })
  }
  walk(props.nodes, 0)
  return out
})

const nodeIndex = computed(() => {
  const map = new Map<number, CheckboxTreeNode>()
  const walk = (list: CheckboxTreeNode[]): void => {
    list.forEach((node) => {
      map.set(node.id, node)
      if (node.children?.length) walk(node.children)
    })
  }
  walk(props.nodes)
  return map
})

/** 某个节点的全部子孙 id */
function subtreeIds(id: number): number[] {
  const node = nodeIndex.value.get(id)
  if (!node?.children?.length) return []
  return node.children.flatMap((child) => [child.id, ...subtreeIds(child.id)])
}

/** 自底向上同步父节点：子节点全选则父选中，否则父取消 */
function syncAncestors(list: CheckboxTreeNode[], selected: Set<number>): void {
  list.forEach((node) => {
    if (!node.children?.length) return
    syncAncestors(node.children, selected)
    if (node.children.every((child) => selected.has(child.id))) selected.add(node.id)
    else selected.delete(node.id)
  })
}

function toggle(id: number): void {
  const selected = new Set(props.modelValue)
  if (selected.has(id)) {
    selected.delete(id)
    subtreeIds(id).forEach((childId) => selected.delete(childId))
  } else {
    selected.add(id)
    subtreeIds(id).forEach((childId) => selected.add(childId))
  }
  syncAncestors(props.nodes, selected)
  emit('update:modelValue', [...selected])
}
</script>

<template>
  <div class="checkbox-tree">
    <div
      v-for="row in rows"
      :key="row.id"
      class="checkbox-tree__row"
      :style="{ paddingLeft: row.depth * 20 + 'px' }"
    >
      <base-checkbox
        :model-value="modelValue.includes(row.id)"
        :label="row.name"
        @change="toggle(row.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.checkbox-tree {
  max-height: 320px;
  overflow-y: auto;
}
.checkbox-tree__row {
  padding-block: var(--space-1);
}
</style>
