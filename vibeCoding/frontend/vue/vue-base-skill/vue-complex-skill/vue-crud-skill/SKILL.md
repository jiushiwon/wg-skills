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
| vue-table-skill | 表格展示（排序/空状态/加载遮罩） |
| vue-form-skill | 表单校验（rules 驱动） |
| vue-input-skill | 搜索/表单输入框 |
| vue-select-skill | 搜索/表单下拉选择器 |
| vue-datepicker-skill | 日期范围搜索 |
| vue-button-skill | 工具栏/弹窗按钮 |
| vue-checkbox-skill | 表格行复选框（全选/半选） |
| vue-status-skill | 状态标签（启用/禁用） |
| vue-tag-skill | 角色标签 |
| vue-switch-skill | 表单开关 |
| vue-toast-skill | 操作反馈提示 |
| vue-dialog-skill | 删除确认弹窗 |
| vue-theme-skill | 多主题切换（可选，demo 中展示 6 色主题） |

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `Column[]` | `[]` | 表格列配置 |
| searchFields | `SearchField[]` | `[]` | 搜索字段配置 |
| formFields | `FormField[]` | `[]` | 表单字段配置 |
| data | `any[]` | `[]` | 表格数据 |
| loading | `boolean` | `false` | 加载状态 |
| pagination | `Pagination` | `{ page:1, pageSize:10, total:0 }` | 分页配置 |
| showSearch | `boolean` | `true` | 是否显示搜索区 |
| showPagination | `boolean` | `true` | 是否显示分页 |
| showBatchDelete | `boolean` | `true` | 是否显示批量删除 |
| showExport | `boolean` | `true` | 是否显示导出按钮 |
| showRefresh | `boolean` | `true` | 是否显示刷新按钮 |
| addBtnText | `string` | `'新增'` | 新增按钮文字 |
| searchBtnText | `string` | `'搜索'` | 搜索按钮文字 |
| resetBtnText | `string` | `'重置'` | 重置按钮文字 |
| modalTitle | `string` | `'操作'` | 弹窗标题 |
| rowKey | `string` | `'id'` | 行数据唯一键字段名 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| search | `(params: object)` | 点击搜索，携带搜索条件 + 分页参数 |
| reset | `()` | 点击重置 |
| add | `(formData: object) => Promise` | 新增保存，返回 Promise 控制 loading |
| edit | `(row: object, formData: object) => Promise` | 编辑保存 |
| delete | `(row: object) => Promise` | 删除单条 |
| batch-delete | `(rows: object[]) => Promise` | 批量删除 |
| export | `()` | 点击导出 |
| refresh | `()` | 点击刷新 |
| page-change | `(page: number, pageSize: number)` | 分页变化 |
| sort-change | `(field: string, order: 'asc'\|'desc'\|'')` | 排序变化 |

## Types

```typescript
// types/crud.ts

export interface Column {
  prop: string;
  label: string;
  width?: number | string;        // 固定宽度 px 或 flex 比例
  sortable?: boolean;             // 是否可排序
  fixed?: 'left' | 'right';
  formatter?: (row: any, column: Column, cell: any) => string;
}

export interface SearchField {
  type: 'input' | 'select' | 'datepicker';
  key: string;
  label?: string;                 // 搜索标签（可选）
  placeholder?: string;
  options?: { label: string; value: any }[];
  wide?: boolean;                 // 宽度加倍（如日期范围）
  advanced?: boolean;             // 是否放在高级搜索区
}

export interface FormField {
  type: 'input' | 'select' | 'datepicker' | 'textarea' | 'switch';
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;             // 快捷必填标记
  rules?: ValidationRule[];       // 自定义校验规则
  options?: { label: string; value: any }[];
  props?: Record<string, any>;
  span?: 1 | 2;                  // 表单网格占列数（默认 1，2 = 满行）
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone';
  pattern?: RegExp;
  min?: number;
  max?: number;
  message: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface CrudEmits {
  search: [params: object];
  reset: [];
  add: [formData: object];
  edit: [row: object, formData: object];
  delete: [row: object];
  'batch-delete': [rows: object[]];
  export: [];
  refresh: [];
  'page-change': [page: number, pageSize: number];
  'sort-change': [field: string, order: 'asc' | 'desc' | ''];
}
```

## 组件代码

### BaseCrudPage.vue

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Column, SearchField, FormField, Pagination, ValidationRule } from './types/crud';
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
  showBatchDelete?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  addBtnText?: string;
  searchBtnText?: string;
  resetBtnText?: string;
  modalTitle?: string;
  rowKey?: string;
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
  showBatchDelete: true,
  showExport: true,
  showRefresh: true,
  addBtnText: '新增',
  searchBtnText: '搜索',
  resetBtnText: '重置',
  modalTitle: '操作',
  rowKey: 'id',
});

const emit = defineEmits<{
  search: [params: object];
  reset: [];
  add: [formData: object];
  edit: [row: object, formData: object];
  delete: [row: object];
  'batch-delete': [rows: object[]];
  export: [];
  refresh: [];
  'page-change': [page: number, pageSize: number];
  'sort-change': [field: string, order: 'asc' | 'desc' | ''];
}>();

// ======================== 搜索状态 ========================
const searchParams = ref<Record<string, any>>({});
const advancedOpen = ref(false);

// 初始化搜索参数
props.searchFields.forEach(field => {
  searchParams.value[field.key] = '';
});

// 基础搜索字段 / 高级搜索字段
const basicSearchFields = computed(() => props.searchFields.filter(f => !f.advanced));
const advancedSearchFields = computed(() => props.searchFields.filter(f => f.advanced));
const hasAdvanced = computed(() => advancedSearchFields.value.length > 0);

function handleSearch() {
  localPagination.value.page = 1;
  selectedIds.value.clear();
  emit('search', { ...searchParams.value, page: 1, pageSize: localPagination.value.pageSize });
}

function handleReset() {
  Object.keys(searchParams.value).forEach(key => { searchParams.value[key] = ''; });
  localPagination.value.page = 1;
  selectedIds.value.clear();
  emit('reset');
}

// ======================== 排序状态 ========================
const sortField = ref('');
const sortOrder = ref<'asc' | 'desc' | ''>('');

function handleSort(field: string) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? '' : 'asc';
    if (sortOrder.value === '') sortField.value = '';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
  emit('sort-change', sortField.value, sortOrder.value);
}

// ======================== 选择状态 ========================
const selectedIds = ref<Set<any>>(new Set());

