# Spring Boot 项目完整骨架

生成 Spring Boot 项目时按本骨架现场写代码。版本号一律不写，由 SKILL.md 的版本获取策略动态决定。

> 维护者可用 `scripts/generate_project.py` 从本文件和 `references/startup-scripts.md` 自动生成完整项目，避免人工复制遗漏文件或编码错误。

## 目录结构

```
{{PROJECT_NAME}}/
├── .mvn/wrapper/                    # Maven Wrapper
├── src/main/java/{{basePackagePath}}/
│   ├── Application.java             # Spring Boot 入口
│   ├── common/
│   │   ├── ApiResponse.java         # 统一响应 { code, message, data }
│   │   ├── BusinessException.java   # 业务异常
│   │   ├── GlobalExceptionHandler.java
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── CurrentUser.java         # 当前用户注解
│   │   ├── CurrentUserArgumentResolver.java
│   │   ├── PageRequest.java
│   │   └── PageResponse.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── WebConfig.java
│   │   ├── LoggingFilter.java      # 请求日志（自动脱敏）
│   │   ├── OpenApiConfig.java
│   │   └── ResponseAdvice.java
│   ├── controller/
│   │   ├── HealthController.java
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── SseController.java
│   │   └── UploadController.java
│   ├── service/
│   │   ├── UserService.java
│   │   ├── AuthService.java
│   │   ├── UploadService.java
│   │   └── SseService.java
│   ├── repository/
│   │   └── UserRepository.java
│   ├── entity/
│   │   └── User.java
│   └── dto/
│       ├── auth/
│       │   ├── LoginRequest.java
│       │   ├── RegisterRequest.java
│       │   └── TokenResponse.java
│       ├── user/
│       │   ├── CreateUserRequest.java
│       │   ├── UpdateProfileRequest.java
│       │   ├── ChangePasswordRequest.java
│       │   └── UserResponse.java
│       └── upload/
│           └── UploadResponse.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
│       └── V1__init_user.sql
├── src/test/java/{{basePackagePath}}/
│   └── ApplicationTests.java
├── uploads/                         # 文件上传目录（运行时创建）
├── logs/                            # 日志目录（运行时创建）
├── .env.example
├── .env                             # 生成时自动创建
├── .gitignore
├── docker-compose.yml               # 默认 MySQL
├── docker-compose.pg.yml            # 可选 PostgreSQL
├── docker-compose.mongo.yml         # 可选 MongoDB
├── Dockerfile
├── mvnw / mvnw.cmd
├── pom.xml
├── README.md
├── api-contract.md                  # 接口契约（强制交付物）
└── docs/
    └── project-guide.md             # 项目指南（强制交付物）
```

## 配置生成与加载规则（强制）

1. **`pom.xml` 使用 demo 验证基线版本**（Spring Boot 3.3.5、jjwt 0.12.6、springdoc 2.6.0），生成时可按 `SKILL.md` 版本策略替换为最新稳定版。
2. **`.env.example` 是模板**，包含所有可配置项；生成时复制为 `.env`，`.env` 加入 `.gitignore`。
3. **`application.yml` 用 `${ENV_VAR:default}` 引用 `.env`**——Spring Boot 原生支持 `.env` 加载（通过 spring-cloud-starter-config 或 `application.yml` 显式 `spring.config.import: optional:classpath:.env`）。
4. **包名生成规则**：默认 `com.koala.{{project}}`（kebab-case → camelCase），例 `my-app` → `com.koala.myapp`。用户可自定义，但须符合 Java 包名规范。
5. **目录占位符**：`{{basePackagePath}}` 替换为点号路径转斜杠，如 `com/example/myapp`。

## 依赖清单（pom.xml）

- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa`（默认）/ `spring-boot-starter-data-mongodb`（MongoDB 时）
- `spring-boot-starter-data-redis`（可选，需 Redis 时才引入）
- `spring-boot-starter-security`
- 数据库驱动：`mysql-connector-j` / `postgresql` / `mongodb-driver-sync`（按 `DB_TYPE` 选）
- `io.jsonwebtoken:jjwt-api / jjwt-impl / jjwt-jackson`（0.12.x）
- `org.springdoc:springdoc-openapi-starter-webmvc-ui`（2.x）
- `org.flywaydb:flyway-core` + `flyway-mysql` 或 `flyway-database-postgresql`（按需）
- `org.projectlombok:lombok`（optional）
- `org.springframework.boot:spring-boot-devtools`（开发热重载，runtime）
- `org.springframework.boot:spring-boot-starter-test`（测试）

## 关键文件模板

### Application.java

```java
package {{basePackage}};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 应用入口。
 */
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### application.yml

