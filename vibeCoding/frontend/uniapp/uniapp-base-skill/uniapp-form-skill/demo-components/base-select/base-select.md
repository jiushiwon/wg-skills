# base-select 下拉选择

> 通用下拉选择组件，由 `base-card` 设计思想封装（与 `base-card` 同源：参数化外壳组件，包裹选择交互逻辑）。支持下拉、弹出面板、标签多选、城市级联、搜索下拉、宫格、分组、级联、树形、远程搜索、可创建等 13 种形态。

> 所有需要选择操作的场景（筛选、配置、资料编辑）都应使用本组件，避免样式碎片化。

## 形态总览

**13 种风格**，覆盖 95% 选择场景：

| # | 风格 | 场景 | 类型值 / 关键参数 |
|---|------|------|------------------|
| 00 | **总览** | 13 形态对比一览 | — |
| 01 | 基础下拉 | 表单选择、简单筛选 | `dropdown` |
| 02 | 弹出面板 | 复杂选择、弹窗选择 | `popup` |
| 03 | 标签多选 | 兴趣选择、已选展示 | `tag` |
| 04 | 城市级联 | 地址选择、省市区 | `city` |
| 05 | 搜索下拉 | 模糊匹配、本地过滤 | `search` + `searchable` |
| 06 | 宫格选择 | 商品规格、套餐选择 | `grid` |
| 07 | 多选下拉 | 兴趣标签、批量筛选 | `dropdown` + `multiple` |
| 08 | 分组选择 | 联系人、分类目录 | `groupable: true` |
| 09 | 级联选择 | 省/市/区三级联动 | `cascade: true` |
| 10 | 树形选择 | 部门、组织架构 | `treeData: true` |
| 11 | 异步搜索 | 远程数据、防抖 | `remote: true` |
| 12 | 可创建 | 标签、技能自定义 | `creatable: true` |

## HTML 参考图

13 个独立 demo 文件，按形态命名：

| # | HTML | 风格 | 一句话 |
|---|------|------|--------|
| 00 | [00-showcase.html](html/00-showcase.html) | 形态总览 | 一图看完 13 种形态 |
| 01 | [select-dropdown.html](html/select-dropdown.html) | 基础下拉 | 触发器 + 下拉列表 |
| 02 | [select-popup.html](html/select-popup.html) | 弹出面板 | 底部抽屉 / 居中弹层 |
| 03 | [select-tag.html](html/select-tag.html) | 标签多选 | 已选项以 chip 展示 |
| 04 | [select-city.html](html/select-city.html) | 城市级联 | 地区数据联动 |
| 05 | [select-search.html](html/select-search.html) | 搜索下拉 | 输入框 + 实时过滤 |
| 06 | [select-grid.html](html/select-grid.html) | 宫格选择 | 图标 + 文字九宫格 |
| 07 | [select-multiple.html](html/select-multiple.html) | 多选下拉 | checkbox + 底部操作 |
| 08 | [select-group.html](html/select-group.html) | 分组选择 | group header 黏性 |
| 09 | [select-cascade.html](html/select-cascade.html) | 级联选择 | 弹层 + 三列联动 |
| 10 | [select-tree.html](html/select-tree.html) | 树形选择 | 展开折叠 + 父子联动 |
| 11 | [select-async-search.html](html/select-async-search.html) | 异步搜索 | 远程数据 + loading |
| 12 | [select-creatable.html](html/select-creatable.html) | 可创建 | 输入即新增 |

## 为什么需要这个组件？

下拉选择是 App 高频交互场景，但实际开发中：
- 下拉框、弹出面板、标签多选各自实现，样式不统一
- 单选、多选、级联选择各自处理
- 城市选择、搜索选择重复开发
- 主题切换时选择器样式难以同步

