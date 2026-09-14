# base-input

> 输入框组件。文本、密码、搜索、文本域。
>
> **必须**作为 `<base-form-item>` 的子组件或独立使用。
>
> **零 HTML5 标签**：使用 `<div contenteditable role="textbox">` 模拟，禁止 `<input>` / `<textarea>` 原生标签。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string \| number` | `''` | 绑定值（v-model） |
| type | `'text' \| 'password' \| 'search' \| 'textarea'` | `'text'` | 类型 |
| placeholder | `string` | `'请输入'` | 占位文本 |
| disabled | `boolean` | `false` | 禁用 |
| readonly | `boolean` | `false` | 只读 |
| clearable | `boolean` | `false` | 可清空 |
| showPassword | `boolean` | `false` | 密码显隐切换 |
| maxlength | `number` | - | 最大字符数 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `string \| number` | 值变化（v-model） |
| input | `Event` | 输入时 |
| change | `Event` | 失焦或回车时 |
| focus | `FocusEvent` | 获得焦点 |
| blur | `FocusEvent` | 失去焦点 |
| clear | - | 点击清空 |
| enter | `KeyboardEvent` | 回车键 |

## 插槽 Slots

| 插槽 | 说明 |
|------|------|
| prefix | 前缀内容（图标） |
| suffix | 后缀内容（图标） |

## 实现要点

### 渲染结构

```vue
<!-- input 模式 -->
<div
  class="base-input"
  :class="[`base-input--${size}`, { 'base-input--disabled': disabled }]"
>
  <span class="base-input__prefix"><slot name="prefix" /></span>
  <div
    class="base-input__input"
    contenteditable="!disabled && !readonly"
    role="textbox"
    :data-placeholder="placeholder"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
  <span class="base-input__suffix">
    <span v-if="clearable" class="base-input__clear" role="button">x</span>
    <slot name="suffix" />
  </span>
</div>

<!-- textarea 模式 -->
<div class="base-textarea">
  <div
    class="base-textarea__input"
    contenteditable="!disabled && !readonly"
    role="textbox"
    :data-placeholder="placeholder"
  />
</div>
```

### 样式

```css
.base-input {
  display: inline-flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg, #fff);
}

.base-input--focused {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(64, 158, 255, 0.1));
}

.base-input--disabled {
  opacity: 0.6;
  pointer-events: none;
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-input__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-base, 14px);
  padding: 0 var(--space-3, 12px);
}

.base-input__input:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-tertiary, #c0c4cc);
}
```

## 约束

- **禁止 emoji**：图标用 SVG 或纯文本
- **禁止 `<input>` / `<textarea>`**：用 `<div contenteditable role="textbox">` 模拟
- **容器原则**：独立使用时必须被 `<base-card>` 包裹
