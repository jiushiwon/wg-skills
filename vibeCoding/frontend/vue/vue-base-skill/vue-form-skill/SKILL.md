---
name: vue-form-skill
description: Vue 表单体系技能。基于「容器原则」，所有表单必须嵌入 base-card。提供 base-form（表单容器 + 校验）、base-form-item（表单项）、base-input / base-select / base-checkbox / base-radio / base-switch / base-datepicker 共 8 个组件。纯 CSS 实现，零第三方组件库。触发词："Vue 表单"、"vue-form"、"做一个表单"、"表单校验"、"登录表单"、"搜索表单"。
trigger: |
  做一个表单 | 做一个登录表单 | 做一个搜索表单 | 做一个注册表单
  表单校验 | 表单验证 | 表单布局 | 表单容器
  做一个输入框 | 做一个选择器 | 做一个复选框 | 做一个单选框 | 做一个开关
  做一个日期选择器 | 做一个表单项
---

# vue-form-skill

> Vue 表单体系技能。Vue3 + TypeScript 泛型组件，8 个核心组件，覆盖 99% 业务表单场景。零第三方组件库。
>
> **容器原则**：所有表单必须嵌入 `<base-card>`。无例外。
>
> **零 HTML5 标签原则**：表单组件是重灾区（`<input>` `<select>` `<textarea>` `<form>` `<label>`），`.md` 文档里**严禁出现**这些原生标签，必须用 `<div>` `<span>` + ARIA + contenteditable + 键盘事件实现。表单组件若混入原生标签，整套规范直接破功。
>
> 本技能严格镜像 [vue-base-skill](../) 规范体系，所有组件遵守父技能的 4 条铁律（容器原则 + Token 驱动 + 零第三方 + TypeScript 泛型）。

## 核心组件

| 组件 | 说明 | 定位 |
|------|------|------|
| **base-form** | 表单容器 | 数据管理、校验引擎、布局控制 |
| **base-form-item** | 表单项 | 标签、校验提示、必填标记 |
| **base-input** | 输入框 | 文本、密码、搜索、文本域 |
| **base-select** | 选择器 | 单选、多选、搜索过滤 |
| **base-checkbox** | 复选框 | 单个、复选组 |
| **base-radio** | 单选框 | 单选组 |
| **base-switch** | 开关 | 开/关切换 |
| **base-datepicker** | 日期选择器 | 日期、日期范围 |

## 命名对齐矩阵（与 uniapp-form-skill 完全对齐）

```
vue-form-skill        ←  uniapp-form-skill
base-form             ←  base-form
base-form-item        ←  base-form-item
base-input            ←  base-input
base-select           ←  base-select
base-checkbox         ←  base-checkbox
base-radio            ←  base-radio
base-switch           ←  base-switch
base-datepicker       ←  base-datepicker
```

跨技能命名严格保持一致：组件、Token、文件结构、容器原则。

## 🚫 零 HTML5 标签铁律（.md 文档约束）

> **所有 `.md` 文档中的实现代码（`<template>` / `<script>` / `<style>` / 代码片段）必须使用 `<div>` `<span>` 等基础标签 + ARIA + contenteditable + 键盘事件实现。**

### 严禁使用（表单组件重灾区）

| HTML5 标签 | 必须替换为 |
|-----------|-----------|
| `<input type="text/password/checkbox/radio">` | `<div contenteditable role="textbox">` 或 `<div role="checkbox/radio">` |
| `<textarea>` | `<div contenteditable="true" role="textbox">` |
| `<select>` / `<option>` | `<div>` + 自定义面板 + `<div>` 选项 |
| `<form>` | `<div role="form">` + `@keydown.enter.prevent` |
| `<label>` | `<div role="label">` 或 `<div>` + 文本 |
| `<fieldset>` / `<legend>` | `<div class="xxx__group">` + `<div class="xxx__legend">` |
| `<button type="submit/reset">` | `<base-button>` + `@click` 触发自定义方法 |

### 唯一例外

✅ **Demo HTML 文件**（`demo-components/**/*.html`）允许使用 HTML5 标签 —— 给用户查看的运行示例，与生产组件实现隔离。

### 工具替代矩阵（表单场景）

| 场景 | HTML5 | 替换方案 |
|------|-------|----------|
| 输入框 | `<input>` | `<div contenteditable role="textbox">` |
| 文本域 | `<textarea>` | `<div contenteditable="true" role="textbox">` |
| 密码框 | `<input type="password">` | `<div contenteditable>` + 显隐切换 |
| 搜索框 | `<input type="search">` | `<div contenteditable role="searchbox">` |
| 下拉选择 | `<select>` | `<div>` + Teleport 自定义面板 |
| 多选 | `<select multiple>` | `<div>` + tag 列表 + 自定义面板 |
| 复选框 | `<input type="checkbox">` | `<div role="checkbox" tabindex="0" :aria-checked>` |
| 单选框 | `<input type="radio">` | `<div role="radio" tabindex="0" :aria-checked>` |
| 开关 | `<button type="button">` | `<div role="switch" tabindex="0" :aria-checked>` |
| 日期选择 | `<input type="date">` | `<div>` + Teleport 自定义日历面板 |
| 表单 | `<form>` | `<div role="form">` + `@keydown.enter.prevent` |
| 必填标记 | `<span class="required">` | `<span class="base-form-item__required">*</span>` |

