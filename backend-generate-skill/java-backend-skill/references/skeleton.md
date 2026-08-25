# Java + Spring Boot 骨架

生成 Spring Boot 项目时按本骨架现场写代码。版本号一律不写，由 SKILL.md 的版本获取策略动态决定。

## 依赖（pom.xml）

- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa`
- 数据库驱动：`postgresql` 与 `mysql-connector-j` 都引入，运行时按 `DB_TYPE` 选
- `lombok`（optional）
- `spring-security-crypto`（密码 hash）
- `io.jsonwebtoken:jjwt-api / jjwt-impl / jjwt-jackson`（JWT）
- 生产迁移：`flyway-core`（按需）
- 测试：`spring-boot-starter-test`

## 目录结构

```
{{project}}/
├── .mvn/wrapper/            # Maven wrapper
├── src/main/java/{{base}}/
│   ├── Application.java
│   ├── controller/          # REST 控制器
│   ├── service/             # 业务逻辑
│   ├── repository/          # 数据访问（Spring Data JPA）
│   ├── entity/              # JPA 实体
│   ├── dto/                 # 请求/响应 DTO
│   ├── common/              # 统一响应、业务异常+全局处理、JWT、拦截器
│   └── config/              # Web/CORS 配置
├── src/main/resources/
│   ├── application.yml      # 引用 ${} 环境变量
│   └── db/migration/        # Flyway 迁移（生产）
├── src/test/                # 测试目录，按需创建
├── .env.example
├── .gitignore
├── docker-compose.yml       # PostgreSQL 默认
├── docker-compose.mysql.yml # MySQL 备选
├── Dockerfile
├── mvnw / mvnw.cmd
├── pom.xml
├── README.md
├── api-contract.md
└── versions.md
```

## 关键文件清单

| 文件 | 责任 |
|------|------|
| `Application.java` | Spring Boot 入口，`@SpringBootApplication` |
| `common/ApiResponse.java` | 统一响应 `{ code, message, data }`（实现 convention 信封） |
| `common/BusinessException.java` | 业务异常，带 `code + message` |
| `common/GlobalExceptionHandler.java` | `@RestControllerAdvice`，异常转信封 |
| `common/ResponseAdvice.java` | `ResponseBodyAdvice`，自动包装响应体 |
| `common/JwtUtil.java` | JWT 签发 / 解析 |
| `common/CurrentUser.java` + `CurrentUserArgumentResolver.java` | 当前用户注入 |
| `config/WebConfig.java` | 注册拦截器、参数解析器、CORS |
| `entity/User.java` | 示例实体（JPA） |
| `dto/CreateUserRequest.java` / `UserResponse.java` | DTO |
| `repository/UserRepository.java` | Spring Data JPA |
| `service/UserService.java` / `AuthService.java` | 业务逻辑 |
| `controller/UserController.java` / `AuthController.java` / `HealthController.java` | REST 接口 |

## application.yml 模板

```yaml
server:
  port: ${APP_PORT:8080}

# CORS：逗号分隔多 origin；* 仅开发（禁 *+凭证同开，见 WebConfig）
cors:
  origins: ${CORS_ORIGINS:*}

spring:
  application:
    name: ${APP_NAME:{{project}}}
  datasource:
    url: ${DB_URL:jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:app_db}}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate   # 生产用 validate + Flyway；开发可临时 update
    open-in-view: false
```

## 开箱即用片段

### 响应包装（唯一包装点）

`ResponseAdvice` 是全栈唯一信封包装点，**必须排除 `ApiResponse` 本身**，否则 `GlobalExceptionHandler` 返回的 `ApiResponse.fail(...)` 会被再包一层（双包违规）：

```java
@RestControllerAdvice
public class ResponseAdvice implements ResponseBodyAdvice<Object> {

