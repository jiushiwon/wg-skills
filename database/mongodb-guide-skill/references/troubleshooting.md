# MongoDB 常见问题排查指南

## 1. 连接超时排查

### 症状

```
MongoTimeoutError: Server selection timed out after 30000 ms
MongoNetworkError: connect ECONNREFUSED
MongoNetworkError: connect ETIMEDOUT
```

### 排查步骤

**第一步：检查网络连通性**

```bash
# Telnet 测试端口
telnet mongo-host 27017

# 或使用 nc
nc -zv mongo-host 27017

# 检查 DNS 解析
nslookup mongo-host
```

**第二步：检查 MongoDB 服务状态**

```bash
# 检查进程
ps aux | grep mongod

# 检查端口监听
netstat -tlnp | grep 27017
# 或
ss -tlnp | grep 27017

# 检查 systemd 状态
systemctl status mongod
```

**第三步：检查配置文件**

```bash
# 查看 MongoDB 配置
cat /etc/mongod.conf | grep -E "bindIp|port|security"

# 关键配置项：
# net.bindIp: 0.0.0.0（允许远程连接）
# net.port: 27017
# security.authorization: enabled
```

**第四步：检查防火墙**

```bash
# Linux iptables
iptables -L -n | grep 27017

# 添加规则
sudo iptables -A INPUT -p tcp --dport 27017 -j ACCEPT

# firewalld
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=27017/tcp --permanent
sudo firewall-cmd --reload
```

**第五步：检查认证配置**

```bash
# 测试连接
mongosh "mongodb://user:password@host:27017/dbname?authSource=admin"

# 检查用户权限
use admin
db.getUsers()
```

### 连接超时配置优化

```java
// Java - Spring Data MongoDB
MongoClientSettings.builder()
    .applyToSocketSettings(builder ->
        builder.connectTimeout(5, TimeUnit.SECONDS)  // 连接超时
               .readTimeout(10, TimeUnit.SECONDS)    // 读超时
    )
    .applyToClusterSettings(builder ->
        builder.serverSelectionTimeout(10, TimeUnit.SECONDS) // 服务器选择超时
    )
    .build();
```

```python
# Python - Motor
client = AsyncIOMotorClient(
    "mongodb://host:27017",
    connectTimeoutMS=5000,          # 连接超时
    socketTimeoutMS=10000,          # Socket 超时
    serverSelectionTimeoutMS=10000, # 服务器选择超时
    heartbeatFrequencyMS=10000,     # 心跳频率
)
```

---

## 2. 副本集选举问题

### 症状

```
MongoError: not master and slaveOk=false
MongoError: no primary available for writes
MongoNetworkError: connection pool was cleared because another operation failed
```

### 排查步骤

**第一步：检查副本集状态**

```javascript
// 连接到任意节点
rs.status()

// 关注字段：
// - members[n].stateStr: "PRIMARY", "SECONDARY", "ARBITER"
// - members[n].health: 1 = 健康
// - members[n].lag: 复制延迟（秒）
```

**第二步：检查选举日志**

```bash
# 查看 MongoDB 日志
tail -f /var/log/mongodb/mongod.log | grep -i "election\|repl"

# 关键日志：
# "Starting an election"
# "election succeeded"
# "election failed"
```

**第三步：常见选举失败原因**

| 原因 | 解决方案 |
|------|----------|
| 节点数不足 | 确保奇数节点（3/5/7），可用 Arbiter 凑数 |
| 网络分区 | 检查节点间网络，增加 heartbeatTimeoutSecs |
| 优先级配置 | 检查 members[n].priority 设置 |
| 投票权重 | 确认 votes 配置正确 |
| 数据落后 | 检查 replication lag，考虑 resync |

**第四步：手动干预选举**

```javascript
// 强制重新选举（谨慎使用）
rs.stepDown(60)  // Primary 降级 60 秒

// 设置节点优先级
cfg = rs.conf()
cfg.members[0].priority = 10  // 节点 0 优先成为 Primary
rs.reconfig(cfg)

// 冻结节点（防止选举）
rs.freeze(120)  // 冻结 120 秒
```

