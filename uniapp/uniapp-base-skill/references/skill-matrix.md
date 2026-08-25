# uniapp-base-skill 技能矩阵

> 本文件定义 `uniapp-base-skill` 在技能矩阵中的定位与协作流程。

## 核心定位

`uniapp-base-skill` 是 **uni-app 页面组件技能套件**，包含三个子技能：
- uniapp-card-skill - 卡片组件
- uniapp-form-skill - 表单组件
- uniapp-page-skill - 页面模板

## 子技能

| 子技能 | 说明 | 入口 |
|--------|------|------|
| uniapp-card-skill | 卡片组件（base-card、按钮、卡片布局） | [SKILL.md](../uniapp-card-skill/) |
| uniapp-form-skill | 表单组件（input/switch/radio/select/popup） | [SKILL.md](../uniapp-form-skill/) |
| uniapp-page-skill | 页面模板（列表页、详情页、登录页、TabBar） | [SKILL.md](../uniapp-page-skill/) |

## 配套技能

| 配套技能 | 职责 | 协作方式 |
|---------|------|---------|
| uniapp-theme-skill | 主题变量系统 | 生成代码时必须使用 `var(--*)` 变量 |
| uniapp-style-skill | 设计系统与组件规范 | 生成后审查 Typography、Token、布局 |
| frontend-style-harmonizer-skill | 样式一致性治理 | 生成后审查跨页面复用 |
