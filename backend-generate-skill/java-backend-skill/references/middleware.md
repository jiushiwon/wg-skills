# 中间件自行集成指引

最小集默认不含以下中间件，按需手动接入。每项给出依赖坐标 + 关键配置 + 官方文档。

## Redis

- 依赖：`spring-boot-starter-data-redis`（版本随 Spring Boot BOM，不写死）。
- 关键配置：
  ```yaml
  spring:
    data:
      redis:
        host: ${REDIS_HOST:localhost}
        port: ${REDIS_PORT:6379}
        password: ${REDIS_PASSWORD:}
  ```
- 官方文档：https://docs.spring.io/spring-data/redis/reference/

## 消息队列（二选一）

### Kafka

- 依赖：`spring-kafka`（随 BOM）。
- 关键配置：
  ```yaml
  spring:
    kafka:
      bootstrap-servers: ${KAFKA_BROKERS:localhost:9092}
      consumer:
        group-id: ${KAFKA_CONSUMER_GROUP:my-app-group}
  ```
- 官方文档：https://docs.spring.io/spring-kafka/reference/

### RabbitMQ

- 依赖：`spring-boot-starter-amqp`（随 BOM）。
- 关键配置：`spring.rabbitmq.host/port/username/password`，读 `RABBITMQ_*` 环境变量。
- 官方文档：https://docs.spring.io/spring-boot/reference/messaging/amqp.html

## 可观测（按需）

- 依赖：`spring-boot-starter-actuator` + `micrometer-registry-prometheus`。
- 关键配置：
  ```yaml
  management:
    endpoints:
      web:
        exposure:
          include: health,info,prometheus   # 生产仅暴露内网
  ```
- 官方文档：https://docs.spring.io/spring-boot/reference/actuator/index.html

## 接入红线

1. 版本一律随 Spring Boot BOM，不在 `pom.xml` 手写版本号。
2. 连接信息只从环境变量读取，禁止硬编码。
3. 接入后同步更新 `.env.example`，变量命名见 backend-convention-skill `env-config-guide.md`。
