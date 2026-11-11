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

### 选中值

单选沿用由 separator 连接的完整路径。多选沿用字符串数组，使用全树唯一的节点值。默认仅提交叶子节点，checkStrictly 开启时可选择父节点。通过 v-model 回传变更后更新选中标签和显示值。
