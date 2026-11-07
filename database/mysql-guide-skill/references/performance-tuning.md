# MySQL 性能调优指南

## InnoDB 参数调优

### 缓冲池配置

缓冲池是 InnoDB 最重要的内存区域，用于缓存数据和索引。

```bash
# my.cnf
[mysqld]
# 缓冲池大小（物理内存的 60-80%）
innodb_buffer_pool_size = 4G

# 缓冲池实例数（建议 8，当 buffer_pool > 1G 时）
innodb_buffer_pool_instances = 8

# 缓冲池预加载（重启后快速恢复）
innodb_buffer_pool_load_at_startup = ON
innodb_buffer_pool_dump_at_shutdown = ON
```

**查看缓冲池状态**

```sql
-- 命中率（应 > 99%）
SHOW STATUS LIKE 'Innodb_buffer_pool_read%';

-- 计算命中率
SELECT
    (1 - (Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests)) * 100 AS hit_rate
FROM
    (SELECT VARIABLE_VALUE AS Innodb_buffer_pool_reads FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') a,
    (SELECT VARIABLE_VALUE AS Innodb_buffer_pool_read_requests FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') b;
```

### 日志配置

```bash
[mysqld]
# Redo Log 大小
innodb_log_file_size = 1G
innodb_log_buffer_size = 64M

# 刷盘策略（最安全）
innodb_flush_log_at_trx_commit = 1

# IO 容量
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000
```

**刷盘策略对比**

| 值 | 说明 | 性能 | 安全性 |
|----|------|------|--------|
| 0 | 每秒刷盘 | 最高 | 可能丢 1 秒数据 |
| 1 | 每次提交刷盘 | 最低 | 最安全 |
| 2 | 每次提交写 OS 缓存 | 中等 | 可能丢 1 秒 |

### 并发配置

```bash
[mysqld]
# 最大并发线程数
innodb_thread_concurrency = 0  # 自适应

# 读写线程数
innodb_read_io_threads = 8
innodb_write_io_threads = 8

# 行锁等待超时
innodb_lock_wait_timeout = 50
```

### 内存分配

```bash
[mysqld]
# 排序缓冲区（每个连接）
sort_buffer_size = 4M

# 连接缓冲区
join_buffer_size = 4M

# 临时表大小
tmp_table_size = 64M
max_heap_table_size = 64M

# 表缓存
table_open_cache = 4000
table_definition_cache = 2000
```

## 慢查询分析流程

### 开启慢查询日志

```sql
-- 查看当前配置
SHOW VARIABLES LIKE '%slow_query%';

-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL long_query_time = 1;  -- 超过 1 秒记录
SET GLOBAL log_queries_not_using_indexes = ON;  -- 记录未使用索引的查询
```

```bash
# my.cnf 永久配置
[mysqld]
slow_query_log = ON
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
log_queries_not_using_indexes = ON
```

### 使用 mysqldumpslow 分析

```bash
# 按查询时间排序，取前 10 条
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# 按查询次数排序
mysqldumpslow -s c -t 10 /var/log/mysql/slow.log

# 按返回行数排序
mysqldumpslow -s r -t 10 /var/log/mysql/slow.log
```

### 使用 pt-query-digest 分析

```bash
# 安装
apt-get install percona-toolkit

# 分析慢查询日志
pt-query-digest /var/log/mysql/slow.log > slow_report.txt

# 分析特定时间段
pt-query-digest --since '2026-09-01 00:00:00' --until '2026-09-10 23:59:59' /var/log/mysql/slow.log
```

### EXPLAIN 分析查询

```sql
EXPLAIN SELECT * FROM users WHERE username = 'test';

-- 查看执行计划
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE username = 'test';

-- 查看实际执行情况（MySQL 8.0+）
EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'test';
```

**EXPLAIN 关键字段**

| 字段 | 说明 | 优化目标 |
|------|------|----------|
| type | 访问类型 | 至少达到 range |
| key | 使用的索引 | 避免 NULL |
| rows | 预估扫描行数 | 越小越好 |
| Extra | 额外信息 | 避免 Using filesort/temporary |

**type 访问类型（从优到差）**

```
system > const > eq_ref > ref > range > index > ALL
```

### 实时查询分析

```sql
-- 查看正在执行的查询
SELECT * FROM information_schema.processlist
WHERE command != 'Sleep'
ORDER BY time DESC;

-- 查看查询统计
SELECT * FROM sys.statements_with_runtimes_in_95th_percentile LIMIT 10;

-- 查看全表扫描的查询
SELECT * FROM sys.statements_with_full_table_scans LIMIT 10;
```

## 索引优化实践

### 索引设计原则

1. **最左前缀原则**：复合索引按查询条件顺序创建
2. **覆盖索引**：查询字段都在索引中，避免回表
3. **索引选择性**：选择区分度高的字段
4. **避免过度索引**：索引会降低写入性能

