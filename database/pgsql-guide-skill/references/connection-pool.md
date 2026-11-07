# PostgreSQL 连接池配置详解

> 连接池是数据库性能的基础。合理配置连接池可以避免连接风暴、减少延迟、提升吞吐量。

## 连接池大小计算公式

经典公式：`connections = (CPU核心数 * 2) + 有效磁盘数`

| 场景 | 推荐连接数 | 说明 |
|------|-----------|------|
| OLTP（短事务） | CPU核心数 * 2 | 事务短，连接快速释放 |
| OLAP（长查询） | CPU核心数 * 1 | 查询长，连接占用时间久 |
| 混合负载 | CPU核心数 * 1.5 | 折中方案 |

**关键原则**：连接数不是越多越好。过多连接会导致上下文切换开销和锁竞争。PostgreSQL 的 `max_connections` 默认值为 100，通常需要配合连接池中间件使用。

---

## 1. HikariCP 配置（Java / Spring Boot）

HikariCP 是 Spring Boot 2.x+ 默认连接池，性能优异。

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USER}
    password: ${DB_PASS}
    hikari:
      # 核心参数
      maximum-pool-size: 20          # 最大连接数
      minimum-idle: 5                # 最小空闲连接
      connection-timeout: 30000      # 获取连接超时(ms)
      idle-timeout: 600000           # 空闲连接存活时间(ms)
      max-lifetime: 1800000          # 连接最大存活时间(ms)

      # PostgreSQL 专用
      connection-test-query: SELECT 1
      validation-timeout: 5000

      # 性能调优
      leak-detection-threshold: 60000  # 连接泄漏检测阈值(ms)
      pool-name: PgHikariPool
      register-mbeans: true           # JMX 监控
```

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource() {
        HikariDataSource ds = DataSourceBuilder
            .create()
            .type(HikariDataSource.class)
            .build();
        // PostgreSQL 特定优化
        ds.addDataSourceProperty("cachePrepStmts", "true");
        ds.addDataSourceProperty("prepStmtCacheSize", "250");
        ds.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        return ds;
    }
}
```

**调优要点**：
- `max-lifetime` 应小于 PostgreSQL 的 `idle_in_transaction_session_timeout`
- `minimum-idle` 设为与 `maximum-pool-size` 相同可避免连接抖动
- 监控 `HikariPoolPoolMXBean` 获取活跃/空闲/等待连接数

---

## 2. SQLAlchemy + asyncpg 连接池（Python / FastAPI）

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# 异步引擎 + asyncpg 驱动
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost:5432/mydb",
    # 连接池参数
    pool_size=20,              # 常驻连接数
    max_overflow=10,           # 允许超出的临时连接
    pool_timeout=30,           # 获取连接超时(秒)
    pool_recycle=1800,         # 连接回收时间(秒)
    pool_pre_ping=True,        # 使用前检测连接有效性
    pool_use_lifo=True,        # LIFO 提高缓存命中率
    echo=False,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# FastAPI 依赖注入
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

**asyncpg 专用连接参数**（通过 `connect_args` 传递）：

```python
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost:5432/mydb",
    pool_size=20,
    connect_args={
        "timeout": 10,                    # TCP 连接超时
        "command_timeout": 30,            # SQL 执行超时
        "statement_cache_size": 1024,     # 预编译语句缓存
        "max_cached_statement_lifetime": 300,
        "max_cacheable_statement_size": 1024,
    },
)
```

---

## 3. pgx 连接池（Go）

```go
import (
    "context"
    "time"
    "github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(dsn string) (*pgxpool.Pool, error) {
    config, err := pgxpool.ParseConfig(dsn)
    if err != nil {
        return nil, err
    }

    // 连接池配置
    config.MaxConns = 20                      // 最大连接数
    config.MinConns = 5                       // 最小空闲连接
    config.MaxConnLifetime = 30 * time.Minute // 连接最大存活
    config.MaxConnIdleTime = 10 * time.Minute // 空闲超时
    config.HealthCheckPeriod = 1 * time.Minute

    // 连接配置
    config.ConnConfig.ConnectTimeout = 10 * time.Second

    pool, err := pgxpool.NewWithConfig(context.Background(), config)
    if err != nil {
        return nil, err
    }

    // 验证连接
    if err := pool.Ping(context.Background()); err != nil {
        return nil, err
    }

    return pool, nil
}

// 使用示例
func GetUser(pool *pgxpool.Pool, id int) (string, error) {
    var name string
    err := pool.QueryRow(
        context.Background(),
        "SELECT name FROM users WHERE id = $1", id,
    ).Scan(&name)
    return name, err
}
```

**pgxpool 统计监控**：

```go
stat := pool.Stat()
log.Printf(
    "总连接=%d 空闲=%d 使用中=%d 等待=%d",
    stat.TotalConns(),
    stat.IdleConns(),
    stat.AcquiredConns(),
    stat.AcquireCount(),
)
```

---

## 4. PgBouncer 使用

PgBouncer 是 PostgreSQL 最常用的连接池中间件，适用于无法使用应用层连接池的场景（如多实例部署、微服务）。

```ini
# pgbouncer.ini
[databases]
mydb = host=127.0.0.1 port=5432 dbname=mydb

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

# 连接池模式
pool_mode = transaction     # transaction | session | statement
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3

# 超时设置
server_idle_timeout = 300
server_lifetime = 3600
client_idle_timeout = 0
query_timeout = 60

# 连接限制
max_client_conn = 1000
max_db_connections = 50
```

**pool_mode 选择**：

| 模式 | 适用场景 | 注意事项 |
|------|---------|---------|
| `transaction` | 推荐默认值，适合 OLTP | 事务结束即归还连接 |
| `session` | 需要会话级特性（SET、PREPARE） | 连接利用率低 |
| `statement` | 极少使用，需 autocommit | 不支持多语句事务 |

**应用连接 PgBouncer**：将数据库连接地址改为 PgBouncer 端口（6432），其余不变。

```yaml
# Spring Boot 示例
spring:
  datasource:
    url: jdbc:postgresql://pgbouncer-host:6432/mydb
```
