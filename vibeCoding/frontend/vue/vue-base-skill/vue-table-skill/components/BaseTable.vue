<template>
  <div
    class="base-table"
    :class="[
      `base-table--size-${size}`,
      { 'base-table--striped': striped },
      { 'base-table--bordered': bordered },
      { 'base-table--hover': hover },
    ]"
    role="table"
    :aria-rowcount="data.length"
  >
    <!-- 加载遮罩 -->
    <div v-if="loading" class="base-table__loading" role="status" :aria-label="loadingText">
      <span class="base-table__loading-dot" />
      <span class="base-table__loading-dot" />
      <span class="base-table__loading-dot" />
      <span class="base-table__loading-text">{{ loadingText }}</span>
    </div>

    <!-- 表头 -->
    <div class="base-table__header" role="rowgroup">
      <div class="base-table__row base-table__row--header" role="row">
        <div v-if="selectable" class="base-table__cell base-table__cell--checkbox" role="columnheader">
          <span
            :class="['base-table__checkbox', { 'base-table__checkbox--checked': isAllSelected, 'base-table__checkbox--indeterminate': isIndeterminate }]"
            role="checkbox"
            :aria-checked="isAllSelected ? 'true' : (isIndeterminate ? 'mixed' : 'false')"
            tabindex="0"
            @click="handleSelectAll"
            @keydown.enter.prevent="handleSelectAll"
            @keydown.space.prevent="handleSelectAll"
          />
        </div>
        <div
          v-for="col in displayColumns"
          :key="col.key"
          class="base-table__cell"
          :class="`base-table__cell--${col.align || 'left'}`"
          role="columnheader"
          :style="getCellStyle(col)"
        >
          {{ col.title }}
        </div>
      </div>
    </div>

    <!-- 表体 -->
    <div class="base-table__body" role="rowgroup">
      <template v-if="data.length === 0">
        <div class="base-table__empty">
          <slot name="empty">
            <span class="base-table__empty-text">{{ emptyText }}</span>
          </slot>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(row, index) in data"
          :key="getRowKey(row, index)"
          class="base-table__row base-table__row--data"
          :class="{ 'base-table__row--selected': isSelected(row) }"
          role="row"
          @click="emit('row-click', row, index)"
        >
          <div v-if="selectable" class="base-table__cell base-table__cell--checkbox" role="cell">
            <span
              :class="['base-table__checkbox', { 'base-table__checkbox--checked': isSelected(row) }]"
              role="checkbox"
              :aria-checked="isSelected(row) ? 'true' : 'false'"
              tabindex="0"
              @click.stop="handleSelect(row)"
              @keydown.enter.stop="handleSelect(row)"
              @keydown.space.stop.prevent="handleSelect(row)"
            />
          </div>
          <div
            v-for="col in displayColumns"
            :key="col.key"
            class="base-table__cell"
            :class="`base-table__cell--${col.align || 'left'}`"
            role="cell"
            :style="getCellStyle(col)"
          >
            <slot :name="`cell-${col.key}`" :row="row" :column="col" :index="index">
              <span v-if="col.render" class="base-table__cell-text">
                <component :is="col.render(row, index)" />
              </span>
              <span v-else class="base-table__cell-text">{{ row[col.key] }}</span>
            </slot>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import type { VNode } from 'vue'

// ponytail: 列定义只暴露基础形态,其他形态(固定列/排序/筛选/树形/虚拟滚动)作为未来扩展,props 类型已预留。
export interface BaseTableColumn<T = Record<string, unknown>> {
  key: string
  title: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (row: T, index: number) => VNode | string
}

export interface BaseTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: BaseTableColumn<T>[]
  loading?: boolean
  loadingText?: string
  empty?: string
  rowKey?: string
  selection?: (string | number)[]
  selectable?: boolean
  bordered?: boolean
  stripe?: boolean
  hover?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<BaseTableProps>(), {
  loading: false,
  loadingText: '加载中...',
  empty: '暂无数据',
  rowKey: 'id',
  selection: () => [],
  selectable: false,
  bordered: false,
  stripe: false,
  hover: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:selection': [keys: (string | number)[]]
  'selection-change': [keys: (string | number)[]]
  'row-click': [row: Record<string, unknown>, index: number]
}>()

const displayColumns = computed(() => props.columns)

function getRowKey(row: Record<string, unknown>, index: number): string | number {
  return (row?.[props.rowKey] ?? index) as string | number
}