  @Override
  public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
    Class<?> paramType = returnType.getParameterType();
    return !ApiResponse.class.isAssignableFrom(paramType)
        && !String.class.isAssignableFrom(paramType)
        && !byte[].class.isAssignableFrom(paramType);
  }

  @Override
  public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                ServerHttpRequest request, ServerHttpResponse response) {
    if (body instanceof ApiResponse) return body;
    return ApiResponse.ok(body);
  }
}
```

> 排除 `String` / `byte[]` 的原因：`String` 走 `text/plain` 转换器，强包信封会触发 `ClassCastException`；`byte[]` 用于文件下载等非 JSON 场景。这两类接口自觉不走信封（文件下载本身无信封语义）。

### JWT 工具

密钥与过期时间统一走环境变量 `JWT_SECRET` / `JWT_EXPIRES_IN`（秒，见 env-config-guide.md JWT 段）：

```java
@Component
public class JwtUtil {
  @Value("${JWT_SECRET}") private String secret;                 // 必填，本地可用 change-me 占位
  @Value("${JWT_EXPIRES_IN:86400}") private long expiresInSec;   // 秒，默认 24h

  public String generate(Long userId, String username) {
    Date now = new Date();
    return Jwts.builder()
      .subject(String.valueOf(userId))
      .claim("username", username)
      .issuedAt(now)
      .expiration(new Date(now.getTime() + expiresInSec * 1000))
      .signWith(Keys.hmacShaKeyFor(secret.getBytes()))
      .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes())).build()
      .parseSignedClaims(token).getPayload();
  }
}
```

### JWT 过滤器

**两条硬约束**：
1. Filter 在 DispatcherServlet 之前执行，抛出的异常**不会**被 `@RestControllerAdvice` 捕获——鉴权失败必须**自行写出信封 JSON**，否则破统一响应红线。
2. 无 Token 一律拒 `-1002`，靠白名单放行登录/注册/健康检查（白名单按项目扩展，不得整段放行 `/api/**`）。

```java
@Component
public class JwtFilter extends OncePerRequestFilter {
  private static final Set<String> WHITELIST =
      Set.of("/api/auth/login", "/api/auth/register", "/api/health");

  private final JwtUtil jwtUtil;
  private final ObjectMapper objectMapper;   // Spring 自带 Jackson

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return WHITELIST.contains(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String header = req.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      try {
        Claims claims = jwtUtil.parse(header.substring(7));
        req.setAttribute("currentUserId", Long.valueOf(claims.getSubject()));
        chain.doFilter(req, res);
        return;
      } catch (JwtException e) {
        writeError(res, -1002, "Token 无效或已过期");
        return;
      }
    }
    writeError(res, -1002, "未登录");
  }

  /** Filter 层异常不进 GlobalExceptionHandler，必须在这里直接产出信封 */
  private void writeError(HttpServletResponse res, int code, String message) throws IOException {
    res.setStatus(HttpServletResponse.SC_OK);
    res.setContentType("application/json;charset=UTF-8");
    res.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail(code, message)));
  }
}
```

### 请求日志拦截器

```java
@Component
public class RequestLogInterceptor implements HandlerInterceptor {
  private static final Logger log = LoggerFactory.getLogger(RequestLogInterceptor.class);

  @Override
  public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
    req.setAttribute("startTime", System.currentTimeMillis());
    req.setAttribute("requestId", UUID.randomUUID().toString().substring(0, 16));
    return true;
  }

  @Override
  public void afterCompletion(HttpServletRequest req, HttpServletResponse res, Object handler, Exception ex) {
    long duration = System.currentTimeMillis() - (long) req.getAttribute("startTime");
    log.info("[{}] {} {} {} {}ms", req.getAttribute("requestId"),
      req.getMethod(), req.getRequestURI(), res.getStatus(), duration);
  }
}
```

### 分页列表

```java
@GetMapping
public ApiResponse<PageResult<UserResponse>> list(
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "20") int pageSize) {
  if (page < 1) page = 1;            // 下限保护：page=0/负数会导致 PageRequest 抛 IllegalArgumentException
  if (pageSize > 100) pageSize = 100;
  Page<User> result = userRepository.findAll(PageRequest.of(page - 1, pageSize));
  List<UserResponse> list = result.getContent().stream().map(UserResponse::from).toList();
  return ApiResponse.ok(new PageResult<>(page, pageSize, result.getTotalElements(), list));
}

