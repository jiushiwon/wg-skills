# MongoDB 连接池配置详解

## 核心概念

MongoDB 连接池是客户端与服务器之间的 TCP 连接缓存机制，避免频繁创建/销毁连接的开销。每个驱动程序维护自己的连接池。

**关键参数说明**：
- `maxPoolSize`：连接池最大连接数（默认 100）
- `minPoolSize`：保持的最小空闲连接数（默认 0）
- `maxIdleTimeMS`：连接最大空闲时间（默认无限）
- `waitQueueTimeoutMS`：等待连接的超时时间（默认 120s）
- `connectTimeoutMS`：单次连接建立超时（默认 30s）
- `socketTimeoutMS`：socket 读写超时（默认无限）

---

## Java Spring Data MongoDB

### application.yml 配置

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://user:password@host1:27017,host2:27017/dbname?replicaSet=rs0
      # 连接池配置通过 ConnectionPoolSettings 设置
```

### 编程式配置（推荐）

```java
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Override
    protected String getDatabaseName() {
        return "mydb";
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(
            "mongodb://user:password@host1:27017,host2:27017/mydb?replicaSet=rs0"
        );

        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .applyToConnectionPoolSettings(builder ->
                builder.maxSize(50)                    // 最大连接数
                       .minSize(10)                    // 最小空闲连接
                       .maxWaitTime(5, TimeUnit.SECONDS)    // 等待连接超时
                       .maxConnectionIdleTime(60, TimeUnit.SECONDS)  // 空闲超时
                       .maxConnectionLifeTime(180, TimeUnit.SECONDS) // 连接最大生命周期
            )
            .applyToSocketSettings(builder ->
                builder.connectTimeout(5, TimeUnit.SECONDS)  // 连接超时
                       .readTimeout(10, TimeUnit.SECONDS)    // 读超时
            )
            .build();

        return MongoClients.create(settings);
    }
}
```

### 连接池监控

```java
import com.mongodb.event.ConnectionPoolListener;
import com.mongodb.event.ConnectionPoolCreatedEvent;
import com.mongodb.event.ConnectionCheckedOutEvent;
import org.springframework.stereotype.Component;

@Component
public class MongoPoolMonitor implements ConnectionPoolListener {

    @Override
    public void connectionPoolCreated(ConnectionPoolCreatedEvent event) {
        log.info("连接池创建: maxSize={}", event.getSettings().getMaxSize());
    }

    @Override
    public void connectionCheckedOut(ConnectionCheckedOutEvent event) {
        // 可接入 Prometheus/Micrometer 指标
    }
}
```

---

## Python Motor/PyMongo

### 基础配置

```python
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

# 异步客户端（FastAPI 推荐）
client = AsyncIOMotorClient(
    "mongodb://user:password@host1:27017,host2:27017/mydb?replicaSet=rs0",
    maxPoolSize=50,           # 最大连接数
    minPoolSize=10,           # 最小空闲连接
    maxIdleTimeMS=60000,      # 空闲超时（毫秒）
    waitQueueTimeoutMS=5000,  # 等待队列超时
    connectTimeoutMS=5000,    # 连接超时
    socketTimeoutMS=10000,    # Socket 超时
    retryWrites=True,         # 写重试
    retryReads=True,          # 读重试
)

# 同步客户端
sync_client = MongoClient(
    "mongodb://user:password@host1:27017/mydb",
    maxPoolSize=50,
    minPoolSize=10,
)
```

### FastAPI 集成

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化连接池
    app.state.mongo_client = AsyncIOMotorClient(
        "mongodb://localhost:27017",
        maxPoolSize=50,
        minPoolSize=10,
    )
    yield
    # 关闭时释放连接
    app.state.mongo_client.close()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health_check():
    try:
        await app.state.mongo_client.admin.command("ping")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
```

### 连接池状态查询