### 应用层容错配置

```go
// Go - 读写分离 + 重试
opts := options.Client().
    ApplyURI("mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0").
    SetRetryWrites(true).           // 写重试
    SetRetryReads(true).            // 读重试
    SetReadPreference(readpref.SecondaryPreferred())  // 优先从节点读
```

---

## 3. WiredTiger 缓存压力

### 症状

```
MongoDB 响应变慢
日志出现 "Cache capacity has exceeded"
内存使用率持续升高
```

### 排查步骤

**第一步：检查缓存使用情况**

```javascript
// 查看 WiredTiger 缓存状态
db.serverStatus().wiredTiger.cache

// 关键指标：
// - bytes currently in the cache: 当前缓存大小
// - maximum bytes configured: 最大缓存配置
// - modified pages evicted by application threads: 应用线程驱逐页数
// - unmodified pages evicted by application threads: 未修改页驱逐数
```

**第二步：识别大集合**

```javascript
// 查看集合统计
db.getCollectionNames().forEach(name => {
    const stats = db.getCollection(name).stats();
    print(`${name}: ${Math.round(stats.size / 1024 / 1024)}MB`);
});

// 查看索引大小
db.getCollectionNames().forEach(name => {
    const stats = db.getCollection(name).stats();
    print(`${name} 索引: ${Math.round(stats.totalIndexSize / 1024 / 1024)}MB`);
});
```

**第三步：调整缓存配置**

```yaml
# /etc/mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4  # 默认为 (RAM - 1GB) * 0.5
```

**第四步：优化查询减少缓存压力**

```javascript
// 使用 projection 减少返回数据量
db.users.find({}, {name: 1, email: 1}).limit(100)

// 使用 allowDiskUse 处理大聚合
db.orders.aggregate([...], {allowDiskUse: true})

// 定期清理过期数据
db.logs.deleteMany({createdAt: {$lt: new Date(Date.now() - 30*24*60*60*1000)}})
```

---

## 4. 慢查询分析

### 开启慢查询日志

```javascript
// 设置慢查询阈值（毫秒）
db.setProfilingLevel(1, {slowms: 100})

// 或在 mongod.conf 中配置
// operationProfiling:
//   slowOpThresholdMs: 100
//   mode: slowOp
```

### 分析慢查询

```javascript
// 查看慢查询日志
db.system.profile.find().sort({ts: -1}).limit(10).pretty()

// 关注字段：
// - op: 操作类型（query, insert, update, delete）
// - ns: 命名空间（数据库.集合）
// - millis: 执行时间（毫秒）
// - planSummary: 执行计划摘要
// - docsExamined: 扫描文档数
// - nreturned: 返回文档数

// 统计慢查询
db.system.profile.aggregate([
    {$group: {
        _id: "$ns",
        count: {$sum: 1},
        avgTime: {$avg: "$millis"},
        maxTime: {$max: "$millis"}
    }},
    {$sort: {count: -1}}
])
```

### Java 代码示例 - 查询分析

```java
import com.mongodb.ExplainVerbosity;

// 解释查询计划
Document explain = collection.find(Filters.eq("status", "active"))
    .explain(ExplainVerbosity.EXECUTION_STATS);

// 检查执行计划
Document executionStats = explain.get("executionStats", Document.class);
System.out.println("扫描文档数: " + executionStats.get("totalDocsExamined"));
System.out.println("返回文档数: " + executionStats.get("nReturned"));
System.out.println("执行时间: " + executionStats.get("executionTimeMillis") + "ms");

// 扫描文档数 >> 返回文档数 = 需要优化索引
```

### 常见慢查询模式

