# MySQL vs PostgreSQL 选型对比

## 1. 整体定位

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| 定位 | Web 应用（轻量、快速） | 企业级/复杂业务 |
| 特点 | 简单查询快 | 复杂查询强 |
| 复杂度 | 低 | 中 |
| 学习曲线 | 平缓 | 稍陡 |

## 2. 核心差异

### 2.1 SQL 标准

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| SQL 标准 | 部分支持 | 完整支持 |
| 窗口函数 | 8.0+ 支持 | 原生支持 |
| CTE | 8.0+ 支持 | 原生支持 |
| MERGE 语句 | 不支持 | 支持 |

### 2.2 数据类型

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| 布尔 | TINYINT(1) | BOOLEAN |
| JSON | JSON / JSONB | JSONB（推荐） |
| 数组 | 不支持 | 支持 |
| 范围类型 | 不支持 | 支持 |
| UUID | VARCHAR(36) | UUID |
| GIS | 插件 | 原生 PostGIS |

### 2.3 索引

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| B+Tree | 支持 | 支持 |
| Hash | 支持 | 支持 |
| 全文索引 | FULLTEXT | GIN（更强） |
| 表达式索引 | 不支持 | 支持 |
| 部分索引 | 有限 | 支持 |
| GiST/GIN | 插件 | 原生支持 |

### 2.4 事务与隔离

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| 默认隔离级别 | REPEATABLE READ | READ COMMITTED |
| 嵌套事务 | 不支持 | 支持（Savepoint） |
| 事务保存点 | 支持 | 支持 |
| MVCC | 事务ID | 独立系统字段 |

### 2.5 性能

| 场景 | MySQL | PostgreSQL |
|------|-------|-----------|
| 简单 SELECT | 快 | 中 |
| 复杂 JOIN | 慢 | 快 |
| 大数据量写入 | 快 | 中 |
| 大量并发 | 好 | 好 |
| 地理信息 | 弱 | 强 |

## 3. 详细对比

### 3.1 JSON 处理

**MySQL**
```sql
-- JSON 字段
CREATE TABLE t1 (
  data JSON
);

-- 查询
SELECT data->>'$.name' FROM t1;  -- 字符串
SELECT data->'$.name' FROM t1;   -- JSON

-- 索引（5.7+）
ALTER TABLE t1 ADD INDEX idx_data ((CAST(data->>'$.name' AS CHAR(255))));
```

**PostgreSQL**
```sql
-- JSONB 字段（推荐）
CREATE TABLE t1 (
  data JSONB
);

-- 查询
SELECT data->>'name' FROM t1;  -- 字符串
SELECT data->'name' FROM t1;   -- JSON

-- 索引（GIN，最强）
CREATE INDEX idx_data ON t1 USING GIN(data);

-- 包含查询
SELECT * FROM t1 WHERE data @> '{"name": "test"}';
SELECT * FROM t1 WHERE data ? 'name';
```

### 3.2 全文搜索

**MySQL**
```sql
-- 全文索引
ALTER TABLE t1 ADD FULLTEXT ft_title (title, content);

-- 查询
SELECT * FROM t1 WHERE MATCH(title, content) AGAINST('keyword');
```

**PostgreSQL**
```sql
-- GIN 索引
ALTER TABLE t1 ADD COLUMN tsv TSVECTOR;
UPDATE t1 SET tsv = to_tsvector('english', title || ' ' || content);
CREATE INDEX idx_tsv ON t1 USING GIN(tsv);

-- 查询
SELECT * FROM t1 WHERE tsv @@ to_tsquery('english', 'keyword');

-- 中文分词（需配置）
SELECT * FROM t1 WHERE to_tsvector('simple', title) @@ plainto_tsquery('simple', '关键词');
```

### 3.3 窗口函数

**MySQL 8.0+**
```sql
SELECT
  username,
  created_at,
  ROW_NUMBER() OVER (ORDER BY created_at) as row_num,
  RANK() OVER (ORDER BY created_at) as rank,
  DENSE_RANK() OVER (ORDER BY created_at) as dense_rank,
  SUM(amount) OVER (PARTITION BY status ORDER BY created_at) as running_sum
FROM wg_user;
```

**PostgreSQL**
```sql
-- 完全相同语法，PostgreSQL 8.4+ 就支持
SELECT
  username,
  created_at,
  ROW_NUMBER() OVER (ORDER BY created_at) as row_num
FROM wg_user;
```

### 3.4 CTE（公共表表达式）

**MySQL 8.0+**
```sql
WITH cte AS (
  SELECT * FROM wg_user WHERE status = 1
)
SELECT * FROM cte WHERE id > 100;
```

