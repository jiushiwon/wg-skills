---
name: database-learning-skill
description: 数据库学习与选型技能。面向零基础学习者，系统学习数据结构、事务、索引、查询优化等核心概念，对比 MySQL 与 PostgreSQL 的差异与适用场景。触发词："数据库学习"、"学数据库"、"数据库入门"、"MySQL vs PostgreSQL"、"数据库索引"、"数据库事务"、"数据库选型"、"数据库查询优化"。
---

# Database Learning Skill

面向零基础学习者，系统学习数据库核心概念，掌握数据库选型与优化能力。

## 核心理念

> **数据库 = 数据的仓库 + 管理的艺术**

学数据库不是背命令，而是理解：
- 数据如何组织（表结构）
- 数据如何关联（关系）
- 数据如何高效查找（索引）
- 数据如何安全（事务）
- 什么场景选什么数据库（选型）

## 学习路径

```
数据库入门
    ↓
表结构设计（数据结构）
    ↓
数据查询（SQL 基础）
    ↓
索引与查询优化
    ↓
事务与并发控制
    ↓
MySQL vs PostgreSQL 选型
```

## 学习模块

### 1. 数据结构（表设计）

| 概念 | 说明 |
|------|------|
| 表（Table） | 数据的二维表格，像 Excel |
| 字段（Column） | 表的列，如 id、name、age |
| 记录（Row） | 表的行，一条数据 |
| 主键（Primary Key） | 唯一标识一条记录 |
| 外键（Foreign Key） | 表与表的关联 |
| 约束 | 数据的规则（唯一、非空、默认值） |

**实战**：设计一个用户表、一个订单表

### 2. SQL 查询

| 操作 | SQL 关键字 |
|------|-----------|
| 查询 | SELECT |
| 插入 | INSERT |
| 更新 | UPDATE |
| 删除 | DELETE |
| 条件 | WHERE |
| 排序 | ORDER BY |
| 分组 | GROUP BY |
| 聚合 | COUNT/SUM/AVG/MAX/MIN |

### 3. 索引（核心）

**为什么需要索引？**

```
无索引：逐行扫描 → 10万行 = 10万次 IO
有索引：B+Tree 定位 → 10万行 ≈ 3次 IO
```

| 索引类型 | 说明 | 适用场景 |
|----------|------|----------|
| 主键索引 | 自动唯一，非空 | 主键字段 |
| 唯一索引 | 字段值唯一 | username、email |
| 普通索引 | 加速查找 | 常用查询字段 |
| 复合索引 | 多字段组合 | 多条件查询 |
| 全文索引 | 文本搜索 | 文章内容搜索 |

**最左前缀原则**：复合索引 (a, b, c) 能命中 a、a+b、a+b+c，不能命中 b、c

### 4. 事务（核心）

**什么是事务？**

事务 = 一组 SQL 操作，要么全部成功，要么全部失败

```
转账场景：
1. A 账户 -1000
2. B 账户 +1000
必须一起成功或一起失败
```

**ACID 特性**

| 特性 | 说明 |
|------|------|
| Atomic（原子性） | 不可分割，要么全成功要么全失败 |
| Consistency（一致性） | 事务前后数据状态一致 |
| Isolation（隔离性） | 并发事务互不干扰 |
| Durability（持久性） | 提交后数据永久保存 |

**隔离级别**

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|-----------|------|
| 读未提交 | 有 | 有 | 有 |
| 读已提交 | 无 | 有 | 有 |
| 可重复读 | 无 | 无 | 有 |
| 串行化 | 无 | 无 | 无 |

> MySQL 默认：可重复读（RR）
> PostgreSQL 默认：读已提交（RC）

### 5. 查询优化

**慢查询分析**

```sql
-- 开启慢查询日志
SHOW VARIABLES LIKE 'slow_query_log';

-- 查看慢查询
SELECT * FROM slow_log ORDER BY start_time DESC LIMIT 10;

-- 使用 EXPLAIN 分析查询
EXPLAIN SELECT * FROM users WHERE username = 'test';
```

