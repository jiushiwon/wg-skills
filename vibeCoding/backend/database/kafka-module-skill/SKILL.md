---
name: kafka-module-skill
description: Kafka 消息队列模块集成技能。面向已有后端项目的开发者，提供 Kafka 连接配置、生产者、消费者、消息序列化、消费者组、消息可靠性保证等能力的快速集成。触发词："Kafka 集成"、"Kafka 配置"、"Kafka 消息队列"、"kafka module"、"kafka producer"、"kafka consumer"、"消息队列"。
---

# Kafka Module Skill

面向**已有后端项目**的开发者，快速集成 Kafka 消息队列能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **连接配置** | Producer/Consumer 配置 |
| **生产者** | 同步/异步发送、批量发送 |
| **消费者** | 拉取/订阅、消费者组 |
| **消息可靠性** | ACK、事务、重试 |
| **消息顺序** | 分区策略、顺序消费 |
| **延迟队列** | Redis ZSet 实现（推荐） |

## 触发场景

用户说"帮我加 Kafka"或"集成 Kafka"时触发。

## 核心配置

### Java (Spring Boot + Kafka)

```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      batch-size: 16384
      buffer-memory: 33554432
      properties:
        linger.ms: 1
        max.in.flight.requests.per.connection: 5
    consumer:
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      group-id: ${KAFKA_GROUP_ID:my-group}
      auto-offset-reset: earliest
      enable-auto-commit: false
      properties:
        max.poll.records: 500
        fetch.min.bytes: 1
        max.poll.interval.ms: 300000
```

```java
// KafkaConfig.java
@Configuration
public class KafkaConfig {
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

### Python (FastAPI + Kafka)

```python
# config.py
class Settings(BaseSettings):
    kafka_servers: str = "localhost:9092"
    kafka_group_id: str = "my-group"

# kafka_client.py
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError
import json

class KafkaClient:
    def __init__(self, settings: Settings):
        self.producer = KafkaProducer(
            bootstrap_servers=settings.kafka_servers,
            key_serializer=lambda k: k.encode() if k else None,
            value_serializer=lambda v: json.dumps(v).encode(),
            acks='all',
            retries=3,
            linger_ms=1
        )

        self.consumer = None

    def create_consumer(self, topic: str, group_id: str):
        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers=self.producer.config['bootstrap_servers'],
            group_id=group_id,
            value_deserializer=lambda m: json.loads(m.decode()),
            auto_offset_reset='earliest',
            enable_auto_commit=False
        )
        return self.consumer

    def send(self, topic: str, key: str, value: dict):
        future = self.producer.send(topic, key=key, value=value)
        # 同步等待确认
        record_metadata = future.get(timeout=10)
        return {
            'topic': record_metadata.topic,
            'partition': record_metadata.partition,
            'offset': record_metadata.offset
        }
```

### Go (Gin + confluent-kafka-go)

```go
// config/config.go
package config

import "os"

type Config struct {
    KafkaServers string
    KafkaGroupID string
}

func Load() *Config {
    return &Config{
        KafkaServers: getEnv("KAFKA_SERVERS", "localhost:9092"),
        KafkaGroupID: getEnv("KAFKA_GROUP_ID", "my-group"),
    }
}

func getEnv(key, defaultVal string) string {
    if val := os.Getenv(key); val != "" {
        return val
    }
    return defaultVal
}
```

```go
// kafka/producer.go
package kafka

import (
    "encoding/json"
    "fmt"
    "log"

    "github.com/confluentinc/confluent-kafka-go/kafka"
)

type Producer struct {
    p *kafka.Producer
}

func NewProducer(servers string) (*Producer, error) {
    p, err := kafka.NewProducer(&kafka.ConfigMap{
        "bootstrap.servers": servers,
        "acks":              "all",
        "retries":           3,
    })
    if err != nil {
        return nil, err
    }
    return &Producer{p: p}, nil
}

func (prod *Producer) Send(topic string, key string, value interface{}) error {
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }

    msg := &kafka.Message{
        TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
        Key:            []byte(key),
        Value:          data,
    }

    return prod.p.Produce(msg, nil)
}

func (prod *Producer) Close() {
    prod.p.Flush(5000)
    prod.p.Close()
}
```

```go
// kafka/consumer.go
package kafka

import (
    "encoding/json"
    "fmt"
    "log"

    "github.com/confluentinc/confluent-kafka-go/kafka"
)

type Consumer struct {
    c *kafka.Consumer
}

func NewConsumer(servers, groupID string, topics []string) (*Consumer, error) {
    c, err := kafka.NewConsumer(&kafka.ConfigMap{
        "bootstrap.servers":  servers,
        "group.id":           groupID,
        "auto.offset.reset":  "earliest",
        "enable.auto.commit": false,
    })
    if err != nil {
        return nil, err
    }

    if err = c.SubscribeTopics(topics, nil); err != nil {
        return nil, err
    }

    return &Consumer{c: c}, nil
}

func (cons *Consumer) Consume(handler func(key string, value []byte) error) {
    for {
        msg, err := cons.c.ReadMessage(-1)
        if err != nil {
            log.Printf("消费消息失败: %v", err)
            continue
        }

        if err := handler(string(msg.Key), msg.Value); err != nil {
            log.Printf("处理消息失败: %v", err)
            continue
        }

        cons.c.CommitMessage(msg)
    }
}

