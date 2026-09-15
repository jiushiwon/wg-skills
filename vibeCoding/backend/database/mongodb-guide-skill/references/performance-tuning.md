# MongoDB 性能调优指南

## 1. 索引类型选择

### 单字段索引

```javascript
// 适用于单条件查询
db.users.createIndex({email: 1})          // 升序
db.users.createIndex({createdAt: -1})     // 降序
db.users.createIndex({status: 1}, {sparse: true})  // 稀疏索引（忽略 null 值）
db.users.createIndex({email: 1}, {unique: true})   // 唯一索引
db.users.createIndex({expireAt: 1}, {expireAfterSeconds: 0})  // TTL 索引（自动过期）
```

### 复合索引

```javascript
// 前缀原则：查询条件必须包含索引第一个字段
db.orders.createIndex({status: 1, createdAt: -1})

// 有效查询
db.orders.find({status: "active"})
db.orders.find({status: "active", createdAt: {$gt: ISODate("2024-01-01")}})

// 无效查询（跳过前缀）
db.orders.find({createdAt: {$gt: ISODate("2024-01-01")}})

// ESR 原则：Equality > Sort > Range
// 假设查询：status = "active" AND age > 18 ORDER BY createdAt
db.users.createIndex({status: 1, createdAt: -1, age: 1})
// E: status（等值）
// S: createdAt（排序）
// R: age（范围）
```

### 多键索引（数组字段）

```javascript
// 自动为数组中每个元素创建索引条目
db.posts.createIndex({tags: 1})
db.posts.find({tags: "mongodb"})      // 有效
db.posts.find({tags: {$all: ["mongodb", "database"]}})  // 有效

// 复合多键索引（注意：不能同时对两个数组字段建复合索引）
db.posts.createIndex({tags: 1, createdAt: -1})  // 有效
db.posts.createIndex({tags: 1, comments: 1})     // 报错：不能有两个数组索引
```

### 文本索引

```javascript
// 创建文本索引（每个集合只能有一个）
db.articles.createIndex({title: "text", content: "text"})

// 搜索
db.articles.find({$text: {$search: "mongodb performance"}})

// 相关性评分
db.articles.find(
    {$text: {$search: "mongodb performance"}},
    {score: {$meta: "textScore"}}
).sort({score: {$meta: "textScore"}})

// 语言支持
db.articles.createIndex({content: "text"}, {default_language: "chinese"})
```

### 地理空间索引

```javascript
// 2dsphere 索引（推荐，支持 GeoJSON）
db.places.createIndex({location: "2dsphere"})

// 附近搜索
db.places.find({
    location: {
        $near: {
            $geometry: {type: "Point", coordinates: [116.4, 39.9]},
            $maxDistance: 5000  // 5公里
        }
    }
})

// 地理围栏查询
db.places.find({
    location: {
        $geoWithin: {
            $geometry: {
                type: "Polygon",
                coordinates: [[[116.3,39.8],[116.5,39.8],[116.5,40.0],[116.3,40.0],[116.3,39.8]]]
            }
        }
    }
})
```

### 索引选择决策表

| 场景 | 推荐索引类型 | 示例 |
|------|-------------|------|
| 单字段精确查询 | 单字段索引 | `{email: 1}` |
| 多条件查询 | 复合索引 | `{status: 1, createdAt: -1}` |
| 数组字段查询 | 多键索引 | `{tags: 1}` |
| 全文搜索 | 文本索引 | `{content: "text"}` |
| 位置查询 | 地理空间索引 | `{location: "2dsphere"}` |
| 自动过期数据 | TTL 索引 | `{expireAt: 1}` |
| 去重约束 | 唯一索引 | `{email: 1}` |

---

## 2. 聚合管道优化

### 基本原则

```javascript
// 1. 尽早过滤（$match 放最前）
db.orders.aggregate([
    {$match: {status: "completed", createdAt: {$gte: ISODate("2024-01-01")}}},
    {$group: {_id: "$customerId", total: {$sum: "$amount"}}},
    {$sort: {total: -1}},
    {$limit: 10}
])

// 2. 使用索引字段过滤
// $match 和 $sort 阶段使用索引字段可大幅提升性能

// 3. 限制中间结果集
db.orders.aggregate([
    {$match: {status: "completed"}},
    {$project: {customerId: 1, amount: 1}},  // 减少字段
    {$limit: 1000},  // 限制记录数
    {$group: ...}
])

// 4. 允许磁盘使用（大数据集）
db.orders.aggregate([...], {allowDiskUse: true})
```

### Java 示例