```python
# 获取连接池统计
async def get_pool_stats(client: AsyncIOMotorClient):
    stats = await client.admin.command("serverStatus")
    connections = stats.get("connections", {})
    return {
        "current": connections.get("current"),
        "available": connections.get("available"),
        "totalCreated": connections.get("totalCreated"),
    }
```

---

## Go mongo-driver

### 基础配置

```go
package main

import (
    "context"
    "time"

    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "go.mongodb.org/mongo-driver/mongo/readpref"
)

func NewMongoClient() (*mongo.Client, error) {
    uri := "mongodb://user:password@host1:27017,host2:27017/mydb?replicaSet=rs0"

    opts := options.Client().ApplyURI(uri)

    // 连接池配置
    opts.SetMaxPoolSize(50)                     // 最大连接数
    opts.SetMinPoolSize(10)                     // 最小空闲连接
    opts.SetMaxConnIdleTime(60 * time.Second)   // 空闲超时
    opts.SetConnectTimeout(5 * time.Second)     // 连接超时
    opts.SetSocketTimeout(10 * time.Second)     // Socket 超时
    opts.SetServerSelectionTimeout(10 * time.Second) // 服务器选择超时

    // 压缩（可选，减少网络传输）
    opts.SetCompressors([]string{"snappy", "zstd"})

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    client, err := mongo.Connect(ctx, opts)
    if err != nil {
        return nil, err
    }

    // 验证连接
    if err := client.Ping(ctx, readpref.Primary()); err != nil {
        return nil, err
    }

    return client, nil
}
```

### 连接池监控

```go
import (
    "go.mongodb.org/mongo-driver/event"
    "log"
)

func newPoolMonitor() *event.PoolMonitor {
    return &event.PoolMonitor{
        Event: func(e event.PoolEvent) {
            switch e.Type {
            case event.GetStarted:
                log.Printf("连接获取开始: %s", e.Address)
            case event.GetSucceeded:
                log.Printf("连接获取成功: %s, 耗时: %dms", e.Address, e.DurationNanos/1e6)
            case event.ConnectionCreated:
                log.Printf("新连接创建: %s", e.Address)
            case event.ConnectionClosed:
                log.Printf("连接关闭: %s, 原因: %s", e.Address, e.Reason)
            }
        },
    }
}

// 使用
opts.SetPoolMonitor(newPoolMonitor())
```

---

## 参数调优建议

### 通用计算公式

```
最大连接数 = CPU 核心数 * 2 + 磁盘数
```

### 场景化配置

| 场景 | maxPoolSize | minPoolSize | maxIdleTimeMS |
|------|-------------|-------------|---------------|
| 开发/测试 | 10 | 0 | 30000 |
| 中等负载 | 50 | 10 | 60000 |
| 高并发 | 100-200 | 20-50 | 120000 |
| 微服务多实例 | 20-30 | 5-10 | 60000 |

### 注意事项

1. **每个应用实例独立的连接池**：10 个微服务实例 * maxPoolSize=50 = 500 个连接
2. **MongoDB 默认最大连接数**：65536（可调整）
3. **副本集连接**：连接池会自动维护到 Primary 和 Secondary 的连接
4. **负载均衡**：`readPreference=secondaryPreferred` 可分散读压力

### 监控指标

```bash
# 查看 MongoDB 连接数
db.serverStatus().connections

# 查看当前操作
db.currentOp({"active": true})

# 查看连接池统计
db.serverStatus().network
```

---

## 常见问题

**Q: 连接池耗尽怎么办？**
A: 检查慢查询、增加 maxPoolSize、优化查询性能、使用连接复用。

**Q: 为什么连接数持续增长？**
A: 检查是否正确关闭游标、是否有连接泄漏、maxIdleTimeMS 是否设置合理。

**Q: 多数据库如何配置？**
A: 通常一个 MongoClient 即可，通过 `client.Database("dbname")` 切换，连接池会自动管理。
