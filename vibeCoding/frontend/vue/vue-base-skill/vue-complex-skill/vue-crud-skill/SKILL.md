---
name: vue-crud-skill
description: Vue3 增删改查页面组件技能，提供 base-crud 组件。触发词："Vue CRUD"、"vue-crud"、"增删改查"、"管理页面"。
---

# Vue CRUD Skill

> **容器原则**：必须嵌入 `<base-card>` 使用  
> **零 HTML5 标签**：使用 `<div role="grid">` + ARIA 实现表格，按钮用 `<span role="button">`

增删改查页面组件，详细规范见 [base-crud.md](base-crud.md)

## 引用组件

| 组件技能 | 用途 |
|----------|------|
| vue-table-skill | 表格展示 |
| vue-form-skill | 表单验证 |
| vue-input-skill | 输入框 |
| vue-select-skill | 下拉选择器 |
| vue-datepicker-skill | 日期选择器 |
| vue-button-skill | 按钮 |

## 使用方式

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseCrudPage } from './components/BaseCrudPage';

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
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
];

const formFields = [
  { type: 'input', key: 'name', label: '姓名', rules: [{ required: true, message: '请输入姓名' }] },
  { type: 'input', key: 'email', label: '邮箱', rules: [{ required: true, type: 'email', message: '请输入邮箱' }] },
  { type: 'select', key: 'status', label: '状态', options: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ]},
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

async function handleAdd() {
  // 返回 Promise 表示异步保存
  return { id: Date.now(), ...formData, createdAt: new Date().toISOString() };
}

async function handleEdit(row: any) {
  return { ...row, ...formData };
}

async function handleDelete(row: any) {
  return row.id;
}
</script>

<template>
  <BaseCrudPage
    :columns="columns"
    :search-fields="searchFields"
    :form-fields="formFields"
    :data="data"
    :loading="loading"
    :pagination="pagination"
    @search="loadData"
    @reset="loadData"
    @add="handleAdd"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `Column[]` | `[]` | 表格列配置 |
| searchFields | `SearchField[]` | `[]` | 搜索字段配置 |
| formFields | `FormField[]` | `[]` | 表单字段配置 |
| data | `any[]` | `[]` | 表格数据 |
| loading | `boolean` | `false` | 加载状态 |
| pagination | `Pagination` | - | 分页配置 |
| showSearch | `boolean` | `true` | 是否显示搜索区 |
| showPagination | `boolean` | `true` | 是否显示分页 |
| addBtnText | `string` | `'新增'` | 新增按钮文字 |
| searchBtnText | `string` | `'搜索'` | 搜索按钮文字 |
| resetBtnText | `string` | `'重置'` | 重置按钮文字 |
| modalTitle | `string` | `'操作'` | 弹窗标题 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| search | `(params: object)` | 点击搜索 |
| reset | `()` | 点击重置 |
| add | `(formData: object) => Promise` | 新增保存 |
| edit | `(row: object, formData: object) => Promise` | 编辑保存 |
| delete | `(row: object) => Promise` | 删除确认 |
| page-change | `(page: number, pageSize: number)` | 分页变化 |

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
  type: 'input' | 'select' | 'datepicker';
  key: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
}

// 表单字段
interface FormField {
  type: 'input' | 'select' | 'datepicker' | 'textarea';
  key: string;
  label: string;
  rules?: ValidationRule[];
  options?: { label: string; value: any }[];
  props?: Record<string, any>;
}

// 验证规则
interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email';
  min?: number;
  max?: number;
  message: string;
}

