---
name: mongodb-guide-skill
description: MongoDB 学习与选型指南。面向需要了解 MongoDB 的开发者，提供核心概念、安装部署、文档模型设计、CRUD、聚合查询、索引优化、与业务场景匹配推荐等（不含具体框架集成）。触发词："MongoDB 学习"、"MongoDB 入门"、"MongoDB 选型"、"MongoDB 概念"、"MongoDB 安装"、"文档数据库"、"mongodb 设计"。
---

# MongoDB Module Skill

面向**已有后端项目**的开发者，快速集成 MongoDB 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **连接配置** | MongoClient/连接池/环境变量配置 |
| **文档模型** | Document/Entity 设计 |
| **CRUD 操作** | 增删改查/批量操作 |
| **聚合查询** | Match/Group/Lookup/Pipeline |
| **索引优化** | 索引设计/慢查询优化 |
| **事务处理** | 多文档事务 |

## 触发场景

用户说"帮我加 MongoDB"或"集成 MongoDB"时触发。

## 核心配置

### Java (Spring Boot)

```yaml
# application.yml
spring:
  data:
    mongodb:
      uri: mongodb://${MONGO_HOST:localhost}:${MONGO_PORT:27017}/${MONGO_DATABASE:myapp}
      uuid-representation: standard
```

### Python (FastAPI)

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_host: str = "localhost"
    mongo_port: int = 27017
    mongo_database: str = "myapp"

# database.py
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(f"mongodb://{host}:{port}")
db = client[database]
```

### Go (Gin + mongo-driver)

```go
// config/config.go
package config

import (
    "fmt"
    "os"
)

type Config struct {
    MongoHost     string
    MongoPort     string
    MongoDatabase string
}

func Load() *Config {
    return &Config{
        MongoHost:     getEnv("MONGO_HOST", "localhost"),
        MongoPort:     getEnv("MONGO_PORT", "27017"),
        MongoDatabase: getEnv("MONGO_DATABASE", "myapp"),
    }
}

func (c *Config) URI() string {
    return fmt.Sprintf("mongodb://%s:%s", c.MongoHost, c.MongoPort)
}

func getEnv(key, defaultVal string) string {
    if val := os.Getenv(key); val != "" {
        return val
    }
    return defaultVal
}
```

```go
// database/database.go
package database

import (
    "context"
    "fmt"
    "log"
    "time"

    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "go.mongodb.org/mongo-driver/mongo/readpref"
)

var (
    Client *mongo.Client
    DB     *mongo.Database
)

func Init(uri, dbName string) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    var err error
    Client, err = mongo.Connect(ctx, options.Client().ApplyURI(uri))
    if err != nil {
        log.Fatalf("连接 MongoDB 失败: %v", err)
    }

    if err = Client.Ping(ctx, readpref.Primary()); err != nil {
        log.Fatalf("Ping MongoDB 失败: %v", err)
    }

    DB = Client.Database(dbName)
    fmt.Println("MongoDB 连接成功")
}

func Close() {
    if Client != nil {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()
        Client.Disconnect(ctx)
    }
}
```

## 文档模型设计

### 基础文档模板

```java
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Field("username")
    private String username;
    
    @Field("password")
    private String password;
    
    @Field("nickname")
    private String nickname;
    
    @Field("status")
    private Integer status = 1;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
```

### Python (Motor)

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class User(BaseModel):
    username: str
    password: str
    nickname: Optional[str] = None
    status: int = 1
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    class Config:
        collection = "users"
```

## CRUD 操作

### Java

```java
@Repository
public class UserRepository {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    // 创建
    public User save(User user) {
        return mongoTemplate.save(user);
    }
    
    // 查询
    public User findById(String id) {
        return mongoTemplate.findById(id, User.class);
    }
    
    public List<User> findByStatus(Integer status) {
        Query query = new Query(Criteria.where("status").is(status));
        return mongoTemplate.find(query, User.class);
    }
    
    // 更新
    public long update(User user) {
        Query query = new Query(Criteria.where("_id").is(user.getId()));
        Update update = new Update()
            .set("nickname", user.getNickname())
            .set("updated_at", LocalDateTime.now());
        return mongoTemplate.updateFirst(query, update, User.class).getModifiedCount();
    }
    
    // 删除
    public long deleteById(String id) {
        Query query = new Query(Criteria.where("_id").is(id));
        return mongoTemplate.remove(query, User.class).getDeletedCount();
    }
}
```

### Python

```python
# CRUD 操作
async def create_user(user: User):
    result = await db.users.insert_one(user.dict())
    return result.inserted_id

async def find_user(username: str):
    return await db.users.find_one({"username": username})

async def list_users(status: int = 1):
    cursor = db.users.find({"status": status})
    return await cursor.to_list(length=100)

async def update_user(user_id: str, nickname: str):
    result = await db.users.update_one(
        {"_id": user_id},
        {"$set": {"nickname": nickname, "updated_at": datetime.now()}}
    )
    return result.modified_count

async def delete_user(user_id: str):
    result = await db.users.delete_one({"_id": user_id})
    return result.deleted_count
```

## 聚合查询

### Java

```java
public List<UserStat> getUserStats() {
    Aggregation aggregation = Aggregation.newAggregation(
        Match(Criteria.where("status").is(1)),
        Group("status")
            .count().as("total")
            .avg("age").as("avgAge"),
        Project().andExclude("_id").and("status").as("status")
    );
    return mongoTemplate.aggregate(aggregation, "users", UserStat.class).getMappedResults();
}
```

### Python

```python
async def get_user_stats():
    pipeline = [
        {"$match": {"status": 1}},
        {"$group": {
            "_id": "$status",
            "total": {"$sum": 1},
            "avg_age": {"$avg": "$age"}
        }}
    ]
    cursor = db.users.aggregate(pipeline)
    return await cursor.to_list(length=100)
```

## 索引优化

```java
// 创建索引
@CompoundIndex(def = "{'username': 1}", unique = true)
@CompoundIndex(def = "{'status': 1, 'created_at': -1}")
public class User {
    // ...
}
```

```python
# Python
await db.users.create_index("username", unique=True)
await db.users.create_index([("status", 1), ("created_at", -1)])
```

## 不做

- 不负责 MongoDB Server 安装（用户自行安装或使用 Docker）
- 不处理复杂的集群配置（副本集、分片）
- 不提供数据迁移工具
