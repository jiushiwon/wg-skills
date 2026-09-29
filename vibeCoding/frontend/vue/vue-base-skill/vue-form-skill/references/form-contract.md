# form-contract 表单契约规范

> 契约驱动表单的核心规范。定义字段类型枚举、字段描述结构、字段→组件映射、自动校验规则推导，以及与后端 `api-contract.md` / `frontend-request-skill` 的对齐约定。
>
> 本文件是 `base-form-render`（万能表单渲染器）的类型地基。
>
> ⚠️ **动手前先读 [§十三 表单红线](#十三表单红线硬约束)** —— 那里列的是"这样做就是没完成"，不是建议。

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
 * 表单基础字段类型
 * - 文本类：input / textarea / password / number
 * - 选择类：select / radio / checkbox / switch
 * - 时间类：datepicker
 * - 文件类：upload
 *
 * 特殊类型（手机号/邮箱/身份证等）通过 subType 扩展，见 §3.1 映射表
 */
export type FieldType =
  | 'input'        // 单行文本（通过 subType 扩展为 phone/idcard/email 等）
  | 'textarea'     // 多行文本
  | 'password'     // 密码
  | 'number'       // 数字
  | 'select'       // 下拉选择（可多选）
  | 'radio'        // 单选组
  | 'checkbox'     // 复选组
  | 'switch'       // 开关
  | 'datepicker'   // 日期选择
  | 'upload'       // 文件/图片上传
```

## 三、字段 → 组件映射表（核心·零代码地基）

> 本表是**零代码地基**的核心：后端契约给到 → 前端页面自动出来，无需手写代码。
>
> 包含：基础类型映射、子类型+正则规则、上传子类型、字段联动、布局规则。

### 3.1 基础类型映射 + 子类型（零代码地基核心）

> **一张表搞定**：后端字段类型 → 前端组件 + 校验规则。
>
> 包含：input/textarea/password/number/select/radio/checkbox/switch/datepicker/upload 的完整映射。
>
> **子类型**：文本类（phone/idcard/email/税号/银行卡/URL/IP/邮编）、上传类（image/images/file/files/video/audio）。

| FieldType | 子类型 subType | 渲染组件 | model 类型 | 默认值 | 自动推导校验 |
|-----------|---------------|----------|-----------|--------|-------------|
| `input` | — | `base-input`（type=text） | `string` | `''` | required / minLength / maxLength |
| `input` | `phone` | `base-input` | `string` | `''` | required + 手机号正则 |
| `input` | `idcard` | `base-input` | `string` | `''` | required + 身份证正则 |
| `input` | `email` | `base-input` | `string` | `''` | required + 邮箱正则 |
| `input` | `taxNo` | `base-input` | `string` | `''` | required + 税号正则 |
| `input` | `bankCard` | `base-input` | `string` | `''` | required + 银行卡正则 |
| `input` | `url` | `base-input` | `string` | `''` | required + 网址正则 |
| `input` | `ipv4` | `base-input` | `string` | `''` | required + IP正则 |
| `input` | `postalCode` | `base-input` | `string` | `''` | required + 邮编正则 |
| `textarea` | — | `base-input`（type=textarea） | `string` | `''` | required / minLength / maxLength |
| `password` | — | `base-input`（type=password） | `string` | `''` | required / strongPassword |
| `number` | — | `base-input`（type=text + number） | `number \| string` | `''` | required / number |
| `select` | — | `base-select` | `unknown \| unknown[]` | `undefined / []` | required |
| `radio` | — | `base-radio-group` | `unknown` | `undefined` | required |
| `checkbox` | — | `base-checkbox-group` | `unknown[]` | `[]` | required（至少选一项） |
| `switch` | — | `base-switch` | `boolean` | `false` | — |
| `datepicker` | — | `base-datepicker` | `string \| null` | `null` | required |
| `upload` | — | `base-upload` | `string[]` | `[]` | required（至少一张） |
| `upload` | `image` | `base-upload`（image/*） | `string[]` | `[]` | required（1张） |
| `upload` | `images` | `base-upload`（image/*） | `string[]` | `[]` | —（多张） |
| `upload` | `file` | `base-upload`（.pdf,.doc...） | `string[]` | `[]` | — |
| `upload` | `files` | `base-upload`（.pdf,.doc...） | `string[]` | `[]` | — |
| `upload` | `video` | `base-upload`（video/*） | `string[]` | `[]` | — |
| `upload` | `audio` | `base-upload`（audio/*） | `string[]` | `[]` | — |

### 3.2 文本类子类型 + 正则映射（自动推导）

> 文本类字段（`input`）的子类型，通过 `subType` 或 `pattern` 字段自动推导校验规则。

| subType / pattern | 渲染组件 | 自动正则 | 校验规则 | 适用场景 |
|-------------------|----------|----------|---------|----------|
| `phone` | `base-input` | `^1[3-9]\d{9}$` | required + phone | 手机号 |
| `idcard` | `base-input` | `^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$` | required + idCard | 身份证号 |
| `email` | `base-input` | `^[\w.-]+@[\w.-]+\.\w+$` | required + email | 邮箱 |
| `taxNo` / `tax_id` | `base-input` | `^[A-Z0-9]{15}$\|^[A-Z0-9]{18}$\|^[A-Z0-9]{20}$` | required + taxNo | 税号 |
| `bankCard` | `base-input` | `^\d{16,19}$` | required + bankCard | 银行卡号 |
| `url` | `base-input` | `^https?://[\w.-]+` | required + url | 网址 |
| `ipv4` | `base-input` | `^(\d{1,3}\.){3}\d{1,3}$` | required + ipv4 | IP 地址 |
| `postalCode` | `base-input` | `^\d{6}$` | required + postalCode | 邮政编码 |

**契约写法**：

```typescript
// 方式 1：通过 subType 推断
{ prop: 'phone', label: '手机号', type: 'input', subType: 'phone', required: true }

// 方式 2：通过 pattern 直接给正则
{ prop: 'taxNo', label: '税号', type: 'input', pattern: '^[A-Z0-9]{15}$', required: true }

// 方式 3：后端字段名自动推断（约定俗成）
// phone / mobile / telephone → phone
// idcard / id_no / id_number → idcard
// email / email_address → email
```

### 3.3 上传类子类型（联动 vue-upload-skill）

> `upload` 类型的子类型，联动 `vue-upload-skill` 的组件属性。

| subType | 渲染组件 | accept 默认 | maxCount 默认 | 适用场景 |
|---------|----------|------------|--------------|----------|
| `image` | `base-upload` | `image/*` | 1 | 头像、封面图、商品图片 |
| `images` | `base-upload` | `image/*` | 9 | 相册、轮播图 |
| `file` | `base-upload` | `.pdf,.doc,.docx,.xls,.xlsx` | 1 | 附件、文档 |
| `files` | `base-upload` | `.pdf,.doc,.docx,.xls,.xlsx` | 10 | 批量附件 |
| `video` | `base-upload` | `video/*` | 1 | 视频、宣传片 |
| `audio` | `base-upload` | `audio/*` | 1 | 音频、语音 |

**契约写法**：

```typescript
{ prop: 'avatar', label: '头像', type: 'upload', subType: 'image', required: true }
{ prop: 'gallery', label: '相册', type: 'upload', subType: 'images', maxCount: 9 }
{ prop: 'contract', label: '合同附件', type: 'upload', subType: 'file' }
{ prop: 'videoUrl', label: '宣传视频', type: 'upload', subType: 'video' }
```

> `subType` 会透传给 `vue-upload-skill` 的 `accept` / `maxCount` 属性，实现**契约驱动上传组件**。

### 3.4 字段联动契约（多字段依赖）

> 当某个字段的值变化时，触发另一个字段的显示/隐藏/禁用/必填/校验规则变化。
>
> 这是**复杂业务场景**的入口，零代码地基**留口子**：通过 `dependencies` 字段声明。
>
> `FieldDependency` 接口定义见 §4 `FormField` 类型。

**示例：选择"其他"时显示补充说明**

```typescript
{ prop: 'reasonType', label: '原因类型', type: 'radio', required: true,
  options: [
    { label: '商品损坏', value: 'damaged' },
    { label: '发货错误', value: 'wrong' },
    { label: '其他', value: 'other' },
  ],
  dependencies: [
    { source: 'reasonType', values: ['other'], action: 'show', target: 'reasonDetail' }
  ]
},
{ prop: 'reasonDetail', label: '补充说明', type: 'textarea',
  // 默认 hide，由 reasonType 联动控制显示
}
```

**示例：开关启用时显示额外配置**

```typescript
{ prop: 'enableNotify', label: '启用通知', type: 'switch', defaultValue: false,
  dependencies: [
    { source: 'enableNotify', values: [true], action: 'show', target: 'notifyChannel' },
    { source: 'enableNotify', values: [true], action: 'show', target: 'notifyTemplate' },
  ]
},
{ prop: 'notifyChannel', label: '通知渠道', type: 'select',
  options: [{ label: '短信', value: 'sms' }, { label: '邮件', value: 'email' }],
},
{ prop: 'notifyTemplate', label: '通知模板', type: 'input' },
```

> **留口子**：复杂的多字段联动、级联选择、条件校验等，**不硬编码**，通过 `dependencies` 数组声明，由 `base-form-render` 解析执行。

### 3.5 布局规则（自动推导）

> 零代码地基自动根据字段数量决定布局。

| 字段数量 | 布局方式 | 说明 |
|---------|----------|------|
| 1-3 个 | 单列 `columns: 1` | 紧凑排列 |
| 4-6 个 | 双列 `columns: 2` | 平衡 |
| 7-12 个 | 三列 `columns: 3` | 高效利用空间 |
| > 12 个 | **抽屉模式** | 弹抽屉，表单放抽屉内 |

**抽屉模式契约**：见 §5 `FormSchema` 的 `drawer` 属性。

**示例**：

```typescript
const userSchema: FormSchema = {
  layout: 'vertical',
  columns: 2,  // 自动计算
  // 字段 > 12 个时，自动启用抽屉模式
  drawer: {
    title: '编辑用户信息',
    triggerText: '编辑',
    width: '600px',
    placement: 'right',
  },
  fields: [
    // ... 13+ 个字段
  ]
}
```

> **规则**：字段数量 > 12 → `<base-drawer><base-form-render :schema="userSchema" /></base-drawer>`

### 3.6 提交 Loading 规则

> 零代码地基自动处理提交状态的 loading。

| 场景 | 行为 |
|------|------|
| 表单提交 | 按钮自动显示 loading，禁止重复点击 |
| 提交成功 | 关闭弹窗/抽屉，刷新列表，提示"操作成功" |
| 提交失败 | 弹窗提示错误（走 `api-contract.md` 的错误码映射） |

> **无需手动写**：`<base-form-render>` 自动监听 `submit` 事件，执行 `request.ts` 的 `post()` 并处理 loading 状态。

## 四、字段描述结构 FormField

```typescript
/** 通用选项结构（select / radio / checkbox 共用） */
export interface FormOption {
  label: string
  value: unknown
  disabled?: boolean
}

/** 字段联动依赖声明 */
export interface FieldDependency {
  /** 触发字段 */
  source: string
  /** 触发条件：source 字段值等于以下任一值时 */
  values?: unknown[]
  /** 触发条件：source 字段值匹配以下正则时 */
  match?: string
  /** 目标字段的联动行为 */
  action: 'show' | 'hide' | 'enable' | 'disable' | 'required' | 'optional'
  /** 目标字段 */
  target: string
}

/** 单个字段描述 */
export interface FormField {
  /** 字段名，对应 model 的 key，同时对齐后端入参字段名 */
  prop: string
  /** 标签文本 */
  label: string
  /** 字段类型 */
  type: FieldType
  /** 子类型（如 phone/idcard/email/image/video 等），扩展基础类型 */
  subType?: string
  /** 自定义正则校验（优先级高于 subType 自动推导） */
  pattern?: string
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
  /** 字段联动依赖（多字段依赖时使用，如 A 字段值为 X 时显示 B 字段） */
  dependencies?: FieldDependency[]
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

  // ---- number 专属 ----
  /** 最小值（含） */
  min?: number
  /** 最大值（含） */
  max?: number

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
/** 抽屉模式配置 */
export interface DrawerFormConfig {
  /** 抽屉标题 */
  title?: string
  /** 触发按钮文本 */
  triggerText?: string
  /** 抽屉宽度 */
  width?: string | number
  /** 抽屉位置 */
  placement?: 'left' | 'right' | 'top' | 'bottom'
}

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
  /** 栅格总列数（自动推导，可覆盖） */
  columns?: 1 | 2 | 3
  /** 抽屉模式配置（字段 > 12 个时自动启用，也可手动指定） */
  drawer?: DrawerFormConfig
}
```

## 六、自动规则推导

`base-form-render` 内部有一个「契约 → rules」的推导器，无需手写校验规则：

```typescript
import { builtinRules } from './validation-rules'

/**
 * 根据字段契约自动生成校验规则。
 *
 * ★ 必须读**两级**：先按 `type` 分支，再按 `subType` 分支。
 * 历史缺陷：直接用 `switch (field.type)` 去匹配 `email` / `phone` / `idcard` ——
 * 这三个值**不在** FieldType 枚举里（见 §二），它们是 subType。
 * 照旧写法实现，正则校验永远不会生效。
 */
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

  // 3. 数值范围（number 专属）
  if (field.min !== undefined) {
    rules.push({ min: field.min, message: `${field.label}不能小于 ${field.min}` })
  }
  if (field.max !== undefined) {
    rules.push({ max: field.max, message: `${field.label}不能大于 ${field.max}` })
  }

  // 4. 自定义 pattern 优先（优先级高于 subType 自动推导）
  const subTypeRule = field.pattern
    ? { pattern: new RegExp(field.pattern), message: `请输入正确的${field.label}` }
    : undefined

  // 5. 两级推导：type → subType
  switch (field.type) {
    case 'input':
      // 文本类的校验完全由 subType 决定
      rules.push(subTypeRule ?? SUBTYPE_RULES[field.subType ?? ''] ?? noopRule())
      break

    case 'textarea':
      break

    case 'password':
      rules.push(
        subTypeRule ??
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: '密码需 8 位以上，含大小写字母和数字' },
      )
      break

    case 'number':
      rules.push(subTypeRule ?? { pattern: /^-?\d+(\.\d+)?$/, message: '请输入数字' })
      break

    case 'select':
    case 'radio':
    case 'checkbox':
    case 'switch':
    case 'datepicker':
    case 'upload':
      // 这五类没有额外正则校验，required 已由第 1 步覆盖
      break
  }

  // 6. 追加自定义规则（优先级最高，永远在最后）
  if (field.rules?.length) {
    rules.push(...field.rules)
  }

  return rules
}

/** subType → 校验规则（与 §3.2 的正则表一一对应） */
const SUBTYPE_RULES: Record<string, FormRule> = {
  phone: { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
  email: { pattern: /^[\w.-]+@[\w.-]+\.\w+$/, message: '请输入正确的邮箱地址' },
  idcard: { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '请输入正确的身份证号' },
  taxNo: { pattern: /^[A-Z0-9]{15}$/, message: '请输入正确的税号' },
  bankCard: { pattern: /^\d{16,19}$/, message: '请输入正确的银行卡号' },
  url: { pattern: /^https?:\/\/[\w.-]+/, message: '请输入正确的网址' },
  ipv4: { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入正确的 IP 地址' },
  postalCode: { pattern: /^\d{6}$/, message: '请输入正确的邮政编码' },
}

/** 占位规则：不校验（不能用 undefined 塞进 rules 数组） */
function noopRule(): FormRule {
  return { validator: () => true }
}
```

> 推导器只做「默认合理」，不覆盖用户自定义：`field.rules` 始终追加在最后，优先级最高。
>
> ⚠️ **不要**用 `switch (field.type)` 去匹配 `email` / `phone` / `idcard` —— FieldType 里没有这三个值。
> 正确写法是 `type: 'input'` + `subType: 'phone'`（见 §3.2）。

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

## 九、后端注解 → FieldType 对齐（重点）

> 本章节是前端表单与**后端骨架**（Java / Python / Go）桥接的核心。
>
> 后端实体类的注解（Java @NotBlank / Python pydantic / Go validator）必须能**自动映射**到前端的 `FieldType`。

### 9.1 Java 注解映射

| Java 注解 | FieldType | 示例 |
|-----------|-----------|------|
| `@NotBlank` + `@Length` | `input` | 用户名、标题 |
| `@NotBlank` + `@Pattern(regexp)` | 按 pattern 映射到 `input` + `subType` | phone → `input` + `subType:'phone'`；email → `input` + `subType:'email'` |
| `@NotNull` + `@Min` + `@Max` | `number` | 年龄、数量 |
| `@NotBlank` + `@Email` | `input` + `subType:'email'` | 邮箱 |
| `@NotBlank` + `@Size(min=11, max=11)` | `input` + `subType:'phone'` | 手机号 |
| `@NotBlank` + `@Size(min=18, max=18)` | `input` + `subType:'idcard'` | 身份证 |
| `@NotNull` + `@Past` | `datepicker` | 生日、出生日期 |
| `@NotNull` + `@Future` | `datepicker` | 预约时间 |
| 枚举字段（`@Enum` 自定义） | `select` | 状态、类型 |
| `Boolean` / `@NotNull` + `boolean` | `switch`（model 必须是 `boolean`，**不能是 0/1**） | 开关、启用状态 |
| `MultipartFile` | `upload` | 头像、图片、附件 |
| `@NotBlank` + `@Length(max=500)` | `textarea` | 描述、备注、简介 |
| `BigDecimal` | `number` | 价格、金额 |
| `List<String>` / `Set<String>` | `checkbox` | 标签、爱好、多选 |

**Java 实体示例 → FormSchema 推导**：

```java
// 后端 Java 实体
public class User {
    @NotBlank @Length(min=3, max=20)
    private String username;

    @NotBlank @Pattern(regexp = "^1[3-9]\\d{9}$")
    private String phone;

    @NotBlank @Email
    private String email;

    @NotNull @Min(18) @Max(100)
    private Integer age;

    @NotNull
    private UserStatus status;  // 枚举

    @NotNull
    private Boolean enabled;

    @NotNull @Past
    private LocalDate birthday;

    @NotBlank
    private String avatar;  // 上传后的 URL

    @Length(max=500)
    private String bio;
}
```

```typescript
// 前端 FormSchema（自动推导）
const userSchema: FormSchema = {
  fields: [
    { prop: 'username', label: '用户名', type: 'input', required: true, minlength: 3, maxlength: 20 },
    { prop: 'phone', label: '手机号', type: 'input', subType: 'phone', required: true },
    { prop: 'email', label: '邮箱', type: 'input', subType: 'email', required: true },
    { prop: 'age', label: '年龄', type: 'number', required: true },
    { prop: 'status', label: '状态', type: 'select', required: true },
    { prop: 'enabled', label: '启用', type: 'switch' },
    { prop: 'birthday', label: '生日', type: 'datepicker', required: true },
    { prop: 'avatar', label: '头像', type: 'upload', accept: 'image/*' },
    { prop: 'bio', label: '简介', type: 'textarea', maxlength: 500 },
  ]
}
```

### 9.2 Python (pydantic) 映射

| pydantic 字段 | FieldType | 示例 |
|---------------|-----------|------|
| `str` + `min_length`/`max_length` | `input` | 用户名 |
| `EmailStr` | `input` + `subType:'email'` | 邮箱 |
| `PhoneNumber` (phonenumbers) | `input` + `subType:'phone'` | 手机号 |
| `constr(pattern=...)` 按 pattern 映射 | 按 pattern | phone → `input` + `subType:'phone'` |
| `int` / `float` + `ge`/`le` | `number` | 数量 |
| `bool` | `switch`（必须 `bool`，不是 `int`） | 开关 |
| `datetime` / `date` | `datepicker` | 时间 |
| `Literal[...]` | `select` | 枚举 |
| `List[str]` | `checkbox` | 多选 |
| `HttpUrl` / `FileUrl` | `upload` | 文件 |
| `constr(max_length=500)` | `textarea` | 长文本 |

```python
# 后端 Python (pydantic)
class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")
    email: EmailStr
    age: int = Field(..., ge=18, le=100)
    status: Literal['active', 'inactive', 'banned']
    enabled: bool
    birthday: Optional[date] = None
    avatar: Optional[HttpUrl] = None
    bio: Optional[str] = Field(None, max_length=500)
```

### 9.3 Go (validator) 映射

| Go validator tag | FieldType | 示例 |
|------------------|-----------|------|
| `required` + `min`/`max` | `input` | 用户名 |
| `required` + `email` | `input` + `subType:'email'` | 邮箱 |
| `required` + `e164` (phonenumbers) | `input` + `subType:'phone'` | 手机号 |
| `required` + `number` + `min`/`max` | `number` | 年龄 |
| `required` + `boolean` | `switch`（Go 侧须真 `bool`，不是 `int`） | 开关 |
| `required` + `datetime` | `datepicker` | 时间 |
| `required` + `oneof=a b c` | `select` | 枚举 |
| `required` + `lt=1000` | `textarea` | 长文本 |

### 9.4 AI 生成时的契约推导流程

```
1. 读取后端实体（Java/Python/Go）
   ↓
2. 遍历字段 + 注解/tag
   ↓
3. 按 §9.1-§9.3 映射表 → FieldType
   ↓
4. 生成 FormSchema.fields[]
   ↓
5. 前端 <base-form-render :schema="formSchema" />
   ↓
6. 页面自动渲染完成
```

**一份契约，两端自动生成——这才是"契约一下载，页面就自动出来"的终极效果。**

## 十、完整示例：商品管理增删改查

### 场景：商品管理页面

后端提供 5 个接口：

| 接口 | 用途 |
|------|------|
| `GET /api/goods` | 商品列表（分页） |
| `GET /api/goods/:id` | 商品详情 |
| `POST /api/goods` | 新增商品 |
| `PUT /api/goods/:id` | 编辑商品 |
| `DELETE /api/goods/:id` | 删除商品 |

### 后端实体（Java）

```java
public class Goods {
    @NotBlank @Length(max=100)
    private String goodsName;      // 商品名称

    @NotBlank @Length(max=50)
    private String skuCode;        // SKU 编码

    @NotNull @DecimalMin("0.01")
    private BigDecimal price;     // 价格

    @NotNull @Min(0)
    private Integer stock;        // 库存

    @NotNull
    private Long categoryId;      // 分类 ID

    private String categoryName;   // 分类名称（只读）

    @NotBlank
    private String coverImage;    // 封面图 URL

    @Length(max=2000)
    private String description;    // 商品描述

    @NotNull
    private GoodsStatus status;   // 状态枚举

    @NotNull
    private Boolean onShelf;      // 是否上架

    @NotNull @Past
    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}

public enum GoodsStatus {
    DRAFT,      // 草稿
    PENDING,    // 待审核
    APPROVED,   // 已通过
    REJECTED    // 已拒绝
}
```

### 前端 FormSchema（自动推导）

```typescript
// 新增/编辑商品表单契约
export const goodsFormSchema: FormSchema = {
  layout: 'vertical',
  labelWidth: '100px',
  columns: 2,
  fields: [
    { prop: 'goodsName', label: '商品名称', type: 'input', required: true, maxlength: 100 },
    { prop: 'skuCode', label: 'SKU 编码', type: 'input', required: true, maxlength: 50 },
    { prop: 'price', label: '价格', type: 'number', required: true, min: 0.01 },
    { prop: 'stock', label: '库存', type: 'number', required: true, min: 0 },
    { prop: 'categoryId', label: '商品分类', type: 'select', required: true },
    { prop: 'coverImage', label: '封面图', type: 'upload', subType: 'image', maxCount: 1 },
    { prop: 'description', label: '商品描述', type: 'textarea', maxlength: 2000, rows: 4 },
    { prop: 'status', label: '状态', type: 'select', required: true },
    { prop: 'onShelf', label: '上架', type: 'switch' },
  ]
}

// 搜索表单契约（只读场景）
export const goodsSearchSchema: FormSchema = {
  layout: 'inline',
  columns: 4,
  fields: [
    { prop: 'goodsName', label: '商品名称', type: 'input', placeholder: '请输入商品名称' },
    { prop: 'categoryId', label: '分类', type: 'select', placeholder: '请选择分类' },
    { prop: 'status', label: '状态', type: 'select', placeholder: '请选择状态' },
    { prop: 'onShelf', label: '上架', type: 'select', placeholder: '全部' },
  ]
}
```

### 前端使用

```vue
<template>
  <base-card title="商品管理">
    <!-- 搜索区 -->
    <base-form-render :schema="goodsSearchSchema" v-model="searchForm" />

    <!-- 新增/编辑弹窗 -->
    <base-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'">
      <base-form-render :schema="goodsFormSchema" v-model="formData" />
      <template #footer>
        <base-button @click="dialogVisible = false">取消</base-button>
        <base-button type="primary" @click="handleSubmit">提交</base-button>
      </template>
    </base-dialog>
  </base-card>
</template>
```

**效果**：
- 后端实体定义好 → 前端一份 `goodsFormSchema` → `<base-form-render />` 自动渲染
- 新增/编辑/搜索**同一套契约**，复用度 100%
- 后端改字段 → 前端改一行 `prop` 映射 → 页面自动更新

---

## 十一、完整字段类型示例契约

> 展示全部 **10 种 FieldType** 的契约写法；手机号 / 邮箱 / 身份证属于文本**子类型**，写法是 `type: 'input'` + `subType`。

```typescript
import type { FormSchema } from './types'

export const allTypesSchema: FormSchema = {
  layout: 'vertical',
  labelWidth: '120px',
  columns: 2,
  fields: [
    { prop: 'username', label: '用户名', type: 'input', required: true, minlength: 3, maxlength: 20 },
    { prop: 'password', label: '登录密码', type: 'password', required: true },
    { prop: 'email', label: '邮箱', type: 'input', subType: 'email', required: true },
    { prop: 'phone', label: '手机号', type: 'input', subType: 'phone', required: true },
    { prop: 'idcard', label: '身份证号', type: 'input', subType: 'idcard', required: true },
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

## 十二、何时用契约、何时手写

| 场景 | 推荐方式 | 理由 |
|------|----------|------|
| ERP / 后台 CRUD 表单 | 契约驱动 `base-form-render` | 字段多、增删频繁，契约一份定义全搞定 |
| 字段由后端动态下发 | 契约驱动 | 后端返回 schema，前端渲染，天然动态 |
| 高度定制的交互表单 | 手写 `base-form` + 各组件 | 交互复杂，契约 DSL 表达不了 |
| 登录/注册等固定表单 | 手写（或轻量契约） | 字段少且固定，手写更直观 |

> 二者可混用：契约渲染主体字段，`base-form-render` 提供 `slot` 让你插入自定义区块。

---

## 十三、表单红线（硬约束）

> 本章是**否定式清单**：不是"建议这样做"，而是"这样做就是没完成"。
> 每一条都对应一个真实踩过的坑。

### R1 容器原则：所有表单必须嵌在 `<base-form>` 里，**无例外**

`<base-form>` 是表单校验、布局、提交行为的载体。**搜索区也是表单**，同样必须包。

```vue
<!-- ❌ 错误：表单控件直接挂在 base-card 下 -->
<base-card>
  <div class="form-row">
    <base-form-item label="关键字"><base-input v-model="query.keyword" /></base-form-item>
  </div>
</base-card>

<!-- ❌ 错误：base-form-item 直接挂 base-card -->
<base-card>
  <base-form-item label="关键字"><base-input v-model="query.keyword" /></base-form-item>
</base-card>

<!-- ✅ 正确：搜索区用 layout="inline" -->
<base-card>
  <base-form :model="query" layout="inline">
    <base-form-item label="关键字" prop="keyword"><base-input v-model="query.keyword" /></base-form-item>
  </base-form>
</base-card>
```

**反例清单**（命中任一条即视为违反 R1）：

| # | 反例 |
|---|------|
| 1 | `<div class="form-row">` / `<div class="search-bar">` 手工包住 `<base-form-item>` |
| 2 | `<base-form-item>` 的父节点是 `<base-card>` / `<base-dialog>` 而不是 `<base-form>` |
| 3 | 搜索区不包 `<base-form>`（"只查询不提交，所以不用套" —— 这是错的） |
| 4 | 弹窗里的表单直接挂在 `<base-dialog>` 下 |

### R2 必传 `:rules`：只写 `required` 属性 = 未完成

```vue
<!-- ❌ required 只是视觉星号，不会触发任何校验 -->
<base-form-item label="用户名" prop="username" required>
  <base-input v-model="form.username" />
</base-form-item>

<!-- ✅ 契约驱动：由 deriveRules 推导（见 §六） -->
<base-form :model="form" :rules="rules">
  <base-form-item label="用户名" prop="username">
    <base-input v-model="form.username" />
  </base-form-item>
</base-form>
```

> `required` 属性**只能用于纯展示**（如只读详情页）。任何可提交表单都必须传 `:rules`。
> 表单字段来自契约时，`rules` 直接由 `deriveRules(field)` 生成，不要手写。

### R3 `switch` 的 model **必须**是 `boolean`

```typescript
// ❌ 错误：status 是 0/1 而用 switch
{ prop: 'status', label: '状态', type: 'switch' }   // status: number

<!-- ❌ 错误：绑 number -->
<base-switch v-model="form.status" :active-value="1" :inactive-value="0" />

// ✅ 正确：boolean 语义字段才用 switch
{ prop: 'enabled', label: '启用', type: 'switch' }  // enabled: boolean
```

- **数值型字段（0/1、Y/N 之外的枚举）禁止用 `switch`** → 用 `select` 或 `radio`。
- 后端是 `Integer status(0/1)` 时，契约里写 `{ type: 'select', options: [{label:'启用',value:1},{label:'禁用',value:0}] }`。
- 硬要用 `switch` 就必须在提交/回显处显式做 `boolean ↔ 0/1` 转换，并写进契约注释；**默认不允许**。

### R4 契约字段类型只能取 `type` + `subType` 两级

```typescript
// ❌ 错误：FieldType 里没有 phone / email / idcard
{ prop: 'phone', type: 'phone' }
{ prop: 'email', type: 'email' }

// ✅ 正确
{ prop: 'phone', type: 'input', subType: 'phone' }
{ prop: 'email', type: 'input', subType: 'email' }
```

`FieldType` 的合法取值**只有** §二 列出的 10 个：
`input | textarea | password | number | select | radio | checkbox | switch | datepicker | upload`。

### R5 校验用 `rules`，`minlength` / `maxlength` 只是推导输入

- `minlength` / `maxlength` / `min` / `max` / `required` 是**契约输入**，由 `deriveRules` 转成 `rules`。
- 业务约束（唯一性、跨字段、后端返回的错误）**只能**通过 `field.rules` 追加。
- **禁止**在 `.vue` 里手写正则与 `deriveRules` 重复。

### R6 字段名三方一致

`FormField.prop` === 后端入参字段名 === DB 字段名，全 **camelCase**。

> `menu_type` / `data_scope` / `created_at` 这类下划线字段名是历史错误，接口层必须转 camelCase。