```yaml
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /
  tomcat:
    threads:
      max: ${TOMCAT_THREADS_MAX:200}
    accept-count: ${TOMCAT_ACCEPT_COUNT:100}
    connection-timeout: ${TOMCAT_CONNECTION_TIMEOUT:20000}
  shutdown: graceful

spring:
  application:
    name: ${APP_NAME:{{project}}}
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}

  lifecycle:
    timeout-per-shutdown-phase: ${SHUTDOWN_TIMEOUT:30s}

  # 数据源配置（按 DB_TYPE 切换）
  datasource:
    url: ${DB_URL:jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:{{project}}}?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:root}
    driver-class-name: ${DB_DRIVER:com.mysql.cj.jdbc.Driver}
    hikari:
      pool-name: ${APP_NAME:{{project}}}-pool
      maximum-pool-size: ${DB_POOL_MAX_SIZE:20}
      minimum-idle: ${DB_POOL_MIN_IDLE:5}
      connection-timeout: ${DB_POOL_CONNECTION_TIMEOUT:20000}
      idle-timeout: ${DB_POOL_IDLE_TIMEOUT:300000}
      max-lifetime: ${DB_POOL_MAX_LIFETIME:1200000}
      leak-detection-threshold: ${DB_POOL_LEAK_DETECTION_THRESHOLD:60000}

  # JPA 配置（仅 DB_TYPE=mysql/postgres 时启用）
  jpa:
    hibernate:
      ddl-auto: ${JPA_DDL_AUTO:update}
    show-sql: ${JPA_SHOW_SQL:false}
    properties:
      hibernate:
        dialect: ${JPA_DIALECT:org.hibernate.dialect.MySQLDialect}
        format_sql: true

  # Flyway（按需启用）
  flyway:
    enabled: ${FLYWAY_ENABLED:false}
    locations: classpath:db/migration
    baseline-on-migrate: true

  # Redis（可选）：需同时引入 spring-boot-starter-data-redis 依赖才会生效
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      database: ${REDIS_DATABASE:0}

  # 文件上传
  servlet:
    multipart:
      max-file-size: ${UPLOAD_MAX_FILE_SIZE:10MB}
      max-request-size: ${UPLOAD_MAX_REQUEST_SIZE:50MB}

# SSE 流式配置
sse:
  timeout-ms: ${SSE_TIMEOUT_MS:30000}
  heartbeat-seconds: ${SSE_HEARTBEAT_SECONDS:2}

# JWT 配置
jwt:
  secret: ${JWT_SECRET:change-me-please-use-openssl-rand-base64-32}
  access-expire-minutes: ${JWT_ACCESS_EXPIRE_MINUTES:60}
  refresh-expire-days: ${JWT_REFRESH_EXPIRE_DAYS:7}
  issuer: ${JWT_ISSUER:{{project}}}
  header: ${JWT_HEADER:Authorization}
  prefix: ${JWT_PREFIX:Bearer }

# CORS
cors:
  origins: ${CORS_ORIGINS:*}

# 文件上传配置
upload:
  dir: ${UPLOAD_DIR:./uploads}
  allowed-types: ${UPLOAD_ALLOWED_TYPES:jpg,jpeg,png,gif,pdf}
  allowed-mime-types: ${UPLOAD_ALLOWED_MIME_TYPES:image/jpeg,image/png,image/gif,application/pdf}
  max-size-bytes: ${UPLOAD_MAX_SIZE_BYTES:10485760}

# 日志
logging:
  level:
    root: ${LOG_LEVEL_ROOT:INFO}
    {{basePackage}}: ${LOG_LEVEL_APP:DEBUG}
  file:
    path: ${LOG_PATH:./logs}
    name: ${LOG_FILE_NAME:app.log}

# springdoc-openapi
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
  show-actuator: false

# 应用调试
app:
  debug: ${APP_DEBUG:true}
  table-prefix: ${DB_TABLE_PREFIX:wg}
```

### .env.example

```bash
# ========== 应用基础配置 ==========
APP_NAME={{project}}
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev
APP_DEBUG=true

# ========== 数据库配置 ==========
# DB_TYPE 可选: mysql / postgres / mongo / none
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME={{project}}
DB_USERNAME=root
DB_PASSWORD=root

# HikariCP 连接池（高并发必调）
DB_POOL_MAX_SIZE=20
DB_POOL_MIN_IDLE=5
DB_POOL_CONNECTION_TIMEOUT=20000
DB_POOL_IDLE_TIMEOUT=300000
DB_POOL_MAX_LIFETIME=1200000
DB_POOL_LEAK_DETECTION_THRESHOLD=60000

# JPA 配置
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_DIALECT=org.hibernate.dialect.MySQLDialect

# Flyway（生产建议开启，开发可关闭）
FLYWAY_ENABLED=false

# Tomcat（高并发必调）
TOMCAT_THREADS_MAX=200
TOMCAT_ACCEPT_COUNT=100
TOMCAT_CONNECTION_TIMEOUT=20000

# 优雅关闭
SHUTDOWN_TIMEOUT=30s

# SSE 流式
SSE_TIMEOUT_MS=30000
SSE_HEARTBEAT_SECONDS=2

# ========== Redis 配置（可选）==========
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0

# ========== JWT 配置 ==========
# ⚠️ 生产环境务必修改为随机密钥（至少 256 位 / 32 字节）
# 生成命令：openssl rand -base64 32
JWT_SECRET=change-me-please-use-openssl-rand-base64-32
JWT_ACCESS_EXPIRE_MINUTES=60
JWT_REFRESH_EXPIRE_DAYS=7
JWT_ISSUER={{project}}
JWT_HEADER=Authorization
JWT_PREFIX=Bearer

# ========== CORS 配置 ==========
# ⚠️ 生产环境设为具体域名（逗号分隔），开发可用 *
CORS_ORIGINS=*

# ========== 文件上传配置 ==========
UPLOAD_DIR=./uploads
UPLOAD_MAX_FILE_SIZE=10MB
UPLOAD_MAX_REQUEST_SIZE=50MB
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf
UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,application/pdf
UPLOAD_MAX_SIZE_BYTES=10485760

# ========== 表前缀 ==========
DB_TABLE_PREFIX=wg

# ========== 日志 ==========
LOG_LEVEL_ROOT=INFO
LOG_LEVEL_APP=DEBUG
LOG_PATH=./logs
LOG_FILE_NAME=app.log
```

