# auth-skill — Java (Spring Boot) 实现要点

骨架已有的（java-backend-skill 生成，**不要重写**）：`JwtUtil`（签发/验证）、`JwtFilter`、`CurrentUserArgumentResolver`、统一信封与全局异常。本模块只补登录业务层。

## 新增依赖

```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-redis</artifactId></dependency>
<!-- 验证码/计数/黑名单用；用户确认无 Redis 时不加，改 DB 降级 -->

<!-- 内置阿里云短信时（接 notification-skill 或不发真实短信可省） -->
<dependency><groupId>com.aliyun</groupId><artifactId>dysmsapi20170525</artifactId><version>3.0.0</version></dependency>
<dependency><groupId>com.aliyun</groupId><artifactId>tea-openapi</artifactId><version>0.3.6</version></dependency>
```

bcrypt 用骨架已有的 `spring-security-crypto`：`new BCryptPasswordEncoder(10)`。版本号现场查官方源写入 `versions.md`，**不写死**。

## 配置（`application.yml` 追加）

```yaml
aliyun:
  access-key-id: ${ALIYUN_ACCESS_KEY_ID:}
  access-key-secret: ${ALIYUN_ACCESS_KEY_SECRET:}
  sms:
    region-id: ${SMS_REGION_ID:cn-hangzhou}
    sign-name: ${SMS_SIGN_NAME:}
    template-code: ${SMS_TEMPLATE_CODE:}
wechat:
  miniapp:
    appid: ${WECHAT_MINIAPP_APPID:}      # 选 uniapp 时
    secret: ${WECHAT_MINIAPP_SECRET:}    # 选 uniapp 时
auth:
  captcha-enabled: ${CAPTCHA_ENABLED:false}   # 图形验证码开关
```

## 关键文件

| 文件 | 职责 |
|------|------|
| `entity/User.java` + `UserRepository.java` | 对应 `wg_user`（选 uniapp 加 `openId` 列），字段见 domain-model.md |
| `entity/RefreshToken.java` + `RefreshTokenRepository.java` | 对应 `wg_refresh_token` |
| `entity/OauthAccount.java`（接 oauth 时） | 对应 `wg_oauth_account` |
| `service/AuthService.java` | 注册/登录/短信登录/刷新/登出/找回重置 |
| `service/SmsCodeService.java` | 验证码生成、存储、限流（Redis）；发送通道注入 `SmsSender` |
| `service/CaptchaService.java` | 图形验证码（算术题 SVG + Redis 存答案），开图形码时 |
| `service/sms/SmsSender.java` + `AliyunSmsSender.java` + `LogSmsSender.java` | 短信通道；dev 用 LogSender，已接 notification-skill 则委托 |
| `service/WxService.java` | uniapp 微信登录：jscode2session 换 openid、解析手机号，选 uniapp 时 |
| `controller/AuthController.java` | 全部接口，只做参数校验 + 调 service |
| `controller/UserController.java` | `/api/user/*` 资料管理接口（开资料管理时），参数校验 + 调 service |

## 关键片段

### 双令牌签发

```java
public TokenPair issueTokens(User user) {
  String jti = UUID.randomUUID().toString();
  String access = jwtUtil.sign(user.getId(), jti, Duration.ofHours(2));       // 骨架已有 sign，补 jti 参数
  String refresh = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
  RefreshToken row = new RefreshToken();
  row.setUserId(user.getId());
  row.setTokenHash(DigestUtils.sha256Hex(refresh));   // 只存哈希
  row.setJti(jti);
  row.setExpiresAt(OffsetDateTime.now().plusDays(30));
  refreshTokenRepository.save(row);
  return new TokenPair(access, refresh, 7200);
}
```

### 刷新（轮换 + 重放检测）

