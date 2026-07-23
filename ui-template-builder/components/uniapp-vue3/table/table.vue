<template>
  <view class="t-table" :class="{ 't-table--border': border, 't-table--stripe': stripe }">
    <!-- 表头 -->
    <view class="t-table__header">
      <view class="t-table__row">
        <view
          v-for="col in columns"
          :key="col.key"
          class="t-table__cell t-table__cell--header"
          :class="{ 't-table__cell--sortable': col.sortable }"
          :style="{ width: col.width, textAlign: col.align || 'left' }"
          @click="handleSort(col)"
        >
          <text>{{ col.title }}</text>
          <view v-if="col.sortable" class="t-table__sort-icon">
            <text
              :class="{
                't-table__sort-active': sortKey === col.key && sortOrder === 'asc'
              }"
            >↑</text>
            <text
              :class="{
                't-table__sort-active': sortKey === col.key && sortOrder === 'desc'
              }"
            >↓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 表体 -->
    <view class="t-table__body">
      <view
        v-for="(row, index) in displayData"
        :key="getRowKey(row) || index"
        class="t-table__row"
        :class="{
          't-table__row--selected': isSelected(row),
          't-table__row--hover': hoverable
        }"
        @click="handleRowClick(row, index)"
      >
        <view
          v-for="col in columns"
          :key="col.key"
          class="t-table__cell"
          :style="{ textAlign: col.align || 'left' }"
        >
          <!-- 插槽支持 -->
          <slot
            v-if="$slots[col.key]"
            :name="col.key"
            :row="row"
            :value="row[col.key]"
            :index="index"
          />
          <!-- 自定义渲染函数 -->
          <text v-else-if="col.render">{{ col.render(row[col.key], row) }}</text>
          <!-- 默认文本 -->
          <text v-else>{{ row[col.key] }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!displayData.length" class="t-table__empty">
        <text>{{ emptyText }}</text>
      </view>
    </view>

    <!-- 分页 -->
    <view v-if="pagination && total > 0" class="t-table__pagination">
      <view class="t-table__pagination-info">
        共 {{ total }} 条，第 {{ currentPage }}/{{ totalPage }} 页
      </view>
      <view class="t-table__pagination-btns">
        <view
          class="t-table__pagination-btn"
          :class="{ 't-table__pagination-btn--disabled': currentPage <= 1 }"
          @click="handlePrevPage"
        >
          上一页
        </view>
        <view
          class="t-table__pagination-btn"
          :class="{ 't-table__pagination-btn--disabled': currentPage >= totalPage }"
          @click="handleNextPage"
        >
          下一页
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    default: () => []
  },
  data: {
    type: Array,
    default: () => []
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  stripe: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: true
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  pagination: {
    type: Boolean,
    default: false
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentPageProp: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['sort', 'row-click', 'page-change', 'selection-change'])

// 排序状态
const sortKey = ref('')
const sortOrder = ref('')

// 分页状态
const currentPage = ref(props.currentPageProp)

// 选中行
const selectedRows = ref([])

// 计算总页数
const totalPage = computed(() => Math.ceil(props.data.length / props.pageSize))

// 计算总条数
const total = computed(() => props.data.length)

// 处理排序后的数据
const displayData = computed(() => {
  let result = [...props.data]

  // 排序
  if (sortKey.value && sortOrder.value) {
    result.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]

      if (sortOrder.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  // 分页
  if (props.pagination) {
    const start = (currentPage.value - 1) * props.pageSize
    const end = start + props.pageSize
    result = result.slice(start, end)
  }

  return result
})

// 获取行唯一标识
function getRowKey(row) {
  return row[props.rowKey]
}

// 排序
function handleSort(col) {
  if (!col.sortable) return

  if (sortKey.value === col.key) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else if (sortOrder.value === 'desc') {
      sortKey.value = ''
      sortOrder.value = ''
    } else {
      sortOrder.value = 'asc'
    }
  } else {
    sortKey.value = col.key
    sortOrder.value = 'asc'
  }

  emit('sort', { key: sortKey.value, order: sortOrder.value })
}

// 行点击
function handleRowClick(row, index) {
  emit('row-click', { row, index })
}

// 分页
function handlePrevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    emit('page-change', currentPage.value)
  }
}

function handleNextPage() {
  if (currentPage.value < totalPage.value) {
    currentPage.value++
    emit('page-change', currentPage.value)
  }
}

// 选中状态
function isSelected(row) {
  return selectedRows.value.some(r => r[props.rowKey] === row[props.rowKey])
}

