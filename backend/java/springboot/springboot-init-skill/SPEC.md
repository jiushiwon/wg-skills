# springboot-init-skill 功能规格说明书

> 本文档描述 springboot-init-skill 的完整功能清单、生成内容、工作流程与技术细节。
>
> 三份文档分工：
> - `SKILL.md`：模型入口，短、准、狠，用于触发与红线；
> - `README.md`：用户说明书，侧重怎么用、怎么启动、生产注意什么；
> - `SPEC.md`：完整规格，用于维护、迭代、跨语言脚手架对齐时查阅。

---

## 一、技能定位

**一句话描述**：面向零基础用户的 Spring Boot 项目一键初始化技能。用户只需说"帮我搭一个 Spring Boot 项目"，即可在 30 秒内获得一个**立即可运行**的标准化 Web 服务骨架。

**目标用户画像**：

- 完全不懂 Spring Boot 配置的小白
- 刚学 Java Web 不知道怎么搭项目的初学者
- 需要快速原型验证的产品 / 设计师
- 团队要统一 Java 后端模板的 Tech Lead

**与现有技能的关系**：

```
backend-convention-skill    ← 规范层（响应信封、错误码、契约）
        ↓
java-backend-skill          ← 开发者导向（现场生成，开发者填细节）
        ↓
springboot-init-skill       ← 小白导向（一键完成，环境探测+脚本+默认配置）
```

---

## 二、核心能力清单

| # | 能力 | 对应 references | 说明 |
|---|------|------------------|------|
| 1 | **环境探测** | `env-setup.md` | JDK >= 17 LTS、Maven Wrapper 自动生成 |
| 2 | **自动安装** | `skeleton.md` + `startup-scripts.md` | 编译检查、依赖下载 |
| 3 | **一键启动/重启** | `startup-scripts.md` | `./restart.sh [dev\|prod]` |
| 4 | **开发模式** | `startup-scripts.md` | spring-boot-devtools 热重载 |
| 5 | **生产模式** | `startup-scripts.md` | 后台运行 + PID 管理 + 日志归档 |
| 6 | **SSE 流式** | `sse-guide.md` + `skeleton.md` | WebFlux `ServerSentEvent` |
| 7 | **文件上传** | `skeleton.md` | `/api/upload` + `/api/uploads` |
| 8 | **统一响应** | `skeleton.md` | `ResponseBodyAdvice` |
| 9 | **全局异常** | `skeleton.md` | `@RestControllerAdvice` |
| 10 | **JWT 鉴权** | `skeleton.md` | Spring Security 6 + jjwt 0.12.x |
| 11 | **安全头** | `middleware-guide.md` | X-Frame-Options / X-Content-Type-Options / CSRF |

---

## 三、生成流程详细规范

### 第一步：询问用户（最多 3 个问题）

| # | 问题 | 默认值 | 选项 |
|---|------|--------|------|
| 1 | 项目名叫什么？ | `my-springboot-app` | 任意合法目录名（小写、连字符） |
| 2 | 用哪个数据库？ | MySQL | MySQL / PostgreSQL / MongoDB / 不用 |
| 3 | 是否需要 Redis？ | 否 | 是 / 否 |

**禁止问题**（技术细节全自动选）：

- ❌ JDK 版本（自动查 LTS）
- ❌ Spring Boot 版本（自动查最新稳定版）
- ❌ ORM 选择（固定 JPA）
- ❌ 构建工具（固定 Maven）
- ❌ 包名（固定 `com.example.{project}`）
- ❌ 端口（固定 8080）

### 第二步：环境探测

按 `references/env-setup.md` 流程：

| 检查项 | 命令 | 失败处理 |
|--------|------|----------|
| JDK 是否安装 | `java -version` | 提示下载 Adoptium |
| JDK 版本 >= 17 | 解析版本号 | 提示升级 |
| Maven | 检查 `mvnw` 或 `mvn` | 自动生成 Maven Wrapper |
| 操作系统 | `uname` / `$env:OS` | 分平台生成脚本 |
| Docker（可选） | `docker --version` | 仅警告，不阻塞 |

### 第三步：生成项目骨架

按 `references/skeleton.md` 的目录结构与代码模板现场生成：

```
生成顺序（保证依赖顺序正确）：
1. 目录结构
2. pom.xml + application.yml + .env.example + .env + .gitignore
3. Application.java（入口）
4. common/*（ApiResponse / BusinessException / GlobalExceptionHandler / JwtUtil / PageRequest / PageResponse）
5. config/*（SecurityConfig / WebConfig / OpenApiConfig / CorsConfig）
6. entity/User.java
7. repository/UserRepository.java
8. dto/*（CreateUserRequest / UserResponse / LoginRequest / TokenResponse / UploadResponse / ErrorResponse）
9. service/*（UserService / AuthService / UploadService / SseService）
10. controller/*（HealthController / AuthController / UserController / SseController / UploadController）
11. resources/db/migration/（按需 Flyway V1__init.sql）
12. 启动脚本（restart.sh / restart.bat）
13. Docker 配置（Dockerfile + docker-compose*.yml）
14. 强制交付物（api-contract.md + docs/project-guide.md）
15. README.md
```

