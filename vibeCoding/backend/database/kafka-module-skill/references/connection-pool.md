# Kafka 连接池配置详解

## 概述

Kafka 的连接配置直接影响消息系统的可靠性、吞吐量和延迟。本文档涵盖生产者和消费者的核心参数配置，以及各语言的最佳实践。

---

## 生产者配置

### 核心参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `bootstrap.servers` | - | Kafka 集群地址，多个用逗号分隔 |
| `acks` | 1 | 消息确认机制：0/1/-1(all) |
| `retries` | 2147483647 | 发送失败重试次数 |
| `batch.size` | 16384 | 批量发送大小（字节） |
| `linger.ms` | 0 | 等待凑批时间（毫秒） |
| `buffer.memory` | 33554432 | 发送缓冲区大小（32MB） |
| `compression.type` | none | 压缩算法：none/gzip/snappy/lz4/zstd |
| `max.in.flight.requests.per.connection` | 5 | 每个连接最大未确认请求数 |
| `enable.idempotence` | false | 是否启用幂等性 |

### Java (Spring Boot)

```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      batch-size: 65536          # 64KB，适合高吞吐场景
      buffer-memory: 67108864    # 64MB
      properties:
        linger.ms: 5             # 等待 5ms 凑批
        compression.type: lz4    # LZ4 压缩，平衡性能和压缩率
        max.in.flight.requests.per.connection: 5
        enable.idempotence: true # 启用幂等性，防止重复消息
```

```java
// KafkaProducerConfig.java
@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();

        // 基础配置
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // 可靠性配置
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);

        // 性能配置
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 65536);
        props.put(ProducerConfig.LINGER_MS_CONFIG, 5);
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 67108864L);
        props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");

        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

### Python (FastAPI + kafka-python)

```python
from kafka import KafkaProducer
import json

class KafkaProducerClient:
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,

            # 序列化配置
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),

            # 可靠性配置
            acks='all',
            retries=3,

            # 性能配置
            batch_size=65536,      # 64KB
            linger_ms=5,           # 等待 5ms 凑批
            buffer_memory=67108864, # 64MB
            compression_type='lz4',

            # 请求配置
            max_in_flight_requests_per_connection=5,
        )

    def send(self, topic: str, key: str, value: dict):
        future = self.producer.send(topic, key=key, value=value)
        record_metadata = future.get(timeout=10)
        return record_metadata

    def close(self):
        self.producer.flush()
        self.producer.close()
```

### Go (confluent-kafka-go)

```go
package kafka

import (
    "github.com/confluentinc/confluent-kafka-go/kafka"
    "encoding/json"
)

type Producer struct {
    p *kafka.Producer
}

func NewProducer(brokers string) (*Producer, error) {
    p, err := kafka.NewProducer(&kafka.ConfigMap{
        // 基础配置
        "bootstrap.servers": brokers,

        // 可靠性配置
        "acks":                    "all",
        "retries":                 3,
        "enable.idempotence":      true,

        // 性能配置
        "batch.size":              65536,    // 64KB
        "linger.ms":               5,
        "compression.type":        "lz4",
        "queue.buffering.max.messages": 100000,
    })
    if err != nil {
        return nil, err
    }
    return &Producer{p: p}, nil
}

func (prod *Producer) Send(topic string, key string, value interface{}) error {
    valueBytes, err := json.Marshal(value)
    if err != nil {
        return err
    }

    msg := &kafka.Message{
        TopicPartition: kafka.TopicPartition{
            Topic:     &topic,
            Partition: kafka.PartitionAny,
        },
        Key:   []byte(key),
        Value: valueBytes,
    }

    return prod.p.Produce(msg, nil)
}

func (prod *Producer) Close() {
    prod.p.Flush(15000) // 等待最多 15 秒发送完毕
    prod.p.Close()
}
```

---

## 消费者配置

### 核心参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `group.id` | - | 消费者组 ID |
| `auto.offset.reset` | latest | 无初始 offset 时的策略：earliest/latest |
| `enable.auto.commit` | true | 是否自动提交 offset |
| `max.poll.records` | 500 | 每次 poll 最大记录数 |
| `max.poll.interval.ms` | 300000 | 两次 poll 最大间隔（5 分钟） |
| `session.timeout.ms` | 45000 | 心跳超时时间 |
| `heartbeat.interval.ms` | 3000 | 心跳发送间隔 |
| `fetch.min.bytes` | 1 | 最小拉取字节数 |
| `fetch.max.wait.ms` | 500 | 最大等待时间 |

### Java (Spring Boot)

```yaml
spring:
  kafka:
    consumer:
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      group-id: ${KAFKA_GROUP_ID:my-group}
      auto-offset-reset: earliest
      enable-auto-commit: false
      properties:
        max.poll.records: 500
        max.poll.interval.ms: 300000
        session.timeout.ms: 45000
        heartbeat.interval.ms: 3000
        fetch.min.bytes: 1
        fetch.max.wait.ms: 500
