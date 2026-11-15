---
name: flutter-generate-skill
description: 初始化 Flutter Android/iOS 应用骨架，交付主题、导航、首页与个人中心，以及检查和构建流程。触发词：Flutter 骨架、Flutter 脚手架、Flutter 项目初始化。
---

# Flutter App 骨架

先确定项目名、组织标识和交付端。新项目默认 Android 与 iOS，默认演示使用本地数据。既有项目按现有目录和依赖接入。

1. 执行 `flutter --version`、`flutter doctor -v`、`flutter devices`。记录实际版本及目标端缺项。Android 检查 SDK、JDK 和许可证。iOS 本地构建需要 macOS 与 Xcode。
2. 生成新项目时按 [快速开始](README.md) 运行初始化脚本。脚本调用 Flutter CLI 创建平台文件，再安装本技能的 Dart 模板。传正式包名时先确认组织标识。
3. `app.dart` 集中装配主题和导航。页面放在对应 feature 下。添加远程业务时，将数据访问封装在 Repository 和 Service，视图只消费状态。登录、请求、环境配置根据真实接口接入，区分加载、空数据和错误，凭证不得进入日志或示例。
4. 验收依次执行 `flutter analyze`、`flutter test`，再对可用的目标端构建并装机。检查启动、底栏切换、详情返回、系统字体放大和横竖屏。分开报告编译和设备结果。

官方参考：[Flutter CLI](https://docs.flutter.dev/reference/flutter-cli) · [应用架构](https://docs.flutter.dev/app-architecture/guide)
