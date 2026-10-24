# 表单类组件（form）

> 实现真源：`vibeCoding/frontend/uniapp/uniapp-base-skill/`（本模块即实现层）
> 本文件由 `components/_registry.json` + 各组件 `props.json` 同步生成，**改实现必须重新生成本文件**。
> 重新生成：`node scripts/gen-commands.js`

## 总览

| 组件 | 说明 | 别名 | 类型 |
|------|------|------|------|
| `base-button` | 统一按钮样式：primary / ghost / text / danger × sm / md / lg，支持 loading / disabled / block / round | base-button / 按钮 / button / 提交按钮 / 主按钮 / 次按钮 | 组件 |
| `checkbox-group` | 多选框组，支持 options 驱动的多值选择 | 多选框 / checkbox-group / 复选框 / 多选 | 组件 |
| `date-picker` | 底部弹出的年/月/日三列滑轮选择器，基于 BasePopup 容器 | 日期选择 / date-picker / 年月日选择 / 日期滚轮 | 组件 |
| `input-field` | 表单项，基于 BaseFormItem 容器，支持标签、清除与错误提示 | 输入框 / input-field / 表单输入 / 文本输入 | 组件 |
| `picker` | 底部弹出的多列滚轮选择器，基于 BasePopup 容器 | 选择器 / picker / 下拉选择 / 滚轮选择 | 组件 |
| `radio-group` | 单选框组，支持 options 驱动的单值选择 | 单选框 / radio-group / 单选按钮 / radio | 组件 |
| `search-bar` | 搜索栏，支持输入、清除、确认搜索与取消 | 搜索框 / search-bar / 查询栏 / 搜索输入 | 组件 |
| `switch` | 开关选择器，支持主题色与自定义轨道色 | 开关 / switch / 切换开关 / toggle | 组件 |

---

## base-button 按钮

**说明**：统一按钮样式：primary / ghost / text / danger × sm / md / lg，支持 loading / disabled / block / round

**别名**：base-button、按钮、button、提交按钮、主按钮、次按钮

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/form/base-button/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'primary' \| 'ghost' \| 'text' \| 'danger'` | `primary` | 按钮类型 |
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | 尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中（内置转圈并禁用点击） |
| `block` | `boolean` | `false` | 块级，宽度 100% |
| `shape` | `'radius' \| 'round'` | `radius` | 圆角风格 |
| `icon` | `string` |  | 左侧图标地址 |
| `text` | `string` | `按钮` | 按钮文字，默认插槽优先 |

**事件**：

- `click`

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 按钮内容，优先于 text |

**用法**：见 [usage.md](../components/form/base-button/usage.md)

---

## checkbox-group 复选框组

**说明**：多选框组，支持 options 驱动的多值选择

**别名**：多选框、checkbox-group、复选框、多选

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/form/checkbox-group/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `array` | `[]` | 绑定值数组，元素为选中的 option.value（string \| number） |
| `label` | `string` |  | 分组标题，为空时不渲染 |
| `options` | `array` | `[]` | 选项列表 [{ label: string, value: string \| number }] |
| `disabled` | `boolean` | `false` | 整组禁用，禁用时点击不触发变更 |

**事件**：

- `update:modelValue`
- `change`

**用法**：见 [usage.md](../components/form/checkbox-group/usage.md)

---

## date-picker 日期选择器

**说明**：底部弹出的年/月/日三列滑轮选择器，基于 BasePopup 容器

**别名**：日期选择、date-picker、年月日选择、日期滚轮

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/form/date-picker/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` |  | 选中日期，格式 YYYY-MM-DD，v-model 双向绑定 |
| `show` | `boolean` | `false` | 弹层是否显示 |
| `min` | `number` | `1970` | 最小年份 |
| `max` | `number` | `2100` | 最大年份 |
| `format` | `string` | `YYYY-MM-DD` | 展示与确认载荷格式，支持 YYYY / MM / DD 占位 |
| `title` | `string` | `选择日期` | 弹窗标题 |
| `confirmText` | `string` | `确认` | 确认按钮文案 |
| `cancelText` | `string` | `取消` | 取消按钮文案 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `safeArea` | `boolean` | `true` | 底部是否适配安全区 |

**事件**：

- `update:modelValue`
- `update:show`
- `change`
- `confirm`
- `cancel`

**插槽**：

| 名称 | 说明 |
|------|------|
| `header-right` | 标题栏右侧自定义区域 |

**用法**：见 [usage.md](../components/form/date-picker/usage.md)