```

```java
// KafkaConsumerConfig.java
@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> props = new HashMap<>();

        // 基础配置
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        // 位移配置
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

        // 性能配置
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);
        props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000);
        props.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1);
        props.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500);

        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        factory.setConcurrency(3); // 并发消费者数量
        return factory;
    }
}
```

### Python (FastAPI + kafka-python)

```python
from kafka import KafkaConsumer
import json

class KafkaConsumerClient:
    def __init__(
        self,
        bootstrap_servers: str = "localhost:9092",
        group_id: str = "my-group"
    ):
        self.bootstrap_servers = bootstrap_servers
        self.group_id = group_id
        self.consumer = None

    def subscribe(self, topics: list[str]):
        self.consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=self.bootstrap_servers,
            group_id=self.group_id,

            # 反序列化配置
            key_deserializer=lambda k: k.decode('utf-8') if k else None,
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),

            # 位移配置
            auto_offset_reset='earliest',
            enable_auto_commit=False,

            # 性能配置
            max_poll_records=500,
            max_poll_interval_ms=300000,
            session_timeout_ms=45000,
            heartbeat_interval_ms=3000,
            fetch_min_bytes=1,
            fetch_max_wait_ms=500,
        )
        return self

    def consume(self, handler):
        """消费消息并调用处理函数"""
        try:
            for message in self.consumer:
                try:
                    handler(message)
                    self.consumer.commit()
                except Exception as e:
                    print(f"处理消息失败: {e}")
        finally:
            self.consumer.close()
```

### Go (confluent-kafka-go)

```go
package kafka

import (
    "github.com/confluentinc/confluent-kafka-go/kafka"
    "encoding/json"
    "log"
)

type Consumer struct {
    c *kafka.Consumer
}

func NewConsumer(brokers, groupID string) (*Consumer, error) {
    c, err := kafka.NewConsumer(&kafka.ConfigMap{
        // 基础配置
        "bootstrap.servers":  brokers,
        "group.id":           groupID,

        // 位移配置
        "auto.offset.reset":  "earliest",
        "enable.auto.commit": false,

        // 性能配置
        "max.poll.interval.ms": 300000,
        "session.timeout.ms":   45000,
        "fetch.min.bytes":      1,
        "fetch.wait.max.ms":    500,
    })
    if err != nil {
        return nil, err
    }
    return &Consumer{c: c}, nil
}

func (cons *Consumer) Subscribe(topics []string) error {
    return cons.c.SubscribeTopics(topics, nil)
}

type MessageHandler func(msg *kafka.Message) error

func (cons *Consumer) Consume(handler MessageHandler) {
    for {
        msg, err := cons.c.ReadMessage(-1)
        if err != nil {
            log.Printf("消费错误: %v", err)
            continue
        }

        if err := handler(msg); err != nil {
            log.Printf("处理消息失败: %v", err)
            continue
        }

        // 手动提交 offset
        _, err = cons.c.CommitMessage(msg)
        if err != nil {
            log.Printf("提交 offset 失败: %v", err)
        }
    }
}

func (cons *Consumer) Close() {
    cons.c.Close()
}
```

---

## 关键参数调优建议

### batch.size 与 linger.ms

| 场景 | batch.size | linger.ms | 说明 |
|------|------------|-----------|------|
| 低延迟 | 16384 | 0 | 不等待，立即发送 |
| 高吞吐 | 65536-131072 | 5-20 | 等待凑批，减少网络开销 |
| 极致吞吐 | 131072+ | 50-100 | 大批次，适合日志等非实时场景 |

### max.poll.records

| 场景 | 建议值 | 说明 |
|------|--------|------|
| 处理速度快 | 500-1000 | 减少 poll 次数 |
| 处理速度慢 | 50-200 | 避免超时重平衡 |
| 首次消费大量积压 | 1000+ | 快速追赶进度 |

### 压缩算法选择

| 算法 | 压缩率 | CPU 开销 | 适用场景 |
|------|--------|----------|----------|
| none | 1x | 无 | 小消息、CPU 受限 |
| gzip | 高 | 高 | 存储成本敏感 |
| snappy | 中 | 低 | 通用场景 |
| lz4 | 中高 | 低 | 推荐默认选择 |
| zstd | 最高 | 中 | 存储和网络受限 |

---

## 连接池最佳实践

1. **复用 Producer 实例**：Producer 是线程安全的，应全局复用
2. **合理设置 Consumer 并发数**：通常等于分区数
3. **监控连接状态**：定期检查连接池使用情况
4. **优雅关闭**：确保缓冲区消息发送完毕后再关闭
