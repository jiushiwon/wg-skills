---
name: react-native-generate-skill
description: 生成或完善 React Native / Expo 移动应用骨架，检查环境与依赖，交付统一主题、导航、请求、状态及 dev 开发、test/prod 打包、签名配置与测试脚本。适用于 RN 初始化、模拟器/真机启动和环境交付。
---

# React Native 骨架生成

## 执行顺序
1. 先读 `references/runtime-delivery.md`，识别新建/已有项目、Expo/原生路线、主机与目标平台。用户已给出的信息直接沿用。
2. 检查 package.json、锁文件、原生配置及工具链。按目标 RN/Expo 版本选择兼容依赖并锁定，不盲目升最新；旧参考中的版本不是当前兼容保证。
3. 官方初始化后，参照 `references/skeleton.md` 生成主题、导航、请求、状态与页面；所有引用必须对应真实实现。导航细节见 `references/navigation.md`，状态见 `references/state-management.md`，包分类见 `references/packages.md`。
4. 原生工程合入 `assets/runtime/`，合并 npm scripts，完成 Android Gradle 和 iOS Scheme/签名/导出配置。Expo 按 runtime-delivery 的独立分支处理。
5. 交付 dev 本地运行、test 测试包、prod 正式包及测试/证据收集脚本；按目标主机修正命令。生成 README 和逐项验证记录。

## 统一规范
- 复用可用的 React 主题、基础组件、请求技能；全局字体、间距、颜色集中维护，遵循仓库 API 契约。中文业务文案、无 emoji 图标。
- 页面包含登录、首页列表、详情、设置，带稳定 testID；离线数据与真实 API 分离。
- 环境与签名是不同维度：dev 通常 Debug 自动调试签名；test/prod Release 使用各自分发与签名配置，不能回退 debug 签名。
- 客户端环境变量会进入包，不能保管服务端密钥。不得复制参考项目的真实地址、账号、密码或证书。
- 自动完成可执行的项目依赖安装；系统安装、许可证和签名账户按主机条件处理，不承诺所有组件静默安装。
- 执行静态检查和可用设备验证，未执行的项目明确记录；不能以生成文件代替装机成功。除非用户要求，不提交生成项目。

## 资源
- `assets/runtime/`：环境文件、运行/打包脚本、请求配置、Maestro smoke flow。
- `references/runtime-delivery.md`：环境、签名、原生接线、Expo 分支与验收约束，必读。
- 其他 references 为结构与业务参考，必须补齐引用、按兼容矩阵调整版本。
