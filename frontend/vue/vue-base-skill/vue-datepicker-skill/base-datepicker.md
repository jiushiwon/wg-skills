# base-datepicker

> 日期选择器组件。日期、日期范围、年/月选择。
>
> **必须**作为 `<base-form-item>` 的子组件或独立使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string` | `''` | 绑定值 |
| type | `'date' \| 'daterange' \| 'month' \| 'year'` | `'date'` | 类型 |
| placeholder | `string` | `'请选择日期'` | 占位文本 |
| disabled | `boolean` | `false` | 禁用 |
| disabledDate | `(date: Date) => boolean` | - | 禁用日期函数 |
| format | `string` | `'YYYY-MM-DD'` | 输出格式 |
| clearable | `boolean` | `true` | 是否可清空 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `string` | 值变化 |
| change | `string` | 值变化 |

## 实现要点

### 渲染结构

```vue
<div class="base-datepicker" :class="{ 'base-datepicker--open': visible }">
  <!-- 触发器 -->
  <div class="base-datepicker__trigger">
    <span v-if="displayValue" class="base-datepicker__value">{{ displayValue }}</span>
    <span v-else class="base-datepicker__placeholder">{{ placeholder }}</span>
    <span class="base-datepicker__icon">date</span>
  </div>
  
  <!-- 日历面板 -->
  <div v-if="visible" class="base-datepicker__dropdown">
    <!-- 头部 -->
    <div class="base-datepicker__header">
      <span class="base-datepicker__nav" role="button" tabindex="0">&lt;</span>
      <span class="base-datepicker__current">{{ year }}年{{ month + 1 }}月</span>
      <span class="base-datepicker__nav" role="button" tabindex="0">&gt;</span>
    </div>
    
    <!-- 星期 -->
    <div class="base-datepicker__week">
      <span v-for="day in weekDays">{{ day }}</span>
    </div>
    
    <!-- 日期 -->
    <div class="base-datepicker__days">
      <div
        v-for="date in calendarDays"
        :key="date.toISOString()"
        class="base-datepicker__day"
        :class="{
          'base-datepicker__day--other': date.getMonth() !== month,
          'base-datepicker__day--today': isToday(date),
          'base-datepicker__day--selected': isSelected(date),
          'base-datepicker__day--disabled': disabledDate?.(date)
        }"
        role="button"
        tabindex="0"
      >
        {{ date.getDate() }}
      </div>
    </div>
  </div>
</div>
```

### 样式

```css
.base-datepicker {
  position: relative;
  display: inline-block;
  width: 240px;
}

.base-datepicker__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--height-input-md, 40px);
  padding: 0 12px;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 8px);
  background: var(--color-surface, #fff);
}

.base-datepicker__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 12px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e4e7ed);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.base-datepicker__day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
}

.base-datepicker__day:hover {
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-datepicker__day--today {
  color: var(--color-primary, #409eff);
  font-weight: bold;
}

.base-datepicker__day--selected {
  background: var(--color-primary, #409eff) !important;
  color: var(--color-surface, #fff) !important;
}
```

## 约束

- **零 HTML5 标签**：导航按钮用 `<span role="button">` 模拟
- **容器原则**：独立使用时必须被 `<base-card>` 包裹