// 选中/取消选中
function toggleSelect(row) {
  const index = selectedRows.value.findIndex(r => r[props.rowKey] === row[props.rowKey])
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(row)
  }
  emit('selection-change', selectedRows.value)
}

// 暴露方法
defineExpose({
  sort: (key, order) => {
    sortKey.value = key
    sortOrder.value = order
  },
  clearSort: () => {
    sortKey.value = ''
    sortOrder.value = ''
  },
  clearSelection: () => {
    selectedRows.value = []
  },
  getSelection: () => selectedRows.value,
  toggleSelect,
  currentPage,
  totalPage
})
</script>

<style lang="scss" scoped>
.t-table {
  width: 100%;
  background: var(--color-bg-surface, #fff);
  border-radius: var(--radius-card, 12px);
  overflow: hidden;
}

.t-table--border {
  border: 1px solid var(--color-border, #e5e7eb);
}

.t-table__header {
  background: var(--primary-50, #f9fafb);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.t-table__row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border-light, #f3f4f6);
}

.t-table__row:last-child {
  border-bottom: none;
}

.t-table__row--hover:hover {
  background: var(--color-bg-surface-hover, #f9fafb);
}

.t-table__row--selected {
  background: var(--primary-50, #f0f9ff);
}

.t-table__cell {
  flex: 1;
  padding: var(--card-padding-sm, 16px) var(--space-3, 12px);
  font-size: var(--text-sm, 14px);
  color: var(--color-text-primary, #111827);
}

.t-table__cell--header {
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
  background: transparent;
}

.t-table__cell--sortable {
  cursor: pointer;
  user-select: none;
}

.t-table__cell--sortable:active {
  background: var(--primary-100, #f3f4f6);
}

.t-table__sort-icon {
  display: inline-flex;
  flex-direction: column;
  margin-left: var(--space-1, 4px);
  font-size: 10px;
  line-height: 1.2;
  color: var(--color-text-tertiary, #9ca3af);
}

.t-table__sort-icon text {
  display: block;
}

.t-table__sort-active {
  color: var(--color-primary, #333);
}

.t-table__empty {
  padding: var(--space-10, 40px);
  text-align: center;
  color: var(--color-text-tertiary, #9ca3af);
}

.t-table__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border-top: 1px solid var(--color-border-light, #f3f4f6);
  background: var(--color-bg-surface-hover, #f9fafb);
}

.t-table__pagination-info {
  font-size: var(--text-sm, 14px);
  color: var(--color-text-secondary, #6b7280);
}

.t-table__pagination-btns {
  display: flex;
  gap: var(--space-2, 8px);
}

.t-table__pagination-btn {
  padding: var(--space-1, 4px) var(--space-3, 12px);
  font-size: var(--text-sm, 14px);
  color: var(--color-primary, #333);
  background: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
}

.t-table__pagination-btn:active {
  background: var(--color-bg-surface-active, #f3f4f6);
}

.t-table__pagination-btn--disabled {
  color: var(--color-text-disabled, #d1d5db);
  cursor: not-allowed;
  background: var(--color-bg-surface-hover, #f9fafb);
}

/* 斑马纹 */
.t-table--stripe .t-table__row:nth-child(even) {
  background: var(--color-bg-surface-hover, #f9fafb);
}

.t-table--stripe .t-table__row:nth-child(even):hover {
  background: var(--color-bg-surface-active, #f3f4f6);
}
</style>

<!-- 使用示例 -->
<!--
<template>
  <t-table
    :columns="columns"
    :data="tableData"
    row-key="id"
    stripe
    border
    :pagination="true"
    :page-size="10"
    @row-click="handleRowClick"
    @sort="handleSort"
  >
    <template #status="{ value }">
      <text :class="'status--' + value">{{ getStatusText(value) }}</text>
    </template>
  </t-table>
</template>

<script setup>
import { ref } from 'vue'
import TTable from '@/components/uniapp-vue3/table/table.vue'

const columns = ref([
  { key: 'name', title: '姓名', sortable: true },
  { key: 'age', title: '年龄', sortable: true, align: 'center' },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: '100px' }
])

const tableData = ref([
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com', status: 'pending' },
  { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', status: 'inactive' }
])

function handleRowClick({ row, index }) {
  console.log('点击行:', row, index)
}

function handleSort({ key, order }) {
  console.log('排序:', key, order)
}

function getStatusText(status) {
  const map = { active: '启用', pending: '待审', inactive: '禁用' }
  return map[status] || status
}
</script>
-->
