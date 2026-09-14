# 索引设计规范

## 1. 索引类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 主键索引 | 自动唯一，非空 | PRIMARY KEY |
| 唯一索引 | 字段值唯一 | uk_username |
| 普通索引 | 加速查找 | idx_status |
| 复合索引 | 多字段组合 | idx_status_created |

## 2. 复合索引最左前缀

```sql
-- 复合索引 (status, created_at, user_id)
-- ✅ WHERE status = 1
-- ✅ WHERE status = 1 AND created_at > '2024-01-01'
-- ✅ WHERE status = 1 AND created_at > '2024-01-01' AND user_id = 1
-- ❌ WHERE created_at > '2024-01-01'
-- ❌ WHERE user_id = 1
```

## 3. 索引设计原则

必须加索引：
- WHERE 条件字段
- ORDER BY 排序字段
- JOIN 连接字段
- 唯一性约束字段

避免：
- 频繁更新的字段
- 低区分度字段（如性别、状态）
- 不在 WHERE 中的字段

---

## 4. 索引失效场景

### 4.1 函数运算导致索引失效

```sql
-- ❌ 对索引字段使用函数
SELECT * FROM wg_user WHERE YEAR(created_at) = 2024;
SELECT * FROM wg_user WHERE DATE(created_at) = '2024-01-01';
SELECT * FROM wg_user WHERE LEFT(username, 3) = 'zhang';

-- ✅ 改写为范围查询
SELECT * FROM wg_user WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
SELECT * FROM wg_user WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02';
SELECT * FROM wg_user WHERE username LIKE 'zhang%';
```

### 4.2 隐式类型转换

```sql
-- ❌ 字段是 VARCHAR，查询用数字
-- phone 是 VARCHAR(20)
SELECT * FROM wg_user WHERE phone = 13800138000;  -- 隐式转换，索引失效

-- ✅ 类型匹配
SELECT * FROM wg_user WHERE phone = '13800138000';
```

### 4.3 LIKE 模糊查询

```sql
-- ❌ 前缀模糊，索引失效
SELECT * FROM wg_user WHERE username LIKE '%zhang';
SELECT * FROM wg_user WHERE username LIKE '%zhang%';

-- ✅ 后缀模糊可以走索引
SELECT * FROM wg_user WHERE username LIKE 'zhang%';

-- ✅ 全文搜索用 FULLTEXT 索引
CREATE FULLTEXT INDEX ft_user_name ON wg_user(username);
SELECT * FROM wg_user WHERE MATCH(username) AGAINST('zhang' IN BOOLEAN MODE);
```

### 4.4 OR 条件

```sql
-- ❌ OR 可能导致索引失效（除非每个字段都有索引）
SELECT * FROM wg_user WHERE username = 'zhang' OR email = 'zhang@test.com';

-- ✅ 改写为 UNION
SELECT * FROM wg_user WHERE username = 'zhang'
UNION
SELECT * FROM wg_user WHERE email = 'zhang@test.com';
```

### 4.5 NOT / != / <>

```sql
-- ❌ 不等于条件通常不走索引
SELECT * FROM wg_user WHERE status != 0;
SELECT * FROM wg_user WHERE status <> 0;
SELECT * FROM wg_user WHERE status NOT IN (0, 1);

-- ✅ 如果区分度高，改写为 IN
SELECT * FROM wg_user WHERE status IN (1, 2, 3);
```

### 4.6 IS NULL / IS NOT NULL

```sql
-- ⚠️ NULL 值判断可能不走索引（取决于数据分布）
SELECT * FROM wg_user WHERE deleted_at IS NULL;
SELECT * FROM wg_user WHERE deleted_at IS NOT NULL;

-- ✅ 用默认值代替 NULL
ALTER TABLE wg_user ADD COLUMN deleted_at DATETIME DEFAULT '1970-01-01';
SELECT * FROM wg_user WHERE deleted_at = '1970-01-01';  -- 未删除
```

---

## 5. EXPLAIN 输出解读

### 5.1 MySQL EXPLAIN 字段说明

```sql
EXPLAIN SELECT * FROM wg_user WHERE email = 'test@example.com';
```

| 字段 | 说明 | 关注点 |
|------|------|--------|
| id | 查询序号 | 相同id从上到下执行 |
| select_type | 查询类型 | SIMPLE/PRIMARY/SUBQUERY |
| table | 表名 | 访问的表 |
| type | 访问类型 | 重要！见下表 |
| possible_keys | 可能使用的索引 | - |
| key | 实际使用的索引 | NULL表示没用索引 |
| key_len | 索引长度 | 越短越好 |
| rows | 扫描行数 | 越少越好 |
| Extra | 额外信息 | 见下表 |

### 5.2 type 访问类型（性能从好到差）

| type | 说明 | 示例 |
|------|------|------|
| system | 表只有一行 | 系统表 |
| const | 主键/唯一索引等值查询 | WHERE id = 1 |
| eq_ref | 关联查询用主键/唯一索引 | JOIN ON a.id = b.user_id |
| ref | 普通索引等值查询 | WHERE email = 'test' |
| range | 索引范围查询 | WHERE id > 100 |
| index | 全索引扫描 | 覆盖索引 |
| ALL | 全表扫描 | 需要优化！ |

### 5.3 Extra 字段关键值

