---
name: springboot-init-skill
description: Spring Boot 项目一键初始化技能。面向零基础小白，提供环境探测、自动安装、完整 Web 骨架生成、SSE 流式框架、JWT 鉴权、统一响应封装、文件上传接口、一键启动/重启脚本、Swagger 文档，内置 MySQL（默认）/ PostgreSQL / MongoDB 数据库选择。用户只需说"帮我搭一个 Spring Boot 项目"即可一条命令完成从零到跑的完整链路。触发词："Spring Boot 脚手架"、"Spring Boot 一键生成"、"初始化 Spring Boot 项目"、"Spring Boot 快速开始"、"springboot init"、"搭建 Spring Boot 服务"、"Java Web 骨架"、"Spring Boot 开箱即用"、"Spring Boot 零基础"、"Spring Boot 小白"、"帮我搭一个 Spring Boot"、"新建 Spring Boot"、"create springboot project"、"springboot starter"。
---

# Spring Boot Init Skill

面向**完全不懂 Java 编程的小白**，一键生成标准化、开箱即用的 Spring Boot Web 服务骨架。

## 与 java-backend-skill 的区别

| 维度 | java-backend-skill | 本 skill |
|------|-------------------|----------|
| 目标用户 | 后端开发者 | 零基础小白 |
| 环境安装 | 用户自己装 | **自动检测 + 自动安装** |
| 启动方式 | mvn spring-boot:run | **一条命令：`./restart.sh [dev\|prod]`** |
| SSE 支持 | 无 | **内置 SSE 流式框架**（WebFlux） |
| 文件上传 | 基础 | **增强版 `/api/upload` 单文件 + `/api/uploads` 多文件** |
| 默认数据库 | PostgreSQL | **MySQL**（可选 PG / MongoDB / 无数据库） |
| ORM | Spring Data JPA | Spring Data JPA（不变） |
| 鉴权 | 无 | **Spring Security 6 + JWT（jjwt 0.12.x）** |
| 文档 | 无 | **springdoc-openapi 2（Swagger UI）** |
| 响应包装 | 手动 | **ResponseBodyAdvice 自动包装 `{ code, message, data }`** |
| 脚本 | 无 | **只生成 `restart.sh` / `restart.bat`（dev/prod 双模式）** |
| Swagger | 无 | 有 + **增强注释 + 中文说明** |
| 交互次数 | 多个技术问题 | **最多 3 个问题** |
| 文件数 | ~30 | **~25** |

**不重复造轮子**：统一响应信封、错误码、JWT 规范与 `backend-convention-skill` 对齐，模板已内置于本 skill（`references/api-contract-template.md`、`references/project-guide-template.md`），生成项目不依赖 `backend-convention-skill` 文件；关系型 DB 配置引用 `database-skill`；前端联动规范引用 `frontend-request-skill`。本 skill 在它们之上增加「小白友好」的完整封装。

## 依赖

- **backend-convention-skill**：响应信封 `{ code, message, data }`、错误码（-1001 校验 / -2000 系统）、JWT Bearer、api-contract、project-guide 规范对齐（模板已内置本 skill）
- **database-skill**：MySQL / PostgreSQL / MongoDB 选型规则、表前缀 `wg`、连接参数
- **java-backend-skill**：Spring Boot 骨架基础结构与 pom 依赖参考
- **frontend-request-skill**：前端请求层规范，确保后端生成的接口契约可直接被前端消费

## 核心能力清单（11 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **环境探测** | 自动检测 JDK 版本（>=17）、Maven、操作系统类型 |
| 2 | **自动安装** | 创建项目结构、生成 pom.xml、Maven wrapper、`.bat` UTF-8 BOM 编码 |
| 3 | **一键启动/重启** | `./restart.sh [dev\|prod]`：环境搭建、编译、安全停旧进程、启动、输出日志命令 |
| 4 | **开发模式** | `./restart.sh dev` 热重载（spring-boot-devtools），日志 `logs/dev.log` |
| 5 | **生产模式** | `./restart.sh prod` 后台运行，日志 `logs/app.log` |
| 6 | **SSE 流式** | 内置 Spring WebFlux `ServerSentEvent`，示例端点 `/api/sse/chat` |
| 7 | **文件上传** | 内置 `/api/upload` 单文件与 `/api/uploads` 多文件上传 |
| 8 | **统一响应** | `ResponseBodyAdvice` 自动包装 `{ code, message, data }` |
| 9 | **全局异常** | `@RestControllerAdvice` 统一处理 BusinessException / 校验异常 / 兜底异常 |
| 10 | **JWT 鉴权** | Spring Security 6 + jjwt 0.12.x：注册 / 登录 / 刷新令牌 / 当前用户注入 |
| 11 | **安全头** | 内置 Spring Security 配置：X-Frame-Options / X-Content-Type-Options / CSRF 关闭（API） |