// 分页
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}
```

## 组件代码

### BaseCrudPage.vue

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { BaseTable } from 'vue-table-skill';
import { BaseInput } from 'vue-input-skill';
import { BaseSelect } from 'vue-select-skill';
import { BaseDatePicker } from 'vue-datepicker-skill';
import { BaseButton } from 'vue-button-skill';
import type { Column, SearchField, FormField, Pagination } from './types/crud';
import './styles.css';

interface Props {
  columns?: Column[];
  searchFields?: SearchField[];
  formFields?: FormField[];
  data?: any[];
  loading?: boolean;
  pagination?: Pagination;
  showSearch?: boolean;
  showPagination?: boolean;
  addBtnText?: string;
  searchBtnText?: string;
  resetBtnText?: string;
  modalTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  searchFields: () => [],
  formFields: () => [],
  data: () => [],
  loading: false,
  pagination: () => ({ page: 1, pageSize: 10, total: 0 }),
  showSearch: true,
  showPagination: true,
  addBtnText: '新增',
  searchBtnText: '搜索',
  resetBtnText: '重置',
  modalTitle: '操作',
});

const emit = defineEmits<{
  search: [params: object];
  reset: [];
  add: [formData: object];
  edit: [row: object, formData: object];
  delete: [row: object];
  'page-change': [page: number, pageSize: number];
}>();

const searchParams = ref<Record<string, any>>({});
const localPagination = ref({ ...props.pagination });

// 弹窗状态
const modalVisible = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const currentRow = ref<any>(null);
const formData = ref<Record<string, any>>({});
const formLoading = ref(false);

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

// 打开新增弹窗
function openAddModal() {
  modalMode.value = 'add';
  currentRow.value = null;
  formData.value = {};
  props.formFields.forEach(field => {
    formData.value[field.key] = '';
  });
  modalVisible.value = true;
}

// 打开编辑弹窗
function openEditModal(row: any) {
  modalMode.value = 'edit';
  currentRow.value = row;
  formData.value = { ...row };
  modalVisible.value = true;
}

// 提交表单
async function handleSubmit() {
  formLoading.value = true;
  try {
    if (modalMode.value === 'add') {
      await emit('add', formData.value);
    } else {
      await emit('edit', currentRow.value, formData.value);
    }
    modalVisible.value = false;
    handleSearch();
  } finally {
    formLoading.value = false;
  }
}

// 删除确认
function handleDelete(row: any) {
  if (confirm(`确认删除 "${row.name || row.title || '该记录'}" 吗？`)) {
    emit('delete', row);
    handleSearch();
  }
}

// 操作列渲染
const actionColumn = computed(() => ({
  label: '操作',
  width: 180,
  fixed: 'right',
}));
</script>

<template>
  <div class="base-crud-page">
    <!-- 搜索区 -->
    <div v-if="showSearch && searchFields.length" class="base-crud-page__search">
      <div class="base-crud-page__search-fields">
        <div
          v-for="field in searchFields"
          :key="field.key"
          class="base-crud-page__search-field"
        >
          <BaseInput
            v-if="field.type === 'input'"
            v-model="searchParams[field.key]"
            :placeholder="field.placeholder"
            clearable
          />
          <BaseSelect
            v-else-if="field.type === 'select'"
            v-model="searchParams[field.key]"
            :placeholder="field.placeholder"
            :options="field.options || []"
            clearable
          />
          <BaseDatePicker
            v-else-if="field.type === 'datepicker'"
            v-model="searchParams[field.key]"
            :placeholder="field.placeholder"
          />
        </div>
      </div>
      <div class="base-crud-page__search-btns">
        <span class="base-crud-page__btn base-crud-page__btn--primary" role="button" tabindex="0" @click="handleSearch" @keydown.enter="handleSearch">
          {{ searchBtnText }}
        </span>
        <span class="base-crud-page__btn" role="button" tabindex="0" @click="handleReset" @keydown.enter="handleReset">
          {{ resetBtnText }}
        </span>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="base-crud-page__toolbar">
      <span class="base-crud-page__btn base-crud-page__btn--primary" role="button" tabindex="0" @click="openAddModal" @keydown.enter="openAddModal">
        {{ addBtnText }}
      </span>
    </div>

    <!-- 表格区 -->
    <div v-if="loading" class="base-crud-page__loading">
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
        <div
          class="base-table__th"
          :style="{ width: actionColumn.width + 'px' }"
          role="columnheader"
        >
          {{ actionColumn.label }}
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
          <div class="base-crud-page__actions" role="gridcell">
            <span class="base-crud-page__action-btn" role="button" tabindex="0" @click="openEditModal(row)" @keydown.enter="openEditModal(row)">编辑</span>
            <span class="base-crud-page__action-btn base-crud-page__action-btn--danger" role="button" tabindex="0" @click="handleDelete(row)" @keydown.enter="handleDelete(row)">删除</span>
          </div>
        </div>
        <div v-if="!data.length" class="base-crud-page__empty">
          暂无数据
        </div>
      </div>
    </div>

    <!-- 分页区 -->
    <div v-if="showPagination" class="base-crud-page__pagination">
      <span class="base-crud-page__total">共 {{ pagination.total }} 条</span>
      <div class="base-crud-page__pages">
        <span
          class="base-crud-page__page-btn"
          :class="{ 'is-disabled': localPagination.page <= 1 }"
          role="button"
          tabindex="0"
          @click="handlePageChange(localPagination.page - 1)"
          @keydown.enter="handlePageChange(localPagination.page - 1)"
        >
          上一页
        </span>
        <span class="base-crud-page__page-current">{{ localPagination.page }}</span>
        <span
          class="base-crud-page__page-btn"
          :class="{ 'is-disabled': localPagination.page * localPagination.pageSize >= pagination.total }"
          role="button"
          tabindex="0"
          @click="handlePageChange(localPagination.page + 1)"
          @keydown.enter="handlePageChange(localPagination.page + 1)"
        >
          下一页
        </span>
      </div>
    </div>

    <!-- 弹窗 -->
    <Teleport to="body">
      <div v-if="modalVisible" class="base-crud-page__modal-overlay" @click="modalVisible = false">
        <div class="base-crud-page__modal" @click.stop>
          <div class="base-crud-page__modal-header">
            <h3>{{ modalMode === 'add' ? '新增' : '编辑' }} {{ modalTitle }}</h3>
            <span class="base-crud-page__modal-close" role="button" tabindex="0" @click="modalVisible = false" @keydown.enter="modalVisible = false">x</span>
          </div>
          <div class="base-crud-page__modal-body">
            <div
              v-for="field in formFields"
              :key="field.key"
              class="base-crud-page__form-item"
            >
              <span class="base-crud-page__form-label">{{ field.label }}</span>
              <BaseInput
                v-if="field.type === 'input'"
                v-model="formData[field.key]"
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
              <BaseSelect
                v-else-if="field.type === 'select'"
                v-model="formData[field.key]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :options="field.options || []"
              />
              <BaseDatePicker
                v-else-if="field.type === 'datepicker'"
                v-model="formData[field.key]"
                :placeholder="field.placeholder || `请选择${field.label}`"
              />
              <div
                v-else-if="field.type === 'textarea'"
                class="base-crud-page__textarea"
                role="textbox"
                contenteditable="true"
                :data-placeholder="field.placeholder || `请输入${field.label}`"
                @input="formData[field.key] = ($event.target as HTMLElement).innerText"
              />
            </div>
          </div>
          <div class="base-crud-page__modal-footer">
            <span class="base-crud-page__btn" role="button" tabindex="0" @click="modalVisible = false" @keydown.enter="modalVisible = false">取消</span>
            <span class="base-crud-page__btn base-crud-page__btn--primary" :class="{ 'is-disabled': formLoading }" role="button" tabindex="0" @click="handleSubmit" @keydown.enter="handleSubmit">
              {{ formLoading ? '保存中...' : '保存' }}
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
```

