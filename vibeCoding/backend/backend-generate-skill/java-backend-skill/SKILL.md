---
name: java-backend-skill
description: Use when the user wants to generate a Java + Spring Boot backend project, or when routed from backend-select-skill with Java chosen. Generates a runnable scaffold on the spot following backend-convention-skill. Triggers: "用 Java 写后端", "Spring Boot 项目", "生成 Spring Boot", "java backend", "springboot 骨架", "maven spring 项目".
---

# Java Backend Skill

现场生成 Spring Boot 后端项目骨架。

**依赖**：backend-convention-skill（规范）、database-skill（DB）。本 skill 只写 Spring Boot 特定骨架与片段，规则文本不复制。

## 版本获取（不写死）

优先级：本机已装版本 → 官方最新稳定/LTS → 用户可覆盖 → 写入 `versions.md`。

- JDK：`java -version`；否则查 `https://adoptium.net` 或 `https://endoflife.date/api/java.json`，取 LTS。
- Spring Boot：`curl https://start.spring.io/metadata/client`，返回 `bootVersions` 与 `java` 兼容列表。
- 依赖库：Maven Central，如 `https://search.maven.org/solrsearch/select?q=g:io.jsonwebtoken`。

**禁止**：在 SKILL.md 写"Java 17 / Spring Boot 3.2"等具体数字。

## 生成步骤

1. 从 `spec.md` 读项目名、包名、数据库、表前缀（默认 `wg`）。
2. 按 `references/skeleton.md` 的目录结构建文件。
3. 用下面最小片段生成关键文件，AI 扩写完整。
4. **落地两份强制交付物**（见下节），缺一不可。

## 强制交付物（文档）

生成项目时必须与代码**同时落地**两份文档，漏交视为生成未完成：

| 文档 | 位置 | 生成依据 |
|------|------|----------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 按 backend-convention-skill `references/project-guide-template.md`，栈特定段按本 skill `references/skeleton.md` 末尾「project-guide 填充段」填 |
| 接口契约（接口 md） | 项目根目录 `api-contract.md` | 以 backend-convention-skill `references/default-api-contract.md` 为起点（已含 health/auth/users 全量接口），按 `api-contract-spec.md` 模板追加业务实体接口 |

要求：
- `project-guide.md` 第 4~10 节（接口范式/入参/出参/拦截器链路/鉴权/对接前端/错误码）不得省略，这是前端对接的最低信息量。
- `api-contract.md` 必须覆盖骨架自带接口 + 确认的全部业务实体接口，每个接口按模板写全（描述/鉴权/参数表/请求示例/响应结构/响应示例/错误码）。
- 两份文档字段细节不重复：范式进 guide，字段进 contract。

## 关键文件最小片段

### pom.xml 依赖块

```xml
<dependencies>
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
  <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
  <dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><scope>runtime</scope></dependency>
  <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
  <dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-crypto</artifactId></dependency>
</dependencies>
```

### 统一响应

```java
public record ApiResponse<T>(int code, String message, T data) {
  public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(0, "success", data); }
  public static <T> ApiResponse<T> fail(int code, String message) { return new ApiResponse<>(code, message, null); }
}
```

### 业务异常与全局处理

```java
public class BusinessException extends RuntimeException {
  private final int code;
  public BusinessException(int code, String message) { super(message); this.code = code; }
  public int getCode() { return code; }
}

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(BusinessException.class)
  public ApiResponse<Void> handle(BusinessException e) { return ApiResponse.fail(e.getCode(), e.getMessage()); }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ApiResponse<Void> handle(MethodArgumentNotValidException e) {
    return ApiResponse.fail(-1001, e.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
  }

  @ExceptionHandler(Exception.class)
  public ApiResponse<Void> handle(Exception e) { return ApiResponse.fail(-2000, "系统繁忙，请稍后再试"); }
}
```

### 健康检查

```java
@RestController
@RequestMapping("/api/health")
public class HealthController {
  @GetMapping
  public Map<String, String> health() { return Map.of("status", "ok"); }
}
```

## 标准能力清单

生成项目必须内置以下能力，完整片段见 `references/skeleton.md` 的"开箱即用片段"节：

| 能力 | 关键文件 |
|------|----------|
| 统一响应 `{ code, message, data }` | `common/ApiResponse.java` + `ResponseAdvice.java` |
| 全局异常（-1001 / -2000） | `common/GlobalExceptionHandler.java` |
| JWT 签发 / 验证 / 当前用户注入 | `common/JwtUtil.java` + `JwtFilter.java` + `CurrentUserArgumentResolver.java` |
| 请求日志（requestId / method / path / status / duration） | `common/RequestLogInterceptor.java` |
| 参数校验 | Jakarta Validation，失败转 `-1001` |
| 分页列表 `{ page, pageSize, total, list }` | `controller/UserController.java` + `dto/PageResult.java` |
| CORS | `config/WebConfig.java` |
| 密码 bcrypt hash | `spring-security-crypto` |
| 健康检查 `/api/health` | `controller/HealthController.java` |
| Docker / docker-compose | `Dockerfile` + `docker-compose.yml` |
| 介绍 & 拓展性文档 | `docs/project-guide.md`（强制交付物，见上节） |
| api-contract.md（接口 md） | 项目根目录，以 convention `default-api-contract.md` 为起点按 `api-contract-spec.md` 补全 |

## 验证

```bash
./mvnw compile
./mvnw spring-boot:run
curl http://localhost:8080/api/health
```

预期：`{ "code": 0, "message": "success", "data": { "status": "ok" } }`

## 不做

- 不引 MongoDB（关系型默认 PostgreSQL / MySQL）。
- 不加未请求的中间件；用户要 Redis / Kafka / RabbitMQ / Actuator 时，按 `references/middleware.md` 接入（版本随 BOM，变量按 env-config-guide.md）。
- 不在 SKILL.md 锁定版本号（生成物 `versions.md` 写实际值；本 skill 不维护 boilerplate 与版本锁定文件，骨架现场生成）。
- 不替用户提交。
