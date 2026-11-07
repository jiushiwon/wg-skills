# 表单类组件：input-field / search-bar

> 本模块的表单输入能力由 **两个独立组件** 提供：
>
> - `input-field` —— 通用输入行，**基于根容器 `base-form-item`** 实现（外壳由容器提供）；
> - `search-bar` —— 搜索栏，**独立组件**（自带圆角外壳与清除 / 取消交互），**不是** `input-field` 的变体。
>
> 组件真源：
> - `components/form/input-field/index.vue`
> - `components/form/search-bar/index.vue`
> - 容器：`containers/base-form-item/index.vue`
>
> 凡是登录、注册、设置、反馈、个人资料等页面的输入框，一律从本模块取，不允许页面自行实现。

## 一、组件清单

| 组件 | 类型 | 容器依赖 | 说明 | 文档 |
|------|------|----------|------|------|
| `input-field` | 组件 | `base-form-item` | 标签 + 输入框 + 清除 + 错误提示 | [props.json](./components/form/input-field/props.json) / [usage.md](./components/form/input-field/usage.md) |
| `search-bar` | 组件 | 无（自带外壳） | 搜索输入 + 清除 + 确认搜索 + 取消 | [props.json](./components/form/search-bar/props.json) / [usage.md](./components/form/search-bar/usage.md) |
| `base-form-item` | 容器 | — | 表单行外壳：标签列 + 控件插槽 + 错误行 | [../containers/base-form-item/index.vue](./containers/base-form-item/index.vue) |

## 二、input-field

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | `''` | 绑定值（`v-model`） |
| `label` | `string` | `''` | 标签文案，为空时隐藏标签列、控件独占整行 |
| `type` | `string` | `'text'` | 输入类型：`text` / `number` / `idcard` / `digit` 等 |
| `placeholder` | `string` | `''` | 占位文案 |
| `disabled` | `boolean` | `false` | 禁用输入 |
| `maxlength` | `number` | `-1` | 最大长度，`-1` 表示不限制 |
| `clearable` | `boolean` | `false` | 有内容时显示清除按钮 |
| `error` | `boolean` | `false` | 错误状态，输入框描边转红 |
| `errorMessage` | `string` | `''` | 错误提示文案，`error` 为 `true` 时显示在控件下方 |
| `labelWidth` | `string` | `'160rpx'` | 标签列宽 |

### Events

| 事件 | 载荷 | 说明 |
|------|------|------|
| `update:modelValue` | `string \| number` | 值变化 |
| `input` | `string` | 输入即触发（业务可做防抖搜索） |
| `focus` | `unknown` | 聚焦 |
| `blur` | `unknown` | 失焦 |
| `clear` | - | 点击清除按钮 |

### 代码

```vue
<template>
  <BaseFormItem :label="label" :label-width="label ? labelWidth : '0'" :error="errorText">
    <view :class="['input-field__wrap', { 'input-field__wrap--error': error }]">
      <input
        class="input-field__input"
        :type="type"
        :value="inner"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <text v-if="clearable && hasValue" class="input-field__clear" @click="handleClear">清</text>
    </view>
  </BaseFormItem>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseFormItem from '../../containers/base-form-item/index.vue'

interface InputFieldProps {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  maxlength?: number
  clearable?: boolean
  error?: boolean
  errorMessage?: string
  labelWidth?: string
}

const props = withDefaults(defineProps<InputFieldProps>(), {
  modelValue: '',
  label: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  maxlength: -1,
  clearable: false,
  error: false,
  errorMessage: '',
  labelWidth: '160rpx',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [value: string]
  'blur': [event: unknown]
  'focus': [event: unknown]
  'clear': []
}>()

const inner = ref<string | number>(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    inner.value = val
  },
)

const hasValue = computed(() => inner.value !== '' && inner.value !== undefined && inner.value !== null)

// 容器只在有文案时才渲染错误行，避免出现空的错误占位
const errorText = computed(() => (props.error && props.errorMessage ? props.errorMessage : ''))

function handleInput(e: { detail: { value: string } }) {
  inner.value = e.detail.value
  emit('update:modelValue', e.detail.value)
  emit('input', e.detail.value)
}

function handleBlur(e: unknown) {
  emit('blur', e)
}

function handleFocus(e: unknown) {
  emit('focus', e)
}

function handleClear() {
  inner.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>
```

### 形态

形态由 Props 组合得到，不需要另建组件：

| 形态 | Props | 场景 |
|------|-------|------|
| 单行文本 | `type="text"` | 账号、姓名、标题 |
| 数字 / 手机号 | `type="number" :maxlength="11"` | 手机号输入 |
| 身份证 / 银行卡 | `type="idcard"` / `type="digit"` | 身份信息 |
| 禁用 / 只读 | `disabled` | 不可编辑的展示位 |
| 错误态 | `error` + `errorMessage` | 校验失败 |
| 无标签整行 | 不传 `label` | 搜索页顶部独立输入 |

## 三、search-bar

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 绑定值（`v-model`） |
| `placeholder` | `string` | `'搜索'` | 占位文案 |
| `clearable` | `boolean` | `true` | 有内容时显示清除按钮 |
| `showCancel` | `boolean` | `false` | 显示取消按钮 |
| `disabled` | `boolean` | `false` | 禁用输入 |

### Events

