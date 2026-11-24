# 运行交付：必须先读，再生成

## 初始化与版本
- 先识别已有 Expo / 原生工程，禁止混用命令或覆盖原生配置。新建原生工程使用匹配版本的官方 Community CLI 初始化；Expo 用 create-expo-app 与 Expo 安装器匹配依赖。
- 读取 RN/Expo 的目标版本文档，生成 Node、React、RN、CLI、JDK、Gradle、AGP、SDK、Xcode、Pods 兼容矩阵与锁文件。旧参考的版本号仅示例，不能作为强制版本。
- 自动检查环境并安装项目依赖；可用包管理器安装获授权的系统组件。SDK 许可、Xcode 首次初始化、账户、证书等需要用户操作，明确步骤，不能声称均能无交互安装。

## 必须落地的文件
assets/runtime 是原生工程可执行运行层，不是完整 RN 项目。用官方初始化生成 android/ios，再将运行层合入项目，已有文件先比对，不覆盖用户配置。合并 package.scripts.json 到 package.json.scripts，不将它作为独立 package.json。依赖包含 axios。

- `.env.dev/test/prod` 仅公开配置，无服务端密钥。`src/config/env.generated.ts` 自动生成，HTTP 只读取统一 config；页面不得写接口地址。
- 开发运行使用 dev + Debug + Metro，test/prod 先生成配置再打 Release，内嵌 JS 不依赖 Metro。不要把 __DEV__ 当接口环境选择器。
- Windows 使用 powershell；macOS/Linux 将 Android npm 脚本的 powershell 改为 pwsh 并安装 PowerShell，或生成等效原生 shell 脚本；不可交付不能在目标主机执行的命令。
- `.gitignore` 加 env.generated.ts、artifacts/、build/、*.keystore、*.jks、证书与签名本地配置。公开示例 .env 可提交，实际敏感 .env 不得提交。不同环境禁止在同一工作目录并发构建。

## Android 原生集成（不可省略）
在 android/app/build.gradle 合并以下逻辑，适配现有 Groovy/Kotlin DSL，不能仅复制脚本：
```groovy
def appEnvironment = providers.gradleProperty("appEnvironment").getOrElse("dev")
if (!(appEnvironment in ["dev", "test", "prod"])) throw new GradleException("未知环境")
android {
  defaultConfig {
    if (appEnvironment == "test") applicationIdSuffix ".test"
  }
  signingConfigs {
    release {
      def keyPath = System.getenv("RN_STORE_FILE")
      if (keyPath) storeFile file(keyPath)
      storePassword System.getenv("RN_STORE_PASSWORD")
      keyAlias System.getenv("RN_KEY_ALIAS")
      keyPassword System.getenv("RN_KEY_PASSWORD")
    }
  }
  buildTypes {
    release { signingConfig signingConfigs.release }
  }
}
```
- 移除官方模板 release 复用 debug 签名的设置。release 任务必须验证环境为 test/prod、四个签名变量齐全、文件存在，失败立即终止；不能仅校验脚本，因为用户可能直接调用 Gradle。
- Test 使用独立包名和标签；prod 保持正式包名、持续使用同一签名。签名文件使用绝对路径，密码由构建脚本隐藏输入或 CI 注入；不落库、不打印。
- Debug 的开发 HTTP 只限开发配置，不为 prod 全局开启 cleartext。按目标 SDK 生成开发网络安全配置；真机 localhost 需 adb reverse tcp:8000 tcp:8000 或局域网地址。

合并以下任务以拦截直接调用 Gradle 的无效 Release 构建：
```groovy
def verifyRelease = tasks.register("verifyReleaseEnvironment") {
  doLast {
    if (!(appEnvironment in ["test", "prod"])) throw new GradleException("Release 必须指定 test/prod")
    ["RN_STORE_FILE", "RN_STORE_PASSWORD", "RN_KEY_ALIAS", "RN_KEY_PASSWORD"].each {
      if (!System.getenv(it)) throw new GradleException("缺少签名变量 " + it)
    }
    if (!file(System.getenv("RN_STORE_FILE")).isFile()) throw new GradleException("签名文件不存在")
  }
}
tasks.configureEach {
  if (name == "preReleaseBuild") dependsOn(verifyRelease)
}
```

## iOS 原生集成
创建 Test/Prod 共享 Scheme、独立 Bundle ID/显示名及对应签名设置；提供不含凭据的 ExportOptions.plist 模板。配置 IOS_WORKSPACE、IOS_SCHEME、IOS_EXPORT_OPTIONS，分别指向所选环境；脚本采用这些真实配置，不猜团队 ID。本地 Archive 仅 macOS；TestFlight/Ad Hoc/App Store 分发方式需账号和相应证书描述文件。Simulator 构建不是可发给真机的 IPA。

## 测试与证据
- 登录、列表、详情、设置均生成可见页面，中文业务文案，不用 emoji 作图标；统一 theme、安全区、键盘和横竖屏，复用导航、请求与状态技能。
- 当前 skeleton.md 是设计参考，引用 AppToast、ErrorBoundary、表单组件、主题 token、Store 都必须生成对应实现与导出；不引用不存在的组件，不把 mock 登录当后端鉴权。默认离线数据不包含真实账户。
- lint、tsc、Jest 必须安装匹配依赖和配置后提供命令；覆盖输入校验、HTTP 失败和重试。testID 对应 Maestro flow，home-screen 必须存在；APP_ID 指向测试包，先安装测试包后执行 E2E。
- 提供 AVD 创建/启动、adb devices、USB授权、指定设备、8081反向转发；运行 CLI --help 确定该版本的设备选择参数，不硬套旧 --deviceId。
- 提供 adb 截图、screenrecord、logcat 与 Maestro JUnit/截图收集脚本。日志需脱敏；iOS 单独提供 Simulator 截图与日志方法。
- 逐项验证：脚本检查、依赖/类型检查、Debug 装机、test Release 断开 Metro 启动和接口、prod 包名与签名校验、iOS Archive。未执行如实记入生成项目的验证记录，不写成成功。

## Expo 分支
不能把本地原生脚本直接塞进未生成 android/ios 的 Expo 工程。使用 Expo 安装器与开发构建；生成 eas.json 的 test（internal）和 prod（store）profile，环境采用明确映射的 EXPO_PUBLIC_API_BASE_URL，EAS env/profile 与应用配置一致。用 eas build --platform android/ios --profile test/prod；自定义原生模块需要开发构建，不保证 Expo Go 支持。遇原生需求先评估 prebuild，避免破坏现有原生改动。

官方依据：React Native 环境文档 https://reactnative.dev/docs/set-up-your-environment ；Expo Build https://docs.expo.dev/build/introduction/ 。

## 认证存储
参考中的模拟登录只用于显式离线数据模式，真实模式必须调用后端。生产 token 使用平台 Keychain/Keystore 安全存储适配器；AsyncStorage 仅存非敏感偏好与展示信息，不持久化密码。退出时清理 token 和相关缓存。
