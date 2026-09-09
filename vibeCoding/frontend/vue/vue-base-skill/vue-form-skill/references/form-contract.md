# form-contract 表单契约规范

> 契约驱动表单的核心规范。定义字段类型枚举、字段描述结构、字段→组件映射、自动校验规则推导，以及与后端 `api-contract.md` / `frontend-request-skill` 的对齐约定。
>
> 本文件是 `base-form-render`（万能表单渲染器）的类型地基。

## 一、核心概念

**契约（FormSchema）** 是一份结构化描述，声明「表单有哪些字段、每个字段是什么类型、是否必填、有哪些选项、如何校验」。

前端拿到契约后，由 `base-form-render` **自动**完成三件事：

1. **生成数据模型 model** —— 按字段类型给默认值
2. **生成校验规则 rules** —— 按 `required` + `type` 自动推导
3. **生成表单 UI** —— 按字段类型分发到对应组件

> 契约即文档：一份契约同时驱动「前端表单渲染」和「后端入参校验」，前后端字段一一对齐，彻底消除"前端写死一个表单、后端再写一套校验"的重复。

## 二、字段类型枚举 FieldType

```typescript
/**
 * 表单字段类型
 * - 文本类：input / textarea / password / number / email / phone / idcard
 * - 选择类：select / radio / checkbox / switch
 * - 时间类：datepicker
 * - 文件类：upload
 */
export type FieldType =
  | 'input'        // 单行文本
  | 'textarea'     // 多行文本
  | 'password'     // 密码
  | 'number'       // 数字
  | 'email'        // 邮箱
  | 'phone'        // 手机号（中国大陆）
  | 'idcard'       // 身份证号（中国大陆）
  | 'select'       // 下拉选择（可多选）
  | 'radio'        // 单选组
  | 'checkbox'     // 复选组
  | 'switch'       // 开关
  | 'datepicker'   // 日期选择
  | 'upload'       // 文件/图片上传
```

## 三、字段 → 组件映射表（核心）

| FieldType | 渲染组件 | model 类型 | 默认值 | 自动推导校验 |
|-----------|----------|-----------|--------|-------------|
| `input` | `base-input`（type=text） | `string` | `''` | required / minLength / maxLength |
| `textarea` | `base-input`（type=textarea） | `string` | `''` | required / minLength / maxLength |
| `password` | `base-input`（type=password） | `string` | `''` | required / strongPassword |
| `number` | `base-input`（type=text + number 校验） | `number \| string` | `''` | required / number |
| `email` | `base-input`（type=text + email 校验） | `string` | `''` | required / email |
| `phone` | `base-input`（type=text + phone 校验） | `string` | `''` | required / phone |
| `idcard` | `base-input`（type=text + idCard 校验） | `string` | `''` | required / idCard |
| `select` | `base-select` | `unknown \| unknown[]` | `undefined / []` | required |
| `radio` | `base-radio-group` | `unknown` | `undefined` | required |
| `checkbox` | `base-checkbox-group` | `unknown[]` | `[]` | required（至少选一项） |
| `switch` | `base-switch` | `boolean` | `false` | — |
| `datepicker` | `base-datepicker` | `string \| null` | `null` | required |
| `upload` | `base-upload` | `string[]` | `[]` | required（至少一张） |

## 四、字段描述结构 FormField

```typescript
/** 通用选项结构（select / radio / checkbox 共用） */
export interface FormOption {
  label: string
  value: unknown
  disabled?: boolean
}

/** 单个字段描述 */
export interface FormField {
  /** 字段名，对应 model 的 key，同时对齐后端入参字段名 */
  prop: string
  /** 标签文本 */
  label: string
  /** 字段类型 */
  type: FieldType
  /** 是否必填（自动生成 required 规则 + 星号标记） */
  required?: boolean
  /** 占位符，默认 `请输入${label}` */
  placeholder?: string
  /** 默认值（覆盖类型默认值） */
  defaultValue?: unknown
  /** select / radio / checkbox 的选项 */
  options?: FormOption[]
  /** 额外校验规则（追加到自动推导规则之后） */
  rules?: FormRule[]
  /** 禁用 */
  disabled?: boolean
  /** 只读 */
  readonly?: boolean
  /** 帮助文本 */
  help?: string
  /** 栅格占比（1-24，用于多列布局） */
  span?: number

  // ---- 文本类专属 ----
  /** 最大长度 */
  maxlength?: number
  /** 最小长度 */
  minlength?: number
  /** textarea 行数 */
  rows?: number

  // ---- select 专属 ----
  /** 是否多选 */
  multiple?: boolean
  /** 是否可搜索 */
  searchable?: boolean

  // ---- datepicker 专属 ----
  /** 日期类型 */
  dateType?: 'date' | 'daterange' | 'month' | 'year'

  // ---- upload 专属 ----
  /** 最大上传数量 */
  maxCount?: number
  /** 接受的文件类型，如 image/* / .pdf,.doc */
  accept?: string
}
```

## 五、表单契约结构 FormSchema

```typescript
export interface FormSchema {
  /** 字段列表（渲染顺序 = 数组顺序） */
  fields: FormField[]
  /** 布局 */
  layout?: 'horizontal' | 'vertical' | 'inline'
  /** 标签宽度 */
  labelWidth?: string | number
  /** 标签对齐 */
  labelAlign?: 'left' | 'right'
  /** 统一尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 统一禁用 */
  disabled?: boolean
  /** 栅格总列数 */
  columns?: 1 | 2 | 3
}
```

## 六、自动规则推导

`base-form-render` 内部有一个「契约 → rules」的推导器，无需手写校验规则：

