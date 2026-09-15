# PostgreSQL 性能调优指南

> 从配置、查询、索引、分区四个维度系统性调优。

---

## 1. postgresql.conf 关键参数

### 内存相关

```ini
# 共享缓冲区 - 推荐物理内存的 25%
shared_buffers = '4GB'

# 工作内存 - 每个排序/哈希操作可用内存
# 注意：每个连接都会分配，总消耗 = work_mem * max_connections * 操作数
work_mem = '64MB'

# 有效缓存大小 - 告诉 PG 预估可用的 OS 缓存
# 推荐物理内存的 50-75%
effective_cache_size = '12GB'

# 维护操作内存（VACUUM、CREATE INDEX）
maintenance_work_mem = '1GB'
```

### WAL 和检查点

```ini
# WAL 缓冲区
wal_buffers = '64MB'

# 检查点相关
checkpoint_timeout = '15min'
checkpoint_completion_target = 0.9
max_wal_size = '4GB'
min_wal_size = '1GB'
```

### 查询优化器

```ini
# 随机页读取成本（SSD 可调低）
random_page_cost = 1.1        # SSD 默认 1.1，HDD 默认 4.0

# 并行查询
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4

# JIT 编译（PG 11+）
jit = on
jit_above_cost = 100000
```

### 连接和日志

```ini
max_connections = 200
superuser_reserved_connections = 3

# 慢查询日志
log_min_duration_statement = '200ms'
log_checkpoints = on
log_lock_waits = on
log_temp_files = 0
```

---

## 2. EXPLAIN ANALYZE 解读

### 基本用法

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC;
```

### 输出解读

```
Sort  (cost=1000.00..1001.00 rows=50 width=120) (actual time=10.5..10.6 rows=48 loops=1)
  Sort Key: created_at DESC
  Sort Method: quicksort  Memory: 35kB
  Buffers: shared hit=150 read=20
  ->  Index Scan using idx_orders_user_id on orders  (cost=0.43..980.00 rows=50 width=120) (actual time=0.1..8.2 rows=48 loops=1)
        Index Cond: (user_id = 123)
        Buffers: shared hit=150 read=20
Planning Time: 0.3 ms
Execution Time: 10.8 ms
```

**关键指标**：

| 指标 | 含义 | 关注点 |
|------|------|--------|
| `cost` | 估算成本 | 比较不同执行路径 |
| `actual time` | 实际执行时间(ms) | 首行..末行 |
| `rows` | 实际返回行数 | 与估算值对比，偏差大需 ANALYZE |
| `loops` | 执行次数 | 嵌套循环的外层迭代 |
| `Buffers: shared hit` | 缓存命中 | 越高越好 |
| `Buffers: shared read` | 磁盘读取 | 越低越好 |

### 常见性能问题模式

```sql
-- 1. 估算行数偏差大 → 需要 ANALYZE
-- 实际 rows=10000, 估算 rows=50 → 统计信息过时
ANALYZE table_name;

-- 2. Seq Scan 大表 → 缺少索引
-- 3. Nested Loop 高 loops → 考虑 Hash/Merge Join
-- 4. Sort 使用磁盘 → 增大 work_mem
-- 5. Bitmap Heap Scan recheck → 增大 work_mem
```

---

## 3. 索引优化实践

### B-tree 索引（默认）

```sql
-- 单列索引
CREATE INDEX idx_users_email ON users (email);

-- 复合索引（注意列顺序：高选择性列在前）
CREATE INDEX idx_orders_user_date ON orders (user_id, created_at DESC);

-- 覆盖索引（INCLUDE，避免回表）
CREATE INDEX idx_orders_covering ON orders (user_id)
INCLUDE (total_amount, status);

-- 部分索引（条件索引，减少索引大小）
CREATE INDEX idx_active_users ON users (email)
WHERE status = 'active';

-- 表达式索引
CREATE INDEX idx_users_lower_email ON users (LOWER(email));
```

### GIN 索引（全文搜索、JSON、数组）

```sql
-- JSONB 字段索引
CREATE INDEX idx_data_gin ON events USING GIN (data);
-- 查询
SELECT * FROM events WHERE data @> '{"type": "click"}';

-- 全文搜索
CREATE INDEX idx_content_fts ON articles USING GIN (to_tsvector('chinese', content));
-- 查询
SELECT * FROM articles
WHERE to_tsvector('chinese', content) @@ to_tsquery('chinese', '数据库 & 优化');

