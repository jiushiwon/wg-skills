---
name: python-kafka-module-skill
description: Python Kafka 模块快速集成技能。面向已拥有 FastAPI 项目骨架的开发者，提供 Kafka 生产者、消费者、消息订阅、事件驱动等能力的快速集成。触发词："Python Kafka"、"FastAPI Kafka"、"Kafka 集成"、"kafka producer"、"kafka consumer"、"kafka 消息"、"kafka 事件"、"kafka 队列"。
---

# Python Kafka Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成 Kafka 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **生产者** | 同步/异步发送消息、消息分区、消息key |
| **消费者** | 消费监听、消息重试、消费者组 |
| **消息序列化** | JSON |
| **事务消息** | Kafka 事务 |
| **错误处理** | 消息发送/消费错误处理 |

## 触发场景

用户说"帮我加 Kafka"或"集成 Kafka"时触发。

## 依赖配置

```bash
pip install aiokafka
```

## 默认方法封装

### 1. 生产者

```python
# kafka_producer.py
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from typing import Optional, Callable, Any
import json
import logging

logger = logging.getLogger(__name__)

class KafkaProducer:
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self._producer: Optional[AIOKafkaProducer] = None
    
    async def start(self):
        """启动生产者"""
        self._producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None
        )
        await self._producer.start()
        logger.info("Kafka 生产者已启动")
    
    async def stop(self):
        """停止生产者"""
        if self._producer:
            await self._producer.stop()
            logger.info("Kafka 生产者已停止")
    
    async def send(self, topic: str, value: Any, key: Optional[str] = None) -> str:
        """发送消息（同步）"""
        if not self._producer:
            raise RuntimeError("生产者未启动")
        
        future = await self._producer.send_and_wait(topic, value, key=key)
        return f"{future.topic}-{future.partition}-{future.offset}"
    
    async def send_async(self, topic: str, value: Any, key: Optional[str] = None, callback: Optional[Callable] = None):
        """发送消息（异步）"""
        if not self._producer:
            raise RuntimeError("生产者未启动")
        
        await self._producer.send(topic, value, key=key)
        if callback:
            # 注册回调
            pass
    
    async def send_json(self, topic: str, data: dict, key: Optional[str] = None):
        """发送 JSON 消息"""
        return await self.send(topic, data, key)
    
    async def send_messages(self, topic: str, messages: list):
        """批量发送消息"""
        if not self._producer:
            raise RuntimeError("生产者未启动")
        
        for msg in messages:
            await self._producer.send(topic, msg)

# 全局实例
producer = KafkaProducer()
```

### 2. 消费者

