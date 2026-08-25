# 技术栈识别规则

本文件定义 `deploy-detect-skill` 识别各语言、框架、数据库、缓存/消息组件的依据与默认版本。

## 识别原则

- **高置信度**：存在明确标志性文件，且依赖声明清晰。
- **中置信度**：通过配置文件（`.env`、`config/`）推断。
- **低置信度**：源码出现关键字，但依赖未声明。

## 语言识别

| 语言 | 标志性文件 | 版本来源 | 默认版本 |
|------|-----------|----------|----------|
| Node.js | `package.json` | `engines.node` 或 `.nvmrc` | 22 |
| Java | `pom.xml` / `build.gradle` | `maven-compiler-plugin` / `sourceCompatibility` | 17 |
| Python | `requirements.txt` / `pyproject.toml` / `Pipfile` | `python_requires` / `[tool.poetry.dependencies]` | 3.11 |
| Go | `go.mod` | `go 1.xx` 指令 | 1.22 |
| Ruby | `Gemfile` / `.ruby-version` | `.ruby-version` | 3.x |
| PHP | `composer.json` | `require.php` | 8.x |

## Web 框架识别

| 框架 | 语言 | 识别依据 |
|------|------|----------|
| Express | Node.js | `package.json` dependencies 含 `express` |
| NestJS | Node.js | dependencies 含 `@nestjs/core` |
| Fastify | Node.js | dependencies 含 `fastify` |
| Koa | Node.js | dependencies 含 `koa` |
| FastAPI | Python | `requirements.txt` 含 `fastapi` |
| Django | Python | 含 `django` 或存在 `manage.py` |
| Flask | Python | 含 `flask` |
| Spring Boot | Java | `pom.xml` 含 `spring-boot-starter` |
| Gin | Go | `go.mod` 含 `github.com/gin-gonic/gin` |
| Echo | Go | `go.mod` 含 `github.com/labstack/echo` |
| Rails | Ruby | `Gemfile` 含 `rails` |
| Laravel | PHP | `composer.json` 含 `laravel/framework` |

## 前端框架 / 构建产物识别

| 框架 | 识别依据 | 构建产物目录 | 需要 Nginx |
|------|----------|-------------|-----------|
| Vue | dependencies 含 `vue` | `dist/` | 是 |
| Nuxt | dependencies 含 `nuxt` | `.output/` / `dist/` | 是（SSR 时另议） |
| React | dependencies 含 `react` | `build/` | 是 |
| Next.js | dependencies 含 `next` | `.next/` | 是（SSR 时需 Node 进程） |
| Angular | dependencies 含 `@angular/core` | `dist/<project>/` | 是 |
| Svelte | dependencies 含 `svelte` | `build/` / `.svelte-kit/` | 是 |
| 纯静态 | 存在 `index.html` 且无框架依赖 | `public/` 或根目录 | 是 |

> 命中前端产物时，在 `deploy-profile.md` 标注「需要反向代理（Nginx）」，下游 `static-nginx-skill` 会接管。

## 数据库识别

| 数据库 | 标志性线索 | 默认版本 |
|--------|-----------|----------|
| PostgreSQL | `pg` / `postgresql` / `DATABASE_URL=postgres://` / `psycopg` | 16 |
| MySQL | `mysql2` / `mysql` / `DB_URL=mysql://` / `pymysql` | 8.0 |
| MariaDB | `mariadb` | 11.x |
| MongoDB | `mongodb` / `mongoose` / `pymongo` | 7.0 |
| SQLite | `sqlite3` / `better-sqlite3` / `.db` 文件 | - |
| Redis | `redis` / `ioredis` / `REDIS_HOST` / `REDIS_URL` | 7 |

## 缓存 / 消息组件

| 组件 | 识别依据 |
|------|----------|
| Redis | dependencies 含 `redis` / `ioredis`，或 `.env` 含 `REDIS_*` |
| RabbitMQ | `amqplib` / `pika` / `RABBITMQ_*` |
| Kafka | `kafkajs` / `confluent-kafka` / `KAFKA_*` |
| Elasticsearch | `@elastic/elasticsearch` / `elasticsearch` / `ES_*` |

## Dockerfile / Compose 线索

- 存在 `Dockerfile`：读取 `FROM` 推断语言与版本（如 `FROM node:22-alpine`）。
- 存在 `docker-compose.yml`：读取 `services` 推断数据库/缓存镜像与版本（如 `postgres:16-alpine`、`redis:7`）。

> 这些线索可作为中/高置信度依据，但仍需用户确认是否为生产环境配置。