## 生成流程

### 第一步：询问用户（只问 3 个问题）

```
1. 项目名叫什么？（默认 my-springboot-app）
2. 用哪个数据库？
   A. MySQL（默认，推荐）
   B. PostgreSQL
   C. MongoDB
   D. 暂时不用数据库
3. 是否需要 Redis？（默认不需要）
```

**不做**：不问技术细节、不问版本号、不问目录结构——全部自动选最佳实践。

### 第二步：环境探测

按 `references/env-setup.md` 流程执行：

1. 检测 JDK 是否安装 / 版本（需 >= 17 LTS）
2. 检测 Maven 是否可用（或生成 Maven Wrapper）
3. 检测操作系统（Linux / macOS / Windows）
4. 若未安装：给出明确的中文提示 + 下载链接（Adoptium / Oracle / Azul Zulu）
5. 若已安装但版本过低：给出升级指引

### 第三步：生成项目骨架

按 `references/skeleton.md` 的目录结构与代码模板，现场生成全部文件。维护者可用本 skill 根目录的 `scripts/generate_project.py` 作为 canonical 生成器参考，确保所有文件一次生成、编码正确（`.bat` 为 UTF-8 with BOM + CRLF）。

生成顺序：
1. 创建目录结构
2. 写入依赖与配置（`pom.xml`、`application.yml`、`.env.example`、`.env`、`.gitignore`）
3. 写入核心模块（`Application.java`、`application.yml`、`common/ApiResponse.java`、`common/BusinessException.java`、`common/GlobalExceptionHandler.java`、`common/JwtUtil.java`、`config/SecurityConfig.java`、`config/WebConfig.java`）
4. 写入业务模块（`entity` → `repository` → `service` → `controller`）
5. 写入启动脚本（`restart.sh` / `restart.bat`，dev/prod 双模式）
6. 写入 Docker 配置（`Dockerfile` + `docker-compose.yml` / `docker-compose.pg.yml` / `docker-compose.mongo.yml`，按需启用）
7. 写入强制交付物（`api-contract.md` + `docs/project-guide.md`）
8. 写入项目说明（`README.md`）

### 第四步：自动安装与启动

生成完成后：
1. 验证 Maven Wrapper 可用（`./mvnw --version`）
2. 从 `.env.example` 复制生成 `.env`（如不存在）
3. 编译检查（`./mvnw clean compile`）
4. 检测数据库是否可用，有 Docker 则自动启动数据库容器
5. 提示用户运行 `./restart.sh [dev|prod]` 或 `restart.bat [dev|prod]` 一键启动

### 第五步：交付清单

向用户汇报完整交付物：

```
✅ 项目 {{project}} 生成完毕！

📁 生成的文件（约 25 个）：
  - 核心模块：Application.java, application.yml, common/*, config/*
  - API 路由：health / auth / users / sse / upload
  - 启动脚本：restart.sh, restart.bat（dev/prod 双模式）
  - 数据库：MySQL（已配置 docker-compose.yml，可选 PG / MongoDB / 无数据库）
  - 文档：api-contract.md, docs/project-guide.md

🚀 启动方式：
  开发模式：  ./restart.sh dev        （热重载，日志 logs/dev.log）
  生产模式：  ./restart.sh prod       （后台运行，日志 logs/app.log）
  默认：      ./restart.sh            （同 dev）

📖 接口文档：
  Swagger UI：  http://localhost:8080/swagger-ui.html
  OpenAPI 3：   http://localhost:8080/v3/api-docs

🔌 SSE 示例：
  curl http://localhost:8080/api/sse/chat

📎 上传示例：
  curl -F "file=@test.png" http://localhost:8080/api/upload

🔑 默认账号：
  注册接口：POST /api/auth/register
  登录接口：POST /api/auth/login

⚠️ 安全提醒：
  请编辑 .env 文件修改 JWT_SECRET（搜索 change-me）
  生产环境务必使用随机密钥（至少 256 位）！
```

## 生成项目的目录结构

参见 `references/skeleton.md` 的「目录结构」小节。核心约定：