### 反例

```vue
<!-- ❌ 严禁：表单 .md 中不能出现这些标签 -->
<input type="text" v-model="form.name" />
<input type="checkbox" v-model="agreed" />
<input type="radio" v-model="gender" value="male" />
<select v-model="form.city">
  <option value="beijing">北京</option>
</select>
<textarea v-model="form.bio"></textarea>
<form @submit.prevent="handleSubmit">
  <button type="submit">提交</button>
</form>
<label for="username">用户名</label>
```

### 正例

```vue
<!-- ✅ 正确：必须用 div/span + ARIA + contenteditable + base-button -->
<div
  class="base-input__input"
  :contenteditable="!disabled && !readonly"
  role="textbox"
  :aria-disabled="disabled"
  :aria-readonly="readonly"
  :data-placeholder="placeholder"
  @input="handleInput"
  @focus="handleFocus"
  @blur="handleBlur"
/>

<div
  class="base-checkbox__box"
  role="checkbox"
  :aria-checked="isChecked"
  :aria-disabled="disabled"
  tabindex="0"
  @click="handleToggle"
  @keydown.enter="handleToggle"
  @keydown.space.prevent="handleToggle"
/>

<div role="form" class="base-form" @keydown.enter.prevent="handleEnterSubmit">
  <slot />
</div>

<div class="base-form-item__label" role="label">
  <span class="base-form-item__required">*</span>
  {{ label }}
</div>

<base-button type="primary" @click="handleSubmit">提交</base-button>
```

### 审计要点

1. 所有 `base-*.md` 文件搜索 `<input>` `<select>` `<textarea>` `<form>` `<label>` `<fieldset>` `<button>` 等标签
2. 实现代码中**只允许** `<div>` `<span>` + ARIA + contenteditable + `<base-button>`
3. 描述性文档（说明文、表格、引用块）允许出现标签名作为文字描述，但代码块内不允许
4. SKILL.md 的"反例"代码块（`<!-- ❌ 反例 -->` 开头）是教学材料，审计脚本**豁免**
5. 每次新增或修改 `base-*.md` 文件必须执行审计命令：

```bash
# 仅检查 base-*.md 实现文件（SKILL.md 的反例代码块已豁免）
grep -rnE '<(input|select|textarea|form|label|fieldset|button|option)' \
  --include="base-*.md" \
  ./vibeCoding/frontend/vue/vue-form-skill

# 输出为空才算合规
```

这条命令比 vue-base-skill 父技能的更精准——只检查实现文件，不误报 SKILL.md 的反例代码块。

## 设计理念

### 与 Element Plus / Ant Design 的区别

| 维度 | Element Plus | vue-form-skill |
|------|-------------|----------------|
| 依赖 | 引入整个组件库 | 零依赖，纯 CSS |
| 主题 | CSS 变量（命名不统一） | vue-theme-skill Token（命名对齐 uniapp） |
| 体积 | 按需引入仍较大 | 单组件 < 3KB |
| 定制 | 覆盖 `!important` | 直接改 Token |
| AI 友好 | API 复杂，AI 易出错 | API 简洁，AI 按规范生成 |

### 核心原则

1. **容器原则**：所有表单必须嵌入 `<base-card>`
2. **Token 驱动**：零裸色值、零裸 px
3. **TypeScript 泛型**：类型安全，`any` 零容忍
4. **Composition API**：`<script setup lang="ts">` 全开
5. **校验内置**：base-form 内置校验引擎，支持同步/异步校验

## 体系架构

```
base-card（容器）
  └── base-form（表单容器）
        ├── base-form-item（表单项）
        │     ├── base-input（输入框）
        │     ├── base-select（选择器）
        │     ├── base-checkbox（复选框）
        │     ├── base-radio（单选框）
        │     ├── base-switch（开关）
        │     └── base-datepicker（日期选择器）
        └── base-form-item
              └── ...
```

## 文件结构

```
vue-form-skill/
├── SKILL.md                        # 本文件
├── README.md
├── base-form.md                    # 表单容器
├── base-form-item.md               # 表单项
├── base-input.md                   # 输入框
├── base-select.md                  # 选择器
├── base-checkbox.md                # 复选框
├── base-radio.md                   # 单选框
├── base-switch.md                  # 开关
├── base-datepicker.md              # 日期选择器
├── references/
│   └── validation-rules.md         # 校验规则库
└── demo-components/
    ├── shared/
    │   ├── tokens.css              # 设计 Token（与 vue-theme-skill 对齐）
    │   └── demo.css                # 演示样式（含 variant/shape/color 全维度）
    └── base-form/
        ├── README.md
        └── html/
            └── 00-showcase.html    # 8 大组件样式矩阵总览（variant/size/shape/color 全维度）
```

