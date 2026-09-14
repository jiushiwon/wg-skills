# React Native 依赖包规范

基于实际商业项目验证的依赖版本组合。

## 核心依赖

```json
{
  "react-native": "0.86.2",
  "react": "19.x",
  "typescript": "^5.0.0"
}
```

## 导航（React Navigation 7.x）

```json
{
  "@react-navigation/native": "^7.3.0",
  "@react-navigation/native-stack": "^7.3.0",
  "@react-navigation/bottom-tabs": "^7.3.0",
  "react-native-screens": "^4.10.0",
  "react-native-safe-area-context": "^5.3.0"
}
```

> **版本注意**：React Navigation 7.x 需要 react-native-screens 4.x + react-native-safe-area-context 5.x

## 状态管理（Zustand 5.x）

```json
{
  "zustand": "^5.0.0",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

## UI 组件库

```json
{
  "react-native-paper": "^5.15.0",
  "react-native-vector-icons": "^10.0.0",
  "@react-native-vector-icons/material-design-icons": "^10.0.0",
  "react-native-linear-gradient": "^2.8.0"
}
```

> **react-native-vector-icons**：需要额外配置 native 代码，通常用 MaterialIcons 图标库

## 网络请求

```json
{
  "axios": "^1.7.0"
}
```

## 开发依赖

```json
{
  "@types/react": "^19.0.0",
  "@types/react-native-vector-icons": "^6.4.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0"
}
```

## 完整 package.json 模板

```json
{
  "name": "{{project}}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "lint": "eslint .",
    "start": "react-native start",
    "test": "jest",
    "build:android": "cd android && ./gradlew assembleRelease"
  },
  "dependencies": {
    "react": "19.0.0",
    "react-native": "0.86.2",
    "@react-navigation/native": "^7.3.16",
    "@react-navigation/native-stack": "^7.3.18",
    "@react-navigation/bottom-tabs": "^7.3.16",
    "react-native-screens": "^4.10.0",
    "react-native-safe-area-context": "^5.3.0",
    "zustand": "^5.0.15",
    "@react-native-async-storage/async-storage": "^2.1.2",
    "react-native-paper": "^5.15.3",
    "react-native-vector-icons": "^10.2.0",
    "@react-native-vector-icons/material-design-icons": "^10.2.0",
    "react-native-linear-gradient": "^2.8.3",
    "axios": "^1.19.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@babel/preset-env": "^7.25.0",
    "@babel/runtime": "^7.25.0",
    "@react-native/babel-preset": "0.86.2",
    "@react-native/eslint-config": "0.86.2",
    "@react-native/metro-config": "0.86.2",
    "@react-native/typescript-config": "0.86.2",
    "@types/react": "^19.0.0",
    "@types/react-native-vector-icons": "^6.4.18",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0",
    "typescript": "^5.4.0"
  },
  "engines": {
    "node": ">=18"
  }
}
```

## Native 配置

### iOS

```bash
cd ios && pod install
```

### Android

```gradle
// android/app/build.gradle
android {
    compileSdkVersion 35
    namespace "{{package}}"

    defaultConfig {
        applicationId "{{package}}"
        minSdkVersion 24
        targetSdkVersion 35
        versionCode 1
        versionName "1.0.0"
    }
}
```

## 依赖安装顺序

1. 创建项目后先安装核心依赖：`npm install`
2. 安装导航依赖：`npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context`
3. 安装状态管理：`npm install zustand @react-native-async-storage/async-storage`
4. 安装 UI 库：`npm install react-native-paper react-native-vector-icons react-native-linear-gradient`
5. 安装网络：`npm install axios`
6. 运行 iOS 安装：`cd ios && pod install`
7. 启动：`npx react-native start`

## 常见问题

- **react-native-vector-icons 不显示**：需要配置 native 添加字体资源
- **LinearGradient 编译失败**：确保 native 模块已 link 或使用 autolinking
- **Navigation 闪退**：检查 react-native-screens 和 react-native-safe-area-context 版本兼容性
