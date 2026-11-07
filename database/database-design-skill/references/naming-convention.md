# 表名与字段名规范

## 1. 命名原则

| 原则 | 说明 | 示例 |
|------|------|------|
| 英文小写 | 全部小写，用下划线分隔 | user_name |
| 有含义 | 用完整英文单词 | created_at |
| 表前缀 | 统一前缀，默认 wg_ | wg_user |
| 单数名词 | 表名单数 | user 不是 users |

## 2. 基础字段（所有表必须有）

```sql
-- 必选字段
id          -- 主键
status      -- 状态
created_at  -- 创建时间
updated_at  -- 更新时间
deleted_at  -- 软删除
```

## 3. 字段类型规范

| 类型 | MySQL | PostgreSQL |
|------|-------|------------|
| 主键 | BIGINT UNSIGNED | BIGSERIAL |
| 状态 | TINYINT/SMALLINT | SMALLINT |
| 布尔 | TINYINT(1) | BOOLEAN |
| 时间 | DATETIME | TIMESTAMP |
| 大文本 | TEXT | TEXT |
| JSON | JSON | JSONB |

---

## 4. 命名示例（Good vs Bad）

### 4.1 表命名

| Good | Bad | 原因 |
|------|-----|------|
| `wg_user` | `users` | 单数 + 前缀 |
| `wg_order_item` | `orderItems` | 小写下划线 |
| `wg_user_role` | `t_user_role` | 前缀统一用 wg_ |
| `wg_payment` | `pay` | 用完整单词 |

### 4.2 字段命名

| Good | Bad | 原因 |
|------|-----|------|
| `user_name` | `userName` | 小写下划线 |
| `created_at` | `createTime` | 统一用 _at 后缀 |
| `is_deleted` | `del_flag` | 布尔语义明确 |
| `phone_number` | `phone` | 避免歧义 |
| `order_no` | `orderNumber` | 简洁 + 统一风格 |

### 4.3 索引命名

| 类型 | 格式 | 示例 |
|------|------|------|
| 主键 | `pk_{表名}` | `pk_user` |
| 唯一索引 | `uk_{表名}_{字段}` | `uk_user_email` |
| 普通索引 | `idx_{表名}_{字段}` | `idx_order_status` |
| 复合索引 | `idx_{表名}_{字段1}_{字段2}` | `idx_order_user_created` |
| 全文索引 | `ft_{表名}_{字段}` | `ft_post_content` |

### 4.4 约束命名

| 类型 | 格式 | 示例 |
|------|------|------|
| 外键 | `fk_{表名}_{关联表}` | `fk_order_user` |
| 检查约束 | `ck_{表名}_{字段}` | `ck_user_age` |
| 默认值 | 无需命名 | 直接在 DDL 定义 |

### 4.5 序列命名（PostgreSQL）

```sql
-- 序列格式：{表名}_{字段名}_seq
CREATE SEQUENCE wg_order_order_no_seq;

-- 使用示例
CREATE TABLE wg_order (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(32) DEFAULT 'ORD' || nextval('wg_order_order_no_seq')
);
```

---

## 5. 常见反模式

### 5.1 命名反模式

```sql
-- ❌ 反模式 1：匈牙利命名法
CREATE TABLE t_user (
    i_id INT,
    v_name VARCHAR(50),
    dt_created DATETIME
);

-- ✅ 正确做法
CREATE TABLE wg_user (
    id BIGINT UNSIGNED,
    name VARCHAR(50),
    created_at DATETIME
);

-- ❌ 反模式 2：复数表名
CREATE TABLE users (...);
CREATE TABLE order_items (...);

-- ✅ 正确做法
CREATE TABLE wg_user (...);
CREATE TABLE wg_order_item (...);

-- ❌ 反模式 3：缩写不明确
CREATE TABLE wg_usr (...);
CREATE TABLE wg_ord (...);

-- ✅ 正确做法
CREATE TABLE wg_user (...);
CREATE TABLE wg_order (...);
```

### 5.2 字段反模式

```sql
-- ❌ 反模式 1：布尔字段用 IS_ 前缀但存 INT
is_admin INT DEFAULT 0  -- 语义不清

-- ✅ 正确做法
is_admin BOOLEAN DEFAULT FALSE  -- 或 TINYINT(1)

-- ❌ 反模式 2：时间字段命名不统一
create_time DATETIME
update_time DATETIME
delete_time DATETIME

-- ✅ 正确做法
created_at DATETIME
updated_at DATETIME
deleted_at DATETIME

-- ❌ 反模式 3：用保留字做字段名
CREATE TABLE wg_order (
    order INT,      -- ❌ 保留字
    status VARCHAR(20),
    group VARCHAR(50)  -- ❌ 保留字
);

-- ✅ 正确做法
CREATE TABLE wg_order (
    order_no INT,
    status VARCHAR(20),
    group_name VARCHAR(50)
);
```

