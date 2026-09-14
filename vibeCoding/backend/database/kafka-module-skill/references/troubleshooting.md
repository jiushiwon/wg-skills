# Kafka 常见问题排查指南

## 概述

本文档汇总 Kafka 使用过程中的常见问题及排查方法，帮助开发者快速定位和解决问题。

---

## 1. 消息积压处理

### 问题表现

- 消费者 lag 持续增长
- 消息延迟明显增加
- 监控告警触发

### 排查步骤

**1) 查看消费者 lag**

```bash
# 使用 kafka-consumer-groups.sh 查看
kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --group my-group

# 输出示例：
# GROUP     TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# my-group  my-topic  0          1000            50000           49000
```

**2) 检查消费速度**

```java
// 监控消费速度
@KafkaListener(topics = "my-topic")
public void consume(ConsumerRecord<String, Object> record) {
    long startTime = System.currentTimeMillis();

    // 业务处理
    processMessage(record.value());

    long costTime = System.currentTimeMillis() - startTime;
    if (costTime > 1000) { // 超过 1 秒告警
        log.warn("消费耗时过长: {}ms, offset={}", costTime, record.offset());
    }
}
```

### 解决方案

**方案一：增加消费者实例**

```java
// 增加并发消费者数（不超过分区数）
@Bean
public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
    ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(consumerFactory());
    factory.setConcurrency(10); // 增加到 10 个消费者
    return factory;
}
```

**方案二：增加分区数**

```bash
# 增加分区数
kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --alter \
  --topic my-topic \
  --partitions 20
```

**方案三：批量消费优化**

```java
// 批量消费，提高处理效率
@KafkaListener(topics = "my-topic")
public void consumeBatch(List<ConsumerRecord<String, Object>> records) {
    // 批量处理
    List<Object> values = records.stream()
        .map(ConsumerRecord::value)
        .collect(Collectors.toList());

    batchProcess(values); // 批量业务处理
}
```

---

## 2. 消费者重平衡问题

### 问题表现

- 消费者频繁加入/退出组
- 日志出现 `Rebalance` 信息
- 消费暂停一段时间后恢复

### 排查步骤

**1) 检查日志**

```
# 典型重平衡日志
[Consumer clientId=consumer-my-group-1, groupId=my-group] 
Request joining group due to: consumer pro-actively leaving the group
```

**2) 检查配置参数**

```java
// 关键参数
max.poll.interval.ms = 300000  // 两次 poll 最大间隔
session.timeout.ms = 45000     // 心跳超时
heartbeat.interval.ms = 3000   // 心跳间隔
```

### 常见原因及解决

**原因一：消息处理时间过长**

```java
// 错误示例：处理时间超过 max.poll.interval.ms
@KafkaListener(topics = "my-topic")
public void consume(ConsumerRecord<String, Object> record) {
    // 耗时操作（如调用外部服务）
    callExternalService(record.value()); // 可能超时
}

// 正确示例：异步处理 + 手动提交
@KafkaListener(topics = "my-topic")
public void consume(
    ConsumerRecord<String, Object> record,
    Acknowledgment acknowledgment
) {
    // 异步提交处理
    CompletableFuture.runAsync(() -> {
        try {
            processMessage(record.value());
            acknowledgment.acknowledge(); // 处理完成后提交
        } catch (Exception e) {
            log.error("处理失败", e);
        }
    });
}
```

**原因二：Consumer 实例异常退出**

```java
// 添加异常处理，避免消费者崩溃
@KafkaListener(topics = "my-topic", errorHandler = "consumerErrorHandler")
public void consume(ConsumerRecord<String, Object> record) {
    processMessage(record.value());
}

@Bean
public ConsumerAwareListenerErrorHandler consumerErrorHandler() {
    return (message, exception, consumer) -> {
        log.error("消费异常: {}", exception.getMessage(), exception);
        // 可以选择跳过或重试
        return null;
    };
}
```

**原因三：session.timeout.ms 过短**

```yaml
spring:
  kafka:
    consumer:
      properties:
        session.timeout.ms: 60000    # 增加到 60 秒
        heartbeat.interval.ms: 10000 # 心跳间隔 10 秒
```

---

## 3. 消息丢失排查

### 问题表现

- 生产者发送成功，但消费者未收到
- 消息数量不一致

### 排查流程

**1) 生产端检查**

```java
// 确保配置正确
props.put(ProducerConfig.ACKS_CONFIG, "all");           // 必须是 all
props.put(ProducerConfig.RETRIES_CONFIG, 3);            // 重试次数
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // 启用幂等

// 发送后确认
ListenableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, value);
future.addCallback(
    result -> log.info("发送成功: {}", result.getRecordMetadata()),
    ex -> log.error("发送失败", ex)
);
```

**2) Broker 端检查**

```bash
# 检查副本同步状态
kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --topic my-topic

# 检查 ISR 列表是否完整
# Topic: my-topic	Partition: 0	Leader: 1	Replicas: 1,2,3	Isr: 1,2,3
```

**3) 消费端检查**

```java
// 禁用自动提交，手动确认
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

// 处理成功后才提交
@KafkaListener(topics = "my-topic")
public void consume(
    ConsumerRecord<String, Object> record,
    Acknowledgment acknowledgment
) {
    try {
        processMessage(record.value());
        acknowledgment.acknowledge(); // 成功后提交
    } catch (Exception e) {
        log.error("处理失败，不提交 offset", e);
        // 不提交，下次重新消费
    }
}
```

### 防丢失配置清单

