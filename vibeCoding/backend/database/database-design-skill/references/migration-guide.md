# 数据库迁移指南

本文件说明各技术栈推荐的数据库迁移方案。开发阶段可使用 ORM 自动建表，但生产环境必须使用显式迁移。

## 通用原则

1. **开发环境**：可用 ORM 自动同步（`ddl-auto: update` / `synchronize: true` / `AutoMigrate`）。
2. **生产环境**：必须禁用自动同步，使用显式迁移脚本。
3. **版本控制**：迁移文件必须提交到仓库。
4. **回滚**：每个迁移都应能回滚（down/rollback）。

## 各技术栈方案

### Java + Spring Boot

推荐 **Flyway** 或 **Liquibase**。

#### Flyway 配置

在 `pom.xml` 添加依赖：

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

关闭 JPA 自动建表：

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
    locations: classpath:db/migration
```

迁移文件路径：`src/main/resources/db/migration/V1__create_user_table.sql`

### Python + FastAPI

推荐 **Alembic**（已包含在依赖中）。

```bash
# 初始化（已提供 alembic 目录时无需执行）
alembic init alembic

# 创建迁移
alembic revision --autogenerate -m "create user table"

# 升级
alembic upgrade head

# 回滚一次
alembic downgrade -1
```

配置 `alembic.ini` 和 `alembic/env.py` 指向实际的数据库 URL。

### Node.js + NestJS / Express

使用 **TypeORM CLI**：

```bash
# 创建迁移
npx typeorm migration:create -n CreateUserTable

# 运行迁移
npx typeorm migration:run

# 回滚
npx typeorm migration:revert
```

生产环境关闭 `synchronize: true`。

### Go + Gin

使用 **GORM AutoMigrate** 仅用于开发。生产环境推荐使用：

- **golang-migrate/migrate**：工业标准
- **goose**：轻量易用

示例（golang-migrate）：

```bash
# 创建迁移
migrate create -ext sql -dir migrations create_user_table

# 运行迁移
migrate -database "postgres://user:pass@localhost/db" -path migrations up
```

## 生成项目的现状

生成的项目为便于快速启动，默认用 ORM 自动建表（`ddl-auto: update` / `synchronize: true` / `AutoMigrate` / `Base.metadata.create_all`）。这只适合开发：**上线前必须按上面各栈方案切到显式迁移**，并把自动同步关掉。
