# base-input 输入框

> 通用输入框组件，由 `base-card` 设计思想封装（与 `base-card` 同源：参数化外壳组件，包裹原生 `input` 元素）。包含单行文本、多行文本、密码、手机号、验证码、OTP 格子、浮动标签、搜索栏等形态。
>
> 所有表单页面（登录、注册、设置、反馈、个人资料）的输入框都应使用本组件，避免样式碎片化。
>
> 搜索栏是本组件的一种**变体形态**，由 `base-input` 配合外层容器实现，不单独定义组件。

## HTML 参考图

按场景拆分，每个场景独立成文件：

### 通用输入（7 种）

| 场景 | HTML | 文档 |
|------|------|------|
| 账号密码登录 | [base-input-login.html](demo-components/base-input/html/base-input-login.html) | [base-input-login.md](demo-components/base-input/base-input-login.md) |
| 手机号 + 验证码 | [base-input-verify.html](demo-components/base-input/html/base-input-verify.html) | [base-input-verify.md](demo-components/base-input/base-input-verify.md) |
| 多行反馈 | [base-input-feedback.html](demo-components/base-input/html/base-input-feedback.html) | [base-input-feedback.md](demo-components/base-input/base-input-feedback.md) |
| 禁用 / 只读 | [base-input-disabled.html](demo-components/base-input/html/base-input-disabled.html) | [base-input-disabled.md](demo-components/base-input/base-input-disabled.md) |
| 前缀场景 | [base-input-icon-prefix.html](demo-components/base-input/html/base-input-icon-prefix.html) | [base-input-icon-prefix.md](demo-components/base-input/base-input-icon-prefix.md) |
| 后缀场景 | [base-input-icon-suffix.html](demo-components/base-input/html/base-input-icon-suffix.html) | [base-input-icon-suffix.md](demo-components/base-input/base-input-icon-suffix.md) |
| 验证码格子 | [base-input-otp.html](demo-components/base-input/html/base-input-otp.html) | [base-input-otp.md](demo-components/base-input/base-input-otp.md) |
| 浮动标签 | [base-input-floating.html](demo-components/base-input/html/base-input-floating.html) | [base-input-floating.md](demo-components/base-input/base-input-floating.md) |

### 搜索栏变体（6 种独立形态）

> 搜索栏是 `base-input` 的形态变体，所有搜索场景复用 `base-input` 配合外层容器实现。

| 场景 | HTML | 文档 |
|------|------|------|
| 胶囊 | [base-input-search-pill.html](demo-components/base-input/html/base-input-search-pill.html) | [base-input-search-pill.md](demo-components/base-input/base-input-search-pill.md) |
| 小圆角卡片 | [base-input-search-card.html](demo-components/base-input/html/base-input-search-card.html) | [base-input-search-card.md](demo-components/base-input/base-input-search-card.md) |
| 弹窗卡片 | [base-input-search-bubble.html](demo-components/base-input/html/base-input-search-bubble.html) | [base-input-search-bubble.md](demo-components/base-input/base-input-search-bubble.md) |
| 扁平 | [base-input-search-flat.html](demo-components/base-input/html/base-input-search-flat.html) | [base-input-search-flat.md](demo-components/base-input/base-input-search-flat.md) |
| 嵌入式 | [base-input-search-embed.html](demo-components/base-input/html/base-input-search-embed.html) | [base-input-search-embed.md](demo-components/base-input/base-input-search-embed.md) |
| 迷你胶囊 | [base-input-search-mini.html](demo-components/base-input/html/base-input-search-mini.html) | [base-input-search-mini.md](demo-components/base-input/base-input-search-mini.md) |

## 为什么需要这个组件？

表单是 App 最高频的场景之一，但实际开发中：
- 登录、注册、设置、反馈等页面输入框高度、圆角、边框不统一
- 密码框的显隐切换、清空按钮各自实现
- 错误提示、必填标记样式五花八门
- 主题切换时输入框样式难以同步

