# 环境变量配置指南

所有可配置项必须通过环境变量注入，禁止在代码中硬编码密码、端口、数据库地址等。

## 必备变量

### 服务基础

| 变量名 | 示例 | 说明 |
|--------|------|------|
| APP_NAME | my-app | 应用名称 |
| APP_PORT | 8080 | 服务端口 |
| APP_ENV | development | 运行环境：development / staging / production |
| APP_LOG_LEVEL | info | 日志级别 |

### 数据库

| 变量名 | 示例 | 说明 |
|--------|------|------|
| DB_TYPE | postgres | 数据库类型：`postgres`（或 `postgresql`，Python SQLAlchemy 方言用 `postgresql`）/ `mysql`（Python 方言用 `mysql+pymysql`）/ `mongodb`（仅 Node / Python 栈） |
| DB_HOST | localhost | 数据库主机（MongoDB 用 DB_URL 时可忽略） |
| DB_PORT | 5432 | 数据库端口：PG 5432 / MySQL 3306 / Mongo 27017 |
| DB_NAME | my_app_db | 数据库名（MySQL 默认 `app_db`） |
| DB_USER | postgres | 用户名（MySQL 官方镜像禁 root 作 MYSQL_USER，用 `app`） |
| DB_PASSWORD | secret | 密码 |
| DB_PREFIX | wg | 表/集合前缀 |
| DB_URL | jdbc:mysql://localhost:3306/my_app_db | （可选）完整连接串。Java 选 MySQL 时覆盖 JDBC URL；选 MongoDB 时必填 `mongodb://host:27017/<db>` |

### JWT（必备，四栈统一）

| 变量名 | 示例 | 说明 |
|--------|------|------|
| JWT_SECRET | （必填） | HMAC 签名密钥，生产必须经密钥管理注入；本地开发可用 `change-me` 占位 |
| JWT_EXPIRES_IN | 86400 | Token 有效期，**单位统一为秒**，默认 86400（24h）。各栈禁止另造毫秒/分钟变量 |

> 四栈骨架统一只认这两个变量名。JWT 签发/携带规则（登录签发、`Authorization: Bearer`）见 SKILL.md 红线。

### 可选：Redis

| 变量名 | 示例 | 说明 |
|--------|------|------|
| REDIS_HOST | localhost | Redis 主机 |
| REDIS_PORT | 6379 | Redis 端口 |
| REDIS_PASSWORD | secret | 密码（可选） |
| REDIS_DB | 0 | 数据库索引 |

### 可选：Kafka

| 变量名 | 示例 | 说明 |
|--------|------|------|
| KAFKA_BROKERS | localhost:9092 | Broker 列表 |
| KAFKA_CONSUMER_GROUP | my-app-group | 消费组 |

### 可选：对象存储

| 变量名 | 示例 | 说明 |
|--------|------|------|
| S3_ENDPOINT | http://localhost:9000 | MinIO/S3 端点 |
| S3_ACCESS_KEY | minioadmin | Access Key |
| S3_SECRET_KEY | minioadmin | Secret Key |
| S3_BUCKET | my-bucket | Bucket 名称 |

## 配置加载方式

### Java (Spring Boot)

`application.yml`：

```yaml
server:
  port: ${APP_PORT:8080}

spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME}}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
```

### Python (FastAPI)

`app/config.py`：

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    app_name: str = "my-app"
    app_port: int = 8080
    db_type: str = "postgresql"          # postgres/mysql/mongodb；SQLAlchemy 方言见下
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "app_db"
    db_user: str = "postgres"
    db_password: str = "postgres"
    db_prefix: str = "wg"
    db_url: str | None = None            # mongodb://... 或显式覆盖
    cors_origins: str = "*"              # 逗号分隔；* 仅开发
    jwt_secret: str = "change-me"        # 环境变量 JWT_SECRET
    jwt_expires_in: int = 86400          # 秒，环境变量 JWT_EXPIRES_IN

