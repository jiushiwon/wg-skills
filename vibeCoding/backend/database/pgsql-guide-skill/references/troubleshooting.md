# PostgreSQL 常见问题排查

> 生产环境中最常见的 5 类问题及其排查思路。

---

## 1. 连接超时排查

### 症状

- 应用报 `Connection timed out` 或 `Connection refused`
- 响应变慢，连接获取超时

### 排查步骤

```sql
-- 1. 检查当前连接数
SELECT count(*) AS total,
       state,
       wait_event_type,
       wait_event
FROM pg_stat_activity
GROUP BY state, wait_event_type, wait_event;

-- 2. 检查是否达到上限
SHOW max_connections;
SELECT count(*) FROM pg_stat_activity;

-- 3. 查看长时间空闲的事务
SELECT pid, now() - xact_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC LIMIT 10;

-- 4. 检查是否有锁等待
SELECT blocked.pid AS blocked_pid,
       blocked.query AS blocked_query,
       blocking.pid AS blocking_pid,
       blocking.query AS blocking_query
FROM pg_stat_activity AS blocked
JOIN pg_locks AS bl ON bl.pid = blocked.pid
JOIN pg_locks AS kl ON kl.locktype = bl.locktype
  AND kl.database IS NOT DISTINCT FROM bl.database
  AND kl.relation IS NOT DISTINCT FROM bl.relation
  AND kl.page IS NOT DISTINCT FROM bl.page
  AND kl.tuple IS NOT DISTINCT FROM bl.tuple
  AND kl.transactionid IS NOT DISTINCT FROM bl.transactionid
  AND kl.pid != bl.pid
JOIN pg_stat_activity AS blocking ON blocking.pid = kl.pid
WHERE NOT bl.granted;
```

### 关键配置

```ini
# postgresql.conf
tcp_keepalives_idle = 60        # TCP 心跳间隔
tcp_keepalives_interval = 10
tcp_keepalives_count = 6

idle_in_transaction_session_timeout = '30s'  # 空闲事务超时
statement_timeout = '30s'                     # SQL 执行超时
```

### 应用层防御（Go 示例）

```go
config.ConnConfig.ConnectTimeout = 10 * time.Second

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
row := pool.QueryRow(ctx, "SELECT 1")
```

---

## 2. Too many connections 错误

### 症状

```
FATAL: too many connections for role "xxx"
FATAL: sorry, too many clients already
```

### 排查与解决

```sql
-- 查看每用户的连接数
SELECT usename, count(*)
FROM pg_stat_activity
GROUP BY usename ORDER BY count DESC;

-- 查看每数据库的连接数
SELECT datname, count(*)
FROM pg_stat_activity
GROUP BY datname ORDER BY count DESC;

-- 终止空闲连接
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < now() - interval '10 minutes';
```

### 解决方案

| 方案 | 操作 | 优先级 |
|------|------|--------|
| 应用层连接池 | 确保每个实例连接数受控 | 高 |
| PgBouncer | 部署连接池中间件 | 高 |
| 调整 `max_connections` | 增大值（需重启） | 中 |
| 超时配置 | 设置 `idle_in_transaction_session_timeout` | 高 |

```bash
# 临时调整（需要超级用户权限，无需重启）
ALTER SYSTEM SET max_connections = 200;
-- 注意：实际需要重启 PostgreSQL 才能生效

# 设置空闲事务超时（立即生效）
ALTER SYSTEM SET idle_in_transaction_session_timeout = '60s';
SELECT pg_reload_conf();
```

---

## 3. 死锁排查

### 症状

应用报错：`ERROR: deadlock detected`

### 排查

```sql
-- 查看死锁日志
-- postgresql.conf 中设置：
-- log_lock_waits = on
-- deadlock_timeout = '1s'

-- 查看当前锁等待
SELECT
    blocked_locks.pid     AS blocked_pid,
    blocked_activity.usename  AS blocked_user,
    blocking_locks.pid     AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query    AS blocked_query,
    blocking_activity.query   AS blocking_query,
    blocked_locks.locktype
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity
    ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.relation = blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity
    ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

### 预防措施

```java
// Java: 固定加锁顺序
@Transactional
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    // 始终按 ID 升序加锁，避免交叉等待
    Long first = Math.min(fromId, toId);
    Long second = Math.max(fromId, toId);

    Account a = repo.findById(first, LockModeType.PESSIMISTIC_WRITE);
    Account b = repo.findById(second, LockModeType.PESSIMISTIC_WRITE);
    // ...
}
```

```sql
-- SQL: 使用 NOWAIT 快速失败
SELECT * FROM orders WHERE id = 123 FOR UPDATE NOWAIT;

-- 使用 SKIP LOCKED 跳过已锁行（队列场景）
SELECT * FROM tasks WHERE status = 'pending'
ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;
```

---

## 4. VACUUM 和表膨胀

### 症状

- 表占用空间持续增长，但数据量未增加
- 查询变慢，索引扫描效率下降

### 检测膨胀

```sql
-- 查看表膨胀率
SELECT
    schemaname || '.' || relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup::numeric / GREATEST(n_live_tup, 1) * 100, 2) AS dead_pct,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC;

-- 查看索引膨胀
SELECT
    schemaname || '.' || indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 解决方案

```sql
-- 1. 常规 VACUUM（不锁表）
VACUUM VERBOSE table_name;

-- 2. VACUUM FULL（锁表，回收空间）
-- 生产环境慎用，会阻塞所有操作
VACUUM FULL table_name;

-- 3. 使用 pg_repack（推荐，不锁表）
-- 需要安装扩展
CREATE EXTENSION pg_repack;
-- 命令行执行
-- pg_repack -d mydb -t table_name

-- 4. 调整 autovacuum 参数（针对大表）
ALTER TABLE big_table SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02,
    autovacuum_vacuum_cost_delay = 10
);
```

### 预防配置

```ini
# postgresql.conf
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = '1min'
autovacuum_vacuum_threshold = 50
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_threshold = 50
autovacuum_analyze_scale_factor = 0.05
```

---

## 5. 序列耗尽问题

### 症状

```
ERROR: nextval: reached maximum value of sequence "xxx_id_seq"
```

### 排查

```sql
-- 查看序列状态
SELECT
    sequencename,
    last_value,
    max_value,
    round(last_value::numeric / max_value * 100, 2) AS usage_pct
FROM pg_sequences
WHERE schemaname = 'public';

-- 查看所有序列使用率
SELECT
    c.relname AS sequence_name,
    s.seqmax AS max_value,
    s.seqvalue AS current_value,
    round(s.seqvalue::numeric / s.seqmax * 100, 2) AS usage_pct
FROM pg_sequence s
JOIN pg_class c ON c.oid = s.seqrelid
WHERE s.seqvalue::numeric / s.seqmax > 0.8;
```

### 解决方案

```sql
-- 1. 扩展为 BIGINT（需要停机维护）
ALTER TABLE users ALTER COLUMN id TYPE BIGINT;

-- 2. 重置序列起始值（如果当前值异常大）
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. 对于 INT 类型，切换到更大的序列范围
-- INT 最大值: 2,147,483,647
-- BIGINT 最大值: 9,223,372,036,854,775,807

-- 4. 监控告警（提前预警）
-- 当使用率超过 70% 时触发告警
```

### 预防建议

- 新表统一使用 `BIGSERIAL` 或 `BIGINT GENERATED ALWAYS AS IDENTITY`
- 定期检查序列使用率
- 避免使用 `SETVAL` 跳跃式分配（容易造成序列浪费）
