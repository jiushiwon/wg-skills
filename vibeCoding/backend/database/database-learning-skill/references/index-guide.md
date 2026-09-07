# 索引详解与实战

## 1. 为什么需要索引？

**没有索引**：逐行扫描，10万条数据 = 10万次 IO
**有索引**：B+Tree 定位，10万条数据 ≈ 3次 IO

```
无索引：O(n) 线性查找
有索引：O(log n) 对数查找
```

## 2. 索引原理

### 2.1 B+Tree（最常用）

```
        [根节点]
       /   |   \
   [枝节点] [枝节点] [枝节点]
    /  \   /  \   /  \
  [叶] [叶] [叶] [叶] ...
  ↓    ↓    ↓    ↓
  1    5    9    13   (有序数据)
```

**特点**：
- 所有数据都在叶子节点
- 叶子节点之间用链表连接
- 树高固定为 3 层可存 2000 万数据

### 2.2 Hash 索引

```
key -> hash(key) -> 存储地址
```

**特点**：
- 等值查询快（=）
- 范围查询慢（不支持 > < BETWEEN）
- 内存友好

## 3. 索引类型

### 3.1 主键索引 (Primary Key)

```sql
-- 自动创建
CREATE TABLE t1 (
  id BIGINT PRIMARY KEY  -- 主键索引
);

-- 或显式创建
CREATE TABLE t2 (
  id BIGINT,
  PRIMARY KEY (id)
);
```

### 3.2 唯一索引 (Unique)

```sql
CREATE UNIQUE INDEX uk_username ON wg_user(username);
CREATE UNIQUE INDEX uk_email ON wg_user(email);
```

### 3.3 普通索引 (Index)

```sql
CREATE INDEX idx_status ON wg_user(status);
CREATE INDEX idx_created_at ON wg_user(created_at);
```

### 3.4 复合索引 (Composite)

```sql
-- 多字段索引 (a, b, c)
CREATE INDEX idx_status_created ON wg_user(status, created_at DESC);
```

### 3.5 全文索引 (Full-Text)

```sql
-- MySQL
ALTER TABLE wg_article ADD FULLTEXT ft_content (title, content);

-- PostgreSQL
CREATE INDEX ft_content ON wg_article USING GIN(to_tsvector('english', title || ' ' || content));
```

## 4. 最左前缀原则

复合索引 `(a, b, c)`：

| 查询条件 | 是否命中索引 |
|----------|-------------|
| WHERE a = 1 | [OK] 命中 a |
| WHERE a = 1 AND b = 2 | [OK] 命中 a, b |
| WHERE a = 1 AND b = 2 AND c = 3 | [OK] 命中 a, b, c |
| WHERE b = 2 | [X] 不命中 |
| WHERE b = 2 AND c = 3 | [X] 不命中 |
| WHERE a = 1 AND c = 3 | [OK] 命中 a（跳过 b） |

**实战建议**：把**区分度高**的字段放前面

```sql
-- 不好：区分度低放前面
INDEX (status, user_id)  -- status 只有 0/1 两种值

-- 好：区分度高放前面
INDEX (user_id, status)  -- user_id 区分度高
```

## 5. 索引失效的坑

### 5.1 函数/运算

```sql
-- [X] 失效
SELECT * FROM wg_user WHERE YEAR(created_at) = 2024;
SELECT * FROM wg_user WHERE id + 1 = 100;

-- [OK] 生效
SELECT * FROM wg_user WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
SELECT * FROM wg_user WHERE id = 99;
```

### 5.2 隐式类型转换

```sql
-- [X] 失效：字符串转数字
SELECT * FROM wg_user WHERE phone = 13800138000;

-- [OK] 生效
SELECT * FROM wg_user WHERE phone = '13800138000';
```

### 5.3 LIKE 通配符

```sql
-- [OK] 生效：前缀匹配
SELECT * FROM wg_user WHERE username LIKE 'admin%';

-- [X] 失效：通配符在前面
SELECT * FROM wg_user WHERE username LIKE '%admin';
```