**PostgreSQL**
```sql
-- 同样的语法
WITH cte AS (
  SELECT * FROM wg_user WHERE status = 1
)
SELECT * FROM cte WHERE id > 100;

-- 递归 CTE（树形结构）
WITH RECURSIVE tree AS (
  SELECT id, name, parent_id FROM category WHERE id = 1
  UNION ALL
  SELECT c.id, c.name, c.parent_id FROM category c
  INNER JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree;
```

### 3.5 数组类型

**MySQL**
```sql
-- 不支持数组，用 JSON 模拟
CREATE TABLE t1 (
  tags JSON
);

INSERT INTO t1 VALUES ('["tag1", "tag2"]');
SELECT * FROM t1 WHERE JSON_CONTAINS(tags, '"tag1"');
```

**PostgreSQL**
```sql
-- 原生数组
CREATE TABLE t1 (
  tags TEXT[]
);

INSERT INTO t1 VALUES (ARRAY['tag1', 'tag2']);
SELECT * FROM t1 WHERE 'tag1' = ANY(tags);
```

### 3.6 范围类型

**MySQL**
```sql
-- 不支持，用两个字段模拟
CREATE TABLE t1 (
  start_date DATE,
  end_date DATE
);
```

**PostgreSQL**
```sql
-- 原生范围类型
CREATE TABLE t1 (
  date_range DATERANGE
);

INSERT INTO t1 VALUES ('[2024-01-01, 2024-12-31)');

-- 查询
SELECT * FROM t1 WHERE date_range @> '2024-06-15';
SELECT * FROM t1 WHERE date_range && '[2024-06-01, 2024-06-30)';  -- 重叠
```

## 4. 选型建议

### 4.1 选 MySQL

| 场景 | 原因 |
|------|------|
| 博客/CMS | 简单查询多，性能好 |
| 电商（基本） | 够用，生态广 |
| 团队熟悉 MySQL | 降低学习成本 |
| 高并发简单查询 | 性能优秀 |
| 创业初期快速原型 | 上手快 |

### 4.2 选 PostgreSQL

| 场景 | 原因 |
|------|------|
| 数据分析/报表 | 复杂查询强 |
| 需要 JSON 文档 | JSONB 强大 |
| 需要 GIS 地理 | PostGIS 原生 |
| 需要事务强一致性 | 事务更完善 |
| 需要递归查询 | CTE 支持更好 |
| 需要数组/范围类型 | 原生支持 |
| 企业级应用 | 功能全面 |

### 4.3 选型决策树

```
开始
  │
  ├─ 需要 GIS/地理信息？
  │   └─ 是 → PostgreSQL
  │
  ├─ 需要复杂的数据分析？
  │   └─ 是 → PostgreSQL
  │
  ├─ 团队更熟悉 MySQL？
  │   └─ 是 → MySQL
  │
  ├─ 主要是简单 CRUD 操作？
  │   └─ 是 → MySQL
  │
  └─ 其他 → PostgreSQL
```

## 5. 性能对比

### 5.1 简单查询

```sql
-- 测试：SELECT * FROM users WHERE id = 1
MySQL:     0.1ms
PostgreSQL: 0.2ms
```

**结论**：MySQL 简单查询稍快

### 5.2 复杂 JOIN

```sql
-- 测试：5表 JOIN + GROUP BY + ORDER BY
MySQL:     500ms
PostgreSQL: 200ms
```

**结论**：PostgreSQL 复杂查询更强

### 5.3 写入性能

```sql
-- 测试：批量写入 10万条
MySQL:     3秒
PostgreSQL: 5秒
```

**结论**：MySQL 写入稍快

## 6. 生态对比

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| 市场份额 | 更广 | 增长快 |
| 文档 | 中文多 | 英文全 |
| 工具 | phpMyAdmin, Navicat | pgAdmin, DBeaver |
| 云支持 | RDS, Aurora | Cloud SQL, RDS |
| 插件 | 少 | 多（PostGIS, pgvector 等） |

## 7. 快速查阅

| 需求 | 推荐 |
|------|------|
| 博客/简单网站 | MySQL |
| 需要 GIS | PostgreSQL |
| 需要 JSON 文档 | PostgreSQL |
| 团队不懂数据库 | MySQL |
| 复杂业务/报表 | PostgreSQL |
| 高并发简单查询 | MySQL |
| 需要递归查询 | PostgreSQL |

## 8. 总结

- **MySQL**：轻量、快速、简单，Web 应用首选
- **PostgreSQL**：功能全面、标准兼容，企业级应用首选

一句话：**简单选 MySQL，复杂选 PostgreSQL**
