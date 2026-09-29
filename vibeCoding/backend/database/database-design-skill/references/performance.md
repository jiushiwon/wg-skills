# 数据库性能优化规范

## 1. 查询优化规则

| 规则 | 说明 | 示例 |
|------|------|------|
| 避免 SELECT * | 只查需要的字段 | SELECT id, name FROM user |
| 避免函数运算 | 函数导致索引失效 | WHERE YEAR(created_at)=2024 ❌ |
| 避免隐式转换 | 类型要匹配 | WHERE phone = 138... ❌ |
| 使用游标分页 | 大 OFFSET 用游标 | WHERE id > last_id |
| 批量操作 | 减少数据库交互 | INSERT 批量写入 |

## 2. 慢查询分析

```sql
-- MySQL
SHOW VARIABLES LIKE 'slow_query_log';
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
EXPLAIN SELECT * FROM user WHERE username = 'test';

-- PostgreSQL
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
EXPLAIN ANALYZE SELECT * FROM user WHERE username = 'test';
```

## 3. 分页优化

```sql
-- ❌ 慢 OFFSET
SELECT * FROM orders LIMIT 10 OFFSET 100000;

-- ✅ 快 游标
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 10;

-- ✅ 条件+游标
SELECT * FROM orders 
WHERE status = 1 AND id > #{lastId} 
ORDER BY id LIMIT 10;
```

## 4. 读写分离

```yaml
# MySQL 主从配置
spring:
  datasource:
    master:
      url: jdbc:mysql://master:3306/db
    slave:
      url: jdbc:mysql://slave:3306/db
```

## 5. 连接池配置

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| maximum-pool-size | 10-20 | 最大连接数 |
| minimum-idle | 5 | 最小空闲 |
| connection-timeout | 30000 | 连接超时 ms |

---

## 6. 慢查询排查流程

### 6.1 排查步骤

```
1. 开启慢查询日志
   ↓
2. 定位慢 SQL
   ↓
3. EXPLAIN 分析执行计划
   ↓
4. 检查索引使用情况
   ↓
5. 优化 SQL 或添加索引
   ↓
6. 验证优化效果
```

### 6.2 MySQL 慢查询配置

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过1秒记录
SET GLOBAL log_queries_not_using_indexes = ON;  -- 记录未使用索引的查询

-- 查看慢查询
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 20;

-- 使用 mysqldumpslow 分析
-- 按查询次数排序
mysqldumpslow -s c /var/log/mysql/slow.log
-- 按平均时间排序
mysqldumpslow -s at /var/log/mysql/slow.log
```

### 6.3 PostgreSQL 慢查询配置

```sql
-- postgresql.conf 配置
-- log_min_duration_statement = 1000  -- 超过1秒记录
-- shared_preload_libraries = 'pg_stat_statements'

-- 启用 pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 查看最慢的查询
SELECT
    query,
    calls,
    total_exec_time AS total_time,
    mean_exec_time AS mean_time,
    rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- 重置统计
SELECT pg_stat_statements_reset();
```

---

## 7. 查询计划分析实战

### 7.1 MySQL EXPLAIN 分析

```sql
-- 示例查询
EXPLAIN SELECT o.id, o.order_no, u.username
FROM wg_order o
JOIN wg_user u ON o.user_id = u.id
WHERE o.status = 1 AND o.created_at > '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- 输出分析：
-- +----+-------------+-------+------------+--------+---------------+---------+---------+------+------+----------+----------------+
-- | id | select_type | table | partitions | type   | possible_keys | key     | key_len | ref  | rows | filtered | Extra          |
-- +----+-------------+-------+------------+--------+---------------+---------+---------+------+------+----------+----------------+
-- |  1 | SIMPLE      | o     | NULL       | range  | idx_status    | idx_... | 5       | NULL | 1000 |    10.00 | Using where    |
-- |  1 | SIMPLE      | u     | NULL       | eq_ref | PRIMARY       | PRIMARY | 8       | ...  |    1 |   100.00 | NULL           |
-- +----+-------------+-------+------------+--------+---------------+---------+---------+------+------+----------+----------------+

