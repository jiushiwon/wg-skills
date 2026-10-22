# base-cascader

> 级联选择器组件，用于选择具有层级结构的数据。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string \| string[]` | `''` | v-model 绑定值 |
| options | `CascaderOption[]` | `[]` | 级联数据 |
| placeholder | `string` | `'请选择'` | 占位符 |
| disabled | `boolean` | `false` | 禁用 |
| clearable | `boolean` | `true` | 可清除 |
| filterable | `boolean` | `false` | 可搜索 |
| multiple | `boolean` | `false` | 多选模式 |
| checkStrictly | `boolean` | `false` | 父子不关联 |
| showAllLevels | `boolean` | `true` | 显示完整路径 |
| collapseTags | `boolean` | `false` | 多选时折叠标签 |
| separator | `string` | `'/'` | 路径分隔符 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `string \| string[]` | 值变化 |
| change | `{ value, selectedOptions }` | 选择变化 |
| clear | - | 清除选中 |

## Slots

| 名称 | 说明 |
|------|------|
| default | 自定义触发器 |
| empty | 无数据时显示 |