settings = Settings()
```

> `db_type` 的值是语义类型；拼 SQLAlchemy 连接串时再映射方言（`postgres→postgresql`、`mysql→mysql+pymysql`）。选 `mongodb` 时读 `db_url`，SQLAlchemy 整路不走。

### Node.js (NestJS)

`src/config/database.config.ts`：

```typescript
export default registerAs('database', () => ({
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));
```

### Go (Gin)

`internal/config/config.go`：

```go
type Config struct {
    AppPort      string `env:"APP_PORT" envDefault:"8080"`
    DBType       string `env:"DB_TYPE" envDefault:"postgres"`
    DBHost       string `env:"DB_HOST" envDefault:"localhost"`
    DBPort       string `env:"DB_PORT" envDefault:"5432"`
    DBName       string `env:"DB_NAME" envDefault:"app_db"`
    DBUser       string `env:"DB_USER" envDefault:"postgres"`
    DBPass       string `env:"DB_PASSWORD" envDefault:"postgres"`
    DBPrefix     string `env:"DB_PREFIX" envDefault:"wg"`
    CORSOrigins  string `env:"CORS_ORIGINS" envDefault:"*"`
    JWTSecret    string `env:"JWT_SECRET,required"`
    JWTExpiresIn int    `env:"JWT_EXPIRES_IN" envDefault:"86400"` // 秒
}
```

## CORS 跨域策略

CORS 行为契约以本节为唯一来源，各栈按此实现，不得各自定默认值。

- **origin 来源**：读环境变量 `CORS_ORIGINS`（逗号分隔多 origin）；为空或 `*` 时按"允许全部"处理（仅开发）。
- **红线：禁止 `*` 与凭证同开**。`CORS_ORIGINS` 为 `*`/空时，回 `Access-Control-Allow-Origin: *` 且**不得**发 `Access-Control-Allow-Credentials: true`；为显式列表时，回显匹配上的 `Origin` 并允许 credentials。
- **生产**：必须显式配置 `CORS_ORIGINS=https://app.example.com,...`，禁止 `*`。
- **预检**：允许方法 `GET,POST,PUT,PATCH,DELETE,OPTIONS`；允许头 `Authorization,Content-Type,X-Request-Id`；暴露头 `X-Request-Id`。
- 未匹配 origin 不回写 `Access-Control-Allow-Origin`（浏览器自动拒绝）。

## .env.example 模板

```bash
# App
APP_NAME=my-app
APP_PORT=8080
APP_ENV=development
APP_LOG_LEVEL=info

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_app_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_PREFIX=wg
# MySQL：DB_TYPE=mysql DB_PORT=3306 DB_USER=app（官方镜像禁 root）；Java 另设 DB_URL=jdbc:mysql://localhost:3306/my_app_db
# MongoDB（仅 Node/Python）：DB_TYPE=mongodb DB_URL=mongodb://localhost:27017/my_app_db

# JWT（生产必须注入强随机密钥）
JWT_SECRET=change-me
JWT_EXPIRES_IN=86400

# CORS（逗号分隔多 origin；开发可 *，生产必须显式列）
CORS_ORIGINS=*

# Optional: Redis
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0

# Optional: Kafka
# KAFKA_BROKERS=localhost:9092
# KAFKA_CONSUMER_GROUP=my-app-group

# Optional: Object Storage
# S3_ENDPOINT=http://localhost:9000
# S3_ACCESS_KEY=minioadmin
# S3_SECRET_KEY=minioadmin
# S3_BUCKET=my-bucket
```

## 安全规则

1. `.env` 必须加入 `.gitignore`。
2. `.env.example` 可以提交，但所有敏感值必须为空或占位符（如 `JWT_SECRET=change-me`）。
3. 生产环境通过 CI/CD 或密钥管理服务注入变量，不提交真实值；`JWT_SECRET` 生产必须为强随机串（≥ 32 字节）。
4. CORS 禁止 `*` 与凭证同开；生产 `CORS_ORIGINS` 必须显式列 origin。