### .gitignore

```gitignore
# IDE
.idea/
.vscode/
*.iml
*.ipr
*.iws

# 构建
target/
build/
out/

# Maven Wrapper
.mvn/wrapper/maven-wrapper.jar

# 运行时
.env
logs/
uploads/
*.pid

# 系统
.DS_Store
Thumbs.db

# 日志
*.log
```

### common/ApiResponse.java

```java
package {{basePackage}}.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 统一响应信封：{ code, message, data }。
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "统一响应")
public class ApiResponse<T> {

    @Schema(description = "状态码，0 表示成功")
    private int code;

    @Schema(description = "提示信息")
    private String message;

    @Schema(description = "业务数据")
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setCode(0);
        r.setMessage("success");
        r.setData(data);
        return r;
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setCode(code);
        r.setMessage(message);
        return r;
    }

    public static <T> ApiResponse<T> error(int code, String message, T data) {
        ApiResponse<T> r = error(code, message);
        r.setData(data);
        return r;
    }
}
```

### common/BusinessException.java

```java
package {{basePackage}}.common;

import lombok.Getter;

/**
 * 业务异常，携带错误码。
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String message) {
        super(message);
        this.code = -2000;
    }

    // 常用错误码快捷构造
    public static BusinessException badRequest(String message) {
        return new BusinessException(-1001, message);
    }

    public static BusinessException unauthorized(String message) {
        return new BusinessException(-1002, message);
    }

    public static BusinessException forbidden(String message) {
        return new BusinessException(-1003, message);
    }

    public static BusinessException notFound(String message) {
        return new BusinessException(-1004, message);
    }

    public static BusinessException conflict(String message) {
        return new BusinessException(-1005, message);
    }
}
```

### common/GlobalExceptionHandler.java

```java
package {{basePackage}}.common;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 全局异常处理：业务异常 / 校验异常 / 兜底异常 → 统一信封。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException ex) {
        log.warn("业务异常: code={}, message={}", ex.getCode(), ex.getMessage());
        HttpStatus status = mapHttpStatus(ex.getCode());
        return ResponseEntity.status(status).body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errors = new ArrayList<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.add(Map.of(
                "field", fe.getField(),
                "message", fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage()
            ));
        }
        log.warn("参数校验失败: {}", errors);
        return ResponseEntity.badRequest().body(
            ApiResponse.error(-1001, "参数校验失败", Map.of("errors", errors))
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraint(ConstraintViolationException ex) {
        log.warn("约束校验失败: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(
            ApiResponse.error(-1001, "参数校验失败", ex.getMessage())
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("数据库唯一约束冲突: {}", ex.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            ApiResponse.error(-1005, "资源冲突（数据已存在）")
        );
    }

    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataAccess(org.springframework.dao.DataAccessException ex) {
        log.error("数据库访问异常", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ApiResponse.error(-2001, "数据库异常")
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAll(Exception ex) {
        log.error("系统异常", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ApiResponse.error(-2000, "系统异常", ex.getClass().getSimpleName())
        );
    }

    private HttpStatus mapHttpStatus(int code) {
        return switch (code) {
            case -1001 -> HttpStatus.BAD_REQUEST;
            case -1002 -> HttpStatus.UNAUTHORIZED;
            case -1003 -> HttpStatus.FORBIDDEN;
            case -1004 -> HttpStatus.NOT_FOUND;
            case -1005 -> HttpStatus.CONFLICT;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}
```

### common/JwtUtil.java

