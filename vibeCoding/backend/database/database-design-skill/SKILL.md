---
name: database-design-skill
description: 数据库设计规范技能。面向 AI 生成代码，提供表名/字段名规范、索引设计规范、关联规范、性能优化规范、分库分表规范、引擎选择等统一标准。被所有后端 skill 引用，确保 AI 生成的代码遵循统一数据库设计规范。触发词："数据库设计规范"、"表名规范"、"字段名规范"、"索引设计"、"分库分表"、"数据库性能优化"。
---

# Database Design Skill

**数据库设计规范体系**——AI 生成代码时必须遵循的统一标准。

## 核心理念

> **AI 天然会建表，但建得好不好是另一回事。**

本 skill 定义了一套完整的数据库设计规范，确保 AI 生成的后端项目：
- 表结构统一、规范、易维护
- 索引合理、性能有保障
- 关联清晰、不易出错
- 支持扩展、能应对分库分表

---

## 一、表名与字段名规范

### 1.1 命名原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **英文小写** | 全部小写，用下划线分隔 | `user_name`，不是 `userName` |
| **有含义** | 用完整英文单词，不用缩写 | `created_at`，不是 `ctime` |
| **表前缀** | 统一前缀，默认 `wg_` | `wg_user`，`wg_order` |
| **单数名词** | 表名用单数 | `wg_user`，不是 `wg_users` |

### 1.2 基础字段（所有表必须有）

```sql
-- 所有业务表必须包含这些字段
CREATE TABLE "wg_user" (
    "id" BIGSERIAL PRIMARY KEY,
    "status" SMALLINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    "deleted_at" TIMESTAMP DEFAULT NULL COMMENT '删除时间（软删除）'
);

COMMENT ON TABLE "wg_user" IS '用户表';
COMMENT ON COLUMN "wg_user"."status" IS '状态：0-禁用 1-正常';
COMMENT ON COLUMN "wg_user"."deleted_at" IS '软删除时间戳';
```

### 1.3 字段类型选择

| 数据类型 | MySQL | PostgreSQL | 场景 |
|----------|-------|------------|------|
| 主键 | BIGINT UNSIGNED | BIGSERIAL | 自增主键 |
| 状态 | TINYINT | SMALLINT | 0/1/2 等状态码 |
| 布尔 | TINYINT(1) | BOOLEAN | true/false |
| 时间 | DATETIME | TIMESTAMP | 创建/更新时间 |
| 枚举 | ENUM / TINYINT | CHECK 约束 | 有限选项 |
| 大文本 | TEXT | TEXT | 长文本 |
| JSON | JSON / JSONB | JSONB | 动态结构（PG 推荐） |

---

## 二、索引设计规范

### 2.1 索引类型选择

| 索引 | 场景 | 示例 |
|------|------|------|
| **主键索引** | id 字段，自动唯一 | PRIMARY KEY |
| **唯一索引** | 唯一约束字段 | `uk_username` on username |
| **普通索引** | WHERE 常用字段 | `idx_status` on status |
| **复合索引** | 多条件查询 | `idx_status_created` on (status, created_at) |

### 2.2 复合索引最左前缀原则

```sql
-- 复合索引 (status, created_at, user_id)
-- ✅ 能命中：WHERE status = 1
-- ✅ 能命中：WHERE status = 1 AND created_at > '2024-01-01'
-- ✅ 能命中：WHERE status = 1 AND created_at > '2024-01-01' AND user_id = 1
-- ❌ 不能命中：WHERE created_at > '2024-01-01'
-- ❌ 不能命中：WHERE user_id = 1
```

### 2.3 索引设计原则

```sql
-- 必须加索引的场景
-- 1. WHERE 条件字段
-- 2. ORDER BY 排序字段
-- 3. JOIN 连接字段
-- 4. 唯一性约束字段

-- 示例：用户表完整索引
CREATE TABLE "wg_user" (
    "id" BIGSERIAL PRIMARY KEY,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP
);

-- 索引
ALTER TABLE "wg_user" ADD CONSTRAINT "uk_username" UNIQUE ("username");
CREATE INDEX "idx_email" ON "wg_user" ("email");
CREATE INDEX "idx_phone" ON "wg_user" ("phone");
CREATE INDEX "idx_status" ON "wg_user" ("status");
CREATE INDEX "idx_created_at" ON "wg_user" ("created_at");
CREATE INDEX "idx_status_created" ON "wg_user" ("status", "created_at");
```

---

## 三、关联规范

### 3.1 外键使用原则

```sql
-- 推荐：业务层控制关联，数据库层面不强制外键（性能考虑）
-- 但保留外键约束文档，供 DBA 审阅

-- 订单表关联用户
CREATE TABLE "wg_order" (
    "id" BIGSERIAL PRIMARY KEY,
    "user_id" BIGINT NOT NULL COMMENT '用户ID',
    "order_no" VARCHAR(32) NOT NULL COMMENT '订单号',
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '金额',
    "status" SMALLINT NOT NULL DEFAULT 1 COMMENT '状态',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP
);

-- 索引替代外键（性能更好）
CREATE INDEX "idx_user_id" ON "wg_order" ("user_id");
CREATE INDEX "idx_order_no" ON "wg_order" ("order_no" UNIQUE);
CREATE INDEX "idx_status" ON "wg_order" ("status");
```

