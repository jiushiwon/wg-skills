# 事务与并发控制

## 1. 什么是事务？

事务 = 一组 SQL 操作，要么全部成功，要么全部失败

```
转账场景：
1. A 账户 -1000
2. B 账户 +1000

如果第1步成功，第2步失败：
→ A 少了 1000，B 没收到 → 钱消失了！
```

**事务解决的问题**：确保数据一致性

## 2. ACID 特性

| 特性 | 说明 | 比喻 |
|------|------|------|
| Atomic（原子性） | 不可分割，要么全成功要么全失败 | 打包发货，要么全发要么不发 |
| Consistency（一致性） | 事务前后数据状态一致 | 转账前后总金额不变 |
| Isolation（隔离性） | 并发事务互不干扰 | 各自独立操作 |
| Durability（持久性） | 提交后数据永久保存 | 发货后不可撤回 |

## 3. 事务操作

### 3.1 基本语法

```sql
-- 开启事务
START TRANSACTION;
-- 或
BEGIN;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;

-- 设置保存点
SAVEPOINT sp1;

-- 回滚到保存点
ROLLBACK TO SAVEPOINT sp1;
```

### 3.2 自动提交

MySQL 默认自动提交：

```sql
-- 查看自动提交
SHOW VARIABLES LIKE 'autocommit';

-- 关闭自动提交
SET autocommit = 0;
```

### 3.3 编程使用

**Java (Spring Boot)**
```java
@Transactional(rollbackFor = Exception.class)
public void transfer(String from, String to, BigDecimal amount) {
    // 扣款
    accountMapper.decrement(from, amount);
    // 加款
    accountMapper.increment(to, amount);
}
```

**Python (FastAPI)**
```python
def transfer(from_id: int, to_id: int, amount: float):
    with db.begin():
        db.execute("UPDATE account SET balance = balance - ? WHERE id = ?", (amount, from_id))
        db.execute("UPDATE account SET balance = balance + ? WHERE id = ?", (amount, to_id))
```

## 4. 隔离级别

### 4.1 四种隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|------|-----------|------|
| 读未提交 (READ UNCOMMITTED) | 有 | 有 | 有 |
| 读已提交 (READ COMMITTED) | 无 | 有 | 有 |
| 可重复读 (REPEATABLE READ) | 无 | 无 | 有 |
| 串行化 (SERIALIZABLE) | 无 | 无 | 无 |

### 4.2 详细解释

**脏读**：读取到其他事务未提交的数据

```
事务A：修改 id=1 的 name = 'B'
事务B：读取 id=1 的 name = 'B' (A 未提交)
事务A：回滚
结果：B 读到了不存在的数据
```

**不可重复读**：同一行数据两次读取结果不同

```
事务B：读取 id=1 的 balance = 1000
事务A：修改 id=1 的 balance = 2000 并提交
事务B：再次读取 id=1 的 balance = 2000
结果：同一行数据两次读取不同
```

**幻读**：读取到的数据行数变化

```
事务B：SELECT * FROM users WHERE status = 1  -- 10行
事务A：INSERT INTO users (status) VALUES (1)
事务B：再次查询 -- 11行
结果：读取到的行数变化
```

### 4.3 各数据库默认

| 数据库 | 默认隔离级别 |
|--------|------------|
| MySQL | REPEATABLE READ |
| PostgreSQL | READ COMMITTED |
| Oracle | READ COMMITTED |

### 4.4 设置隔离级别

```sql
-- MySQL
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

## 5. 并发问题与解决方案

### 5.1 乐观锁

**原理**：先读取版本号，更新时检查版本号是否变化

```sql
-- 原始数据：id=1, balance=1000, version=1

-- 事务A：读取
SELECT * FROM account WHERE id = 1;  -- version=1

-- 事务B：读取
SELECT * FROM account WHERE id = 1;  -- version=1

-- 事务A：更新（检查 version）
UPDATE account SET balance = balance + 500, version = version + 1
WHERE id = 1 AND version = 1;  -- 成功，version 变为 2

-- 事务B：更新（检查 version 失败）
UPDATE account SET balance = balance + 500, version = version + 1
WHERE id = 1 AND version = 1;  -- 失败，因为 version 已经是 2
```

### 5.2 悲观锁

**原理**：先锁定数据，再操作

```sql
-- 事务A：锁定行
SELECT * FROM account WHERE id = 1 FOR UPDATE;

-- 事务B：尝试锁定（阻塞，等待A释放）
SELECT * FROM account WHERE id = 1 FOR UPDATE;
```

### 5.3 分布式锁

```python
# Redis 分布式锁
import redis
lock = redis.lock.Lock('account:1', timeout=10)

with lock:
    # 扣款操作
    account.decrement(100)
```

## 6. 事务传播行为

### Java Spring

| 传播行为 | 说明 |
|---------|------|
| REQUIRED | 如果有事务则加入，没有则创建新事务（默认） |
| REQUIRES_NEW | 总是创建新事务 |
| SUPPORTS | 有事务则加入，没有则非事务执行 |
| NOT_SUPPORTED | 挂起当前事务，非事务执行 |
| MANDATORY | 必须在事务中运行，否则抛异常 |
| NEVER | 必须在非事务中运行，否则抛异常 |
| NESTED | 嵌套事务（Savepoint） |

## 7. 常见问题

### 7.1 死锁

```sql
-- 事务A：先锁 id=1，再锁 id=2
UPDATE account SET balance = balance - 100 WHERE id = 1;  -- 锁住 id=1
UPDATE account SET balance = balance + 100 WHERE id = 2;  -- 锁住 id=2

-- 事务B：先锁 id=2，再锁 id=1
UPDATE account SET balance = balance - 100 WHERE id = 2;  -- 等待A释放id=2
UPDATE account SET balance = balance + 100 WHERE id = 1;  -- 等待A释放id=1
-- 死锁！
```

**解决方案**：统一加锁顺序

### 7.2 长事务

**问题**：事务执行时间过长，锁定数据太久

```sql
-- 不好的写法
BEGIN;
SELECT * FROM big_table;  -- 锁定大量数据
-- 处理大量数据...
COMMIT;
```

**解决方案**：
- 批量处理，分批提交
- 使用乐观锁
- 缩短事务时间

### 7.3 回滚点

```sql
BEGIN;
INSERT INTO order VALUES (...);  -- 插入订单
SAVEPOINT order_saved;

INSERT INTO order_item VALUES (...);  -- 插入订单项失败
ROLLBACK TO SAVEPOINT order_saved;  -- 回滚到保存点

COMMIT;  -- 只提交订单，不提交订单项
```

## 8. MySQL vs PostgreSQL 事务

| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| 隔离级别 | 4种 | 4种 |
| 默认级别 | RR | RC |
| Savepoint | 支持 | 支持 |
| 嵌套事务 | 不支持 | 支持 |
| 事务保存点 | 支持 | 支持 |

## 9. 快速查阅

| 操作 | SQL |
|------|-----|
| 开启事务 | `BEGIN;` |
| 提交 | `COMMIT;` |
| 回滚 | `ROLLBACK;` |
| 设置保存点 | `SAVEPOINT sp1;` |
| 回滚到保存点 | `ROLLBACK TO SAVEPOINT sp1;` |
| 查看隔离级别 | `SELECT @@transaction_isolation;` |
| 设置隔离级别 | `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;` |
| 行锁 | `SELECT ... FOR UPDATE;` |
| 乐观锁 | `UPDATE ... WHERE version = ?` |