-- 关键解读：
-- 1. type=range：使用了索引范围扫描 ✅
-- 2. type=eq_ref：关联查询使用主键 ✅
-- 3. rows=1000：扫描行数较多，考虑优化索引
-- 4. filtered=10.00：过滤比例低，索引区分度不够
```

### 7.2 PostgreSQL EXPLAIN ANALYZE 分析

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, o.order_no, u.username
FROM wg_order o
JOIN wg_user u ON o.user_id = u.id
WHERE o.status = 1 AND o.created_at > '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- 输出示例：
-- Limit  (cost=0.87..12.34 rows=20 width=64) (actual time=0.025..0.050 rows=20 loops=1)
--   ->  Nested Loop  (cost=0.87..500.00 rows=1000 width=64) (actual time=0.024..0.048 rows=20 loops=1)
--         ->  Index Scan using idx_order_status_created on wg_order o  (cost=0.42..200.00 rows=1000 width=32) (actual time=0.015..0.020 rows=20 loops=1)
--               Index Cond: (status = 1 AND created_at > '2024-01-01'::timestamp)
--         ->  Index Scan using pk_user on wg_user u  (cost=0.29..0.31 rows=1 width=36) (actual time=0.001..0.001 rows=1 loops=20)
--               Index Cond: (id = o.user_id)
--   Buffers: shared hit=25
-- Planning Time: 0.150 ms
-- Execution Time: 0.080 ms

-- 关键解读：
-- 1. Index Scan：使用索引 ✅
-- 2. shared hit=25：缓存命中率高 ✅
-- 3. actual rows=20 vs rows=1000：预估偏差大，需要 ANALYZE
```

---

## 8. 连接池调优

### 8.1 HikariCP 配置（Java）

```yaml
spring:
  datasource:
    hikari:
      # 核心配置
      maximum-pool-size: 20        # 最大连接数
      minimum-idle: 5              # 最小空闲连接
      idle-timeout: 600000         # 空闲超时 10分钟
      max-lifetime: 1800000        # 连接最大存活时间 30分钟
      connection-timeout: 30000    # 连接超时 30秒
      
      # MySQL 特定配置
      data-source-properties:
        cachePrepStmts: true
        prepStmtCacheSize: 250
        prepStmtCacheSqlLimit: 2048
        useServerPrepStmts: true
```

### 8.2 连接池大小计算

```
公式：最大连接数 = (CPU核心数 * 2) + 有效磁盘数

示例：
- 4核 CPU，1块 SSD
- 最大连接数 = (4 * 2) + 1 = 9
- 建议设置 10-20（留有余量）
```

### 8.3 Go 连接池配置

```go
import "database/sql"

db, err := sql.Open("mysql", dsn)
if err != nil {
    log.Fatal(err)
}

// 连接池配置
db.SetMaxOpenConns(20)           // 最大连接数
db.SetMaxIdleConns(5)            // 最大空闲连接
db.SetConnMaxLifetime(time.Hour) // 连接最大存活时间
db.SetConnMaxIdleTime(10 * time.Minute) // 空闲超时
```

### 8.4 Python SQLAlchemy 配置

```python
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql://user:pass@localhost/db",
    pool_size=10,           # 连接池大小
    max_overflow=20,        # 超出池大小的额外连接
    pool_timeout=30,        # 获取连接超时
    pool_recycle=1800,      # 连接回收时间（秒）
    pool_pre_ping=True,     # 使用前检测连接有效性
)
```

---

## 9. 读写分离实现

### 9.1 架构图

```
                    ┌─────────────┐
                    │   应用层    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  代理/中间件 │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │   Master    │  │   Slave 1   │  │   Slave 2   │
   │   (写)      │  │   (读)      │  │   (读)      │
   └─────────────┘  └─────────────┘  └─────────────┘
```

### 9.2 应用层实现（Go 示例）

```go
package database

import (
    "database/sql"
    "sync"
)

type DBPool struct {
    master *sql.DB
    slaves []*sql.DB
    mu     sync.RWMutex
    index  int
}

func NewDBPool(masterDSN string, slaveDSNs []string) (*DBPool, error) {
    master, err := sql.Open("mysql", masterDSN)
    if err != nil {
        return nil, err
    }

    var slaves []*sql.DB
    for _, dsn := range slaveDSNs {
        slave, err := sql.Open("mysql", dsn)
        if err != nil {
            return nil, err
        }
        slaves = append(slaves, slave)
    }

    return &DBPool{
        master: master,
        slaves: slaves,
    }, nil
}

// Master 获取主库连接（写操作）
func (p *DBPool) Master() *sql.DB {
    return p.master
}

// Slave 获取从库连接（读操作，轮询负载均衡）
func (p *DBPool) Slave() *sql.DB {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    if len(p.slaves) == 0 {
        return p.master
    }
    
    slave := p.slaves[p.index%len(p.slaves)]
    p.index++
    return slave
}
```

### 9.3 注解方式实现（Java Spring）

```java
// 自定义注解
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ReadOnly {}

// 切面处理
@Aspect
@Component
public class DataSourceAspect {
    
    @Before("@annotation(readOnly)")
    public void setReadDataSource(ReadOnly readOnly) {
        DataSourceContextHolder.setDataSourceType(DataSourceType.SLAVE);
    }
    
    @After("@annotation(readOnly)")
    public void clearDataSource(ReadOnly readOnly) {
        DataSourceContextHolder.clear();
    }
}

// 使用示例
@Service
public class UserService {
    
    @ReadOnly
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }
    
    public void createUser(User user) {
        userMapper.insert(user);
    }
}
```

---

## 10. 批量操作最佳实践

### 10.1 批量插入

