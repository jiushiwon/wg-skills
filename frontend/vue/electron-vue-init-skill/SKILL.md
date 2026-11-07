---
name: electron-vue-init-skill
description: Electron + Vue3 + TypeScript 桌面端应用一键初始化技能。基于 electron-vite（事实标准）构建，面向零基础小白，提供环境探测、自动安装、完整三进程分离骨架生成、一键启动/打包脚本。生成的应用页面中心显示"你好，我是考拉搞AI"的空白桌面端。触发词："Electron 脚手架"、"Electron 一键生成"、"初始化 Electron 项目"、"Electron 快速开始"、"electron init"、"搭建 Electron 服务"、"Electron 桌面端"、"Electron 零基础"、"Electron 小白"、"帮我搭一个 Electron"、"新建 Electron"、"create electron project"、"electron vue"、"electron vue3 桌面端"。
---

# Electron Vue3 Init Skill

基于 **electron-vite**（2025 年事实标准）+ Vue3 + TypeScript，面向**完全不懂编程的小白**，一键生成标准化、开箱即用的桌面端应用骨架。

## 技术选型（2025 最佳实践）

| 维度 | 选型 | 理由 |
|------|------|------|
| 构建工具 | **electron-vite** | 替代旧方案（vite-plugin-electron / electron-forge + webpack），社区主流 |
| 前端框架 | Vue 3 + TypeScript | 与 vue-generate-skill 保持一致 |
| 打包工具 | electron-builder | 成熟稳定，支持多平台 |
| IPC 通信 | contextBridge + invoke/handle | 安全最佳实践，禁止 nodeIntegration |
| 状态管理 | Pinia（Setup Store） | 与 vue-generate-skill 一致 |
| 请求层 | fetch（复用 frontend-request-skill） | 不重复造轮子 |

## 与 vue-generate-skill 的区别

| 维度 | vue-generate-skill | 本 skill |
|------|-------------------|----------|
| 目标用户 | 前端开发者 | 零基础小白 |
| 运行环境 | 浏览器 | **桌面端（Electron）** |
| 构建工具 | Vite | **electron-vite（三进程独立构建）** |
| 环境安装 | 用户自己装 | **自动检测 + 自动安装** |
| 打包 | 无 | **electron-builder 一键打包** |
| 窗口管理 | 无 | **原生窗口控制（最小化/最大化/关闭）** |
| 系统托盘 | 无 | **系统托盘支持** |
| IPC 通信 | 无 | **主进程/渲染进程安全通信** |
| 默认页面 | 无 | **页面中心显示"你好，我是考拉搞AI"** |
| 交互次数 | 多个技术问题 | **最多 2 个问题** |

**不重复造轮子**：
- 请求层复用 `frontend-request-skill`（桌面端同样用 fetch）
- Vue3 部分与 `vue-generate-skill` 保持一致的项目结构和规范
- 主题系统复用 `vue-theme-skill` 的 Token 体系

## 依赖

- **vue-generate-skill**：Vue3 项目结构、组件规范
- **vue-theme-skill**：设计 Token 体系（CSS 变量）
- **frontend-request-skill**：请求层规范（用于桌面端调用后端 API）

## 核心能力清单（9 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **环境探测** | 自动检测 Node.js 版本（>=18）、npm、操作系统 |
| 2 | **自动安装** | 初始化 npm、安装依赖 |
| 3 | **一键启动** | `npm run dev`：electron-vite 同时启动主进程 + 渲染进程 |
| 4 | **开发模式** | Vue3 热重载 + Electron 主进程自动重启 |
| 5 | **生产打包** | `npm run build`：electron-vite 构建 + electron-builder 打包 |
| 6 | **窗口管理** | 原生窗口控制、最小化、最大化、关闭 |
| 7 | **系统托盘** | 最小化到托盘、托盘菜单（可选） |
| 8 | **IPC 通信** | contextBridge 安全双向通信 |
| 9 | **默认页面** | 页面中心显示"你好，我是考拉搞AI" |

## 项目目录结构（electron-vite 标准）

