# base-select 下拉选择

> 通用下拉选择组件，13 种形态，覆盖单选 / 多选 / 分组 / 级联 / 树形 / 远程 / 可创建等场景。

## 13 种形态

| # | 形态 | HTML |
|---|------|------|
| 00 | 总览 | [html/00-showcase.html](html/00-showcase.html) |
| 01 | 基础下拉 | [html/select-dropdown.html](html/select-dropdown.html) |
| 02 | 弹出面板 | [html/select-popup.html](html/select-popup.html) |
| 03 | 标签多选 | [html/select-tag.html](html/select-tag.html) |
| 04 | 城市级联 | [html/select-city.html](html/select-city.html) |
| 05 | 搜索下拉 | [html/select-search.html](html/select-search.html) |
| 06 | 宫格选择 | [html/select-grid.html](html/select-grid.html) |
| 07 | 多选下拉 | [html/select-multiple.html](html/select-multiple.html) |
| 08 | 分组选择 | [html/select-group.html](html/select-group.html) |
| 09 | 级联选择 | [html/select-cascade.html](html/select-cascade.html) |
| 10 | 树形选择 | [html/select-tree.html](html/select-tree.html) |
| 11 | 异步搜索 | [html/select-async-search.html](html/select-async-search.html) |
| 12 | 可创建 | [html/select-creatable.html](html/select-creatable.html) |

## 形态分类

**基础（6 种）**：基础下拉 / 弹出面板 / 标签多选 / 城市级联 / 搜索下拉 / 宫格选择
**业务扩展（4 种）**：多选下拉 / 分组选择 / 级联选择 / 综合展示
**高级（3 种）**：树形选择 / 异步搜索 / 可创建

## 规格文档

- [base-select.md](base-select.md) — 完整 Props / API / 设计原则

## 容器原则

> 所有 select 选择器必须嵌入 base-card。

```html
<view class="base-card">
  <view class="base-card__body">
    <base-select
      v-model="city"
      :options="cities"
      type="dropdown"
    />
  </view>
</view>
```

## 相关组件

- [base-input](../base-input/) — 输入框
- [base-radio](../base-radio/) — 单选框（13 种形态对照）
- [base-checkbox](../base-checkbox/) — 复选框（待补）