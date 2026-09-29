# 性能调优指南

SQLite 默认配置偏保守，通过合理调优可获得数倍性能提升。

## PRAGMA 配置优化

### 推荐配置组合

```sql
-- 生产环境推荐配置
PRAGMA journal_mode = WAL;        -- 启用 WAL 模式（并发读写）
PRAGMA synchronous = NORMAL;      -- WAL 下安全且更快
PRAGMA cache_size = -64000;       -- 缓存 64MB（负数单位为 KB）
PRAGMA temp_store = MEMORY;       -- 临时表存内存
PRAGMA mmap_size = 268435456;     -- 内存映射 256MB
PRAGMA busy_timeout = 5000;       -- 锁等待 5 秒
PRAGMA foreign_keys = ON;         -- 启用外键约束
```

### 各 PRAGMA 详解

| PRAGMA | 默认值 | 推荐值 | 说明 |
|--------|--------|--------|------|
| `journal_mode` | DELETE | WAL | 并发读写，写入更快 |
| `synchronous` | FULL | NORMAL | WAL 下 NORMAL 已足够安全 |
| `cache_size` | 2000 页 | -64000 | 数据页缓存，减少磁盘 I/O |
| `temp_store` | DEFAULT | MEMORY | 临时数据存内存 |
| `mmap_size` | 0 | 256MB | 内存映射 I/O，大文件显著提速 |
| `busy_timeout` | 0 | 5000 | 锁冲突时自动重试 |
| `foreign_keys` | OFF | ON | 默认不启用，需手动开启 |

### 各语言配置方式

**Python**

```python
def get_optimized_conn(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    # 生产环境优化配置
    pragmas = {
        "journal_mode": "WAL",
        "synchronous": "NORMAL",
        "cache_size": -64000,      # 64MB
        "temp_store": "MEMORY",
        "mmap_size": 268435456,    # 256MB
        "busy_timeout": 5000,
        "foreign_keys": "ON",
    }
    for key, value in pragmas.items():
        conn.execute(f"PRAGMA {key} = {value}")

    return conn
```

**Go**

```go
func InitOptimizedDB(dbPath string) (*sql.DB, error) {
    // DSN 中直接配置 PRAGMA
    dsn := fmt.Sprintf(
        "%s?_journal_mode=WAL&_synchronous=NORMAL&_cache_size=-64000"+
        "&_temp_store=MEMORY&_mmap_size=268435456&_busy_timeout=5000"+
        "&_foreign_keys=ON",
        dbPath,
    )
    db, err := sql.Open("sqlite3", dsn)
    if err != nil {
        return nil, err
    }
    db.SetMaxOpenConns(1)
    return db, nil
}
```

**Java**

```java
@Bean
public DataSource optimizedDataSource() {
    HikariConfig config = new HikariConfig();
    config.setJdbcUrl("jdbc:sqlite:./data/app.db");
    config.setConnectionInitSql(
        "PRAGMA journal_mode=WAL;" +
        "PRAGMA synchronous=NORMAL;" +
        "PRAGMA cache_size=-64000;" +
        "PRAGMA temp_store=MEMORY;" +
        "PRAGMA mmap_size=268435456;" +
        "PRAGMA busy_timeout=5000;" +
        "PRAGMA foreign_keys=ON;"
    );
    return new HikariDataSource(config);
}
```

---

## 索引优化

### 索引设计原则

1. **WHERE 条件列**：高频查询的过滤列必须建索引
2. **JOIN 列**：关联查询的外键列
3. **ORDER BY 列**：排序字段
4. **复合索引顺序**：区分度高的列放前面

### 常用索引模式

```sql
-- 单列索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 复合索引（覆盖查询）
CREATE INDEX IF NOT EXISTS idx_orders_user_date
ON orders(user_id, created_at DESC);

-- 部分索引（条件索引）
CREATE INDEX IF NOT EXISTS idx_active_users
ON users(username) WHERE status = 1;

-- 唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
ON users(username);
```

### 索引诊断

```sql
-- 查看查询是否使用索引
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC;
-- 期望看到: SEARCH TABLE orders USING INDEX idx_orders_user_date

-- 查看表的所有索引
PRAGMA index_list('orders');

-- 查看索引详细信息
PRAGMA index_info('idx_orders_user_date');
```

### 索引反模式

```sql
-- 不要对小表建索引（< 1000 行）
-- 不要对频繁更新的列建过多索引
-- 不要在 BLOB/TEXT 列上建索引

-- 错误：索引过度
CREATE INDEX idx1 ON users(username);
CREATE INDEX idx2 ON users(username, email);
CREATE INDEX idx3 ON users(username, email, status);
-- 正确：根据实际查询只建必要的索引
```

### Python 索引管理工具

```python
def analyze_indexes(db_path: str):
    """分析索引使用情况"""
    conn = sqlite3.connect(db_path)

    # 获取所有索引
    indexes = conn.execute(
        "SELECT name, tbl_name FROM sqlite_master WHERE type='index'"
    ).fetchall()

    for idx_name, table_name in indexes:
        # 检查索引列
        cols = conn.execute(f"PRAGMA index_info('{idx_name}')").fetchall()
        col_names = [col[2] for col in cols]
        print(f"索引 {idx_name} -> 表 {table_name}, 列: {col_names}")

    conn.close()
```

---

## 事务批量操作

### 批量插入优化

```python
def batch_insert_slow(records: list[tuple]):
    """错误：每条记录一个事务"""
    conn = sqlite3.connect("app.db")
    for record in records:
        conn.execute("INSERT INTO logs (level, msg) VALUES (?, ?)", record)
        conn.commit()  # 每次 commit 都触发磁盘写入
    conn.close()

def batch_insert_fast(records: list[tuple]):
    """正确：单事务批量插入"""
    conn = sqlite3.connect("app.db")
    try:
        conn.executemany(
            "INSERT INTO logs (level, msg) VALUES (?, ?)",
            records
        )
        conn.commit()  # 只提交一次
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
```

