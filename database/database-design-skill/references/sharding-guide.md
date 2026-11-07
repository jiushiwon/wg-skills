# 分库分表规范

## 1. 分库分表场景

| 数据量 | 策略 |
|--------|------|
| < 1000万 | 不分，单表 |
| 1000万 ~ 1亿 | 分表 |
| 1亿以上 | 分库分表 |

## 2. 分片键选择

| 场景 | 分片键 |
|------|--------|
| 用户中心 | user_id |
| 订单系统 | user_id 或 order_no |
| 日志系统 | created_at |
| 地区业务 | region_id |

## 3. 分片策略

```sql
-- 按用户ID 哈希分片
PARTITION BY HASH(user_id) PARTITIONS 16;

-- 按时间范围分片
PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01'))
);
```

## 4. 分库分表中间件

| 中间件 | 语言 | 特点 |
|--------|------|------|
| ShardingSphere | Java | 功能完善 |
| ShardingJDBC | Java | 轻量级 |
| MyCat | 通用 | 代理模式 |
| Vitess | MySQL | 分布式 |

---

## 5. 分片键选择原则

### 5.1 核心原则

| 原则 | 说明 | 示例 |
|------|------|------|
| 查询频率高 | 大部分查询都带此字段 | user_id |
| 数据分布均匀 | 避免数据倾斜 | 避免用 status |
| 离散度高 | 避免热点问题 | 避免用 created_at |
| 不可变 | 避免跨分片更新 | 避免用 email |

### 5.2 分片键选择决策树

```
                    查询模式分析
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    单用户查询      全局查询      时间范围查询
          │              │              │
     user_id        全局ID        created_at
          │              │              │
    哈希分片        不分片        范围分片
```

### 5.3 常见业务分片键推荐

| 业务类型 | 推荐分片键 | 分片策略 | 原因 |
|----------|-----------|----------|------|
| 用户中心 | user_id | 哈希 | 用户数据按用户隔离 |
| 订单系统 | user_id | 哈希 | 订单查询主要按用户 |
| 日志系统 | created_at | 范围 | 按时间查询和清理 |
| 多租户 | tenant_id | 哈希 | 租户数据完全隔离 |
| 地区业务 | region_id | 哈希 | 按地区查询 |
| 商品系统 | category_id | 哈希 | 按品类查询 |

### 5.4 分片键选择反模式

```sql
-- ❌ 反模式 1：用自增 ID 做分片键
-- 问题：新数据都落在最后一个分片，热点集中
PARTITION BY HASH(id) PARTITIONS 16;

-- ❌ 反模式 2：用状态字段做分片键
-- 问题：数据分布不均匀（90% 是已完成状态）
PARTITION BY HASH(status) PARTITIONS 16;

-- ❌ 反模式 3：用可能变化的字段做分片键
-- 问题：用户修改邮箱后需要跨分片迁移
PARTITION BY HASH(email) PARTITIONS 16;

-- ✅ 正确做法：用稳定的、高频查询的字段
PARTITION BY HASH(user_id) PARTITIONS 16;
```

---

## 6. 数据迁移策略

### 6.1 停机迁移（小数据量）

```
步骤：
1. 停止应用服务
2. 导出数据
3. 按新分片规则重新分布数据
4. 导入到新分片
5. 切换数据源
6. 启动应用服务

优点：简单可靠
缺点：停机时间长
```

### 6.2 双写迁移（推荐）

```
步骤：
1. 开启双写模式（同时写新旧库）
2. 历史数据异步迁移到新库
3. 数据校验（新旧库数据一致性）
4. 切换读请求到新库
5. 关闭旧库写入
6. 清理旧库数据

优点：不停机
缺点：实现复杂
```

### 6.3 双写代码示例

