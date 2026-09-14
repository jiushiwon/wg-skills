# Redis 连接池配置详解

> 本文档覆盖 Java (Lettuce/Jedis)、Python (redis-py)、Go (go-redis) 三大技术栈的连接池配置，以及 Sentinel/Cluster 高可用方案。

---

## 一、Java 连接池配置

### 1.1 Lettuce（Spring Boot 默认）

Lettuce 是基于 Netty 的异步驱动，支持连接复用，**单连接即可支撑高并发**。

```yaml
# application.yml
spring:
  redis:
    host: 127.0.0.1
    port: 6379
    password: ${REDIS_PASSWORD}
    database: 0
    timeout: 3000ms
    lettuce:
      pool:
        max-active: 16      # 最大连接数（并发上限）
        max-idle: 8         # 最大空闲连接
        min-idle: 2         # 最小空闲连接（预热）
        max-wait: 3000ms    # 获取连接最大等待时间
      shutdown-timeout: 200ms  # 关闭超时
```

**关键参数说明**：

| 参数 | 含义 | 建议值 |
|------|------|--------|
| `max-active` | 池中最大连接数 | CPU 核数 * 2，或根据 QPS 压测调整 |
| `max-idle` | 池中最大空闲连接 | `max-active` 的 50% |
| `min-idle` | 池中最小空闲连接 | 保持 2-5 个预热，避免冷启动延迟 |
| `max-wait` | 无可用连接时的阻塞等待时间 | 业务可接受的最大延迟，通常 1-5s |

### 1.2 Jedis 连接池

Jedis 是同步阻塞模型，**必须依赖连接池**才能支撑并发。

```java
@Configuration
public class RedisConfig {

    @Bean
    public JedisConnectionFactory jedisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName("127.0.0.1");
        config.setPort(6379);
        config.setPassword("your-password");

        JedisClientConfiguration clientConfig = JedisClientConfiguration.builder()
            .connectTimeout(Duration.ofMillis(3000))
            .readTimeout(Duration.ofMillis(3000))
            .usePooling()
            .poolConfig(jedisPoolConfig())
            .build();

        return new JedisConnectionFactory(config, clientConfig);
    }

    @Bean
    public JedisPoolConfig jedisPoolConfig() {
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(16);
        poolConfig.setMaxIdle(8);
        poolConfig.setMinIdle(2);
        poolConfig.setMaxWaitMillis(3000);
        poolConfig.setTestOnBorrow(true);       // 借出时检测连接有效性
        poolConfig.setTestWhileIdle(true);       // 空闲时定期检测
        poolConfig.setTimeBetweenEvictionRunsMillis(30000); // 检测间隔 30s
        poolConfig.setMinEvictableIdleTimeMillis(60000);    // 空闲超过 60s 可驱逐
        return poolConfig;
    }
}
```

---

## 二、Python redis-py 连接池配置

### 2.1 FastAPI 集成示例

```python
# config/redis.py
import redis.asyncio as redis
from contextlib import asynccontextmanager

# 连接池配置
REDIS_POOL = redis.ConnectionPool(
    host="127.0.0.1",
    port=6379,
    password="your-password",
    db=0,
    max_connections=20,          # 最大连接数
    socket_timeout=3,            # 读写超时
    socket_connect_timeout=3,    # 连接超时
    retry_on_timeout=True,       # 超时自动重试
    decode_responses=True,       # 自动解码为 str
)

# 创建客户端
redis_client = redis.Redis(connection_pool=REDIS_POOL)


@asynccontextmanager
async def get_redis():
    """FastAPI 依赖注入"""
    try:
        yield redis_client
    finally:
        pass  # 连接池自动管理，无需手动关闭


# FastAPI 中使用
# @app.get("/cache/{key}")
# async def get_cache(key: str, r: redis.Redis = Depends(get_redis)):
#     return await r.get(key)
```

### 2.2 关键参数

| 参数 | 含义 | 建议值 |
|------|------|--------|
| `max_connections` | 最大连接数 | 并发数 / 单连接 QPS（redis-py 单连接约 10K QPS） |
| `socket_timeout` | 读写超时（秒） | 1-5，视业务容忍度 |
| `socket_connect_timeout` | 建连超时（秒） | 1-3 |
| `retry_on_timeout` | 超时是否重试 | True（幂等操作）/ False（非幂等） |

---

## 三、Go go-redis 连接池配置