```java
package {{basePackage}}.common;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 工具：签发与解析。
 */
@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expire-minutes:60}")
    private long accessExpireMinutes;

    @Value("${jwt.refresh-expire-days:7}")
    private long refreshExpireDays;

    @Value("${jwt.issuer:app}")
    private String issuer;

    private SecretKey key;

    @PostConstruct
    public void init() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET 长度不足 32 字节（" + bytes.length +
                " 字节），请使用至少 256 位随机密钥，例如：openssl rand -base64 32"
            );
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public long getAccessExpireMinutes() {
        return accessExpireMinutes;
    }

    public String generateAccessToken(Long userId, String username) {
        return generateToken(userId, username, "access", accessExpireMinutes * 60 * 1000L);
    }

    public String generateRefreshToken(Long userId, String username) {
        return generateToken(userId, username, "refresh", refreshExpireDays * 24 * 60 * 60 * 1000L);
    }

    private String generateToken(Long userId, String username, String type, long ttlMillis) {
        long now = System.currentTimeMillis();
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", userId);
        claims.put("type", type);
        return Jwts.builder()
            .claims(claims)
            .subject(username)
            .issuer(issuer)
            .issuedAt(new Date(now))
            .expiration(new Date(now + ttlMillis))
            .signWith(key)
            .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public Long getUserId(Claims claims) {
        Object uid = claims.get("uid");
        if (uid instanceof Number n) return n.longValue();
        return null;
    }

    public String getUsername(Claims claims) {
        return claims.getSubject();
    }

    public String getTokenType(Claims claims) {
        Object type = claims.get("type");
        return type == null ? "access" : type.toString();
    }
}
```

### common/JwtAuthenticationFilter.java

```java
package {{basePackage}}.common;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 鉴权拦截器：解析 Authorization Header，注入 SecurityContext。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Value("${jwt.header:Authorization}")
    private String header;

    @Value("${jwt.prefix:Bearer }")
    private String prefix;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(header);
        if (authHeader != null && authHeader.startsWith(prefix)) {
            String token = authHeader.substring(prefix.length());
            try {
                Claims claims = jwtUtil.parse(token);
                String type = jwtUtil.getTokenType(claims);
                if (!"access".equals(type)) {
                    log.warn("非 access token, type={}", type);
                } else {
                    Long userId = jwtUtil.getUserId(claims);
                    String username = jwtUtil.getUsername(claims);
                    var auth = new UsernamePasswordAuthenticationToken(
                        userId, null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                log.warn("JWT 解析失败: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

### common/CurrentUser.java

```java
package {{basePackage}}.common;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 当前用户注解：标记在 Controller 方法参数上注入当前登录用户 ID。
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
```

### common/CurrentUserArgumentResolver.java

```java
package {{basePackage}}.common;

import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * @CurrentUser 注解解析器：从 SecurityContext 取出 Principal（即 userId）。
 */
@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
            && parameter.getParameterType().equals(Long.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw BusinessException.unauthorized("未登录");
        }
        return (Long) auth.getPrincipal();
    }
}
```

### common/PageRequest.java

```java
package {{basePackage}}.common;

import lombok.Data;

/**
 * 分页请求参数。
 */
@Data
public class PageRequest {
    private int page = 1;
    private int size = 10;

    public int getOffset() {
        return (page - 1) * size;
    }

    public org.springframework.data.domain.PageRequest toJpaPageRequest() {
        return org.springframework.data.domain.PageRequest.of(
            Math.max(0, page - 1), size
        );
    }
}
```

### common/PageResponse.java

```java
package {{basePackage}}.common;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 分页响应。
 */
@Data
public class PageResponse<T> {
    private List<T> items;
    private long total;
    private int page;
    private int size;

    public static <T> PageResponse<T> from(Page<T> p) {
        PageResponse<T> r = new PageResponse<>();
        r.setItems(p.getContent());
        r.setTotal(p.getTotalElements());
        r.setPage(p.getNumber() + 1);
        r.setSize(p.getSize());
        return r;
    }
}
```

### config/SecurityConfig.java

```java
package {{basePackage}}.config;

