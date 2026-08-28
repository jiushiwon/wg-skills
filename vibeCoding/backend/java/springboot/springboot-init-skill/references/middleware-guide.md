# 中间件与安全配置

涵盖 Spring Security 6、CORS、CSRF、安全头、拦截器、异常处理。

## 一、Spring Security 6 配置

`config/SecurityConfig.java`（已在 skeleton 落地）核心要点：

### 1.1 禁用 CSRF（API 模式）

```java
http.csrf(AbstractHttpConfigurer::disable)
```

> 前后端分离的 API 不需要 CSRF token（CSRF 仅针对 Cookie 自动鉴权的浏览器表单提交）。如果你的 API 同时被 SSR + Cookie 鉴权，需要单独实现 CSRF（如 `CookieCsrfTokenRepository.withHttpOnlyFalse()`）。

### 1.2 启用安全头

```java
http.headers(h -> h
    .frameOptions(f -> f.deny())             // 防点击劫持
    .contentTypeOptions(c -> {})             // X-Content-Type-Options: nosniff
    .xssProtection(x -> {})                  // X-XSS-Protection: 1; mode=block
);
```

### 1.3 CORS 配置

`SecurityConfig.corsConfigurationSource()`（已在 skeleton 落地）。`.env` 中 `CORS_ORIGINS` 控制：

```bash
# 开发
CORS_ORIGINS=*

# 生产（具体域名）
CORS_ORIGINS=https://app.example.com,https://admin.example.com
```

⚠️ 生产环境**禁止** `*`，必须设为具体域名。

### 1.4 放行路由

```java
.requestMatchers(HttpMethod.GET, "/api/health", "/api/sse/**").permitAll()
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
.requestMatchers("/uploads/**").permitAll()
.anyRequest().authenticated()
```

## 二、JWT 鉴权链

完整链路：

```
请求 → JwtAuthenticationFilter
     → SecurityContextHolder.setAuthentication(...)
     → Controller（@CurrentUser 拿 userId）
     → 业务方法
```

### 2.1 JwtAuthenticationFilter（已落地）

解析 `Authorization: Bearer {token}` → 验证 → 注入 `SecurityContext`。失败时**不抛异常**（放行给后续 Spring Security 处理）。

### 2.2 @CurrentUser 注解（已落地）

`common/CurrentUserArgumentResolver` 从 `SecurityContextHolder.getContext().getAuthentication().getPrincipal()` 取 userId。

```java
@GetMapping("/me")
public ApiResponse<Long> me(@CurrentUser Long userId) {
    return ApiResponse.success(userId);
}
```

未登录时 `resolveArgument` 抛 `BusinessException.unauthorized("未登录")`。

### 2.3 jjwt 0.12.x 注意事项

| 变化 | 旧 API | 新 API（0.12.x） |
|------|--------|------------------|
| 签名 | `signWith(SignatureAlgorithm.HS256, key)` | `signWith(key)` |
| 解析 | `parseClaimsJws(token)` | `parseSignedClaims(token)` |
| 获取 Payload | `getBody()` | `getPayload()` |
| Key 构造 | `Keys.secretKeyFor(SignatureAlgorithm.HS256)` | `Keys.hmacShaKeyFor(bytes)` |

> ⚠️ 0.12.x 必须保证 `secret` 至少 256 位（32 字节），否则启动时 `init()` 报警告。

## 三、响应统一封装

`config/ResponseAdvice.java`（已落地）通过 `ResponseBodyAdvice` 在 Controller 返回前自动包装 `ApiResponse`。

### 3.1 不会包装的情况

- 已手动包装的 `ApiResponse<T>`（不重复包装）
- `null`（包装为 `ApiResponse.success(null)`）
- `String` / `byte[]`（直接返回，避免 Jackson 错误）
- SSE `SseEmitter`（`supports` 返回 false）

### 3.2 与 GlobalExceptionHandler 协作

异常抛出会被 `GlobalExceptionHandler` 拦截并包装为 `ApiResponse`，**不再走 ResponseBodyAdvice**（因为异常处理返回的是 `ResponseEntity<ApiResponse<...>>`，不是从 Controller 方法返回值）。

