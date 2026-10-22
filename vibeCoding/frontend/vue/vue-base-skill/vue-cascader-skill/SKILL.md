---
name: vue-cascader-skill
description: Vue 级联选择器技能。支持单选、多选、搜索、动态加载、级联面板模式。复用 vue-input-skill（输入框）、vue-dropdown-skill（面板）、vue-tag-skill（已选标签）。触发词："级联选择"、"cascader"、"多级选择"、"省市区选择"、"分类选择"、"树形选择"。
trigger: |
  级联选择 | 级联选择器 | cascader
  省市区 | 城市选择 | 地区选择
  分类选择 | 多级分类 | 树形选择
  多选级联 | 可搜索级联
---

# Vue Cascader Skill

Vue 级联选择器技能，支持多级数据的级联选择。

## 核心组件

| 组件 | 说明 |
|------|------|
| base-cascader | 级联选择器 |

## 模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| 单选 | 选中一个叶子节点 | 省市区、部门选择 |
| 多选 | 选中多个叶子节点，支持 tags 展示 | 标签分类、多权限选择 |
| 面板 | 左右级联面板 | 省市区、文件目录 |
| 搜索 | 支持关键字过滤 | 大量选项分类 |

## Props

```typescript
interface CascaderProps {
  modelValue: string | string[]  // v-model 绑定值
  options: CascaderOption[]      // 级联数据
  placeholder?: string           // 占位符
  disabled?: boolean            // 禁用
  clearable?: boolean          // 可清除
  filterable?: boolean         // 可搜索
  multiple?: boolean           // 多选
  checkStrictly?: boolean      // 父子不关联
  showAllLevels?: boolean      // 显示完整路径
  collapseTags?: boolean       // 多选时折叠标签
  placeholder?: string
}
```

## 数据结构

```typescript
interface CascaderOption {
  value: string | number
  label: string
  children?: CascaderOption[]
  disabled?: boolean
  [key: string]: any
}
```

## 使用示例

```vue
<template>
  <!-- 单选 -->
  <base-cascader
    v-model="selectedRegion"
    :options="regionOptions"
    placeholder="请选择省市区"
  />

  <!-- 多选 -->
  <base-cascader
    v-model="selectedTags"
    :options="tagOptions"
    multiple
    placeholder="请选择标签"
  />

  <!-- 可搜索 -->
  <base-cascader
    v-model="selected"
    :options="options"
    filterable
    placeholder="搜索..."
  />
</template>
```

## 复用关系

```
vue-cascader-skill
├─ vue-input-skill       输入框触发器
├─ vue-dropdown-skill   下拉面板
└─ vue-tag-skill        已选标签展示
```

## Demo

- [基础单选](demo-components/base-cascader/html/01-simple-cascader.html)