### 3.2 关联查询规范

```sql
-- ❌ 避免：深度嵌套 JOIN（超过 3 表）
-- ✅ 推荐：分步查询或使用中间表

-- 订单详情查询示例
SELECT o.*, u.username, u.nickname
FROM wg_order o
LEFT JOIN wg_user u ON o.user_id = u.id AND u.deleted_at IS NULL
WHERE o.id = $1 AND o.deleted_at IS NULL;
```

---

## 四、性能优化规范

### 4.1 查询优化规则

| 规则 | 说明 | 示例 |
|------|------|------|
| **避免 SELECT *** | 只查需要的字段 | `SELECT id, username FROM users` |
| **避免函数运算** | 函数会导致索引失效 | `WHERE YEAR(created_at) = 2024` ❌ |
| **避免隐式转换** | 类型要匹配 | `WHERE phone = 13800138000` ❌ |
| **使用分页游标** | 大偏移量用游标 | `WHERE id > last_id` 替代 `LIMIT 100000, 10` |
| **批量操作** | 减少数据库交互 | INSERT/DELETE 批量执行 |

### 4.2 慢查询分析

```sql
-- MySQL 慢查询分析
SHOW VARIABLES LIKE 'slow_query_log';
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- PostgreSQL 慢查询分析
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- EXPLAIN 分析查询
EXPLAIN ANALYZE SELECT * FROM wg_user WHERE username = 'test';
```

### 4.3 分页优化

```sql
-- ❌ 慢：OFFSET 大时性能差
SELECT * FROM wg_order ORDER BY id LIMIT 10 OFFSET 100000;

-- ✅ 快：基于游标的分页
SELECT * FROM wg_order 
WHERE id > 100000 
ORDER BY id 
LIMIT 10;

-- ✅ 适合条件筛选
SELECT * FROM wg_order 
WHERE status = 1 AND id > #{lastId}
ORDER BY id 
LIMIT 10;
```

---

## 五、分库分表规范

### 5.1 分库分表场景

| 场景 | 策略 | 说明 |
|------|------|------|
| **数据量 < 1000万** | 不分 | 单表足以 |
| **1000万 ~ 1亿** | 分表 | 水平分表 |
| **1亿以上** | 分库分表 | 分布式架构 |

### 5.2 分片键选择

```sql
-- 常见分片键
-- 1. 用户ID：按用户维度查询
-- 2. 时间：按时间范围查询（如日志）
-- 3. 地区：按地域查询

-- 示例：订单表按 user_id 分片
CREATE TABLE "wg_order" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "order_no" VARCHAR(32) NOT NULL,
    ...
    PRIMARY KEY ("id", "user_id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
PARTITION BY HASH("user_id") PARTITIONS 16;
```

### 5.3 分库分表中间件

| 中间件 | 特点 | 适用场景 |
|--------|------|----------|
| **ShardingSphere** | 功能完善，支持多语言 | Java 项目 |
| **ShardingJDBC** | 轻量，Java 直连 | Java 项目 |
| **MyCat** | 代理模式 | 多语言项目 |
| **Vitess** | MySQL 分布式 | 规模大 |

---

## 六、数据库引擎与配置

### 6.1 MySQL 引擎选择

| 引擎 | 特点 | 场景 |
|------|------|------|
| **InnoDB** | 支持事务、行锁（默认） | 绝大多数场景 |
| **MyISAM** | 不支持事务、全文索引 | 只读/日志 |
| **Memory** | 内存存储 | 临时表、缓存 |

```sql
-- 创建 InnoDB 表（默认）
CREATE TABLE "wg_user" (
    "id" BIGINT PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 6.2 PostgreSQL 配置

```sql
-- 建议配置
-- 1. 主键使用 BIGSERIAL（自增）
-- 2. 时间使用 TIMESTAMP WITH TIME ZONE
-- 3. 文本使用 TEXT（无长度限制）
-- 4. JSON 优先使用 JSONB（索引支持）
```

---

## 七、交付规范

本 skill 不生成独立文件，决策结果必须落到：

1. **spec.md**（选型期）
   - 数据库类型（MySQL/PG/MongoDB）
   - 表前缀（如 `wg_`）
   - 核心实体清单
   - 是否需要分库分表

2. **生成项目内**
   - 连接配置（.env.example）
   - DDL 迁移文件
   - entity 定义

---

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/naming-convention.md` | 表名/字段名详细规范 |
| `references/index-design.md` | 索引设计详解 |
| `references/sharding-guide.md` | 分库分表实战指南 |
| `references/performance.md` | 性能优化实战 |
| `references/migration-guide.md` | 迁移规范（Flyway/Alembic） |

---

## 不做

- 不负责数据库安装（使用 database-install-skill）
- 不处理数据库集群高可用
- 不提供具体业务表设计（由业务 skill 决定）
- 不替代 DBA 深度优化