func (cons *Consumer) Close() {
    cons.c.Close()
}
```

## 生产者

### 同步发送

```java
// Java
public SendResult<String, Object> send(String topic, String key, Object value) {
    ListenableFuture<SendResult<String, Object>> future = 
        kafkaTemplate.send(topic, key, value);
    
    try {
        SendResult<String, Object> result = future.get(10, TimeUnit.SECONDS);
        log.info("发送成功: topic={}, partition={}, offset={}", 
            result.getRecordMetadata().topic(),
            result.getRecordMetadata().partition(),
            result.getRecordMetadata().offset());
        return result;
    } catch (Exception e) {
        log.error("发送失败", e);
        throw new RuntimeException("消息发送失败", e);
    }
}
```

### 异步发送 + 回调

```python
# Python
def send_async(topic: str, key: str, value: dict):
    future = kafka_client.producer.send(topic, key=key, value=value)
    
    def on_success(record_metadata):
        print(f"发送成功: {record_metadata.topic} [{record_metadata.partition}] @ {record_metadata.offset}")
    
    def on_error(ex):
        print(f"发送失败: {ex}")
    
    future.add_callback(on_success).add_errback(on_error)
    # 不等待，继续处理其他业务
```

### 批量发送

```java
// Java 批量发送
public void sendBatch(String topic, List<Message> messages) {
    List<Future<SendResult<String, Object>>> futures = new ArrayList<>();
    
    for (Message msg : messages) {
        futures.add(kafkaTemplate.send(topic, msg.getKey(), msg.getValue()));
    }
    
    // 等待所有发送完成
    for (Future<SendResult<String, Object>> future : futures) {
        try {
            future.get(10, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("批量发送中有失败", e);
        }
    }
}
```

## 消费者

### 基础消费

```java
// Java
@KafkaListener(topics = "my-topic", groupId = "my-group")
public void consume(ConsumerRecord<String, Object> record) {
    log.info("收到消息: key={}, value={}, partition={}, offset={}", 
        record.key(), record.value(), record.partition(), record.offset());
    
    // 业务处理
    Object value = record.value();
    
    // 手动提交 offset
    if (processSuccess(value)) {
        // 处理成功，记录 offset
    } else {
        // 处理失败，可以选择重试或跳过
    }
}
```

```python
# Python
def consume_messages(topic: str, group_id: str):
    consumer = kafka_client.create_consumer(topic, group_id)
    
    try:
        for message in consumer:
            try:
                key = message.key.decode() if message.key else None
                value = message.value
                
                print(f"收到消息: key={key}, value={value}")
                
                # 业务处理
                process_message(value)
                
                # 手动提交 offset
                consumer.commit()
                
            except Exception as e:
                print(f"处理消息失败: {e}")
                # 可以选择跳过或重试
                
    finally:
        consumer.close()
```

### 消费者组

```yaml
# 多个消费者实例使用相同的 groupId，实现负载均衡
spring:
  kafka:
    consumer:
      group-id: order-service-group
```

```java
// 同一个 groupId 的消费者会自动分配分区
@KafkaListener(topics = "order-topic", groupId = "order-service-group")
public void handleOrder(ConsumerRecord<String, Order> record) {
    // 处理订单消息
}
```

## 消息可靠性

### 生产者可靠性配置

```java
// 确保消息不丢失
props.put(ProducerConfig.ACKS_CONFIG, "all");        // 所有副本确认
props.put(ProducerConfig.RETRIES_CONFIG, 3);         // 重试 3 次
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // 幂等性
props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
```

### 消费者可靠性配置

```java
// 确保消息不重复消费
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false); // 手动提交
props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);     // 每次拉取 500 条
props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000); // 5 分钟内必须处理完
```

### 消息去重

```python
# Python: 业务层面去重
def process_message(message: dict):
    msg_id = message.get('msg_id')
    
    # 检查是否已处理
    if redis_client.exists(f"processed:{msg_id}"):
        print(f"消息 {msg_id} 已处理，跳过")
        return
    
    # 业务处理
    do_business(message)
    
    # 标记已处理（设置 24 小时过期）
    redis_client.setex(f"processed:{msg_id}", 86400, "1")
```

## 消息顺序

### 分区内有序

```java
// 相同 key 的消息发送到同一分区，保证顺序
kafkaTemplate.send("order-topic", orderId.toString(), order);
```

### 全局有序（不推荐）

```java
// 只用一个分区，性能差
props.put(ProducerConfig.PARTITIONER_CLASS_CONFIG, "org.apache.kafka.clients.producer.internals.DefaultPartitioner");
// 或手动指定分区
kafkaTemplate.send("single-partition-topic", 0, key, value);
```

### 顺序消费

```java
// 同一分区的消息串行处理
@KafkaListener(topics = "order-topic", groupId = "order-group")
public void consumeOrder(ConsumerRecord<String, Order> record) {
    synchronized (this) {
        // 串行处理同一分区的消息
        processOrder(record.value());
    }
}
```

## 延迟队列

> **推荐使用 Redis ZSet 实现延迟队列**，更简单可靠。详见 `redis-module-skill`。

Kafka 原生不支持延迟队列，自行实现容易出现消息无限循环等问题。如需在 Kafka 中实现延迟语义，可考虑：
1. 使用 Kafka 的 `__consumer_offsets` + 时间戳过滤（复杂）
2. 使用外部调度器（如 Redis ZSet）触发后再发送到 Kafka

## 死信队列

```java
// 配置死信主题
@KafkaListener(topics = "main-topic", groupId = "main-group")
public void consumeMain(ConsumerRecord<String, Object> record) {
    try {
        processMessage(record.value());
    } catch (Exception e) {
        log.error("处理失败，发送到死信队列", e);
        // 发送到死信队列
        kafkaTemplate.send("dlq-topic", record.key(), record.value());
    }
}
```

## 不做

- 不负责 Kafka Server 安装（用户自行安装或使用 Docker）
- 不处理 Kafka 集群配置和运维
- 不提供消息积压处理方案