### Go 批量操作

```go
func BatchInsert(db *sql.DB, records []Log) error {
    tx, err := db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    stmt, err := tx.Prepare("INSERT INTO logs (level, msg) VALUES (?, ?)")
    if err != nil {
        return err
    }
    defer stmt.Close()

    for _, r := range records {
        if _, err := stmt.Exec(r.Level, r.Msg); err != nil {
            return err
        }
    }

    return tx.Commit()  // 单次提交
}
```

### Java 批量操作

```java
public void batchInsert(List<Log> logs) {
    String sql = "INSERT INTO logs (level, msg) VALUES (?, ?)";

    try (Connection conn = dataSource.getConnection()) {
        conn.setAutoCommit(false);

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (Log log : logs) {
                ps.setString(1, log.getLevel());
                ps.setString(2, log.getMsg());
                ps.addBatch();
            }
            ps.executeBatch();
            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        }
    }
}
```

### 性能对比

| 方式 | 10000 条记录耗时 |
|------|-----------------|
| 逐条提交 | ~10 秒 |
| 单事务批量 | ~0.1 秒 |
| 使用 prepared statement | ~0.05 秒 |

---

## 内存映射配置

内存映射（mmap）可以让 SQLite 直接通过虚拟内存访问数据库文件，减少系统调用开销。

```sql
-- 启用内存映射（单位：字节）
PRAGMA mmap_size = 268435456;  -- 256MB

-- 查看当前配置
PRAGMA mmap_size;

-- 关闭内存映射
PRAGMA mmap_size = 0;
```

### 适用场景

| 场景 | 是否启用 mmap |
|------|--------------|
| 数据库 < 100MB | 可选 |
| 数据库 > 100MB | 推荐 |
| 只读数据库 | 强烈推荐 |
| 网络文件系统（NFS） | 禁用 |
| 32 位系统 | 谨慎（地址空间有限） |

### Python 配置

```python
def get_readonly_conn(db_path: str) -> sqlite3.Connection:
    """只读连接，启用 mmap"""
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.execute("PRAGMA mmap_size = 268435456")  # 256MB
    conn.execute("PRAGMA cache_size = -64000")     # 64MB
    conn.execute("PRAGMA query_only = ON")         # 防止误写
    return conn
```

---

## VACUUM 和分析

### VACUUM

VACUUM 会重建数据库文件，消除碎片，回收空间。

```sql
-- 标准 VACUUM（需要额外磁盘空间）
VACUUM;

-- 带 INTO 的 VACUUM（SQLite 3.27+，备份到新文件）
VACUUM INTO './backup/app_vacuum.db';
```

**何时执行 VACUUM**

```python
def should_vacuum(db_path: str, threshold: float = 0.1) -> bool:
    """判断是否需要 VACUUM（碎片率 > 10%）"""
    conn = sqlite3.connect(db_path)
    pages = conn.execute("PRAGMA page_count").fetchone()[0]
    free_pages = conn.execute("PRAGMA freelist_count").fetchone()[0]
    conn.close()

    if pages == 0:
        return False
    return (free_pages / pages) > threshold
```

**Python 定期 VACUUM**

```python
def vacuum_if_needed(db_path: str):
    if should_vacuum(db_path):
        conn = sqlite3.connect(db_path)
        conn.execute("VACUUM")
        conn.close()
        print(f"VACUUM 完成: {db_path}")
```

### ANALYZE

ANALYZE 收集统计信息，帮助查询优化器选择更好的执行计划。

```sql
-- 分析整个数据库
ANALYZE;

-- 分析特定表
ANALYZE users;

-- 分析特定索引
ANALYZE idx_users_email;
```

**何时执行 ANALYZE**

- 大量数据变更后（插入/删除超过 10%）
- 创建新索引后
- 查询性能突然下降时

```python
def analyze_if_needed(db_path: str):
    """数据变更后自动分析"""
    conn = sqlite3.connect(db_path)
    # 获取最后分析时间（通过自定义元数据表）
    conn.execute("""
        CREATE TABLE IF NOT EXISTS _meta (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)
    row = conn.execute(
        "SELECT value FROM _meta WHERE key = 'last_analyze'"
    ).fetchone()

    last_analyze = row[0] if row else "1970-01-01"
    # 如果超过 24 小时未分析，执行 ANALYZE
    # （实际项目中应比较时间戳）
    conn.execute("ANALYZE")
    conn.execute(
        "INSERT OR REPLACE INTO _meta VALUES ('last_analyze', datetime('now'))"
    )
    conn.commit()
    conn.close()
```

---

## 性能调优清单

| 项目 | 操作 | 优先级 |
|------|------|--------|
| WAL 模式 | `PRAGMA journal_mode=WAL` | 高 |
| 同步模式 | `PRAGMA synchronous=NORMAL` | 高 |
| busy_timeout | `PRAGMA busy_timeout=5000` | 高 |
| 缓存大小 | `PRAGMA cache_size=-64000` | 中 |
| 内存映射 | `PRAGMA mmap_size=268435456` | 中 |
| 临时表内存 | `PRAGMA temp_store=MEMORY` | 中 |
| 外键约束 | `PRAGMA foreign_keys=ON` | 中 |
| 索引优化 | 根据查询添加索引 | 按需 |
| 批量操作 | 单事务多操作 | 按需 |
| VACUUM | 定期清理碎片 | 低 |
| ANALYZE | 大量变更后执行 | 低 |