```python
# kafka_consumer.py
from aiokafka import AIOKafkaConsumer
from typing import Optional, Callable, Any
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

class KafkaConsumer:
    def __init__(
        self,
        bootstrap_servers: str = "localhost:9092",
        group_id: str = "my-group",
        topics: list = None
    ):
        self.bootstrap_servers = bootstrap_servers
        self.group_id = group_id
        self.topics = topics or []
        self._consumer: Optional[AIOKafkaConsumer] = None
        self._running = False
    
    async def start(self):
        """启动消费者"""
        self._consumer = AIOKafkaConsumer(
            *self.topics,
            bootstrap_servers=self.bootstrap_servers,
            group_id=self.group_id,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            key_deserializer=lambda k: k.decode('utf-8') if k else None,
            auto_offset_reset='earliest',
            enable_auto_commit=False
        )
        await self._consumer.start()
        self._running = True
        logger.info(f"Kafka 消费者已启动，订阅主题: {self.topics}")
    
    async def stop(self):
        """停止消费者"""
        self._running = False
        if self._consumer:
            await self._consumer.stop()
            logger.info("Kafka 消费者已停止")
    
    async def consume(self, handler: Callable):
        """消费消息"""
        if not self._consumer:
            raise RuntimeError("消费者未启动")
        
        async for msg in self._consumer:
            if not self._running:
                break
            
            try:
                logger.info(f"收到消息: topic={msg.topic}, partition={msg.partition}, offset={msg.offset}")
                await handler(msg)
                # 手动提交偏移量
                await self._consumer.commit()
            except Exception as e:
                logger.error(f"处理消息失败: {e}")
                # 可选：发送到死信队列或重试
    
    async def consume_batch(self, handler: Callable, batch_size: int = 100):
        """批量消费消息"""
        if not self._consumer:
            raise RuntimeError("消费者未启动")
        
        messages = []
        async for msg in self._consumer:
            if not self._running:
                break
            
            messages.append(msg)
            if len(messages) >= batch_size:
                try:
                    await handler(messages)
                    await self._consumer.commit()
                except Exception as e:
                    logger.error(f"批量处理消息失败: {e}")
                messages = []
        
        # 处理剩余消息
        if messages:
            try:
                await handler(messages)
                await self._consumer.commit()
            except Exception as e:
                logger.error(f"处理剩余消息失败: {e}")

# 使用示例
async def handle_message(msg):
    """消息处理函数"""
    print(f"处理消息: {msg.value}")
    # 业务逻辑

async def main():
    consumer = KafkaConsumer(
        bootstrap_servers="localhost:9092",
        group_id="my-group",
        topics=["my-topic"]
    )
    await consumer.start()
    try:
        await consumer.consume(handle_message)
    finally:
        await consumer.stop()
```

### 3. 事务消息

```python
# kafka_transaction.py
from aiokafka import AIOKafkaProducer
import asyncio

class KafkaTransactionProducer:
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self._producer: Optional[AIOKafkaProducer] = None
    
    async def start(self):
        self._producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            enable_idempotence=True  # 开启幂等性
        )
        await self._producer.start()
    
    async def stop(self):
        if self._producer:
            await self._producer.stop()
    
    async def send_in_transaction(self, messages: list):
        """事务发送：要么全部成功，要么全部失败"""
        if not self._producer:
            raise RuntimeError("生产者未启动")
        
        transaction = self._producer.transaction()
        await transaction.begin()
        
        try:
            for topic, key, value in messages:
                await transaction.send(topic, value, key=key)
            await transaction.commit()
            return True
        except Exception as e:
            await transaction.abort()
            raise e

# 使用
tp = KafkaTransactionProducer()
await tp.start()
await tp.send_in_transaction([
    ("topic1", "key1", {"data": "1"}),
    ("topic2", "key2", {"data": "2"})
])
```

### 4. 配置管理

```python
# kafka_config.py
from pydantic_settings import BaseSettings
from typing import Optional

class KafkaSettings(BaseSettings):
    bootstrap_servers: str = "localhost:9092"
    producer_group_id: str = "producer-group"
    consumer_group_id: str = "consumer-group"
    topics: list = ["my-topic"]
    
    # 生产者配置
    acks: str = "all"
    retries: int = 3
    batch_size: int = 16384
    linger_ms: int = 10
    
    # 消费者配置
    auto_offset_reset: str = "earliest"
    enable_auto_commit: bool = False

kafka_settings = KafkaSettings()
```

## 配置模板

### .env

```env
KAFKA_HOST=localhost
KAFKA_PORT=9092
KAFKA_TOPICS=my-topic,user-events
```

### 使用示例

```python
# main.py
from fastapi import FastAPI
from kafka_producer import producer
from kafka_consumer import KafkaConsumer

app = FastAPI()

@app.on_event("startup")
async def startup():
    await producer.start()

@app.on_event("shutdown")
async def shutdown():
    await producer.stop()

@app.post("/send")
async def send_message(topic: str, data: dict):
    await producer.send_json(topic, data)
    return {"status": "ok"}
```

## 不做

- 不负责安装 Kafka（用户自行安装或使用 Docker）
- 不处理 Kafka 集群配置（单节点为主）
- 不提供消息持久化策略
- 不处理 Kafka Connect 数据同步
- 不处理 Schema Registry