## 核心 API 概览

### base-form

```typescript
interface BaseFormProps {
  model: Record<string, unknown>        // 表单数据模型
  rules?: Record<string, FormRule[]>    // 校验规则
  layout?: 'horizontal' | 'vertical' | 'inline'  // 布局
  labelWidth?: string | number          // 标签宽度
  labelAlign?: 'left' | 'right'        // 标签对齐
  disabled?: boolean                    // 全局禁用
  readonly?: boolean                    // 全局只读
}

interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: unknown, rule: FormRule) => boolean | string | Promise<boolean | string>
}
```

### base-form-item

```typescript
interface BaseFormItemProps {
  label?: string                        // 标签文本
  prop?: string                         // 对应 model 的 key（用于校验）
  required?: boolean                    // 必填标记
  rules?: FormRule[]                    // 单项校验规则
  labelWidth?: string | number          // 覆盖表单级 labelWidth
  help?: string                         // 帮助文本
  error?: string                        // 外部错误信息
}
```

### base-input

```typescript
interface BaseInputProps {
  modelValue?: string | number
  type?: 'text' | 'password' | 'search' | 'textarea'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  showPassword?: boolean                // 密码显隐切换
  maxlength?: number
  rows?: number                         // textarea 行数
  size?: 'sm' | 'md' | 'lg'
}
```

### base-select

```typescript
interface BaseSelectOption {
  label: string
  value: unknown
  disabled?: boolean
  group?: string
}

interface BaseSelectProps {
  modelValue?: unknown
  options: BaseSelectOption[]
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

### base-checkbox

```typescript
interface BaseCheckboxProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  indeterminate?: boolean              // 半选状态
}

interface BaseCheckboxGroupProps {
  modelValue?: unknown[]
  options?: { label: string; value: unknown; disabled?: boolean }[]
  disabled?: boolean
}
```

### base-radio

```typescript
interface BaseRadioProps {
  modelValue?: unknown
  label?: string
  disabled?: boolean
}

interface BaseRadioGroupProps {
  modelValue?: unknown
  options: { label: string; value: unknown; disabled?: boolean }[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

### base-switch

```typescript
interface BaseSwitchProps {
  modelValue?: boolean
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

### base-datepicker

```typescript
interface BaseDatepickerProps {
  modelValue?: Date | string | null
  type?: 'date' | 'daterange' | 'month' | 'year'
  format?: string                       // 显示格式
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

## 容器原则

> **所有表单必须嵌入 `<base-card>`。无例外。**

```vue
<!-- 正确 -->
<base-card title="用户信息">
  <base-form :model="form" :rules="rules">
    <base-form-item label="姓名" prop="name" required>
      <base-input v-model="form.name" />
    </base-form-item>
  </base-form>
</base-card>

<!-- 错误：游离的 base-form -->
<base-form :model="form">
  <base-form-item label="姓名">
    <base-input v-model="form.name" />
  </base-form-item>
</base-form>
```

## 设计 Token

所有组件统一引用 vue-theme-skill 的 CSS 变量：

| 类别 | 命名规范 | 示例 |
|------|----------|------|
| 颜色 | `--color-{name}` | `--color-primary`、`--color-danger` |
| 间距 | `--space-{n}` | `--space-3`（12px） |
| 字号 | `--font-{size}` | `--font-base`（14px） |
| 圆角 | `--radius-{size}` | `--radius-md`（12px） |
| 高度 | `--height-{comp}-{size}` | `--height-input-md`（40px） |
| 阴影 | `--shadow-{size}` | `--shadow-md` |

**禁止硬编码任何颜色 / 间距 / 字号 / 圆角值。**

## 第三方组件库禁令

> **禁止使用任何第三方 Vue UI 库**（Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue 等）。

## 跨技能协同

- **base-card**（vue-card-skill）：所有表单的容器
- **base-button**（vue-button-skill）：提交/重置按钮
- **base-tag**（vue-tag-skill）：标签选择器场景
- **vue-theme-skill**：所有 Token 来源
- **vue-table-skill**：表格内嵌表单场景

## 红线

- ❌ 禁止裸用 `<base-form>`（必须 `<base-card>` 包裹）
- ❌ 禁止裸色值 / 裸 px（必须 `var(--*)`）
- ❌ 禁止混入 Element Plus / 任何第三方表单组件
- ❌ 禁止用 `any` 类型
- ❌ 禁止在组件内直接操作 DOM（通过 v-model 绑定）