### 第四步：自动安装与启动

```bash
# 验证 Maven Wrapper
./mvnw --version

# 复制 .env（如不存在）
[ -f .env ] || cp .env.example .env

# 编译检查
./mvnw clean compile

# 检测数据库
docker --version  # 有则启动容器
docker-compose up -d  # 按 DB_TYPE 选 compose 文件

# 提示用户启动
echo "运行 ./restart.sh dev 开始开发"
```

### 第五步：交付清单

向用户输出标准化的交付清单（见 `SKILL.md` 第五步）。

---

## 四、生成项目目录结构

参见 `references/skeleton.md` 的「目录结构」小节。完整结构：

```
my-springboot-app/
├── .mvn/wrapper/                    # Maven Wrapper
├── src/main/java/com/example/myapp/
│   ├── Application.java             # Spring Boot 入口
│   ├── common/
│   │   ├── ApiResponse.java         # 统一响应 { code, message, data }
│   │   ├── BusinessException.java   # 业务异常（code + message）
│   │   ├── GlobalExceptionHandler.java  # @RestControllerAdvice 全局异常
│   │   ├── JwtUtil.java             # JWT 签发 / 解析（jjwt 0.12.x）
│   │   ├── JwtAuthenticationFilter.java  # JWT 拦截器
│   │   ├── PageRequest.java         # 分页请求 DTO
│   │   ├── PageResponse.java        # 分页响应 DTO
│   │   └── CurrentUser.java         # 当前用户注解
│   ├── config/
│   │   ├── SecurityConfig.java      # Spring Security 6 配置
│   │   ├── WebConfig.java           # CORS + 拦截器 + 参数解析器
│   │   ├── OpenApiConfig.java       # springdoc-openapi 配置
│   │   └── ResponseAdvice.java      # ResponseBodyAdvice 自动包装
│   ├── controller/
│   │   ├── HealthController.java    # GET /api/health
│   │   ├── AuthController.java      # 注册/登录/刷新
│   │   ├── UserController.java      # 用户 CRUD
│   │   ├── SseController.java       # SSE 流式
│   │   └── UploadController.java    # 文件上传
│   ├── service/
│   │   ├── UserService.java
│   │   ├── AuthService.java
│   │   ├── UploadService.java
│   │   └── SseService.java
│   ├── repository/
│   │   └── UserRepository.java      # Spring Data JPA
│   ├── entity/
│   │   └── User.java                # JPA 实体
│   └── dto/
│       ├── auth/                    # LoginRequest / RegisterRequest / TokenResponse
│       ├── user/                    # CreateUserRequest / UserResponse / UpdateProfileRequest / ChangePasswordRequest
│       └── upload/                  # UploadResponse / MultiUploadResponse
├── src/main/resources/
│   ├── application.yml              # 引用 ${ENV_VAR:default}
│   └── db/migration/                # Flyway 迁移（按需启用）
│       └── V1__init.sql
├── src/test/java/com/example/myapp/
│   └── ApplicationTests.java        # 默认上下文加载测试
├── uploads/                         # 文件上传目录
├── logs/                            # 日志目录
├── .env.example                     # 环境变量模板
├── .env                             # 环境变量（生成时自动创建）
├── .gitignore
├── docker-compose.yml               # 默认（MySQL）
├── docker-compose.pg.yml            # 可选 PostgreSQL
├── docker-compose.mongo.yml         # 可选 MongoDB
├── Dockerfile
├── mvnw / mvnw.cmd                  # Maven Wrapper（Linux/macOS + Windows）
├── restart.sh / restart.bat         # 一键启动（dev/prod 双模式）
├── pom.xml
├── README.md
├── api-contract.md                  # 接口契约（强制交付物）
└── docs/
    └── project-guide.md             # 项目指南（强制交付物）
```

---

## 五、技术选型与版本策略

### 5.1 技术栈

| 维度 | 选型 | 不写死的获取方式 |
|------|------|------------------|
| JDK | 17 LTS 起（默认 21） | `endoflife.date/api/java.json` 取 LTS |
| Spring Boot | 3.x 最新稳定 | `start.spring.io/metadata/client` 的 `bootVersions` |
| 构建 | Maven + Maven Wrapper | 自动生成 `mvnw` / `mvnw.cmd` |
| ORM | Spring Data JPA | — |
| 数据库驱动 | mysql-connector-j / postgresql / mongodb-driver-sync | Maven Central |
| 鉴权 | Spring Security 6 + jjwt 0.12.x | Maven Central |
| 文档 | springdoc-openapi 2.x | Maven Central |
| SSE | Spring WebFlux（spring-boot-starter-webflux） | — |
| 缓存 | Spring Data Redis（可选） | — |
| 迁移 | Flyway（按需） | — |
| 测试 | JUnit 5 + spring-boot-starter-test | — |
| Lombok | 可选 | — |