import {{basePackage}}.common.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 6 配置：JWT 鉴权 + 安全头 + CORS + CSRF 关闭。
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(h -> h
                .frameOptions(f -> f.deny())
                .contentTypeOptions(c -> {})
                .xssProtection(x -> {})
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/health", "/api/sse/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*"));
        cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
```

### config/WebConfig.java

```java
package {{basePackage}}.config;

import {{basePackage}}.common.CurrentUserArgumentResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web MVC 配置：注册参数解析器 + 静态资源映射。
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final CurrentUserArgumentResolver currentUserArgumentResolver;

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(currentUserArgumentResolver);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
}
```

### config/LoggingFilter.java

```java
package {{basePackage}}.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * 请求日志过滤器：记录方法、路径、状态码、耗时。
 *
 * <p>自动跳过包含敏感关键字的路径（auth/password/token 等），避免日志泄露凭证。 ponytail:
 * 若需全链路追踪，可在此注入 MDC traceId。
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class LoggingFilter extends OncePerRequestFilter {

    private static final Set<String> SENSITIVE_KEYWORDS = Set.of("auth", "password", "token", "login", "register");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        String uri = request.getRequestURI();
        String method = request.getMethod();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long cost = System.currentTimeMillis() - start;
            int status = response.getStatus();
            if (isSensitive(uri)) {
                log.info("[请求] {} {} {} {}ms (敏感路径已脱敏)", method, uri, status, cost);
            } else {
                log.info("[请求] {} {} {} {}ms", method, uri, status, cost);
            }
        }
    }

    private boolean isSensitive(String uri) {
        String lower = uri.toLowerCase();
        return SENSITIVE_KEYWORDS.stream().anyMatch(lower::contains);
    }
}
```

### config/OpenApiConfig.java

```java
package {{basePackage}}.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * springdoc-openapi 配置：Swagger UI + JWT 鉴权。
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("{{project}} API")
                .version("1.0.0")
                .description("Spring Boot 后端 API 文档"))
            .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
            .components(new Components()
                .addSecuritySchemes(SECURITY_SCHEME_NAME,
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

### config/ResponseAdvice.java

```java
package {{basePackage}}.config;

import {{basePackage}}.common.ApiResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.Objects;

/**
 * ResponseBodyAdvice：自动将 Controller 返回值包装为 ApiResponse。
 * 已手动包装的 ApiResponse 不重复包装。
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class ResponseAdvice implements ResponseBodyAdvice<Object> {

    private final ObjectMapper objectMapper;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // SSE 端点不包装
        String typeName = returnType.getParameterType().getName();
        if (typeName.contains("ServerSentEvent") || typeName.contains("SseEmitter")) {
            return false;
        }
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        if (body instanceof ApiResponse<?> r) {
            return r;
        }
        if (body == null) {
            return ApiResponse.success(null);
        }
        if (body instanceof String || body instanceof byte[]) {
            return body;
        }
        return ApiResponse.success(body);
    }
}
```

### entity/User.java

```java
package {{basePackage}}.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 用户实体（演示用）。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "{{tablePrefix}}_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;  // BCrypt hash

    @Column(length = 64)
    private String nickname;

    @Column(length = 128)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### repository/UserRepository.java

```java
package {{basePackage}}.repository;

import {{basePackage}}.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 用户仓储。
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
```

### dto/auth/LoginRequest.java

```java
package {{basePackage}}.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 64, message = "用户名长度 4-64")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 64, message = "密码长度 6-64")
    private String password;
}
```

### dto/auth/RegisterRequest.java

```java
package {{basePackage}}.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 64, message = "用户名长度 4-64")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 64, message = "密码长度 6-64")
    private String password;

    @Size(max = 64)
    private String nickname;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}
```

### dto/auth/TokenResponse.java

```java
package {{basePackage}}.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresIn;  // 秒
}
```

### dto/user/CreateUserRequest.java

```java
package {{basePackage}}.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank
    @Size(min = 4, max = 64)
    private String username;

    @NotBlank
    @Size(min = 6, max = 64)
    private String password;

    private String nickname;

    @Email
    private String email;
}
```

### dto/user/UpdateProfileRequest.java

```java
package {{basePackage}}.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 64)
    private String nickname;

    @Email
    private String email;
}
```

### dto/user/ChangePasswordRequest.java

```java
package {{basePackage}}.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank
    private String oldPassword;

    @NotBlank
    @Size(min = 6, max = 64)
    private String newPassword;
}
```

### dto/user/UserResponse.java

```java
package {{basePackage}}.dto.user;

import {{basePackage}}.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setNickname(u.getNickname());
        r.setEmail(u.getEmail());
        r.setPhone(u.getPhone());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}
```

### dto/upload/UploadResponse.java

```java
package {{basePackage}}.dto.upload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    private String url;
    private long size;
    private String mimeType;
    private String filename;
}
```

### service/UserService.java

```java
package {{basePackage}}.service;

import {{basePackage}}.common.BusinessException;
import {{basePackage}}.dto.user.ChangePasswordRequest;
import {{basePackage}}.dto.user.CreateUserRequest;
import {{basePackage}}.dto.user.UpdateProfileRequest;
import {{basePackage}}.dto.user.UserResponse;
import {{basePackage}}.entity.User;
import {{basePackage}}.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> list(int page, int size) {
        Page<User> p = userRepository.findAll(PageRequest.of(Math.max(0, page - 1), size));
        return p.map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User u = userRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        return UserResponse.from(u);
    }

    @Transactional
    public UserResponse create(CreateUserRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw BusinessException.conflict("用户名已存在");
        }
        User u = User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .nickname(req.getNickname())
            .email(req.getEmail())
            .build();
        return UserResponse.from(userRepository.save(u));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User u = userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        if (req.getNickname() != null) u.setNickname(req.getNickname());
        if (req.getEmail() != null) u.setEmail(req.getEmail());
        return UserResponse.from(userRepository.save(u));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User u = userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        if (!passwordEncoder.matches(req.getOldPassword(), u.getPassword())) {
            throw BusinessException.badRequest("原密码错误");
        }
        u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(u);
    }
}
```

### service/AuthService.java

```java
package {{basePackage}}.service;

