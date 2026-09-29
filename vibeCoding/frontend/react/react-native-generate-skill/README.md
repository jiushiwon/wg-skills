# React Native Init Skill

面向**零基础小白**的 React Native 移动端应用一键初始化助手。

## 功能

一键生成标准化、开箱即用的 React Native 移动端应用骨架，包含完整登录页示例。

## 使用方式

直接说"帮我搭一个 React Native 项目"或"初始化 React Native 移动端"即可触发。

## 核心能力

| 能力 | 说明 |
|------|------|
| 环境探测 | 自动检测 Node.js/Java/Android SDK/Xcode |
| 项目生成 | 基于实际商业项目验证的完整骨架 |
| 登录页 | 带用户名/密码输入、登录按钮的完整示例 |
| 导航 | React Navigation 7.x 根导航 + 底部 Tab |
| 状态管理 | Zustand 5.x + AsyncStorage 持久化 |
| 一键启动 | `npx react-native start` |

## 依赖包规范

基于 `D:\projects\cq-app-merchant` 实际项目验证：

- 框架：React Native 0.86.2
- 导航：@react-navigation/native 7.x + react-native-screens 4.x
- 状态：zustand 5.x + @react-native-async-storage/async-storage
- UI：react-native-paper 5.x + react-native-vector-icons
- 网络：axios

详见 [references/packages.md](references/packages.md)

## 技能目录

```
react-native-generate-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
└── references/                 # 参考资料
    ├── skeleton.md            # 项目结构 + 核心代码模板
    ├── packages.md           # 依赖包规范
    ├── navigation.md         # React Navigation 配置
    └── state-management.md  # Zustand 状态管理
```
