# springboot-init-skill

> 一键生成标准化、开箱即用的 Spring Boot Web 服务骨架。面向零基础小白。

## 一句话

> 用户说"帮我搭一个 Spring Boot 项目"，30 秒内拿到一个**立即可运行**的完整 Web 服务（数据库 + 鉴权 + SSE + 上传 + Swagger）。

## 适合场景

- 想学 Spring Boot 但被「项目结构」劝退的新人
- 需要快速搭建一个 demo / 原型 / 内部工具
- 团队要统一 Java 后端项目模板
- 不想自己写 pom.xml / 配置 Spring Security / 调 SSE / 包装响应

## 不适合场景

- 已有现成 Spring Boot 项目需要维护（请用 `backend-convention-skill` 的规范）
- 需要复杂微服务架构（请用 Spring Cloud 套件）
- 要定制 ORM、构建工具等非主流栈（请用 `java-backend-skill` 的生成器模式）

## 触发关键词

```
Spring Boot 脚手架、Spring Boot 一键生成、初始化 Spring Boot 项目、Spring Boot 快速开始、
springboot init、搭建 Spring Boot 服务、Java Web 骨架、Spring Boot 开箱即用、
Spring Boot 零基础、Spring Boot 小白、帮我搭一个 Spring Boot、新建 Spring Boot、
create springboot project、springboot starter
```

## 三步上手

```bash
# 1. 触发 skill
#    在 Claude Code 中说："帮我搭一个 Spring Boot 项目"

# 2. 回答 3 个问题
#    Q1: 项目名叫什么？（默认 my-springboot-app）
#    Q2: 用哪个数据库？（MySQL / PostgreSQL / MongoDB / 暂时不用）
#    Q3: 是否需要 Redis？（默认否）

# 3. 一键启动
./restart.sh dev        # Linux / macOS
restart.bat dev         # Windows
```

打开浏览器：

- `http://localhost:8080/swagger-ui.html` —— Swagger UI
- `http://localhost:8080/v3/api-docs` —— OpenAPI 3 JSON
- `http://localhost:8080/api/health` —— 健康检查

## 内置能力

| # | 能力 | 说明 |
|---|------|------|
| 1 | **环境探测** | JDK / Maven 自动检测 |
| 2 | **自动安装** | Maven wrapper、依赖下载 |
| 3 | **一键启动/重启** | `./restart.sh [dev\|prod]` |
| 4 | **开发模式** | spring-boot-devtools 热重载 |
| 5 | **生产模式** | 后台运行，日志归档 |
| 6 | **SSE 流式** | Spring WebFlux `ServerSentEvent` |
| 7 | **文件上传** | `/api/upload` 单文件 + `/api/uploads` 多文件 |
| 8 | **统一响应** | `ResponseBodyAdvice` 自动包装信封 |
| 9 | **全局异常** | `@RestControllerAdvice` 三类异常统一处理 |
| 10 | **JWT 鉴权** | Spring Security 6 + jjwt 0.12.x |
| 11 | **安全头** | X-Frame-Options / X-Content-Type-Options |

## 技术栈

| 维度 | 选型 |
|------|------|
| 语言 | JDK 17+ LTS（默认 21，不写死） |
| 框架 | Spring Boot 3.x（不写死） |
| 构建 | Maven + Maven Wrapper |
| ORM | Spring Data JPA |
| 数据库 | MySQL（默认）/ PostgreSQL / MongoDB |
| 缓存 | Spring Data Redis（可选） |
| 鉴权 | Spring Security 6 + jjwt 0.12.x |
| 文档 | springdoc-openapi 2（OpenAPI 3） |
| SSE | Spring WebFlux |
| 测试 | JUnit 5 + spring-boot-starter-test |

**版本获取策略**：现场查询 Adoptium / Spring Initializr / Maven Central，不在 SKILL.md 锁定任何具体版本号。

## 生成项目结构

```
my-springboot-app/
├── .mvn/wrapper/                # Maven Wrapper
├── src/main/java/com/example/myapp/
│   ├── Application.java
│   ├── common/                  # 统一响应 / 异常 / JWT
│   ├── config/                  # Security / Web / OpenAPI
│   ├── controller/              # REST 控制器
│   ├── service/                 # 业务逻辑
│   ├── repository/              # Spring Data JPA
│   ├── entity/                  # JPA 实体
│   └── dto/                     # 请求/响应 DTO
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/            # Flyway 迁移（按需）
├── src/test/                    # 测试目录
├── uploads/                     # 文件上传目录
├── logs/                        # 日志目录
├── .env.example                 # 环境变量模板
├── .env                         # 环境变量（生成时自动创建）
├── .gitignore
├── docker-compose.yml           # 默认（MySQL）
├── docker-compose.pg.yml        # 可选 PG
├── docker-compose.mongo.yml     # 可选 MongoDB
├── Dockerfile
├── mvnw / mvnw.cmd              # Maven Wrapper
├── restart.sh / restart.bat     # 一键启动（dev/prod）
├── pom.xml
├── README.md
├── api-contract.md              # 接口契约
└── docs/
    └── project-guide.md         # 项目指南
```

## 启动方式

### 开发模式（热重载）

```bash
./restart.sh dev
# 或
restart.bat dev
```

- 自动编译 + 启动
- 修改 `src/main/java/**` 自动重启
- 日志输出到 `logs/dev.log`
- `tail -f logs/dev.log` 实时跟踪

### 生产模式（后台）

```bash
./restart.sh prod
# 或
restart.bat prod
```

