# {{PROJECT_NAME}} 版本锁定

本文件记录项目所选用各组件的版本，便于团队保持一致。

## 运行时

| 组件 | 版本 | 说明 |
|------|------|------|
| Java JDK | {{JAVA_VERSION}} | |
| Node.js | {{NODE_VERSION}} | |
| Python | {{PYTHON_VERSION}} | |
| Go | {{GO_VERSION}} | |

## Web 框架

| 组件 | 版本 | 说明 |
|------|------|------|
| Spring Boot | {{SPRING_BOOT_VERSION}} | |
| Express | {{EXPRESS_VERSION}} | |
| NestJS | {{NESTJS_VERSION}} | |
| FastAPI | {{FASTAPI_VERSION}} | |
| Gin | {{GIN_VERSION}} | |

## 数据库与中间件

| 组件 | 版本 | 说明 |
|------|------|------|
| Database | {{DATABASE_KIND}} {{DATABASE_VERSION}} | |
| Redis | {{REDIS_VERSION}} | 可选 |
| Kafka | {{KAFKA_VERSION}} | 可选 |

## 选择记录

- 选择时间：{{DATE}}
- 选择原因：
  - 运行时：{{RUNTIME_REASON}}
  - 框架：{{FRAMEWORK_REASON}}
  - 数据库：{{DATABASE_REASON}}

> 如需升级版本，请同步更新本文件、Dockerfile、docker-compose.yml 以及 CI/CD 配置。