```java
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;

public List<SalesReport> getMonthlySales(int year) {
    Aggregation aggregation = Aggregation.newAggregation(
        // 1. 尽早过滤
        Aggregation.match(Criteria.where("status").is("completed")
            .and("createdAt").gte(LocalDate.of(year, 1, 1))),

        // 2. 投影必要字段
        Aggregation.project("customerId", "amount", "createdAt")
            .and(DateOperators.DateFrom.createdAt()).extractMonth().as("month"),

        // 3. 分组
        Aggregation.group("customerId", "month")
            .sum("amount").as("total")
            .count().as("orderCount"),

        // 4. 排序和限制
        Aggregation.sort(Sort.Direction.DESC, "total"),
        Aggregation.limit(100)
    );

    return mongoTemplate.aggregate(aggregation, "orders", SalesReport.class)
        .getMappedResults();
}
```

### Python 示例

```python
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta

async def get_top_customers(client: AsyncIOMotorClient, days: int = 30):
    pipeline = [
        # 1. 尽早过滤
        {"$match": {
            "status": "completed",
            "createdAt": {"$gte": datetime.utcnow() - timedelta(days=days)}
        }},
        # 2. 分组
        {"$group": {
            "_id": "$customerId",
            "total": {"$sum": "$amount"},
            "orderCount": {"$sum": 1}
        }},
        # 3. 排序和限制
        {"$sort": {"total": -1}},
        {"$limit": 10},
        # 4. 关联查询（可选）
        {"$lookup": {
            "from": "customers",
            "localField": "_id",
            "foreignField": "_id",
            "as": "customer"
       }},
        {"$unwind": "$customer"},
        {"$project": {
            "customerName": "$customer.name",
            "total": 1,
            "orderCount": 1
        }}
    ]

    return await client.mydb.orders.aggregate(pipeline).to_list(100)
```

### Go 示例

```go
func GetTopCustomers(ctx context.Context, coll *mongo.Collection, days int) ([]bson.M, error) {
    pipeline := mongo.Pipeline{
        // 1. 尽早过滤
        {{"$match", bson.D{
            {"status", "completed"},
            {"createdAt", bson.D{
                {"$gte", time.Now().AddDate(0, 0, -days)},
            }},
        }}},
        // 2. 分组
        {{"$group", bson.D{
            {"_id", "$customerId"},
            {"total", bson.D{{"$sum", "$amount"}}},
            {"orderCount", bson.D{{"$sum", 1}}},
        }}},
        // 3. 排序和限制
        {{"$sort", bson.D{{"total", -1}}}},
        {{"$limit", 10}},
    }

    cursor, err := coll.Aggregate(ctx, pipeline)
    if err != nil {
        return nil, err
    }
    defer cursor.Close(ctx)

    var results []bson.M
    if err = cursor.All(ctx, &results); err != nil {
        return nil, err
    }
    return results, nil
}
```

---

## 3. 分片策略

### 分片键选择原则

1. **高基数**：取值范围广，避免数据倾斜
2. **写分布均匀**：避免热点写入（如自增 ID）
3. **查询局部性**：大部分查询包含分片键

### 分片键类型

```javascript
// 1. 范围分片（Range Sharding）
sh.shardCollection("db.orders", {customerId: 1})

// 2. 哈希分片（Hash Sharding）- 写均匀，查询范围查询效率低
sh.shardCollection("db.logs", {_id: "hashed"})

// 3. 区域分片（Zone Sharding）- 数据地理亲和性
sh.addShardToZone("shard0001", "asia")
sh.addShardToZone("shard0002", "europe")
sh.updateZoneKeyRange("db.users", {region: "asia"}, {region: "asia~"}, "asia")
```

### 分片操作

```javascript
// 启用分片
sh.enableSharding("mydb")

// 查看分片状态
sh.status()

// 查看数据分布
db.orders.getShardDistribution()

// 添加分片
sh.addShard("shard3/host1:27017,host2:27017")

// 移动分块
sh.moveChunk("db.orders", {customerId: 12345}, "shard0002")

// 手动分裂分块
sh.splitAt("db.orders", {customerId: 5000})
```

### 分片键最佳实践

```javascript
// ❌ 错误示例
// _id（自增）- 所有写入集中在一个分片
// status（低基数）- 数据倾斜
// {customerId: 1} 且查询不带 customerId

// ✅ 正确示例
// 电商订单：{customerId: "hashed", orderId: 1}
// 日志系统：{timestamp: "hashed", hostname: 1}
// 用户数据：{region: 1, userId: 1}
```

---

## 4. 读写分离配置

### 副本集读写分离

```javascript
// 连接字符串配置
mongodb://host1:27017,host2:27017,host3:27017/mydb?replicaSet=rs0&readPreference=secondaryPreferred

// 读偏好选项：
// primary（默认）        - 只从主节点读
// primaryPreferred      - 优先主节点，不可用时从从节点读
// secondary             - 只从从节点读
// secondaryPreferred    - 优先从节点，不可用时从主节点读
// nearest               - 从最近的节点读
```

### Java 配置

