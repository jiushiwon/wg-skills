---
name: springboot-kafka-module-skill
description: Spring Kafka 模块快速集成技能。面向已拥有 Spring Boot 项目骨架的开发者，提供 Kafka 生产者、消费者、消息订阅、事件驱动等能力的快速集成。触发词："Spring Kafka"、"Spring Boot Kafka"、"Kafka 集成"、"kafka producer"、"kafka consumer"、"kafka 消息"、"kafka 事件"、"kafka 队列"。
---

# Spring Kafka Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成 Kafka 能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **生产者** | 同步/异步发送消息、消息分区、消息key |
| **消费者** | 消费监听、消息重试、消费者组 |
| **消息序列化** | JSON/Avro/ProtoBuf |
| **事务消息** | Kafka 事务 |
| **拦截器** | 消息发送/消费拦截 |
| ** Streams** | Kafka Streams 流处理 |

## 触发场景

用户说"帮我加 Kafka"或"集成 Kafka"时触发。

## 依赖配置

```xml
<!-- pom.xml 添加 -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

## 默认方法封装

### 1. 生产者

```java
@Service
public class KafkaProducerService {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    /**
     * 发送消息（同步）
     */
    public SendResult<String, String> send(String topic, String key, String message) {
        ListenableFuture<SendResult<String, String>> future = 
            kafkaTemplate.send(topic, key, message);
        try {
            return future.get(10, TimeUnit.SECONDS);
        } catch (Exception e) {
            throw new RuntimeException("发送消息失败", e);
        }
    }
    
    /**
     * 发送消息（异步）
     */
    public void sendAsync(String topic, String key, String message, SendCallback callback) {
        kafkaTemplate.send(topic, key, message).addCallback(callback);
    }
    
    /**
     * 发送 JSON 消息
     */
    public void sendJson(String topic, String key, Object object) {
        String json = JSON.toJSONString(object);
        kafkaTemplate.send(topic, key, json);
    }
    
    /**
     * 发送带回调的消息
     */
    public void sendWithCallback(String topic, String key, String message) {
        kafkaTemplate.send(topic, key, message).addCallback(
            success -> {
                // 成功
                String topic = success.getRecordMetadata().topic();
                int partition = success.getRecordMetadata().partition();
                long offset = success.getRecordMetadata().offset();
                log.info("消息发送成功: topic={}, partition={}, offset={}", topic, partition, offset);
            },
            failure -> {
                // 失败
                log.error("消息发送失败: {}", failure.getMessage());
            }
        );
    }
}
```

### 2. 消费者

```java
@Service
public class KafkaConsumerService {
    
    /**
     * 简单消费
     */
    @KafkaListener(topics = "my-topic", groupId = "my-group")
    public void consume(ConsumerRecord<String, String> record) {
        log.info("收到消息: key={}, value={}, partition={}, offset={}", 
            record.key(), record.value(), record.partition(), record.offset());
        
        // 业务处理
        String message = record.value();
        // ...
    }
    
    /**
     * 消费 JSON 消息
     */
    @KafkaListener(topics = "user-events", groupId = "user-group", containerFactory = "jsonKafkaListenerContainerFactory")
    public void consumeJson(UserEvent event) {
        log.info("收到用户事件: {}", event);
        // 业务处理
    }
    
    /**
     * 批量消费
     */
    @KafkaListener(topics = "batch-topic", groupId = "batch-group", containerFactory = "batchKafkaListenerContainerFactory")
    public void consumeBatch(List<ConsumerRecord<String, String>> records) {
        log.info("批量收到 {} 条消息", records.size());
        for (ConsumerRecord<String, String> record : records) {
            // 处理每条消息
        }
    }
    
    /**
     * 带错误处理的消费
     */
    @KafkaListener(topics = "error-topic", groupId = "error-group", errorHandler = "kafkaErrorHandler")
    public void consumeWithError(ConsumerRecord<String, String> record) {
        // 业务处理
    }
}
```

### 3. 事务消息

```java
@Service
public class KafkaTransactionService {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    /**
     * 事务操作：在事务内发送多条消息，要么全部成功，要么全部回滚
     */
    @Transactional
    public void sendInTransaction(String topic1, String msg1, String topic2, String msg2) {
        kafkaTemplate.executeInTransaction(operations -> {
            operations.send(topic1, "key1", msg1);
            operations.send(topic2, "key2", msg2);
            return true;
        });
    }
}
```

### 4. 配置类

```java
@Configuration
public class KafkaConfig {
    
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    
    /**
     * 生产者配置
     */
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        // acks 配置
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        // 重试次数
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        // 批量大小
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        // 缓冲内存
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);
        return new DefaultKafkaProducerFactory<>(props);
    }
    
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
    
    /**
     * 消费者配置
     */
    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "my-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        // 自动提交
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        // 最早/最新偏移量
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        return new DefaultKafkaConsumerFactory<>(props);
    }
    
    @Bean
    public KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, String>> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        // 并发消费
        factory.setConcurrency(3);
        // 批量消费
        factory.setBatchListener(true);
        return factory;
    }
    
    /**
     * JSON 序列化/反序列化
     */
    @Bean
    public JsonSerializer<Object> jsonSerializer() {
        return new JsonSerializer<>();
    }
    
    @Bean
    public JsonDeserializer<Object> jsonDeserializer() {
        JsonDeserializer<Object> deserializer = new JsonDeserializer<>();
        deserializer.addTrustedPackages("*");
        return deserializer;
    }
}
```

### 5. 错误处理

```java
@Component
public class KafkaErrorHandler implements ErrorHandler {
    
    @Override
    public void handle(Exception e, ConsumerRecord<String, String> record) {
        log.error("消费消息失败: topic={}, partition={}, offset={}, key={}, value={}, error={}",
            record.topic(), record.partition(), record.offset(), 
            record.key(), record.value(), e.getMessage());
        
        // 可选：发送到死信队列
        // 可以记录到数据库或发送到告警
    }
    
    @Override
    public void handle(List<ConsumerRecord<String, String>> records, Exception e) {
        log.error("批量消费消息失败，数量: {}", records.size(), e);
    }
}
```

## 配置模板

### application.yml

```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_HOST:localhost}:${KAFKA_PORT:9092}
    producer:
      # 生产者配置
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      acks: all
      retries: 3
      batch-size: 16384
      buffer-memory: 33554432
      properties:
        linger.ms: 10
        compression.type: snappy
    consumer:
      # 消费者配置
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      group-id: my-group
      auto-offset-reset: earliest
      enable-auto-commit: false
      properties:
        spring.json.trusted.packages: "*"
    listener:
      # 监听器配置
      ack-mode: manual_immediate
      concurrency: 3
```

## 不做

- 不负责安装 Kafka（用户自行安装或使用 Docker）
- 不处理 Kafka 集群配置（单节点为主）
- 不提供消息持久化策略
- 不处理 Kafka Connect 数据同步
