---
name: python-redis-module-skill
description: Python Redis 模块快速集成技能。面向已拥有 FastAPI 项目骨架的开发者，提供 Redis 缓存、Session 存储、分布式锁、限流、消息队列等能力的快速集成。触发词："Python Redis"、"FastAPI Redis"、"Redis 集成"、"redis cache"、"redis session"、"redis lock"、"redis 限流"、"redis 消息队列"。
---

# Python Redis Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成 Redis 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **缓存** | 装饰器缓存、缓存更新、缓存删除 |
| **Session** | Redis Session 共享 |
| **分布式锁** | 基于 Redis 的分布式锁 |
| **限流** | 基于 Redis 的接口限流 |
| **消息队列** | Redis Stream 消息发布/订阅 |
| **计数器** | 分布式计数器 |

## 触发场景

用户说"帮我加 Redis"或"集成 Redis"时触发。

## 依赖配置

```bash
pip install redis aioredis
```

## 默认方法封装

### 1. Redis 客户端

```python
# redis_client.py
import redis
from typing import Optional

class RedisClient:
    def __init__(self, host: str = "localhost", port: int = 6379, password: Optional[str] = None, db: int = 0):
        self.client = redis.Redis(
            host=host,
            port=port,
            password=password,
            db=db,
            decode_responses=True
        )
    
    # 基础操作
    def get(self, key: str) -> Optional[str]:
        return self.client.get(key)
    
    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        return self.client.set(key, value, ex=ex)
    
    def delete(self, *keys: str) -> int:
        return self.client.delete(*keys)
    
    def exists(self, key: str) -> bool:
        return self.client.exists(key)
    
    def expire(self, key: str, seconds: int) -> bool:
        return self.client.expire(key, seconds)
    
    # 哈希操作
    def hget(self, name: str, key: str) -> Optional[str]:
        return self.client.hget(name, key)
    
    def hset(self, name: str, key: str, value: str) -> int:
        return self.client.hset(name, key, value)
    
    def hgetall(self, name: str) -> dict:
        return self.client.hgetall(name)
    
    # 列表操作
    def lpush(self, name: str, *values: str) -> int:
        return self.client.lpush(name, *values)
    
    def rpop(self, name: str) -> Optional[str]:
        return self.client.rpop(name)
    
    # 自增
    def incr(self, key: str, amount: int = 1) -> int:
        return self.client.incr(key, amount)
    
    # 分布式锁
    def lock(self, key: str, timeout: int = 30) -> bool:
        return self.client.set(f"lock:{key}", "1", nx=True, ex=timeout)
    
    def unlock(self, key: str) -> int:
        return self.client.delete(f"lock:{key}")

# 全局实例
redis_client = RedisClient()
```

### 2. 缓存装饰器

```python
# cache.py
import json
import functools
from typing import Callable, Optional, Any

def cache(key_prefix: str, expire: int = 300):
    """缓存装饰器"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # 生成缓存 key
            cache_key = f"{key_prefix}:{':'.join(str(a) for a in args)}"
            
            # 尝试从缓存获取
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # 执行函数
            result = await func(*args, **kwargs)
            
            # 存入缓存
            redis_client.set(cache_key, json.dumps(result, ensure_ascii=False), ex=expire)
            return result
        return wrapper
    return decorator

# 使用示例
@cache("user:info", expire=600)
async def get_user(user_id: int):
    # 首次查询数据库，之后从缓存取
    return await db.query_user(user_id)
```

### 3. 分布式锁

```python
# lock.py
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

class RedisLock:
    def __init__(self, client: RedisClient):
        self.client = client
    
    @asynccontextmanager
    async def lock(self, key: str, timeout: int = 30, retry: int = 3, delay: float = 0.2):
        """分布式锁上下文管理器"""
        lock_key = f"lock:{key}"
        
        for _ in range(retry):
            if self.client.client.set(lock_key, "1", nx=True, ex=timeout):
                try:
                    yield True
                finally:
                    self.client.client.delete(lock_key)
                return
            await asyncio.sleep(delay)
        
        raise TimeoutError(f"获取锁 {key} 失败")

# 使用
lock = RedisLock(redis_client)
async with lock.lock("order:create"):
    # 临界区代码
    pass
```

### 4. 限流

```python
# rate_limit.py
import time
from typing import Optional

class RateLimiter:
    def __init__(self, client: RedisClient):
        self.client = client
    
    def try_acquire(self, key: str, max_requests: int, window_seconds: int = 60) -> bool:
        """滑动窗口限流"""
        now = time.time()
        window_key = f"ratelimit:{key}"
        
        # 移除过期的请求记录
        self.client.client.zremrangebyscore(window_key, 0, now - window_seconds)
        
        # 当前请求数
        current = self.client.client.zcard(window_key)
        
        if current >= max_requests:
            return False
        
        # 添加当前请求
        self.client.client.zadd(window_key, {str(now): now})
        self.client.client.expire(window_key, window_seconds)
        return True

# 使用
limiter = RateLimiter(redis_client)

async def check_rate_limit(request_id: str) -> bool:
    if not limiter.try_acquire(f"api:{request_id}", 100, 60):
        raise Exception("请求过于频繁")
    return True
```

### 5. 消息队列（Stream）

```python
# mq.py
import json
from typing import Callable, Dict, Any, Optional

class RedisStream:
    def __init__(self, client: RedisClient):
        self.client = client
    
    def publish(self, stream: str, data: Dict[str, Any]) -> str:
        """发布消息"""
        return self.client.client.xadd(stream, data)
    
    def subscribe(self, stream: str, group: str, consumer: str, count: int = 10, block: int = 5000):
        """订阅消息"""
        while True:
            messages = self.client.client.xread(
                {stream: "0"},
                count=count,
                block=block
            )
            if messages:
                for stream_name, msgs in messages:
                    for msg_id, msg_data in msgs:
                        yield msg_id, msg_data
                        # 确认消息
                        self.client.client.xack(stream, group, msg_id)

# 生产者
stream = RedisStream(redis_client)
stream.publish("notifications", {"user_id": "123", "message": "hello"})

# 消费者
async def consume_messages():
    async for msg_id, msg in stream.subscribe("notifications", "my-group", "consumer-1"):
        print(f"收到消息: {msg}")
```

## 配置模板

### .env

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0
```

### config.py

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    redis_database: int = 0

settings = Settings()
```

## 不做

- 不负责安装 Redis（用户自行安装或使用 Docker）
- 不处理 Redis 集群配置（单节点为主）
- 不提供数据迁移工具
- 不处理哨兵/主从配置
