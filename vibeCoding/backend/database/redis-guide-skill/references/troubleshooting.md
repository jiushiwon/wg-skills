# Redis 常见问题排查指南

> 本文档覆盖 Redis 生产环境中高频出现的五大类问题：连接超时、内存不足、缓存穿透/击穿/雪崩、大 Key、热 Key，提供排查思路与解决方案。

---

## 一、连接超时排查

### 1.1 现象

- 客户端报 `Connection timed out` 或 `Could not get a resource from the pool`
- 偶发性超时，非持续性

### 1.2 排查步骤

```bash
# 1. 检查 Redis 服务端是否存活
redis-cli -h <host> -p <port> ping
# 预期返回 PONG

# 2. 检查连接数是否耗尽
redis-cli info clients
# 关注 connected_clients 和 blocked_clients

# 3. 检查慢查询日志
redis-cli slowlog get 10
# 耗时 > 10ms 的命令会被记录

# 4. 检查网络延迟
redis-cli --latency-history -h <host>
# 正常应 < 1ms
```

### 1.3 常见原因与解决

| 原因 | 排查手段 | 解决方案 |
|------|----------|----------|
| 连接池耗尽 | `info clients` 查看 `connected_clients` | 增大 `max-active`，或排查连接泄漏 |
| 慢查询阻塞 | `slowlog get` 查看耗时命令 | 优化慢查询（避免 `KEYS *`、大集合操作） |
| 网络抖动 | `ping` 延迟、`--latency-history` | 检查网络设备、调整超时参数 |
| 服务端满连接 | `maxclients` 配置 | 调大 `maxclients`（默认 10000） |
| 客户端建连风暴 | 应用重启时大量建连 | 设置 `min-idle` 预热连接池 |

### 1.4 代码层面防护

```java
// Java - Lettuce 超时配置
spring.redis.timeout=3000ms
spring.redis.lettuce.pool.max-wait=3000ms

// Python - redis-py 超时配置
redis.ConnectionPool(
    socket_timeout=3,
    socket_connect_timeout=3,
    retry_on_timeout=True,
)

// Go - go-redis 超时配置
redis.Options{
    DialTimeout:  3 * time.Second,
    ReadTimeout:  3 * time.Second,
    WriteTimeout: 3 * time.Second,
    PoolTimeout:  4 * time.Second,
}
```

---

## 二、内存不足问题

### 2.1 现象

- 日志报 `OOM command not allowed`
- `used_memory` 接近 `maxmemory`
- 驱逐策略生效，缓存命中率下降

### 2.2 排查步骤

```bash
# 1. 查看内存使用情况
redis-cli info memory
# 关注 used_memory、maxmemory、mem_fragmentation_ratio

# 2. 分析内存分布（按 key 大小排序）
redis-cli --bigkeys
# 找出占用内存最多的 key 类型

# 3. 查看当前驱逐策略
redis-cli config get maxmemory-policy

# 4. 实时监控内存变化
redis-cli info memory | grep used_memory_human
```

### 2.3 驱逐策略选择

| 策略 | 适用场景 | 说明 |
|------|----------|------|
| `noeviction` | 不允许丢失数据 | 内存满时拒绝写入，**生产慎用** |
| `allkeys-lru` | 通用缓存 | 所有 key 中淘汰最近最少使用的 |
| `volatile-lru` | 有过期时间的缓存 | 仅淘汰设置了 TTL 的 key |
| `allkeys-lfu` | 热点数据明显 | 所有 key 中淘汰访问频率最低的 |
| `volatile-ttl` | 优先淘汰快过期的 | 淘汰 TTL 最小的 key |

**推荐**：缓存场景用 `allkeys-lru` 或 `allkeys-lfu`。

### 2.4 内存优化建议

```bash
# 设置最大内存
redis-cli config set maxmemory 4gb

# 设置驱逐策略
redis-cli config set maxmemory-policy allkeys-lru

# 开启内存碎片整理（Redis 4.0+）
redis-cli config set activedefrag yes
```

---

## 三、缓存穿透/击穿/雪崩

### 3.1 缓存穿透

**定义**：查询一个**一定不存在**的数据，缓存和数据库都没有，请求直接打到数据库。