function getRowId(row: any) {
  return row[props.rowKey];
}

function toggleRow(row: any) {
  const id = getRowId(row);
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
  selectedIds.value = new Set(selectedIds.value); // 触发响应式
}

function toggleSelectAll() {
  const pageIds = props.data.map(r => getRowId(r));
  const allSelected = pageIds.every(id => selectedIds.value.has(id));

  if (allSelected) {
    pageIds.forEach(id => selectedIds.value.delete(id));
  } else {
    pageIds.forEach(id => selectedIds.value.add(id));
  }
  selectedIds.value = new Set(selectedIds.value);
}

const isAllSelected = computed(() => {
  if (!props.data.length) return false;
  return props.data.every(r => selectedIds.value.has(getRowId(r)));
});

const isIndeterminate = computed(() => {
  if (!props.data.length) return false;
  const selected = props.data.filter(r => selectedIds.value.has(getRowId(r))).length;
  return selected > 0 && selected < props.data.length;
});

const selectedCount = computed(() => selectedIds.value.size);

// ======================== 分页状态 ========================
const localPagination = ref({ ...props.pagination });
const pageSizeOptions = [10, 20, 50];
const pageSizeOpen = ref(false);

watch(() => props.pagination, (val) => {
  localPagination.value = { ...val };
}, { deep: true });

function handlePageChange(page: number) {
  const totalPages = Math.max(1, Math.ceil(props.pagination.total / localPagination.value.pageSize));
  if (page < 1 || page > totalPages) return;
  localPagination.value.page = page;
  emit('page-change', page, localPagination.value.pageSize);
}

function handlePageSizeChange(size: number) {
  localPagination.value.pageSize = size;
  localPagination.value.page = 1;
  pageSizeOpen.value = false;
  emit('page-change', 1, size);
}

// 分页按钮（当前页附近 ±2）
const pageButtons = computed(() => {
  const total = Math.max(1, Math.ceil(props.pagination.total / localPagination.value.pageSize));
  const current = localPagination.value.page;
  const delta = 2;
  const pages: (number | '...')[] = [];

  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.push(i);
  }
  if ((pages[0] as number) > 1) {
    if ((pages[0] as number) > 2) pages.unshift('...');
    pages.unshift(1);
  }
  if ((pages[pages.length - 1] as number) < total) {
    if ((pages[pages.length - 1] as number) < total - 1) pages.push('...');
    pages.push(total);
  }
  return pages;
});

const totalPages = computed(() => Math.max(1, Math.ceil(props.pagination.total / localPagination.value.pageSize)));

// ======================== 弹窗状态 ========================
const modalVisible = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const currentRow = ref<any>(null);
const formData = ref<Record<string, any>>({});
const formErrors = ref<Record<string, string>>({});
const formLoading = ref(false);

function openAddModal() {
  modalMode.value = 'add';
  currentRow.value = null;
  formData.value = {};
  formErrors.value = {};
  props.formFields.forEach(field => {
    formData.value[field.key] = field.type === 'switch' ? true : '';
  });
  modalVisible.value = true;
}

function openEditModal(row: any) {
  modalMode.value = 'edit';
  currentRow.value = row;
  formData.value = { ...row };
  formErrors.value = {};
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
}

// ======================== 表单校验 ========================
function validateForm(): boolean {
  const errors: Record<string, string> = {};
  let valid = true;

  props.formFields.forEach(field => {
    const value = formData.value[field.key];

    // 快捷 required
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.key] = `请输入${field.label}`;
      valid = false;
      return;
    }

    // rules 数组校验
    if (field.rules) {
      for (const rule of field.rules) {
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors[field.key] = rule.message;
          valid = false;
          break;
        }
        if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field.key] = rule.message;
          valid = false;
          break;
        }
        if (rule.pattern && value && !rule.pattern.test(value)) {
          errors[field.key] = rule.message;
          valid = false;
          break;
        }
        if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
          errors[field.key] = rule.message;
          valid = false;
          break;
        }
        if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
          errors[field.key] = rule.message;
          valid = false;
          break;
        }
      }
    }
  });

  formErrors.value = errors;
  return valid;
}

// ======================== 提交 ========================
async function handleSubmit() {
  if (!validateForm()) return;

  formLoading.value = true;
  try {
    if (modalMode.value === 'add') {
      await emit('add', { ...formData.value });
    } else {
      await emit('edit', currentRow.value, { ...formData.value });
    }
    modalVisible.value = false;
    showToast(modalMode.value === 'add' ? '新增成功' : '保存成功');
  } catch (e: any) {
    showToast(e.message || '操作失败', 'danger');
  } finally {
    formLoading.value = false;
  }
}

// ======================== 删除 ========================
const confirmVisible = ref(false);
const confirmDesc = ref('');
const deleteTarget = ref<'single' | 'batch'>('single');
const deleteRow = ref<any>(null);

function openDeleteConfirm(row: any) {
  deleteTarget.value = 'single';
  deleteRow.value = row;
  confirmDesc.value = `确定要删除「${row.name || row.title || '该记录'}」吗？此操作不可恢复。`;
  confirmVisible.value = true;
}

function openBatchDeleteConfirm() {
  if (selectedIds.value.size === 0) return;
  deleteTarget.value = 'batch';
  deleteRow.value = null;
  confirmDesc.value = `确定要删除选中的 ${selectedIds.value.size} 条记录吗？此操作不可恢复。`;
  confirmVisible.value = true;
}

async function confirmDelete() {
  try {
    if (deleteTarget.value === 'single' && deleteRow.value) {
      await emit('delete', deleteRow.value);
      selectedIds.value.delete(getRowId(deleteRow.value));
      selectedIds.value = new Set(selectedIds.value);
      showToast('删除成功');
    } else if (deleteTarget.value === 'batch') {
      const rows = props.data.filter(r => selectedIds.value.has(getRowId(r)));
      await emit('batch-delete', rows);
      selectedIds.value.clear();
      selectedIds.value = new Set(selectedIds.value);
      showToast('批量删除成功');
    }
  } catch (e: any) {
    showToast(e.message || '删除失败', 'danger');
  }
  confirmVisible.value = false;

  // 删除后修正当前页（防止删完最后一页数据后看到空白）
  const total = props.pagination.total - (deleteTarget.value === 'single' ? 1 : selectedIds.value.size);
  const maxPage = Math.max(1, Math.ceil(Math.max(0, total) / localPagination.value.pageSize));
  if (localPagination.value.page > maxPage) {
    localPagination.value.page = maxPage;
    emit('page-change', maxPage, localPagination.value.pageSize);
  }
}

