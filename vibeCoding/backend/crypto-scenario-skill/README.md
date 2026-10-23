# crypto-scenario-skill

按**场景**给加密结论：推荐什么、为什么、绝对不能用什么。覆盖密码存储、微信支付验签、支付宝签名、开放接口签名、Webhook 回调、JWT、敏感字段加密、文件校验、Git 签名、传输加密 10 个场景。

## 适合场景

- "用户密码该用什么存？"
- "微信支付回调怎么验签？"
- "支付宝的签名怎么算？"
- "对接第三方接口签名用 HMAC 还是 RSA？"
- "JWT 用 HS256 还是 RS256？"
- "手机号加密存库怎么做？"
- "文件完整性校验用什么摘要？"
- "让 AI 写加密代码，怎么约束它别写错？"

**不适合**：需要自己设计新算法、密码学前沿研究、密钥管理基础设施（KMS）选型。

## 触发关键词

`加密选型`、`密码加密`、`密码存储`、`密码哈希`、`签名`、`验签`、`微信支付`、`支付宝`、`HMAC`、`JWT 算法`、`敏感字段加密`、`文件校验`、`传输加密`

## 场景决策速览

| 场景 | 推荐 | 绝对禁止 |
|------|------|----------|
| 用户密码存储 | bcrypt(cost 12) / Argon2id | MD5 / SHA1 / SHA256 裸哈希、可逆加密 |
| 微信支付回调 | RSA-SHA256 验签 + AEAD_AES_256_GCM | 不验签、敏感字段不加密 |
| 支付宝开放平台 | RSA2（SHA256WithRSA） | RSA(SHA1)、MD5 |
| 第三方开放接口 | HmacSHA256 | 密钥硬编码 |
| 自建 Webhook 回调 | Ed25519 或 HmacSHA256 | 先处理业务后验签 |
| JWT 登录态 | HS256（≥256 位）；多服务用 RS256/EdDSA | `alg: none`、短密钥 |
| 数据库敏感字段 | AES-256-GCM + AAD 绑字段 | ECB、密钥与库同放 |
| 文件完整性 | SHA-256 | MD5、SHA1 |
| 传输 | TLS 1.3 | TLS 1.0/1.1 |

## 核心红线

1. 不自研算法，全部用成熟库
2. 密钥永不入库、不进仓库，启动时校验长度
3. 密码只存哈希，永不存可逆密文
4. 回调先验签、后处理业务
5. 签名比较用常量时间函数
6. 日志必须脱敏

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/code-snippets.md` | Java / Python / Go / Node 四语言代码范式 |
| `references/password-storage.md` | bcrypt 盐机制、cost 选型、Argon2id 参数、迁移 |
| `references/payment-signature.md` | 微信支付 APIv3 与支付宝 RSA2 报文格式 |
| `references/jwt-and-token.md` | HS256/RS256/EdDSA 选型、双令牌、密钥轮换 |
| `references/ai-guardrails.md` | 给 AI 的约束块、错误输出对照表、审查清单 |
| `references/scenario-checklist.md` | 上线前逐项自查清单 |

## 调用样例

```
你：用户密码存库该用什么？

AI：按 crypto-scenario-skill 决策表：用 bcrypt（cost 12），不是 MD5/SHA256 裸哈希。
   原因：bcrypt 故意算得慢，拖库后爆破成本极高；服务器自己都还原不出来。
   库里的串自带盐，校验时从串里解析盐重算比对，无需额外存盐字段。
   详见 crypto-scenario-skill/references/password-storage.md。
```

## 与其他 skill 的关系

独立可用。`backend-convention-skill` 定义 JWT 鉴权信封，本 skill 定义**算法选型与实现范式**，两者不冲突：信封看前者，签名算法看后者。

## 不做

- 不做业务需求判断
- 不提供自研算法
- 不锁定第三方库版本
