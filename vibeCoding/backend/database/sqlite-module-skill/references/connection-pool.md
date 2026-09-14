# 连接管理详解

SQLite 是嵌入式数据库，没有传统意义上的"连接池"概念。每个连接直接操作同一个数据库文件，因此连接管理的核心是**避免冲突**和**合理复用**。

## Python sqlite3 连接管理

### 基础连接模式

Python 的 `sqlite3` 模块支持两种模式：单连接复用 和 每次新建连接。

**推荐：单连接复用（多线程需加锁）**

```python
import sqlite3
import threading

class SQLiteManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._lock = threading.Lock()
        self._conn = None

    def _get_conn(self) -> sqlite3.Connection:
        """线程安全地获取连接，惰性初始化"""
        if self._conn is None:
            with self._lock:
                if self._conn is None:  # 双重检查
                    self._conn = sqlite3.connect(
                        self.db_path,
                        check_same_thread=False  # 允许多线程共享
                    )
                    self._conn.row_factory = sqlite3.Row
                    self._conn.execute("PRAGMA journal_mode=WAL")
                    self._conn.execute("PRAGMA busy_timeout=5000")
        return self._conn

    def execute(self, sql: str, params: tuple = ()):
        with self._lock:
            cursor = self._get_conn().execute(sql, params)
            self._conn.commit()
            return cursor.lastrowid

    def query(self, sql: str, params: tuple = ()):
        with self._lock:
            cursor = self._get_conn().execute(sql, params)
            return [dict(row) for row in cursor.fetchall()]

    def close(self):
        with self._lock:
            if self._conn:
                self._conn.close()
                self._conn = None
```

**FastAPI 集成（上下文管理器模式）**

```python
from contextlib import contextmanager

@contextmanager
def get_db():
    conn = sqlite3.connect("./data/app.db")
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

@app.get("/users/{user_id}")
def read_user(user_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None
```

> **注意**：每次请求新建连接的方式在 SQLite 中是可行的，因为本地文件打开速度极快（微秒级），不会有网络开销。

---

## Go database/sql 连接管理

Go 的 `database/sql` 内置连接池，但 SQLite 的特殊性在于**写操作必须串行**。

### 配置要点

```go
import (
    "database/sql"
    "time"
    _ "github.com/mattn/go-sqlite3"
)

func InitDB(dbPath string) (*sql.DB, error) {
    // 注意：DSN 中可以附加 PRAGMA 参数
    dsn := dbPath + "?_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=ON"
    db, err := sql.Open("sqlite3", dsn)
    if err != nil {
        return nil, err
    }

    // SQLite 关键：最大连接数设为 1
    // 因为 SQLite 写操作天然串行，多个连接只会增加锁竞争
    db.SetMaxOpenConns(1)
    db.SetMaxIdleConns(1)
    db.SetConnMaxLifetime(0)  // 永不回收，SQLite 连接无状态

    return db, nil
}
```

**为什么 `MaxOpenConns=1`？**

| 配置 | 效果 |
|------|------|
| `MaxOpenConns=1` | 所有操作排队执行，无锁冲突，吞吐量最稳定 |
| `MaxOpenConns>1` | 读操作可并发，但写操作仍需等锁，可能触发 `SQLITE_BUSY` |

**如果读多写少，可适当放开读并发：**

```go
// 使用自定义驱动实现读写分离
// 写连接池: MaxOpenConns=1
// 读连接池: MaxOpenConns=CPU核心数

import "github.com/glebarez/go-sqlite"  // 纯 Go 实现，支持 CGO-free

func InitReadonlyDB(dbPath string) (*sql.DB, error) {
    dsn := dbPath + "?_journal_mode=WAL&_busy_timeout=5000&_mode=ro"
    db, err := sql.Open("sqlite", dsn)
    if err != nil {
        return nil, err
    }
    db.SetMaxOpenConns(4)  // 读并发
    db.SetMaxIdleConns(2)
    return db, nil
}
```

---

## Java JDBC SQLite 连接管理

### Spring Boot 配置

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:sqlite:./data/app.db
    driver-class-name: org.sqlite.JDBC
    # SQLite 不需要连接池，但 Spring Boot 默认使用 HikariCP
    # 需要显式关闭或限制
    hikari:
      maximum-pool-size: 1      # SQLite 写操作串行
      minimum-idle: 1
      connection-timeout: 10000
```

**HikariCP 配置优化**

```java
@Configuration
public class SQLiteConfig {

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:sqlite:./data/app.db");
        config.setDriverClassName("org.sqlite.JDBC");

        // SQLite 专用配置
        config.setMaximumPoolSize(1);       // 写串行
        config.setMinimumIdle(1);
        config.setConnectionTimeout(10000);

        // 连接初始化 SQL
        config.setConnectionInitSql(
            "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;"
        );

        return new HikariDataSource(config);
    }
}
```

**使用 SQLite 连接池库（可选）**

```xml
<!-- 如果需要更好的 SQLite 支持 -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.42.0.0</version>
</dependency>
```

---

## WAL 模式配置

WAL（Write-Ahead Logging）是 SQLite 并发性能的关键。启用后支持**一写多读**。

### 各语言启用方式

```python
# Python
conn.execute("PRAGMA journal_mode=WAL")
```

```go
// Go - DSN 方式
db, _ := sql.Open("sqlite3", "app.db?_journal_mode=WAL")

// Go - 执行方式
db.Exec("PRAGMA journal_mode=WAL")
```

```java
// Java - JDBC
connection.createStatement().execute("PRAGMA journal_mode=WAL");
```

### WAL 模式参数

```sql
-- 同步模式：NORMAL 在 WAL 下是安全的
PRAGMA synchronous=NORMAL;

-- WAL 自动检查点阈值（默认 1000 页）
PRAGMA wal_autocheckpoint=1000;

-- 查看当前 WAL 模式
PRAGMA journal_mode;
-- 预期返回: wal
```

### WAL vs DELETE 模式对比

| 特性 | DELETE（默认） | WAL |
|------|--------------|-----|
| 读写并发 | 不支持 | 支持一写多读 |
| 写性能 | 较慢（需复制整个文件） | 较快（追加写入） |
| 文件数量 | 1 个 | 3 个（.db, .db-wal, .db-shm） |
| 断电安全 | 安全 | 安全 |
| 网络文件系统 | 兼容 | 可能有问题 |

---

## 并发访问限制

SQLite 的并发能力有限，理解其限制是正确使用的前提。

### 锁粒度

SQLite 使用**数据库级锁**（非行锁、非表锁），这意味着：

- 同一时刻只允许一个写操作
- 读操作在 WAL 模式下可与写操作并发
- 写操作之间必须串行等待

### busy_timeout 配置

当遇到锁冲突时，SQLite 默认立即返回 `SQLITE_BUSY`。设置 `busy_timeout` 可以让它自动重试：

```python
# Python
conn.execute("PRAGMA busy_timeout=5000")  # 等待 5 秒
```

```go
// Go
db.Exec("PRAGMA busy_timeout=5000")
```

```java
// Java
stmt.execute("PRAGMA busy_timeout=5000");
```

### 并发场景建议

| 场景 | 建议 |
|------|------|
| 单进程读写 | 正常使用，无需特殊处理 |
| 多进程读写 | 使用 WAL + busy_timeout，注意 .db-shm 共享内存 |
| 高并发写入 | 考虑迁移到 MySQL/PG |
| 微服务架构 | 每个服务独立数据库文件，或迁移到 MySQL/PG |