### styles.css

```css
.base-crud-page {
  background: var(--color-surface, #fff);
  border-radius: 8px;
  padding: 20px;
}

.base-crud-page__search {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
  margin-bottom: 16px;
}

.base-crud-page__search-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
}

.base-crud-page__search-field {
  min-width: 200px;
}

.base-crud-page__search-btns {
  display: flex;
  gap: 8px;
  align-items: center;
}

.base-crud-page__toolbar {
  margin-bottom: 16px;
}

.base-crud-page__btn {
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: 4px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.base-crud-page__btn:hover {
  border-color: var(--color-primary, #409eff);
  color: var(--color-primary, #409eff);
}

.base-crud-page__btn--primary {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
  color: var(--color-surface, #fff);
}

.base-crud-page__btn--primary:hover {
  background: var(--color-primary-light, #66b1ff);
  border-color: var(--color-primary-light, #66b1ff);
}

.base-crud-page__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.base-crud-page__empty {
  text-align: center;
  color: var(--color-text-secondary, #909399);
  padding: 40px !important;
}

.base-crud-page__loading {
  text-align: center;
  color: var(--color-primary, #409eff);
  padding: 20px;
}

.base-crud-page__actions {
  display: flex;
  gap: 8px;
}

.base-crud-page__action-btn {
  padding: 4px 12px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: 4px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.base-crud-page__action-btn:hover {
  border-color: var(--color-primary, #409eff);
  color: var(--color-primary, #409eff);
}

.base-crud-page__action-btn--danger:hover {
  border-color: var(--color-danger, #f56c6c);
  color: var(--color-danger, #f56c6c);
}

/* 分页 */
.base-crud-page__pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border, #e4e7ed);
}

.base-crud-page__total {
  color: var(--color-text, #606266);
  font-size: 14px;
}

.base-crud-page__pages {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-crud-page__page-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: 4px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: 14px;
}

.base-crud-page__page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-crud-page__page-current {
  padding: 6px 12px;
  background: var(--color-primary, #409eff);
  color: var(--color-surface, #fff);
  border-radius: 4px;
}

/* 弹窗 */
.base-crud-page__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.base-crud-page__modal {
  background: var(--color-surface, #fff);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.base-crud-page__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.base-crud-page__modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--color-text, #303133);
}

.base-crud-page__modal-close {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-secondary, #909399);
}

.base-crud-page__modal-close:hover {
  color: var(--color-text, #303133);
}

.base-crud-page__modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.base-crud-page__form-item {
  margin-bottom: 16px;
}

.base-crud-page__form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--color-text, #606266);
}

.base-crud-page__textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.base-crud-page__textarea:focus {
  outline: none;
  border-color: var(--color-primary, #409eff);
}

.base-crud-page__modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border, #e4e7ed);
}
```