`base-input` 把所有输入框的共性收敛成一个组件，表单页只关心字段含义和校验。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` / `v-model` | string | `''` | 输入值 |
| `type` | string | `'text'` | 类型：`text` / `password` / `textarea` / `number` / `tel` / `email` / `digit` |
| `placeholder` | string | `'请输入'` | 占位文字 |
| `label` | string | - | 左侧标签文字 |
| `required` | boolean | `false` | 是否必填（左侧标签后显示红色星号） |
| `disabled` | boolean | `false` | 是否禁用 |
| `readonly` | boolean | `false` | 是否只读 |
| `maxlength` | number | `140` | 最大长度 |
| `showClear` | boolean | `false` | 有值时显示清除按钮 |
| `showPassword` | boolean | `false` | 密码框是否显示「显隐切换」 |
| `border` | string | `'bottom'` | 边框：`all` / `bottom` / `none` |
| `error` | string | - | 错误提示文字 |
| `autoHeight` | boolean | `false` | textarea 是否自适应高度 |
| `rows` | number | `3` | textarea 默认行数 |

## Slots

| Slot | 说明 |
|------|------|
| `prefix` | 左侧前缀（图标/单位） |
| `suffix` | 右侧后缀（按钮/图标） |

## 代码

```vue
<template>
  <view class="base-input" :class="inputClass">
    <!-- 左侧标签 -->
    <view v-if="label" class="input-label">
      <text v-if="required" class="required-mark">*</text>
      <text>{{ label }}</text>
    </view>

    <!-- 主体 -->
    <view class="input-body">
      <slot name="prefix" />

      <!-- 单行输入 -->
      <input
        v-if="type !== 'textarea'"
        class="input-control"
        :value="modelValue"
        :type="realType"
        :placeholder="placeholder"
        :placeholder-class="'input-placeholder'"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :password="type === 'password' && !showPasswordToggle"
        confirm-type="done"
        @input="onInput"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @confirm="emit('confirm')"
      />

      <!-- 多行输入 -->
      <textarea
        v-else
        class="input-control input-textarea"
        :value="modelValue"
        :placeholder="placeholder"
        :placeholder-class="'input-placeholder'"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :auto-height="autoHeight"
        :rows="rows"
        @input="onInput"
        @focus="emit('focus')"
        @blur="emit('blur')"
      />

      <!-- 清除按钮 -->
      <view v-if="showClear && modelValue && !disabled && !readonly" class="clear-btn" @click="onClear">
        <text class="clear-icon">×</text>
      </view>

      <!-- 密码显隐切换 -->
      <view v-if="type === 'password' && showPassword" class="toggle-btn" @click="togglePassword">
        <text class="toggle-icon">{{ showPasswordToggle ? '隐藏' : '显示' }}</text>
      </view>

      <slot name="suffix" />
    </view>

    <!-- 错误提示 -->
    <text v-if="error" class="input-error">{{ error }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: string
  type?: 'text' | 'password' | 'textarea' | 'number' | 'tel' | 'email' | 'digit'
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  maxlength?: number
  showClear?: boolean
  showPassword?: boolean
  border?: 'all' | 'bottom' | 'none'
  error?: string
  autoHeight?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '请输入',
  required: false,
  disabled: false,
  readonly: false,
  maxlength: 140,
  showClear: false,
  showPassword: false,
  border: 'bottom',
  error: '',
  autoHeight: false,
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  clear: []
  focus: []
  blur: []
  confirm: []
}>()

const showPasswordToggle = ref(false)

const realType = computed(() => {
  if (props.type === 'password' && showPasswordToggle.value) return 'text'
  return props.type
})

const inputClass = computed(() => ({
  [`is-${props.border}`]: true,
  'is-disabled': props.disabled,
  'is-error': !!props.error,
  'has-label': !!props.label,
  [`is-${props.type}`]: true,
}))

function onInput(e: any) {
  emit('update:modelValue', e.detail.value)
}

function onClear() {
  emit('update:modelValue', '')
  emit('clear')
}

