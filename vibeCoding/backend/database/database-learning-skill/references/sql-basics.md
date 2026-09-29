# SQL 基础语法速查

## 1. 数据定义（DDL）

### 创建表

```sql
CREATE TABLE `wg_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(100) DEFAULT NULL COMMENT '昵称',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常 0禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 修改表

```sql
-- 添加字段
ALTER TABLE wg_user ADD COLUMN avatar VARCHAR(500) DEFAULT NULL COMMENT '头像';

-- 修改字段
ALTER TABLE wg_user MODIFY COLUMN nickname VARCHAR(200) DEFAULT NULL;

-- 删除字段
ALTER TABLE wg_user DROP COLUMN avatar;

-- 添加索引
ALTER TABLE wg_user ADD INDEX idx_status (`status`);

-- 添加外键
ALTER TABLE wg_order ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES wg_user(id);
```

### 删除表

```sql
DROP TABLE IF EXISTS wg_user;
```

---

## 2. 数据操作（DML）

### 插入数据

```sql
-- 插入单条
INSERT INTO wg_user (username, password, email) VALUES ('test', '123456', 'test@example.com');

-- 插入多条
INSERT INTO wg_user (username, email) VALUES
  ('user1', 'user1@example.com'),
  ('user2', 'user2@example.com');

-- 插入查询结果
INSERT INTO wg_user_backup (username, email) SELECT username, email FROM wg_user;
```

### 更新数据

```sql
-- 更新单条
UPDATE wg_user SET nickname = '新昵称' WHERE id = 1;

-- 更新多条
UPDATE wg_user SET status = 0 WHERE created_at < '2024-01-01';

-- 批量更新
UPDATE wg_user SET login_count = login_count + 1 WHERE id = 1;
```

### 删除数据

```sql
-- 删除数据（物理删除）
DELETE FROM wg_user WHERE id = 1;

-- 删除数据（软删除，推荐）
UPDATE wg_user SET deleted_at = NOW() WHERE id = 1;

-- 清空表
TRUNCATE TABLE wg_user;
```

---

## 3. 数据查询（DQL）

### 基础查询

```sql
-- 查询所有字段
SELECT * FROM wg_user;

-- 查询指定字段
SELECT username, email FROM wg_user;

-- 别名
SELECT username AS name, email AS mail FROM wg_user;

-- 去重
SELECT DISTINCT status FROM wg_user;
```

### 条件查询

```sql
-- WHERE 条件
SELECT * FROM wg_user WHERE status = 1;

-- AND / OR
SELECT * FROM wg_user WHERE status = 1 AND username LIKE 'admin%';

-- IN
SELECT * FROM wg_user WHERE id IN (1, 2, 3);

-- BETWEEN
SELECT * FROM wg_user WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- IS NULL / IS NOT NULL
SELECT * FROM wg_user WHERE email IS NOT NULL;
```

### 排序与分页

```sql
-- 排序
SELECT * FROM wg_user ORDER BY created_at DESC;  -- 降序
SELECT * FROM wg_user ORDER BY created_at ASC;   -- 升序

-- 多字段排序
SELECT * FROM wg_user ORDER BY status ASC, created_at DESC;

-- 分页（MySQL）
SELECT * FROM wg_user LIMIT 10 OFFSET 0;
SELECT * FROM wg_user LIMIT 0, 10;  -- 简写

-- 分页（PostgreSQL）
SELECT * FROM wg_user LIMIT 10 OFFSET 0;
```

### 分组与聚合

```sql
-- 统计数量
SELECT COUNT(*) FROM wg_user;
SELECT COUNT(DISTINCT status) FROM wg_user;

-- 求和
SELECT SUM(amount) FROM wg_order;

-- 平均值
SELECT AVG(age) FROM wg_user;

-- 最大/最小
SELECT MAX(price) FROM wg_product;
SELECT MIN(price) FROM wg_product;

-- 分组
SELECT status, COUNT(*) FROM wg_user GROUP BY status;

-- 分组 + 筛选
SELECT status, COUNT(*) FROM wg_user GROUP BY status HAVING COUNT(*) > 10;
```

### 连接查询