**优化技巧**

1. **避免 SELECT *** → 只查询需要的字段
2. **避免函数运算** → WHERE age * 2 > 30 改为 WHERE age > 15
3. **避免隐式转换** → '123' vs 123
4. **使用索引** → 确保 WHERE 条件有索引
5. **分页优化** → SELECT * FROM users LIMIT 100000, 10 改为 WHERE id > last_id

### 6. MySQL vs PostgreSQL 选型

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| 定位 | Web 应用 | 企业级/复杂查询 |
| 事务 | 支持 | 支持（更完善） |
| JSON | 支持 | 更强（JSONB） |
| 全文搜索 | 基础 | 强大 |
| 地理信息 | 插件 | 原生支持 |
| 窗口函数 | 支持 | 完整支持 |
| CTEs | 8.0+ 支持 | 原生支持 |
| 主从复制 | MySQL Binlog | PostgreSQL WAL |
| 性能 | 简单查询快 | 复杂查询强 |
| 生态 | 广泛 | 增长快 |

**选型建议**

| 场景 | 推荐 |
|------|------|
| 博客、CMS、电商 | MySQL |
| 数据分析、报表 | PostgreSQL |
| 需要 JSON 文档 | PostgreSQL |
| 需要 GIS 地理 | PostgreSQL |
| 团队熟悉 MySQL | MySQL |
| 需要事务强一致性 | PostgreSQL |
| 高并发简单查询 | MySQL |
| 复杂查询/联表 | PostgreSQL |

## 核心概念速查

### 数据类型选择

| 数据 | MySQL | PostgreSQL |
|------|-------|-----------|
| 整数 | INT/BIGINT | INTEGER/BIGINT |
| 浮点数 | FLOAT/DOUBLE | REAL/DOUBLE PRECISION |
| 字符串 | VARCHAR/TEXT | VARCHAR/TEXT |
| 日期时间 | DATETIME/TIMESTAMP | TIMESTAMP |
| 布尔 | TINYINT(1) | BOOLEAN |
| JSON | JSON | JSONB（推荐） |

### 字段命名规范

- 英文小写 + 下划线：`user_name`（不是 userName）
- 有意义：`created_at`（不是 ctime）
- 有前缀：`wg_user`（wg_ 是表前缀）

### 表设计原则

1. **每表有主键**：自增 BIGINT
2. **有创建/更新时间**：`created_at`、`updated_at`
3. **支持软删除**：`deleted_at`
4. **必要的索引**：WHERE 常用字段加索引

## 触发场景

```
数据库学习：
/database-learning-skill 什么是数据库事务
/database-learning-skill 索引是什么
/database-learning-skill MySQL 和 PostgreSQL 区别
/database-learning-skill 怎么优化慢查询
/database-learning-skill 复合索引怎么用
/database-learning-skill 帮我设计一个用户表
```

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/sql-basics.md` | SQL 基础语法速查 |
| `references/index-guide.md` | 索引详解与实战 |
| `references/transaction-guide.md` | 事务与并发控制 |
| `references/query-optimization.md` | 查询优化实战 |
| `references/mysql-vs-pgsql.md` | MySQL vs PG 选型对比 |

## 相关技能

- `database-skill`：数据库选型
- `mysql-module-skill`：MySQL 集成
- `pgsql-module-skill`：PostgreSQL 集成
- `springboot-init-skill`：后端骨架（含数据库集成）
- `fastapi-init-skill`：后端骨架（含数据库集成）
- `go-gin-init-skill`：后端骨架（含数据库集成）

## 不做

- 不涉及数据库安装部署（参考 database-skill）
- 不涉及数据库集群/高可用架构
- 不涉及具体 ORM 的使用（各后端 skill 负责）
- 不涉及 SQL 深度优化（DBA 范畴）
