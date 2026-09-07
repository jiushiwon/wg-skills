# 查询优化实战

## 1. 慢查询分析

### 1.1 开启慢查询日志

```sql
-- MySQL
-- 查看慢查询是否开启
SHOW VARIABLES LIKE 'slow_query_log';

-- 开启慢查询
SET GLOBAL slow_query_log = 'ON';

-- 设置慢查询阈值（秒）
SET GLOBAL long_query_time = 1;

-- 查看慢查询日志文件位置
SHOW VARIABLES LIKE 'slow_query_log_file';

-- 查看慢查询
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

### 1.2 EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM wg_user WHERE username = 'test';

-- 结果字段说明
| Field     | 说明                           |
|-----------|-------------------------------|
| id        | 查询编号                       |
| select_type | 查询类型                     |
| table     | 查询的表                       |
| type      | 连接类型（const/eq_ref/ref/range/index/ALL）|
| possible_keys | 可能使用的索引              |
| key       | 实际使用的索引                  |
| key_len   | 索引长度                      |
| ref       | 索引比较的列                    |
| rows      | 扫描行数（估算）                |
| Extra     | 额外信息（Using index/Using filesort等）|
```

### 1.3 EXPLAIN ANALYZE（PostgreSQL）

```sql
-- PostgreSQL 实时分析
EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'test';
```

## 2. 常见性能问题

### 2.1 全表扫描 (ALL)

```sql
-- 不好：全表扫描
EXPLAIN SELECT * FROM wg_user WHERE status = 0;
-- type: ALL, rows: 100000

-- 好：使用索引
EXPLAIN SELECT * FROM wg_user WHERE id = 1;
-- type: const, rows: 1
```

### 2.2 Using filesort

```sql
-- 不好：filesort（内存/磁盘排序）
EXPLAIN SELECT * FROM wg_user ORDER BY created_at DESC;
-- Extra: Using filesort

-- 好：使用索引排序
CREATE INDEX idx_created_at ON wg_user(created_at);
EXPLAIN SELECT * FROM wg_user ORDER BY created_at DESC;
-- Extra: Using index
```

### 2.3 Using temporary

```sql
-- 不好：使用临时表
EXPLAIN SELECT username, COUNT(*) FROM wg_user GROUP BY username;
-- Extra: Using temporary

-- 好：加索引或优化查询
```

## 3. 优化技巧

### 3.1 避免 SELECT *

```sql
-- 不好
SELECT * FROM wg_user WHERE id = 1;

-- 好：只查询需要的字段
SELECT id, username, email FROM wg_user WHERE id = 1;
```

### 3.2 避免函数运算

```sql
-- 不好：索引失效
SELECT * FROM wg_user WHERE YEAR(created_at) = 2024;
SELECT * FROM wg_user WHERE LEFT(username, 5) = 'admin';

-- 好：使用索引
SELECT * FROM wg_user WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
SELECT * FROM wg_user WHERE username LIKE 'admin%';
```

### 3.3 避免隐式类型转换

```sql
-- 不好：隐式转换
SELECT * FROM wg_user WHERE phone = 13800138000;  -- phone 是 VARCHAR

-- 好：类型匹配
SELECT * FROM wg_user WHERE phone = '13800138000';
```

### 3.4 分页优化

```sql
-- 不好：OFFSET 大时很慢
SELECT * FROM wg_user LIMIT 100000, 10;
-- 跳到第100000行很慢

-- 好1：基于主键
SELECT * FROM wg_user WHERE id > 100000 LIMIT 10;

-- 好2：记录上一页最后ID
SELECT * FROM wg_user WHERE id > ? ORDER BY id LIMIT 10;

-- 好3：只查主键再JOIN
SELECT u.* FROM (
    SELECT id FROM wg_user ORDER BY id LIMIT 100000, 10
) t
JOIN wg_user u ON t.id = u.id;
```

### 3.5 批量操作

```sql
-- 不好：循环插入
for (user : users) {
    INSERT INTO wg_user (username) VALUES (user.name);
}

-- 好：批量插入
INSERT INTO wg_user (username) VALUES
  ('user1'), ('user2'), ('user3'), ...;
```

### 3.6 避免 OR

```sql
-- 不好：OR 可能导致索引失效
SELECT * FROM wg_user WHERE username = 'a' OR status = 1;

-- 好：使用 UNION
SELECT * FROM wg_user WHERE username = 'a'
UNION
SELECT * FROM wg_user WHERE status = 1;
```

### 3.7 EXISTS vs IN

```sql
-- 子查询小，主查询大：用 IN
SELECT * FROM wg_user WHERE id IN (SELECT user_id FROM wg_order);

-- 主查询小，子查询大：用 EXISTS
SELECT * FROM wg_user u WHERE EXISTS (
    SELECT 1 FROM wg_order o WHERE o.user_id = u.id
);
```

