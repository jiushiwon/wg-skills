# 安全合规检查清单

> 本清单用于 `uniapp-code-audit-skill` 安全合规审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. 敏感信息硬编码

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| API Key 硬编码 | P0 | 密钥写入源码，存在泄露与被滥用风险 | 源代码中出现 `apiKey`、`API_KEY`、`secretKey` 等敏感字段赋值 | `uniapp-components-skill` 安全规范 | `grep -rnE '(apiKey\|apikey\|API_KEY\|secret\|token\|password\|passwd\|pwd\|appSecret\|APP_SECRET)' src/` |
| Token 硬编码 | P0 | 长期有效凭证写入源码 | 源代码中出现固定 Token 字符串 | `uniapp-components-skill` A02 / 通用安全规范 | 同上 |
| Secret/密码 硬编码 | P0 | 账号密码等敏感信息写入源码 | 源代码中出现密码类字符串赋值 | 通用安全规范 | 同上 |
| AppSecret 硬编码 | P0 | 小程序/第三方平台密钥泄露 | 源代码中出现 `AppSecret`、`appSecret` | `uniapp-components-skill` 安全规范 | 同上 |
| 私钥/证书硬编码 | P0 | 非对称密钥或证书文件内容写入源码 | 源代码中出现 RSA 私钥、证书头尾标记 | 通用安全规范 | `grep -rnE 'BEGIN.*PRIVATE KEY\|BEGIN CERTIFICATE' src/` |
| Base64 编码敏感串 | P1 | 敏感信息经 base64 编码后仍可能泄露 | 源代码中出现长 base64 串且变量名暗示密钥 | 通用安全规范 | `grep -rnE 'base64.*[A-Za-z0-9+/=]{20,}' src/` |
| `.env` 含真实密钥且未忽略 | P1 | 环境变量文件误提交仓库 | 项目根目录存在 `.env` 且未加入 `.gitignore` | `uniapp-app-generate-skill` 2.6 | `grep -E '^\.env(\.|$)' .gitignore` |

## 2. 网络与域名

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| HTTP 明文请求 | P0 | 传输过程可被窃听或篡改 | 代码中使用 `http://`（localhost/127.0.0.1 除外） | `uniapp-standard-skill` R03 | `grep -rnE 'http://(?!localhost\|127\.0\.0\.1)' src/` |
| 未配置 request 合法域名 | P1 | 小程序请求被拦截或审核被拒 | `manifest.json` 未配置 `request合法域名` | 微信小程序官方要求 | 检查 `src/manifest.json` |
| 未验证 SSL 证书 | P1 | 存在中间人攻击风险 | 代码中禁用证书校验或信任所有证书 | 通用安全规范 | `grep -rnE 'rejectUnauthorized\|verify.*false' src/` |
| 未配置 CORS | P2 | H5 端请求被浏览器阻止 | H5 域名与接口域名跨域且无代理配置 | `uniapp-app-generate-skill` 3.8 | 检查 `vite.config.ts` / `.env` |

## 3. 数据存储

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 敏感数据明文存 Storage | P0 | 用户敏感信息可直接被读取 | 代码中将身份证、银行卡、密码等明文写入 `uni.setStorageSync` | `uniapp-components-skill` A03 | `grep -rnE 'setStorageSync.*(password\|idCard\|bankCard\|phone)' src/`；同时人工复核所有 `setStorageSync` 调用点，排查对象形式存储 |
| 使用 `localStorage`/`sessionStorage` | P1 | 跨端不一致，且小程序端不可用 | 代码中直接调用 `localStorage` 或 `sessionStorage` | `uniapp-app-generate-skill` 跨平台规范 | `grep -rnE 'localStorage\|sessionStorage' src/` |
| 缓存未清理 | P2 | 用户退出后残留信息 | 登出逻辑未清理相关 Storage Key | `uniapp-components-skill` A05 | 检查 `services/auth.service.ts` 或相关登出逻辑 |

## 4. 用户隐私与合规

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未配置隐私保护指引 | P1 | 小程序审核可能被拒 | `manifest.json` 未声明 `usePrivacyCheck` 或相关隐私配置 | 微信小程序官方要求 | 检查 `src/manifest.json` |
| 收集用户信息未告知 | P1 | 违反隐私合规要求 | 页面直接调用获取手机号、位置、相机等 API 前未展示同意弹窗 | 微信小程序隐私指引 | 检查相关页面逻辑 |
| 位置/相机权限未声明 | P1 | 审核被拒或运行时异常 | `manifest.json` 未声明对应 permission | 微信小程序官方要求 | 检查 `src/manifest.json` |
| 存在诱导分享文案 | P1 | 可能触发平台处罚 | 代码/文案中出现“分享得奖励”、“不转不是”等诱导性表述 | 微信小程序运营规范 | `grep -rnE '分享.*奖励\|转发.*得' src/` |
| 存在虚拟支付绕过 | P0 | 违反小程序支付规范 | 小程序内出现非微信支付渠道的虚拟支付引导 | 微信小程序运营规范 | 检查支付相关页面与文案 |

## 5. 调试与日志

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| `console.log/debug/info` 残留 | P2 | 生产环境可能泄露内部信息 | 源代码中存在 `console.log`/`console.debug`/`console.info` | `uniapp-standard-skill` R11 | `grep -rnE 'console\.(log\|debug\|info)' src/` |
| `debugger` 残留 | P2 | 可能被利用调试或暴露逻辑 | 源代码中存在 `debugger` 语句 | 通用代码规范 | `grep -rnE '\bdebugger\b' src/` |
| 日志未脱敏 | P1 | 错误上报中泄露 Token/手机号 | 日志/上报代码直接输出 Token、完整手机号等 | `uniapp-components-skill` A06 | 检查日志封装与上报逻辑 |

## 6. 业务安全

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 外链跳转无安全提示 | P2 | 用户可能被引导至钓鱼页面 | 代码中直接 `navigateTo` 外部链接且无提示 | 通用安全规范 | 检查 `web-view` / `navigateTo` 外部 URL 逻辑 |
| 敏感操作缺少二次确认 | P2 | 误触导致不可逆操作 | 删除、支付、退出登录等操作无确认弹窗 | `uniapp-components-skill` 9.4 | 检查相关页面交互 |

## 7. 依赖与供应链

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 已知漏洞依赖 | P1 | 使用存在 CVE 的 npm 包 | `package.json` 中依赖版本命中已知漏洞 | 通用供应链安全 | `npm audit`（如可用） |
| 过期/未维护依赖 | P2 | 长期未更新，存在兼容与安全风险 | 核心依赖版本过旧 | 通用供应链安全 | 检查 `package.json` 中关键依赖版本 |
| 未使用依赖 | P3 | 增加包体积与维护成本 | `package.json` 中存在未被源码引用的依赖 | 通用工程规范 | `npm ls` / 检查源码引用 |

## 严重程度定义

| 等级 | 标准 |
|------|------|
| P0 / Critical | 直接导致安全漏洞、违规封号或审核被拒 |
| P1 / High | 可能导致安全问题或影响上线合规 |
| P2 / Medium | 代码质量风险或信息泄露隐患 |
| P3 / Low | 优化建议 |