```
{{project-name}}/
├── electron.vite.config.ts       # electron-vite 统一配置
├── electron-builder.json5        # 打包配置
├── package.json                  # 依赖 + scripts
├── tsconfig.json                 # 根 TS 配置
├── tsconfig.node.json            # 主进程/预加载 TS 配置
├── tsconfig.web.json             # 渲染进程 TS 配置
├── src/
│   ├── main/                     # Electron 主进程
│   │   └── index.ts              # 主进程入口
│   ├── preload/                  # 预加载脚本
│   │   ├── index.ts              # contextBridge 暴露 API
│   │   └── electron.d.ts         # 类型声明
│   └── renderer/                 # Vue3 渲染进程
│       ├── index.html            # HTML 入口
│       ├── src/
│       │   ├── main.ts           # Vue 入口
│       │   ├── App.vue           # 根组件
│       │   ├── router/           # 路由
│       │   │   └── index.ts
│       │   ├── stores/           # Pinia 状态管理
│       │   │   ├── index.ts
│       │   │   └── modules/
│       │   ├── views/            # 页面
│       │   │   └── HomeView.vue  # 默认页面（"你好，我是考拉搞AI"）
│       │   ├── components/       # 组件
│       │   ├── api/              # 请求层（复用 frontend-request-skill）
│       │   ├── styles/           # 样式（复用 vue-theme-skill Token）
│       │   │   └── tokens.css
│       │   ├── utils/            # 工具函数
│       │   └── types/            # 类型定义
│       └── env.d.ts              # Vite 类型声明
└── resources/                    # 应用资源（图标等）
    └── icon.png
```

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
2. 写入配置文件（`package.json`、`electron.vite.config.ts`、`electron-builder.json5`、`tsconfig*.json`）
3. 写入主进程（`src/main/index.ts`）
4. 写入预加载脚本（`src/preload/index.ts`、`src/preload/electron.d.ts`）
5. 写入 Vue3 渲染进程（`src/renderer/` 完整结构）
6. 写入默认页面（`src/renderer/src/views/HomeView.vue`）
7. 写入项目说明（`README.md`）

### 第四步：自动安装与启动

生成完成后：
1. 运行 `npm install`
2. 提示用户运行 `npm run dev` 启动开发模式

### 第五步：交付清单

向用户汇报完整交付物：

```
✅ 项目 {{project}} 生成完毕！

📁 生成的文件（约 20 个）：
  - Electron 主进程：src/main/index.ts
  - 预加载脚本：src/preload/index.ts, src/preload/electron.d.ts
  - Vue3 应用：src/renderer/src/main.ts, App.vue, views/HomeView.vue
  - 构建配置：electron.vite.config.ts, electron-builder.json5
  - TS 配置：tsconfig.json, tsconfig.node.json, tsconfig.web.json
  - 启动脚本：package.json scripts

🚀 启动方式：
  开发模式：  npm run dev        （Vue3 热重载 + Electron 主进程自动重启）
  生产构建：  npm run build      （electron-vite 构建 + electron-builder 打包）
  预览构建：  npm run preview    （预览生产构建结果）

📦 打包平台：
  Windows：  .exe（nsis 安装包）
  macOS：    .dmg
  Linux：    .AppImage

🎯 默认页面：
  页面中心显示"你好，我是考拉搞AI"

🔒 安全架构：
  - contextBridge 隔离（禁止 nodeIntegration）
  - IPC invoke/handle 模式（禁止 send/on）
  - CSP 内容安全策略
```

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/skeleton.md` | 完整目录结构 + 核心文件代码模板（electron-vite 标准） |
| `references/env-setup.md` | 环境探测流程、自动安装逻辑 |
| `references/ipc-guide.md` | IPC 通信方案、contextBridge 安全模式 |
| `references/tray-guide.md` | 系统托盘集成方案 |
| `references/packaging-guide.md` | electron-builder 打包配置 |

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 项目指南 | `README.md` | 启动方式、打包命令 |
| 默认页面 | `src/renderer/src/views/HomeView.vue` | 页面中心显示"你好，我是考拉搞AI" |
| IPC 类型声明 | `src/preload/electron.d.ts` | TypeScript 类型安全 |

## 红线（不可绕过）

1. **必须使用 electron-vite**：不使用 vite-plugin-electron 或手动配置，统一用 electron-vite。
2. **三进程严格分离**：`src/main/`、`src/preload/`、`src/renderer/` 代码不互相引用。
3. **不跳过环境探测**：生成前必须先检查用户环境，无法安装则给出明确提示。
4. **不替用户提交 git**。
5. **所有注释、文档用中文**：目标用户是中文小白，不要英文注释。
6. **默认页面必须显示"你好，我是考拉搞AI"**：页面水平垂直居中。
7. **必须使用 electron-builder 打包**：确保生成可执行文件。
8. **安全第一**：禁止 `nodeIntegration: true`，必须用 `contextBridge`。
9. **IPC 必须用 invoke/handle**：禁止 `send/on` 模式（除非是主进程主动推送）。

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
- 不做跨平台原生模块编译（如 native node modules）