### 创建高效索引

```sql
-- 复合索引示例
-- 查询：WHERE status = 1 AND created_at > '2026-01-01' ORDER BY id DESC
CREATE INDEX idx_status_created_at ON orders(status, created_at);

-- 覆盖索引
-- 查询：SELECT id, username, email FROM users WHERE username = 'test'
CREATE INDEX idx_username_covering ON users(username, email);

-- 前缀索引（长字符串）
CREATE INDEX idx_email_prefix ON users(email(20));
```

### 索引失效场景

```sql
-- 1. 使用函数
-- 错误
SELECT * FROM users WHERE YEAR(created_at) = 2026;
-- 正确
SELECT * FROM users WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01';

-- 2. 隐式类型转换
-- 错误：phone 是 VARCHAR，传入 INT
SELECT * FROM users WHERE phone = 13800138000;
-- 正确
SELECT * FROM users WHERE phone = '13800138000';

-- 3. LIKE 左模糊
-- 错误
SELECT * FROM users WHERE username LIKE '%test';
-- 正确
SELECT * FROM users WHERE username LIKE 'test%';

-- 4. OR 条件
-- 错误：如果 username 和 email 各有索引
SELECT * FROM users WHERE username = 'test' OR email = 'test@example.com';
-- 正确：使用 UNION
SELECT * FROM users WHERE username = 'test'
UNION
SELECT * FROM users WHERE email = 'test@example.com';

-- 5. NOT IN / NOT EXISTS
-- 可能导致全表扫描
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);
-- 优化：使用 LEFT JOIN
SELECT u.* FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.user_id IS NULL;
```

### 索引监控

```sql
-- 查看索引使用情况
SELECT * FROM sys.schema_unused_indexes;
SELECT * FROM sys.schema_redundant_indexes;

-- 查看索引选择性
SELECT
    COUNT(DISTINCT username) / COUNT(*) AS username_selectivity,
    COUNT(DISTINCT email) / COUNT(*) AS email_selectivity,
    COUNT(DISTINCT status) / COUNT(*) AS status_selectivity
FROM users;
```

## 读写分离配置

### Spring Boot 配置

```java
// 1. 多数据源配置
@Configuration
public class DataSourceConfig {

    @Bean("masterDataSource")
    @ConfigurationProperties("spring.datasource.master")
    public DataSource masterDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean("slaveDataSource")
    @ConfigurationProperties("spring.datasource.slave")
    public DataSource slaveDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    @Primary
    public DataSource routingDataSource(
            @Qualifier("masterDataSource") DataSource master,
            @Qualifier("slaveDataSource") DataSource slave) {
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put(DataSourceType.MASTER, master);
        targetDataSources.put(DataSourceType.SLAVE, slave);

        RoutingDataSource routingDataSource = new RoutingDataSource();
        routingDataSource.setDefaultTargetDataSource(master);
        routingDataSource.setTargetDataSources(targetDataSources);
        return routingDataSource;
    }
}

// 2. 路由数据源
public class RoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return DynamicDataSourceContextHolder.getDataSourceType();
    }
}

// 3. 注解切面
@Aspect
@Component
public class DataSourceAspect {

    @Before("@annotation(dataSource)")
    public void switchDataSource(JoinPoint point, DataSource dataSource) {
        DynamicDataSourceContextHolder.setDataSourceType(dataSource.value().name());
    }

    @After("@annotation(dataSource)")
    public void restoreDataSource(JoinPoint point, DataSource dataSource) {
        DynamicDataSourceContextHolder.clearDataSourceType();
    }
}

// 4. 自定义注解
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataSource {
    DataSourceType value() default DataSourceType.MASTER;
}

// 5. 使用
@Service
public class UserService {

    @DataSource(DataSourceType.MASTER)
    public void createUser(User user) {
        userRepository.save(user);
    }

    @DataSource(DataSourceType.SLAVE)
    public User getUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
```

### YAML 配置

```yaml
spring:
  datasource:
    master:
      url: jdbc:mysql://master:3306/myapp
      username: root
      password: password
      hikari:
        pool-name: master
        maximum-pool-size: 20
    slave:
      url: jdbc:mysql://slave:3306/myapp
      username: root
      password: password
      hikari:
        pool-name: slave
        maximum-pool-size: 30
```

### Python (FastAPI) 配置

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

# 主库连接
master_engine = create_engine(
    "mysql+pymysql://user:pass@master:3306/myapp",
    pool_size=20,
    max_overflow=10,
)
MasterSession = sessionmaker(bind=master_engine)

# 从库连接
slave_engine = create_engine(
    "mysql+pymysql://user:pass@slave:3306/myapp",
    pool_size=30,
    max_overflow=10,
)
SlaveSession = sessionmaker(bind=slave_engine)

