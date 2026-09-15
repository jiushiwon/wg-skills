# Kafka 性能调优指南

## 概述

本文档提供 Kafka 性能调优的最佳实践，涵盖生产者、消费者、集群配置三个维度，帮助开发者在不同场景下获得最优性能。

---

## 1. 生产者批量发送优化

### 批量发送原理

生产者将多条消息合并为一个批次发送，减少网络请求次数，提高吞吐量。

```
消息1 ─┐
消息2 ─┼─> 批量合并 ─> 网络请求 ─> Broker
消息3 ─┘
```

### 关键参数

| 参数 | 说明 | 调优建议 |
|------|------|----------|
| `batch.size` | 批次大小（字节） | 高吞吐：65536-131072 |
| `linger.ms` | 等待凑批时间 | 高吞吐：5-20ms |
| `buffer.memory` | 缓冲区大小 | 根据消息量调整，建议 64MB+ |
| `compression.type` | 压缩算法 | 推荐 lz4 |

### Java (Spring Boot) 配置

```java
@Configuration
public class HighThroughputProducerConfig {

    @Bean
    public ProducerFactory<String, Object> highThroughputProducerFactory() {
        Map<String, Object> props = new HashMap<>();

        // 批量配置
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 131072);    // 128KB
        props.put(ProducerConfig.LINGER_MS_CONFIG, 10);         // 等待 10ms
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 134217728); // 128MB

        // 压缩配置
        props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");

        // 其他配置
        props.put(ProducerConfig.ACKS_CONFIG, "1");             // 高吞吐可降低为 1
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

        return new DefaultKafkaProducerFactory<>(props);
    }
}
```

### Python 批量发送

```python
from kafka import KafkaProducer
import json

class HighThroughputProducer:
    def __init__(self, bootstrap_servers: str):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,

            # 批量配置
            batch_size=131072,       # 128KB
            linger_ms=10,            # 等待 10ms
            buffer_memory=134217728, # 128MB

            # 压缩配置
            compression_type='lz4',

            # 序列化
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        )

    def send_batch(self, topic: str, messages: list[dict]):
        """批量发送消息"""
        futures = []
        for msg in messages:
            future = self.producer.send(topic, value=msg)
            futures.append(future)

        # 等待所有消息发送完成
        for future in futures:
            future.get(timeout=10)

    def flush(self):
        """强制发送所有缓冲消息"""
        self.producer.flush()
```

### Go 批量发送

```go
package kafka

import (
    "github.com/confluentinc/confluent-kafka-go/kafka"
    "encoding/json"
    "sync"
)

type BatchProducer struct {
    p        *kafka.Producer
    topic    string
    buffer   []*kafka.Message
    mu       sync.Mutex
    batchSize int
}

func NewBatchProducer(brokers, topic string, batchSize int) (*BatchProducer, error) {
    p, err := kafka.NewProducer(&kafka.ConfigMap{
        "bootstrap.servers":        brokers,
        "batch.size":               131072,  // 128KB
        "linger.ms":                10,
        "queue.buffering.max.messages": 100000,
        "compression.type":         "lz4",
    })
    if err != nil {
        return nil, err
    }

    bp := &BatchProducer{
        p:         p,
        topic:     topic,
        buffer:    make([]*kafka.Message, 0, batchSize),
        batchSize: batchSize,
    }

    // 启动异步发送协程
    go bp.handleDeliveryReports()

    return bp, nil
}

func (bp *BatchProducer) Add(key string, value interface{}) error {
    valueBytes, err := json.Marshal(value)
    if err != nil {
        return err
    }

    msg := &kafka.Message{
        TopicPartition: kafka.TopicPartition{
            Topic:     &bp.topic,
            Partition: kafka.PartitionAny,
        },
        Key:   []byte(key),
        Value: valueBytes,
    }

    bp.mu.Lock()
    bp.buffer = append(bp.buffer, msg)

    if len(bp.buffer) >= bp.batchSize {
        bp.flushBuffer()
    }
    bp.mu.Unlock()

    return nil
}

func (bp *BatchProducer) flushBuffer() {
    for _, msg := range bp.buffer {
        bp.p.Produce(msg, nil)
    }
    bp.buffer = bp.buffer[:0]
}

func (bp *BatchProducer) Flush() {
    bp.mu.Lock()
    bp.flushBuffer()
    bp.mu.Unlock()
    bp.p.Flush(15000)
}

func (bp *BatchProducer) handleDeliveryReports() {
    for e := range bp.p.Events() {
        switch ev := e.(type) {
        case *kafka.Message:
            if ev.TopicPartition.Error != nil {
                // 处理发送失败
            }
        }
    }
}
```

---

## 2. 消费者并行消费策略

### 并行消费模型

```
                    ┌─ Consumer 1 ─> Partition 0
Topic ─> Consumer   ├─ Consumer 2 ─> Partition 1
         Group      ├─ Consumer 3 ─> Partition 2
                    └─ Consumer N ─> Partition N
```

### Java 多线程消费

