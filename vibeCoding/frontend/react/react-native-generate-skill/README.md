# React Native Init Skill

面向**零基础小白**的 React Native 移动端应用一键初始化助手。

## 功能

一键生成标准化、开箱即用的 React Native 移动端应用骨架。

## 使用方式

直接说"帮我搭一个 React Native 项目"或"初始化 React Native 移动端"即可触发。

## 核心能力

| 能力 | 说明 |
|------|------|
| 环境探测 | 自动检测 Node.js/Java/Android SDK/Xcode |
| Expo 推荐 | 默认使用 Expo 简化配置 |
| 一键启动 | `npx expo start` |
| 热重载 | 修改代码即时预览 |
| 生产打包 | Expo build:android/ios |
| 导航 | React Navigation |
| 状态管理 | Zustand |

## 依赖包规范

常用依赖已写入 `references/packages.md`，包括：
- 导航：@react-navigation/native
- 状态：zustand
- UI：react-native-paper
- 图标：@expo/vector-icons
- 网络：axios

## 目录说明

```
react-native-init-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
└── references/                 # 参考资料
    ├── skeleton.md            # 项目结构
    ├── env-setup.md           # 环境探测
    ├── packages.md           # 依赖包规范
    ├── navigation.md         # 导航配置
    ├── state-management.md  # 状态管理
    └── packaging.md         # 打包配置
```
