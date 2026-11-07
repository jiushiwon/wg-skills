# Vue 级联选择器

面向多级分类数据的级联选择场景。先复用项目已有规范，再组合业务区块；不得为组件另建主题、请求封装或基础组件体系。

## 适用

- “做一个省市区选择器”
- “做分类多级选择”
- “做一个带搜索的级联选择”

## 依赖顺序

`vue-theme-skill` → `vue-input-skill` → `vue-dropdown-skill` → `vue-tag-skill` → 本 Skill。

## 目录

- `demo-components/base-cascader/html/01-simple-cascader.html`：交互演示

## Demo

![级联选择器](demo-components/base-cascader/html/01-simple-cascader.html)

## 边界

- 组件只处理级联选择逻辑；数据源由业务层注入。
- 动态加载、远程搜索等高级特性在业务层扩展。
