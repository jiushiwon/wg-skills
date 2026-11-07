---
name: vue-list-page-skill
description: Vue3 列表页组件技能，提供 base-list-page 组件。触发词："Vue 列表页"、"vue-list-page"、"列表筛选页"、"管理列表"。
---

# Vue List Page Skill

> **容器原则**：必须嵌入 `<base-card>` 使用  
> **零 HTML5 标签**：使用 `<div role="grid">` + ARIA 实现表格

列表页组件，详细规范见 [base-list-page.md](base-list-page.md)

## 引用组件

- `vue-input-skill` - 输入框
- `vue-select-skill` - 选择器
- `vue-datepicker-skill` - 日期选择器
- `vue-table-skill` - 表格

## 使用方式

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseListPage } from './components/BaseListPage';

const columns = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'email', label: '邮箱' },
  { prop: 'status', label: '状态', width: 80 },
  { prop: 'createdAt', label: '创建时间', width: 180 },
];

const searchFields = [
  { type: 'input', key: 'name', placeholder: '请输入姓名' },
  { type: 'select', key: 'status', placeholder: '请选择状态', options: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ]},
  { type: 'datepicker', key: 'date', placeholder: '选择日期' },
];

const data = ref([]);
const loading = ref(false);
const pagination = ref({ page: 1, pageSize: 10, total: 0 });

async function loadData(params: any) {
  loading.value = true;
  // 模拟 API
  await new Promise(r => setTimeout(r, 500));
  data.value = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', status: 1, createdAt: '2024-01-15 10:30:00' },
    { id: 2, name: '李四', email: 'lisi@example.com', status: 0, createdAt: '2024-01-14 09:20:00' },
  ];
  pagination.value.total = 100;
  loading.value = false;
}
</script>

<template>
  <BaseListPage
    :columns="columns"
    :search-fields="searchFields"
    :data="data"
    :loading="loading"
    :pagination="pagination"
    @search="loadData"
    @reset="loadData"
    @page-change="loadData"
  />
</template>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `Column[]` | `[]` | 表格列配置 |
| searchFields | `SearchField[]` | `[]` | 搜索字段配置 |
| data | `any[]` | `[]` | 表格数据 |
| loading | `boolean` | `false` | 加载状态 |
| pagination | `Pagination` | - | 分页配置 |
| showSearch | `boolean` | `true` | 是否显示搜索区 |
| showPagination | `boolean` | `true` | 是否显示分页 |
| searchBtnText | `string` | `'搜索'` | 搜索按钮文字 |
| resetBtnText | `string` | `'重置'` | 重置按钮文字 |

## Types

```typescript
// 列配置
interface Column {
  prop: string;
  label: string;
  width?: number;
  fixed?: 'left' | 'right';
  formatter?: (row: any, column: Column, cell: any) => string;
}

// 搜索字段
interface SearchField {
  type: 'input' | 'select' | 'datepicker' | 'daterange';
  key: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
  props?: Record<string, any>;
}

// 分页
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pageSizes?: number[];
}
```

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| search | `(params: object)` | 点击搜索 |
| reset | `()` | 点击重置 |
| page-change | `(page: number, pageSize: number)` | 分页变化 |
| size-change | `(pageSize: number)` | 每页数量变化 |

## 组件代码

### BaseListPage.vue

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { BaseInput } from 'vue-input-skill';
import { BaseSelect } from 'vue-select-skill';
import { BaseDatePicker } from 'vue-datepicker-skill';
import type { Column, SearchField, Pagination } from './types/list-page';
import './styles.css';

interface Props {
  columns?: Column[];
  searchFields?: SearchField[];
  data?: any[];
  loading?: boolean;
  pagination?: Pagination;
  showSearch?: boolean;
  showPagination?: boolean;
  searchBtnText?: string;
  resetBtnText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  searchFields: () => [],
  data: () => [],
  loading: false,
  pagination: () => ({ page: 1, pageSize: 10, total: 0 }),
  showSearch: true,
  showPagination: true,
  searchBtnText: '搜索',
  resetBtnText: '重置',
});

const emit = defineEmits<{
  search: [params: object];
  reset: [];
  'page-change': [page: number, pageSize: number];
  'size-change': [pageSize: number];
}>();

const searchParams = ref<Record<string, any>>({});
const localPagination = ref({ ...props.pagination });

// 初始化搜索参数
props.searchFields.forEach(field => {
  searchParams.value[field.key] = '';
});

