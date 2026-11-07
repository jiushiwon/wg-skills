# uniapp-base-skill 技能矩阵

> 本文件定义 `uniapp-base-skill` 在技能矩阵中的定位与协作流程。

## 核心定位

`uniapp-base-skill` 是 **uni-app 基础组件与容器的唯一真源**（原三个子技能已扁平化并入本模块）：

- 根容器层 `containers/` —— base-card / base-popup / base-form-item / base-avatar / base-navbar / base-tabbar
- 内置组件层 `components/` —— form / feedback / list / navigation / business 五类
- 场景 demo `demo-components/` —— 卡片布局 / 表单输入 / 页面模板的规范与 HTML 参考图

## 与其它 uniapp 技能的分工

| 技能 | 关系 | 说明 |
|------|------|------|
| `uniapp-page-components-skill` | 依赖本模块 | 页面级组件（聊天页 / 首页 / 详情页等） |
| `uniapp-style-skill` / `uniapp-theme-skill` | 依赖本模块 | 设计系统与主题变量真源 |

## 配套技能

| 配套技能 | 职责 | 协作方式 |
|---------|------|---------|
| uniapp-theme-skill | 主题变量系统 | 生成代码时必须使用 `var(--*)` 变量 |
| uniapp-style-skill | 设计系统与组件规范 | 生成后审查 Typography、Token、布局 |
| frontend-style-harmonizer-skill | 样式一致性治理 | 生成后审查跨页面复用 |
