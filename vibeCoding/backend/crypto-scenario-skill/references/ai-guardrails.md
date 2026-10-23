# 给 AI 的约束写法

AI 写密码学代码最常见的三类错误：**用错算法**（MD5/SHA1）、**密钥硬编码**、**自己造轮子**（手写 AES / 手写 JWT 签名）。这些都能靠 prompt 约束提前掐掉。

---

## 一、可直接粘贴的约束块

放进项目 `CLAUDE.md` / `AGENTS.md` 的「强制约束」章节，或在生成代码的 prompt 里前置：

```markdown
## 加密相关强制约束

1. 用户密码存储一律用 bcrypt（cost 12）或 Argon2id，禁止 MD5 / SHA1 / SHA256 裸哈希，禁止可逆加密存密码。
2. 禁止自行实现任何加密算法；只用成熟库（Java Bouncy Castle / Spring Security，Python cryptography + passlib，Go golang.org/x/crypto，Node node:crypto + bcrypt）。
3. 密钥、密码、salt、IV 一律从环境变量读取，禁止硬编码字面量；`.env` 必须进 `.gitignore`；启动时校验密钥长度，不达标直接启动失败。
4. 敏感字段加密用 AES-256-GCM，附加认证数据（AAD）绑定字段名，禁止 ECB 模式。
5. 支付/开放接口回调：第一行必须验签，验签通过前不落库、不发货、不调下游；验签失败返回统一错误码。
6. 签名比较一律用常量时间函数（hmac.compare_digest / crypto.timingSafeEqual / MessageDigest.isEqual），禁止使用 ==。
7. 日志输出密码、密钥、完整身份证号、银行卡号时必须脱敏（mask），禁止打印完整值。
8. JWT 必须固定期望算法验签，禁止根据 header 中的 alg 字段动态选择验签方式；HS256 密钥不少于 32 字节。
9. 随机数使用操作系统熵源（secrets / crypto.randomBytes / crypto/rand），禁止使用 random 模块或 Math.random。
```

## 二、提问模板

### 选型类

```
我要做【场景描述】。请先按 crypto-scenario-skill 的场景决策表给出推荐算法和理由，
再给出代码。禁止自研算法，禁止硬编码密钥，密钥从环境变量读。
```

### 审查类

```
用 crypto-scenario-skill 的场景决策表审查下面这段代码，逐条指出：
用错算法 / 密钥硬编码 / 自研算法 / 缺少验签 / 日志未脱敏 / 用了非恒定时间比较 的地方，
并给出修正后的完整代码。
```

## 三、常见错误输出与纠正

| AI 的输出 | 问题 | 纠正 |
|---|---|---|
| `hashlib.md5(password).hexdigest()` | MD5 已破 | bcrypt / Argon2id |
| `hashlib.sha256(password).hexdigest()` | 太快，GPU 可爆破 | bcrypt（慢）或 Argon2id（吃内存） |
| `secret = "your-secret-key"` | 硬编码 | `os.environ["JWT_SECRET"]` + 启动长度校验 |
| 手写 AES 分组加密 | 自研算法，必有漏洞 | `cryptography` 的 AESGCM / Spring 的 `GCMParameterSpec` |
| `if sig == expected:` | 时序攻击 | `hmac.compare_digest` |
| 回调里先 `save()` 再验签 | 可被伪造写入 | 验签前置 |
| `jwt.decode(token, options={"verify_signature": False})` | 等于不鉴权 | 固定算法验签并校验 exp |
| `random.randint(0, 255)` 当 nonce | 非密码学随机 | `os.urandom(12)` / `secrets` |
| 密码字段直接 `logger.info(password)` | 日志泄露 | mask 后输出 |

## 四、审查清单

生成或 review 加密相关代码时逐条过：

- [ ] 用的是决策表里的算法，没有自作主张换成别的
- [ ] 没有手写的加密/签名实现
- [ ] 所有密钥来自环境变量，没有字面量
- [ ] 密钥长度校验存在，不达标启动失败
- [ ] 密码用 bcrypt/Argon2id，cost/参数合理
- [ ] 敏感字段用 GCM 且带 AAD，没有 ECB
- [ ] 回调验签在业务动作之前
- [ ] 签名比较用常量时间函数
- [ ] 随机值来自安全随机源
- [ ] 日志已脱敏
- [ ] 依赖在 `requirements.txt` / `pom.xml` / `go.mod` 里已声明

## 五、不要过度约束的地方

- 不要要求 AI "加 AES-256 加密"这种泛泛指令却不给场景——先问清场景，否则它会自己脑补。
- 不要让它同时实现"哈希 + 加密"两套——一个场景一个算法。
- 算法细节不必逐字规定，规定**场景→算法**的映射和**禁止项**即可，剩下交给成熟库。
