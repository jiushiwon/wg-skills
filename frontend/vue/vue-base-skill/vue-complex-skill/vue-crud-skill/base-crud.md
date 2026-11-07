# base-crud

> 增删改查页面组件。搜索筛选 + 表格 + 工具栏 + 新增/编辑弹窗 + 删除确认 + Toast 反馈。
>
> **必须**嵌入 `<base-card>` 使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `Column[]` | `[]` | 表格列配置 |
| searchFields | `SearchField[]` | `[]` | 搜索字段配置（支持高级搜索） |
| formFields | `FormField[]` | `[]` | 表单字段配置（支持校验） |
| data | `any[]` | `[]` | 表格数据 |
| loading | `boolean` | `false` | 加载状态（显示遮罩动画） |
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

## 类型定义

```typescript
interface Column {
  prop: string;
  label: string;
  width?: number | string;    // 固定宽度(px) 或 flex 比例
  sortable?: boolean;
  formatter?: (row: any, column: Column, cell: any) => string;
}

interface SearchField {
  type: 'input' | 'select' | 'datepicker';
  key: string;
  label?: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
  wide?: boolean;             // 宽度加倍
  advanced?: boolean;         // 高级搜索区
}

interface FormField {
  type: 'input' | 'select' | 'datepicker' | 'textarea' | 'switch';
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rules?: ValidationRule[];
  options?: { label: string; value: any }[];
  span?: 1 | 2;              // 2 = 满行
}

interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email';
  pattern?: RegExp;
  min?: number;
  max?: number;
  message: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}
```

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| search | `params: object` | 点击搜索，含搜索条件 + 分页参数 |
| reset | - | 点击重置 |
| add | `formData: object => Promise` | 新增保存（返回 Promise 控制 loading） |
| edit | `row: object, formData: object => Promise` | 编辑保存 |
| delete | `row: object => Promise` | 删除单条 |
| batch-delete | `rows: object[] => Promise` | 批量删除 |
| export | - | 点击导出 |
| refresh | - | 点击刷新 |
| page-change | `page: number, pageSize: number` | 分页变化 |
| sort-change | `field: string, order: 'asc'\|'desc'\|''` | 排序变化 |

## Slots

| Slot | 参数 | 说明 |
|------|------|------|
| `cell-{prop}` | `{ row, value }` | 自定义单元格渲染（如状态标签、角色标签） |

## 渲染结构

```vue
<div class="base-crud-page">
  <!-- 搜索区 -->
  <div class="base-crud-page__search">
    <div class="base-crud-page__search-row">
      <!-- 基础搜索字段 -->
      <base-input / <base-select / <base-datepicker
      <!-- 高级搜索按钮 -->
      <span role="button">高级搜索 ▼</span>
      <span role="button">搜索</span>
      <span role="button">重置</span>
    </div>
    <!-- 高级搜索（展开/收起） -->
    <div class="base-crud-page__search-advanced">
      <base-input / <base-select / <base-datepicker
    </div>
  </div>

  <!-- 工具栏 -->
  <div class="base-crud-page__toolbar">
    <span role="button">+ 新增</span>
    <span role="button">批量删除</span>
    <span role="button">导出</span>
    <span role="button">↻ 刷新</span>
    <span>已选 N 项</span>
  </div>

  <!-- 加载遮罩 -->
  <div class="base-crud-page__loading-overlay">
    <div class="spinner"></div>
    <span>加载中...</span>
  </div>

  <!-- 表格 -->
  <div class="base-table" role="grid">
    <div class="base-table__row--header" role="row">
      <div class="checkbox">全选</div>
      <div v-for="col" role="columnheader">标签 ▲▼</div>
      <div>操作</div>
    </div>
    <div class="base-table__row--data" role="row">
      <div class="checkbox">行选</div>
      <div v-for="col" role="gridcell">{{ 值 }}</div>
      <div class="actions">
        <span role="button">编辑</span>
        <span role="button">删除</span>
      </div>
    </div>
  </div>

  <!-- 分页 -->
  <div class="base-paginated">
    <span>共 N 条</span>
    <div>
      <select>10/20/50 条/页</select>
      <span role="button">‹</span>
      <span>1 2 3 ...</span>
      <span role="button">›</span>
      <span>跳至 [input] 页</span>
    </div>
  </div>

  <!-- 新增/编辑弹窗 -->
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">新增/编辑 {{ modalTitle }}</div>
      <div class="modal-body">
        <div class="form-grid">
          <base-input / <base-select / <base-datepicker / <switch / <textarea
        </div>
        <span class="form-error">{{ 校验错误 }}</span>
      </div>
      <div class="modal-footer">
        <span role="button">取消</span>
        <span role="button">保存</span>
      </div>
    </div>
  </div>

  <!-- 删除确认弹窗 -->
  <div class="confirm-overlay">
    <div class="confirm-box">
      <span>⚠ 确认删除</span>
      <span role="button">取消</span>
      <span role="button">确认删除</span>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast">✓ 操作成功</div>
</div>
```

## 约束

- **零 HTML5 标签**：表格用 `<div role="grid">`，按钮用 `<span role="button">`，复选框用 `<div role="checkbox">`
- **容器原则**：必须嵌入 `<base-card>` 使用
- **Design Token**：所有颜色/间距/圆角使用 `var(--color-*)`、`var(--space-*)`、`var(--radius-*)`
- **响应式**：768px 以下搜索区纵向排列，表单单列
