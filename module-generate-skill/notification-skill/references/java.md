# notification-skill — Java (Spring Boot) 实现要点

骨架已有的（java-backend-skill 生成，**不要重写**）：统一信封、全局异常、JWT 过滤器、Redis。本模块只补通知业务层。错误码用闭集（见 backend-convention-skill response-format.md），不另列。

## 新增依赖

```xml
<!-- 阿里云短信 SDK（版本生成时查 Maven 中央仓最新） -->
<dependency><groupId>com.aliyun</groupId><artifactId>dysmsapi20170525</artifactId></dependency>
<!-- 邮件 -->
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-mail</artifactId></dependency>
<!-- 定时扫表降级（骨架若已带 scheduling 则不用重复加） -->
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter</artifactId></dependency>
```

环境变量：`ALIYUN_ACCESS_KEY_ID`、`ALIYUN_ACCESS_KEY_SECRET`、`ALIYUN_SMS_SIGN_NAME`、`MAIL_HOST`、`MAIL_USERNAME`、`MAIL_PASSWORD`、`APP_ENV`。

## 关键文件

| 文件 | 职责 |
|------|------|
| `entity/NotifyTemplate.java` + `NotifyTemplateRepository.java` | 对应 `wg_notify_template` |
| `entity/NotifyRecord.java` + `NotifyRecordRepository.java` | 对应 `wg_notify_record` |
| `service/NotifyService.java` | 对外接口 `sendSms(phone, templateCode, params)` / `sendEmail(to, templateCode, params)`：限流 + 落库(status=0)，立即返回 |
| `sender/SmsSender.java`（接口）+ `AliyunSmsSender.java` / `LogSmsSender.java` | 短信通道；dev 用 Log 实现 |
| `sender/EmailSender.java`（接口）+ `SmtpEmailSender.java` / `LogEmailSender.java` | 邮件通道；dev 用 Log 实现 |
| `worker/NotifySendWorker.java` | `@Scheduled` 定时扫 `status=0` 且到 `next_retry_at` 的记录发送，更新状态 |
| `controller/NotifyController.java` | 管理接口（templates/records/retry），只做参数校验 + 调 service |

## 关键片段

### 阿里云短信最小封装

```java
@Component
public class AliyunSmsSender implements SmsSender {
  private final Client client;

  public AliyunSmsSender(@Value("${aliyun.access-key-id}") String ak,
                         @Value("${aliyun.access-key-secret}") String sk) throws Exception {
    Config config = new Config().setAccessKeyId(ak).setAccessKeySecret(sk);
    config.endpoint = "dysmsapi.aliyuncs.com";
    this.client = new Client(config);
  }

  @Override
  public String send(String phone, String signName, String templateCode, Map<String, Object> params) {
    SendSmsRequest req = new SendSmsRequest()
        .setPhoneNumbers(phone)
        .setSignName(signName)
        .setTemplateCode(templateCode)
        .setTemplateParam(JSON.toJSONString(params));
    try {
      SendSmsResponse resp = client.sendSms(req);
      if ("OK".equals(resp.getBody().getCode())) {
        return resp.getBody().getBizId(); // 落 provider_request_id
      }
      throw new ProviderException(resp.getBody().getCode(), resp.getBody().getMessage(), retryable(resp.getBody().getCode()));
    } catch (TeaUnretryableException | TeaRetryableException e) {
      throw new ProviderException("NETWORK", e.getMessage(), true); // 网络类可重试
    }
  }

  private boolean retryable(String code) { // 限流/系统忙可重试；业务错误不可重试
    return "isv.BUSINESS_LIMIT_CONTROL".equals(code) || "Throttling".equals(code);
  }
}
```

### NotifyService.sendSms（限流 + 落库 + 异步投递）