function isSelected(row: Record<string, unknown>): boolean {
  const key = getRowKey(row, 0)
  return props.selection.includes(key)
}

const isAllSelected = computed(
  () => props.data.length > 0 && props.data.every((row) => isSelected(row as Record<string, unknown>))
)

const isIndeterminate = computed(() => {
  if (props.data.length === 0) return false
  const count = props.data.filter((row) => isSelected(row as Record<string, unknown>)).length
  return count > 0 && count < props.data.length
})

function handleSelectAll(): void {
  if (isAllSelected.value) {
    emit('update:selection', [])
    emit('selection-change', [])
  } else {
    const keys = props.data.map((row, i) => getRowKey(row as Record<string, unknown>, i))
    emit('update:selection', keys)
    emit('selection-change', keys)
  }
}

function handleSelect(row: Record<string, unknown>): void {
  const keys = [...props.selection]
  const key = getRowKey(row, 0)
  const idx = keys.indexOf(key)
  if (idx > -1) keys.splice(idx, 1)
  else keys.push(key)
  emit('update:selection', keys)
  emit('selection-change', keys)
}

function getCellStyle(col: BaseTableColumn): Record<string, string> {
  if (!col.width) return {}
  return { flex: `0 0 ${typeof col.width === 'number' ? `${col.width}px` : col.width}` }
}

// ponytail: h 引用保留以支持列 render 返回 VNode,即使当前未直接调用。
void h
</script>

<style scoped>
.base-table {
  position: relative;
  width: 100%;
  overflow: hidden;
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text, #303133);
}

.base-table__header,
.base-table__body {
  width: 100%;
}

.base-table__row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--color-border, #ebeef5);
  transition: background-color var(--transition-fast, 0.15s);
}

.base-table__row--header {
  background: var(--color-surface, #fafafa);
  font-weight: 600;
}

.base-table--hover .base-table__row--data:hover {
  background: var(--color-background, #f5f7fa);
}

.base-table--striped .base-table__row--data:nth-child(even) {
  background: var(--color-background, #f5f7fa);
}

.base-table--bordered {
  border: 1px solid var(--color-border, #ebeef5);
}

.base-table__cell {
  flex: 1;
  min-width: 0;
  padding: var(--space-3, 12px) var(--space-4, 16px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.base-table__cell--left { justify-content: flex-start; }
.base-table__cell--center { justify-content: center; }
.base-table__cell--right { justify-content: flex-end; }

.base-table__cell--checkbox {
  flex: 0 0 48px;
  justify-content: center;
}

.base-table__row--selected {
  background: var(--color-primary-light, #ecf5ff);
}

.base-table__cell-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 自定义复选框（零 input） */
.base-table__checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-sm, 2px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
  position: relative;
}

.base-table__checkbox:hover {
  border-color: var(--color-primary, #409eff);
}

.base-table__checkbox:focus-visible {
  outline: 2px solid var(--color-primary, #409eff);
  outline-offset: 2px;
}

.base-table__checkbox--checked,
.base-table__checkbox--indeterminate {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
}

.base-table__checkbox--checked::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}

.base-table__checkbox--indeterminate::after {
  content: '';
  width: 8px;
  height: 2px;
  background: #fff;
  border-radius: 1px;
}

/* 加载遮罩 */
.base-table__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2, 8px);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  z-index: 10;
  color: var(--color-primary, #409eff);
}

.base-table__loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: base-table-bounce 1.4s infinite ease-in-out both;
}
.base-table__loading-dot:nth-child(2) { animation-delay: -0.16s; }
.base-table__loading-dot:nth-child(3) { animation-delay: -0.32s; }

.base-table__loading-text {
  margin-left: var(--space-2, 8px);
  color: var(--color-text-secondary, #606266);
  font-size: var(--font-size-sm, 14px);
}

@keyframes base-table-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 空状态 */
.base-table__empty {
  padding: var(--space-8, 32px) var(--space-4, 16px);
  text-align: center;
  color: var(--color-text-placeholder, #909399);
  font-size: var(--font-size-sm, 14px);
}

/* 尺寸 */
.base-table--size-sm .base-table__cell { padding: var(--space-2, 8px) var(--space-3, 12px); font-size: var(--font-size-xs, 12px); }
.base-table--size-lg .base-table__cell { padding: var(--space-4, 16px) var(--space-5, 20px); font-size: var(--font-size-base, 16px); }
</style>
