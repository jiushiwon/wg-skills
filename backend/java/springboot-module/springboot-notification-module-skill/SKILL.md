---
name: springboot-notification-module-skill
description: Spring Boot 通知模块技能。面向已有 Spring Boot 项目的开发者，提供短信发送、邮件推送、站内消息、推送通知等能力的快速集成。触发词："短信验证码"、"发送短信"、"发送邮件"、"站内消息"、"通知模块"、"notification module"、"sms"、"email"、"mail"。
---

# Spring Notification Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成通知能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **短信发送** | 验证码/通知短信 |
| **邮件推送** | HTML/文本邮件/模板邮件 |
| **站内消息** | 系统通知/未读消息 |
| **推送通知** | 极光/信鸽/个推 |
| **消息模板** | 模板管理和渲染 |

## 触发场景

用户说"帮我加短信"或"集成通知"时触发。

## 核心实现

### 依赖配置

```xml
<!-- 短信 -->
<dependency>
    <groupId>com.aliyun</groupId>
    <artifactId>dysmsapi20170525</artifactId>
</dependency>

<!-- 邮件 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- 站内消息 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 配置

```yaml
# 短信配置
sms:
  aliyun:
    access-key: ${SMS_ACCESS_KEY:}
    secret-key: ${SMS_SECRET_KEY:}
    sign-name: ${SMS_SIGN_NAME:}
    template-code: ${SMS_TEMPLATE_CODE:}

# 邮件配置
spring:
  mail:
    host: ${MAIL_HOST:smtp.qq.com}
    port: 587
    username: ${MAIL_USERNAME:}
    password: ${MAIL_PASSWORD:}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

# 站内消息配置
notification:
  redis-key-prefix: notification:
```

### 实体类

```java
// 站内消息
@Entity
@Table(name = "wg_notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String userId;
    
    private String title;
    
    @Column(columnDefinition = "text")
    private String content;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    private String link;
    
    private Integer isRead;
    
    private LocalDateTime createdAt;
}

public enum NotificationType { SYSTEM, SMS, EMAIL, PUSH }

@Entity
@Table(name = "wg_sms_code")
public class SmsCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String phone;
    
    private String code;
    
    private String templateCode;
    
    private LocalDateTime expireTime;
    
    private Integer used;
    
    private LocalDateTime createdAt;
}
```

### 服务层

```java
@Service
public class NotificationService {
    
    @Autowired
    private SmsTemplate smsTemplate;
    
    @Autowired
    private SpringMailSender mailSender;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    // 发送短信验证码
    public void sendSmsCode(String phone, String templateCode) {
        String code = generateCode(6);
        
        // 调用短信API
        SendSmsRequest request = new SendSmsRequest()
            .setPhoneNumbers(phone)
            .setSignName("您的签名")
            .setTemplateCode(templateCode)
            .setTemplateParam("{\"code\":\"" + code + "\"}");
        smsTemplate.send(request);
        
        // 保存验证码
        SmsCode smsCode = new SmsCode();
        smsCode.setPhone(phone);
        smsCode.setCode(code);
        smsCode.setTemplateCode(templateCode);
        smsCode.setExpireTime(LocalDateTime.now().plusMinutes(5));
        smsCodeRepository.save(smsCode);
    }
    
    // 发送邮件
    public void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@example.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }
    
    // 发送站内消息
    public void sendNotification(String userId, String title, String content, NotificationType type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(type);
        notification.setIsRead(0);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
        
        // Redis 推送
        redisTemplate.convertAndSend("notification:" + userId, notification);
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/api/notification")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    // 发送短信验证码
    @PostMapping("/sms/send")
    public ApiResponse<Void> sendSms(@RequestParam String phone) {
        notificationService.sendSmsCode(phone, "SMS_123456789");
        return ApiResponse.ok(null);
    }
    
    // 验证短信验证码
    @PostMapping("/sms/verify")
    public ApiResponse<Boolean> verifySms(@RequestParam String phone, @RequestParam String code) {
        boolean valid = notificationService.verifySmsCode(phone, code);
        return ApiResponse.ok(valid);
    }
    
    // 发送邮件
    @PostMapping("/email/send")
    public ApiResponse<Void> sendEmail(@RequestBody SendEmailRequest request) {
        notificationService.sendEmail(request.getTo(), request.getSubject(), request.getContent());
        return ApiResponse.ok(null);
    }
    
    // 发送站内消息
    @PostMapping("/send")
    public ApiResponse<Void> sendNotification(@RequestBody SendNotificationRequest request) {
        notificationService.sendNotification(
            request.getUserId(),
            request.getTitle(),
            request.getContent(),
            NotificationType.valueOf(request.getType())
        );
        return ApiResponse.ok(null);
    }
    
    // 查询未读消息
    @GetMapping("/unread")
    public ApiResponse<List<Notification>> getUnread(@RequestParam String userId) {
        List<Notification> list = notificationService.getUnreadNotifications(userId);
        return ApiResponse.ok(list);
    }
}
```

## 不做

- 不负责短信/邮件服务商账号配置
- 不处理复杂的推送策略
- 不提供 UI 相关代码
