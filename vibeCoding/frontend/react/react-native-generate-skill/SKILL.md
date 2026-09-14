---
name: react-native-generate-skill
description: React Native 项目一键初始化技能。面向零基础小白，提供环境探测、自动安装、完整 React Native 移动端骨架生成、一键启动/打包脚本、所需依赖包规范文档。触发词："React Native 脚手架"、"React Native 一键生成"、"初始化 React Native 项目"、"React Native 快速开始"、"reactnative init"、"搭建 React Native 服务"、"React Native 移动端"、"React Native 零基础"、"React Native 小白"、"帮我搭一个 React Native"、"新建 React Native"、"create reactnative project"、"reactnative starter"。
---

# React Native Init Skill

面向**完全不懂编程的小白**，一键生成标准化、开箱即用的 React Native 移动端应用骨架。

## 与其他前端初始化技能的区别

| 维度 | vue-generate-skill | electron-vue3-skill | 本 skill |
|------|-------------------|---------------------|----------|
| 目标用户 | 零基础小白 | 零基础小白 | 零基础小白 |
| 运行环境 | 浏览器 | 桌面端 | **移动端（iOS/Android）** |
| 框架 | Vue3 | Vue3 + Electron | **React Native** |
| 环境安装 | 自动检测 | 自动检测 | **自动检测 + 复杂依赖（Java/Android SDK/Xcode）** |
| 打包 | npm run build | electron-builder | **Expo / react-native-cli** |
| 平台 | Web | Windows/macOS/Linux | **iOS + Android** |
| 交互次数 | 2个问题 | 2个问题 | **3个问题** |

**不重复造轮子**：请求层复用 `frontend-request-skill`（如有 API 需求）；React 部分遵循 React 社区最佳实践。

## 依赖

- **Java JDK**：Android 开发需要 JDK 17+
- **Android Studio**：Android SDK 管理
- **Xcode**（macOS）：iOS 开发
- **Node.js**：>= 18 LTS
- **npm / yarn**：包管理

## 核心能力清单（10 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **环境探测** | 自动检测 Node.js、Java、Android SDK、Xcode（macOS）环境 |
| 2 | **自动安装** | 初始化项目、安装依赖、检查环境兼容性 |
| 3 | **Expo 推荐** | 默认使用 Expo（简化配置） |
| 4 | **一键启动** | `npx expo start`：启动开发服务器 |
| 5 | **开发模式** | 热重载、Expo Go 实时预览 |
| 6 | **生产打包** | `npx expo build:android` / `npx expo build:ios` |
| 7 | **导航** | React Navigation 配置 |
| 8 | **状态管理** | Zustand / Context API |
| 9 | **UI 组件** | React Native 基础组件 |
| 10 | **网络请求** | Fetch / axios 配置 |

## 生成流程

### 第一步：询问用户（只问 3 个问题）

```
1. 项目名叫什么？（默认 my-rn-app）
2. 使用 Expo 还是 React Native CLI？（默认 Expo，推荐）
3. 需要哪些常用依赖？（如 React Navigation、状态管理、UI 库等）
```

**不做**：不问技术细节——全部自动选最佳实践。

### 第二步：环境探测

按 `references/env-setup.md` 流程执行：

1. 检测 Node.js 是否安装（需 >= 18 LTS）
2. 检测 Java JDK（Android 开发需要 JDK 17+）
3. 检测 Android Studio / SDK（Android 开发）
4. 检测 Xcode（macOS iOS 开发）
5. 若未安装：给出明确的中文提示 + 下载链接

### 第三步：生成项目骨架

按 `references/skeleton.md` 的目录结构与代码模板，现场生成全部文件。

生成顺序：
1. 创建项目（Expo 推荐）
2. 安装核心依赖
3. 配置导航
4. 配置状态管理
5. 创建示例页面
6. 写入项目说明（`README.md`）

### 第四步：自动安装与启动

生成完成后：
1. 运行 `npm install`
2. 提示用户运行 `npx expo start` 启动

### 第五步：交付清单

向用户汇报完整交付物：

```
✅ 项目 {{project}} 生成完毕！

📁 生成的文件：
  - 项目配置：app.json, package.json, tsconfig.json
  - 入口文件：App.tsx
  - 页面示例：src/screens/HomeScreen.tsx
  - 导航配置：src/navigation/AppNavigator.tsx
  - 状态管理：src/store/index.ts
  - 工具函数：src/utils/*

🚀 启动方式：
  开发模式：  npx expo start        （按 i 启动 iOS，a 启动 Android）
  Web预览：   npx expo start --web

📦 打包命令：
  Android：   npx expo build:android
  iOS：      npx expo build:ios（需要 Apple 开发者账号）

📱 运行方式：
  1. 手机安装 Expo Go
  2. 扫描终端显示的二维码
  3. 即可实时预览

⚠️ 环境要求：
  Android 开发：JDK 17+、Android Studio
  iOS 开发：macOS + Xcode
```

## 依赖包规范

### 必需依赖

```json
{
  "dependencies": {
    "react": "19.0.0",
    "react-native": "0.86.2"
  }
}
```

### 常用依赖（按需选择）

