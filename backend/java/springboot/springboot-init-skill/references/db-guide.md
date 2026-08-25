# 数据库配置指南

本 skill 支持四种数据库模式：MySQL（默认）、PostgreSQL、MongoDB、不使用数据库。所有配置统一通过 `.env` 切换，无需修改代码。

## 数据库选择矩阵

| 数据库 | 适用场景 | 驱动 | ORM |
|--------|---------|------|-----|
| MySQL | 通用 Web 应用、生态成熟 | `mysql-connector-j` | Spring Data JPA |
| PostgreSQL | 复杂查询、JSON 字段、强事务 | `org.postgresql:postgresql` | Spring Data JPA |
| MongoDB | 文档型、半结构化、IoT | `mongodb-driver-sync` | Spring Data MongoDB |
| 无数据库 | 纯工具服务、纯静态文件 | — | — |

## MySQL（默认）

### 启动容器

`docker-compose.yml`（已在 skeleton 落地）：

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: {{project}}-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: {{project}}
      MYSQL_CHARACTER_SET_SERVER: utf8mb4
      MYSQL_COLLATION_SERVER: utf8mb4_unicode_ci
    ports:
      - "${DB_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
volumes:
  mysql_data:
```

启动：

```bash
docker-compose up -d
```

### .env 配置

```bash
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME={{project}}
DB_USERNAME=root
DB_PASSWORD=root
```

### pom.xml 依赖

```xml
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>
```

### 字符集

MySQL 8.0 默认 utf8mb4，无需额外配置。如连接失败：

```
url: jdbc:mysql://localhost:3306/db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
```

## PostgreSQL

### 启动容器

`docker-compose.pg.yml`：

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: {{project}}-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: root
      POSTGRES_DB: {{project}}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

启动：

```bash
docker-compose -f docker-compose.pg.yml up -d
```

### .env 配置

```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME={{project}}
DB_USERNAME=root
DB_PASSWORD=root
JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect
```

### pom.xml 依赖

```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

## MongoDB

### 启动容器

`docker-compose.mongo.yml`：

```yaml
services:
  mongo:
    image: mongo:7
    container_name: {{project}}-mongo
    restart: unless-stopped
    ports:
      - "${DB_PORT:-27017}:27017"
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

启动：

```bash
docker-compose -f docker-compose.mongo.yml up -d
```

### .env 配置

```bash
DB_TYPE=mongo
DB_HOST=localhost
DB_PORT=27017
DB_NAME={{project}}
```

### pom.xml 依赖（替换 spring-boot-starter-data-jpa）

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

### 实体示例

MongoDB 模式 `entity/User.java`：

```java
@Document(collection = "users")
@Data
public class User {
    @Id
    private String id;  // MongoDB 用 String id

    private String username;
    private String password;
    private String nickname;
    // ...
}
```

`repository/UserRepository.java`：

```java
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
}
```

> ⚠️ MongoDB 模式下 `application.yml` 中 `spring.jpa.*` 配置应删除，避免冲突。

## 无数据库模式

不需要任何数据库的服务（纯 API 转发、静态文件、定时任务等）：

### .env 配置

```bash
DB_TYPE=none
```

### pom.xml

删除所有数据库相关依赖（`spring-boot-starter-data-jpa` / `spring-boot-starter-data-mongodb` / 数据库驱动）。

### application.yml

删除 `spring.datasource.*` 和 `spring.jpa.*` 整段。

## 数据库切换注意事项

1. **切换数据库类型必须重新生成项目**——`scripts/generate_project.py` 按 `DB_TYPE` 决定依赖与配置。
2. **JPA 自动建表**（`ddl-auto: update`）仅用于开发，生产环境务必开启 Flyway。
3. **表名前缀**通过 `DB_TABLE_PREFIX=wg` 控制（默认 `wg`），生成实体的 `@Table(name = "wg_user")` 由脚本替换。
4. **时区**：MySQL 必须 `serverTimezone=Asia/Shanghai`，否则日期字段差 8 小时。