```go
type DualWriter struct {
    oldDB *sql.DB
    newDB *sql.DB
    mode  string // "old", "dual", "new"
}

func (w *DualWriter) Insert(ctx context.Context, table string, data map[string]interface{}) error {
    switch w.mode {
    case "old":
        return w.insertTo(w.oldDB, table, data)
    case "dual":
        if err := w.insertTo(w.oldDB, table, data); err != nil {
            return err
        }
        return w.insertTo(w.newDB, table, data)
    case "new":
        return w.insertTo(w.newDB, table, data)
    }
    return nil
}
```

### 6.4 数据校验

```sql
-- 校验总行数
SELECT COUNT(*) FROM old_table;
SELECT COUNT(*) FROM new_table;

-- 校验数据一致性（抽样）
SELECT * FROM old_table WHERE id = 123;
SELECT * FROM new_table WHERE id = 123;

-- 校验数据哈希
SELECT MD5(GROUP_CONCAT(id, name, status ORDER BY id)) FROM old_table;
SELECT MD5(GROUP_CONCAT(id, name, status ORDER BY id)) FROM new_table;
```

---

## 7. 分库分表中间件对比

### 7.1 中间件对比表

| 特性 | ShardingSphere | MyCat | Vitess | TiDB |
|------|---------------|-------|--------|------|
| 语言 | Java | Java | Go | Go |
| 模式 | 嵌入式/代理 | 代理 | 代理 | 分布式数据库 |
| 分片策略 | 丰富 | 基础 | 基础 | 自动 |
| 读写分离 | ✅ | ✅ | ✅ | ✅ |
| 分布式事务 | ✅ | ❌ | ❌ | ✅ |
| 数据迁移 | ✅ | ❌ | ✅ | ✅ |
| 运维成本 | 中 | 低 | 高 | 低 |
| 社区活跃度 | 高 | 中 | 高 | 高 |
| 适用场景 | Java 项目 | 通用 | MySQL 生态 | 替换 MySQL |

### 7.2 ShardingSphere 配置示例

```yaml
# ShardingSphere-JDBC 配置
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/db0
        username: root
        password: root
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/db1
        username: root
        password: root
    rules:
      sharding:
        tables:
          wg_order:
            actual-data-nodes: ds$->{0..1}.wg_order_$->{0..15}
            table-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: order-inline
            key-generate-strategy:
              column: id
              key-generator-name: snowflake
        sharding-algorithms:
          order-inline:
            type: INLINE
            props:
              algorithm-expression: wg_order_$->{user_id % 16}
```

### 7.3 MyCat 配置示例

```xml
<!-- schema.xml -->
<schema name="TESTDB" checkSQLschema="false" sqlMaxLimit="100">
    <table name="wg_order" primaryKey="id" dataNode="dn1,dn2" rule="mod-long"/>
</schema>

<dataNode name="dn1" dataHost="localhost1" database="db1"/>
<dataNode name="dn2" dataHost="localhost1" database="db2"/>

<!-- rule.xml -->
<tableRule name="mod-long">
    <rule>
        <columns>user_id</columns>
        <algorithm>mod-long</algorithm>
    </rule>
</tableRule>

<function name="mod-long" class="io.mycat.route.function.PartitionByMod">
    <property name="count">2</property>
</function>
```

---

## 8. 跨分片查询解决方案

### 8.1 问题场景

```sql
-- ❌ 跨分片查询（需要聚合多个分片）
SELECT * FROM wg_order ORDER BY created_at DESC LIMIT 10;
SELECT COUNT(*) FROM wg_order WHERE status = 1;
SELECT * FROM wg_order WHERE user_id IN (1, 2, 3);
```

### 8.2 解决方案

#### 方案 1：全局表（字典表）

```sql
-- 小表（如配置表、字典表）在每个分片都保留完整副本
-- 适用于：地区表、分类表、配置表

CREATE TABLE wg_region (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);
-- 每个分片都有完整的 wg_region 表
```

#### 方案 1：全局表（字典表）