```java
MongoClientSettings.builder()
    .applyConnectionString(new ConnectionString(
        "mongodb://host1:27017,host2:27017,host3:27017/mydb?replicaSet=rs0"
    ))
    .readPreference(ReadPreference.secondaryPreferred())
    .readConcern(ReadConcern.LOCAL)  // 或 MAJORITY
    .writeConcern(WriteConcern.MAJORITY)
    .build();
```

### Python 配置

```python
from pymongo import ReadPreference, ReadConcern, WriteConcern

client = AsyncIOMotorClient(
    "mongodb://host1:27017,host2:27017,host3:27017/mydb?replicaSet=rs0",
    readPreference="secondaryPreferred",
    readConcernLevel="local",
    w="majority",
    wtimeout=5000
)

# 集合级别配置
db = client.mydb.with_options(
    read_preference=ReadPreference.SECONDARY_PREFERRED,
    write_concern=WriteConcern(w="majority", wtimeout=5000)
)
```

### Go 配置

```go
import (
    "go.mongodb.org/mongo-driver/mongo/readconcern"
    "go.mongodb.org/mongo-driver/mongo/readpref"
    "go.mongodb.org/mongo-driver/mongo/writeconcern"
)

opts := options.Client().
    ApplyURI("mongodb://host1:27017,host2:27017,host3:27017/mydb?replicaSet=rs0").
    SetReadPreference(readpref.SecondaryPreferred()).
    SetReadConcern(readconcern.Local()).
    SetWriteConcern(writeconcern.New(writeconcern.WMajority(), writeconcern.WTimeout(5000)))
```

---

## 5. Schema 设计最佳实践

### 嵌入 vs 引用决策

```javascript
// 嵌入模式（1:1 或 1:少量）
// 优点：原子更新，单次查询获取所有数据
// 缺点：文档大小限制（16MB），更新大数组开销
{
    _id: ObjectId("..."),
    userId: "user123",
    profile: {
        name: "张三",
        email: "zhangsan@example.com",
        address: {city: "北京", street: "朝阳区..."}
    },
    tags: ["vip", "active"]
}

// 引用模式（1:大量 或 多:多）
// 优点：文档小，独立更新
// 缺点：需要额外查询，无原子更新

// 订单集合
{
    _id: ObjectId("order123"),
    customerId: ObjectId("user123"),  // 引用用户
    items: [  // 嵌入商品快照（避免商品变更影响历史订单）
        {productId: ObjectId("prod1"), name: "iPhone", price: 999, quantity: 1}
    ],
    total: 999,
    status: "completed"
}
```

### 设计模式

**模式一：属性模式（Attribute Pattern）**

```javascript
// ❌ 不推荐：字段名作为键
{productId: "p1", color: "red", size: "L", weight: 100}

// ✅ 推荐：统一数组
{
    productId: "p1",
    attributes: [
        {k: "color", v: "red"},
        {k: "size", v: "L"},
        {k: "weight", v: 100}
    ]
}
// 索引
db.products.createIndex({"attributes.k": 1, "attributes.v": 1})
```

**模式二：桶模式（Bucket Pattern）**

```javascript
// 时序数据，避免文档膨胀
{
    sensorId: "sensor1",
    date: ISODate("2024-01-15"),
    measurements: [
        {time: ISODate("2024-01-15T10:00:00"), temp: 25.5, humidity: 60},
        {time: ISODate("2024-01-15T10:05:00"), temp: 25.6, humidity: 59},
        // ... 每小时一个桶，每天一个文档
    ],
    count: 288
}
```

**模式三：异常值模式（Outlier Pattern）**

```javascript
// 热门文档特殊处理
{
    postId: "post123",
    title: "热门文章",
    viewCount: 1000000,
    // 热门评论单独存储
    topComments: [
        {commentId: "c1", content: "好文！"},
        {commentId: "c2", content: "收藏了"}
    ],
    // 其他评论在另一个集合
    commentCount: 50000
}
```

### 数据建模检查清单

```markdown
□ 查询模式分析：列出所有查询，确认索引覆盖
□ 文档大小估算：确保不超过 16MB 限制
□ 更新频率评估：高频更新字段避免嵌入大数组
□ 读写比例考量：读多写少适合嵌入，写多读少适合引用
□ 数据生命周期：历史数据是否需要归档
□ 一致性需求：是否需要原子更新
□ 扩展性规划：数据增长预期，是否需要分片
```

---

## 性能监控命令

```javascript
// 实时监控
mongostat --host localhost:27017
mongotop --host localhost:27017

// 数据库统计
db.stats()
db.serverStatus()

// 集合统计
db.orders.stats()
db.orders.stats({scale: 1024*1024})  // MB 为单位

// 索引统计
db.orders.aggregate([{$indexStats: {}}])

// 查询计划
db.orders.find({status: "active"}).explain("executionStats")

// 当前操作
db.currentOp({"active": true, "secs_running": {$gt: 3}})
```