---

## input-field 输入框

**说明**：表单项，基于 BaseFormItem 容器，支持标签、清除与错误提示

**别名**：输入框、input-field、表单输入、文本输入

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/form/input-field/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `'string' \| 'number'` |  | 绑定值 |
| `label` | `string` |  | 标签文案，为空时隐藏标签列 |
| `type` | `string` | `text` | 输入类型，text / number / idcard / digit 等 |
| `placeholder` | `string` |  | 占位文案 |
| `disabled` | `boolean` | `false` | 禁用输入 |
| `maxlength` | `number` | `-1` | 最大长度，-1 表示不限制 |
| `clearable` | `boolean` | `false` | 有内容时显示清除按钮 |
| `error` | `boolean` | `false` | 错误状态，输入框描边转红 |
| `errorMessage` | `string` |  | 错误提示文案，error 为 true 时显示在控件下方 |
| `labelWidth` | `string` | `160rpx` | 标签列宽 |
| `adjustPosition` | `boolean` | `true` | 键盘弹起时是否自动上推页面（小程序端） |
| `cursorSpacing` | `number` | `0` | 输入框与键盘的间距（px，仅 adjustPosition 为 true 时生效） |

**事件**：

- `update:modelValue`
- `input`
- `blur`
- `focus`
- `clear`

**用法**：见 [usage.md](../components/form/input-field/usage.md)

---

## picker 滚轮选择器

**说明**：底部弹出的多列滚轮选择器，基于 BasePopup 容器

**别名**：选择器、picker、下拉选择、滚轮选择

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/form/picker/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `array` | `[]` | 各列选中值数组，v-model 双向绑定 |
| `show` | `boolean` | `false` | 弹层是否显示 |
| `columns` | `array` | `[]` | 列数据，多列传二维数组，单列传一维数组 |
| `columnTypes` | `string[]` | `[]` | 每列类型：string / number / date |
| `title` | `string` | `请选择` | 弹窗标题 |
| `confirmText` | `string` | `确认` | 确认按钮文案 |
| `cancelText` | `string` | `取消` | 取消按钮文案 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `safeArea` | `boolean` | `true` | 底部是否适配安全区 |

**事件**：

- `update:modelValue`
- `update:show`
- `change`
- `confirm`
- `cancel`

**插槽**：

| 名称 | 说明 |
|------|------|
| `header-right` | 标题栏右侧自定义区域 |

**用法**：见 [usage.md](../components/form/picker/usage.md)

---

## radio-group 单选框组

**说明**：单选框组，支持 options 驱动的单值选择

**别名**：单选框、radio-group、单选按钮、radio

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/form/radio-group/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `'string' \| 'number'` |  | 绑定值，等于选中的 option.value |
| `label` | `string` |  | 分组标题，为空时不渲染 |
| `options` | `array` | `[]` | 选项列表 [{ label: string, value: string \| number }] |
| `disabled` | `boolean` | `false` | 整组禁用，禁用时点击不触发变更 |

**事件**：

- `update:modelValue`
- `change`

**用法**：见 [usage.md](../components/form/radio-group/usage.md)

---

## search-bar 搜索栏

**说明**：搜索栏，支持输入、清除、确认搜索与取消

**别名**：搜索框、search-bar、查询栏、搜索输入

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/form/search-bar/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` |  | 绑定值 |
| `placeholder` | `string` | `搜索` | 占位文案 |
| `clearable` | `boolean` | `true` | 有内容时显示清除按钮 |
| `showCancel` | `boolean` | `false` | 显示取消按钮 |
| `disabled` | `boolean` | `false` | 禁用输入 |

**事件**：

- `update:modelValue`
- `input`
- `search`
- `clear`
- `cancel`

**用法**：见 [usage.md](../components/form/search-bar/usage.md)

---

## switch 开关

**说明**：开关选择器，支持主题色与自定义轨道色

**别名**：开关、switch、切换开关、toggle

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/form/switch/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `boolean` | `false` | 绑定值，是否开启 |
| `label` | `string` |  | 左侧标签文案，为空时不渲染 |
| `activeColor` | `string` |  | 开启态轨道颜色，留空则用主题主色 --color-primary |
| `inactiveColor` | `string` |  | 关闭态轨道颜色，留空则用主题灰 --text-tertiary |
| `disabled` | `boolean` | `false` | 禁用，点击不触发变更 |

**事件**：

- `update:modelValue`
- `change`

**用法**：见 [usage.md](../components/form/switch/usage.md)