-- 数组字段
CREATE INDEX idx_tags ON products USING GIN (tags);
SELECT * FROM products WHERE tags @> ARRAY['electronics'];
```

### GiST 索引（几何、范围、相似度）

```sql
-- PostGIS 地理位置
CREATE INDEX idx_locations_geom ON locations USING GIST (geom);
SELECT * FROM locations
WHERE ST_DWithin(geom, ST_MakePoint(116.4, 39.9)::geography, 1000);

-- 范围类型
CREATE INDEX idx_booking_period ON bookings USING GIST (during);
SELECT * FROM bookings
WHERE during && '[2024-01-01, 2024-01-31]'::tsrange;

-- 相似度（pg_trgm 扩展）
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_name_trgm ON users USING GIST (name gist_trgm_ops);
SELECT * FROM users WHERE name % '张三';
```

### 索引维护

```sql
-- 查看索引使用情况
SELECT
    indexrelname AS index_name,
    idx_scan AS scans,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- 查找未使用的索引（可考虑删除）
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE '%pkey';

-- 重建膨胀索引
REINDEX INDEX CONCURRENTLY idx_orders_user_id;
```

---

## 4. 分区表使用

### 声明式分区（PG 10+）

```sql
-- 按范围分区（时间序列数据）
CREATE TABLE orders (
    id BIGSERIAL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE orders_2024q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE orders_2024q2 PARTITION OF orders
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE orders_2024q3 PARTITION OF orders
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE orders_2024q4 PARTITION OF orders
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

-- 默认分区（兜底）
CREATE TABLE orders_default PARTITION OF orders DEFAULT;

-- 自动创建分区（pg_partman 扩展）
CREATE EXTENSION pg_partman;
SELECT partman.create_parent(
    'public.orders', 'created_at', 'native', 'monthly'
);
```

### 列表分区

```sql
CREATE TABLE users (
    id BIGSERIAL,
    region VARCHAR(20) NOT NULL,
    name TEXT
) PARTITION BY LIST (region);

CREATE TABLE users_cn PARTITION OF users FOR VALUES IN ('CN');
CREATE TABLE users_us PARTITION OF users FOR VALUES IN ('US');
CREATE TABLE users_eu PARTITION OF users FOR VALUES IN ('EU');
```

### 分区裁剪验证

```sql
-- 确认查询只扫描相关分区
EXPLAIN SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01';
-- 应只显示 orders_2024q1
```

---

## 5. pg_stat_statements 分析

### 启用扩展

```ini
# postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
```

```sql
CREATE EXTENSION pg_stat_statements;
```

### 常用分析查询

```sql
-- 最耗时的 SQL（Top 10）
SELECT
    query,
    calls,
    round(total_exec_time::numeric, 2) AS total_ms,
    round(mean_exec_time::numeric, 2) AS avg_ms,
    round((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) AS pct,
    rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- 最频繁调用的 SQL
SELECT
    query,
    calls,
    round(mean_exec_time::numeric, 2) AS avg_ms,
    rows / calls AS avg_rows
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- 平均耗时最长的 SQL
SELECT
    query,
    calls,
    round(mean_exec_time::numeric, 2) AS avg_ms,
    round(stddev_exec_time::numeric, 2) AS stddev_ms
FROM pg_stat_statements
WHERE calls > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- IO 密集型查询
SELECT
    query,
    calls,
    shared_blks_hit + shared_blks_read AS total_blks,
    round(100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0), 2) AS hit_pct
FROM pg_stat_statements
ORDER BY shared_blks_read DESC
LIMIT 10;
```

### Go 应用集成

```go
type SlowQuery struct {
    Query    string  `db:"query"`
    Calls    int64   `db:"calls"`
    TotalMs  float64 `db:"total_ms"`
    AvgMs    float64 `db:"avg_ms"`
    Rows     int64   `db:"rows"`
}

func GetSlowQueries(pool *pgxpool.Pool) ([]SlowQuery, error) {
    rows, err := pool.Query(context.Background(), `
        SELECT query, calls,
               round(total_exec_time::numeric, 2) AS total_ms,
               round(mean_exec_time::numeric, 2) AS avg_ms,
               rows
        FROM pg_stat_statements
        ORDER BY total_exec_time DESC
        LIMIT 10
    `)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var queries []SlowQuery
    for rows.Next() {
        var q SlowQuery
        if err := rows.Scan(&q.Query, &q.Calls, &q.TotalMs, &q.AvgMs, &q.Rows); err != nil {
            return nil, err
        }
        queries = append(queries, q)
    }
    return queries, nil
}
```

### 重置统计

```sql
-- 重置所有统计
SELECT pg_stat_statements_reset();

-- 部分版本支持按查询ID重置
-- SELECT pg_stat_statements_reset(queryid);
```