`base-select` 把所有选择器的共性收敛成一个组件，页面只关心选项数据。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` / `v-model` | any / array | - | 选中值（单选 any，多选 array） |
| `options` | array | `[]` | 选项列表 |
| `type` | string | `'dropdown'` | 类型 |
| `multiple` | boolean | `false` | 是否多选 |
| `placeholder` | string | `'请选择'` | 占位文字 |
| `searchable` | boolean | `false` | 是否可搜索 |
| `disabled` | boolean | `false` | 是否禁用 |

## Events

| Event | 说明 |
|-------|------|
| `update:modelValue` | 选中值变化 |
| `change` | 选中变化时触发 |
| `search` | 搜索时触发 |

## 代码

```vue
<template>
  <view class="base-select">
    <!-- 触发器 -->
    <view class="select-trigger" @click="onOpen">
      <text :class="{ placeholder: !modelValue }">
        {{ displayText || placeholder }}
      </text>
      <text class="select-arrow">▼</text>
    </view>

    <!-- 下拉面板 -->
    <view v-if="visible" class="select-dropdown">
      <!-- 搜索框 -->
      <view v-if="searchable" class="select-search">
        <input v-model="keyword" placeholder="搜索" />
      </view>

      <!-- 选项列表 -->
      <view class="select-options">
        <view
          v-for="option in filteredOptions"
          :key="option.value"
          class="select-option"
          :class="{ selected: isSelected(option) }"
          @click="onSelect(option)"
        >
          <text>{{ option.label }}</text>
          <text v-if="multiple && isSelected(option)" class="check-icon">✓</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: any
  disabled?: boolean
  children?: Option[]
}

interface Props {
  modelValue?: any | any[]
  options?: Option[]
  type?: 'dropdown' | 'popup' | 'tag' | 'city' | 'search' | 'grid'
  multiple?: boolean
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  type: 'dropdown',
  multiple: false,
  placeholder: '请选择',
  searchable: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any | any[]]
  change: [value: any | any[]]
  search: [keyword: string]
}>()

// ... 更多逻辑
</script>

<style scoped>
.base-select { position: relative; }
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
}
.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
}
/* 更多样式... */
</style>
```

## 使用示例

### 基础下拉

```vue
<base-select
  v-model="city"
  :options="[
    { label: '北京', value: 'beijing' },
    { label: '上海', value: 'shanghai' },
    { label: '广州', value: 'guangzhou' }
  ]"
  placeholder="请选择城市"
/>
```

### 弹出面板

```vue
<base-select
  v-model="category"
  type="popup"
  :options="categories"
/>
```

### 标签多选

```vue
<base-select
  v-model="interests"
  type="tag"
  multiple
  :options="[
    { label: '阅读', value: 'reading' },
    { label: '音乐', value: 'music' },
    { label: '运动', value: 'sports' }
  ]"
/>
```

### 城市级联

```vue
<base-select
  v-model="address"
  type="city"
  :options="cityData"
/>
```

### 搜索下拉

```vue
<base-select
  v-model="member"
  type="search"
  searchable
  :options="memberList"
  placeholder="搜索成员"
/>
```

## 形态

通过 `type` 切换选择器形态：

| 类型 | 场景 |
|------|------|
| `dropdown` | 基础下拉、表单选择 |
| `popup` | 复杂选择、弹窗选择 |
| `tag` | 筛选条件、兴趣多选 |
| `city` | 地址选择、省市区级联 |
| `search` | 搜索选择、模糊匹配 |
| `grid` | 商品规格、套餐选择 |

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-primary)` | 选中态颜色 |
| `var(--color-surface)` | 触发器背景 |
| `var(--color-bg-surface)` | 下拉面板背景 |
| `var(--color-border)` | 边框 |
| `var(--radius-md)` | 圆角 |

## 触发词

```markdown
/uniapp-base-skill 做一个下拉选择
/uniapp-base-skill 做一个下拉框
/uniapp-base-skill 做一个弹出面板选择
/uniapp-base-skill 做一个标签多选
/uniapp-base-skill 做一个城市选择器
/uniapp-base-skill 做一个搜索下拉
/uniapp-base-skill 做一个宫格选择
```

## 演示

[查看 HTML 演示](html/select-dropdown.html)