```java
public Long sendSms(String phone, String templateCode, Map<String, Object> params) {
  NotifyTemplate tpl = templateRepository.findByCodeAndStatus(templateCode, 1)
      .orElseThrow(() -> new BusinessException(-1004, "短信模板不存在或已停用"));
  if (!"sms".equals(tpl.getChannel())) throw new BusinessException(-1001, "模板渠道不匹配");
  // 限流（复用 auth-skill 约定键）
  if (redis.hasKey("sms:limit:" + phone)) throw new BusinessException(-1006, "发送过于频繁，请 60 秒后重试");
  Long daily = redis.opsForValue().increment("sms:daily:" + phone);
  if (daily == 1) redis.expire("sms:daily:" + phone, Duration.ofDays(1));
  if (daily > 10) throw new BusinessException(-1006, "今日发送次数已达上限");
  redis.opsForValue().set("sms:limit:" + phone, "1", Duration.ofSeconds(60));
  // 落库（status=0 待发送），立即返回；真正发送交给 worker
  NotifyRecord rec = new NotifyRecord();
  rec.setChannel("sms"); rec.setTarget(phone); rec.setTemplateCode(templateCode);
  rec.setParams(params); rec.setProvider("aliyun"); rec.setStatus(0); rec.setRetryCount(0);
  return recordRepository.save(rec).getId();
}
```

### 定时扫表发送 worker（无队列降级）

```java
@Scheduled(fixedDelay = 15_000)
public void dispatch() {
  List<NotifyRecord> list = recordRepository.findPending(Status.PENDING, OffsetDateTime.now(), 50);
  for (NotifyRecord rec : list) {
    try {
      String reqId = "sms".equals(rec.getChannel())
          ? smsSender.send(rec.getTarget(), signName, tpl(rec).getProviderTemplateId(), rec.getParams())
          : emailSender.send(rec.getTarget(), tpl(rec).getProviderTemplateId(), tpl(rec).getContent(), rec.getParams());
      rec.setStatus(1); rec.setProviderRequestId(reqId); rec.setSentAt(OffsetDateTime.now()); rec.setErrorMsg(null);
    } catch (ProviderException e) {
      handleFail(rec, e); // 见下
    }
    recordRepository.save(rec);
  }
}

private void handleFail(NotifyRecord rec, ProviderException e) {
  rec.setErrorMsg(e.getMessage());
  if (e.isRetryable() && rec.getRetryCount() < 3) {
    rec.setRetryCount(rec.getRetryCount() + 1);
    rec.setNextRetryAt(OffsetDateTime.now().plus(backoff(rec.getRetryCount()))); // 1/5/15 min
  } else {
    rec.setStatus(2); // 终态失败：业务错误或已达上限，不再重试
  }
}
private Duration backoff(int retryCount) { return Duration.ofMinutes(retryCount == 1 ? 1 : retryCount == 2 ? 5 : 15); }
```

### SMTP 发送封装

```java
@Component
public class SmtpEmailSender implements EmailSender {
  private final JavaMailSender mailSender; // spring-boot-starter-mail 自动装配

  @Override
  public String send(String to, String subjectTpl, String contentTpl, Map<String, Object> params) {
    try {
      MimeMessage msg = mailSender.createMimeMessage();
      MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
      h.setTo(to);
      h.setSubject(render(subjectTpl, params));   // {{var}} 替换
      h.setText(render(contentTpl, params), true);
      mailSender.send(msg);
      return msg.getMessageID(); // 落 provider_request_id
    } catch (MessagingException | MailException e) {
      throw new ProviderException("SMTP", e.getMessage(), true); // SMTP 瞬时错误可重试
    }
  }
}
```

## 坑位

- **SDK 异常分类**：`TeaRetryableException`/网络超时、`isv.BUSINESS_LIMIT_CONTROL`（限流）、`Throttling` 属可重试；`isv.SMS_SIGNATURE_ILLEGAL`（签名未审核）、`isv.SMS_TEMPLATE_ILLEGAL`（模板未审核）、`isv.MOBILE_NUMBER_ILLEGAL`、`isv.OUT_OF_SERVICE`（余额不足）属业务错误，**置失败不重试**。务必按 `Code` 判断，别一律重试。
- **签名/模板必须先在阿里云控制台审核通过**才能发，否则报 `SMS_SIGNATURE_ILLEGAL`/`SMS_TEMPLATE_ILLEGAL`；这是环境配置问题，不是代码 bug，别在代码里绕。
- **LogSender 由 `APP_ENV` 切换**：用 `@Profile("dev")` 或条件装配，`APP_ENV=dev` 时注入 Log 实现，避免开发期真发短信/邮件。
- **JavaMailSender 连接**：生产配置 `spring.mail.properties.mail.smtp.connectiontimeout/writetimeout`，高频发送考虑连接复用或独立邮件服务；`Message-ID` 在 `send()` 后才生成，注意取值时机。