import {{basePackage}}.common.BusinessException;
import {{basePackage}}.common.JwtUtil;
import {{basePackage}}.dto.auth.LoginRequest;
import {{basePackage}}.dto.auth.RegisterRequest;
import {{basePackage}}.dto.auth.TokenResponse;
import {{basePackage}}.entity.User;
import {{basePackage}}.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public TokenResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw BusinessException.conflict("用户名已存在");
        }
        User u = User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .nickname(req.getNickname())
            .email(req.getEmail())
            .phone(req.getPhone())
            .build();
        userRepository.save(u);
        return generateTokens(u);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        User u = userRepository.findByUsername(req.getUsername())
            .orElseThrow(() -> BusinessException.badRequest("用户名或密码错误"));
        if (!passwordEncoder.matches(req.getPassword(), u.getPassword())) {
            throw BusinessException.badRequest("用户名或密码错误");
        }
        return generateTokens(u);
    }

    @Transactional(readOnly = true)
    public TokenResponse refresh(String refreshToken) {
        try {
            Claims claims = jwtUtil.parse(refreshToken);
            if (!"refresh".equals(jwtUtil.getTokenType(claims))) {
                throw BusinessException.badRequest("非 refresh token");
            }
            Long userId = jwtUtil.getUserId(claims);
            User u = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.unauthorized("用户不存在"));
            return generateTokens(u);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw BusinessException.unauthorized("刷新令牌无效或已过期");
        }
    }

    private TokenResponse generateTokens(User u) {
        String access = jwtUtil.generateAccessToken(u.getId(), u.getUsername());
        String refresh = jwtUtil.generateRefreshToken(u.getId(), u.getUsername());
        long expiresIn = jwtUtil.getAccessExpireMinutes() * 60;
        return new TokenResponse(access, refresh, "Bearer", (int) expiresIn);
    }
}
```

### service/UploadService.java

```java
package {{basePackage}}.service;

import {{basePackage}}.common.BusinessException;
import {{basePackage}}.dto.upload.UploadResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class UploadService {

    @Value("${upload.dir:./uploads}")
    private String uploadDir;

    @Value("${upload.allowed-types:jpg,jpeg,png,gif,pdf}")
    private String allowedTypesStr;

    @Value("${upload.allowed-mime-types:image/jpeg,image/png,image/gif,application/pdf}")
    private String allowedMimeTypesStr;

    @Value("${upload.max-size-bytes:10485760}")
    private long maxSizeBytes;

    private List<String> allowedTypes;
    private List<String> allowedMimeTypes;

    @PostConstruct
    public void init() {
        this.allowedTypes = Arrays.asList(allowedTypesStr.split(","));
        this.allowedMimeTypes = Arrays.asList(allowedMimeTypesStr.split(","));
        try {
            Path p = Paths.get(uploadDir);
            if (!Files.exists(p)) {
                Files.createDirectories(p);
                log.info("创建上传目录: {}", p.toAbsolutePath());
            }
        } catch (IOException e) {
            log.warn("上传目录初始化失败: {}", e.getMessage());
        }
    }

    public UploadResponse upload(MultipartFile file) throws IOException {
        validate(file);
        String ext = getExtension(file.getOriginalFilename());
        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        Path target = Paths.get(uploadDir, dateDir, filename);
        Files.createDirectories(target.getParent());
        file.transferTo(target.toFile());
        String url = "/uploads/" + dateDir + "/" + filename;
        log.info("文件上传: {} -> {}", file.getOriginalFilename(), target.toAbsolutePath());
        return new UploadResponse(url, file.getSize(), file.getContentType(), file.getOriginalFilename());
    }

    public java.util.List<UploadResponse> uploadMultiple(java.util.List<MultipartFile> files) throws IOException {
        return files.stream().map(f -> {
            try {
                return upload(f);
            } catch (IOException e) {
                throw new RuntimeException("上传失败: " + f.getOriginalFilename(), e);
            }
        }).toList();
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw BusinessException.badRequest("文件为空");
        }
        if (file.getSize() > maxSizeBytes) {
            throw BusinessException.badRequest("文件超过最大尺寸 " + (maxSizeBytes / 1024 / 1024) + "MB");
        }
        String ext = getExtension(file.getOriginalFilename());
        if (!allowedTypes.contains(ext.toLowerCase())) {
            throw BusinessException.badRequest("不允许的文件类型: " + ext);
        }
        String mime = file.getContentType();
        if (mime != null && !allowedMimeTypes.contains(mime.toLowerCase())) {
            throw BusinessException.badRequest("不允许的文件内容类型: " + mime);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
```

### service/SseService.java

```java
package {{basePackage}}.service;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * SSE 流式服务。
 *
 * <p>
 * 每个连接独立维护一个定时心跳任务，连接关闭/超时/异常时立即取消任务，
 * 避免高并发场景下线程与连接泄漏。
 */
@Slf4j
@Service
public class SseService {

    /**
     * 共享调度器，线程数随 CPU 核数扩展，最少 4 线程。
     * ponytail: 单个全局调度器足够演示；生产若万级连接可换为每连接独立 ScheduledExecutor
     * 或迁移到 Reactor/Netty。
     */
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(
        Math.max(4, Runtime.getRuntime().availableProcessors())
    );

    private final Map<SseEmitter, ScheduledFuture<?>> tasks = new ConcurrentHashMap<>();

    @Value("${sse.timeout-ms:30000}")
    private long timeoutMs;

    @Value("${sse.heartbeat-seconds:2}")
    private long heartbeatSeconds;

    public SseEmitter chat(Long userId) {
        // 默认 30 秒无活动自动超时，防止连接永久挂起
        SseEmitter emitter = new SseEmitter(timeoutMs);
        boolean isProtected = userId != null;
        AtomicInteger seq = new AtomicInteger(0);

        log.info("SSE 连接建立: userId={}, protected={}", userId, isProtected);

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                String content = isProtected ? "欢迎回来 #" + userId : "你好陌生人";
                emitter.send(SseEmitter.event()
                    .id(String.valueOf(seq.incrementAndGet()))
                    .name("message")
                    .data(Map.of("content", content, "ts", System.currentTimeMillis())));
            } catch (IOException e) {
                log.warn("SSE 推送失败，关闭连接: {}", e.getMessage());
                removeEmitter(emitter);
            }
        }, 0, heartbeatSeconds, TimeUnit.SECONDS);

        tasks.put(emitter, future);

        emitter.onCompletion(() -> {
            log.info("SSE 连接完成");
            removeEmitter(emitter);
        });
        emitter.onTimeout(() -> {
            log.info("SSE 连接超时");
            removeEmitter(emitter);
        });
        emitter.onError(e -> {
            log.warn("SSE 连接异常: {}", e.getMessage());
            removeEmitter(emitter);
        });

        return emitter;
    }

    private void removeEmitter(SseEmitter emitter) {
        ScheduledFuture<?> future = tasks.remove(emitter);
        if (future != null) {
            future.cancel(false);
        }
        try {
            emitter.complete();
        } catch (Exception ignored) {
            // 连接可能已被客户端关闭，忽略重复 complete
        }
    }

    @PreDestroy
    public void shutdown() {
        tasks.forEach((emitter, future) -> {
            future.cancel(false);
            emitter.complete();
        });
        tasks.clear();
        scheduler.shutdownNow();
        log.info("SSE 调度器已关闭");
    }
}
```

### controller/HealthController.java

```java
package {{basePackage}}.controller;

