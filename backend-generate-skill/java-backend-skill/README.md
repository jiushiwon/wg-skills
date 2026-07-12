# java-backend-skill

现场生成 **Java + Spring Boot** 后端项目骨架。

## 适合场景

- 企业级、复杂业务、长生命周期系统
- 团队熟悉 Java
- 需要强类型、成熟生态、易招人

## 触发关键词

`用 Java 写后端`、`Spring Boot 项目`、`生成 Spring Boot`、`java backend`、`springboot 骨架`、`maven spring 项目`

## 输入

- 项目名、包名（默认 `com.wg.<project>`）
- 数据库（PostgreSQL 默认 / MySQL）
- 表前缀（默认 `wg`）
- 核心实体（从 spec.md 读取，或现场问）
- 是否需要 Redis / Kafka 等中间件（YAGNI）

## 输出

```
{{project}}/
├── src/main/java/{{base}}/
│   ├── Application.java
│   ├── controller/  service/  repository/  entity/  dto/
│   ├── common/  config/
├── src/main/resources/application.yml
├── pom.xml  mvnw  Dockerfile  docker-compose.yml
├── .env.example  .gitignore  README.md
├── api-contract.md  versions.md  CLAUDE.md  AGENTS.md
```

内置：统一响应 `ApiResponse`（`ResponseAdvice` 自动包装）、全局异常 `GlobalExceptionHandler`、JWT 过滤器（白名单 + 信封直写）、请求日志拦截器、Jakarta Validation、分页列表、`/api/health`。Redis / Kafka / RabbitMQ / Actuator 等中间件按需按 `references/middleware.md` 接入。

## 强制交付物（文档）

生成项目时与代码同时落地两份文档，缺一不可：

| 文档 | 位置 | 内容 |
|------|------|------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 技术栈、启动方式、如何对接前端（uni-app / axios）、接口范式、拦截器链路（CORS→JwtFilter→日志→校验→ResponseAdvice→异常兜底）、出入参范式、鉴权范式、错误码、拓展指南（加模块/加中间件/Flyway 迁移） |
| 接口契约（接口 md） | 根目录 `api-contract.md` | 全部接口字段级定义，前后端唯一事实来源 |

模板：`backend-convention-skill/references/project-guide-template.md`（栈特定段按本 skill `references/skeleton.md` 末尾「project-guide 填充段」填）+ `default-api-contract.md`（已含 health/auth/users 全量接口，按实体追加）。

## 调用样例

```
你：用 Java 写一个电商后端，要 MySQL

AI（java-backend-skill）：
  选型：Java + Spring Boot + MySQL。
  ① 核心实体？（默认 users/products/orders/order_items/addresses）
  ② 是否需要 Redis / Kafka？

你：实体默认，要 Redis。

AI：正在生成项目 shop/：
  - pom.xml、mvnw、application.yml、Dockerfile、docker-compose.yml（MySQL 改名）
  - 统一响应、全局异常、JWT、请求日志、分页
  - User/Product/Order/OrderItem/Address 的 entity/dto/repository/service/controller
  - api-contract.md、versions.md、AGENTS.md
  正在 ./mvnw compile && curl /api/health ...
  ✓ 构建通过
```

## 版本获取

不写死版本号。生成时按优先级：本机 `java -version` → Spring Initializr / Maven Central 查最新稳定 → 你覆盖 → 写入 `versions.md`。

## 验证

```bash
./mvnw compile
./mvnw spring-boot:run
curl http://localhost:8080/api/health
```

## 与其他 skill 的关系

- 规范引用 `backend-convention-skill`（不复制）
- 数据库/schema/迁移引用 `database-skill`

## 不做

- 不引 MongoDB（关系型默认 PostgreSQL / MySQL）
- 不加未请求的中间件
- 不锁定版本号
- 不替你提交