### 5.2 默认端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Spring Boot | 8080 | `SERVER_PORT` |
| MySQL | 3306 | `DB_PORT` |
| PostgreSQL | 5432 | `DB_PORT` |
| MongoDB | 27017 | `DB_PORT` |
| Redis（可选） | 6379 | `REDIS_PORT` |

### 5.3 默认数据库表前缀

- `wg`（可在 `.env` 中 `DB_TABLE_PREFIX` 修改）

### 5.4 默认 JWT 配置

| 配置 | 默认值 | 说明 |
|------|--------|------|
| `JWT_SECRET` | `change-me-please-use-openssl-rand-base64-32` | ⚠️ 必须修改 |
| `JWT_ACCESS_EXPIRE_MINUTES` | 60 | access token 过期时间 |
| `JWT_REFRESH_EXPIRE_DAYS` | 7 | refresh token 过期时间 |
| `JWT_ISSUER` | `springboot-app` | 签发者 |
| `JWT_HEADER` | `Authorization` | HTTP header |
| `JWT_PREFIX` | `Bearer ` | 前缀 |

---

## 六、接口契约规范

### 6.1 响应信封

所有 JSON 接口统一返回：

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

**错误响应**：

```json
{
  "code": -1001,
  "message": "参数校验失败",
  "data": {
    "errors": [
      { "field": "username", "message": "至少 4 字符" }
    ]
  }
}
```

### 6.2 错误码表

| 错误码 | 含义 | HTTP |
|--------|------|------|
| 0 | 成功 | 200 |
| -1001 | 参数校验失败 | 400 |
| -1002 | 未登录 | 401 |
| -1003 | 无权限 | 403 |
| -1004 | 资源不存在 | 404 |
| -1005 | 资源冲突 | 409 |
| -2000 | 系统异常 | 500 |
| -2001 | 数据库异常 | 500 |
| -2002 | 第三方服务异常 | 502 |

### 6.3 Token 注入

HTTP Header：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi...
```

### 6.4 SSE 响应头

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

格式：

```
data: {"content":"hello"}

data: {"content":"world"}

```

### 6.5 文件上传响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "/uploads/2026/08/21/abc123.png",
    "size": 102400,
    "mimeType": "image/png",
    "filename": "test.png"
  }
}
```

---

## 七、与前端联动规范

参见 `references/frontend-integration.md`。要点：

| 维度 | 后端实现 | 前端消费 |
|------|----------|----------|
| 响应信封 | `ResponseBodyAdvice` 自动包装 | `frontend-request-skill` 的 `ApiResponse<T>` |
| 错误码 | 全局异常处理器 | `ERROR_CODE_MAP` |
| Token | `Authorization: Bearer {token}` | 请求拦截器自动注入 |
| SSE | WebFlux `ServerSentEvent` | EventSource（H5）/ `enableChunked`（小程序） |
| 上传 | `multipart/form-data` | `upload<T>(options)` |

---

## 八、Docker 编排规范

### 8.1 默认 docker-compose.yml（MySQL）

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: myapp-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: myapp
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
volumes:
  mysql_data:
```

### 8.2 docker-compose.pg.yml（PostgreSQL）

参见 `references/db-guide.md`。

### 8.3 docker-compose.mongo.yml（MongoDB）

参见 `references/db-guide.md`。

---

## 九、安全规范

### 9.1 默认开启的安全头

| Header | 值 | 说明 |
|--------|-----|------|
| `X-Frame-Options` | `DENY` | 防点击劫持 |
| `X-Content-Type-Options` | `nosniff` | 防 MIME 嗅探 |
| `X-XSS-Protection` | `1; mode=block` | XSS 过滤 |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | HSTS |
| `Cache-Control` | `no-store` | 鉴权接口不缓存 |

### 9.2 CSRF

API 模式（前后端分离）默认关闭 CSRF（`csrf().disable()`）。

### 9.3 CORS

`.env` 中 `CORS_ORIGINS=*` 为开发默认值；生产环境必须设为具体域名（逗号分隔）。

### 9.4 密码存储

`BCryptPasswordEncoder`（Spring Security 默认）。

---

## 十、版本日志

### v1.0.0 (2026-08-21)

**初始版本** — 完整镜像 fastapi-init-skill 的能力清单。

详见 README.md 与各 references。

---

## 十一、引用文件

| 路径 | 内容 |
|------|------|
| `SKILL.md` | 模型入口（触发、红线、能力清单） |
| `README.md` | 用户说明书 |
| `references/skeleton.md` | 完整骨架代码模板（~1500 行） |
| `references/env-setup.md` | 环境探测 |
| `references/sse-guide.md` | SSE 集成 |
| `references/db-guide.md` | 数据库配置 |
| `references/db-schema-guide.md` | 表设计规范 |
| `references/middleware-guide.md` | Spring Security / 拦截器 / 异常处理 |
| `references/startup-scripts.md` | restart.sh / restart.bat |
| `references/api-contract-template.md` | 接口契约模板 |
| `references/project-guide-template.md` | 项目指南模板 |
| `references/frontend-integration.md` | 前端联动 |
| `scripts/generate_project.py` | canonical 生成器 |
| `demo/` | 完整可跑的 demo 项目 |