```go
// config/redis.go
package config

import (
    "context"
    "time"

    "github.com/redis/go-redis/v9"
)

func NewRedisClient() *redis.Client {
    rdb := redis.NewClient(&redis.Options{
        Addr:         "127.0.0.1:6379",
        Password:     "your-password",
        DB:           0,
        PoolSize:     20,              // 连接池大小
        MinIdleConns: 5,               // 最小空闲连接
        MaxIdleConns: 10,              // 最大空闲连接
        DialTimeout:  3 * time.Second, // 建连超时
        ReadTimeout:  3 * time.Second, // 读超时
        WriteTimeout: 3 * time.Second, // 写超时
        PoolTimeout:  4 * time.Second, // 从池获取连接超时
        ConnMaxIdleTime: 5 * time.Minute,  // 空闲连接存活时间
        ConnMaxLifetime: 30 * time.Minute, // 连接最大生命周期
    })

    // 验证连接
    ctx := context.Background()
    if err := rdb.Ping(ctx).Err(); err != nil {
        panic("Redis 连接失败: " + err.Error())
    }

    return rdb
}
```

**go-redis 参数对照**：

| 参数 | 含义 | 建议值 |
|------|------|--------|
| `PoolSize` | 连接池最大连接数 | 每个 CPU 核 10-20 个连接 |
| `MinIdleConns` | 最小空闲连接 | `PoolSize` 的 25% |
| `MaxIdleConns` | 最大空闲连接 | `PoolSize` 的 50% |
| `ConnMaxIdleTime` | 空闲连接超时回收 | 5-10 分钟 |
| `ConnMaxLifetime` | 连接最大生命周期 | 30 分钟（避免长期连接积累问题） |

---

## 四、连接池参数调优原则

### 4.1 核心公式

```
最大连接数 = 预估 QPS / 单连接 QPS × 安全系数(1.5)
```

- **Lettuce**：单连接可达 10W+ QPS（NIO 模型），通常 8-16 连接足够
- **Jedis**：单连接约 1W QPS，需更多连接
- **go-redis**：单连接约 5W QPS，池大小 10-30 通常足够

### 4.2 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 连接泄漏 | 未正确释放连接 | 使用 `try-with-resources` 或连接池自动管理 |
| 连接风暴 | 应用重启时大量建连 | 设置 `min-idle` 预热 + `max-wait` 限流 |
| 空闲超时 | 服务端主动断开空闲连接 | 客户端 `ConnMaxIdleTime` < 服务端 `timeout` |
| 连接数不足 | 并发超过池大小 | 增大 `max-active` 或优化业务减少 Redis 调用 |

---

## 五、Sentinel/Cluster 连接配置

### 5.1 Sentinel 模式（Java）

```yaml
spring:
  redis:
    sentinel:
      master: mymaster
      nodes:
        - 10.0.0.1:26379
        - 10.0.0.2:26379
        - 10.0.0.3:26379
    password: ${REDIS_PASSWORD}
    lettuce:
      pool:
        max-active: 16
        max-idle: 8
        min-idle: 2
```

### 5.2 Cluster 模式（Java）

```yaml
spring:
  redis:
    cluster:
      nodes:
        - 10.0.0.1:7001
        - 10.0.0.2:7002
        - 10.0.0.3:7003
      max-redirects: 3  # 最大重定向次数
    password: ${REDIS_PASSWORD}
    lettuce:
      pool:
        max-active: 32  # Cluster 模式下建议增大（多分片）
```

### 5.3 Sentinel 模式（Go）

```go
rdb := redis.NewFailoverClient(&redis.FailoverOptions{
    MasterName:    "mymaster",
    SentinelAddrs: []string{"10.0.0.1:26379", "10.0.0.2:26379", "10.0.0.3:26379"},
    Password:      "your-password",
    DB:            0,
    PoolSize:      20,
    MinIdleConns:  5,
})
```

### 5.4 Cluster 模式（Go）

```go
rdb := redis.NewClusterClient(&redis.ClusterOptions{
    Addrs: []string{
        "10.0.0.1:7001",
        "10.0.0.2:7002",
        "10.0.0.3:7003",
    },
    Password:     "your-password",
    PoolSize:     30,
    MinIdleConns: 10,
    RouteByLatency: true,  // 按延迟路由，提升性能
    ReadOnly:     true,    // 从节点可读，分担压力
})
```

### 5.5 Cluster 模式（Python）

```python
from redis.asyncio import RedisCluster

redis_cluster = RedisCluster(
    startup_nodes=[
        {"host": "10.0.0.1", "port": 7001},
        {"host": "10.0.0.2", "port": 7002},
        {"host": "10.0.0.3", "port": 7003},
    ],
    password="your-password",
    max_connections_per_node=10,
    decode_responses=True,
)
```

---

## 六、最佳实践总结

1. **Lettuce 优先**：Spring Boot 默认且性能最优，单连接即可应对大部分场景
2. **连接数不是越大越好**：过多连接消耗服务端资源，按需配置 + 压测验证
3. **健康检测必须开启**：`testOnBorrow` / `testWhileIdle` 避免使用失效连接
4. **超时时间分层**：建连超时 > 读写超时 > 业务超时，逐层递减
5. **Cluster 模式下关注路由**：开启 `RouteByLatency` 或 `ReadOnly` 分担读压力