function togglePassword() {
  showPasswordToggle.value = !showPasswordToggle.value
}
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.input-label {
  font-size: 28rpx;
  color: var(--color-text);
  font-weight: 500;
}
.required-mark {
  color: var(--color-error, #ff4d4f);
  margin-right: 4rpx;
}
.input-body {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
}
.is-bottom .input-body {
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}
.is-all .input-body {
  border: 1rpx solid var(--color-border);
}
.is-bottom .input-body {
  border-bottom: 1rpx solid var(--color-border);
}
.is-none .input-body {
  border: none;
  padding: 0;
  background: transparent;
}
.is-disabled .input-body {
  background: var(--color-bg);
  color: var(--color-text-tertiary);
}
.is-error.is-bottom .input-body {
  border-bottom-color: var(--color-error, #ff4d4f);
}
.is-error.is-all .input-body {
  border-color: var(--color-error, #ff4d4f);
}
.input-control {
  flex: 1;
  font-size: 28rpx;
  color: var(--color-text);
  background: transparent;
  height: 88rpx;
  line-height: 88rpx;
}
.is-textarea .input-control,
.input-textarea {
  height: auto;
  min-height: 120rpx;
  line-height: 1.6;
  padding: var(--space-2) 0;
}
.input-placeholder {
  color: var(--color-text-tertiary);
}
.clear-btn,
.toggle-btn {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.clear-btn {
  border-radius: 50%;
  background: var(--color-text-tertiary);
  color: #fff;
}
.toggle-icon {
  font-size: 32rpx;
  color: var(--color-text-secondary);
}
.input-error {
  font-size: 24rpx;
  color: var(--color-error, #ff4d4f);
}
</style>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg-surface)` | 输入框背景 |
| `var(--color-bg)` | 禁用态背景 |
| `var(--color-border)` | 边框 |
| `var(--color-text)` | 输入文字 |
| `var(--color-text-secondary)` | 辅助文字 |
| `var(--color-text-tertiary)` | placeholder |
| `var(--color-error)` | 错误提示、必填星号 |
| `var(--radius-md)` | 圆角 |

## 形态

通过 Props 切换输入框形态：

| 形态 | Props | 场景 |
|------|-------|------|
| 单行文本 | `type="text"` | 账号、姓名、标题 |
| 密码 | `type="password"` | 密码输入 |
| 密码可显隐 | `type="password" showPassword` | 登录密码 |
| 多行文本 | `type="textarea"` | 备注、反馈、简介 |
| 手机号 | `type="number" maxlength="11"` | 手机号输入 |
| 邮箱 | `type="email"` | 邮箱输入 |
| 验证码 | `type="number"` + `suffix slot` | 短信验证码 |

## 使用示例

### 账号密码登录

```vue
<base-input
  v-model="username"
  label="账号"
  required
  placeholder="请输入账号"
  :show-clear="true"
/>

<base-input
  v-model="password"
  type="password"
  label="密码"
  required
  placeholder="请输入密码"
  :show-password="true"
/>
```

### 验证码（右侧带发送按钮）

```vue
<base-input
  v-model="code"
  type="number"
  :maxlength="6"
  label="验证码"
  required
  placeholder="请输入验证码"
>
  <template #suffix>
    <view class="send-btn" :class="{ disabled: countdown > 0 }" @click="onSendCode">
      <text>{{ countdown > 0 ? `${countdown}s` : '发送验证码' }}</text>
    </view>
  </template>
</base-input>
```

### 多行反馈

```vue
<base-input
  v-model="feedback"
  type="textarea"
  label="反馈内容"
  :rows="5"
  :maxlength="500"
  placeholder="请输入您的反馈..."
/>
```

### 错误态

```vue
<base-input
  v-model="phone"
  label="手机号"
  required
  error="手机号格式不正确"
/>
```

## 兼容与扩展

- **未来扩展**：可通过 slot 增加图标、单位、按钮等，业务方按需扩展，不破坏现有用法。
- **搜索栏**：作为本组件的变体形态，通过 `base-input` 配合外层容器（控制圆角 / 阴影 / 高度）实现，不单独建组件。详见上方「搜索栏变体」表格。
