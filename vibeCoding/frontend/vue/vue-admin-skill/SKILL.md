---
name: vue-admin-skill
description: Vue 3 管理端技能：基于 Vue3 + TypeScript + Element Plus，生成标准化后台管理系统骨架。覆盖布局、路由、权限、菜单、表格、表单、图表、国际化等管理端核心场景。触发词："做管理后台"、"Vue admin"、"后台系统"、"管理端"。
---

# Vue Admin Skill

Vue 3 管理端技能，专注于后台管理系统的标准化生成。

## 概述

基于 Vue 3 + TypeScript + Element Plus + Pinia + Vue Router，生成生产级管理端骨架。

| 维度 | 技术选型 |
|------|---------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| UI 库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 请求层 | 复用 `frontend-request-skill` |
| 国际化 | vue-i18n |
| 图表 | ECharts |

## 核心模块

### 1. 布局系统

- 侧边栏（折叠/展开）
- 顶部导航栏
- 面包屑
- 多标签页
- 全屏/暗色模式切换

### 2. 权限管理

- 路由守卫
- 按钮级权限（v-permission）
- 动态菜单生成
- 角色/权限管理页面

### 3. 页面模板

| 页面 | 说明 |
|------|------|
| 登录/注册 | 带验证码、记住密码 |
| 仪表盘 | 数据卡片、图表、快捷入口 |
| 列表页 | 搜索 + 表格 + 分页 + 批量操作 |
| 详情页 | 信息卡片、Tab 切换 |
| 表单页 | 基础表单、步骤表单、弹窗表单 |
| 403/404/500 | 错误页面 |

### 4. 组件封装

| 组件 | 说明 |
|------|------|
| ProTable | 增强表格（搜索 + 列配置 + 批量） |
| ProForm | 增强表单（联动、校验、布局） |
| ProUpload | 文件/图片上传 |
| ProEditor | 富文本编辑器 |
| ProChart | ECharts 封装 |

## When to Use

- "帮我做一个管理后台"
- "Vue admin 系统"
- "后台管理系统"
- "做一个管理端"
- "Element Plus 管理端"

## 依赖技能

| 技能 | 用途 |
|------|------|
| `vue-generate-skill` | 项目骨架初始化 |
| `frontend-request-skill` | 请求层封装 |
| `vue-theme-skill` | 主题系统 |

## References

> 待补充：开发规范、组件规范、布局规范、权限规范

## Status

🚧 **规划中** — 空壳子，待完善
