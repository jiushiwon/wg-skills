# Electron Vue3 Init Skill

基于 **electron-vite**（2025 年事实标准）+ Vue3 + TypeScript 的桌面端应用一键初始化助手。

## 功能

一键生成标准化、开箱即用的 Electron + Vue3 桌面端应用骨架，采用三进程严格分离架构。

## 技术栈

| 维度 | 选型 |
|------|------|
| 构建工具 | electron-vite |
| 前端框架 | Vue 3 + TypeScript |
| 打包工具 | electron-builder |
| IPC 通信 | contextBridge + invoke/handle |
| 状态管理 | Pinia（Setup Store） |

## 使用方式

直接说"帮我搭一个 Electron 项目"或"初始化 Electron 桌面端"即可触发。

## 核心能力

| 能力 | 说明 |
|------|------|
| 环境探测 | 自动检测 Node.js >=18、npm |
| 一键启动 | `npm run dev` 开发模式（热重载） |
| 生产打包 | `npm run build` 生成 .exe / .dmg / .AppImage |
| 窗口管理 | 最小化/最大化/关闭 |
| 系统托盘 | 最小化到托盘（可选） |
| IPC 通信 | contextBridge 安全双向通信 |

## 默认页面

生成的应用启动后，页面中心显示：**你好，我是考拉搞AI**

## 目录说明

```
electron-vue-init-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
└── references/                 # 参考资料
    ├── skeleton.md            # 项目结构 + 代码模板
    ├── env-setup.md           # 环境探测
    ├── ipc-guide.md           # IPC 通信
    ├── tray-guide.md          # 系统托盘
    └── packaging-guide.md     # 打包配置
```