```sql
-- 小表（如配置表、字典表）在每个分片都保留完整副本
-- 适用于：地区表、分类表、配置表

CREATE TABLE wg_region (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);
-- 每个分片都有完整的 wg_region 表
```

#### 方案 2：冗余字段

```sql
-- 在订单表中冗余用户信息，避免跨分片 JOIN
CREATE TABLE wg_order (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(50),  -- 冗余字段
    user_phone VARCHAR(20), -- 冗余字段
    amount DECIMAL(10,2)
);
```

#### 方案 3：异构索引表

```sql
-- 创建索引表，按查询维度重新分片
-- 原表按 user_id 分片
-- 索引表按 created_at 分片

-- 索引表（用于按时间查询）
CREATE TABLE wg_order_time_index (
    order_id BIGINT PRIMARY KEY,
    user_id BIGINT,
    created_at DATETIME
) PARTITION BY RANGE (TO_DAYS(created_at)) (...);
```

#### 方案 4：搜索引擎

```
使用 Elasticsearch 等搜索引擎处理复杂查询

数据流：
MySQL → Canal → Elasticsearch

查询流程：
1. 简单查询：直接查 MySQL 分片
2. 复杂查询：查 Elasticsearch
```

#### 方案 5：聚合服务

```go
// 应用层聚合多个分片结果
func (s *OrderService) GetRecentOrders(limit int) ([]Order, error) {
    var allOrders []Order
    
    // 从每个分片获取数据
    for _, shard := range s.shards {
        orders, err := shard.Query("SELECT * FROM wg_order ORDER BY created_at DESC LIMIT ?", limit)
        if err != nil {
            return nil, err
        }
        allOrders = append(allOrders, orders...)
    }
    
    // 合并排序
    sort.Slice(allOrders, func(i, j int) bool {
        return allOrders[i].CreatedAt.After(allOrders[j].CreatedAt)
    })
    
    // 截取前 N 条
    if len(allOrders) > limit {
        allOrders = allOrders[:limit]
    }
    
    return allOrders, nil
}
```

---

## 9. 全局 ID 生成策略

### 9.1 策略对比

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| UUID | 简单、无依赖 | 无序、存储大、索引慢 | 临时表、日志 |
| 数据库自增 | 简单、有序 | 单点瓶颈、暴露数量 | 小规模系统 |
| Redis 自增 | 高性能、有序 | 依赖 Redis | 中等规模 |
| 雪花算法 | 有序、高性能、去中心化 | 时钟回拨问题 | 大规模分布式 |
| Leaf | 高可用、高性能 | 需要额外服务 | 美团方案 |

### 9.2 雪花算法实现

```go
package snowflake

import (
    "errors"
    "sync"
    "time"
)

const (
    epoch             = 1609459200000 // 2021-01-01 00:00:00
    workerIDBits      = 5
    datacenterIDBits  = 5
    sequenceBits      = 12
    maxWorkerID       = -1 ^ (-1 << workerIDBits)
    maxDatacenterID   = -1 ^ (-1 << datacenterIDBits)
    maxSequence       = -1 ^ (-1 << sequenceBits)
    workerIDShift     = sequenceBits
    datacenterIDShift = sequenceBits + workerIDBits
    timestampShift    = sequenceBits + workerIDBits + datacenterIDBits
)

type Snowflake struct {
    mu          sync.Mutex
    workerID    int64
    datacenterID int64
    sequence    int64
    lastStamp   int64
}

func NewSnowflake(workerID, datacenterID int64) (*Snowflake, error) {
    if workerID < 0 || workerID > maxWorkerID {
        return nil, errors.New("worker ID out of range")
    }
    if datacenterID < 0 || datacenterID > maxDatacenterID {
        return nil, errors.New("datacenter ID out of range")
    }
    return &Snowflake{
        workerID:     workerID,
        datacenterID: datacenterID,
    }, nil
}

func (s *Snowflake) NextID() (int64, error) {
    s.mu.Lock()
    defer s.mu.Unlock()

    stamp := time.Now().UnixMilli()
    if stamp < s.lastStamp {
        return 0, errors.New("clock moved backwards")
    }

    if stamp == s.lastStamp {
        s.sequence = (s.sequence + 1) & maxSequence
        if s.sequence == 0 {
            stamp = s.waitNextMillis()
        }
    } else {
        s.sequence = 0
    }

    s.lastStamp = stamp

    return ((stamp - epoch) << timestampShift) |
        (s.datacenterID << datacenterIDShift) |
        (s.workerID << workerIDShift) |
        s.sequence, nil
}

func (s *Snowflake) waitNextMillis() int64 {
    stamp := time.Now().UnixMilli()
    for stamp <= s.lastStamp {
        stamp = time.Now().UnixMilli()
    }
    return stamp
}
```