```java
@Configuration
public class ParallelConsumerConfig {

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> parallelContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
            new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory());

        // 并发消费者数（建议等于分区数）
        factory.setConcurrency(10);

        // 批量消费
        factory.setBatchListener(true);

        // 手动提交
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);

        return factory;
    }
}

// 批量消费处理器
@KafkaListener(
    topics = "my-topic",
    containerFactory = "parallelContainerFactory"
)
public void consumeBatch(
    List<ConsumerRecord<String, Object>> records,
    Acknowledgment acknowledgment
) {
    // 并行处理消息
    List<CompletableFuture<Void>> futures = records.stream()
        .map(record -> CompletableFuture.runAsync(() -> processMessage(record.value())))
        .collect(Collectors.toList());

    // 等待所有处理完成
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

    // 批量提交 offset
    acknowledgment.acknowledge();
}
```

### Python 多线程消费

```python
from kafka import KafkaConsumer
from concurrent.futures import ThreadPoolExecutor
import json

class ParallelConsumer:
    def __init__(
        self,
        bootstrap_servers: str,
        group_id: str,
        max_workers: int = 10
    ):
        self.bootstrap_servers = bootstrap_servers
        self.group_id = group_id
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    def consume_parallel(self, topic: str, handler):
        consumer = KafkaConsumer(
            topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id=self.group_id,
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            enable_auto_commit=False,
            max_poll_records=500,
        )

        try:
            batch = []
            for message in consumer:
                batch.append(message)

                # 达到批次大小时并行处理
                if len(batch) >= 100:
                    self._process_batch(batch, handler)
                    consumer.commit()
                    batch = []

            # 处理剩余消息
            if batch:
                self._process_batch(batch, handler)
                consumer.commit()

        finally:
            consumer.close()
            self.executor.shutdown(wait=True)

    def _process_batch(self, batch, handler):
        futures = []
        for message in batch:
            future = self.executor.submit(handler, message.value)
            futures.append(future)

        # 等待所有任务完成
        for future in futures:
            future.result()  # 获取结果，如有异常会抛出
```

### Go 并发消费

```go
package kafka

import (
    "github.com/confluentinc/confluent-kafka-go/kafka"
    "sync"
)

type ParallelConsumer struct {
    c         *kafka.Consumer
    workers   int
    handler   func(*kafka.Message) error
}

func NewParallelConsumer(brokers, groupID string, workers int) (*ParallelConsumer, error) {
    c, err := kafka.NewConsumer(&kafka.ConfigMap{
        "bootstrap.servers":  brokers,
        "group.id":           groupID,
        "auto.offset.reset":  "earliest",
        "enable.auto.commit": false,
    })
    if err != nil {
        return nil, err
    }

    return &ParallelConsumer{
        c:       c,
        workers: workers,
    }, nil
}

func (pc *ParallelConsumer) Subscribe(topics []string, handler func(*kafka.Message) error) error {
    pc.handler = handler
    return pc.c.SubscribeTopics(topics, nil)
}

func (pc *ParallelConsumer) Start() {
    msgChan := make(chan *kafka.Message, pc.workers*100)
    var wg sync.WaitGroup

    // 启动工作协程
    for i := 0; i < pc.workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for msg := range msgChan {
                if err := pc.handler(msg); err != nil {
                    // 处理失败，可以重试或记录
                    continue
                }
                // 提交 offset
                pc.c.CommitMessage(msg)
            }
        }()
    }

    // 读取消息并分发
    for {
        msg, err := pc.c.ReadMessage(-1)
        if err != nil {
            continue
        }
        msgChan <- msg
    }
}
```

---

## 3. 分区数选择

### 分区数的影响

| 因素 | 分区多 | 分区少 |
|------|--------|--------|
| 并行度 | 高 | 低 |
| 吞吐量 | 高 | 低 |
| 延迟 | 可能增加 | 低 |
| 资源占用 | 高 | 低 |
| 重平衡时间 | 长 | 短 |

### 计算公式

```
分区数 = max(目标吞吐量 / 单分区吞吐量, 消费者数)

示例：
- 目标吞吐量：100MB/s
- 单分区吞吐量：10MB/s
- 消费者数：20

分区数 = max(100/10, 20) = max(10, 20) = 20
```

### 推荐配置

| 场景 | 分区数 | 说明 |
|------|--------|------|
| 低吞吐、简单业务 | 3-6 | 开发测试环境 |
| 中等吞吐 | 10-20 | 一般生产环境 |
| 高吞吐 | 30-100 | 大数据场景 |
| 超高吞吐 | 100+ | 需要评估集群能力 |

### 动态调整分区

```bash
# 查看当前分区数
kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --topic my-topic

# 增加分区数（只能增加，不能减少）
kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --alter \
  --topic my-topic \
  --partitions 30

# 注意：增加分区会影响消息顺序，需要重启消费者
```

---

## 4. 副本因子配置

### 副本因子说明

```
Partition 0: [Leader] [Follower] [Follower]
              ↓          ↓          ↓
             Broker1    Broker2    Broker3
```

