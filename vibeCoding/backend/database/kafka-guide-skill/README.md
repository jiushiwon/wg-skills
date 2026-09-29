# Kafka Module Skill

面向已有后端项目的 Kafka 消息队列模块快速集成技能。

## 功能

快速集成 Kafka 生产者、消费者、消息序列化、消费者组、消息可靠性保证等能力。

## 使用方式

```
帮我加 Kafka
集成消息队列
加个 Kafka 消费者
```

## 核心能力

| 能力 | 说明 |
|------|------|
| 连接配置 | Producer/Consumer 配置 |
| 生产者 | 同步/异步发送、批量发送 |
| 消费者 | 拉取/订阅、消费者组 |
| 消息可靠性 | ACK、事务、重试 |
| 消息顺序 | 分区策略、顺序消费 |
| 延迟队列 | Redis ZSet 实现（推荐） |

## 语言支持

| 语言 | 框架 | 说明 |
|------|------|------|
| Java | Spring Boot | Spring Kafka |
| Python | FastAPI | kafka-python |
| Go | Gin | confluent-kafka-go |

## 目录说明

```
kafka-guide-skill/
├── SKILL.md
├── README.md
└── references/
    ├── connection-pool.md    # 生产者/消费者配置详解
    ├── troubleshooting.md    # 常见问题排查
    └── performance-tuning.md # 性能调优指南
```

## 延迟队列

推荐使用 Redis ZSet 实现延迟队列（更简单可靠），详见 `redis-guide-skill`。

## 安装脚本

Kafka 部署较复杂（需 ZooKeeper），建议使用 Docker Compose：
```yaml
# docker-compose.yml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper
  kafka:
    image: confluentinc/cp-kafka
    depends_on: [zookeeper]
```
