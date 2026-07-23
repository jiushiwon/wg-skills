# Table 表格组件

通用数据表格组件，支持排序、分页、选中、斑马纹等功能。

## 功能特性

- ✅ 列配置灵活，支持自定义渲染
- ✅ 支持排序（点击表头切换）
- ✅ 支持分页
- ✅ 支持行选中
- ✅ 斑马纹显示
- ✅ 边框可选
- ✅ 悬停效果
- ✅ 插槽支持自定义列内容

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | Array | [] | 列配置数组 |
| data | Array | [] | 表格数据 |
| rowKey | String | 'id' | 行唯一标识字段 |
| stripe | Boolean | true | 是否显示斑马纹 |
| border | Boolean | false | 是否显示边框 |
| hoverable | Boolean | true | 是否显示悬停效果 |
| emptyText | String | '暂无数据' | 空状态文字 |
| pagination | Boolean | false | 是否显示分页 |
| pageSize | Number | 10 | 每页条数 |
| currentPageProp | Number | 1 | 当前页码 |

## Columns 配置

| 属性 | 类型 | 说明 |
|------|------|------|
| key | String | 字段名（对应数据key） |
| title | String | 列标题 |
| width | String | 列宽度 |
| align | String | 对齐方式 left/center/right |
| sortable | Boolean | 是否可排序 |
| render | Function | 自定义渲染函数 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| sort | { key, order } | 排序变化 |
| row-click | { row, index } | 行点击 |
| page-change | page | 页码变化 |
| selection-change | selection | 选中变化 |

## Methods

通过 ref 调用：

| 方法名 | 参数 | 说明 |
|--------|------|------|
| sort | (key, order) | 手动排序 |
| clearSort | - | 清除排序 |
| clearSelection | - | 清除选中 |
| getSelection | - | 获取选中行 |

## 使用示例

### 基本用法

```vue
<template>
  <t-table
    :columns="columns"
    :data="tableData"
    row-key="id"
  />
</template>

<script setup>
import { ref } from 'vue'
import TTable from '@/components/uniapp-vue3/table/table.vue'

const columns = ref([
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
  { key: 'email', title: '邮箱' }
])

const tableData = ref([
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' }
])
</script>
```

### 带排序

```vue
<template>
  <t-table
    :columns="columns"
    :data="tableData"
    row-key="id"
    @sort="handleSort"
  />
</template>

<script setup>
const columns = [
  { key: 'name', title: '姓名', sortable: true },
  { key: 'age', title: '年龄', sortable: true }
]
</script>
```

### 带分页

```vue
<template>
  <t-table
    :columns="columns"
    :data="tableData"
    row-key="id"
    :pagination="true"
    :page-size="10"
    @page-change="handlePageChange"
  />
</template>
```

### 自定义列内容

```vue
<template>
  <t-table :columns="columns" :data="tableData" row-key="id">
    <template #status="{ value }">
      <text :class="'status-' + value">{{ getStatusText(value) }}</text>
    </template>
    <template #actions="{ row }">
      <button @click="handleEdit(row)">编辑</button>
    </template>
  </t-table>
</template>

<script setup>
const columns = [
  { key: 'name', title: '姓名' },
  { key: 'status', title: '状态' },
  { key: 'actions', title: '操作' }
]
</script>
```

### 获取选中行

```vue
<template>
  <t-table
    ref="tableRef"
    :columns="columns"
    :data="tableData"
    row-key="id"
  />
  <button @click="handleGetSelection">获取选中</button>
</template>

<script setup>
const tableRef = ref(null)

function handleGetSelection() {
  const selection = tableRef.value.getSelection()
  console.log('选中行:', selection)
}
</script>
```

## 样式变量

组件使用以下 CSS 变量（可在全局覆盖）：

```css
:root {
  --color-bg-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --primary-50: #f9fafb;
  --radius-card: 12px;
}
```