import {{basePackage}}.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "健康检查")
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Operation(summary = "健康检查")
    @GetMapping
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.success(Map.of(
            "status", "ok",
            "service", "{{project}}",
            "ts", String.valueOf(System.currentTimeMillis())
        ));
    }
}
```

### controller/AuthController.java

```java
package {{basePackage}}.controller;

import {{basePackage}}.common.ApiResponse;
import {{basePackage}}.common.BusinessException;
import {{basePackage}}.common.CurrentUser;
import {{basePackage}}.dto.auth.LoginRequest;
import {{basePackage}}.dto.auth.RegisterRequest;
import {{basePackage}}.dto.auth.TokenResponse;
import {{basePackage}}.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "注册")
    @PostMapping("/register")
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ApiResponse.success(authService.register(req));
    }

    @Operation(summary = "登录")
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.success(authService.login(req));
    }

    @Operation(summary = "刷新令牌")
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@RequestBody java.util.Map<String, String> body) {
        String refreshToken = body == null ? null : body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw BusinessException.badRequest("refreshToken 不能为空");
        }
        return ApiResponse.success(authService.refresh(refreshToken));
    }

    @Operation(summary = "登出")
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // JWT 无状态：客户端清除 token 即可。服务端可加黑名单（Redis）。
        return ApiResponse.success(null);
    }

    @Operation(summary = "当前用户")
    @GetMapping("/me")
    public ApiResponse<Long> me(@CurrentUser Long userId) {
        return ApiResponse.success(userId);
    }
}
```

### controller/UserController.java

```java
package {{basePackage}}.controller;

import {{basePackage}}.common.ApiResponse;
import {{basePackage}}.common.CurrentUser;
import {{basePackage}}.common.PageResponse;
import {{basePackage}}.dto.user.*;
import {{basePackage}}.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "用户列表")
    @GetMapping
    public ApiResponse<PageResponse<UserResponse>> list(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(PageResponse.from(userService.list(page, size)));
    }

    @Operation(summary = "用户详情")
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(userService.getById(id));
    }

    @Operation(summary = "创建用户")
    @PostMapping
    public ApiResponse<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        return ApiResponse.success(userService.create(req));
    }

    @Operation(summary = "修改个人资料")
    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateProfile(
        @CurrentUser Long userId,
        @Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.success(userService.updateProfile(userId, req));
    }

    @Operation(summary = "修改密码")
    @PutMapping("/password")
    public ApiResponse<Void> changePassword(
        @CurrentUser Long userId,
        @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(userId, req);
        return ApiResponse.success(null);
    }
}
```

### controller/SseController.java

```java
package {{basePackage}}.controller;

import {{basePackage}}.common.CurrentUser;
import {{basePackage}}.service.SseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Tag(name = "SSE 流式")
@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    @Operation(summary = "SSE 公共示例")
    @GetMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat() {
        return sseService.chat(null);
    }

    @Operation(summary = "SSE 鉴权示例")
    @GetMapping(value = "/chat/protected", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatProtected(@CurrentUser Long userId) {
        return sseService.chat(userId);
    }
}
```

### controller/UploadController.java

```java
package {{basePackage}}.controller;