// 搜索
function handleSearch() {
  localPagination.value.page = 1;
  emit('search', { ...searchParams.value, ...localPagination.value });
}

// 重置
function handleReset() {
  Object.keys(searchParams.value).forEach(key => {
    searchParams.value[key] = '';
  });
  localPagination.value.page = 1;
  emit('reset');
}

// 分页变化
function handlePageChange(page: number) {
  localPagination.value.page = page;
  emit('page-change', page, localPagination.value.pageSize);
}

// 每页数量变化
function handleSizeChange(size: number) {
  localPagination.value.pageSize = size;
  localPagination.value.page = 1;
  emit('size-change', size);
  emit('page-change', 1, size);
}

// 渲染搜索字段
function renderSearchField(field: SearchField) {
  const model = computed({
    get: () => searchParams.value[field.key],
    set: (val) => { searchParams.value[field.key] = val; }
  });

  switch (field.type) {
    case 'input':
      return h(BaseInput, {
        modelValue: model.value,
        'onUpdate:modelValue': (val: any) => { searchParams.value[field.key] = val; },
        placeholder: field.placeholder,
        clearable: true,
        ...field.props,
      });
    case 'select':
      return h(BaseSelect, {
        modelValue: model.value,
        'onUpdate:modelValue': (val: any) => { searchParams.value[field.key] = val; },
        placeholder: field.placeholder,
        options: field.options || [],
        clearable: true,
        ...field.props,
      });
    case 'datepicker':
      return h(BaseDatePicker, {
        modelValue: model.value,
        'onUpdate:modelValue': (val: any) => { searchParams.value[field.key] = val; },
        placeholder: field.placeholder,
        ...field.props,
      });
    default:
      return null;
  }
}
</script>

<template>
  <div class="base-list-page">
    <!-- 搜索区 -->
    <div v-if="showSearch && searchFields.length" class="base-list-page__search">
      <div class="base-list-page__search-fields">
        <div
          v-for="field in searchFields"
          :key="field.key"
          class="base-list-page__search-field"
        >
          <component :is="renderSearchField(field)" :is="getFieldComponent(field.type)" v-model="searchParams[field.key]" v-bind="field.props" />
        </div>
      </div>
      <div class="base-list-page__search-btns">
        <span class="base-list-page__btn base-list-page__btn--primary" role="button" tabindex="0" @click="handleSearch" @keydown.enter="handleSearch">
          {{ searchBtnText }}
        </span>
        <span class="base-list-page__btn" role="button" tabindex="0" @click="handleReset" @keydown.enter="handleReset">
          {{ resetBtnText }}
        </span>
      </div>
    </div>

    <!-- 表格区 -->
    <div v-if="loading" class="base-list-page__loading">
      加载中...
    </div>
    <div class="base-table" role="grid">
      <div class="base-table__head" role="row">
        <div
          v-for="col in columns"
          :key="col.prop"
          class="base-table__th"
          :style="{ width: col.width + 'px' }"
          role="columnheader"
        >
          {{ col.label }}
        </div>
      </div>
      <div class="base-table__body">
        <div
          v-for="(row, idx) in data"
          :key="idx"
          class="base-table__row"
          role="row"
        >
          <div
            v-for="col in columns"
            :key="col.prop"
            class="base-table__td"
            role="gridcell"
          >
            {{ col.formatter ? col.formatter(row, col, row[col.prop]) : row[col.prop] }}
          </div>
        </div>
        <div v-if="!data.length" class="base-list-page__empty">
          暂无数据
        </div>
      </div>
    </div>

    <!-- 分页区 -->
    <div v-if="showPagination" class="base-list-page__pagination">
      <span class="base-list-page__total">共 {{ pagination.total }} 条</span>
      <div class="base-list-page__pages">
        <span
          class="base-list-page__page-btn"
          :class="{ 'is-disabled': localPagination.page <= 1 }"
          role="button"
          tabindex="0"
          @click="handlePageChange(localPagination.page - 1)"
          @keydown.enter="handlePageChange(localPagination.page - 1)"
        >
          上一页
        </span>
        <span class="base-list-page__page-current">{{ localPagination.page }}</span>
        <span
          class="base-list-page__page-btn"
          :class="{ 'is-disabled': localPagination.page * localPagination.pageSize >= pagination.total }"
          role="button"
          tabindex="0"
          @click="handlePageChange(localPagination.page + 1)"
          @keydown.enter="handlePageChange(localPagination.page + 1)"
        >
          下一页
        </span>
      </div>
      <div class="base-list-page__size-select" role="listbox">
        <div
          v-for="size in [10, 20, 50]"
          :key="size"
          class="base-list-page__size-option"
          :class="{ 'is-active': localPagination.pageSize === size }"
          role="option"
          :aria-selected="localPagination.pageSize === size"
          @click="handleSizeChange(size)"
        >
          {{ size }} 条/页
        </div>
      </div>
    </div>
  </div>