| 事件 | 载荷 | 说明 |
|------|------|------|
| `update:modelValue` | `string` | 值变化 |
| `input` | `string` | 输入即触发 |
| `search` | - | 点击搜索 / 回车 |
| `clear` | - | 点击清除 |
| `cancel` | - | 点击取消 |

## 四、HTML 参考图

> 参考图按场景拆分，位于 `demo-components/base-form/base-input/`，仅作为视觉参考，不参与构建。

### 通用输入（8 种）

| 场景 | 文档 | HTML |
|------|------|------|
| 账号密码登录 | [base-input-login.md](./demo-components/base-form/base-input/base-input-login.md) | [base-input-login.html](./demo-components/base-form/base-input/html/base-input-login.html) |
| 手机号 + 验证码 | [base-input-verify.md](./demo-components/base-form/base-input/base-input-verify.md) | [base-input-verify.html](./demo-components/base-form/base-input/html/base-input-verify.html) |
| 多行反馈 | [base-input-feedback.md](./demo-components/base-form/base-input/base-input-feedback.md) | [base-input-feedback.html](./demo-components/base-form/base-input/html/base-input-feedback.html) |
| 禁用 / 只读 | [base-input-disabled.md](./demo-components/base-form/base-input/base-input-disabled.md) | [base-input-disabled.html](./demo-components/base-form/base-input/html/base-input-disabled.html) |
| 前缀场景 | [base-input-icon-prefix.md](./demo-components/base-form/base-input/base-input-icon-prefix.md) | [base-input-icon-prefix.html](./demo-components/base-form/base-input/html/base-input-icon-prefix.html) |
| 后缀场景 | [base-input-icon-suffix.md](./demo-components/base-form/base-input/base-input-icon-suffix.md) | [base-input-icon-suffix.html](./demo-components/base-form/base-input/html/base-input-icon-suffix.html) |
| 验证码格子 | [base-input-otp.md](./demo-components/base-form/base-input/base-input-otp.md) | [base-input-otp.html](./demo-components/base-form/base-input/html/base-input-otp.html) |
| 浮动标签 | [base-input-floating.md](./demo-components/base-form/base-input/base-input-floating.md) | [base-input-floating.html](./demo-components/base-form/base-input/html/base-input-floating.html) |

### 搜索栏形态（6 种）

> 搜索栏的**视觉形态**（胶囊 / 卡片 / 气泡 / 扁平 / 嵌入式 / 迷你）由 `search-bar` 的样式类决定，交互统一走 `search-bar` 组件。

| 场景 | 文档 | HTML |
|------|------|------|
| 胶囊 | [base-input-search-pill.md](./demo-components/base-form/base-input/base-input-search-pill.md) | [base-input-search-pill.html](./demo-components/base-form/base-input/html/base-input-search-pill.html) |
| 小圆角卡片 | [base-input-search-card.md](./demo-components/base-form/base-input/base-input-search-card.md) | [base-input-search-card.html](./demo-components/base-form/base-input/html/base-input-search-card.html) |
| 弹窗卡片 | [base-input-search-bubble.md](./demo-components/base-form/base-input/base-input-search-bubble.md) | [base-input-search-bubble.html](./demo-components/base-form/base-input/html/base-input-search-bubble.html) |
| 扁平 | [base-input-search-flat.md](./demo-components/base-form/base-input/base-input-search-flat.md) | [base-input-search-flat.html](./demo-components/base-form/base-input/html/base-input-search-flat.html) |
| 嵌入式 | [base-input-search-embed.md](./demo-components/base-form/base-input/base-input-search-embed.md) | [base-input-search-embed.html](./demo-components/base-form/base-input/html/base-input-search-embed.html) |
| 迷你胶囊 | [base-input-search-mini.md](./demo-components/base-form/base-input/base-input-search-mini.md) | [base-input-search-mini.html](./demo-components/base-form/base-input/html/base-input-search-mini.html) |

## 五、使用示例

### 账号密码登录

```vue
<template>
<input-field v-model="username" label="账号" placeholder="请输入账号" clearable />
<input-field v-model="password" type="password" label="密码" placeholder="请输入密码" />
</template>


```

### 错误态

```vue
<template>
<input-field
  v-model="phone"
  label="手机号"
  :error="phoneError"
  :error-message="phoneError"
/>
</template>


```

### 搜索

```vue
<template>
<search-bar v-model="keyword" show-cancel @search="onSearch" />
</template>


```

## 六、主题变量

> 变量真源：`uniapp-theme-skill/templates/src/static/css/base.css`（唯一真源，本模块不重复定义）。

| 变量 | 用途 |
|------|------|
| `var(--bg-light)` | 输入框背景 |
| `var(--bg-tertiary)` | 清除按钮底色 |
| `var(--border-light)` | 表单行分割线 |
| `var(--text-primary)` | 输入文字 / 标签 |
| `var(--text-secondary)` | 辅助文字 |
| `var(--text-tertiary)` | placeholder |
| `var(--color-error)` | 错误描边与提示 |
| `var(--radius-input)` | 输入框圆角 |
| `var(--height-btn-md)` | 输入行高度 |
| `var(--font-lg)` | 输入文字字号 |

> 所有 `var()` **必须带兜底值**，且兜底值与 `base.css` 真值完全一致（见 [uniapp/AGENTS.md](../AGENTS.md) §4.2）。