```sql
-- ❌ 逐条插入
INSERT INTO wg_log (message, level) VALUES ('msg1', 1);
INSERT INTO wg_log (message, level) VALUES ('msg2', 1);
INSERT INTO wg_log (message, level) VALUES ('msg3', 1);

-- ✅ 批量插入（MySQL）
INSERT INTO wg_log (message, level) VALUES
('msg1', 1),
('msg2', 1),
('msg3', 1);

-- ✅ 批量插入（PostgreSQL）
INSERT INTO wg_log (message, level) VALUES
('msg1', 1),
('msg2', 1),
('msg3', 1);

-- ✅ 大批量数据使用 COPY（PostgreSQL）
COPY wg_log(message, level) FROM '/tmp/logs.csv' WITH CSV;
```

### 10.2 批量更新

```sql
-- ❌ 逐条更新
UPDATE wg_user SET status = 1 WHERE id = 1;
UPDATE wg_user SET status = 1 WHERE id = 2;
UPDATE wg_user SET status = 1 WHERE id = 3;

-- ✅ 批量更新
UPDATE wg_user SET status = 1 WHERE id IN (1, 2, 3);

-- ✅ 使用 CASE WHEN 批量更新不同值
UPDATE wg_user SET status = CASE
    WHEN id = 1 THEN 1
    WHEN id = 2 THEN 2
    WHEN id = 3 THEN 3
END
WHERE id IN (1, 2, 3);
```

### 10.3 批量删除

```sql
-- ❌ 逐条删除
DELETE FROM wg_log WHERE id = 1;
DELETE FROM wg_log WHERE id = 2;

-- ✅ 批量删除
DELETE FROM wg_log WHERE id IN (1, 2, 3);

-- ✅ 大批量删除使用 LIMIT 分批
DELETE FROM wg_log WHERE created_at < '2024-01-01' LIMIT 10000;
-- 循环执行直到影响行数为 0
```

### 10.4 应用层批量操作（Go 示例）

```go
// 批量插入
func BatchInsert(db *sql.DB, logs []Log) error {
    if len(logs) == 0 {
        return nil
    }

    // 每批 1000 条
    batchSize := 1000
    for i := 0; i < len(logs); i += batchSize {
        end := i + batchSize
        if end > len(logs) {
            end = len(logs)
        }
        batch := logs[i:end]

        // 构建批量插入 SQL
        query := "INSERT INTO wg_log (message, level) VALUES "
        var args []interface{}
        for j, log := range batch {
            if j > 0 {
                query += ","
            }
            query += "(?,?)"
            args = append(args, log.Message, log.Level)
        }

        _, err := db.Exec(query, args...)
        if err != nil {
            return err
        }
    }
    return nil
}
```

### 10.5 事务批量操作

```go
// 使用事务批量操作
func BatchInsertWithTx(db *sql.DB, logs []Log) error {
    tx, err := db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    stmt, err := tx.Prepare("INSERT INTO wg_log (message, level) VALUES (?, ?)")
    if err != nil {
        return err
    }
    defer stmt.Close()

    for _, log := range logs {
        _, err := stmt.Exec(log.Message, log.Level)
        if err != nil {
            return err
        }
    }

    return tx.Commit()
}
```

---

## 11. 其他优化技巧

### 11.1 避免大事务

```sql
-- ❌ 大事务
BEGIN;
INSERT INTO wg_log ...;  -- 100万条
UPDATE wg_user ...;
DELETE FROM wg_temp ...;
COMMIT;

-- ✅ 分批提交
-- 每 1000 条提交一次
BEGIN;
INSERT INTO wg_log ...;  -- 1000条
COMMIT;

BEGIN;
INSERT INTO wg_log ...;  -- 下1000条
COMMIT;
```

### 11.2 合理使用缓存

```go
// Redis 缓存示例
func GetUserByID(db *sql.DB, rdb *redis.Client, id int64) (*User, error) {
    // 先查缓存
    key := fmt.Sprintf("user:%d", id)
    val, err := rdb.Get(ctx, key).Result()
    if err == nil {
        var user User
        json.Unmarshal([]byte(val), &user)
        return &user, nil
    }

    // 缓存未命中，查数据库
    user, err := queryUserFromDB(db, id)
    if err != nil {
        return nil, err
    }

    // 写入缓存
    data, _ := json.Marshal(user)
    rdb.Set(ctx, key, data, 10*time.Minute)

    return user, nil
}
```

### 11.3 预估数据量

```sql
-- 查看表大小（MySQL）
SELECT
    table_name,
    table_rows,
    data_length,
    index_length,
    CONCAT(ROUND((data_length + index_length) / 1024 / 1024, 2), ' MB') AS total_size
FROM information_schema.tables
WHERE table_schema = 'your_database'
ORDER BY data_length + index_length DESC;

-- 查看表大小（PostgreSQL）
SELECT
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size,
    pg_size_pretty(pg_indexes_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```
