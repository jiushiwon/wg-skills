---
name: springboot-log-module-skill
description: Spring Boot 日志审计模块技能。面向已有 Spring Boot 项目，提供操作日志、登录日志、审计追踪等能力的快速集成。触发词："日志模块"、"审计模块"、"操作日志"、"登录日志"、"log module"、"audit log"。
---

# Spring Boot Log Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成日志和审计能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **操作日志** | 记录用户操作 |
| **登录日志** | 记录登录登出 |
| **审计追踪** | 敏感操作审计 |
| **日志查询** | 分页查询、导出 |

## 实体

```java
@Data
@Entity
@Table(name = "wg_operation_log")
public class OperationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String username;
    private String module;
    private String operation;
    private String method;
    private String path;
    @Column(columnDefinition = "TEXT")
    private String params;
    @Column(columnDefinition = "TEXT")
    private String result;
    private String ip;
    private String location;
    private Integer duration;
    private LocalDateTime createdAt;
}

@Data
@Entity
@Table(name = "wg_login_log")
public class LoginLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String username;
    private Integer status;
    private String ip;
    private String location;
    private String userAgent;
    private String message;
    private LocalDateTime createdAt;
}
```

## 注解方式记录日志

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLog {
    String module() default "";
    String operation() default "";
}
```

```java
@Aspect
@Component
public class OperationLogAspect {
    
    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) {
        // 记录操作
    }
}
```

## 不做

- 不负责日志存储（业务层自行选择）
- 不处理日志分析（ELK 等专门工具）
