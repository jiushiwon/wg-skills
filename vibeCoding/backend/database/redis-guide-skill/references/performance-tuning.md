# Redis 性能调优指南

> 本文档覆盖内存优化、持久化配置、Pipeline 批量操作、Lua 脚本优化、集群分片策略五大维度，帮助 Redis 在生产环境中达到最佳性能。

---

## 一、内存优化策略

### 1.1 数据结构选择

Redis 底层对不同数据结构有不同的内存编码优化，**选对结构能节省 50%+ 内存**。

| 场景 | 推荐结构 | 不推荐 | 原因 |
|------|----------|--------|------|
| 对象属性存储 | Hash（field < 128 且 value < 64B） | String 逐字段存 | Hash 使用 ziplist 编码，内存紧凑 |
| 计数器 | String `INCR` | Hash | String 的 INCR 是原子操作 |
| 去重集合 | Set（元素 < 128） | List | Set 有 intset 编码优化 |
| 排行榜 | ZSet | List + Sort | ZSet 天然有序，O(logN) 插入 |
| 消息队列 | Stream | List `LPUSH/BRPOP` | Stream 支持消费者组、持久化 |

### 1.2 编码优化参数

```bash
# Hash - ziplist 编码阈值（元素数 < hash-max-ziplist-entries 且 value < hash-max-ziplist-value）
redis-cli config set hash-max-ziplist-entries 128
redis-cli config set hash-max-ziplist-value 64

# List - listpack 编码阈值
redis-cli config set list-max-listpack-size -2  # -2 表示每个节点最大 8KB

# Set - intset 编码阈值（全为整数且元素数 < set-max-intset-entries）
redis-cli config set set-max-intset-entries 512

# ZSet - ziplist 编码阈值
redis-cli config set zset-max-listpack-entries 128
redis-cli config set zset-max-listpack-value 64
```

### 1.3 Key 命名优化

```bash
# 不推荐：长前缀
user:profile:detail:basic:info:1001

# 推荐：简短语义化
u:1001:basic     # user:1001:basic_info
u:1001:extra     # user:1001:extra_info

# 使用冒号分隔，便于 Redis 可视化工具识别层级
```

### 1.4 内存碎片整理

```bash
# 查看碎片率
redis-cli info memory | grep mem_fragmentation_ratio
# 碎片率 > 1.5 时建议开启整理

# 开启主动碎片整理（Redis 4.0+）
redis-cli config set activedefrag yes
redis-cli config set active-defrag-threshold-lower 10   # 碎片率超过 10% 开始整理
redis-cli config set active-defrag-threshold-upper 100  # 碎片率超过 100% 全力整理
redis-cli config set active-defrag-cycle-min 1          # 最小 CPU 占用 1%
redis-cli config set active-defrag-cycle-max 25         # 最大 CPU 占用 25%
```

---

## 二、持久化配置（RDB vs AOF）

### 2.1 RDB 快照

**原理**：定时将内存数据全量写入磁盘二进制文件。

```bash
# redis.conf
save 900 1      # 900 秒内有 1 次修改则触发
save 300 10     # 300 秒内有 10 次修改则触发
save 60 10000   # 60 秒内有 10000 次修改则触发

# 手动触发
redis-cli bgsave  # 后台异步保存（推荐）
redis-cli save    # 同步保存（会阻塞，生产禁用）
```

| 优点 | 缺点 |
|------|------|
| 文件紧凑，适合备份 | 可能丢失最后一次快照后的数据 |
| 恢复速度快 | 大数据集时 fork 子进程耗时 |
| 对性能影响小 | fork 时内存翻倍（COW 机制） |

### 2.2 AOF 日志

**原理**：记录每一条写命令，追加到日志文件。

```bash
# redis.conf
appendonly yes
appendfilename "appendonly.aof"

# 同步策略（三选一）
appendfsync always     # 每条命令都同步（最安全，性能最差）
appendfsync everysec   # 每秒同步一次（推荐，最多丢 1 秒数据）
appendfsync no         # 由操作系统决定（性能最好，安全性最低）

# AOF 重写配置
auto-aof-rewrite-percentage 100  # AOF 文件增长 100% 时触发重写
auto-aof-rewrite-min-size 64mb   # AOF 文件最小 64MB 才触发重写
```

| 优点 | 缺点 |
|------|------|
| 数据安全性高（最多丢 1 秒） | 文件体积比 RDB 大 |
| 可读性好（文本格式） | 恢复速度比 RDB 慢 |
| 支持增量重写 | 持续写入有性能开销 |

### 2.3 混合持久化（推荐）

```bash
# Redis 4.0+ 支持混合模式
aof-use-rdb-preamble yes
```

**原理**：AOF 重写时，前半段用 RDB 格式（快速加载），后半段用 AOF 格式（数据安全）。

**推荐配置**：