```java
@Transactional
public TokenPair refresh(String refreshToken) {
  String hash = DigestUtils.sha256Hex(refreshToken);
  RefreshToken old = refreshTokenRepository.findByTokenHashForUpdate(hash)  // 仓库方法加 @Lock(PESSIMISTIC_WRITE)，行锁防并发双换
      .orElseThrow(() -> new BusinessException(-1002, "refresh token 无效"));
  if (old.getRevoked() || old.getExpiresAt().isBefore(OffsetDateTime.now())) {
    // 已作废的令牌被重放：吊销该用户全部令牌（防盗刷）
    refreshTokenRepository.revokeAllByUserId(old.getUserId());
    throw new BusinessException(-1002, "refresh token 已失效，请重新登录");
  }
  old.setRevoked(true);
  User user = userRepository.findById(old.getUserId())
      .orElseThrow(() -> new BusinessException(-1002, "用户不存在"));
  if (user.getStatus() != 1) throw new BusinessException(-1002, "账号已禁用");
  return issueTokens(user);
}
```

### 图形验证码（算术题 SVG）

```java
public Map<String, String> makeCaptcha() {
  SecureRandom r = new SecureRandom();
  int a = r.nextInt(9) + 1, b = r.nextInt(9) + 1;            // 1~9
  String[] ops = {"+", "-", "*"};
  String op = ops[r.nextInt(3)];
  if (op.equals("-") && b > a) { int t = a; a = b; b = t; }  // 减法保证非负
  int answer = switch (op) { case "+" -> a + b; case "-" -> a - b; default -> a * b; };
  String captchaId = UUID.randomUUID().toString().replace("-", "");
  redis.opsForValue().set("captcha:" + captchaId, String.valueOf(answer), Duration.ofMinutes(5));
  String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"40\">"
      + "<rect width=\"120\" height=\"40\" fill=\"#f5f5f5\"/>"
      + "<text x=\"12\" y=\"27\" font-size=\"20\" fill=\"#333\">" + a + " " + op + " " + b + " = ?</text></svg>";
  return Map.of("captchaId", captchaId, "svg", svg);
}

public void checkCaptcha(String captchaId, String userAnswer) {
  String key = "captcha:" + captchaId;
  String val = redis.opsForValue().get(key);
  redis.delete(key);                                          // 取出即删，一次性
  if (val == null || !val.equals(userAnswer == null ? "" : userAnswer.trim()))
    throw new BusinessException(-1001, "图形验证码错误");
}
```

### 短信验证码限流（Redis）

```java
// 限流+当日配额：对所有手机号一致执行（供 forgot-password 复用，防枚举预言机）
public void consumeSmsQuota(String phone) {
  if (redis.hasKey("sms:limit:" + phone)) throw new BusinessException(-1006, "发送过于频繁，请 60 秒后重试");
  Long daily = redis.opsForValue().increment("sms:daily:" + phone);
  if (daily == 1) redis.expire("sms:daily:" + phone, Duration.ofDays(1));
  if (daily > 10) throw new BusinessException(-1006, "今日发送次数已达上限");
}

// 登录/注册入口：先过配额再真发
public void sendCode(String phone, String scene) {
  consumeSmsQuota(phone);
  generateAndSend(phone, scene);
}

private void generateAndSend(String phone, String scene) {
  String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
  try {
    smsSender.send(phone, code);   // 先发送；Aliyun 或 dev LogSender，已接 notification-skill 则委托
  } catch (BusinessException e) {
    redis.opsForValue().increment("sms:daily:" + phone, -1);  // 发送失败回退当日配额
    throw e;                                                   // 不写限流键，用户可立即重试
  }
  // 发送成功才落验证码（按场景分键）与 60s 限流键
  redis.opsForValue().set("sms:code:" + scene + ":" + phone, code, Duration.ofMinutes(5));
  redis.opsForValue().set("sms:limit:" + phone, "1", Duration.ofSeconds(60));
}
```

### 短信 Sender（内置最小阿里云 + dev 日志）