| 类别 | 包名 | 版本 | 说明 |
|------|------|------|------|
| 导航 | @react-navigation/native | ^7.3.0 | 导航核心 |
| 导航 | @react-navigation/native-stack | ^7.3.0 | 堆栈导航 |
| 导航 | @react-navigation/bottom-tabs | ^7.3.0 | 底部标签导航 |
| 导航 | react-native-screens | ^4.10.0 | 导航性能优化 |
| 导航 | react-native-safe-area-context | ^5.3.0 | 安全区域 |
| 状态 | zustand | ^5.0.0 | 轻量状态管理 |
| 状态 | @react-native-async-storage/async-storage | ^2.1.0 | 持久化存储 |
| UI | react-native-paper | ^5.15.0 | Material Design 组件 |
| UI | react-native-vector-icons | ^10.0.0 | 图标库 |
| UI | @react-native-vector-icons/material-design-icons | ^10.0.0 | Material 图标 |
| UI | react-native-linear-gradient | ^2.8.0 | 渐变背景 |
| 网络 | axios | ^1.7.0 | HTTP 客户端 |
| 表单 | react-hook-form | ^7.x | 表单处理 |
| 类型 | typescript | ^5.x | TypeScript |

> **重要**：React Navigation 7.x 需要配合 react-native-screens 4.x 和 react-native-safe-area-context 5.x 使用

## 生成项目的目录结构

```
{{project}}/
├── App.tsx                    # 应用入口（Provider 包裹）
├── app.json                  # Expo / RN 配置
├── package.json              # 依赖配置
├── tsconfig.json            # TypeScript 配置
├── babel.config.js          # Babel 配置
├── metro.config.js           # Metro 打包配置
├── android/                  # Android 原生项目
├── ios/                      # iOS 原生项目
└── src/
    ├── assets/               # 静态资源
    │   └── images/
    ├── components/           # 通用组件
    │   ├── common/          # 基础组件（AppScreen, AppTextInput, AppScrollView）
    │   └── business/        # 业务组件
    ├── config/               # 配置
    │   └── env.ts           # 环境配置
    ├── data/                # 静态数据
    ├── hooks/               # 自定义 Hooks
    ├── navigation/          # 导航配置
    │   ├── AppTabs.tsx     # 底部标签导航
    │   ├── RootNavigator.tsx # 根导航（根据登录态切换）
    │   ├── navigationRef.ts # 导航引用
    │   └── types.ts         # 类型定义
    ├── screens/             # 页面
    │   ├── auth/           # 认证相关
    │   │   └── LoginScreen.tsx
    │   ├── common/         # 通用页面
    │   │   ├── SplashScreen.tsx
    │   │   ├── ForbiddenScreen.tsx
    │   ├── home/           # 首页
    │   │   └── HomeScreen.tsx
    │   └── mine/           # 我的页
    │       └── MineScreen.tsx
    ├── services/            # API 服务
    │   ├── http.ts         # axios 封装
    │   └── auth.ts         # 登录 API
    ├── store/               # 状态管理（Zustand）
    │   ├── authStore.ts    # 登录态
    │   ├── toastStore.ts   # Toast 提示
    │   └── sessionStore.ts # 会话
    ├── theme/               # 主题系统
    │   ├── colors.ts       # 颜色
    │   ├── typography.ts   # 字体
    │   ├── spacing.ts      # 间距
    │   └── index.ts        # 统一导出
    ├── types/               # 类型定义
    └── utils/               # 工具函数
```

> 完整目录结构和代码模板见 `references/skeleton.md`

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/skeleton.md` | 完整目录结构 + 核心文件代码模板（App.tsx、LoginScreen、导航、Store） |
| `references/packages.md` | 依赖包规范、版本建议（React Navigation 7.x、Zustand 5.x） |
| `references/navigation.md` | React Navigation 7.x 配置、根导航 + 底部 Tab |
| `references/state-management.md` | Zustand 5.x + AsyncStorage 持久化方案 |

## 红线（不可绕过）

1. **必须进行环境探测**：React Native 环境配置复杂，生成前必须检查用户环境。
2. **推荐使用 Expo**：降低配置复杂度，除非用户明确要原生模块。
3. **所有注释、文档用中文**：目标用户是中文小白。
4. **不替用户提交 git**。
5. **必须提供依赖包规范**：将所需的包以规范形式写入 `references/packages.md`。

## 触发关键词清单

```
React Native 脚手架、React Native 一键生成、初始化 React Native 项目、React Native 快速开始、
reactnative init、搭建 React Native 移动端、React Native 骨架、React Native 开箱即用、
React Native 零基础、React Native 小白、帮我搭一个 React Native、新建 React Native、
create reactnative project、reactnative starter、RN 脚手架
```

## 不做

- 不生成与 vue-generate-skill / electron-vue3-skill 完全相同的骨架（本 skill 是 React Native 移动端版本）
- 不跳过环境探测（RN 环境配置复杂）
- 不负责安装系统级依赖（Java、Android Studio、Xcode）
- 不锁定版本号
- 不替用户提交 git
- 不加未请求的功能（如推送、地图——除非用户明确说要）
