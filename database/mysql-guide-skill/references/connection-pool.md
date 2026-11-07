# 连接池配置详解

连接池是数据库性能的关键组件。合理配置连接池能显著提升应用吞吐量和稳定性。

## HikariCP 配置（Java Spring Boot）

HikariCP 是 Spring Boot 2.x+ 默认连接池，以高性能著称。

### 核心参数

```yaml
spring:
  datasource:
    hikari:
      # 最大连接数（默认 10）
      maximum-pool-size: 20

      # 最小空闲连接数（默认等于 maximum-pool-size）
      minimum-idle: 10

      # 连接超时时间（毫秒，默认 30000）
      connection-timeout: 30000

      # 空闲连接最大存活时间（毫秒，默认 600000）
      idle-timeout: 600000

      # 连接最大存活时间（毫秒，默认 1800000）
      max-lifetime: 1800000

      # 连接测试查询
      connection-test-query: SELECT 1

      # 从池中获取连接前是否测试
      validation-timeout: 5000
```

### 完整配置示例

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/myapp?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
    username: ${MYSQL_USER:root}
    password: ${MYSQL_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      pool-name: MyHikariCP
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      connection-test-query: SELECT 1
      validation-timeout: 5000
      leak-detection-threshold: 60000
```

### 监控配置

```java
@Configuration
public class DataSourceConfig {

    @Bean
    public HikariDataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/myapp");
        config.setUsername("root");
        config.setPassword("password");

        // 监控相关
        config.setMetricRegistry(micrometerRegistry);
        config.setHealthCheckRegistry(healthCheckRegistry);

        return new HikariDataSource(config);
    }
}
```

## SQLAlchemy 连接池配置（Python）

### 核心参数

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    "mysql+pymysql://user:password@localhost:3306/myapp",

    # 连接池大小（默认 5）
    pool_size=10,

    # 超出 pool_size 后允许的最大连接数（默认 10）
    max_overflow=20,

    # 连接超时时间（秒，默认 30）
    pool_timeout=30,

    # 连接回收时间（秒，默认 -1 不回收）
    pool_recycle=1800,

    # 每次取连接前执行 ping 测试
    pool_pre_ping=True,

    # 使用 QueuePool 实现
    poolclass=QueuePool,
)
```

### 生产环境配置

```python
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

def create_db_engine(settings):
    engine = create_engine(
        f"mysql+pymysql://{settings.mysql_user}:{settings.mysql_password}"
        f"@{settings.mysql_host}:{settings.mysql_port}/{settings.mysql_database}",

        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,

        # 回调：连接创建时设置字符集
        connect_args={
            "charset": "utf8mb4",
            "connect_timeout": 10,
        }
    )

    # 连接初始化事件
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("SET SESSION wait_timeout=28800")
        cursor.execute("SET SESSION interactive_timeout=28800")
        cursor.close()

    return engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### FastAPI 集成

```python
from fastapi import Depends
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(User).filter(User.id == user_id).first()
```

## Go database/sql 连接池配置

### 核心配置

```go
package main

import (
    "database/sql"
    "time"

    _ "github.com/go-sql-driver/mysql"
)

func initDB() (*sql.DB, error) {
    dsn := "user:password@tcp(localhost:3306)/myapp?charset=utf8mb4&parseTime=True&loc=Local"
    db, err := sql.Open("mysql", dsn)
    if err != nil {
        return nil, err
    }

    // 最大打开连接数（默认 0 不限制）
    db.SetMaxOpenConns(100)

    // 最大空闲连接数（默认 2）
    db.SetMaxIdleConns(25)

    // 连接最大存活时间（默认 0 不限制）
    db.SetConnMaxLifetime(5 * time.Minute)

    // 空闲连接最大存活时间（Go 1.15+）
    db.SetConnMaxIdleTime(10 * time.Minute)

    // 测试连接
    if err := db.Ping(); err != nil {
        return nil, err
    }

    return db, nil
}
```

### 连接池监控

```go
func monitorDB(db *sql.DB) {
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        stats := db.Stats()
        log.Printf("DB Pool Stats: Open=%d, InUse=%d, Idle=%d, WaitCount=%d, WaitDuration=%v",
            stats.OpenConnections,
            stats.InUse,
            stats.Idle,
            stats.WaitCount,
            stats.WaitDuration,
        )
    }
}
```

### Gin 框架集成

```go
func SetupRouter(db *sql.DB) *gin.Engine {
    r := gin.Default()

    // 注入 DB
    r.Use(func(c *gin.Context) {
        c.Set("db", db)
        c.Next()
    })

    r.GET("/users/:id", getUser)
    return r
}