**场景**：恶意攻击、爬虫伪造不存在的 ID。

**解决方案**：

```java
// 方案一：缓存空值（推荐简单场景）
public String getData(String key) {
    String value = redis.get(key);
    if (value != null) {
        return "".equals(value) ? null : value; // 空值标记
    }

    value = db.query(key);
    if (value == null) {
        redis.setex(key, 300, ""); // 缓存空值，TTL 5 分钟
    } else {
        redis.setex(key, 3600, value);
    }
    return value;
}

// 方案二：布隆过滤器（推荐高并发场景）
// 使用 Redisson 的 RBloomFilter
RBloomFilter<String> filter = redisson.getBloomFilter("keyFilter");
filter.tryInit(1000000L, 0.01); // 预计 100W 数据，误判率 1%

public String getDataWithBloom(String key) {
    if (!filter.contains(key)) {
        return null; // 布隆过滤器拦截
    }
    // 后续走缓存 -> 数据库逻辑
}
```

### 3.2 缓存击穿

**定义**：某个**热点 key** 过期瞬间，大量并发请求同时打到数据库。

**解决方案**：

```go
// 方案一：互斥锁（推荐）
func GetData(ctx context.Context, key string) (string, error) {
    // 1. 查缓存
    val, err := rdb.Get(ctx, key).Result()
    if err == nil {
        return val, nil
    }

    // 2. 尝试获取分布式锁
    lockKey := "lock:" + key
    ok, err := rdb.SetNX(ctx, lockKey, "1", 10*time.Second).Result()
    if err != nil {
        return "", err
    }

    if ok {
        // 3. 获取到锁，查数据库并回填缓存
        defer rdb.Del(ctx, lockKey)
        val, err = queryFromDB(key)
        if err != nil {
            return "", err
        }
        rdb.SetEX(ctx, key, val, time.Hour)
        return val, nil
    }

    // 4. 未获取到锁，短暂等待后重试
    time.Sleep(100 * time.Millisecond)
    return GetData(ctx, key)
}

// 方案二：逻辑过期（推荐读多写少场景）
// 缓存永不过期，value 中存储逻辑过期时间
```

### 3.3 缓存雪崩

**定义**：**大量 key 同时过期**或 **Redis 宕机**，请求全部打到数据库。

**解决方案**：

```python
# 方案一：TTL 加随机扰动（避免同时过期）
import random

async def set_with_jitter(redis_client, key, value, base_ttl=3600):
    jitter = random.randint(0, 300)  # 0-5 分钟随机扰动
    await redis_client.setex(key, base_ttl + jitter, value)

# 方案二：多级缓存（本地缓存 + Redis）
from cachetools import TTLCache

local_cache = TTLCache(maxsize=1000, ttl=60)  # 本地缓存 60s

async def get_with_local_cache(redis_client, key):
    # 1. 先查本地缓存
    if key in local_cache:
        return local_cache[key]

    # 2. 再查 Redis
    value = await redis_client.get(key)
    if value:
        local_cache[key] = value
        return value

    # 3. 最后查数据库
    value = await query_from_db(key)
    if value:
        await set_with_jitter(redis_client, key, value)
        local_cache[key] = value
    return value
```

---

## 四、大 Key 问题

### 4.1 定义

- **String 类型**：value > 10KB
- **集合类型**（Hash/List/Set/ZSet）：元素 > 5000 个 或 value > 10MB

### 4.2 排查

```bash
# 找出所有大 key（线上慎用，会阻塞）
redis-cli --bigkeys

# 更精确的方式：使用 memory usage 命令（Redis 4.0+）
redis-cli memory usage <key>

# 使用 scan 分批扫描（生产推荐）
redis-cli --scan --pattern "*" | while read key; do
    size=$(redis-cli memory usage "$key" 2>/dev/null)
    if [ -n "$size" ] && [ "$size" -gt 10240 ]; then
        echo "$key: $size bytes"
    fi
done
```

### 4.3 大 Key 的危害

| 危害 | 说明 |
|------|------|
| 阻塞其他命令 | DEL 大 key 会阻塞主线程（Redis 单线程） |
| 网络拥塞 | 大 value 传输占用带宽 |
| 内存不均 | Cluster 模式下分片内存倾斜 |
| 慢查询 | 读取大集合耗时长 |

