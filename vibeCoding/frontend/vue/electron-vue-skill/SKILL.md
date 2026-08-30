---
name: electron-vue3-skill
description: Electron + Vue3 桌面端应用一键初始化技能。面向零基础小白，提供环境探测、自动安装、完整 Electron+Vue3 桌面端骨架生成、一键启动/打包脚本。生成的应用页面中心显示"你好，我是考拉搞AI"的空白桌面端。触发词："Electron 脚手架"、"Electron 一键生成"、"初始化 Electron 项目"、"Electron 快速开始"、"electron init"、"搭建 Electron 服务"、"Electron 桌面端"、"Electron 零基础"、"Electron 小白"、"帮我搭一个 Electron"、"新建 Electron"、"create electron project"、"electron vue"、"electron vue3 桌面端"。
---

# Electron Vue3 Init Skill

面向**完全不懂编程的小白**，一键生成标准化、开箱即用的 Electron + Vue3 桌面端应用骨架。

## 与 vue-generate-skill 的区别

| 维度 | vue-generate-skill | 本 skill |
|------|-------------------|----------|
| 目标用户 | 前端开发者 | 零基础小白 |
| 运行环境 | 浏览器 | **桌面端（Electron）** |
| 环境安装 | 用户自己装 | **自动检测 + 自动安装** |
| 打包 | 无 | **electron-builder 一键打包** |
| 窗口管理 | 无 | **原生窗口控制（最小化/最大化/关闭）** |
| 系统托盘 | 无 | **系统托盘支持** |
| IPC 通信 | 无 | **主进程/渲染进程通信** |
| 默认页面 | 无 | **页面中心显示"你好，我是考拉搞AI"** |
| 交互次数 | 多个技术问题 | **最多 2 个问题** |

**不重复造轮子**：请求层复用 `frontend-request-skill`；Vue3 部分与 `vue-generate-skill` 保持一致的项目结构和规范。

## 依赖

- **vue-generate-skill**：Vue3 项目结构、组件规范
- **frontend-request-skill**：请求层规范（可选，用于桌面端调用后端 API）

## 核心能力清单（9 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **环境探测** | 自动检测 Node.js 版本（>=18）、npm、Electron 环境 |
| 2 | **自动安装** | 初始化 npm、安装依赖、Electron 环境检查 |
| 3 | **一键启动** | `npm run dev`：同时启动 Vue3 开发服务器和 Electron |
| 4 | **开发模式** | Vue3 热重载 + Electron 实时预览 |
| 5 | **生产打包** | `npm run build`：生成可执行的 .exe / .dmg / .AppImage |
| 6 | **窗口管理** | 原生窗口控制、最小化、最大化、关闭 |
| 7 | **系统托盘** | 最小化到托盘、托盘菜单 |
| 8 | **IPC 通信** | 主进程/渲染进程双向通信 |
| 9 | **默认页面** | 页面中心显示"你好，我是考拉搞AI" |

## 生成流程

### 第一步：询问用户（只问 2 个问题）

```
1. 项目名叫什么？（默认 my-electron-app）
2. 需要系统托盘吗？（默认不需要）
```

**不做**：不问技术细节、不问打包平台——全部自动选最佳实践。

### 第二步：环境探测

按 `references/env-setup.md` 流程执行：

1. 检测 Node.js 是否安装 / 版本（需 >= 18 LTS）
2. 检测 npm 是否可用
3. 检测操作系统（Windows / macOS / Linux）
4. 若未安装：给出明确的中文提示 + 下载链接

### 第三步：生成项目骨架

按 `references/skeleton.md` 的目录结构与代码模板，现场生成全部文件。

生成顺序：
1. 创建目录结构
2. 写入依赖与配置（`package.json`、`vite.config.ts`、`electron-builder.json`、`electron/main.ts`、`electron/preload.ts`）
3. 写入 Vue3 核心模块（`src/main.ts`、`src/App.vue`、`src/views/HomeView.vue`）
4. 写入启动脚本（`package.json` scripts）
5. 写入项目说明（`README.md`）

### 第四步：自动安装与启动

生成完成后：
1. 运行 `npm install`
2. 提示用户运行 `npm run dev` 启动开发模式

### 第五步：交付清单

向用户汇报完整交付物：

```
✅ 项目 {{project}} 生成完毕！

📁 生成的文件（约 15 个）：
  - Electron 主进程：electron/main.ts, electron/preload.ts
  - Vue3 应用：src/main.ts, src/App.vue, src/views/HomeView.vue
  - 构建配置：vite.config.ts, electron-builder.json
  - 启动脚本：package.json scripts

🚀 启动方式：
  开发模式：  npm run dev        （Vue3 热重载 + Electron 实时预览）
  生产打包：  npm run build      （生成可执行文件）

📦 打包平台：
  Windows：  .exe（nsis）
  macOS：    .dmg
  Linux：    .AppImage

🎯 默认页面：
  页面中心显示"你好，我是考拉搞AI"

⚠️ 安全提醒：
  请勿在 preload 中暴露过多 Node.js API
```

## 生成项目的目录结构

参见 `references/skeleton.md` 的「目录结构」小节。核心约定：

- 主进程入口：`electron/main.ts`
- 预加载脚本：`electron/preload.ts`
- Vue3 入口：`src/main.ts`
- 默认页面：`src/views/HomeView.vue`（显示"你好，我是考拉搞AI"）
- 开发命令：`npm run dev`
- 打包命令：`npm run build`

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/skeleton.md` | 精简目录结构 + 核心文件代码模板 |
| `references/env-setup.md` | 环境探测流程、自动安装逻辑 |
| `references/ipc-guide.md` | IPC 通信方案、主进程/渲染进程交互 |
| `references/tray-guide.md` | 系统托盘集成方案 |
| `references/packaging-guide.md` | electron-builder 打包配置 |

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 项目指南 | `README.md` | 启动方式、打包命令 |
| 默认页面 | `src/views/HomeView.vue` | 页面中心显示"你好，我是考拉搞AI" |

## 红线（不可绕过）

1. **不跳过环境探测**：生成前必须先检查用户环境，无法安装则给出明确提示。
2. **不替用户提交 git**。
3. **所有注释、文档用中文**：目标用户是中文小白，不要英文注释。
4. **默认页面必须显示"你好，我是考拉搞AI"**：页面水平垂直居中。
5. **必须使用 electron-builder 打包**：确保生成可执行文件。

## 触发关键词清单

```
Electron 脚手架、Electron 一键生成、初始化 Electron 项目、Electron 快速开始、
electron init、搭建 Electron 桌面端、Electron Vue3 骨架、Electron 开箱即用、
Electron 零基础、Electron 小白、帮我搭一个 Electron、新建 Electron、
create electron project、electron vue、electron vue3 桌面端
```

## 不做

- 不生成与 vue-generate-skill 完全相同的骨架（本 skill 是 Electron 桌面端版本）
- 不询问技术细节（electron 版本等——全部自动选最佳实践）
- 不负责安装系统级依赖
- 不锁定版本号
- 不替用户提交 git
- 不加未请求的功能（如自动更新——除非用户明确说要）