### 3.8 优化 COUNT(*)

```sql
-- 不好：统计所有行
SELECT COUNT(*) FROM wg_user;

-- 好1：加 WHERE 条件
SELECT COUNT(*) FROM wg_user WHERE status = 1;

-- 好2：使用索引
SELECT COUNT(*) FROM wg_user WHERE id > 0;

-- 好3：记录数存储（需要实时性不高时）
-- 新增一条 status=1 的记录，统计时用总数-1
```

## 4. 索引优化

### 4.1 复合索引顺序

```sql
-- 场景：经常查询 status=1 AND created_at > '2024-01-01'

-- 不好：区分度低的放前面
INDEX (status, created_at)

-- 好：区分度高的放前面
INDEX (created_at, status)
```

### 4.2 覆盖索引

```sql
-- 场景：只需要查询 username 和 email

-- 不好：回表查询
SELECT username, email FROM wg_user WHERE username = 'test';

-- 好：覆盖索引（包含所有查询字段）
CREATE INDEX idx_username_email ON wg_user(username, email);
SELECT username, email FROM wg_user WHERE username = 'test';
```

### 4.3 前缀索引

```sql
-- 字段很长时，使用前缀索引
ALTER TABLE wg_user ADD INDEX idx_email (email(10));

-- 注意：前缀长度选择
SELECT COUNT(DISTINCT LEFT(email, 10)) / COUNT(*) FROM wg_user;
-- 选择区分度接近完整列的前缀长度
```

## 5. SQL 优化案例

### 5.1 订单统计优化

```sql
-- 优化前：10秒
SELECT COUNT(*) FROM wg_order WHERE DATE(created_at) = '2024-01-01';

-- 优化后：0.1秒
-- 加索引
ALTER TABLE wg_order ADD INDEX idx_created_at (created_at);

-- 改写SQL
SELECT COUNT(*) FROM wg_order
WHERE created_at >= '2024-01-01 00:00:00'
AND created_at < '2024-01-02 00:00:00';
```

### 5.2 多表 JOIN 优化

```sql
-- 优化前：3秒
SELECT u.username, o.order_no, p.product_name
FROM wg_user u
LEFT JOIN wg_order o ON u.id = o.user_id
LEFT JOIN wg_order_item oi ON o.id = oi.order_id
LEFT JOIN wg_product p ON oi.product_id = p.id
WHERE u.status = 1;

-- 优化后：0.5秒
-- 1. 给常用条件字段加索引
ALTER TABLE wg_user ADD INDEX idx_status (status);

-- 2. 给 JOIN 字段加索引
ALTER TABLE wg_order ADD INDEX idx_user_id (user_id);

-- 3. 只查询需要的字段
SELECT u.username, o.order_no, p.product_name
FROM wg_user u
INNER JOIN wg_order o ON u.id = o.user_id
INNER JOIN wg_order_item oi ON o.id = oi.order_id
INNER JOIN wg_product p ON oi.product_id = p.id
WHERE u.status = 1;
```

### 5.3 分页优化

```sql
-- 优化前：5秒（OFFSET 50000）
SELECT * FROM wg_order ORDER BY id LIMIT 50000, 10;

-- 优化后：0.1秒
-- 方案：记录上一页最后ID
SELECT * FROM wg_order
WHERE id > 50000
ORDER BY id LIMIT 10;
```

## 6. 读写分离

```yaml
# MySQL 主从配置
# 主库：写入
# 从库：读取

# Spring Boot 配置
spring:
  datasource:
    hikari:
      master:
        jdbc-url: jdbc:mysql://master:3306/db
        username: root
      slave:
        jdbc-url: jdbc:mysql://slave:3306/db
        username: root
```

## 7. 分库分表

### 7.1 垂直分表

```sql
-- 按字段拆分
-- 用户表：基础信息（id, username, password）
-- 用户详情表：扩展信息（user_id, avatar, bio, ...）
```

### 7.2 水平分表

```sql
-- 按数据量拆分
-- 2024年订单：wg_order_2024
-- 2025年订单：wg_order_2025

-- 按用户ID取模
-- wg_order_0, wg_order_1, ... wg_order_9
```

## 8. 快速查阅

| 操作 | SQL |
|------|-----|
| 查看慢查询 | `SELECT * FROM mysql.slow_log` |
| 分析查询 | `EXPLAIN SELECT ...` |
| 查看进程 | `SHOW PROCESSLIST` |
| 杀死进程 | `KILL {id}` |
| 查看索引 | `SHOW INDEX FROM table` |
| 查看表大小 | `SELECT table_name, ROUND(data_length/1024/1024, 2) MB FROM information_schema.tables` |