```bash
# 生产环境推荐
appendonly yes
appendfsync everysec
aof-use-rdb-preamble yes
save 900 1
save 300 10
save 60 10000
```

---

## 三、Pipeline 批量操作

### 3.1 原理

Pipeline 将多个命令打包发送，**减少网络往返次数**，从 N 次 RTT 降为 1 次。

### 3.2 Java 实现

```java
// Spring RedisTemplate Pipeline
public void batchSet(Map<String, String> dataMap) {
    redisTemplate.executePipelined(new RedisCallback<Void>() {
        @Override
        public Void doInRedis(RedisConnection connection) {
            dataMap.forEach((key, value) -> {
                connection.set(
                    key.getBytes(),
                    value.getBytes()
                );
            });
            return null;
        }
    });
}

// Lettuce 原生 Pipeline
public void batchSetLettuce(Map<String, String> dataMap) {
    StatefulRedisConnection<String, String> connection = lettuce.getConnection();
    RedisCommands<String, String> sync = connection.sync();

    // 开启 Pipeline
    for (Map.Entry<String, String> entry : dataMap.entrySet()) {
        sync.set(entry.getKey(), entry.getValue());
    }
    // sync 命令会在方法返回时自动 flush
}
```

### 3.3 Python 实现

```python
async def batch_set(redis_client, data: dict[str, str]):
    """Pipeline 批量写入"""
    async with redis_client.pipeline(transaction=False) as pipe:
        for key, value in data.items():
            pipe.set(key, value)
        await pipe.execute()

async def batch_get(redis_client, keys: list[str]) -> list:
    """Pipeline 批量读取"""
    async with redis_client.pipeline(transaction=False) as pipe:
        for key in keys:
            pipe.get(key)
        return await pipe.execute()
```

### 3.4 Go 实现

```go
func BatchSet(ctx context.Context, rdb *redis.Client, data map[string]string) error {
    pipe := rdb.Pipeline()

    for key, value := range data {
        pipe.Set(ctx, key, value, time.Hour)
    }

    _, err := pipe.Exec(ctx)
    return err
}

func BatchGet(ctx context.Context, rdb *redis.Client, keys []string) ([]interface{}, error) {
    pipe := rdb.Pipeline()

    cmds := make([]*redis.StringCmd, len(keys))
    for i, key := range keys {
        cmds[i] = pipe.Get(ctx, key)
    }

    _, err := pipe.Exec(ctx)
    if err != nil && err != redis.Nil {
        return nil, err
    }

    results := make([]interface{}, len(keys))
    for i, cmd := range cmds {
        val, err := cmd.Result()
        if err == redis.Nil {
            results[i] = nil
        } else if err != nil {
            return nil, err
        } else {
            results[i] = val
        }
    }
    return results, nil
}
```

### 3.5 Pipeline 最佳实践

| 实践 | 说明 |
|------|------|
| 批次大小控制 | 每批 500-1000 条命令，避免单次发送过大 |
| 非事务场景用 `transaction=False` | 减少 WATCH/MULTI/EXEC 开销 |
| 错误处理 | Pipeline 中单条命令失败不影响其他命令，需逐条检查 |
| 内存控制 | 大批量数据分批发送，避免客户端内存暴涨 |

---

## 四、Lua 脚本优化

### 4.1 适用场景

- **原子操作**：多个命令需要原子执行（如分布式锁、限流器）
- **减少网络开销**：将多条逻辑合并为一次 EVAL 调用
- **条件判断**：服务端执行条件逻辑，减少无意义数据传输

### 4.2 分布式锁（Lua 实现）

```lua
-- 加锁脚本
-- KEYS[1] = lock_key
-- ARGV[1] = lock_value (唯一标识)
-- ARGV[2] = expire_seconds
if redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2]) then
    return 1
end
return 0

-- 释放锁脚本（必须校验持有者）
-- KEYS[1] = lock_key
-- ARGV[1] = lock_value (唯一标识)
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
end
return 0
```

```java
// Java 调用 Lua 脚本
String lockScript = "if redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2]) then return 1 end return 0";
RedisScript<Long> script = new DefaultRedisScript<>(lockScript, Long.class);
Long result = redisTemplate.execute(script, List.of("lock:order:1001"), "uuid-xxx", 30);
```

### 4.3 限流器（滑动窗口）

```lua
-- 滑动窗口限流
-- KEYS[1] = rate_limit_key
-- ARGV[1] = window_size (窗口大小，秒)
-- ARGV[2] = max_count (最大请求数)
-- ARGV[3] = current_timestamp (当前时间戳)

local key = KEYS[1]
local window = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- 移除窗口外的请求
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

-- 统计窗口内请求数
local count = redis.call('ZCARD', key)

if count < limit then
    -- 未超限，记录本次请求
    redis.call('ZADD', key, now, now .. '-' .. math.random(100000))
    redis.call('EXPIRE', key, window)
    return 1  -- 允许
end

return 0  -- 拒绝
```