### 4.4 解决方案

```bash
# 1. 异步删除（Redis 4.0+）
redis-cli unlink <bigkey>  # 非阻塞删除

# 2. 渐进式删除大集合
# 对于 Hash：分批 HSCAN + HDEL
# 对于 List：分批 LTRIM
# 对于 Set：分批 SSCAN + SREM
# 对于 ZSet：分批 ZSCAN + ZREM

# 3. 拆分大 key
# 例如：user:profile:1001 -> user:profile:1001:basic + user:profile:1001:extra
```

### 4.5 预防措施

```java
// 写入时控制大小
public void saveUserProfile(Long userId, Map<String, Object> profile) {
    String key = "user:profile:" + userId;

    // 方案一：按字段分组存储
    Map<String, Object> basic = extractBasic(profile);
    Map<String, Object> extra = extractExtra(profile);

    redis.hsetAll(key + ":basic", basic);
    redis.hsetAll(key + ":extra", extra);

    // 设置合理的 TTL
    redis.expire(key + ":basic", Duration.ofHours(24));
    redis.expire(key + ":extra", Duration.ofHours(12));
}
```

---

## 五、热 Key 问题

### 5.1 定义

某个 key 被**高频访问**（QPS > 1000），导致单分片或单节点压力过大。

### 5.2 排查

```bash
# 1. 实时监控热点 key（Redis 4.0+）
redis-cli --hotkeys
# 需要开启 LFU 策略：maxmemory-policy allkeys-lfu

# 2. 使用 MONITOR 命令（线上慎用，性能损耗大）
redis-cli monitor | awk '{print $NF}' | sort | uniq -c | sort -rn | head -20

# 3. 业务侧埋点统计
```

### 5.3 解决方案

```java
// 方案一：本地缓存（推荐）
// 使用 Caffeine 作为 L1 缓存
@Bean
public Cache<String, Object> localCache() {
    return Caffeine.newBuilder()
        .maximumSize(10000)
        .expireAfterWrite(Duration.ofSeconds(30)) // 短 TTL，与 Redis 保持准实时
        .build();
}

public String getHotData(String key) {
    // 1. 先查本地缓存
    Object value = localCache.getIfPresent(key);
    if (value != null) {
        return (String) value;
    }

    // 2. 再查 Redis
    value = redisTemplate.opsForValue().get(key);
    if (value != null) {
        localCache.put(key, value);
    }
    return (String) value;
}

// 方案二：读写分离 + 多副本
// Redis Cluster 中设置 read_from: replica
```

```go
// Go - 使用 singleflight 合并并发请求
import "golang.org/x/sync/singleflight"

var g singleflight.Group

func GetHotData(ctx context.Context, key string) (string, error) {
    val, err, _ := g.Do(key, func() (interface{}, error) {
        // 同一时刻只有一个请求会真正执行
        return rdb.Get(ctx, key).Result()
    })
    if err != nil {
        return "", err
    }
    return val.(string), nil
}
```

```python
# Python - 使用 asyncio.Lock 合并并发请求
import asyncio

_locks: dict[str, asyncio.Lock] = {}

async def get_hot_data(redis_client, key: str):
    if key not in _locks:
        _locks[key] = asyncio.Lock()

    async with _locks[key]:
        # 同一 key 的并发请求串行化
        return await redis_client.get(key)
```

---

## 六、排查命令速查表

| 场景 | 命令 | 说明 |
|------|------|------|
| 内存分析 | `redis-cli info memory` | 查看内存使用概况 |
| 大 Key | `redis-cli --bigkeys` | 找出大 Key |
| 热 Key | `redis-cli --hotkeys` | 找出热 Key（需 LFU） |
| 慢查询 | `redis-cli slowlog get 10` | 最近 10 条慢查询 |
| 连接数 | `redis-cli info clients` | 客户端连接信息 |
| 命中率 | `redis-cli info stats` | `keyspace_hits` / `keyspace_misses` |
| 延迟 | `redis-cli --latency` | 测试延迟 |
| 实时命令 | `redis-cli monitor` | 实时打印所有命令（慎用） |