// ======================== 工具栏 ========================
function handleExportClick() {
  emit('export');
}

function handleRefreshClick() {
  selectedIds.value.clear();
  selectedIds.value = new Set(selectedIds.value);
  localPagination.value.page = 1;
  emit('refresh');
}

// ======================== Toast ========================
const toastVisible = ref(false);
const toastMsg = ref('');
const toastType = ref<'success' | 'danger' | 'warning'>('success');
let toastTimer: ReturnType<typeof setTimeout>;

function showToast(msg: string, type: 'success' | 'danger' | 'warning' = 'success') {
  toastMsg.value = msg;
  toastType.value = type;
  toastVisible.value = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastVisible.value = false; }, 2000);
}

// ======================== 关闭全局下拉 ========================
function closeAllDropdowns() {
  pageSizeOpen.value = false;
}
</script>

<template>
  <div class="base-crud-page" @click="closeAllDropdowns">

    <!-- ======================== 搜索区 ======================== -->
    <div v-if="showSearch && searchFields.length" class="base-crud-page__search">
      <div class="base-crud-page__search-row">
        <div
          v-for="field in basicSearchFields"
          :key="field.key"
          class="base-crud-page__search-field"
          :class="{ 'base-crud-page__search-field--wide': field.wide }"
        >
          <span v-if="field.label" class="base-crud-page__search-label">{{ field.label }}</span>
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

        <div class="base-crud-page__search-btns">
          <span
            v-if="hasAdvanced"
            class="base-crud-page__search-toggle"
            :class="{ 'is-open': advancedOpen }"
            role="button"
            tabindex="0"
            @click="advancedOpen = !advancedOpen"
          >
            <span class="base-crud-page__search-toggle-arrow">▼</span>
            高级搜索
          </span>
          <span class="base-crud-page__btn base-crud-page__btn--primary" role="button" tabindex="0" @click="handleSearch" @keydown.enter="handleSearch">
            {{ searchBtnText }}
          </span>
          <span class="base-crud-page__btn" role="button" tabindex="0" @click="handleReset" @keydown.enter="handleReset">
            {{ resetBtnText }}
          </span>
        </div>
      </div>

      <!-- 高级搜索行 -->
      <div v-if="hasAdvanced" class="base-crud-page__search-row base-crud-page__search-advanced" :class="{ 'is-open': advancedOpen }">
        <div
          v-for="field in advancedSearchFields"
          :key="field.key"
          class="base-crud-page__search-field"
          :class="{ 'base-crud-page__search-field--wide': field.wide }"
        >
          <span v-if="field.label" class="base-crud-page__search-label">{{ field.label }}</span>
          <BaseInput
            v-if="field.type === 'input'"
            v-model="searchParams[field.key]"
            :placeholder="field.placeholder"
          />
          <BaseSelect
            v-else-if="field.type === 'select'"
            v-model="searchParams[field.key]"
            :placeholder="field.placeholder"
            :options="field.options || []"
          />
          <BaseDatePicker
            v-else-if="field.type === 'datepicker'"
            v-model="searchParams[field.key]"
            :placeholder="field.placeholder"
          />
        </div>
      </div>
    </div>

    <!-- ======================== 工具栏 ======================== -->
    <div class="base-crud-page__toolbar">
      <span class="base-crud-page__btn base-crud-page__btn--primary" role="button" tabindex="0" @click="openAddModal" @keydown.enter="openAddModal">
        + {{ addBtnText }}
      </span>
      <span
        v-if="showBatchDelete"
        class="base-crud-page__btn base-crud-page__btn--danger"
        :class="{ 'is-disabled': selectedCount === 0 }"
        role="button"
        tabindex="0"
        @click="openBatchDeleteConfirm"
      >
        批量删除
      </span>
      <span v-if="showExport" class="base-crud-page__btn" role="button" tabindex="0" @click="handleExportClick">
        导出
      </span>
      <span v-if="showRefresh" class="base-crud-page__btn base-crud-page__btn--ghost" role="button" tabindex="0" @click="handleRefreshClick">
        ↻ 刷新
      </span>
      <div class="base-crud-page__toolbar-spacer"></div>
      <span class="base-crud-page__toolbar-info">已选 {{ selectedCount }} 项</span>
    </div>

    <!-- ======================== 加载遮罩 ======================== -->
    <div v-if="loading" class="base-crud-page__loading-overlay">
      <div class="base-crud-page__loading-ring"></div>
      <span class="base-crud-page__loading-text">加载中...</span>
    </div>

    <!-- ======================== 表格 ======================== -->
    <div class="base-table base-table--striped" role="grid">
      <!-- 表头 -->
      <div class="base-table__row base-table__row--header" role="row">
        <div class="base-table__cell base-table__cell--checkbox">
          <div
            class="base-table__checkbox"
            :class="{ 'is-checked': isAllSelected, 'is-indeterminate': isIndeterminate }"
            role="checkbox"
            :aria-checked="isAllSelected"
            tabindex="0"
            @click="toggleSelectAll"
          ></div>
        </div>
        <div
          v-for="col in columns"
          :key="col.prop"
          class="base-table__cell"
          :style="col.width ? (typeof col.width === 'number' ? `flex: 0 0 ${col.width}px` : `flex: ${col.width}`) : ''"
        >
          {{ col.label }}
          <span
            v-if="col.sortable"
            class="base-table__sort-icon"
            role="button"
            tabindex="0"
            @click.stop="handleSort(col.prop)"
          >
            <span :class="{ 'is-active': sortField === col.prop && sortOrder === 'asc' }">▲</span>
            <span :class="{ 'is-active': sortField === col.prop && sortOrder === 'desc' }">▼</span>
          </span>
        </div>
        <div class="base-table__cell base-table__cell--actions">操作</div>
      </div>

      <!-- 表体 -->
      <div class="base-table__body">
        <div v-if="!data.length && !loading" class="base-table__empty">
          <div class="base-table__empty-icon">
            <div class="base-table__empty-icon-shape"></div>
          </div>
          <span class="base-table__empty-text">暂无数据</span>
        </div>

        <div
          v-for="(row, idx) in data"
          :key="getRowId(row)"
          class="base-table__row base-table__row--data"
          :class="{ 'is-selected': selectedIds.has(getRowId(row)) }"
          role="row"
        >
          <div class="base-table__cell base-table__cell--checkbox">
            <div
              class="base-table__checkbox"
              :class="{ 'is-checked': selectedIds.has(getRowId(row)) }"
              role="checkbox"
              :aria-checked="selectedIds.has(getRowId(row))"
              tabindex="0"
              @click="toggleRow(row)"
            ></div>
          </div>
          <div
            v-for="col in columns"
            :key="col.prop"
            class="base-table__cell"
            :style="col.width ? (typeof col.width === 'number' ? `flex: 0 0 ${col.width}px` : `flex: ${col.width}`) : ''"
          >
            <slot :name="`cell-${col.prop}`" :row="row" :value="row[col.prop]">
              {{ col.formatter ? col.formatter(row, col, row[col.prop]) : row[col.prop] }}
            </slot>
          </div>
          <div class="base-table__cell base-table__cell--actions">
            <div class="base-table__actions">
              <span class="base-crud-page__action-btn" role="button" tabindex="0" @click="openEditModal(row)" @keydown.enter="openEditModal(row)">编辑</span>
              <span class="base-crud-page__action-btn base-crud-page__action-btn--danger" role="button" tabindex="0" @click="openDeleteConfirm(row)" @keydown.enter="openDeleteConfirm(row)">删除</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================== 分页 ======================== -->
    <div v-if="showPagination" class="base-paginated">
      <span class="base-paginated__total">共 <strong>{{ pagination.total }}</strong> 条</span>
      <div class="base-paginated__right">
        <!-- pageSize 选择 -->
        <div class="base-paginated__size-select" :class="{ 'is-open': pageSizeOpen }" @click.stop="pageSizeOpen = !pageSizeOpen">
          <span>{{ localPagination.pageSize }} 条/页</span>
          <span class="base-paginated__size-select-arrow"></span>
          <div v-show="pageSizeOpen" class="base-paginated__size-select-panel">
            <div
              v-for="size in pageSizeOptions"
              :key="size"
              class="base-paginated__size-select-option"
              :class="{ 'is-active': localPagination.pageSize === size }"
              @click.stop="handlePageSizeChange(size)"
            >
              {{ size }} 条/页
            </div>
          </div>
        </div>
        <!-- 页码 -->
        <div class="base-paginated__buttons">
          <span
            class="base-paginated__page-btn"
            :class="{ 'is-disabled': localPagination.page <= 1 }"
            role="button"
            tabindex="0"
            @click="handlePageChange(localPagination.page - 1)"
          >‹</span>
          <template v-for="(p, i) in pageButtons" :key="i">
            <span v-if="p === '...'" class="base-paginated__ellipsis">...</span>
            <span
              v-else
              class="base-paginated__page-btn"
              :class="{ 'is-active': p === localPagination.page }"
              role="button"
              tabindex="0"
              @click="handlePageChange(p as number)"
            >{{ p }}</span>
          </template>
          <span
            class="base-paginated__page-btn"
            :class="{ 'is-disabled': localPagination.page >= totalPages }"
            role="button"
            tabindex="0"
            @click="handlePageChange(localPagination.page + 1)"
          >›</span>
        </div>
        <!-- 页码跳转 -->
        <div class="base-paginated__jumper">
          跳至
          <input
            type="number"
            class="base-paginated__jumper-input"
            :value="localPagination.page"
            min="1"
            @keydown.enter="handlePageChange(Number(($event.target as HTMLInputElement).value))"
          >
          页
        </div>
      </div>
    </div>

    <!-- ======================== 新增/编辑弹窗 ======================== -->
    <Teleport to="body">
      <div v-if="modalVisible" class="base-crud-page__modal-overlay is-visible" @click="closeModal">
        <div class="base-crud-page__modal" @click.stop>
          <div class="base-crud-page__modal-header">
            <h3>{{ modalMode === 'add' ? '新增' : '编辑' }} {{ modalTitle }}</h3>
            <span class="base-crud-page__modal-close" role="button" tabindex="0" @click="closeModal" @keydown.enter="closeModal">✕</span>
          </div>
          <div class="base-crud-page__modal-body">
            <div class="base-crud-page__form-grid">
              <div
                v-for="field in formFields"
                :key="field.key"
                class="base-crud-page__form-item"
                :class="{ 'base-crud-page__form-item--full': field.span === 2 }"
              >
                <span class="base-crud-page__form-label">
                  {{ field.label }}
                  <span v-if="field.required || (field.rules && field.rules.some(r => r.required))" class="is-required">*</span>
                </span>
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
                >{{ formData[field.key] }}</div>
                <div v-else-if="field.type === 'switch'" class="base-switch" :class="{ 'is-on': formData[field.key] }" @click="formData[field.key] = !formData[field.key]">
                  <div class="base-switch__track"><div class="base-switch__thumb"></div></div>
                  <span class="base-switch__label">{{ formData[field.key] ? '启用' : '禁用' }}</span>
                </div>
                <span class="base-crud-page__form-error">{{ formErrors[field.key] || '' }}</span>
              </div>
            </div>
          </div>
          <div class="base-crud-page__modal-footer">
            <span class="base-crud-page__btn" role="button" tabindex="0" @click="closeModal" @keydown.enter="closeModal">取消</span>
            <span class="base-crud-page__btn base-crud-page__btn--primary" :class="{ 'is-disabled': formLoading }" role="button" tabindex="0" @click="handleSubmit" @keydown.enter="handleSubmit">
              {{ formLoading ? '保存中...' : '保存' }}
            </span>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ======================== 删除确认弹窗 ======================== -->
    <Teleport to="body">
      <div v-if="confirmVisible" class="confirm-overlay is-visible" @click="confirmVisible = false">
        <div class="confirm-box" @click.stop>
          <div class="confirm-box__icon">
            <span class="confirm-box__icon-shape">⚠</span>
          </div>
          <div class="confirm-box__title">确认删除</div>
          <div class="confirm-box__desc">{{ confirmDesc }}</div>
          <div class="confirm-box__btns">
            <span class="base-crud-page__btn" role="button" tabindex="0" @click="confirmVisible = false">取消</span>
            <span class="base-crud-page__btn base-crud-page__btn--danger" role="button" tabindex="0" @click="confirmDelete">确认删除</span>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ======================== Toast ======================== -->
    <Teleport to="body">
      <div class="toast" :class="{ 'is-visible': toastVisible, 'toast--danger': toastType === 'danger' }">
        <span class="toast__icon">{{ toastType === 'success' ? '✓' : toastType === 'danger' ? '✕' : '!' }}</span>
        <span>{{ toastMsg }}</span>
      </div>
    </Teleport>
  </div>