```go
// Go 调用 Lua 限流脚本
var rateLimitScript = redis.NewScript(`
    local key = KEYS[1]
    local window = tonumber(ARGV[1])
    local limit = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])

    redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
    local count = redis.call('ZCARD', key)

    if count < limit then
        redis.call('ZADD', key, now, now .. '-' .. math.random(100000))
        redis.call('EXPIRE', key, window)
        return 1
    end
    return 0
`)

func AllowRequest(ctx context.Context, rdb *redis.Client, key string, window, limit int) (bool, error) {
    now := time.Now().Unix()
    result, err := rateLimitScript.Run(ctx, rdb, []string{key}, window, limit, now).Int()
    if err != nil {
        return false, err
    }
    return result == 1, nil
}
```

### 4.4 Lua 脚本最佳实践

| 实践 | 说明 |
|------|------|
| 避免长脚本 | 执行时间过长会阻塞 Redis（单线程） |
| 使用 `EVALSHA` | 避免每次传输完整脚本，减少带宽 |
| 错误处理 | Lua 中用 `redis.log()` 记录日志，便于调试 |
| 纯函数 | 脚本内避免依赖外部状态（如系统时间用参数传入） |

---

## 五、集群分片策略

### 5.1 Redis Cluster 分片原理

- **16384 个哈希槽**（slot）均匀分布在多个主节点
- Key 通过 `CRC16(key) % 16384` 决定归属哪个槽
- 每个主节点负责一部分槽 + 对应的从节点

### 5.2 分片规划建议

| 节点数 | 每节点槽数 | 适用场景 |
|--------|-----------|----------|
| 3 主 3 从 | ~5461 槽/节点 | 小规模，数据量 < 50GB |
| 6 主 6 从 | ~2730 槽/节点 | 中等规模，数据量 50-200GB |
| 9 主 9 从 | ~1820 槽/节点 | 大规模，数据量 > 200GB |

### 5.3 Hash Tag 控制数据分布

```bash
# 使用 {} 指定 hash tag，确保相关 key 落在同一槽
SET {user:1001}:name "Alice"
SET {user:1001}:age "30"
SET {user:1001}:email "alice@example.com"
# 三个 key 都会落在同一个槽，支持 MGET 批量操作

# 不推荐：跨槽的批量操作会被拆分为多次网络请求
MGET user:1001:name user:1002:name  # 可能在不同节点，性能差
```

### 5.4 集群扩缩容

```bash
# 添加新节点
redis-cli --cluster add-node <new-node>:7004 <existing-node>:7001

# 分配槽位（从现有节点迁移）
redis-cli --cluster reshard <existing-node>:7001
# 按提示输入：迁移槽数、源节点 ID、目标节点 ID

# 移除节点（先迁走槽位）
redis-cli --cluster del-node <existing-node>:7001 <node-id>
```

### 5.5 集群模式下的注意事项

| 注意点 | 说明 |
|--------|------|
| 跨槽事务 | 不支持（MULTI/EXEC 仅限单槽） |
| 跨槽 Lua | 所有 key 必须在同一槽（使用 hash tag） |
| 数据库选择 | Cluster 模式仅支持 db0 |
| 批量操作 | MGET/MSET 的 key 必须在同一槽，否则报错 |
| 客户端路由 | 开启 `MOVED` / `ASK` 重定向处理 |

### 5.6 读写分离

```java
// Spring 配置读写分离
spring.redis.lettuce.cluster.read-from=replica_preferred
// master = 只读主节点
// replica = 只读从节点
// master_preferred = 优先主节点（默认）
// replica_preferred = 优先从节点（推荐读多写少场景）
```

```go
// Go go-redis Cluster 读写分离
rdb := redis.NewClusterClient(&redis.ClusterOptions{
    Addrs:        []string{"10.0.0.1:7001", "10.0.0.2:7002", "10.0.0.3:7003"},
    ReadOnly:     true,          // 允许从节点读
    RouteByLatency: true,        // 按延迟路由（最低延迟节点）
    RouteRandomly:  false,       // 不随机路由（避免数据不一致）
})
```

---

## 六、性能调优清单

| 维度 | 检查项 | 命令/配置 |
|------|--------|-----------|
| 内存 | 碎片率是否正常 | `info memory` -> `mem_fragmentation_ratio` < 1.5 |
| 内存 | 是否有大 Key | `redis-cli --bigkeys` |
| 延迟 | 平均延迟是否正常 | `redis-cli --latency` < 1ms |
| 延迟 | 是否有慢查询 | `slowlog get 10` |
| 连接 | 连接数是否合理 | `info clients` -> `connected_clients` |
| 命中率 | 缓存命中率 | `info stats` -> `keyspace_hits / (hits + misses)` > 90% |
| 持久化 | RDB/AOF 配置 | `config get save` / `config get appendonly` |
| 集群 | 槽位是否均衡 | `redis-cli --cluster check <node>` |