</template>
```

### styles.css

```css
.base-list-page {
  background: var(--color-surface, #fff);
  border-radius: 8px;
  padding: 20px;
}

.base-list-page__search {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
  margin-bottom: 16px;
}

.base-list-page__search-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
}

.base-list-page__search-field {
  min-width: 200px;
}

.base-list-page__search-btns {
  display: flex;
  gap: 8px;
  align-items: center;
}

.base-list-page__btn {
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: 4px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.base-list-page__btn:hover {
  border-color: var(--color-primary, #409eff);
  color: var(--color-primary, #409eff);
}

.base-list-page__btn--primary {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
  color: var(--color-surface, #fff);
}

.base-list-page__btn--primary:hover {
  background: var(--color-primary-light, #a0cfff);
  border-color: var(--color-primary-light, #a0cfff);
  color: var(--color-surface, #fff);
}

/* 表格 */
.base-table {
  width: 100%;
  border-collapse: collapse;
}

.base-table th,
.base-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.base-table th {
  background: var(--color-bg-secondary, #f5f7fa);
  font-weight: 500;
  color: var(--color-text, #606266);
}

.base-table tbody tr:hover {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-list-page__empty {
  text-align: center;
  color: var(--color-text-secondary, #909399);
  padding: 40px !important;
}

.base-list-page__loading {
  text-align: center;
  color: var(--color-primary, #409eff);
  padding: 20px;
}

/* 分页 */
.base-list-page__pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border, #e4e7ed);
}

.base-list-page__total {
  color: var(--color-text, #606266);
  font-size: 14px;
}

.base-list-page__pages {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-list-page__page-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: 4px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: 14px;
}

.base-list-page__page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-list-page__page-current {
  padding: 6px 12px;
  background: var(--color-primary, #409eff);
  color: var(--color-surface, #fff);
  border-radius: 4px;
}

.base-list-page__size-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: 4px;
}
```

## 使用示例

### 完整示例

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseListPage } from './components/BaseListPage';

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'email', label: '邮箱' },
  { prop: 'gender', label: '性别', width: 80, formatter: (row) => row.gender === 1 ? '男' : '女' },
  { prop: 'status', label: '状态', width: 80, formatter: (row) => row.status ? '启用' : '禁用' },
  { prop: 'createdAt', label: '创建时间', width: 180 },
];

const searchFields = [
  { type: 'input', key: 'name', placeholder: '请输入姓名' },
  { type: 'input', key: 'email', placeholder: '请输入邮箱' },
  { type: 'select', key: 'gender', placeholder: '请选择性别', options: [
    { label: '男', value: 1 },
    { label: '女', value: 0 },
  ]},
  { type: 'select', key: 'status', placeholder: '请选择状态', options: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ]},
  { type: 'datepicker', key: 'startDate', placeholder: '开始日期' },
  { type: 'datepicker', key: 'endDate', placeholder: '结束日期' },
];

const data = ref([]);
const loading = ref(false);
const pagination = ref({ page: 1, pageSize: 10, total: 0 });

async function loadData(params: any) {
  loading.value = true;
  try {
    // 模拟 API
    await new Promise(r => setTimeout(r, 500));
    data.value = Array.from({ length: 10 }, (_, i) => ({
      id: (params.page - 1) * params.pageSize + i + 1,
      name: `用户${i + 1}`,
      email: `user${i + 1}@example.com`,
      gender: i % 2,
      status: i % 3 === 0 ? 1 : 0,
      createdAt: '2024-01-15 10:30:00',
    }));
    pagination.value.total = 100;
  } finally {
    loading.value = false;
  }
}

loadData(pagination.value);
</script>

<template>
  <BaseListPage
    :columns="columns"
    :search-fields="searchFields"
    :data="data"
    :loading="loading"
    :pagination="pagination"
    @search="loadData"
    @reset="loadData"
    @page-change="loadData"
  />
</template>
```

## 触发词

- "Vue 列表页"
- "vue-list-page"
- "列表筛选页"
- "管理列表"
- "数据列表页"
