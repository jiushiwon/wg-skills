# Flutter App 骨架

先把 Flutter stable 加入 PATH，在你准备创建项目的目录执行。脚本参数依次为新目录、Dart 项目名和组织标识。脚本拒绝已有目录。

```sh
python path/to/flutter-generate-skill/create_app.py ./demo_app demo_app com.example
cd demo_app
flutter analyze
flutter test
flutter devices
flutter run -d DEVICE_ID
```

Android 调试包执行 `flutter build apk --debug`；发布时配置签名后按分发目标执行 `flutter build appbundle`。在 macOS 上可执行 `flutter build ios --no-codesign` 检查编译；实际装机或发布需单独配置签名。iOS 发布使用 `flutter build ipa`。

模板使用 Flutter SDK 自带组件，提供 Material 3 明暗主题、首页列表与详情、个人中心和底部导航。业务服务在接入真实项目时按需求增加。

初始化脚本依据 SDK 版本适配 Material 包入口，并生成 package 导入的导航测试。当前验证覆盖项目生成与 Dart 检查，Android/iOS 安装包和真机结果需在对应工具链下验收。

2026-11-15 验证记录：通过脚本生成 Android/iOS 平台工程，flutter analyze 无问题，flutter test 导航往返与个人中心切换通过。未构建 Android/iOS 安装包。
