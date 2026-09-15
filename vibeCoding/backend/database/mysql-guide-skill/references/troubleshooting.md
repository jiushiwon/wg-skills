# 常见问题排查指南

## 连接超时排查

### 现象

```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

```
OperationalError: (2003, "Can't connect to MySQL server on 'localhost' (timed out)")
```

### 排查步骤

**1. 检查 MySQL 服务状态**

```bash
# Linux
systemctl status mysql
# 或
service mysql status

# Docker
docker ps | grep mysql
```

**2. 检查网络连通性**

```bash
# telnet 测试端口
telnet localhost 3306

# nc 测试
nc -zv localhost 3306

# ping 测试
ping localhost
```

**3. 检查 MySQL 绑定地址**

```sql
-- 登录 MySQL 查看
SHOW VARIABLES LIKE 'bind_address';
```

```bash
# my.cnf 配置
[mysqld]
bind-address = 0.0.0.0  # 允许远程连接
```

**4. 检查防火墙**

```bash
# Linux
sudo ufw status
sudo iptables -L -n | grep 3306

# 开放端口
sudo ufw allow 3306/tcp
```

**5. 检查最大连接数**

```sql
SHOW VARIABLES LIKE 'max_connections';
SHOW STATUS LIKE 'Threads_connected';
```

### 代码层面

```java
// Spring Boot 增加超时配置
spring:
  datasource:
    hikari:
      connection-timeout: 60000  # 60 秒
      validation-timeout: 5000
```

```python
# SQLAlchemy 增加连接超时
engine = create_engine(
    "mysql+pymysql://user:pass@host:3306/db",
    connect_args={
        "connect_timeout": 10,
        "read_timeout": 30,
        "write_timeout": 30,
    }
)
```

```go
// Go 增加超时参数
dsn := "user:password@tcp(localhost:3306)/myapp?timeout=10s&readTimeout=30s&writeTimeout=30s"
```

## Too many connections 错误

### 现象

```
ERROR 1040 (HY000): Too many connections
```

### 排查步骤

**1. 查看当前连接数**

```sql
-- 查看最大连接数
SHOW VARIABLES LIKE 'max_connections';

-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看历史最大连接数
SHOW STATUS LIKE 'Max_used_connections';
```

**2. 查看连接详情**

```sql
-- 查看所有连接
SHOW PROCESSLIST;

-- 按用户统计连接数
SELECT user, COUNT(*) as connections
FROM information_schema.processlist
GROUP BY user;

-- 按状态统计
SELECT command, COUNT(*) as count
FROM information_schema.processlist
GROUP BY command;
```

**3. 找出问题连接**

```sql
-- 查看长时间运行的查询
SELECT * FROM information_schema.processlist
WHERE time > 60
ORDER BY time DESC;

-- 查看 Sleep 状态的连接
SELECT * FROM information_schema.processlist
WHERE command = 'Sleep' AND time > 300;
```

### 解决方案

**临时方案**：增加最大连接数

```sql
-- 动态调整（重启失效）
SET GLOBAL max_connections = 500;

-- 永久调整：修改 my.cnf
[mysqld]
max_connections = 500
```

**根本方案**：

1. **优化连接池配置**

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20        # 不要设置过大
      minimum-idle: 10
      max-lifetime: 1800000        # 30 分钟，小于 wait_timeout
      leak-detection-threshold: 60000
```

2. **优化代码，及时释放连接**

```python
# 错误示例：连接未关闭
def bad_example():
    db = SessionLocal()
    user = db.query(User).first()
    return user  # 连接泄漏！

# 正确示例
def good_example():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        return user
    finally:
        db.close()
```

3. **关闭超时连接**

```sql
-- MySQL 配置
[mysqld]
wait_timeout = 600        # 非交互连接超时（秒）
interactive_timeout = 600  # 交互连接超时（秒）
```

## Lock wait timeout 超时

### 现象

```
Lock wait timeout exceeded; try restarting transaction
```

### 排查步骤

**1. 查看当前锁等待**

```sql
-- MySQL 8.0+
SELECT * FROM performance_schema.data_lock_waits;

-- 查看锁等待详情
SELECT
    r.trx_id AS waiting_trx_id,
    r.trx_mysql_thread_id AS waiting_thread,
    r.trx_query AS waiting_query,
    b.trx_id AS blocking_trx_id,
    b.trx_mysql_thread_id AS blocking_thread,
    b.trx_query AS blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
```

**2. 查看 InnoDB 状态**

```sql
SHOW ENGINE INNODB STATUS\G
```

**3. 查看表锁**

```sql
-- 查看表锁
SHOW OPEN TABLES WHERE In_use > 0;

-- 查看元数据锁
SELECT * FROM performance_schema.metadata_locks;
```

### 解决方案

**1. 优化事务，减少锁持有时间**

```java
// 错误示例：事务范围过大
@Transactional
public void badExample() {
    User user = userRepository.findById(1L).orElseThrow();
    // 复杂业务逻辑...
    sendEmail(user);  // 发送邮件不应在事务中
    // ...
    userRepository.save(user);
}

// 正确示例：缩小事务范围
public void goodExample() {
    User user = userRepository.findById(1L).orElseThrow();
    sendEmail(user);  // 事务外

    // 事务内只做数据库操作
    updateUser(user);
}

@Transactional
public void updateUser(User user) {
    userRepository.save(user);
}
```

**2. 按固定顺序访问表**

