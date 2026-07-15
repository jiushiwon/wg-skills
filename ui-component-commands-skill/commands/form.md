# 表单类组件

## search-bar 搜索栏

**说明**：搜索输入框

**别名**：搜索框、搜索输入

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | string | '' | 输入值 |
| placeholder | string | '搜索' | 占位符 |
| clearable | boolean | true | 显示清除按钮 |
| focus | boolean | false | 自动聚焦 |

**事件**：
- search：回车搜索
- clear：清除内容
- input：输入变化

**用法**：
```vue
<search-bar v-model="keyword" placeholder="请输入搜索内容" @search="onSearch" />
```

---

## input-field 表单项

**说明**：带标签的输入框

**别名**：输入框、表单项

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string | '' | 标签 |
| value | string | '' | 值 |
| type | string | 'text' | 类型(text/password/number) |
| placeholder | string | '' | 占位符 |
| error | string | '' | 错误信息 |
| required | boolean | false | 必填标记 |

**用法**：
```vue
<input-field label="用户名" v-model="form.username" placeholder="请输入用户名" required />
<input-field label="密码" type="password" v-model="form.password" error="密码错误" />
```

---

## picker 选择器

**说明**：下拉选择器

**别名**：下拉选择

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | string/number | '' | 选中值 |
| options | array | [] | 选项 [{label, value}] |
| placeholder | string | '请选择' | 占位符 |

**事件**：
- change：选择变化

**用法**：
```vue
<picker
  v-model="selected"
  :options="[{label: '选项1', value: 1}, {label: '选项2', value: 2}]"
  @change="onChange"
/>
```

---

## date-picker 日期选择器

**说明**：日期选择

**别名**：日期选择

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | string | '' | 日期值 |
| mode | string | 'date' | 模式(date/time/datetime) |
| start | string | '' | 开始日期 |
| end | string | '' | 结束日期 |

**用法**：
```vue
<date-picker v-model="date" mode="date" start="2020-01-01" end="2030-12-31" />
```

---

## switch 开关

**说明**：切换开关

**别名**：切换开关

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | boolean | false | 开关状态 |
| disabled | boolean | false | 禁用 |
| color | string | primary | 开启颜色 |

**事件**：
- change：状态变化

**用法**：
```vue
<switch v-model="enabled" @change="onChange" />
```

---

## checkbox-group 多选组

**说明**：多选框组

**别名**：多选框

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | array | [] | 选中值数组 |
| options | array | [] | 选项配置 |

**用法**：
```vue
<checkbox-group v-model="checked" :options="['选项1', '选项2', '选项3']" />
```

---

## radio-group 单选组

**说明**：单选框组

**别名**：单选框

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | string/number | '' | 选中值 |
| options | array | [] | 选项配置 |

**用法**：
```vue
<radio-group v-model="selected" :options="[{label: '男', value: 1}, {label: '女', value: 2}]" />
```