@contextmanager
def get_master_db():
    db = MasterSession()
    try:
        yield db
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()

@contextmanager
def get_slave_db():
    db = SlaveSession()
    try:
        yield db
    finally:
        db.close()

# 使用
def create_user(user_data):
    with get_master_db() as db:
        user = User(**user_data)
        db.add(user)
        return user

def get_user(user_id):
    with get_slave_db() as db:
        return db.query(User).filter(User.id == user_id).first()
```

### Go 配置

```go
package main

import (
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
)

type DBManager struct {
    Master *sql.DB
    Slave  *sql.DB
}

func NewDBManager() (*DBManager, error) {
    master, err := sql.Open("mysql", "user:pass@tcp(master:3306)/myapp")
    if err != nil {
        return nil, err
    }
    master.SetMaxOpenConns(20)

    slave, err := sql.Open("mysql", "user:pass@tcp(slave:3306)/myapp")
    if err != nil {
        return nil, err
    }
    slave.SetMaxOpenConns(30)

    return &DBManager{Master: master, Slave: slave}, nil
}

// 写操作使用主库
func (db *DBManager) CreateUser(user *User) error {
    _, err := db.Master.Exec("INSERT INTO users (username) VALUES (?)", user.Username)
    return err
}

// 读操作使用从库
func (db *DBManager) GetUser(id int) (*User, error) {
    user := &User{}
    err := db.Slave.QueryRow("SELECT id, username FROM users WHERE id = ?", id).Scan(&user.ID, &user.Username)
    return user, err
}
```

## 分区表使用

### 适用场景

- 单表数据量超过 1000 万行
- 查询通常包含分区键
- 数据有明显的范围（时间、地区等）

### Range 分区（按时间）

```sql
CREATE TABLE orders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2),
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### List 分区（按状态）

```sql
CREATE TABLE orders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    status TINYINT NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id, status)
) PARTITION BY LIST (status) (
    PARTITION p_pending VALUES IN (0, 1),
    PARTITION p_active VALUES IN (2, 3),
    PARTITION p_completed VALUES IN (4, 5),
    PARTITION p_cancelled VALUES IN (6, 7, 8)
);
```

### Hash 分区（均匀分布）

```sql
CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50),
    email VARCHAR(100),
    PRIMARY KEY (id)
) PARTITION BY HASH(id) PARTITIONS 8;
```

### 分区管理

```sql
-- 添加分区
ALTER TABLE orders ADD PARTITION (
    PARTITION p2027 VALUES LESS THAN (2028)
);

-- 删除分区（快速删除大量数据）
ALTER TABLE orders DROP PARTITION p2024;

-- 合并分区
ALTER TABLE orders REORGANIZE PARTITION p2026, p_future INTO (
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 查看分区信息
SELECT
    PARTITION_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH
FROM information_schema.PARTITIONS
WHERE TABLE_SCHEMA = 'myapp' AND TABLE_NAME = 'orders';
```

### 分区表注意事项

1. **主键必须包含分区键**

```sql
-- 错误
PRIMARY KEY (id)

-- 正确
PRIMARY KEY (id, created_at)
```

2. **唯一索引必须包含分区键**

```sql
-- 错误
UNIQUE KEY uk_username (username)

-- 正确
UNIQUE KEY uk_username (username, created_at)
```

3. **查询必须包含分区键才能利用分区裁剪**

```sql
-- 会扫描所有分区
SELECT * FROM orders WHERE user_id = 123;

-- 只扫描 p2026 分区
SELECT * FROM orders WHERE user_id = 123 AND created_at >= '2026-01-01';
```

### 分区表性能对比

```sql
-- 测试查询性能
EXPLAIN SELECT * FROM orders
WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01';

-- 查看分区裁剪
EXPLAIN SELECT * FROM orders PARTITION (p2026)
WHERE user_id = 123;
```

## 性能监控

### 关键指标

```sql
-- QPS / TPS
SHOW GLOBAL STATUS LIKE 'Questions';
SHOW GLOBAL STATUS LIKE 'Com_commit';

-- 缓冲池命中率
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read%';

- 连接数
SHOW GLOBAL STATUS LIKE 'Threads_connected';
SHOW GLOBAL STATUS LIKE 'Max_used_connections';

-- 慢查询
SHOW GLOBAL STATUS LIKE 'Slow_queries';
```

### 监控脚本

```sql
-- 性能概览
SELECT
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Questions') AS questions,
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Com_select') AS com_select,
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Com_insert') AS com_insert,
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Com_update') AS com_update,
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Com_delete') AS com_delete,
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Slow_queries') AS slow_queries;
```

### Grafana 监控

推荐使用 Prometheus + Grafana 监控 MySQL：

1. 安装 mysqld_exporter
2. 配置 Prometheus 抓取
3. 导入 Grafana Dashboard（推荐 Dashboard ID: 7362）
