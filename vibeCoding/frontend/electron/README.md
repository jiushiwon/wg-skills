# Electron 前端技能

> 一组与 Electron 桌面端开发相关的 SKILL——解决「主进程无 HMR」、「xterm 渲染陷阱」等具体工程问题。

## 与 vue/、react/ 目录的关系

| 目录 | 关注 | 典型问题 |
|------|------|----------|
| `frontend/vue/` | Vue 组件库 + 主题 + 业务 | 表格、按钮、表单等组件 SKILL |
| `frontend/react/` | React 组件库 + 业务 | 同上 |
| **`frontend/electron/`** | **Electron 桌面端特有的工程问题** | **HMR、原生模块、终端渲染** |

本目录**不**重复沉淀通用组件——只解决 Electron 桌面端独有的、Vue/React 组件库覆盖不到的问题。

## 当前收录

| Skill | 触发场景 |
|------|----------|
| `electron-dev-restart/` | electron-vite dev 改 `electron/main/*` 不生效、用户报 "我点了 N 次都没用"、No handler registered |
| `xterm-js-rendering-pitfalls/` | vi gg/G 失效、vi :q 关不了、xterm 主题切换不生效、PTY 尺寸错乱 |

## 引用其他技能

| Skill | 关联场景 |
|------|----------|
| `vibeCoding/frontend/vue/electron-vue-init-skill` | 新建 Electron + Vue 项目时用（Vue 框架） |
| `vibeCoding/others/electron-native-abi-fix` | 原生模块 ABI 不匹配（`No handler registered` 可能是它而非 HMR） |
| `vibeCoding/frontend/vue/vue-theme-skill` | CSS 变量与主题系统（xterm 字体解析依赖它） |

## 不做

- 不沉淀通用 Vue/React 组件（已有 vue/、react/ 覆盖）
- 不重复 vue/electron-vue-init-skill 的"项目初始化"内容（那是新建项目时用，本目录聚焦"已有项目的踩坑排查"）
- 不写业务级 skill（如"如何用 SSH 连接服务器"——那是 user memory 或项目级 doc）