public record PageResult<T>(int page, int pageSize, long total, List<T> list) {}
```

### CORS 配置

策略以 backend-convention-skill `env-config-guide.md` 为唯一来源（读 `CORS_ORIGINS`，禁 `*`+凭证同开），按下面的写法实现，不得自行放宽：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Value("${cors.origins:*}")   // application.yml 中 cors.origins ← ${CORS_ORIGINS:*}
  private String corsOrigins;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    CorsRegistration reg = registry.addMapping("/api/**")
      .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
      .allowedHeaders("Authorization", "Content-Type", "X-Request-Id")
      .exposedHeaders("X-Request-Id");
    if ("*".equals(corsOrigins.trim())) {
      reg.allowedOriginPatterns("*").allowCredentials(false); // 红线：* 与凭证不同开
    } else {
      reg.allowedOrigins(corsOrigins.split("\\s*,\\s*")).allowCredentials(true);
    }
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new RequestLogInterceptor()).addPathPatterns("/api/**");
  }
}
```

## 关键约定

- 表名：`{DB_PREFIX}_user`（默认 `wg_user`），snake_case。
- 路由前缀：`/api`；健康检查 `GET /api/health` 返回 `{ code: 0, message: "success", data: { status: "ok" } }`。
- 校验：Jakarta Validation，失败由 `GlobalExceptionHandler` 转 `-1001`。
- 不引 MongoDB（关系型默认 PostgreSQL / MySQL）。

## project-guide 填充段

生成 `docs/project-guide.md` 时，按 backend-convention-skill `references/project-guide-template.md` 的占位符填入以下本栈内容：

| 占位符 | 本栈填充值 |
|--------|-----------|
| `{{STACK}}` | Java（LTS）+ Spring Boot + Spring Data JPA |
| `{{START_COMMAND}}` | `./mvnw spring-boot:run` |
| `{{DIRECTORY_TREE}}` | 上文「目录结构」节，填实际包名 |
| `{{LAYER_RESPONSIBILITY}}` | controller 接请求返数据；service 业务逻辑；repository 数据访问（Spring Data JPA）；entity 表映射；dto 出入参；common 信封/异常/JWT/拦截器；config CORS 与组件注册 |
| `{{MIDDLEWARE_CHAIN}}` | `CORS（WebConfig）→ JwtFilter 鉴权（白名单放行）→ RequestLogInterceptor 日志 → Jakarta Validation 校验 → Controller → Service → ResponseAdvice 信封包装 → GlobalExceptionHandler 异常兜底` |
| `{{VALIDATION_WAY}}` | DTO 上加 `@NotBlank`/`@Size` 等注解 + 控制器 `@Valid`，失败转 `-1001` |
| `{{ENVELOPE_WAY}}` | `ResponseAdvice`（ResponseBodyAdvice）统一包装，controller 只返数据；`ApiResponse` 本身/String/byte[] 不重复包装 |
| `{{MODULE_STEPS}}` | ① 更新 `api-contract.md` → ② `entity/Post.java` → ③ `dto/CreatePostRequest.java`、`PostResponse.java` → ④ `repository/PostRepository.java` → ⑤ `service/PostService.java` → ⑥ `controller/PostController.java`（`@RequestMapping("/api/posts")`）→ ⑦ 写 Flyway 迁移 → ⑧ `./mvnw compile` + curl 验证 |
| `{{MIDDLEWARE_STEPS}}` | 实现 `HandlerInterceptor`（或 `OncePerRequestFilter`）→ 在 `WebConfig` 注册并指定生效路径 → 注意顺序：鉴权类必须排在业务之前 |
| `{{MIGRATION_WAY}}` | Flyway：`src/main/resources/db/migration/V{n}__{desc}.sql`（含可回滚脚本），`ddl-auto: validate` |
| `{{EXTRA_MIDDLEWARE_WAY}}` | 按本 skill `references/middleware.md`（Redis/Kafka/RabbitMQ/Actuator），版本随 BOM，变量见 env-config-guide.md |