</template>
```

### styles.css

```css
/* ======================== CRUD 页面容器 ======================== */
.base-crud-page {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04));
  border: 1px solid var(--color-divider, #f0f0f0);
  overflow: hidden;
  position: relative;
}

/* ======================== 搜索区 ======================== */
.base-crud-page__search {
  padding: var(--space-5, 20px) var(--space-6, 24px);
  border-bottom: 1px solid var(--color-divider, #f0f0f0);
}
.base-crud-page__search-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3, 12px);
  align-items: flex-end;
}
.base-crud-page__search-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  min-width: 180px;
}
.base-crud-page__search-field--wide {
  min-width: 260px;
}
.base-crud-page__search-label {
  font-size: var(--font-xs, 12px);
  color: var(--color-text-secondary, #909399);
}
.base-crud-page__search-btns {
  display: flex;
  gap: var(--space-2, 8px);
  align-items: flex-end;
  margin-left: auto;
}
.base-crud-page__search-toggle {
  cursor: pointer;
  color: var(--color-primary, #409eff);
  font-size: var(--font-xs, 12px);
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
  height: 40px;
}
.base-crud-page__search-toggle:hover {
  text-decoration: underline;
}
.base-crud-page__search-toggle-arrow {
  display: inline-block;
  font-size: 10px;
  transition: transform 0.2s;
}
.base-crud-page__search-toggle.is-open .base-crud-page__search-toggle-arrow {
  transform: rotate(180deg);
}
.base-crud-page__search-advanced {
  display: none;
  margin-top: var(--space-3, 12px);
}
.base-crud-page__search-advanced.is-open {
  display: flex;
}

/* ======================== 按钮 ======================== */
/* 注意：crud 组件使用自包含按钮系统（.base-crud-page__btn）
   而非引用 vue-button-skill 的 base-button，以保证组件独立可用。
   demo 中使用 vue-button-skill 是为了展示组件协作。 */
.base-crud-page__btn {
  height: 36px;
  padding: 0 var(--space-4, 16px);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: var(--font-sm, 13px);
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
.base-crud-page__btn:hover {
  border-color: var(--color-primary, #409eff);
  color: var(--color-primary, #409eff);
}
.base-crud-page__btn--primary {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
  color: var(--color-text-inverse, #fff);
}
.base-crud-page__btn--primary:hover {
  background: var(--color-primary-light, #66b1ff);
  border-color: var(--color-primary-light, #66b1ff);
}
.base-crud-page__btn--danger {
  color: var(--color-danger, #f56c6c);
  border-color: var(--color-danger, #f56c6c);
}
.base-crud-page__btn--danger:hover {
  background: var(--color-danger-light, #fef0f0);
}
.base-crud-page__btn--ghost {
  background: transparent;
  border-color: transparent;
}
.base-crud-page__btn--ghost:hover {
  background: var(--color-bg-hover, #f5f7fa);
  border-color: transparent;
}
.base-crud-page__btn.is-disabled,
.base-crud-page__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* ======================== 工具栏 ======================== */
.base-crud-page__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-3, 12px) var(--space-6, 24px);
  border-bottom: 1px solid var(--color-divider, #f0f0f0);
}
.base-crud-page__toolbar-spacer {
  flex: 1;
}
.base-crud-page__toolbar-info {
  font-size: var(--font-xs, 12px);
  color: var(--color-text-tertiary, #c0c4cc);
}

/* ======================== 加载遮罩 ======================== */
.base-crud-page__loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3, 12px);
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(2px);
  z-index: 20;
}
.base-crud-page__loading-ring {
  display: inline-block;
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-primary-light, #a0cfff);
  border-top-color: var(--color-primary, #409eff);
  border-radius: 50%;
  animation: crud-loading-rotate 0.8s linear infinite;
}
@keyframes crud-loading-rotate { to { transform: rotate(360deg); } }
.base-crud-page__loading-text {
  color: var(--color-text-secondary, #909399);
  font-size: var(--font-sm, 13px);
}

/* ======================== 表格 ======================== */
.base-table {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.base-table__row {
  display: flex;
  border-bottom: 1px solid var(--color-divider, #f0f0f0);
  transition: background-color 0.2s;
}
.base-table__row--header {
  background: var(--color-bg-secondary, #f5f7fa);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}
.base-table__row--data:hover {
  background: var(--color-bg-hover, #f5f7fa);
}
.base-table--striped .base-table__row--data:nth-child(even) {
  background: var(--color-bg-secondary, #fafafa);
}
.base-table--striped .base-table__row--data:nth-child(even):hover {
  background: var(--color-bg-hover, #f5f7fa);
}
.base-table__cell {
  flex: 1;
  min-width: 0;
  padding: var(--space-3, 12px) var(--space-4, 16px);
  font-size: var(--font-sm, 13px);
  color: var(--color-text, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
.base-table__row--header .base-table__cell {
  color: var(--color-text-secondary, #909399);
  font-weight: 600;
  font-size: var(--font-sm, 13px);
}
.base-table__cell--checkbox {
  flex: none;
  width: 48px;
  justify-content: center;
}
.base-table__cell--actions {
  flex: none;
  min-width: 160px;
}

/* 复选框 */
.base-table__checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-sm, 8px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.base-table__checkbox:hover {
  border-color: var(--color-primary, #409eff);
}
.base-table__checkbox.is-checked {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
}
.base-table__checkbox.is-checked::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}
.base-table__checkbox.is-indeterminate {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
}
.base-table__checkbox.is-indeterminate::after {
  content: '';
  width: 8px;
  height: 2px;
  background: white;
  border-radius: 1px;
}
.base-table__row.is-selected {
  background: var(--color-primary-light, #ecf5ff) !important;
}

/* 排序图标 */
.base-table__sort-icon {
  display: inline-flex;
  flex-direction: column;
  margin-left: var(--space-1, 4px);
  font-size: 10px;
  line-height: 1;
  color: var(--color-text-tertiary, #c0c4cc);
  gap: 1px;
  cursor: pointer;
}
.base-table__sort-icon:hover {
  color: var(--color-primary, #409eff);
}
.base-table__sort-icon .is-active {
  color: var(--color-primary, #409eff);
}

/* 操作列 */
.base-table__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
}
.base-crud-page__action-btn {
  padding: 2px 8px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-sm, 8px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: var(--font-xs, 12px);
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

/* 空状态 */
.base-table__empty {
  padding: var(--space-10, 40px) var(--space-4, 16px);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3, 12px);
}
.base-table__empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary, #f5f7fa);
  border-radius: 50%;
}
.base-table__empty-icon-shape {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
  position: relative;
}
.base-table__empty-icon-shape::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 12px;
  height: 3px;
  background: var(--color-border, #dcdfe6);
  border-radius: 2px;
  transform: rotate(-45deg);
}
.base-table__empty-text {
  color: var(--color-text-tertiary, #c0c4cc);
  font-size: var(--font-sm, 13px);
}

/* ======================== 分页 ======================== */
.base-paginated {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-4, 16px) var(--space-6, 24px);
  font-size: var(--font-sm, 13px);
  justify-content: space-between;
  border-top: 1px solid var(--color-divider, #f0f0f0);
  flex-wrap: wrap;
}
.base-paginated__total {
  color: var(--color-text-secondary, #909399);
}
.base-paginated__total strong {
  color: var(--color-text, #303133);
  font-weight: 600;
  margin: 0 var(--space-1, 4px);
}
.base-paginated__right {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
}
.base-paginated__size-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2, 8px);
  min-width: 110px;
  height: 32px;
  padding: 0 var(--space-3, 12px);
  border: 1px solid var(--color-border, #dcdfe6);
  background: var(--color-surface, #fff);
  color: var(--color-text, #303133);
  cursor: pointer;
  border-radius: var(--radius-md, 8px);
}
.base-paginated__size-select:hover {
  border-color: var(--color-primary, #409eff);
}
.base-paginated__size-select-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  transition: transform 0.2s;
  opacity: 0.6;
}
.base-paginated__size-select.is-open .base-paginated__size-select-arrow {
  transform: rotate(180deg);
}
.base-paginated__size-select-panel {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.12));
  padding: var(--space-1, 4px) 0;
  z-index: 10;
}
.base-paginated__size-select-option {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  cursor: pointer;
}
.base-paginated__size-select-option:hover {
  background: var(--color-bg-hover, #f5f7fa);
}
.base-paginated__size-select-option.is-active {
  background: var(--color-primary-light, #ecf5ff);
  color: var(--color-primary, #409eff);
  font-weight: 600;
}
.base-paginated__buttons {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
}
.base-paginated__page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 var(--space-2, 8px);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: var(--font-sm, 13px);
  transition: all 0.2s;
}
.base-paginated__page-btn:hover {
  border-color: var(--color-primary, #409eff);
  color: var(--color-primary, #409eff);
}
.base-paginated__page-btn.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.base-paginated__page-btn.is-active {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
  color: var(--color-text-inverse, #fff);
}
.base-paginated__ellipsis {
  padding: 0 4px;
  color: var(--color-text-tertiary, #c0c4cc);
}
.base-paginated__jumper {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  color: var(--color-text-secondary, #909399);
}
.base-paginated__jumper-input {
  min-width: 50px;
  height: 28px;
  padding: 0 var(--space-2, 8px);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-sm, 8px);
  background: var(--color-surface, #fff);
  text-align: center;
  font-weight: 600;
  color: var(--color-text, #303133);
  outline: none;
  font-size: var(--font-sm, 13px);
}
.base-paginated__jumper-input:focus {
  border-color: var(--color-primary, #409eff);
}

/* ======================== 弹窗 ======================== */
.base-crud-page__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
}
.base-crud-page__modal-overlay.is-visible {
  opacity: 1;
  visibility: visible;
}
.base-crud-page__modal {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 12px);
  width: 90%;
  max-width: 640px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.12));
  transform: translateY(-20px);
  transition: transform 0.2s;
}
.base-crud-page__modal-overlay.is-visible .base-crud-page__modal {
  transform: translateY(0);
}
.base-crud-page__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4, 16px) var(--space-6, 24px);
  border-bottom: 1px solid var(--color-divider, #f0f0f0);
}
.base-crud-page__modal-header h3 {
  margin: 0;
  font-size: var(--font-base, 14px);
  font-weight: 600;
  color: var(--color-text, #303133);
}
.base-crud-page__modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  color: var(--color-text-tertiary, #c0c4cc);
  transition: all 0.2s;
  font-size: var(--font-base, 14px);
}
.base-crud-page__modal-close:hover {
  background: var(--color-bg-hover, #f5f7fa);
  color: var(--color-text, #303133);
}
.base-crud-page__modal-body {
  padding: var(--space-5, 20px) var(--space-6, 24px);
  overflow-y: auto;
  flex: 1;
}
.base-crud-page__form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4, 16px) var(--space-5, 20px);
}
.base-crud-page__form-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}
.base-crud-page__form-item--full {
  grid-column: 1 / -1;
}
.base-crud-page__form-label {
  font-size: var(--font-sm, 13px);
  color: var(--color-text, #303133);
  font-weight: 500;
}
.base-crud-page__form-label .is-required {
  color: var(--color-danger, #f56c6c);
  margin-left: 2px;
}
.base-crud-page__form-error {
  font-size: var(--font-xs, 12px);
  color: var(--color-danger, #f56c6c);
  min-height: 18px;
}
.base-crud-page__textarea {
  width: 100%;
  min-height: 80px;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-sm, 13px);
  resize: vertical;
  font-family: inherit;
  background: var(--color-surface, #fff);
  color: var(--color-text, #303133);
  transition: all 0.2s;
}
.base-crud-page__textarea:focus {
  outline: none;
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 2px var(--color-primary-light, #ecf5ff);
}
.base-crud-page__textarea::placeholder {
  color: var(--color-text-tertiary, #c0c4cc);
}
.base-crud-page__textarea:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-tertiary, #c0c4cc);
  pointer-events: none;
}
.base-crud-page__modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3, 12px);
  padding: var(--space-4, 16px) var(--space-6, 24px);
  border-top: 1px solid var(--color-divider, #f0f0f0);
}

/* ======================== 开关 ======================== */
.base-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  cursor: pointer;
  user-select: none;
}
.base-switch__track {
  width: 40px;
  height: 22px;
  border-radius: 999px;
  background: var(--color-border, #dcdfe6);
  transition: all 0.3s;
  position: relative;
}
.base-switch.is-on .base-switch__track {
  background: var(--color-primary, #409eff);
}
.base-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: all 0.3s;
}
.base-switch.is-on .base-switch__thumb {
  left: 20px;
}
.base-switch__label {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-secondary, #909399);
}

/* ======================== 确认弹窗 ======================== */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
}
.confirm-overlay.is-visible {
  opacity: 1;
  visibility: visible;
}
.confirm-box {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-6, 24px);
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.12));
  transform: translateY(-20px);
  transition: transform 0.2s;
}
.confirm-overlay.is-visible .confirm-box {
  transform: translateY(0);
}
.confirm-box__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-warning-light, #fdf6ec);
  margin: 0 auto var(--space-4, 16px);
}
.confirm-box__icon-shape {
  font-size: 24px;
  color: var(--color-warning, #e6a23c);
}
.confirm-box__title {
  text-align: center;
  font-size: var(--font-base, 14px);
  font-weight: 600;
  margin-bottom: var(--space-2, 8px);
}
.confirm-box__desc {
  text-align: center;
  color: var(--color-text-secondary, #909399);
  font-size: var(--font-sm, 13px);
  margin-bottom: var(--space-5, 20px);
}
.confirm-box__btns {
  display: flex;
  gap: var(--space-3, 12px);
  justify-content: center;
}

/* ======================== Toast ======================== */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-60px);
  display: inline-flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) var(--space-5, 20px);
  border-radius: 999px;
  background: var(--color-surface, #fff);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08));
  z-index: 2000;
  font-size: var(--font-sm, 13px);
  opacity: 0;
  transition: all 0.3s;
}
.toast.is-visible {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
.toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--color-text-inverse, #fff);
  font-size: var(--font-xs, 12px);
  font-weight: 700;
  flex-shrink: 0;
  background: var(--color-success, #67c23a);
}
.toast--danger .toast__icon {
  background: var(--color-danger, #f56c6c);
}
.toast--warning .toast__icon {
  background: var(--color-warning, #e6a23c);
}

/* ======================== 响应式 ======================== */
@media (max-width: 768px) {
  .base-crud-page__search-row {
    flex-direction: column;
  }
  .base-crud-page__search-field {
    min-width: 100%;
  }
  .base-crud-page__search-btns {
    margin-left: 0;
    width: 100%;
  }
  .base-crud-page__form-grid {
    grid-template-columns: 1fr;
  }
  .base-paginated {
    flex-direction: column;
    gap: var(--space-3, 12px);
  }
  .base-paginated__right {
    flex-wrap: wrap;
    justify-content: center;
  }
}
```

## 3 件套

### types/crud.ts

```typescript
// CRUD 页面类型定义

export interface Column {
  prop: string;
  label: string;
  width?: number | string;
  sortable?: boolean;
  fixed?: 'left' | 'right';
  formatter?: (row: any, column: Column, cell: any) => string;
}

export interface SearchField {
  type: 'input' | 'select' | 'datepicker';
  key: string;
  label?: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
  wide?: boolean;
  advanced?: boolean;
}

export interface FormField {
  type: 'input' | 'select' | 'datepicker' | 'textarea' | 'switch';
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rules?: ValidationRule[];
  options?: { label: string; value: any }[];
  props?: Record<string, any>;
  span?: 1 | 2;
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone';
  pattern?: RegExp;
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
  showBatchDelete?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  addBtnText?: string;
  searchBtnText?: string;
  resetBtnText?: string;
  modalTitle?: string;
  rowKey?: string;
}

export interface CrudEmits {
  search: [params: object];
  reset: [];
  add: [formData: object];
  edit: [row: object, formData: object];
  delete: [row: object];
  'batch-delete': [rows: object[]];
  export: [];
  refresh: [];
  'page-change': [page: number, pageSize: number];
  'sort-change': [field: string, order: 'asc' | 'desc' | ''];
}
```

### composables/useCrud.ts

```typescript
// CRUD 逻辑复用 — 搜索/排序/选择/弹窗/校验/分页 全内置

import { ref, computed } from 'vue';

export function useCrud<T extends Record<string, any>>(options: {
  rowKey?: string;
  loadData: (params: any) => Promise<{ data: T[]; total: number }>;
  onAdd?: (data: Partial<T>) => Promise<T>;
  onEdit?: (row: T, data: Partial<T>) => Promise<T>;
  onDelete?: (row: T) => Promise<void>;
  onBatchDelete?: (rows: T[]) => Promise<void>;
}) {
  const rowKey = options.rowKey || 'id';

  // ======================== 数据状态 ========================
  const data = ref<T[]>([]) as any;
  const loading = ref(false);
  const pagination = ref({ page: 1, pageSize: 10, total: 0 });

  // ======================== 搜索状态 ========================
  const searchParams = ref<Record<string, any>>({});

  function setSearchParam(key: string, value: any) {
    searchParams.value[key] = value;
  }

  function resetSearchParams() {
    Object.keys(searchParams.value).forEach(k => { searchParams.value[k] = ''; });
  }

  // ======================== 排序状态 ========================
  const sortField = ref('');
  const sortOrder = ref<'asc' | 'desc' | ''>('');

  function toggleSort(field: string) {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? '' : 'asc';
      if (sortOrder.value === '') sortField.value = '';
    } else {
      sortField.value = field;
      sortOrder.value = 'asc';
    }
  }

  // ======================== 选择状态 ========================
  const selectedIds = ref<Set<any>>(new Set());

  function getRowId(row: T) { return (row as any)[rowKey]; }

  function toggleRow(row: T) {
    const id = getRowId(row);
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
    selectedIds.value = new Set(selectedIds.value);
  }

  function toggleSelectAll() {
    const pageIds = (data.value as T[]).map(r => getRowId(r));
    const allSelected = pageIds.every(id => selectedIds.value.has(id));
    if (allSelected) {
      pageIds.forEach(id => selectedIds.value.delete(id));
    } else {
      pageIds.forEach(id => selectedIds.value.add(id));
    }
    selectedIds.value = new Set(selectedIds.value);
  }

  function clearSelection() {
    selectedIds.value.clear();
    selectedIds.value = new Set(selectedIds.value);
  }

  const selectedCount = computed(() => selectedIds.value.size);
  const selectedRows = computed(() => (data.value as T[]).filter(r => selectedIds.value.has(getRowId(r))));

  // ======================== 弹窗状态 ========================
  const modalVisible = ref(false);
  const modalMode = ref<'add' | 'edit'>('add');
  const currentRow = ref<T | null>(null);
  const formData = ref<Record<string, any>>({});
  const formErrors = ref<Record<string, string>>({});
  const formLoading = ref(false);

  // ======================== 确认弹窗 ========================
  const confirmVisible = ref(false);
  const confirmDesc = ref('');

  // ======================== 加载数据 ========================
  async function load(params: any = {}) {
    loading.value = true;
    try {
      const result = await options.loadData({
        ...searchParams.value,
        ...params,
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
      });
      data.value = result.data;
      pagination.value.total = result.total;
    } finally {
      loading.value = false;
    }
  }

  async function search() {
    pagination.value.page = 1;
    clearSelection();
    await load();
  }

  async function reset() {
    resetSearchParams();
    pagination.value.page = 1;
    sortField.value = '';
    sortOrder.value = '';
    clearSelection();
    await load();
  }

  async function refresh() {
    clearSelection();
    await load();
  }

  // ======================== CRUD 操作 ========================
  async function add(fd: Partial<T>) {
    if (options.onAdd) {
      const result = await options.onAdd(fd);
      await load();
      return result;
    }
  }

  async function edit(row: T, fd: Partial<T>) {
    if (options.onEdit) {
      const result = await options.onEdit(row, fd);
      await load();
      return result;
    }
  }

  async function remove(row: T) {
    if (options.onDelete) {
      await options.onDelete(row);
      selectedIds.value.delete(getRowId(row));
      selectedIds.value = new Set(selectedIds.value);
      await load();
    }
  }

  async function batchRemove(rows: T[]) {
    if (options.onBatchDelete) {
      await options.onBatchDelete(rows);
      clearSelection();
      await load();
    }
  }

  // ======================== 分页 ========================
  function changePage(page: number, pageSize?: number) {
    pagination.value.page = page;
    if (pageSize) pagination.value.pageSize = pageSize;
    load();
  }

  return {
    // 状态
    data,
    loading,
    pagination,
    searchParams,
    sortField,
    sortOrder,
    selectedIds,
    selectedCount,
    selectedRows,
    modalVisible,
    modalMode,
    currentRow,
    formData,
    formErrors,
    formLoading,
    confirmVisible,
    confirmDesc,
    // 方法
    load,
    search,
    reset,
    refresh,
    add,
    edit,
    remove,
    batchRemove,
    changePage,
    toggleSort,
    toggleRow,
    toggleSelectAll,
    clearSelection,
    setSearchParam,
    resetSearchParams,
  };
}
```

### index.ts

```typescript
export { default as BaseCrudPage } from './BaseCrudPage.vue';
export type { Column, SearchField, FormField, ValidationRule, Pagination, CrudProps, CrudEmits } from './types/crud';
export { useCrud } from './composables/useCrud';
```

## 使用示例

### 基础 CRUD + useCrud

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { BaseCrudPage, useCrud } from './components/crud';
import { request } from '@/utils/request'; // frontend-request-skill 生成

const columns = [
  { prop: 'id', label: 'ID', width: 70 },
  { prop: 'name', label: '姓名', width: 120, sortable: true },
  { prop: 'email', label: '邮箱' },
  { prop: 'phone', label: '手机号', width: 120 },
  { prop: 'role', label: '角色', width: 100 },
  { prop: 'status', label: '状态', width: 80 },
  { prop: 'createdAt', label: '创建时间', width: 160, sortable: true },
];

const searchFields = [
  // 基础搜索行
  { type: 'input', key: 'name', label: '姓名', placeholder: '请输入姓名' },
  { type: 'input', key: 'email', label: '邮箱', placeholder: '请输入邮箱' },
  { type: 'select', key: 'status', label: '状态', placeholder: '全部', options: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ]},
  { type: 'select', key: 'role', label: '角色', placeholder: '全部', options: [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '访客', value: 'guest' },
  ]},
  // 高级搜索行（展开后显示）
  { type: 'datepicker', key: 'createdAt', label: '创建时间', wide: true, advanced: true },
  { type: 'input', key: 'phone', label: '手机号', placeholder: '请输入手机号', advanced: true },
];

const formFields = [
  { type: 'input', key: 'name', label: '姓名', required: true },
  { type: 'input', key: 'email', label: '邮箱', rules: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' },
  ]},
  { type: 'input', key: 'phone', label: '手机号' },
  { type: 'select', key: 'role', label: '角色', options: [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '访客', value: 'guest' },
  ]},
  { type: 'select', key: 'gender', label: '性别', options: [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' },
  ]},
  { type: 'switch', key: 'status', label: '状态' },
  { type: 'textarea', key: 'remark', label: '备注', span: 2 },
  { type: 'datepicker', key: 'joinDate', label: '入职日期' },
];

const crud = useCrud({
  loadData: async (params) => {
    // 对接 api-contract 响应信封 { code, data: { list, total } }
    const res = await request.get('/api/users', { params });
    return { data: res.data.list, total: res.data.total };
  },
  onAdd: async (data) => {
    const res = await request.post('/api/users', data);
    return res.data;
  },
  onEdit: async (row, data) => {
    const res = await request.put(`/api/users/${row.id}`, data);
    return res.data;
  },
  onDelete: async (row) => {
    await request.delete(`/api/users/${row.id}`);
  },
  onBatchDelete: async (rows) => {
    await request.post('/api/users/batch-delete', { ids: rows.map(r => r.id) });
  },
});

onMounted(() => crud.load());
</script>

<template>
  <BaseCrudPage
    :columns="columns"
    :search-fields="searchFields"
    :form-fields="formFields"
    :data="crud.data.value"
    :loading="crud.loading.value"
    :pagination="crud.pagination.value"
    modal-title="用户"
    @search="crud.search"
    @reset="crud.reset"
    @add="crud.add"
    @edit="crud.edit"
    @delete="crud.remove"
    @batch-delete="crud.batchRemove"
    @page-change="crud.changePage"
    @sort-change="(_, __) => { crud.toggleSort(_); crud.load(); }"
    @refresh="crud.refresh"
  />
</template>
```

### 自定义单元格（Slot）

```vue
<template>
  <BaseCrudPage ...>
    <!-- 自定义状态列渲染 -->
    <template #cell-status="{ value }">
      <span :class="value === 1 ? 'text-success' : 'text-danger'">
        {{ value === 1 ? '启用' : '禁用' }}
      </span>
    </template>

    <!-- 自定义角色列渲染 -->
    <template #cell-role="{ value }">
      <span class="tag">{{ { admin: '管理员', user: '用户', guest: '访客' }[value] || value }}</span>
    </template>
  </BaseCrudPage>
</template>
```

## 触发词

- "Vue CRUD"
- "vue-crud"
- "增删改查"
- "管理页面"
- "数据管理"
- "BaseCrudPage"
- "表格表单"
- "列表页"
