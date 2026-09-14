# base-select

> 选择器组件。单选、多选、搜索过滤。
>
> **必须**作为 `<base-form-item>` 的子组件或独立使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `unknown` | `undefined` | 绑定值 |
| options | `SelectOption[]` | `[]` | 选项列表 |
| multiple | `boolean` | `false` | 多选模式 |
| searchable | `boolean` | `false` | 可搜索 |
| clearable | `boolean` | `false` | 可清空 |
| placeholder | `string` | `'请选择'` | 占位文本 |
| disabled | `boolean` | `false` | 禁用 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| maxTagCount | `number` | `3` | 多选最多显示标签数 |

## 类型定义

```typescript
interface SelectOption {
  label: string
  value: unknown
  disabled?: boolean
  group?: string
}
```

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `unknown` | 值变化 |
| change | `unknown` | 值变化 |
| clear | - | 清空时 |

## 实现要点

### 渲染结构

```vue
<div class="base-select" :class="{ 'base-select--open': isOpen }">
  <div class="base-select__trigger">
    <!-- 单选 -->
    <span v-if="selectedLabel" class="base-select__value">{{ selectedLabel }}</span>
    <span v-else class="base-select__placeholder">{{ placeholder }}</span>
    
    <!-- 多选 tag -->
    <span v-for="tag in selectedTags" :key="tag.value" class="base-select__tag">
      {{ tag.label }}
      <span class="base-select__tag-close">x</span>
    </span>
    
    <!-- 搜索框 -->
    <div v-if="searchable && isOpen" class="base-select__search" contenteditable role="textbox" />
    
    <!-- 箭头 -->
    <span class="base-select__arrow">v</span>
  </div>
  
  <!-- 下拉面板 -->
  <div v-if="isOpen" class="base-select__dropdown">
    <div v-for="opt in filteredOptions" :key="opt.value" class="base-select__option">
      {{ opt.label }}
      <span v-if="isSelected(opt.value)">*</span>
    </div>
  </div>
</div>
```

### 样式

```css
.base-select {
  position: relative;
  display: inline-block;
  width: 240px;
}

.base-select__trigger {
  display: flex;
  align-items: center;
  height: var(--height-input-md, 40px);
  padding: 0 32px 0 12px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
}

.base-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 240px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 100;
}

.base-select__option {
  padding: 8px 12px;
  cursor: pointer;
}

.base-select__option:hover {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-select__option--selected {
  color: var(--color-primary, #409eff);
  background: var(--color-primary-light, #ecf5ff);
}
```

## 约束

- **零 HTML5 标签**：搜索框用 `<div contenteditable role="textbox">` 模拟
- **容器原则**：独立使用时必须被 `<base-card>` 包裹