### 9.3 数据库号段模式

```sql
-- 号段表
CREATE TABLE wg_id_allocator (
    biz_tag VARCHAR(64) PRIMARY KEY COMMENT '业务标识',
    max_id BIGINT NOT NULL DEFAULT 0 COMMENT '当前最大ID',
    step INT NOT NULL DEFAULT 1000 COMMENT '步长',
    description VARCHAR(256) DEFAULT NULL COMMENT '描述',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 初始化数据
INSERT INTO wg_id_allocator (biz_tag, max_id, step, description) VALUES
('order', 0, 1000, '订单ID'),
('user', 0, 1000, '用户ID');

-- 获取号段
UPDATE wg_id_allocator SET max_id = max_id + step WHERE biz_tag = 'order';
SELECT max_id, step FROM wg_id_allocator WHERE biz_tag = 'order';
```

### 9.4 Leaf 方案（美团）

```go
// Leaf 号段模式
type LeafSegment struct {
    db        *sql.DB
    bizTag    string
    currentID int64
    maxID     int64
    step      int
    mu        sync.Mutex
}

func (l *LeafSegment) NextID() (int64, error) {
    l.mu.Lock()
    defer l.mu.Unlock()

    if l.currentID >= l.maxID {
        // 申请新号段
        if err := l.allocSegment(); err != nil {
            return 0, err
        }
    }

    id := l.currentID
    l.currentID++
    return id, nil
}

func (l *LeafSegment) allocSegment() error {
    tx, err := l.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    var maxID, step int64
    err = tx.QueryRow(
        "SELECT max_id, step FROM wg_id_allocator WHERE biz_tag = ? FOR UPDATE",
        l.bizTag,
    ).Scan(&maxID, &step)
    if err != nil {
        return err
    }

    newMaxID := maxID + step
    _, err = tx.Exec(
        "UPDATE wg_id_allocator SET max_id = ? WHERE biz_tag = ?",
        newMaxID, l.bizTag,
    )
    if err != nil {
        return err
    }

    if err := tx.Commit(); err != nil {
        return err
    }

    l.currentID = maxID + 1
    l.maxID = newMaxID
    return nil
}
```

---

## 10. 分库分表实战

### 10.1 电商订单系统分片方案

```
业务特点：
- 订单量大（日均百万）
- 按用户查询为主
- 按时间范围统计

分片方案：
- 分片键：user_id（哈希）
- 分片数：16 个表（order_0 ~ order_15）
- 分库：4 个库，每个库 4 个表

路由规则：
table_index = user_id % 16
db_index = table_index / 4
```

### 10.2 日志系统分片方案

```
业务特点：
- 写入量大
- 按时间查询为主
- 需要定期清理

分片方案：
- 分片键：created_at（范围）
- 按月分表：log_202401, log_202402, ...

路由规则：
根据 created_at 的年月路由到对应表
```

### 10.3 多租户系统分片方案

```
业务特点：
- 租户数据完全隔离
- 租户数量可控（百级）

分片方案：
- 分片键：tenant_id（哈希）
- 每个租户一个独立数据库

路由规则：
根据 tenant_id 路由到对应数据库
```