```java
public interface SmsSender { void send(String phone, String code); }

@Component
@Profile("dev")                                  // dev 环境不真发
class LogSmsSender implements SmsSender {
  public void send(String phone, String code) { log.info("[dev-sms] phone={} code={}", phone, code); }
}

@Component
@Profile("!dev")
class AliyunSmsSender implements SmsSender {
  private final com.aliyun.dysmsapi20170525.Client client;
  private final String signName, templateCode;

  AliyunSmsSender(AliyunSmsProperties p) throws Exception {
    com.aliyun.teaopenapi.models.Config cfg = new com.aliyun.teaopenapi.models.Config()
        .setAccessKeyId(p.getAccessKeyId()).setAccessKeySecret(p.getAccessKeySecret())
        .setEndpoint("dysmsapi." + p.getRegionId() + ".aliyuncs.com");
    this.client = new com.aliyun.dysmsapi20170525.Client(cfg);
    this.signName = p.getSignName(); this.templateCode = p.getTemplateCode();
  }

  public void send(String phone, String code) {
    try {
      SendSmsResponse resp = client.sendSms(new SendSmsRequest()
          .setPhoneNumbers(phone).setSignName(signName)
          .setTemplateCode(templateCode).setTemplateParam("{\"code\":\"" + code + "\"}"));
      if (!"OK".equals(resp.getBody().getCode()))
        throw new BusinessException(-2000, "短信发送失败: " + resp.getBody().getMessage());
    } catch (BusinessException e) { throw e; }
      catch (Exception e) { throw new BusinessException(-2000, "短信服务异常"); }
  }
}
```

### 密码找回 / 重置

```java
public void forgotPassword(String phone) {
  consumeSmsQuota(phone);                                            // 限流对所有手机号一致执行（防枚举预言机）
  userRepository.findByPhone(phone).ifPresent(u -> generateAndSend(phone, "reset")); // 仅已注册真发
}

@Transactional
public void resetPassword(String phone, String code, String newPassword) {
  String key = "sms:code:reset:" + phone;                          // 按场景取码
  String saved = redis.opsForValue().get(key);
  redis.delete(key);                                              // 一次性
  if (saved == null || !saved.equals(code)) throw new BusinessException(-1002, "验证码错误或已过期");
  User user = userRepository.findByPhone(phone)
      .orElseThrow(() -> new BusinessException(-1002, "验证码错误或已过期")); // 不泄露是否注册
  user.setPasswordHash(new BCryptPasswordEncoder(10).encode(newPassword));
  refreshTokenRepository.revokeAllByUserId(user.getId());         // 重置后吊销全部 refresh，强制重登
}
```

### uniapp 微信小程序登录（jscode2session + 解析手机号）

```java
public TokenPair wxLogin(String code, String phoneCode) {
  // 1) code → openid（session_key 不下发、不落库）
  Map<?, ?> session = restTemplate.getForObject(
      "https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={code}&grant_type=authorization_code",
      Map.class, appid, secret, code);
  String openid = (String) session.get("openid");
  if (openid == null) throw new BusinessException(-1002, "微信登录失败");

  User user;
  if (phoneCode != null && !phoneCode.isBlank()) {
    // 2) 解析手机号模式：access_token + phoneCode → 手机号
    String accessToken = getWxAccessToken();                     // 带缓存，见坑位
    Map<?, ?> body = restTemplate.postForObject(
        "https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=" + accessToken,
        Map.of("code", phoneCode), Map.class);
    Map<?, ?> info = (Map<?, ?>) body.get("phone_info");
    String phone = info == null ? null : (String) info.get("phoneNumber");
    if (phone == null) throw new BusinessException(-1002, "手机号解析失败");
    user = userRepository.findByPhone(phone).map(u -> {
      if (u.getOpenId() == null) { u.setOpenId(openid); userRepository.save(u); }  // 命中老用户回写绑定 open_id
      return u;
    }).orElseGet(() -> newUser(phone, openid));
  } else {
    // 仅 openid 模式
    user = userRepository.findByOpenId(openid).orElseGet(() -> newUser(null, openid));
  }
  return issueTokens(user);
}
```

### 登录失败锁定

```java
// 校验密码失败时：
Long fails = redis.opsForValue().increment("login:fail:" + username);
if (fails == 1) redis.expire("login:fail:" + username, Duration.ofMinutes(15));
if (fails >= 5) throw new BusinessException(-1002, "尝试次数过多，账号锁定 15 分钟");
throw new BusinessException(-1002, "账号或密码错误");   // 统一文案，防枚举

// 校验密码成功时（签发令牌前）：
redis.delete("login:fail:" + username);                 // 重置失败计数，避免成功后仍被旧计数锁定
```

### 资料管理（profile / 改密 / 换绑手机 / 注销）

