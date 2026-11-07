---
name: redis-guide-skill
description: Redis 学习与选型指南。面向需要了解 Redis 的开发者，提供核心数据结构、安装部署、缓存策略、分布式锁原理、与业务场景匹配推荐、设计规则等（不含具体框架集成，Spring Boot 集成请用 springboot-redis-module-skill，Python 集成请用 python-redis-module-skill）。触发词："Redis 学习"、"Redis 入门"、"Redis 选型"、"Redis 缓存"、"Redis 概念"、"Redis 安装"、"分布式锁原理"。
---

# Redis Module Skill

面向**已有后端项目**的开发者，快速集成 Redis 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **连接配置** | Jedis/Lettuce/RedisTemplate 配置 |
| **缓存操作** | String/Hash/List/Set/ZSet 操作 |
| **分布式锁** | Redisson/手动实现 |
| **限流** | 令牌桶/滑动窗口 |
| **消息队列** | List/Stream 延迟队列 |
| **计数器** | 点赞/访问量/排行榜 |

## 触发场景

用户说"帮我加 Redis"或"集成 Redis"时触发。

## 核心配置

### Java (Spring Boot + Redis)

```yaml
# application.yml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      database: 0
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 2
          max-wait: -1ms
```

```java
// RedisConfig.java
@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // JSON 序列化
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);
        
        return template;
    }
}
```

### Python (FastAPI + Redis)

```python
# config.py
class Settings(BaseSettings):
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    redis_db: int = 0

# redis_client.py
import redis
from typing import Optional

class RedisClient:
    def __init__(self, settings: Settings):
        self.client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password,
            db=settings.redis_db,
            decode_responses=True
        )

    def get(self, key: str) -> Optional[str]:
        return self.client.get(key)

    def set(self, key: str, value: str, expire: int = None):
        self.client.set(key, value, ex=expire)

    def hgetall(self, key: str) -> dict:
        return self.client.hgetall(key)

    def hset(self, key: str, field: str, value: str):
        self.client.hset(key, field, value)
```

### Go (Gin + go-redis)

```go
// config/config.go
package config

import (
    "fmt"
    "os"
)

type Config struct {
    RedisHost     string
    RedisPort     string
    RedisPassword string
    RedisDB       int
}

func Load() *Config {
    return &Config{
        RedisHost:     getEnv("REDIS_HOST", "localhost"),
        RedisPort:     getEnv("REDIS_PORT", "6379"),
        RedisPassword: getEnv("REDIS_PASSWORD", ""),
        RedisDB:       0,
    }
}

func (c *Config) Addr() string {
    return fmt.Sprintf("%s:%s", c.RedisHost, c.RedisPort)
}

func getEnv(key, defaultVal string) string {
    if val := os.Getenv(key); val != "" {
        return val
    }
    return defaultVal
}
```

```go
// database/redis.go
package database

import (
    "context"
    "fmt"
    "time"

    "github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func InitRedis(addr, password string, db int) {
    RDB = redis.NewClient(&redis.Options{
        Addr:     addr,
        Password: password,
        DB:       db,
        PoolSize: 10,
    })

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := RDB.Ping(ctx).Err(); err != nil {
        fmt.Printf("连接 Redis 失败: %v\n", err)
        return
    }
    fmt.Println("Redis 连接成功")
}

// 缓存查询结果
func GetCache(ctx context.Context, key string) (string, error) {
    return RDB.Get(ctx).Result()
}

func SetCache(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
    return RDB.Set(ctx, key, value, expiration).Err()
}
```

## 缓存操作

### 基础缓存

```java
// Java: 缓存查询结果
public User getUserById(Long id) {
    String cacheKey = "user:" + id;
    
    // 先查缓存
    User cached = (User) redisTemplate.opsForValue().get(cacheKey);
    if (cached != null) {
        return cached;
    }
    
    // 缓存未命中，查数据库
    User user = userRepository.findById(id).orElse(null);
    if (user != null) {
        redisTemplate.opsForValue().set(cacheKey, user, 30, TimeUnit.MINUTES);
    }
    return user;
}
```