## 3 件套

### types/crud.ts

```typescript
// CRUD 页面类型定义

export interface Column {
  prop: string;
  label: string;
  width?: number;
  fixed?: 'left' | 'right';
  formatter?: (row: any, column: Column, cell: any) => string;
}

export interface SearchField {
  type: 'input' | 'select' | 'datepicker';
  key: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
}

export interface FormField {
  type: 'input' | 'select' | 'datepicker' | 'textarea';
  key: string;
  label: string;
  placeholder?: string;
  rules?: ValidationRule[];
  options?: { label: string; value: any }[];
  props?: Record<string, any>;
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email';
  min?: number;
  max?: number;
  message: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface CrudProps {
  columns?: Column[];
  searchFields?: SearchField[];
  formFields?: FormField[];
  data?: any[];
  loading?: boolean;
  pagination?: Pagination;
  showSearch?: boolean;
  showPagination?: boolean;
  addBtnText?: string;
  searchBtnText?: string;
  resetBtnText?: string;
  modalTitle?: string;
}

export interface CrudEmits {
  search: [params: object];
  reset: [];
  add: [formData: object];
  edit: [row: object, formData: object];
  delete: [row: object];
  'page-change': [page: number, pageSize: number];
}
```

### composables/useCrud.ts

```typescript
// CRUD 逻辑复用

import { ref } from 'vue';

export function useCrud<T extends { id: string | number }>(options: {
  loadData: (params: any) => Promise<{ data: T[]; total: number }>;
  onAdd?: (data: Partial<T>) => Promise<T>;
  onEdit?: (row: T, data: Partial<T>) => Promise<T>;
  onDelete?: (row: T) => Promise<void>;
}) {
  const data = ref<T[]>([]);
  const loading = ref(false);
  const pagination = ref({ page: 1, pageSize: 10, total: 0 });

  async function load(params: any = {}) {
    loading.value = true;
    try {
      const result = await options.loadData({ ...pagination.value, ...params });
      data.value = result.data;
      pagination.value.total = result.total;
    } finally {
      loading.value = false;
    }
  }

  async function add(formData: Partial<T>) {
    if (options.onAdd) {
      const result = await options.onAdd(formData);
      await load();
      return result;
    }
  }

  async function edit(row: T, formData: Partial<T>) {
    if (options.onEdit) {
      const result = await options.onEdit(row, formData);
      await load();
      return result;
    }
  }

  async function remove(row: T) {
    if (options.onDelete) {
      await options.onDelete(row);
      await load();
    }
  }

  return {
    data,
    loading,
    pagination,
    load,
    add,
    edit,
    remove,
  };
}
```

### index.ts

```typescript
export { BaseCrudPage } from './BaseCrudPage.vue';
export type { Column, SearchField, FormField, ValidationRule, Pagination, CrudProps, CrudEmits } from './types/crud';
```

## 使用示例

### 完整 CRUD 示例

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseCrudPage } from './components/BaseCrudPage';

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'email', label: '邮箱' },
  { prop: 'gender', label: '性别', width: 80 },
  { prop: 'status', label: '状态', width: 80 },
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
];

const formFields = [
  { type: 'input', key: 'name', label: '姓名', rules: [{ required: true, message: '请输入姓名' }] },
  { type: 'input', key: 'email', label: '邮箱', rules: [{ required: true, type: 'email', message: '请输入邮箱' }] },
  { type: 'select', key: 'gender', label: '性别', options: [
    { label: '男', value: 1 },
    { label: '女', value: 0 },
  ]},
  { type: 'select', key: 'status', label: '状态', options: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ]},
  { type: 'textarea', key: 'remark', label: '备注' },
];

const data = ref([]);
const loading = ref(false);
const pagination = ref({ page: 1, pageSize: 10, total: 0 });

async function loadData(params: any) {
  loading.value = true;
  try {
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
  <BaseCrudPage
    :columns="columns"
    :search-fields="searchFields"
    :form-fields="formFields"
    :data="data"
    :loading="loading"
    :pagination="pagination"
    modal-title="用户"
    @search="loadData"
    @reset="loadData"
    @add="(data) => console.log('新增', data)"
    @edit="(row, data) => console.log('编辑', row, data)"
    @delete="(row) => console.log('删除', row)"
    @page-change="loadData"
  />
</template>
```

## 触发词

- "Vue CRUD"
- "vue-crud"
- "增删改查"
- "管理页面"
- "数据管理"
- "BaseCrudPage"
