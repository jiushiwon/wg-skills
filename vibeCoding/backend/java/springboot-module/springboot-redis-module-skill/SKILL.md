---
name: springboot-redis-module-skill
description: Spring Redis 模块快速集成技能。面向已拥有 Spring Boot 项目骨架的开发者，提供 Redis 缓存、Session 存储、分布式锁、限流、消息队列等能力的快速集成。触发词："Spring Redis"、"Spring Boot Redis"、"Redis 集成"、"redis cache"、"redis session"、"redis lock"、"redis 限流"、"redis 消息队列"。
---

# Spring Redis Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成 Redis 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **缓存** | `@Cacheable` 注解缓存、缓存更新、缓存删除 |
| **Session** | Redis Session 共享、Spring Session 配置 |
| **分布式锁** | 基于 Redis 的分布式锁（Redisson） |
| **限流** | 基于 Redis 的接口限流 |
| **消息队列** | Redis Stream 消息发布/订阅 |
| **计数器** | 分布式计数器、排行榜 |

## 触发场景

用户说"帮我加 Redis"或"集成 Redis"时触发。

## 依赖配置

```xml
<!-- pom.xml 添加 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.24.3</version>
</dependency>
```

## 默认方法封装

### 1. 缓存操作

```java
// RedisConfig.java - 配置
@Configuration
@EnableCaching
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        // 配置序列化器
    }
}

// 使用示例
@Service
public class UserService {
    @Cacheable(value = "users", key = "#id")
    public User getUser(Long id) {
        // 首次查询数据库，之后从缓存取
    }

    @CachePut(value = "users", key = "#user.id")
    public User updateUser(User user) {
        // 更新后自动更新缓存
    }

    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        // 删除后自动清除缓存
    }
}
```

### 2. 分布式锁

```java
@Service
public class LockService {
    @Autowired
    private RedissonClient redisson;

    public void executeWithLock(String lockKey, Runnable task) {
        RLock lock = redisson.getLock(lockKey);
        try {
            lock.lock();
            task.run();
        } finally {
            lock.unlock();
        }
    }

    // 尝试获取锁
    public boolean tryLock(String lockKey, long waitTime, long leaseTime, TimeUnit unit) {
        RLock lock = redisson.getLock(lockKey);
        return lock.tryLock(waitTime, leaseTime, unit);
    }
}
```

### 3. 限流

```java
@Component
public class RateLimiter {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public boolean tryAcquire(String key, int maxRequests, long windowSeconds) {
        String value = redisTemplate.opsForValue().increment(key);
        if (value == null) return false;
        
        if (value == 1) {
            redisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
        }
        return value <= maxRequests;
    }
}

// 使用示例
@RestController
public class ApiController {
    @Autowired
    private RateLimiter rateLimiter;

    @GetMapping("/api/data")
    public ApiResponse<Data> getData() {
        String key = "ratelimit:api:data";
        if (!rateLimiter.tryAcquire(key, 100, 60)) {
            throw new BusinessException(-429, "请求过于频繁，请稍后再试");
        }
        // 业务逻辑
    }
}
```

### 4. Session 共享

```yaml
# application.yml
spring:
  data:
    redis:
      host: localhost
      port: 6379
  session:
    store-type: redis
    redis:
      namespace: wg:session
```

### 5. 消息队列（Stream）

```java
@Service
public class RedisStreamProducer {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public void sendMessage(String stream, String key, Object value) {
        Map<String, String> map = new HashMap<>();
        map.put(key, JSON.toJSONString(value));
        redisTemplate.opsForStream().add(StreamRecords.newRecord().in(stream).ofMap(map));
    }
}

@Service
public class RedisStreamConsumer {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @PostConstruct
    public void consume() {
        redisTemplate.opsForStream().read(
            Consumer.from("group1", "consumer1"),
            StreamReadOptions.empty().count(10).block(Duration.ofSeconds(2)),
            StreamOffset.create("my-stream", ReadOffset.lastConsumed())
        ).forEach(record -> {
            // 处理消息
        });
    }
}
```

## 配置模板

### application.yml

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      database: ${REDIS_DATABASE:0}
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 2
          max-wait: -1ms

# Redisson 配置
redisson:
  address: redis://${REDIS_HOST:localhost}:${REDIS_PORT:6379}
  password: ${REDIS_PASSWORD:}
  database: ${REDIS_DATABASE:0}
```

## 不做

- 不负责安装 Redis（用户自行安装或使用 Docker）
- 不处理 Redis 集群配置（单节点为主）
- 不提供数据迁移工具