### 配置建议

| 场景 | 副本因子 | min.insync.replicas | acks | 说明 |
|------|----------|---------------------|------|------|
| 开发测试 | 1 | 1 | 1 | 无冗余 |
| 一般生产 | 2 | 1 | all | 平衡性能和可靠性 |
| 重要数据 | 3 | 2 | all | 推荐配置 |
| 金融级别 | 3-5 | 2-3 | all | 最高可靠性 |

### 配置方法

```bash
# 创建主题时指定副本因子
kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create \
  --topic my-topic \
  --partitions 10 \
  --replication-factor 3

# 修改 min.insync.replicas（Broker 配置）
# server.properties
min.insync.replicas=2

# 或动态配置
kafka-configs.sh \
  --bootstrap-server localhost:9092 \
  --entity-type topics \
  --entity-name my-topic \
  --alter \
  --add-config min.insync.replicas=2
```

### 副本配置最佳实践

```java
// 生产者配置
props.put(ProducerConfig.ACKS_CONFIG, "all");           // 等待所有 ISR 副本确认
props.put(ProducerConfig.RETRIES_CONFIG, 3);            // 重试次数
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // 幂等性

// Broker 配置
// unclean.leader.election.enable = false  // 禁止非 ISR 副本成为 Leader
// min.insync.replicas = 2                 // 最少同步副本数
```

---

## 5. 压缩算法选择

### 压缩算法对比

| 算法 | 压缩率 | 压缩速度 | 解压速度 | CPU 开销 | 适用场景 |
|------|--------|----------|----------|----------|----------|
| none | 1x | - | - | 无 | 小消息 |
| gzip | 高 | 慢 | 慢 | 高 | 存储敏感 |
| snappy | 中 | 快 | 快 | 低 | 通用场景 |
| lz4 | 中高 | 很快 | 很快 | 低 | 推荐默认 |
| zstd | 最高 | 中 | 快 | 中 | 网络受限 |

### 配置示例

```java
// 生产者压缩配置
props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");

// Broker 端压缩配置（server.properties）
compression.type=producer  # 使用生产者压缩算法
```

```python
# Python 配置
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    compression_type='lz4',
)
```

```go
// Go 配置
p, err := kafka.NewProducer(&kafka.ConfigMap{
    "bootstrap.servers": "localhost:9092",
    "compression.type":  "lz4",
})
```

### 选择建议

```
场景判断：
├─ 消息大小 < 1KB
│  └─ 不压缩（overhead > 收益）
│
├─ CPU 资源充足
│  └─ zstd（最高压缩率）
│
├─ CPU 资源紧张
│  └─ lz4 或 snappy
│
└─ 网络带宽受限
   └─ zstd 或 gzip
```

---

## 6. 综合调优清单

### 生产者调优

| 参数 | 低延迟配置 | 高吞吐配置 |
|------|------------|------------|
| batch.size | 16384 | 131072 |
| linger.ms | 0 | 10-20 |
| buffer.memory | 33554432 | 134217728 |
| compression.type | none/lz4 | lz4/zstd |
| acks | 1 | all |

### 消费者调优

| 参数 | 低延迟配置 | 高吞吐配置 |
|------|------------|------------|
| max.poll.records | 100 | 1000 |
| fetch.min.bytes | 1 | 1048576 |
| fetch.max.wait.ms | 100 | 500 |
| 并发数 | 分区数/2 | 分区数 |

### 集群调优

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| num.partitions | 10-30 | 根据吞吐量调整 |
| default.replication.factor | 3 | 生产环境推荐 |
| min.insync.replicas | 2 | 保证可靠性 |
| unclean.leader.election.enable | false | 禁止非 ISR 选主 |

---

## 性能监控指标

### 关键指标

```java
// 使用 Micrometer 监控
@Component
public class KafkaMetrics {

    @Autowired
    private MeterRegistry meterRegistry;

    // 发送延迟
    private final Timer sendTimer = Timer.builder("kafka.producer.send.time")
        .description("消息发送耗时")
        .register(meterRegistry);

    // 消费延迟
    private final Timer consumeTimer = Timer.builder("kafka.consumer.process.time")
        .description("消息处理耗时")
        .register(meterRegistry);

    // 消费者 Lag
    private final Gauge consumerLag = Gauge.builder("kafka.consumer.lag", () -> getConsumerLag())
        .description("消费者 Lag")
        .register(meterRegistry);

    public void recordSendTime(long timeMs) {
        sendTimer.record(timeMs, TimeUnit.MILLISECONDS);
    }

    public void recordConsumeTime(long timeMs) {
        consumeTimer.record(timeMs, TimeUnit.MILLISECONDS);
    }
}
```

### 监控清单

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| Producer Send Rate | 发送速率 | 根据业务定义 |
| Consumer Lag | 消费延迟 | > 10000 |
| Request Latency P99 | 请求延迟 P99 | > 100ms |
| ISR Shrink Rate | ISR 缩减率 | > 0 |
| Under Replicated Partitions | 副本不同步分区 | > 0 |
