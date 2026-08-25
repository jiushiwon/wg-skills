# App 端专项检查清单（Android / iOS）

> 本清单用于 `uniapp-code-audit-skill` App 端（Android / iOS）专项审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 使用前提：目标平台包含 **App** 时执行本清单；仅审计微信小程序/H5 时可跳过。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. App 端原生能力（plus / uni.xxx 差异）

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 直接调用 `plus.*` 原生 API | P1 | 仅 App 端可用，H5/小程序端运行报错 | 业务代码中出现 `plus.` 调用且未用条件编译隔离 | uni-app 官方文档（plus API 仅 App 端） | `grep -rnE 'plus\.' src/` |
| `plus.*` 未在 App 端平台守卫内 | P1 | 非 App 平台调用 `plus` 报错 | `plus.` 调用未包裹 `#ifdef APP-PLUS` 或运行时平台判断 | uni-app 条件编译规范 | 检查 `plus.` 调用上下文 |
| 调用 App 端独有 `uni` API | P1 | H5/小程序无对应实现 | 使用 `uni.login`（App 端 univerify）、`uni.getPushClientId`、`uni.createNativeView` 等 App 独有能力 | uni-app 官方 API 兼容表 | 人工核对 API 兼容性 |
| 原生插件使用无文档说明 | P2 | 新增原生依赖难维护 | 引入原生插件（uni_modules 中 uts/原生插件）但 README 无集成说明 | 工程规范 | 检查 `uni_modules/` 插件说明 |

## 2. Android / iOS 平台差异

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未处理 Android 返回键/物理返回 | P1 | 用户按返回键行为异常（直接退出/错误跳转） | App 端页面未监听 `onBackPress` 或在返回键场景缺失处理 | uni-app `onBackPress` 文档 | 检查 `.vue` 文件中 `onBackPress` |
| 未区分 Android/iOS 平台差异逻辑 | P1 | 两端行为不一致 | 需区分平台（如键盘、文件选择、安全区）却未用条件编译或 `uni.getSystemInfoSync().platform` 判断 | uni-app 条件编译规范 | `grep -rnE 'getSystemInfoSync|#ifdef APP' src/` |
| Android 存储权限/分区存储适配缺失 | P2 | Android 10+ 读写外部存储失败 | 使用外部存储路径未走 `plus.io` 应用私有目录或沙箱 | Android 分区存储要求 | 检查文件读写相关调用 |
| iOS 权限描述缺失 | P0 | iOS 审核被拒 | `manifest.json` 使用相机/相册/位置等但 `app-plus.distribute.ios` 未配置对应 `NSCameraUsageDescription` 等 | iOS 隐私权限要求 | 检查 `src/manifest.json` 的 `app-plus` 段 |
| iOS 本地网络权限缺失 | P1 | iOS 14+ 局域网请求失败 | 访问局域网/同网段请求未配置 `NSLocalNetworkUsageDescription` | iOS 14 本地网络权限 | 检查 `src/manifest.json` 与请求地址 |
| Android 混淆/加固缺失 | P2 | 原生层反编译风险 | App 未配置签名混淆（如 jadx 可还原业务逻辑） | Android 安全规范 | 检查打包配置与加固文档 |
| 未处理状态栏/刘海屏差异 | P2 | 两端状态栏高度/沉浸式表现不一致 | App 端自定义导航栏未适配状态栏高度 | uni-app 安全区/状态栏规范 | 检查自定义导航栏组件 |
| Android 与 iOS 字体渲染差异未处理 | P3 | 两端字号/行高视觉偏差 | 关键布局对两端渲染差异无补偿处理 | 通用 App 适配经验 | 人工比对两端截图 |

## 3. App 端渲染与性能

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 复杂页面用 web-view 承载 | P1 | App 端性能与体验差 | 核心页面用 `<web-view>` 而非原生/vue 页面实现 | uni-app 性能规范 | `grep -rnE '<web-view' src/` |
| nvue 与 vue 页面混用无规范 | P2 | 渲染方式不一致导致问题 | 项目混用 nvue 与 vue 页面但无约定 | uni-app nvue 文档 | `find src -name '*.nvue'` |
| 长列表未用 nvue/virtualList | P2 | App 端长列表卡顿 | App 端长列表使用 vue 页面渲染大量节点 | uni-app 长列表性能 | 检查 App 端列表页面 |
| 图片未做 App 端尺寸/缓存适配 | P2 | App 端大图加载慢 | App 端使用原图未压缩或未做 CDN 缩放 | 通用性能规范 | 检查 App 端图片引用 |
| App 冷启动/首屏未优化 | P2 | 首屏白屏时间长 | 未做启动图/分包/首屏资源优化 | 通用 App 性能规范 | 检查 `manifest.json` 启动配置 |

## 4. App 打包产物与体积

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| App 包体积过大 | P1 | 安装包臃肿、下载成本高 | apk/ipa 产物体积异常（如 > 150MB） | 通用 App 体积规范 | 检查 `dist/` 产物大小 |
| 未开启资源压缩/分包 | P2 | 包体积可优化 | App 打包未启用资源压缩、未做按需打包 | uni-app 打包优化 | 检查 `manifest.json` 打包配置 |
| 冗余原生资源打包 | P2 | 无用原生库/资源被打入包 | `nativeplugins`/`uni_modules` 含未被使用的原生资源 | 通用工程规范 | 检查原生插件目录 |

## 5. App 更新与推送

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未实现 App 更新检查 | P2 | 用户无法及时升级 | App 端未实现版本检查/热更新逻辑 | uni-app 更新规范 | 检查 `App.vue` 或启动逻辑 |
| 强制更新未做 | P1 | 旧版本强制需求无法满足 | 无强制更新版本控制 | 通用 App 更新规范 | 检查更新逻辑 |
| 推送未接入或配置不完整 | P2 | App 无法收到推送 | 需要推送但未接入 `uni-push` 或厂商推送配置不全 | uni-push 文档 | 检查 `manifest.json` 与 `uni_modules` |

## 6. App 端安全

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 证书/签名配置泄露 | P0 | App 签名私钥泄露风险 | 打包配置/文档中泄露 keystore 密码或签名文件 | 通用安全规范 | `grep -rnE 'keystore|signingConfig|storePassword' src/ 配置目录` |
| 明文协议请求（App 端） | P0 | 传输可被窃听 | App 端请求使用 `http://` 明文 | 通用安全规范 | `grep -rnE 'http://(?!localhost)' src/` |
| WebView 任意 URL 加载 | P1 | 可被注入加载恶意页面 | `<web-view>` 加载不可控 URL 或用户输入拼入 URL | 通用安全规范 | 检查 `web-view` 的 src 来源 |

## App 端专项评分参考

| 级别 | 描述 |
|------|------|
| A | Android/iOS 适配完整，无 P0/P1 问题 |
| B | 少量 P2 平台差异问题，不影响发布 |
| C | 存在 P1 平台差异或性能问题，需要治理 |
| D | 存在 P0 问题（权限缺失/证书泄露/明文请求），无法过审或存在严重风险 |