```python
# Python: 缓存装饰器
def cache_key(prefix: str, *args):
    return f"{prefix}:{':'.join(str(a) for a in args)}"

def cached(expire: int = 300):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = cache_key(func.__name__, *args, **kwargs)
            cached_value = redis_client.get(key)
            if cached_value:
                return json.loads(cached_value)
            
            result = func(*args, **kwargs)
            redis_client.set(key, json.dumps(result), expire)
            return result
        return wrapper
    return decorator
```

## 分布式锁

### Redisson Java 实现

```java
@Autowired
private RedissonClient redisson;

public void doWithLock(String lockKey, Runnable action) {
    RLock lock = redisson.getLock(lockKey);
    try {
        // 尝试获取锁，等待 10 秒，锁持有 30 秒
        boolean acquired = lock.tryLock(10, 30, TimeUnit.SECONDS);
        if (acquired) {
            action.run();
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    } finally {
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
```

### Python 分布式锁

```python
import uuid
import time

def acquire_lock(lock_name: str, timeout: int = 10) -> bool:
    lock_value = str(uuid.uuid4())
    acquired = redis_client.client.set(
        f"lock:{lock_name}",
        lock_value,
        nx=True,  # 仅当不存在时设置
        ex=timeout  # 过期时间
    )
    return bool(acquired)

def release_lock(lock_name: str, expected_value: str) -> bool:
    # Lua 脚本：只有值匹配才删除
    script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """
    return redis_client.client.eval(script, 1, f"lock:{lock_name}", expected_value)
```

## 限流

### 滑动窗口限流

```java
public boolean isAllowed(String userId, int maxRequests, int windowSeconds) {
    String key = "rate_limit:" + userId;
    long now = System.currentTimeMillis();
    long windowStart = now - windowSeconds * 1000;
    
    // 移除窗口外的请求
    redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);
    
    // 当前窗口请求数
    Long count = redisTemplate.opsForZSet().zCard(key);
    if (count != null && count >= maxRequests) {
        return false;
    }
    
    // 记录请求
    redisTemplate.opsForZSet().add(key, now, now);
    redisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
    
    return true;
}
```

### 令牌桶

```python
class TokenBucket:
    def __init__(self, rate: int, capacity: int):
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = time.time()
    
    def allow_request(self) -> bool:
        now = time.time()
        # 补充令牌
        elapsed = now - self.last_update
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_update = now
        
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
```

## 消息队列

### 延迟队列（List）

```python
def push_delay_task(queue: str, task: dict, delay_seconds: int):
    # score 为执行时间戳
    score = time.time() + delay_seconds
    redis_client.client.zadd(f"delay:{queue}", {json.dumps(task): score})

def pop_ready_task(queue: str):
    now = time.time()
    # 取出已到期的任务
    tasks = redis_client.client.zrangebyscore(f"delay:{queue}", 0, now, count=1)
    if tasks:
        task = json.loads(tasks[0])
        redis_client.client.zrem(f"delay:{queue}", tasks[0])
        return task
    return None
```

## 计数器与排行榜

### 点赞计数器

```java
public void like(Long postId, Long userId) {
    String likeKey = "post:likes:" + postId;
    String userLikeKey = "post:user_likes:" + postId;
    
    // 检查是否已点赞
    Boolean isNew = redisTemplate.opsForSet().add(userLikeKey, userId.toString()) > 0;
    if (isNew) {
        redisTemplate.opsForValue().increment(likeKey);
    }
}
```

### 排行榜（ZSet）

```python
def add_score(leaderboard: str, user_id: str, score: float):
    redis_client.client.zadd(leaderboard, {user_id: score})

def get_top(leaderboard: str, n: int = 10):
    return redis_client.client.zrevrange(leaderboard, 0, n - 1, withscores=True)

def get_rank(leaderboard: str, user_id: str):
    # 排名从 0 开始
    rank = redis_client.client.zrevrank(leaderboard, user_id)
    return rank + 1 if rank is not None else None
```

## 不做

- 不负责 Redis Server 安装（用户自行安装或使用 Docker）
- 不处理 Redis Cluster 复杂配置
- 不提供数据持久化方案