- 路由前缀：`/api`
- 认证路由：`/api/auth/*`
- SSE 路由：`/api/sse/*`
- 上传路由：`/api/upload`、`/api/uploads`
- 表前缀：`wg`（可在 `.env` 中修改）
- 应用端口：`8080`
- Swagger：`/swagger-ui.html`、`/v3/api-docs`
- 健康检查：`GET /api/health`

## 引用索引

| 文件 | 内容 |
|------|------|
| `scripts/generate_project.py` | canonical 项目生成器：从 `skeleton.md` / `startup-scripts.md` 提取模板并生成完整项目，保证 `.bat` 编码与文件完整性 |
| `references/skeleton.md` | 精简目录结构 + 核心文件代码模板（Application / common / config / controller / service / repository / entity / dto / upload） |
| `references/env-setup.md` | 环境探测流程、自动安装逻辑、常见问题排错 |
| `references/sse-guide.md` | SSE 流式框架集成方案、示例端点、客户端对接 |
| `references/db-guide.md` | 数据库选型、MySQL/PG/Mongo 连接配置、Docker 启动命令 |
| `references/db-schema-guide.md` | 数据库表设计规范（表名、字段、索引、软删除等） |
| `references/middleware-guide.md` | Spring Security 安全头 / 拦截器链 / CORS / 异常处理 |
| `references/startup-scripts.md` | `restart.sh` / `restart.bat` 脚本模板（dev/prod 双模式，一条命令完成编译、安全重启、日志输出） |
| `references/api-contract-template.md` | 生成项目根目录 `api-contract.md` 的模板，含 health/auth/users/sse/upload 全量接口 |
| `references/project-guide-template.md` | 生成项目 `docs/project-guide.md` 的模板，含栈说明、启动方式、拓展指南 |
| `references/frontend-integration.md` | 与 `frontend-request-skill` 的联动：响应信封、错误码、Token、SSE、上传对接 |

## 强制交付物

生成项目时必须同时落地两份文档，模板已内置本 skill：

| 文档 | 位置 | 说明 |
|------|------|------|
| 项目指南 | `docs/project-guide.md` | 按本 skill `references/project-guide-template.md` 生成，栈特定段填入本 skill 内容 |
| 接口契约 | `api-contract.md` | 以本 skill `references/api-contract-template.md` 为起点，含 health/auth/users/sse/upload 全量接口 |

## 红线（不可绕过）

1. **不做 java-backend-skill 已做的事**：不重复生成同样的骨架代码，本 skill 生成的是更完整、更小白友好的版本。
2. **不硬编码版本号**：JDK / Spring Boot / 依赖版本一律现场查询官方源最新稳定版（Adoptium、Spring Initializr、Maven Central）。
3. **不跳过环境探测**：生成前必须先检查用户环境，无法安装则给出明确提示。
4. **不强制安装系统级数据库**：若本机有 Docker，生成逻辑可自动拉起开发数据库容器（可选）；否则提供 `references/db-guide.md` 中的 Docker 命令，由用户自行启动。
5. **不替用户提交 git**。
6. **默认值必须安全**：`.env.example` 对 `JWT_SECRET` / `CORS` / `APP_DEBUG` 有醒目警告，Spring Security 安全头强制开启。
7. **所有注释、文档用中文**：目标用户是中文小白，不要英文注释。
8. **接口契约必须和 frontend-request-skill 对齐**：响应信封、错误码、字段命名前后端一致。
9. **`.env` 与 `.gitignore` 必须随脚手架一起生成，且 `.env` 中的配置必须被服务加载**：`application.yml` 通过 `${ENV_VAR:default}` 读取 `.env` 全部配置（Spring Boot 原生支持），禁止在代码中硬编码端口、数据库密码、JWT 密钥等运行时可变参数。

## 触发关键词清单

```
Spring Boot 脚手架、Spring Boot 一键生成、初始化 Spring Boot 项目、Spring Boot 快速开始、
springboot init、搭建 Spring Boot 服务、Java Web 骨架、Spring Boot 开箱即用、
Spring Boot 零基础、Spring Boot 小白、帮我搭一个 Spring Boot、新建 Spring Boot、
create springboot project、springboot starter
```

## 不做

- 不生成与 java-backend-skill 完全相同的骨架（本 skill 额外包含 SSE、上传、一键脚本、环境探测、安全头）
- 不询问技术细节（ORM 选择、目录结构等——全部自动选最佳实践）
- 不安装系统级依赖（如 MySQL Server），只提供 Docker 启动命令
- 不在 SKILL.md 锁定版本号
- 不替用户提交 git
- 不加未请求的中间件（如 Redis、Elasticsearch——除非用户明确说要）