func getUser(c *gin.Context) {
    db := c.MustGet("db").(*sql.DB)
    id := c.Param("id")

    var user User
    err := db.QueryRow("SELECT id, username FROM users WHERE id = ?", id).Scan(&user.ID, &user.Username)
    if err != nil {
        c.JSON(404, gin.H{"error": "User not found"})
        return
    }

    c.JSON(200, user)
}
```

## 连接池大小计算公式

### 通用公式

```
最大连接数 = (CPU 核心数 * 2) + 有效磁盘数
```

**示例**：4 核 CPU，1 块 SSD

```
最大连接数 = (4 * 2) + 1 = 9
```

### 考虑因素

| 因素 | 说明 |
|------|------|
| **CPU 核心数** | 并发查询处理能力 |
| **磁盘 I/O** | 数据库读写瓶颈 |
| **内存大小** | 每个连接约占 1-10MB |
| **应用并发量** | 同时活跃的请求 |
| **数据库最大连接数** | MySQL 默认 151 |

### Spring Boot 推荐配置

| 场景 | minimum-idle | maximum-pool-size |
|------|--------------|-------------------|
| **小型应用** | 5 | 10 |
| **中型应用** | 10 | 20 |
| **大型应用** | 20 | 40 |

### 多数据源场景

```
总连接数 = 所有数据源连接数之和
单个数据源连接数 = 总连接数 / 数据源数量
```

**示例**：MySQL 最大连接数 200，3 个应用

```
每个应用最大连接数 = 200 / 3 ≈ 60
每个数据源连接数 = 60 / 3（主从+缓存）≈ 20
```

## 常见连接池问题

### 1. 连接泄漏

**症状**：连接数持续增长，最终耗尽

**排查**：

```sql
-- MySQL 查看当前连接
SHOW PROCESSLIST;

-- 查看连接数
SHOW STATUS LIKE 'Threads_connected';
```

**解决**：

```yaml
# HikariCP 泄漏检测
spring:
  datasource:
    hikari:
      leak-detection-threshold: 60000  # 60 秒未归还则告警
```

```python
# SQLAlchemy 确保连接归还
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # 必须关闭
```

### 2. 连接超时

**症状**：`Connection timeout` 错误

**原因**：
- 连接池耗尽
- 网络延迟
- 数据库负载过高

**解决**：

```yaml
spring:
  datasource:
    hikari:
      connection-timeout: 30000  # 增加超时时间
      maximum-pool-size: 20      # 增加连接数
```

### 3. 连接失效

**症状**：`MySQL server has gone away`

**原因**：
- 连接长时间空闲被数据库关闭
- 网络中断

**解决**：

```yaml
spring:
  datasource:
    hikari:
      max-lifetime: 1800000      # 小于 MySQL wait_timeout
      connection-test-query: SELECT 1
```

```python
engine = create_engine(
    "...",
    pool_pre_ping=True,  # 自动检测失效连接
    pool_recycle=1800    # 定期回收
)
```

### 4. 连接池耗尽

**症状**：应用卡死，无法获取连接

**排查**：

```bash
# 查看 MySQL 连接数
mysql> SHOW STATUS LIKE 'Max_used_connections';
mysql> SHOW VARIABLES LIKE 'max_connections';
```

**解决**：

1. 优化慢查询，减少连接占用时间
2. 增加连接池大小
3. 增加 MySQL 最大连接数

```sql
-- MySQL 动态调整
SET GLOBAL max_connections = 500;
```

### 5. 连接风暴

**症状**：应用启动时大量连接请求

**解决**：

```yaml
spring:
  datasource:
    hikari:
      minimum-idle: 10  # 预创建最小连接
```

```python
engine = create_engine(
    "...",
    pool_size=10,        # 初始连接数
    pool_pre_ping=True
)
```

## 最佳实践

1. **连接池大小**：根据公式计算，不要盲目设置过大
2. **超时设置**：`max-lifetime` 必须小于 MySQL 的 `wait_timeout`
3. **监控告警**：配置连接池监控，及时发现问题
4. **连接归还**：确保代码中正确关闭连接
5. **预热连接**：设置 `minimum-idle` 避免启动时冷启动