```java
public User getProfile(Long userId) {
  return userRepository.findById(userId).orElseThrow(() -> new BusinessException(-1004, "用户不存在"));
}

public User updateProfile(Long userId, String nickname, String avatar) {
  if ((nickname == null || nickname.isBlank()) && (avatar == null || avatar.isBlank()))
    throw new BusinessException(-1001, "至少修改一项");
  User u = getProfile(userId);
  if (nickname != null && !nickname.isBlank()) u.setNickname(nickname);
  if (avatar != null && !avatar.isBlank()) u.setAvatar(avatar);
  return userRepository.save(u);
}

// 改密：校验旧密码 → 设新密码 → 吊销其他设备 refresh（保留当前 jti 会话）
@Transactional
public void changePassword(Long userId, String currentJti, String oldPassword, String newPassword) {
  User u = getProfile(userId);
  BCryptPasswordEncoder enc = new BCryptPasswordEncoder(10);
  if (u.getPasswordHash() == null || !enc.matches(oldPassword, u.getPasswordHash()))
    throw new BusinessException(-1002, "旧密码错误");
  u.setPasswordHash(enc.encode(newPassword));
  refreshTokenRepository.revokeAllByUserIdExceptJti(userId, currentJti); // 仓库方法：where user_id=? and jti<>? set revoked
}

// 换绑手机：校验新号短信验证码(scene=bind) → 唯一冲突 -1005 → 绑定
@Transactional
public User bindPhone(Long userId, String phone, String code) {
  String key = "sms:code:bind:" + phone;
  String saved = redis.opsForValue().get(key);
  redis.delete(key);
  if (saved == null || !saved.equals(code)) throw new BusinessException(-1002, "验证码错误或已过期");
  if (userRepository.existsByPhone(phone)) throw new BusinessException(-1005, "该手机号已被绑定");
  User u = getProfile(userId);
  u.setPhone(phone);
  return userRepository.save(u);
}

// 注销：二次确认（密码或短信验证码 scene=login）→ status=0 → 吊销全部 token + 拉黑当前 access
@Transactional
public void deactivate(Long userId, String currentJti, String password, String code) {
  User u = getProfile(userId);
  boolean ok = password != null && u.getPasswordHash() != null
      && new BCryptPasswordEncoder(10).matches(password, u.getPasswordHash());
  if (!ok && code != null && u.getPhone() != null) {
    String key = "sms:code:login:" + u.getPhone();
    String saved = redis.opsForValue().get(key);
    redis.delete(key);
    ok = code.equals(saved);
  }
  if (!ok) throw new BusinessException(-1002, "确认信息错误");
  u.setStatus((short) 0);
  refreshTokenRepository.revokeAllByUserId(userId);                              // 吊销全部 refresh
  redis.opsForValue().set("token:blacklist:" + currentJti, "1", Duration.ofHours(2)); // 拉黑当前 access
}
```

## 坑位

- `JwtFilter` 里补上两条校验：`status == 1`（禁用用户拒绝）与黑名单 `token:blacklist:{jti}`（如启用）。
- 刷新必须行锁防并发双换：仓库方法 `findByTokenHashForUpdate` 加 `@Lock(LockModeType.PESSIMISTIC_WRITE)`，配合 `@Transactional`。
- 短信码按场景分键 `sms:code:{scene}:{phone}`；限流 `sms:limit`/`sms:daily` 按手机号共享。发送顺序：先过配额、`send()` 成功才写验证码与限流键，失败回退当日计数。
- 登出接口在 `@Transactional` 内按 `userId + jti` 作废旧 refresh；黑名单用 access 的 `exp - now` 做 TTL。
- `phone`/`open_id` 唯一索引 + 并发注册：捕获 `DuplicateKeyException` 转 `-1005`，别先查后插。
- 时区：统一 `OffsetDateTime` / `TIMESTAMPTZ`，禁止 `LocalDateTime` 存令牌过期时间。
- 图形验证码/短信码都要「取出即删」保证一次性；并发下不要 get 后判断再 del（用 Lua 或接受极低概率重放，5min TTL 内风险可控）。
- 微信 `access_token` 全小程序共享且有频率限制：用 `GET /cgi-bin/token` 换取后缓存至过期（约 7200s），不要每次现取；`session_key` 仅服务端用。
- 已接 notification-skill 时**委托**它的 `sendSms`，不要在本模块重复实现阿里云调用。
