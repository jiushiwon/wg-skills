# 小程序专项检查清单

> 本清单用于 `uniapp-code-audit-skill` 微信小程序专项审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. setData 使用

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 单次 setData 数据量 > 100KB | P1 | 导致渲染卡顿或闪退 | 代码中一次性 setData 大量数据 | `uniapp-standard-skill` 4.2 | 检查页面 setData 调用 |
| setData 调用频率 > 20 次/秒 | P1 | 渲染线程压力过大 | 高频事件回调中频繁 setData | `uniapp-standard-skill` 4.2 | 检查滚动/动画回调 |
| 未只传变化字段 | P2 | 不必要的数据传输 | setData 传入整个对象而非变化字段 | `uniapp-standard-skill` 4.2 | 检查 setData 调用 |
| `data` 直接存放接口原始数据 | P1 | 违反 R02 红线，增加 setData 负担 | 页面 data 中存储未转换的接口响应 | `uniapp-standard-skill` R02 | 检查页面 `ref`/`data` 定义 |

## 2. 页面栈管理

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 滥用 `navigateTo` | P1 | 页面栈深度 > 10 导致跳转失败 | 大量连续跳转未使用 `redirectTo`/`reLaunch` | `uniapp-standard-skill` 4.4 / 微信小程序限制 | 检查 `uni.navigateTo` 使用场景 |
| 返回逻辑不当 | P2 | 用户无法回到预期页面 | 登录/提交后未合理使用 `redirectTo` | `uniapp-components-skill` 登录回跳 | 检查登录与提交后跳转逻辑 |

## 3. WXS / 渲染脚本

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| WXS 引入复杂逻辑 | P2 | 难以调试与维护 | `.wxs` 文件中包含大量业务逻辑 | `uniapp-standard-skill` 4.2 | 检查 `src/**/*.wxs` |
| WXS 过度实时渲染 | P2 | 增加渲染负担 | 模板中频繁调用 wxs 函数处理数据 | `uniapp-standard-skill` 4.2 | 检查 `.vue` 模板中 wxs 引用 |

## 4. 分包与主包体积

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 主包 > 2MB | P0 | 审核被拒 | 编译后主包体积超过 2MB | `uniapp-standard-skill` 4.1 / 微信小程序限制 | `du -sh dist/dev/mp-weixin` |
| 总包 > 20MB | P0 | 审核被拒 | 编译后总包体积超过 20MB | 微信小程序限制 | `du -sh dist/build/mp-weixin` |
| 页面较多但未分包 | P2 | 主包体积易超限 | `pages.json` 未配置 `subPackages` | `uniapp-app-generate-skill/references/mini-program-checklist.md` | 检查 `src/pages.json` |
| 分包大小超过 2MB | P1 | 分包无法加载 | 单个分包体积超过 2MB | 微信小程序限制 | 编译后检查各分包大小 |

## 5. 隐私与合规

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未配置隐私保护指引 | P1 | 审核被拒 | `manifest.json` 未声明隐私校验 | 微信小程序官方要求 | 检查 `src/manifest.json` |
| 未声明权限 | P1 | 审核被拒或运行时异常 | 使用位置/相机/相册等能力但未声明 | 微信小程序官方要求 | 检查 `src/manifest.json` |
| 存在诱导分享 | P1 | 可能触发平台处罚 | 文案/逻辑中存在诱导分享 | 微信小程序运营规范 | `grep -rnE '分享.*奖励\|转发.*得' src/` |
| 存在 web-view 绕过审核 | P0 | 违规 | 通过 web-view 加载未审核内容或绕过监管 | 微信小程序运营规范 | 检查 `web-view` 使用场景 |

## 6. 合法域名与网络

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| request 域名未配置 | P1 | 请求被拦截 | 小程序后台未配置 request 合法域名 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 人工检查小程序后台 |
| uploadFile 域名未配置 | P1 | 上传失败 | 小程序后台未配置 uploadFile 合法域名 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 人工检查小程序后台 |
| downloadFile 域名未配置 | P1 | 下载失败 | 小程序后台未配置 downloadFile 合法域名 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 人工检查小程序后台 |
| web-view 域名未配置 | P1 | web-view 被拦截 | 小程序后台未配置 web-view 合法域名 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 人工检查小程序后台 |

## 7. 分享与更新

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未实现 `onShareAppMessage` | P3 | 无法分享 | 需要分享的页面未实现分享逻辑 | `uniapp-app-generate-skill/references/wechat-common-patterns.md` | 检查 `.vue` 文件中 `onShareAppMessage` |
| 未实现版本更新提示 | P2 | 用户无法及时更新到新版本 | `App.vue` 未调用 `uni.getUpdateManager()` | `uniapp-app-generate-skill/references/mini-program-checklist.md` | 检查 `src/App.vue` |

## 8. 生命周期与事件

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 页面生命周期使用错误 | P2 | 逻辑在错误时机执行 | 使用 Vue 生命周期替代小程序页面生命周期 | 微信小程序官方文档 | 检查 `.vue` 文件生命周期 |
| 事件未解绑 | P1 | 内存泄漏 | `uni.$on`/`setInterval` 未在 `onUnmounted` 清理 | `uniapp-standard-skill` 4.4 | `grep -rnE 'uni\.\$on\|setInterval' src/` |

## 9. 表单与输入

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未处理键盘弹起 | P2 | 输入框被键盘遮挡 | 表单页面未处理 `focus` 与键盘高度 | 微信小程序适配规范 | 检查表单页面 |
| 未使用 uni-app 表单组件 | P2 | 兼容性差 | 使用 H5 原生表单标签 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | `grep -rnE '<input\|<textarea\|<select' src/` |

## 10. 原生能力

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未处理授权拒绝 | P2 | 用户拒绝后无法再次引导 | 调用相机/位置等未处理授权失败 | 微信小程序官方文档 | 检查权限相关逻辑 |
| 未处理扫码/支付回调 | P1 | 业务状态丢失 | 调用 `uni.scanCode`/`uni.requestPayment` 后未处理失败/取消 | 微信小程序官方文档 | 检查相关页面 |

## 小程序专项评分参考

| 级别 | 描述 |
|------|------|
| A | 完全符合小程序规范，无 P0/P1 问题 |
| B | 少量 P2 问题，不影响上线 |
| C | 存在 P1 问题，需要治理 |
| D | 存在 P0 问题，无法上线 |
