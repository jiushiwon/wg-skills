# 技术栈识别规则（Step 0）

> ⚠️ **目录名不可信**：目录叫 `xxx-back` 也可能是前端项目（实测案例：某 `*-back` 目录 package.json 全是 uni-app 依赖）。识别**必须**以构建文件内容为唯一证据，严禁按目录名/项目名猜测。

## 1. 语言识别（按标志文件）

| 语言 | 标志文件 | 说明 |
|------|----------|------|
| Java | `pom.xml` / `build.gradle` / `build.gradle.kts` / `settings.gradle` | 多模块项目每个子模块都可能有自己的构建文件 |
| Go | `go.mod` / `go.sum` | 第一行 `module xxx` 是模块名 |
| Python | `requirements.txt` / `pyproject.toml` / `Pipfile` / `setup.py` / `poetry.lock` | pyproject 优先于 requirements |
| Node.js | `package.json` / `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` | lock 文件判断包管理器 |

> 混合项目（如 Java 主项目 + Python 脚本服务）逐目录识别，分别记录。

## 2. 框架识别（依赖特征）

### Java

| 依赖特征 | 结论 |
|----------|------|
| `spring-boot-starter-web` | Spring Boot（Web） |
| `spring-cloud-*` / `spring-cloud-starter-*` | Spring Cloud 微服务 |
| `dubbo` / `spring-boot-starter-dubbo` | Dubbo RPC |
| `spring-boot-starter-webflux` | WebFlux 响应式 |
| `javax.servlet` / 无 spring-boot | 传统 Spring MVC / Servlet |

版本提取：pom.xml 的 `<parent><version>` 或 `<spring-boot.version>`；gradle 的 `org.springframework.boot` 插件版本。

### Go

| 依赖特征 | 结论 |
|----------|------|
| `github.com/gin-gonic/gin` | Gin |
| `github.com/labstack/echo` | Echo |
| `github.com/go-kratos/kratos` | Kratos（微服务） |
| `google.golang.org/grpc` | gRPC 服务 |
| `github.com/gorilla/mux` / `net/http` 为主 | 标准库/Gorilla |

版本提取：`go.mod` 的 `go 1.xx` 行。

### Python

| 依赖特征 | 结论 |
|----------|------|
| `fastapi` | FastAPI |
| `django` | Django（含 `djangorestframework` 则 DRF） |
| `flask` | Flask |
| `tornado` / `sanic` / `aiohttp` | 对应异步框架 |
| `grpcio` | gRPC 服务 |

版本提取：requirements/pyproject 中的 pin 版本。

### Node.js

| 依赖特征 | 结论 |
|----------|------|
| `@nestjs/core` | NestJS |
| `express` | Express |
| `koa` | Koa |
| `fastify` | Fastify |
| `hapi` / `@hapi/hapi` | Hapi |
| `egg` / `egg-*` 插件（egg-mongoose、egg-redis 等） | Egg.js（阿里，约定优于配置：app/router.js + app/controller + config/config.default.js） |

版本提取：package.json 的 dependencies 版本 + engines.node。

## 3. ORM / 数据访问识别

| 语言 | 依赖特征 | ORM |
|------|----------|-----|
| Java | `mybatis-spring-boot-starter` / `mybatis-plus-boot-starter` | MyBatis / MyBatis-Plus |
| Java | `spring-boot-starter-data-jpa` / `hibernate-core` | JPA / Hibernate |
| Java | `spring-boot-starter-jdbc` / `jooq` | JdbcTemplate / jOOQ |
| Go | `gorm.io/gorm` | GORM |
| Go | `entgo.io/ent` | Ent |
| Go | `github.com/jmoiron/sqlx` | sqlx |
| Python | `sqlalchemy` | SQLAlchemy |
| Python | `django` | Django ORM |
| Python | `tortoise-orm` / `peewee` | 对应 ORM |
| Python | `beanie` / `motor` / `pymongo` | MongoDB ODM/驱动（Beanie=ODM，Motor=异步驱动，二者常搭配） |
| Node | `prisma` / `@prisma/client` | Prisma |
| Node | `typeorm` | TypeORM |
| Node | `sequelize` | Sequelize |
| Node | `mongoose` | Mongoose（MongoDB ODM） |
| Node | `knex` / `drizzle-orm` | Knex / Drizzle |

## 4. 数据库类型识别（连接配置证据）

| 配置/依赖特征 | 数据库 |
|---------------|--------|
| `jdbc:mysql:` / `mysql-connector` / `mysql2`(Node) / `mysqlclient` / `go-sql-driver/mysql` | MySQL |
| `jdbc:postgresql:` / `pg`(Node) / `psycopg2` / `lib/pq` / `pgx` | PostgreSQL |
| `mongodb` / `spring-boot-starter-data-mongodb` / `mongo-driver` | MongoDB |
| `jdbc:oracle:` / `oracledb` | Oracle |
| `jdbc:sqlserver:` / `mssql` | SQL Server |
| `sqlite3` / `better-sqlite3` / `modernc.org/sqlite` | SQLite |

配置位置：`application.yml/properties`、`config/*.yaml`、`.env`、`settings.py`、`database.yml`。

## 5. 识别结果记录格式

```
语言：Java 17（证据：pom.xml <java.version>17</java.version>）
框架：Spring Boot 3.2.1 + Spring Cloud 2023.0（证据：pom.xml parent）
构建：Maven 多模块（证据：pom.xml packaging=pom + 4 个 module）
ORM：MyBatis-Plus 3.5.5（证据：mybatis-plus-boot-starter）
数据库：MySQL 8（证据：jdbc:mysql://...:3306/xxx）
```