```sql
-- 内连接（INNER JOIN）
SELECT u.username, o.order_no
FROM wg_user u
INNER JOIN wg_order o ON u.id = o.user_id;

-- 左连接（LEFT JOIN）
SELECT u.username, o.order_no
FROM wg_user u
LEFT JOIN wg_order o ON u.id = o.user_id;

-- 右连接（RIGHT JOIN）
SELECT u.username, o.order_no
FROM wg_user u
RIGHT JOIN wg_order o ON u.id = o.user_id;

-- 多表连接
SELECT u.username, o.order_no, p.product_name
FROM wg_user u
INNER JOIN wg_order o ON u.id = o.user_id
INNER JOIN wg_order_item oi ON o.id = oi.order_id
INNER JOIN wg_product p ON oi.product_id = p.id;
```

### 子查询

```sql
-- WHERE 子查询
SELECT * FROM wg_user WHERE id IN (SELECT user_id FROM wg_order WHERE amount > 100);

-- FROM 子查询
SELECT * FROM (SELECT status, COUNT(*) as cnt FROM wg_user GROUP BY status) t;

-- EXISTS
SELECT * FROM wg_user u WHERE EXISTS (SELECT 1 FROM wg_order o WHERE o.user_id = u.id);
```

---

## 4. 常用函数

### 字符串函数

```sql
-- 长度
SELECT LENGTH('hello');  -- 5

-- 截取
SELECT SUBSTRING('hello', 1, 3);  -- hel

-- 大小写
SELECT UPPER('hello');  -- HELLO
SELECT LOWER('HELLO');  -- hello

-- 去除空格
SELECT TRIM('  hello  ');  -- hello

-- 替换
SELECT REPLACE('hello', 'l', 'x');  -- hexxo

-- 拼接
SELECT CONCAT('hello', ' ', 'world');  -- hello world
```

### 日期函数

```sql
-- 当前时间
SELECT NOW();           -- 2024-01-01 12:00:00
SELECT CURDATE();       -- 2024-01-01
SELECT CURRENT_TIME();  -- 12:00:00

-- 日期格式化
SELECT DATE_FORMAT(NOW(), '%Y-%m-%d');  -- 2024-01-01
SELECT DATE_FORMAT(NOW(), '%Y年%m月%d日');  -- 2024年01月01日

-- 日期计算
SELECT DATE_ADD(NOW(), INTERVAL 1 DAY);      -- 明天
SELECT DATE_SUB(NOW(), INTERVAL 1 MONTH);    -- 上个月

-- 日期提取
SELECT YEAR(NOW());   -- 2024
SELECT MONTH(NOW()); -- 1
SELECT DAY(NOW());   -- 1
```

### 条件函数

```sql
-- IF
SELECT IF(status = 1, '正常', '禁用') FROM wg_user;

-- IFNULL
SELECT IFNULL(nickname, '未设置') FROM wg_user;

-- CASE WHEN
SELECT
  CASE
    WHEN age < 18 THEN '未成年'
    WHEN age < 30 THEN '青年'
    WHEN age < 60 THEN '中年'
    ELSE '老年'
  END AS age_group
FROM wg_user;
```

---

## 5. 约束

| 约束 | 说明 | 示例 |
|------|------|------|
| PRIMARY KEY | 主键，唯一且非空 | `id INT PRIMARY KEY` |
| AUTO_INCREMENT | 自增 | `id INT PRIMARY KEY AUTO_INCREMENT` |
| UNIQUE | 唯一 | `email VARCHAR(100) UNIQUE` |
| NOT NULL | 非空 | `username VARCHAR(50) NOT NULL` |
| DEFAULT | 默认值 | `status INT DEFAULT 1` |
| CHECK | 校验 | `age INT CHECK (age >= 0)` |
| FOREIGN KEY | 外键 | `user_id INT REFERENCES wg_user(id)` |

---

## 6. 快速查阅

| 操作 | 语法 |
|------|------|
| 查所有表 | `SHOW TABLES;` |
| 查表结构 | `DESC wg_user;` / `SHOW CREATE TABLE wg_user;` |
| 查索引 | `SHOW INDEX FROM wg_user;` |
| 查进程 | `SHOW PROCESSLIST;` |
| 查变量 | `SHOW VARIABLES LIKE 'max_connections';` |