```typescript
import { builtinRules } from './validation-rules'

/** 根据字段契约自动生成校验规则 */
export function deriveRules(field: FormField): FormRule[] {
  const rules: FormRule[] = []

  // 1. 必填
  if (field.required) {
    rules.push({ required: true, message: `${field.label}不能为空` })
  }

  // 2. 长度
  if (field.minlength !== undefined) {
    rules.push({ min: field.minlength, message: `${field.label}至少 ${field.minlength} 个字符` })
  }
  if (field.maxlength !== undefined) {
    rules.push({ max: field.maxlength, message: `${field.label}最多 ${field.maxlength} 个字符` })
  }

  // 3. 类型专属校验
  switch (field.type) {
    case 'email':
      rules.push({ type: 'email', message: '请输入正确的邮箱地址' })
      break
    case 'phone':
      rules.push({ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' })
      break
    case 'idcard':
      rules.push({ pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号' })
      break
    case 'number':
      rules.push({ pattern: /^-?\d+(\.\d+)?$/, message: '请输入数字' })
      break
    case 'password':
      rules.push({ pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: '密码需 8 位以上，含大小写字母和数字' })
      break
  }

  // 4. 追加自定义规则
  if (field.rules?.length) {
    rules.push(...field.rules)
  }

  return rules
}
```

> 推导器只做「默认合理」，不覆盖用户自定义：`field.rules` 始终追加在最后，优先级最高。

## 七、默认值推导

```typescript
/** 根据字段类型推导默认值 */
export function deriveDefaultValue(field: FormField): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue
  switch (field.type) {
    case 'switch':
      return false
    case 'checkbox':
    case 'upload':
      return []
    case 'select':
      return field.multiple ? [] : undefined
    case 'datepicker':
      return null
    default:
      return ''
  }
}

/** 根据契约生成初始 model */
export function buildModelFromSchema(schema: FormSchema): Record<string, unknown> {
  const model: Record<string, unknown> = {}
  schema.fields.forEach((field) => {
    model[field.prop] = deriveDefaultValue(field)
  })
  return model
}
```

## 八、与 frontend-request-skill 对齐

契约字段名（`prop`）与后端入参字段严格一致，响应走统一信封：

```typescript
// 前端提交：契约的 prop 直接作为请求体字段名
// src/api/goods.ts
import { post } from './request'

export function createGoods(data: Record<string, unknown>) {
  return post<void>('/goods/create', data, { skipDebounce: true })
}
```

```typescript
// 后端契约 api-contract.md 中「创建商品」入参示例（前后端字段对齐）
// POST /api/goods/create
// body: {
//   goodsName: string   // ← 对应契约字段 prop: 'goodsName'
//   skuCode: string
//   price: number
//   categoryId: string
//   ...
// }
```

对齐规则：

1. **字段名对齐**：`FormField.prop` === 后端入参字段名 === 数据库字段名
2. **类型对齐**：`FormField.type` 决定前端控件，后端按同样语义校验
3. **必填对齐**：`FormField.required` === 后端 `required` 校验
4. **响应信封对齐**：提交返回 `{ code, message, data }`，前端用 `code === 0` 判断成功
5. **上传对齐**：`base-upload` 对接 `frontend-request-skill` 的 `upload<T>()` 封装（见 [error-handling.md](../../../frontend-request-skill/references/error-handling.md)）

## 九、完整字段类型示例契约

> 展示全部 13 种字段类型的完整契约写法（含特殊类型 password / phone / idcard）。

```typescript
import type { FormSchema } from './types'

export const allTypesSchema: FormSchema = {
  layout: 'vertical',
  labelWidth: '120px',
  columns: 2,
  fields: [
    { prop: 'username', label: '用户名', type: 'input', required: true, minlength: 3, maxlength: 20 },
    { prop: 'password', label: '登录密码', type: 'password', required: true },
    { prop: 'email', label: '邮箱', type: 'email', required: true },
    { prop: 'phone', label: '手机号', type: 'phone', required: true },
    { prop: 'idcard', label: '身份证号', type: 'idcard', required: true },
    { prop: 'age', label: '年龄', type: 'number', minlength: 1, maxlength: 3 },
    { prop: 'bio', label: '个人简介', type: 'textarea', rows: 4, maxlength: 200 },
    {
      prop: 'role', label: '角色', type: 'select', required: true,
      options: [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '访客', value: 'guest' },
      ],
    },
    {
      prop: 'tags', label: '兴趣标签', type: 'checkbox',
      options: [
        { label: '阅读', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
      ],
    },
    {
      prop: 'gender', label: '性别', type: 'radio', required: true,
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },
    { prop: 'enabled', label: '启用账号', type: 'switch' },
    { prop: 'birthday', label: '生日', type: 'datepicker' },
    { prop: 'avatar', label: '头像', type: 'upload', maxCount: 1, accept: 'image/*' },
  ],
}
```

## 十、何时用契约、何时手写

| 场景 | 推荐方式 | 理由 |
|------|----------|------|
| ERP / 后台 CRUD 表单 | 契约驱动 `base-form-render` | 字段多、增删频繁，契约一份定义全搞定 |
| 字段由后端动态下发 | 契约驱动 | 后端返回 schema，前端渲染，天然动态 |
| 高度定制的交互表单 | 手写 `base-form` + 各组件 | 交互复杂，契约 DSL 表达不了 |
| 登录/注册等固定表单 | 手写（或轻量契约） | 字段少且固定，手写更直观 |

> 二者可混用：契约渲染主体字段，`base-form-render` 提供 `slot` 让你插入自定义区块。