| 模式 | 原因 | 解决方案 |
|------|------|----------|
| 全表扫描 | 无索引或索引失效 | 创建合适索引 |
| 排序慢 | 内存排序 | 创建复合索引包含排序字段 |
| 大量文档扫描 | 查询条件选择性差 | 优化查询条件或使用覆盖索引 |
| 聚合慢 | 管道未优化 | 使用 `$match` 提前过滤，启用 `allowDiskUse` |

---

## 5. 索引失效场景

### 场景一：查询条件不匹配索引

```javascript
// 假设有索引 {status: 1, createdAt: 1}

// 失效：跳过索引前缀
db.orders.find({createdAt: {$gt: ISODate("2024-01-01")}})  // 不走索引

// 有效：包含索引前缀
db.orders.find({status: "active", createdAt: {$gt: ISODate("2024-01-01")}})  // 走索引
```

### 场景二：使用不等条件

```javascript
// 假设有索引 {age: 1}

// 失效：使用 $ne
db.users.find({age: {$ne: 25}})

// 失效：使用 $nin
db.users.find({age: {$nin: [25, 30]}})

// 有效：使用 $in
db.users.find({age: {$in: [25, 30, 35]}})
```

### 场景三：正则表达式

```javascript
// 假设有索引 {name: 1}

// 失效：前缀通配符
db.users.find({name: /张/})      // 不走索引
db.users.find({name: /^张/})     // 走索引（前缀匹配）

// 有效：使用 $regex 带选项
db.users.find({name: {$regex: "^张", $options: "i"}})
```

### 场景四：类型不匹配

```javascript
// 假设字段类型为 string，有索引 {phone: 1}

// 失效：类型不匹配
db.users.find({phone: 13800138000})     // number vs string

// 有效：类型匹配
db.users.find({phone: "13800138000"})   // string vs string
```

### 场景五：函数操作

```javascript
// 失效：使用 $where
db.users.find({$where: "this.age > 25"})

// 失效：使用 $expr（除非配合索引）
db.users.find({$expr: {$gt: ["$age", 25]}})

// 有效：直接比较
db.users.find({age: {$gt: 25}})
```

### 场景六：数组查询

```javascript
// 假设有索引 {tags: 1}（多键索引）

// 有效：单个元素匹配
db.posts.find({tags: "mongodb"})

// 有效：$all 匹配
db.posts.find({tags: {$all: ["mongodb", "database"]}})

// 失效：复杂数组条件
db.posts.find({$and: [{tags: "mongodb"}, {tags: "database"}]})
```

### 验证索引使用

```javascript
// 使用 explain() 验证
db.users.find({status: "active"}).explain("executionStats")

// 关键字段：
// - winningPlan.inputStage.indexName: 使用的索引
// - executionStats.totalKeysExamined: 扫描的索引键数
// - executionStats.totalDocsExamined: 扫描的文档数
// - executionStats.executionTimeMillis: 执行时间
```

### 索引最佳实践

```javascript
// 1. 使用复合索引覆盖查询
db.orders.createIndex({status: 1, createdAt: -1})
db.orders.find({status: "active"}).sort({createdAt: -1})

// 2. 使用 explain() 验证
db.orders.find({status: "active"}).explain("executionStats")

// 3. 定期检查索引使用情况
db.orders.aggregate([{$indexStats: {}}])

// 4. 删除未使用的索引
db.orders.dropIndex("unused_index_name")
```

---

## 快速诊断清单

```bash
# 1. 检查 MongoDB 状态
mongosh --eval "rs.status()"

# 2. 检查当前操作
mongosh --eval "db.currentOp()"

# 3. 检查锁等待
mongosh --eval "db.serverStatus().globalLock"

# 4. 检查连接数
mongosh --eval "db.serverStatus().connections"

# 5. 检查慢查询
mongosh --eval "db.system.profile.find().sort({ts: -1}).limit(5)"

# 6. 检查副本集延迟
mongosh --eval "rs.printReplicationInfo()"

# 7. 检查存储引擎状态
mongosh --eval "db.serverStatus().wiredTiger"
```