```java
// 总是按 id 顺序更新，避免死锁
@Transactional
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    // 确保 fromId < toId
    if (fromId > toId) {
        Long temp = fromId;
        fromId = toId;
        toId = temp;
    }
    // ...
}
```

**3. 调整超时时间**

```sql
-- 查看当前超时
SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';

-- 调整超时（秒）
SET GLOBAL innodb_lock_wait_timeout = 120;
```

```yaml
spring:
  datasource:
    hikari:
      connection-timeout: 60000
```

## 主从延迟排查

### 现象

- 写入数据后立即读取，读到旧数据
- 读写分离后数据不一致

### 排查步骤

**1. 查看从库状态**

```sql
-- 在从库执行
SHOW SLAVE STATUS\G

-- 关键字段
-- Seconds_Behind_Master: 延迟秒数
-- Slave_IO_Running: IO 线程是否运行
-- Slave_SQL_Running: SQL 线程是否运行
```

**2. 检查延迟原因**

```sql
-- 查看从库正在执行的 SQL
SELECT * FROM information_schema.processlist
WHERE command = 'system user';

-- 查看中继日志
SHOW RELAYLOG EVENTS;
```

**3. 检查网络延迟**

```bash
# 主库到从库的网络延迟
ping slave-host
```

### 解决方案

**1. 优化从库配置**

```sql
-- 从库 my.cnf
[mysqld]
# 并行复制
slave_parallel_type = LOGICAL_CLOCK
slave_parallel_workers = 4
slave_preserve_commit_order = 1

# 减少从库压力
innodb_flush_log_at_trx_commit = 2
sync_binlog = 0
```

**2. 强制读主库**

```java
// 关键业务强制读主库
@Service
public class UserService {

    @DS("master")  // 动态数据源注解
    public User getUserAfterWrite(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }
}
```

**3. 延迟检测**

```python
import pymysql

def check_replication_delay():
    conn = pymysql.connect(host='slave-host', user='root', password='pass')
    cursor = conn.cursor()
    cursor.execute("SHOW SLAVE STATUS")
    result = cursor.fetchone()
    delay = result[32]  # Seconds_Behind_Master
    conn.close()

    if delay and delay > 10:
        logger.warning(f"Replication delay: {delay} seconds")
    return delay
```

## 字符集问题

### 现象

- 中文乱码：`?????` 或 `å¤§å®¶å¥½`
- 插入数据报错：`Incorrect string value`

### 排查步骤

**1. 查看字符集配置**

```sql
-- 服务器字符集
SHOW VARIABLES LIKE 'character_set_server';

-- 数据库字符集
SHOW VARIABLES LIKE 'character_set_database';

-- 客户端字符集
SHOW VARIABLES LIKE 'character_set_client';

-- 连接字符集
SHOW VARIABLES LIKE 'character_set_connection';

-- 结果字符集
SHOW VARIABLES LIKE 'character_set_results';
```

**2. 查看表字符集**

```sql
-- 查看表字符集
SHOW CREATE TABLE your_table;

-- 查看列字符集
SHOW FULL COLUMNS FROM your_table;
```

### 解决方案

**1. MySQL 配置**

```bash
# my.cnf
[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[client]
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4
```

**2. 连接字符串配置**

```java
// JDBC URL
jdbc:mysql://localhost:3306/myapp?useUnicode=true&characterEncoding=utf8mb4
```

```python
# SQLAlchemy
engine = create_engine(
    "mysql+pymysql://user:pass@host/db?charset=utf8mb4"
)
```

```go
// Go DSN
dsn := "user:pass@tcp(host:3306)/db?charset=utf8mb4&parseTime=True"
```

**3. 修改现有表字符集**

```sql
-- 修改数据库
ALTER DATABASE myapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表
ALTER TABLE your_table CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改列
ALTER TABLE your_table MODIFY column_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**4. 代码层面**

```java
// Spring Boot 配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/myapp?useUnicode=true&characterEncoding=utf8mb4&connectionCollation=utf8mb4_unicode_ci
```

```python
# 确保 Python 文件编码
# -*- coding: utf-8 -*-

# SQLAlchemy 设置
engine = create_engine(
    "mysql+pymysql://user:pass@host/db",
    connect_args={
        "charset": "utf8mb4",
        "use_unicode": True,
    }
)
```

## 快速诊断脚本

### MySQL 健康检查

```sql
-- 连接数检查
SELECT
    @@max_connections AS max_conn,
    (SELECT COUNT(*) FROM information_schema.processlist) AS current_conn,
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Max_used_connections') AS max_used;

-- 锁检查
SELECT * FROM information_schema.innodb_lock_waits;

-- 慢查询检查
SELECT * FROM information_schema.processlist WHERE time > 10 ORDER BY time DESC;
```

### 应用层检查

```java
// HikariCP 连接池状态
@GetMapping("/health/db")
public Map<String, Object> dbHealth() {
    HikariPoolMXBean poolMXBean = dataSource.getHikariPoolMXBean();
    Map<String, Object> stats = new HashMap<>();
    stats.put("totalConnections", poolMXBean.getTotalConnections());
    stats.put("activeConnections", poolMXBean.getActiveConnections());
    stats.put("idleConnections", poolMXBean.getIdleConnections());
    stats.put("threadsAwaitingConnection", poolMXBean.getThreadsAwaitingConnection());
    return stats;
}
```

```python
# SQLAlchemy 连接池状态
@app.get("/health/db")
def db_health():
    pool = engine.pool
    return {
        "pool_size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
    }
}
```