### 5.3 索引反模式

```sql
-- ❌ 反模式 1：索引名不含表名
CREATE INDEX idx_1 ON wg_user (email);

-- ✅ 正确做法
CREATE INDEX idx_user_email ON wg_user (email);

-- ❌ 反模式 2：索引名过长
CREATE INDEX idx_user_email_status_created_at_updated_at ON wg_user (...);

-- ✅ 正确做法（缩写关键字段）
CREATE INDEX idx_user_email_status_created ON wg_user (...);
```

---

## 6. 字段类型选择指南

### 6.1 整数类型选择

| 场景 | MySQL 类型 | PostgreSQL 类型 | 说明 |
|------|-----------|----------------|------|
| 主键 | BIGINT UNSIGNED | BIGSERIAL | 预留增长空间 |
| 状态/枚举 | TINYINT | SMALLINT | 0-255 够用 |
| 数量/金额 | INT / DECIMAL | INTEGER / NUMERIC | 金额用 DECIMAL |
| 布尔值 | TINYINT(1) | BOOLEAN | 0/1 或 true/false |

### 6.2 字符串类型选择

| 场景 | MySQL 类型 | PostgreSQL 类型 | 说明 |
|------|-----------|----------------|------|
| 用户名 | VARCHAR(50) | VARCHAR(50) | 有长度限制 |
| 邮箱 | VARCHAR(100) | VARCHAR(100) | 邮箱最大长度 |
| 手机号 | VARCHAR(20) | VARCHAR(20) | 带国际区号 |
| 密码哈希 | CHAR(60) | CHAR(60) | bcrypt 固定长度 |
| 地址 | VARCHAR(255) | VARCHAR(255) | 一般地址 |
| 文章内容 | TEXT | TEXT | 无长度限制 |
| UUID | CHAR(36) | UUID | PostgreSQL 有原生类型 |

### 6.3 时间类型选择

| 场景 | MySQL 类型 | PostgreSQL 类型 | 说明 |
|------|-----------|----------------|------|
| 创建/更新时间 | DATETIME | TIMESTAMP | 不带时区 |
| 生日 | DATE | DATE | 只存日期 |
| 精确时间 | DATETIME(3) | TIMESTAMP(3) | 毫秒精度 |
| 带时区 | TIMESTAMP | TIMESTAMPTZ | 跨时区业务 |

### 6.4 金额处理

```sql
-- ❌ 错误：用浮点数存金额
price FLOAT
price DOUBLE

-- ✅ 正确：用定点数
-- MySQL
price DECIMAL(10,2)  -- 最大 99999999.99
price INT UNSIGNED   -- 存分，应用层转换

-- PostgreSQL
price NUMERIC(10,2)
price INTEGER        -- 存分
```

### 6.5 JSON 字段使用

```sql
-- MySQL 5.7+
metadata JSON DEFAULT NULL

-- PostgreSQL（推荐 JSONB，支持索引）
metadata JSONB DEFAULT '{}'

-- 查询示例（PostgreSQL）
SELECT * FROM wg_user WHERE metadata->>'city' = 'Beijing';
CREATE INDEX idx_user_metadata_city ON wg_user USING GIN ((metadata->'city'));
```

---

## 7. 特殊场景命名

### 7.1 多租户字段

```sql
-- 所有业务表必须有 tenant_id
CREATE TABLE wg_order (
    id BIGINT UNSIGNED PRIMARY KEY,
    tenant_id BIGINT UNSIGNED NOT NULL,  -- 租户ID
    user_id BIGINT UNSIGNED NOT NULL,
    -- ...
    INDEX idx_tenant_id (tenant_id)
);
```

### 7.2 多语言字段

```sql
-- 方案1：JSON 存储（推荐）
name JSONB  -- {"zh": "名称", "en": "Name"}

-- 方案2：后缀区分
name_zh VARCHAR(100)
name_en VARCHAR(100)
```

### 7.3 枚举值命名

```sql
-- ❌ 魔法数字
status INT  -- 0=禁用, 1=启用, 2=审核中

-- ✅ 方案1：CHECK 约束
status SMALLINT CHECK (status IN (0, 1, 2))

-- ✅ 方案2：应用层枚举（推荐）
-- 数据库存 INT，应用层定义枚举映射
```
