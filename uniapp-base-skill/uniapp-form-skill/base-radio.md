# base-radio 单选框

> 通用单选组件，由 `base-card` 设计思想封装（与 `base-card` 同源：参数化外壳组件，包裹单选交互逻辑）。支持圆圈、打钩、标签、卡片、按钮组、列表式等多种形态。

> 所有表单页面（设置、订单、支付、资料编辑）的单选都应使用本组件，避免样式碎片化。

## HTML 参考图

6 种风格独立成文件：

| 风格 | 场景 | HTML |
|------|------|------|
| 标准圆圈 | 基础单选、列表选择 | [radio-circle.html](html/radio-circle.html) |
| 打钩风格 | 配送方式、服务选择 | [radio-check.html](html/radio-check.html) |
| 标签排列 | 筛选条件、状态切换 | [radio-tag.html](html/radio-tag.html) |
| 卡片式 | 商品规格、套餐选择 | [radio-card.html](html/radio-card.html) |
| 按钮组 | 支付方式、会员等级 | [radio-button.html](html/radio-button.html) |
| 列表式 | 设置项、个人资料 | [radio-list.html](html/radio-list.html) |

## 为什么需要这个组件？

单选是 App 高频交互场景，但实际开发中：
- 圆圈单选、打钩单选、标签单选各自实现，样式不统一
- 选中态、禁用态、描述文字各自处理
- 卡片式单选、按钮组单选重复开发
- 主题切换时单选样式难以同步

`base-radio` 把所有单选的共性收敛成一个组件，页面只关心选项数据。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` / `v-model` | any | - | 选中值 |
| `options` | array | `[]` | 选项列表：`[{label, value, disabled, desc}]` |
| `type` | string | `'circle'` | 类型：`circle` / `check` / `tag` / `card` / `button` / `list` |
| `showIcon` | boolean | `true` | 是否显示图标 |
| `disabled` | boolean | `false` | 是否禁用 |

## Events

| Event | 说明 |
|-------|------|
| `update:modelValue` | 选中值变化 |
| `change` | 选中变化时触发 |

## 代码

```vue
<template>
  <view class="base-radio" :class="`radio-${type}`">
    <view
      v-for="option in options"
      :key="option.value"
      class="radio-item"
      :class="{
        selected: modelValue === option.value,
        disabled: option.disabled || disabled
      }"
      @click="onSelect(option)"
    >
      <view class="radio-icon" v-if="showIcon && type !== 'tag'">
        <!-- 图标渲染 -->
      </view>
      <view class="radio-content">
        <text class="radio-label">{{ option.label }}</text>
        <text v-if="option.desc" class="radio-desc">{{ option.desc }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: any
  disabled?: boolean
  desc?: string
}

interface Props {
  modelValue?: any
  options?: Option[]
  type?: 'circle' | 'check' | 'tag' | 'card' | 'button' | 'list'
  showIcon?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  type: 'circle',
  showIcon: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  change: [value: any]
}>()

function onSelect(option: Option) {
  if (option.disabled || props.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
}
</script>

<style scoped>
.base-radio { display: flex; flex-direction: column; gap: var(--space-2); }
.radio-item { display: flex; align-items: center; padding: var(--space-3); border-radius: var(--radius-md); background: var(--color-surface); border: 1px solid var(--color-border); cursor: pointer; }
.radio-item.selected { border-color: var(--color-primary); background: var(--color-primary-light); }
.radio-item.disabled { opacity: 0.5; cursor: not-allowed; }
/* 更多样式... */
</style>
```

## 使用示例

### 标准圆圈

```vue
<base-radio
  v-model="gender"
  :options="[
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
  ]"
/>
```

### 打钩风格（带描述）

```vue
<base-radio
  v-model="delivery"
  type="check"
  :options="[
    { label: '标准配送', value: 'normal', desc: '3-5天送达' },
    { label: '加急配送', value: 'fast', desc: '当天送达' }
  ]"
/>
```

### 标签排列

```vue
<base-radio
  v-model="sort"
  type="tag"
  :options="[
    { label: '综合', value: 'default' },
    { label: '销量', value: 'sales' },
    { label: '价格', value: 'price' }
  ]"
/>
```

### 卡片式（带价格）

```vue
<base-radio
  v-model="package"
  type="card"
  :options="[
    { label: '月卡', value: 'month', desc: '¥30/月' },
    { label: '年卡', value: 'year', desc: '¥300/年' }
  ]"
/>
```

## 形态

通过 `type` 切换单选形态：

| 类型 | 场景 |
|------|------|
| `circle` | 基础单选、列表选择 |
| `check` | 配送方式、服务选择（带描述） |
| `tag` | 筛选条件、状态切换 |
| `card` | 商品规格、套餐选择（带价格） |
| `button` | 支付方式、会员等级 |
| `list` | 设置项、个人资料 |

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-primary)` | 选中态颜色 |
| `var(--color-primary-light)` | 选中态背景 |
| `var(--color-surface)` | 选项背景 |
| `var(--color-border)` | 边框 |
| `var(--radius-md)` | 圆角 |

## 触发词

```markdown
/uniapp-base-skill 做一个单选
/uniapp-base-skill 做一个圆圈单选
/uniapp-base-skill 做一个打钩单选
/uniapp-base-skill 做一个标签单选
/uniapp-base-skill 做一个卡片单选
/uniapp-base-skill 做一个按钮组单选
/uniapp-base-skill 做一个列表单选
```

## 演示

[查看 HTML 演示](html/radio-circle.html)