| Extra | 说明 | 好坏 |
|-------|------|------|
| Using index | 覆盖索引，无需回表 | 好 |
| Using where | 在存储引擎层过滤 | 一般 |
| Using temporary | 使用临时表 | 差，需优化 |
| Using filesort | 额外排序 | 差，需优化 |
| Using index condition | 索引条件下推 | 好 |

### 5.4 PostgreSQL EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM wg_user WHERE email = 'test@example.com';

-- 输出示例：
-- Index Scan using idx_user_email on wg_user  (cost=0.42..8.44 rows=1 width=100)
--   Index Cond: (email = 'test@example.com')
--   Buffers: shared hit=3
-- Planning Time: 0.100 ms
-- Execution Time: 0.050 ms
```

关键指标：
- `Index Scan` vs `Seq Scan`：索引扫描优于顺序扫描
- `rows`：预估行数，与实际偏差大需要 ANALYZE
- `Buffers: shared hit`：缓存命中，越少越好
- `Execution Time`：实际执行时间

---

## 6. 部分索引 / 条件索引

### 6.1 PostgreSQL 部分索引

```sql
-- 只对活跃用户建索引
CREATE INDEX idx_user_active_email ON wg_user(email)
WHERE status = 1 AND deleted_at IS NULL;

-- 查询时自动使用
SELECT * FROM wg_user
WHERE email = 'test@example.com' AND status = 1 AND deleted_at IS NULL;
```

### 6.2 MySQL 前缀索引

```sql
-- 对长字符串只索引前 N 个字符
CREATE INDEX idx_user_email_prefix ON wg_user(email(20));

-- 计算最优前缀长度
SELECT
    COUNT(DISTINCT LEFT(email, 5)) / COUNT(*) AS sel5,
    COUNT(DISTINCT LEFT(email, 10)) / COUNT(*) AS sel10,
    COUNT(DISTINCT LEFT(email, 15)) / COUNT(*) AS sel15,
    COUNT(DISTINCT email) / COUNT(*) AS sel_full
FROM wg_user;
```

---

## 7. 覆盖索引

### 7.1 什么是覆盖索引

覆盖索引：查询的所有字段都在索引中，无需回表查询数据行。

```sql
-- 表结构
CREATE TABLE wg_order (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    status TINYINT,
    amount DECIMAL(10,2),
    created_at DATETIME,
    INDEX idx_user_status_created (user_id, status, created_at)
);

-- ❌ 需要回表（查询了 amount 字段）
SELECT user_id, status, amount FROM wg_order WHERE user_id = 1;

-- ✅ 覆盖索引（所有字段在索引中）
SELECT user_id, status, created_at FROM wg_order WHERE user_id = 1;

-- ✅ 强制覆盖索引
SELECT user_id, status, created_at FROM wg_order FORCE INDEX(idx_user_status_created)
WHERE user_id = 1;
```

### 7.2 覆盖索引设计技巧

```sql
-- 将 SELECT 的字段加入索引末尾
-- 常见查询：SELECT user_id, status, total FROM wg_order WHERE user_id = ? AND status = ?

-- ❌ 普通索引
CREATE INDEX idx_order_user_status ON wg_order(user_id, status);

-- ✅ 覆盖索引
CREATE INDEX idx_order_user_status_total ON wg_order(user_id, status, total);
```

---

## 8. 索引监控查询

### 8.1 MySQL 索引使用统计

```sql
-- 查看索引使用情况
SELECT
    object_schema,
    object_name,
    index_name,
    count_read,
    count_fetch,
    count_insert,
    count_update,
    count_delete
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'your_database'
ORDER BY count_read DESC;

-- 查看未使用的索引
SELECT
    object_schema,
    object_name,
    index_name
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE index_name IS NOT NULL
    AND count_star = 0
    AND object_schema = 'your_database';
```

### 8.2 PostgreSQL 索引使用统计

```sql
-- 启用 pg_stat_statements 扩展
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 查看索引使用情况
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 查看未使用的索引
SELECT
    schemaname,
    relname,
    indexrelname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexrelname NOT LIKE '%pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 查看索引大小
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### 8.3 索引碎片整理

```sql
-- MySQL：重建索引
ALTER TABLE wg_user DROP INDEX idx_user_email, ADD INDEX idx_user_email(email);
-- 或
OPTIMIZE TABLE wg_user;

-- PostgreSQL：重建索引
REINDEX INDEX idx_user_email;
-- 或在线重建（不锁表）
REINDEX INDEX CONCURRENTLY idx_user_email;
```

---

## 9. 索引设计实战

### 9.1 电商订单表索引设计

```sql
CREATE TABLE wg_order (
    id BIGINT UNSIGNED PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    -- 唯一索引
    UNIQUE KEY uk_order_no (order_no),

    -- 普通索引
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),

    -- 复合索引（覆盖常见查询）
    INDEX idx_user_status_created (user_id, status, created_at)
);

-- 常见查询及索引使用
-- 1. 按订单号查询：uk_order_no ✅
SELECT * FROM wg_order WHERE order_no = 'ORD20240101001';

-- 2. 用户订单列表：idx_user_status_created ✅
SELECT * FROM wg_order
WHERE user_id = 1 AND status = 1
ORDER BY created_at DESC
LIMIT 20;

-- 3. 按时间范围查询：idx_created_at ✅
SELECT * FROM wg_order
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';
```

### 9.2 用户表索引设计

```sql
CREATE TABLE wg_user (
    id BIGINT UNSIGNED PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_phone (phone),
    INDEX idx_status_created (status, created_at)
);
```
