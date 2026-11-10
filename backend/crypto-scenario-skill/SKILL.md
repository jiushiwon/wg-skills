---
name: crypto-scenario-skill
description: >-
  Use when picking a cryptographic algorithm or implementing hashing / encryption / signature for a concrete scenario - user password storage, WeChat Pay & Alipay callback verification, third-party open API signing, JWT login tokens, database sensitive-field encryption, file integrity checks, Git commit signing, TLS transport. Provides a scenario-to-algorithm decision table, code templates in Java / Python / Go / Node, and AI guardrail rules so generated code never uses MD5/SHA1 for passwords or hardcoded keys. Triggers: "加密选型", "密码加密", "密码存储", "密码哈希", "签名", "验签", "微信支付", "支付宝", "HMAC", "JWT 算法", "敏感字段加密", "文件校验", "传输加密".
---

# Crypto Scenario Skill

按**场景**而不是按算法名给结论。每个场景回答三件事：**推荐什么、为什么、绝对不能用什么**。

## 使用方式

1. 先在下表定位场景 → 拿到推荐算法与禁止项。
2. 按 `references/code-snippets.md` 取对应语言的代码范式（Java / Python / Go / Node）。
3. 细节（微信支付报文格式、bcrypt 盐机制、JWT 选型）按需读 `references/` 下的专题文件。
4. 让 AI 写这类代码时，把 `references/ai-guardrails.md` 的约束块整段贴进 prompt。

## 场景决策表

| 场景 | 推荐 | 一句话理由 | 绝对禁止 |
|------|------|------------|----------|
| 用户密码存储 | Argon2id 优先，scrypt 备选，bcrypt 用于存量系统，PBKDF2-HMAC-SHA-256 用于需要 FIPS 合规的场景 | 按环境压测成本参数，使用成熟库与独立随机盐 | MD5 / SHA1 / SHA256 裸哈希、可逆加密、自研 |
| 微信支付回调验签 | RSA-SHA256（平台证书验签）+ 敏感字段 AEAD_AES_256_GCM | 官方强制算法，私钥不出商户 | 回调不验签、敏感字段不加密 |
| 支付宝开放平台签名 | RSA2（SHA256WithRSA） | 支付宝 2015 年定下的标准 | RSA（SHA1）老算法、MD5 |
| 对接第三方开放接口 | HmacSHA256（双方共享密钥） | 双方持有同一密钥即可验 | 把密钥写死在代码里 |
| Webhook 回调验签（自建） | Ed25519（非对称）或 HmacSHA256 | 公钥可分发，私钥不出服务器 | 回调不验签、先处理业务后验签 |
| JWT 登录态签名 | 单服务 HS256（密钥 ≥256 位）；多服务互验 RS256 / EdDSA | 自签自发够用就别上非对称 | `alg: none`、短密钥、密钥进仓库 |
| 数据库敏感字段加密 | AES-256-GCM（应用层）+ 附加认证数据绑字段 | 拖库只见乱码，且防密文搬字段 | ECB 模式、密钥与库同库存放 |
| 文件完整性校验 | SHA-256 | 快、够用、标准化 | MD5、SHA1（已可构造碰撞） |
| Git 提交签名 | SSH（Ed25519，默认已启用）或 GPG | 证明"这笔提交是我发的" | 无 |
| 传输 | TLS 1.3 | 全站强制 | TLS 1.0/1.1、自签名证书上生产 |

## 连接凭证需要取回时

SSH、数据库密码和第三方 API Key 需要交给目标服务使用。配置仅存凭证引用，秘密放 OS 凭证库或服务端 Secret Manager。确需保存本地密文时使用平台安全存储，服务端自行加密时使用 AEAD 并分离密钥。限制读取权限和有效期，避免把明文放进日志、导出文件或通用 IPC 响应。

SuperShell 实例：Electron 主进程优先用 keytar。keytar 模块加载失败时，现有实现使用 safeStorage 加密本地文件。核查时应确认实际存储后端，Linux 的 basic_text 不应作为安全回退。安全后端不可用时拒绝持久化，或让用户本次输入。优先由主进程取用凭证完成连接，检查渲染进程能否通过 IPC 取回明文。

参考：Electron safeStorage https://www.electronjs.org/docs/latest/api/safe-storage
参考：OWASP 密码存储 https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

## 强制红线

1. **不自己实现算法** —— 全部用成熟库（Java Bouncy Castle / Spring Security，Python `cryptography` + `passlib`，Go `golang.org/x/crypto`，Node `node:crypto` + `bcrypt`）。
2. **密钥永不入库、不进仓库** —— 走环境变量或密钥管理服务，`.env` 必须 gitignore；启动时校验密钥长度，不达标直接失败退出。
3. **用户登录密码只存密码哈希** —— 使用库验证输入，忘记密码走重置。历史哈希在验证成功后按策略升级，写回时防止覆盖并发改密。
4. **哈希定长到的是"文件/报文没被改"，密码要的是"慢"** —— 两类哈希别混用。
5. **回调先验签、后处理业务** —— 验签通过前不落库、不发货、不调下游。
6. **签名比较用常量时间函数** —— `hmac.compare_digest` / `crypto.timingSafeEqual`，不要用 `==`。
7. **日志必须脱敏** —— 密码、密钥、完整身份证/银行卡号一律 mask。

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/code-snippets.md` | 四语言代码范式：密码哈希 / 字段加密 / 签名 / 验签 / 摘要 |
| `references/password-storage.md` | bcrypt 盐机制、cost 选型、Argon2id 参数、迁移路径 |
| `references/payment-signature.md` | 微信支付 APIv3 与支付宝 RSA2 的报文格式与验签串构造 |
| `references/jwt-and-token.md` | HS256 / RS256 / EdDSA 选型、密钥轮换、刷新令牌 |
| `references/ai-guardrails.md` | 给 AI 的约束块、审查清单、常见错误输出 |
| `references/scenario-checklist.md` | 上线前逐项自查清单 |

## 不做

- 不替用户决定业务需求（"这个字段要不要脱敏"是业务问题）。
- 不提供自研算法、魔改算法、"轻量加密"实现。
- 不锁定第三方库版本（由使用者按项目 `versions.md` 现场查询）。

## 触发词

加密选型、密码加密、密码存储、密码哈希、签名、验签、微信支付、支付宝、HMAC、JWT 算法、敏感字段加密、文件校验、传输加密、crypto
