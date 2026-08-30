# React Init Skill

面向**前端开发者**的 React 18 + TypeScript + Vite + Zustand 项目一键初始化助手。

## 功能

标准化、开箱即用的 React SPA 骨架生成。

## 使用方式

直接说"帮我做一个 React 项目"或"初始化 React + TS 模板"即可触发。

## 核心能力

| 能力 | 说明 |
|------|------|
| 环境探测 | 自动检测 Node.js、npm |
| 一键启动 | `npm run dev` |
| 类型检查 | `tsc --noEmit` 严格模式 |
| 代码规范 | ESLint + Prettier |
| 请求层 | 严格复用 frontend-request-skill |
| 状态管理 | Zustand |
| 路由 | React Router DOM |

## 目录说明

```
react-init-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
├── demo/                       # 示例项目
└── references/                 # 参考资料
    ├── project-structure.md    # 标准目录结构
    ├── tsconfig-template.md   # TypeScript 严格配置
    ├── vite-config-template.md # Vite 配置
    ├── api-integration.md     # 请求层集成
    └── code-examples/         # 代码示例
```

## 与 vue-generate-skill 的区别

| 维度 | vue-generate-skill | react-init-skill |
|------|-------------------|------------------|
| 框架 | Vue 3 | React 18 |
| 状态管理 | Pinia | Zustand |
| 路由 | vue-router | react-router-dom |
| 组件风格 | `<script setup>` | Hooks + 函数组件 |
| UI 库 | Element Plus | Ant Design |