import {{basePackage}}.common.ApiResponse;
import {{basePackage}}.common.CurrentUser;
import {{basePackage}}.dto.upload.UploadResponse;
import {{basePackage}}.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Tag(name = "文件上传")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @Operation(summary = "单文件上传")
    @PostMapping("/upload")
    public ApiResponse<UploadResponse> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.success(uploadService.upload(file));
    }

    @Operation(summary = "多文件上传")
    @PostMapping("/uploads")
    public ApiResponse<List<UploadResponse>> uploads(@RequestParam("files") MultipartFile[] files) throws IOException {
        return ApiResponse.success(uploadService.uploadMultiple(List.of(files)));
    }
}
```

### ApplicationTests.java

```java
package {{basePackage}};

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

### src/test/resources/application-test.yml

```yaml
# 测试环境使用 H2 内存数据库，无需外部 MySQL/PostgreSQL
spring:
  datasource:
    url: jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    username: sa
    password:
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
  flyway:
    enabled: false

jwt:
  secret: test-secret-must-be-at-least-32-bytes-long-ok
```

### src/main/resources/db/migration/V1__init_user.sql

```sql
-- Flyway 初始化 SQL
-- 仅当 FLYWAY_ENABLED=true 时执行

CREATE TABLE IF NOT EXISTS {{tablePrefix}}_user (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(64),
    email VARCHAR(128),
    phone VARCHAR(20),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_{{tablePrefix}}_user_username (username),
    UNIQUE KEY uk_{{tablePrefix}}_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### Dockerfile

```dockerfile
# 构建阶段
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# 运行阶段
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### docker-compose.yml（默认 MySQL）

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: {{project}}-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: {{project}}
      MYSQL_CHARACTER_SET_SERVER: utf8mb4
      MYSQL_COLLATION_SERVER: utf8mb4_unicode_ci
    ports:
      - "${DB_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: {{project}}-app
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy
    ports:
      - "${SERVER_PORT:-8080}:8080"
    environment:
      DB_HOST: mysql
      SPRING_PROFILES_ACTIVE: prod
    env_file:
      - .env

volumes:
  mysql_data:
```

### docker-compose.pg.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: {{project}}-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: root
      POSTGRES_DB: {{project}}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U root -d {{project}}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: {{project}}-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "${SERVER_PORT:-8080}:8080"
    environment:
      DB_HOST: postgres
      SPRING_PROFILES_ACTIVE: prod
    env_file:
      - .env

volumes:
  postgres_data:
```

### docker-compose.mongo.yml

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:7
    container_name: {{project}}-mongo
    restart: unless-stopped
    ports:
      - "${DB_PORT:-27017}:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: {{project}}-app
    restart: unless-stopped
    depends_on:
      mongo:
        condition: service_healthy
    ports:
      - "${SERVER_PORT:-8080}:8080"
    environment:
      DB_HOST: mongo
      SPRING_PROFILES_ACTIVE: prod
    env_file:
      - .env

volumes:
  mongo_data:
```

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.5</version>
        <relativePath/>
    </parent>

    <groupId>{{basePackage}}</groupId>
    <artifactId>{{project}}</artifactId>
    <version>1.0.0</version>
    <name>{{project}}</name>
    <description>{{project}} Spring Boot project generated by springboot-init-skill</description>

    <properties>
        <java.version>21</java.version>
        <jjwt.version>0.12.6</jjwt.version>
        <springdoc.version>2.6.0</springdoc.version>
    </properties>

    <dependencies>
        <!-- Web (Servlet + 静态资源) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- 校验 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- 数据库依赖：由 generate_project.py 根据 db_type 参数替换 -->
{{DB_DEPS}}

        <!-- Redis：由 generate_project.py 根据 redis 参数替换 -->
{{REDIS_DEP}}

        <!-- Flyway：由 generate_project.py 根据 db_type 参数替换 -->
{{FLYWAY_DEPS}}

        <!-- Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- JWT (jjwt 0.12.x) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- springdoc-openapi 2 -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>${springdoc.version}</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- 开发工具：热重载（dev 模式必需） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- H2：测试环境内存数据库 -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- 测试 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### README.md（生成项目）

```markdown
# {{project}}

> Spring Boot 项目骨架，由 springboot-init-skill 一键生成。

## 启动

```bash
# 1. 启动数据库（如选 MySQL）
docker-compose up -d

# 2. 修改 .env（已从 .env.example 复制）
#    ⚠️ 必须修改 JWT_SECRET 为随机值

# 3. 一键启动
./restart.sh dev      # Linux / macOS
restart.bat dev       # Windows
```

打开 http://localhost:8080/swagger-ui.html 查看接口文档。

## 项目结构

参见 [docs/project-guide.md](docs/project-guide.md)。

## 接口契约

参见 [api-contract.md](api-contract.md)。
```