- 编译为 `target/*.jar`
- 后台运行（PID 写入 `app.pid`）
- 日志输出到 `logs/app.log`
- `tail -f logs/app.log` 实时跟踪
- 再次运行 `./restart.sh prod` 会安全停止旧进程后重启

### 默认模式

```bash
./restart.sh
```

等同于 `dev` 模式。

## 接口清单

| 路径 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/health` | GET | ❌ | 健康检查 |
| `/api/auth/register` | POST | ❌ | 注册 |
| `/api/auth/login` | POST | ❌ | 登录（返回 access + refresh token） |
| `/api/auth/refresh` | POST | ❌ | 刷新令牌 |
| `/api/auth/logout` | POST | ✅ | 登出 |
| `/api/auth/me` | GET | ✅ | 当前用户 |
| `/api/users` | GET | ✅ | 用户列表（分页） |
| `/api/users/{id}` | GET | ✅ | 用户详情 |
| `/api/users/profile` | PUT | ✅ | 修改个人资料 |
| `/api/users/password` | PUT | ✅ | 修改密码 |
| `/api/sse/chat` | GET | ❌ | SSE 流式示例 |
| `/api/sse/chat/protected` | GET | ✅ | SSE 受保护示例 |
| `/api/upload` | POST | ✅ | 单文件上传 |
| `/api/uploads` | POST | ✅ | 多文件上传 |
| `/swagger-ui.html` | GET | ❌ | Swagger UI |
| `/v3/api-docs` | GET | ❌ | OpenAPI 3 JSON |

## 数据库选择

| 数据库 | 启动命令 | 备注 |
|--------|---------|------|
| MySQL（默认） | `docker-compose up -d` | 端口 3306 |
| PostgreSQL | `docker-compose -f docker-compose.pg.yml up -d` | 端口 5432 |
| MongoDB | `docker-compose -f docker-compose.mongo.yml up -d` | 端口 27017 |
| 不用数据库 | 不启动 | 删除 `application.yml` 中 `spring.datasource.*` |

`.env` 文件中修改：

```bash
DB_TYPE=mysql           # mysql / postgres / mongo / none
DB_HOST=localhost
DB_PORT=3306
DB_NAME=myapp
DB_USERNAME=root
DB_PASSWORD=root
```

## 安全配置

### 默认值警告

`.env.example` 中所有敏感配置都有醒目注释，生成后**必须**修改：

```bash
# ⚠️ 生产环境务必修改为随机密钥（至少 256 位 / 32 字节）
JWT_SECRET=change-me-please-use-openssl-rand-base64-32

# ⚠️ 生产环境设为 false
APP_DEBUG=true

# ⚠️ 生产环境设为具体域名或关闭
CORS_ORIGINS=*
```

### 生成随机 JWT 密钥

```bash
# Linux / macOS
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 与其他技能的关系

| 技能 | 关系 |
|------|------|
| `java-backend-skill` | 嵌套子技能，提供现场生成 Spring Boot 骨架的能力（开发者导向）。本 skill 是零基础小白版，自动检测环境、一键启动脚本、更多默认配置 |
| `backend-convention-skill` | 规范层：响应信封、错误码、API 契约、项目指南规范。本 skill 模板已内置这些规范 |
| `database-skill` | 数据库选型与连接规范 |
| `frontend-request-skill` | 前端请求层规范。生成的接口契约可直接被前端消费（响应信封、Token、SSE、上传） |
| `fastapi-init-skill` | Python 平行技能，能力清单 1:1 镜像 |

## 版本获取策略（不写死）

- **JDK**：现场 `java -version`；否则查 `https://endoflife.date/api/java.json`，取 LTS（17 或 21）
- **Spring Boot**：现场 `curl https://start.spring.io/metadata/client`，取 `bootVersions` 最新稳定版
- **依赖库**：Maven Central，如 `https://search.maven.org/solrsearch/select?q=g:io.jsonwebtoken`

## 维护说明

- 修改 `SKILL.md` 的触发词必须同步更新本文件 + `references/api-contract-template.md`
- 新增接口必须同时更新 `references/skeleton.md` 与 `references/api-contract-template.md`
- 删除或重命名 references 文件时，检查 `SKILL.md` 的引用路径
- 本 skill 的生成器脚本 `scripts/generate_project.py` 是 canonical，从 markdown 提取代码模板生成完整项目

## 版本日志

### v1.0.0 (2026-08-21)

**初始版本**

- ✅ JDK 17+ LTS（默认 21，现场查询）
- ✅ Spring Boot 3.x（不写死）
- ✅ Spring Data JPA（默认）
- ✅ MySQL / PostgreSQL / MongoDB / 无数据库 四选一
- ✅ Spring Security 6 + jjwt 0.12.x 鉴权
- ✅ springdoc-openapi 2 接口文档
- ✅ SSE 流式（Spring WebFlux）
- ✅ 文件上传（单文件 + 多文件）
- ✅ 统一响应（ResponseBodyAdvice）
- ✅ 全局异常（@RestControllerAdvice）
- ✅ 一键启动脚本（restart.sh / restart.bat，dev/prod 双模式）
- ✅ Maven Wrapper
- ✅ Docker 编排（MySQL / PG / MongoDB 三套）
- ✅ 与 backend-convention-skill 规范对齐
- ✅ 与 frontend-request-skill 前端联动

## 仓库地址

`https://github.com/jiushiwon/wg-skills/tree/main/springboot-init-skill`