## 四、请求日志

`config/LoggingFilter.java`（已落地）记录每条请求的方法、URI、状态码、耗时，并对包含 `auth/password/token/login/register` 的路径自动脱敏。

高并发场景下如需全链路追踪，可在此注入 MDC traceId：

```java
MDC.put("traceId", UUID.randomUUID().toString());
log.info("[请求] ...");
```

## 五、全局异常处理

`common/GlobalExceptionHandler.java`（已落地）主要异常：

| 异常类型 | HTTP | 错误码 | 场景 |
|---------|------|--------|------|
| `BusinessException` | 400/401/403/404/409 | 业务码 | 业务层显式抛 |
| `MethodArgumentNotValidException` | 400 | -1001 | `@Valid` 失败 |
| `ConstraintViolationException` | 400 | -1001 | `@Validated` 失败 |
| `DataIntegrityViolationException` | 409 | -1005 | 数据库唯一约束冲突 |
| `Exception` 兜底 | 500 | -2000 | 系统异常 |

`BusinessException` 静态工厂（已在 skeleton 落地）：

```java
BusinessException.badRequest(message)     // -1001
BusinessException.unauthorized(message)   // -1002
BusinessException.forbidden(message)      // -1003
BusinessException.notFound(message)       // -1004
BusinessException.conflict(message)       // -1005
```

## 五、密码加密

`SecurityConfig.passwordEncoder()` 返回 `BCryptPasswordEncoder`。Service 层调用：

```java
user.setPassword(passwordEncoder.encode(rawPassword));
passwordEncoder.matches(rawPassword, user.getPassword());
```

> 不要自定义 hash 算法，统一用 BCrypt（Spring Security 默认，自带 salt、cost=10）。

## 六、限流（拓展）

Spring Boot 3.x 推荐 Resilience4j：

```xml
<dependency>
  <groupId>io.github.resilience4j</groupId>
  <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
```

或 Bucket4j：

```xml
<dependency>
  <groupId>com.bucket4j</groupId>
  <artifactId>bucket4j_jdk17-core</artifactId>
  <version>8.x.x</version>
</dependency>
```

本 skill 默认**不引入限流**，需要时手动加。

## 七、企业级 Web / 高并发必配项

本 skill 默认已在 `application.yml` 中给出基础值，生产环境务必根据压测调整：

| 配置项 | 作用 | 生产建议 |
|--------|------|---------|
| `spring.datasource.hikari.maximum-pool-size` | 数据库连接池上限 | 一般设为 `(CPU 核数 * 2) + 有效磁盘数`，常见 20~50 |
| `spring.datasource.hikari.minimum-idle` | 最小空闲连接 | 设为 maximum-pool-size 的 1/4~1/2 |
| `spring.datasource.hikari.leak-detection-threshold` | 连接泄漏检测 | 60s，开发排查连接未释放 |
| `server.tomcat.threads.max` | Tomcat 工作线程上限 | 根据 CPU/IO 模型压测调整，默认 200 |
| `server.tomcat.accept-count` | 连接等待队列 | 高并发可适当增大 |
| `server.shutdown=graceful` | 优雅停机 | 必须开启，配合 `timeout-per-shutdown-phase` |
| `sse.timeout-ms` | SSE 连接超时 | 避免客户端断开后连接永久挂起 |
| `jwt.secret` | JWT 签名密钥 | 至少 32 字节随机串，启动时强校验 |

### JWT 黑名单（登出安全）

JWT 本身无状态，默认 `/api/auth/logout` 仅客户端清除 token。生产若需服务端登出，必须引入 Redis 并实现黑名单：

```java
// logout 时把 jti/过期时间写入 Redis Set
redisTemplate.opsForSet().add("jwt:blacklist", jti);
// JwtAuthenticationFilter 解析时检查黑名单
```

### 数据库连接池保活

HikariCP 默认已开启 `connectionTestQuery`，`max-lifetime` 建议小于数据库 `wait_timeout`（MySQL 默认 8 小时）。`leak-detection-threshold` 仅用于开发/压测排查泄漏，稳定后可关闭。