### 5.4 OR

```sql
-- [X] 可能失效：OR 导致索引失效
SELECT * FROM wg_user WHERE username = 'a' OR status = 1;

-- [OK] 改用 UNION
SELECT * FROM wg_user WHERE username = 'a'
UNION ALL
SELECT * FROM wg_user WHERE status = 1;
```

### 5.5 NOT

```sql
-- [X] 失效
SELECT * FROM wg_user WHERE status != 1;
SELECT * FROM wg_user WHERE status NOT IN (1, 2);

-- [OK] 生效
SELECT * FROM wg_user WHERE status = 0;
```

## 6. 索引设计原则

### 6.1 应该建索引

| 场景 | 示例 |
|------|------|
| WHERE 条件 | `WHERE status = 1` → `INDEX idx_status (status)` |
| ORDER BY | `ORDER BY created_at` → `INDEX idx_created_at (created_at)` |
| JOIN 条件 | `JOIN ON user.id = order.user_id` → `INDEX idx_user_id (user_id)` |
| 唯一字段 | username, email → UNIQUE 索引 |

### 6.2 不该建索引

| 场景 | 原因 |
|------|------|
| 区分度低 | 状态、性别（只有 0/1/2） |
| 频繁更新 | 索引需要维护，写入变慢 |
| 少量数据 | 10 条数据无需索引 |
| 不用于查询的字段 | 浪费空间 |

### 6.3 索引数量

- 单表 **不超过 5 个**索引
- 每个索引 **不超过 4 个**字段

## 7. 索引优化实战

### 7.1 慢查询分析

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- 查看慢查询
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- 使用 EXPLAIN
EXPLAIN SELECT * FROM wg_user WHERE username = 'test';

-- 详细分析
EXPLAIN FORMAT=JSON SELECT * FROM wg_user WHERE status = 1;
```

### 7.2 EXPLAIN 关键字段

| 字段 | 说明 | 好的值 |
|------|------|--------|
| type | 连接类型 | const, eq_ref, ref |
| key | 实际使用的索引 | 非 NULL |
| rows | 扫描行数 | 越少越好 |
| Extra | 额外信息 | Using index |

**type 排序**（从好到差）：
```
const > eq_ref > ref > range > index > ALL
```

### 7.3 覆盖索引

```sql
-- [X] 回表查询
SELECT id, username, email, created_at
FROM wg_user WHERE username = 'test';
-- 先查索引，再查主键对应行

-- [OK] 覆盖索引（不需要回表）
SELECT id, username
FROM wg_user WHERE username = 'test';
-- 索引包含所有需要的数据
```

### 7.4 索引下推 (ICP)

```sql
-- MySQL 5.6+ 自动开启
SELECT * FROM wg_user WHERE status = 1 AND nickname LIKE '张%';
-- 在索引层面先过滤 status，再过滤 nickname
```

## 8. MySQL vs PostgreSQL 索引

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| B+Tree | 支持 | 支持 |
| Hash | 支持 | 支持 |
| GiST | - | 支持（地理信息） |
| GIN | - | 支持（JSON/全文） |
| BRIN | - | 支持（时序数据） |
| 表达式索引 | - | 支持 |
| 部分索引 | 支持 | 支持 |

### PostgreSQL 特有

```sql
-- 表达式索引
CREATE INDEX idx_lower_email ON wg_user(LOWER(email));

-- 部分索引
CREATE INDEX idx_active_user ON wg_user(user_id) WHERE status = 1;

-- JSON 索引
CREATE INDEX idx_data ON wg_order USING GIN(data);
```

## 9. 快速查阅

| 操作 | SQL |
|------|-----|
| 查看索引 | `SHOW INDEX FROM wg_user;` |
| 创建索引 | `CREATE INDEX idx_name ON table(col);` |
| 删除索引 | `DROP INDEX idx_name ON table;` |
| 分析查询 | `EXPLAIN SELECT ...` |
| 查看执行计划 | `EXPLAIN ANALYZE SELECT ...` |