| 配置 | 生产者 | 消费者 |
|------|--------|--------|
| acks | all | - |
| retries | >= 3 | - |
| enable.idempotence | true | - |
| enable.auto.commit | - | false |
| min.insync.replicas | 2 (Broker) | - |
| unclean.leader.election.enable | false (Broker) | - |

---

## 4. 重复消费问题

### 问题表现

- 同一条消息被处理多次
- 业务数据重复

### 排查步骤

**1) 检查 offset 提交**

```java
// 确认是否手动提交
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

// 确认提交时机
@KafkaListener(topics = "my-topic")
public void consume(
    ConsumerRecord<String, Object> record,
    Acknowledgment acknowledgment
) {
    // 先处理
    processMessage(record.value());

    // 后提交（如果这里失败，会导致重复消费）
    acknowledgment.acknowledge();
}
```

**2) 检查消费者组状态**

```bash
# 查看消费者组状态
kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --group my-group \
  --state
```

### 解决方案

**方案一：幂等性设计**

```java
// 数据库唯一键去重
@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public void processMessage(Message message) {
        // 使用消息 ID 作为唯一键
        if (messageRepository.existsById(message.getId())) {
            log.warn("消息已处理: {}", message.getId());
            return;
        }

        // 保存并处理
        messageRepository.save(message);
        doBusinessLogic(message);
    }
}
```

**方案二：Redis 去重**

```python
import redis
import json

class MessageDeduplicator:
    def __init__(self, redis_client: redis.Redis, expire_seconds: int = 86400):
        self.redis = redis_client
        self.expire_seconds = expire_seconds

    def is_duplicate(self, message_id: str) -> bool:
        key = f"kafka:processed:{message_id}"
        # SETNX 方式设置，返回 True 表示设置成功（新消息）
        result = self.redis.set(key, "1", nx=True, ex=self.expire_seconds)
        return not result  # 如果设置失败，说明是重复消息

    def process_message(self, message: dict):
        message_id = message.get('msg_id')

        if self.is_duplicate(message_id):
            print(f"重复消息，跳过: {message_id}")
            return

        # 业务处理
        do_business(message)
```

**方案三：事务消息**

```java
// Spring 事务保证
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public void processOrder(OrderMessage message) {
        // 幂等性检查
        if (orderRepository.existsByOrderId(message.getOrderId())) {
            log.warn("订单已处理: {}", message.getOrderId());
            return;
        }

        // 保存订单
        Order order = new Order(message);
        orderRepository.save(order);

        // 其他业务处理
        inventoryService.deduct(order);
        paymentService.process(order);
    }
}
```

---

## 5. 分区不均问题

### 问题表现

- 某些消费者处理量远大于其他
- 部分分区消息堆积严重

### 排查步骤

**1) 查看分区分配**

```bash
# 查看消费者组分区分配
kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --group my-group

# 输出示例：
# GROUP     TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG    CONSUMER-ID
# my-group  my-topic  0          1000            5000            4000   consumer-1
# my-group  my-topic  1          2000            2000            0      consumer-1
# my-group  my-topic  2          500             6000            5500   consumer-2
```

**2) 检查消息 Key 分布**

```java
// 统计 Key 分布
@KafkaListener(topics = "my-topic")
public void consume(ConsumerRecord<String, Object> record) {
    String key = record.key();
    int partition = record.partition();

    // 记录 Key 和分区映射
    metrics.recordKeyPartition(key, partition);

    processMessage(record.value());
}
```

### 常见原因及解决

**原因一：Key 分布不均**

```java
// 问题：大量相同 Key 的消息
kafkaTemplate.send("topic", "user_123", message); // 所有消息都到同一分区

// 解决：优化 Key 设计
String key = "user_" + userId + "_" + System.currentTimeMillis() % 10;
kafkaTemplate.send("topic", key, message); // 分散到多个分区
```

**原因二：自定义分区器问题**

```java
// 自定义分区器
public class CustomPartitioner implements Partitioner {

    @Override
    public int partition(
        String topic, Object key, byte[] keyBytes,
        Object value, byte[] valueBytes, Cluster cluster
    ) {
        int numPartitions = cluster.partitionCountForTopic(topic);

        if (keyBytes == null) {
            // 无 Key 时轮询
            return ThreadLocalRandom.current().nextInt(numPartitions);
        }

        // 有 Key 时哈希
        return Math.abs(Utils.murmur2(keyBytes)) % numPartitions;
    }

    @Override
    public void close() {}

    @Override
    public void configure(Map<String, ?> configs) {}
}
```

**原因三：分区数不足**

```bash
# 增加分区数
kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --alter \
  --topic my-topic \
  --partitions 30

# 注意：增加分区后需要重启消费者以重新分配
```

### 最佳实践

1. **合理设置分区数**：通常为消费者数的 2-3 倍
2. **Key 设计均匀**：避免热点 Key
3. **监控分区 Lag**：及时发现不均问题
4. **使用粘性分区**：减少重平衡影响

```java
// 使用粘性分区策略
props.put(
    ProducerConfig.PARTITIONER_CLASS_CONFIG,
    org.apache.kafka.clients.producer.StickyPartitioner.class
);
```

---

## 快速排查清单

| 问题 | 检查项 | 命令/配置 |
|------|--------|-----------|
| 消息积压 | Consumer Lag | `kafka-consumer-groups.sh --describe` |
| 重平衡 | max.poll.interval.ms | 检查处理时间是否超限 |
| 消息丢失 | acks / retries | 确认配置为 all |
| 重复消费 | enable.auto.commit | 确认为 false |
| 分区不均 | Key 分布 | 统计 Key 哈希分布 |
