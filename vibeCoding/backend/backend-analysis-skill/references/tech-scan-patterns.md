# 技术栈扫描模式（Step 2）

原则：**依赖文件（pom/go.mod/package.json/requirements）+ 配置项 + 代码引用**三处交叉验证，至少两处命中才下结论。

## 1. 基础栈

| 信息 | 来源 |
|------|------|
| 语言版本 | pom `<java.version>` / go.mod `go 1.x` / package.json `engines.node` / pyproject `requires-python` / Dockerfile `FROM` |
| 框架版本 | 同 detection-rules.md 第 2 节 |
| 构建工具 | Maven / Gradle / npm / yarn / pnpm / pip / poetry / go build |
| 部署线索 | Dockerfile、docker-compose.yml、k8s yaml、Makefile、CI 配置（.github/workflows、.gitlab-ci.yml、Jenkinsfile） |

## 2. 依赖清单分类

从依赖文件提取全量依赖，按以下类别归类，**只列业务相关依赖**（测试/构建插件单列一节）：

| 类别 | 示例 |
|------|------|
| Web 框架 | spring-boot-starter-web、gin、fastapi、express |
| ORM/数据 | mybatis-plus、gorm、sqlalchemy、prisma |
| 缓存 | spring-boot-starter-data-redis、go-redis、ioredis |
| 消息队列 | spring-kafka、spring-boot-starter-amqp、sarama、celery、bullmq |
| 搜索 | spring-data-elasticsearch、@elastic/elasticsearch |
| 安全/认证 | spring-security、jjwt、passport、python-jose |
| 工具库 | hutool、guava、lodash、mapstruct |
| 监控 | micrometer、prometheus-client、skywalking-agent、sentry |

## 3. 中间件识别

| 中间件 | Java 证据 | Go 证据 | Python 证据 | Node 证据 | 配置证据 |
|--------|-----------|---------|-------------|-----------|----------|
| Redis | `spring-boot-starter-data-redis` / `jedis` / `lettuce` | `go-redis/redis` | `redis` / `aioredis` | `ioredis` / `redis` | `spring.redis.*` / `REDIS_URL` |
| Kafka | `spring-kafka` | `sarama` / `kafka-go` | `kafka-python` / `confluent-kafka` | `kafkajs` | `spring.kafka.*` / `KAFKA_BROKERS` |
| RabbitMQ | `spring-boot-starter-amqp` | `streadway/amqp` / `amqp091-go` | `pika` / `celery` | `amqplib` | `spring.rabbitmq.*` |
| RocketMQ | `rocketmq-spring-boot` | `rocketmq-client-go` | `rocketmq` | — | `rocketmq.name-server` |
| Elasticsearch | `spring-data-elasticsearch` | `elastic/go-elasticsearch` | `elasticsearch` | `@elastic/elasticsearch` | `spring.elasticsearch.*` |
| 对象存储 | `aliyun-sdk-oss` / `aws-java-sdk-s3` / `minio` / `cos_api`(腾讯) / `qiniu` | `aws-sdk-go` / `minio-go` | `boto3` / `oss2` | `aws-sdk` / `minio` / `@aws-sdk/client-s3` | `oss.endpoint` / `S3_BUCKET` |
| Zookeeper/Nacos/Consul | `spring-cloud-starter-*` | 对应 client | 对应 client | 对应 client | `spring.cloud.*` |
| XXL-Job/Quartz | `xxl-job-core` / `quartz` | `robfig/cron` | `APScheduler` / `celery beat` | `node-cron` / `agenda` | 定时表达式 `0 0/5 * * * ?` |

## 4. 第三方 API 识别（重点）

**识别方式：SDK 依赖 + 配置 key + 调用代码三选二**。

| 服务类型 | 证据模式 | 配置特征（报告中 key 打码） |
|----------|----------|---------------------------|
| 短信 | `dysmsapi`(阿里云) / `tencentcloud-sdk`+sms / `twilio` / `yunpian` / `submail` / 容联云 `yuntongxun` | `sms.access-key`、`SMS_APP_ID`、代码中 `SendSmsRequest` |
| 支付 | `wechatpay-apiv3` / `alipay-sdk-java` / `stripe` / `paypal` / `pingpp` | `pay.app-id`、`pay.mch-id`、`STRIPE_SECRET_KEY`、证书文件 `apiclient_cert.p12` |
| 推送 | `jpush`(极光) / `umeng`(友盟) / `getui`(个推) / `firebase-admin`(FCM) / `apns` | `push.app-key`、`FCM_CREDENTIALS` |
| 地图 | `amap`(高德) / `bmap`(百度) / `google maps` | `amap.key`、`MAP_API_KEY` |
| OAuth/SSO | `spring-security-oauth2` / `cas-client` / `keycloak` / `passport-*` / `auth0` / `authlib` | `oauth2.client-id`、`CAS_SERVER_URL` |
| 邮件 | `spring-boot-starter-mail` / `gomail` / `smtplib`(内置) / `nodemailer` / `sendgrid` | `spring.mail.*`、`SMTP_HOST` |
| 即时通讯/音视频 | `agora`(声网) / `tencent-im` / `rongcloud`(融云) / `livekit` | `agora.app-id` |
| AI 服务 | `openai` / `langchain` / `dashscope`(通义千问) / `zhipuai`(智谱) / `volcengine`(豆包) / `spark-api`(讯飞) | `OPENAI_API_KEY`、`dashscope.api-key` |
| 实名认证/OCR | 阿里云实人 / 腾讯云 OCR / 百度 AI | `ocr.app-id` |
| 统计/埋点 | `umeng-analytics` / `growingio` / `sensorsdata`(神策) / `matomo` | `analytics.app-key` |

## 5. 架构组件扫描

### 拦截器 / 过滤器 / 中间件

| 栈 | 扫描模式 |
|----|----------|
| Spring | `Grep: implements (HandlerInterceptor|Filter|OncePerRequestFilter)` + `addInterceptors` 注册处 |
| Gin | `Grep: \.Use\(` + `func \w+\(\) gin\.HandlerFunc` |
| FastAPI | `Grep: @app\.middleware\("http"\)` / `add_middleware` / `Depends` 链 |
| Django | `settings.py` 的 `MIDDLEWARE` 列表 + `Grep: MiddlewareMixin` |
| NestJS | `Grep: implements (NestMiddleware|NestInterceptor|CanActivate|PipeTransform)` |
| Express | `Grep: app\.use\((?!['"/])` 即函数式中间件注册 |

### 全局异常处理

| 栈 | 扫描模式 |
|----|----------|
| Spring | `Grep: @(ControllerAdvice|RestControllerAdvice)` + `@ExceptionHandler` |
| Gin | Recovery 中间件 + 自定义错误处理 |
| FastAPI | `Grep: (exception_handler|add_exception_handler)` |
| NestJS | `Grep: @Catch\(` |
| Express | `Grep: \(err, req, res, next\)` |

### 全局配置

| 栈 | 配置文件位置 |
|----|--------------|
| Spring | `application.yml` / `application-{profile}.yml` / `bootstrap.yml` / `@ConfigurationProperties` 类 |
| Go | `config.yaml` + `viper` / `envconfig` |
| Python | `settings.py` / `.env` + `pydantic-settings` / `config.py` |
| Node | `.env*` / `config/*.js|ts` / `ConfigModule` |

记录：配置文件清单、环境划分（dev/test/prod）、配置加载方式。

### 其他组件

| 组件 | 扫描模式 |
|------|----------|
| AOP | `Grep: @Aspect` + `spring-boot-starter-aop` |
| 跨域 | `Grep: (@CrossOrigin|addCorsMappings|CorsRegistry)` / `gin-contrib/cors` / `CORSMiddleware` / `enableCors` / `cors\(` |
| 路由注册方式 | 注解扫描 / 集中注册 router.go / include_router / Module imports |
| 统一响应封装 | `Grep: class (R|Result|Response|ApiResponse)<` / 响应工具函数 |
| 序列化 | Jackson 配置 / `encoding/json` 自定义 / Pydantic 版本 |

## 6. 安全隐患扫描（报告中单列章节）

```
# 硬编码密钥（排除 *.example / *.sample / 测试目录）
Grep: (?i)(password|passwd|secret|appkey|api[_-]?key|access[_-]?key|secret[_-]?key|token)\s*[:=]\s*["'][^"'\s]{6,}

# SQL 注入风险
Grep (MyBatis XML): \$\{            → ${} 拼接（应使用 #{}）
Grep (Java): "(select|insert|update|delete)[^"]*"\s*\+   → 字符串拼 SQL
Grep (Node): \$\{[^}]*\}.*(SELECT|INSERT|UPDATE|DELETE)  → 模板字符串拼 SQL

# DEBUG / 敏感端点
Grep: debug\s*[:=]\s*true
Grep: management\.endpoints\.web\.exposure\.include\s*=\s*\*   → Actuator 全暴露
Grep: gin\.SetMode\(gin\.DebugMode\)

# 文件上传/命令执行
Grep: Runtime\.getRuntime\(\)\.exec / ProcessBuilder / exec\( / os\.system / child_process
```

**以下为 dogfooding 实测补充的高价值检查项：**

```
# 🔴 目录穿越（文件下载/静态服务接口的经典漏洞）
模式：路径参数 + 文件读取拼接，无 .. 过滤
Grep (Python): os\.path\.join\([^)]*\{?\w*(path|file)  结合 @app.get 的 {file_path:path}
Grep (Node): (sendFile|createReadStream|res\.download)\(  结合 req.params
Grep (Java): new File\([^)]*\+ / Paths\.get\([^)]*\+
判断：拼接路径后是否校验 realpath/startsWith(根目录)、是否拒绝 ".."；同时该接口是否无鉴权

# 🔴 CORS 危险组合
allow_origins 含 "*" 且 allow_credentials=True/（Spring: allowedOrigins("*") + allowCredentials(true)）
→ 浏览器会拒绝该组合，但暴露配置意图且易被误改为可用漏洞

# 🟡 依赖声明 vs 实际使用 交叉验证（Python 高发：包名≠import 名）
1. 从 requirements/pyproject 提取声明依赖
2. Grep 全项目 import/from 语句
3. 双向 diff：
   - 声明未使用（僵尸依赖，如 celery/redis 声明零 import）→ 增大攻击面，建议清理
   - 使用未声明（如代码 from jose 但声明的是 pyjwt，jose 靠传递依赖侥幸存在）→ 换环境即崩，🔴 级
   常见包名映射：jose→python-jose、PIL→Pillow、yaml→PyYAML、dotenv→python-dotenv、bs4→beautifulsoup4
   （Node 同理：package.json dependencies vs import/require；Java：pom vs import 少见但可查）

# 🟡 弱密钥默认值 / DEBUG 默认开启
Grep: (?i)(secret|jwt_secret|secret_key)\s*[:=]\s*["'](change|your|default|xxx|123)  → 代码内弱默认值
Grep: debug\s*[:=]\s*(True|true)  → 注意是"默认值"还是环境配置

# 🟡 可预测 token/邀请码
Grep: (md5|sha1)\([^)]*(time|timestamp|random)  → 时间戳+弱哈希生成凭证，可预测
建议：secrets.token_hex / crypto.randomBytes / UUID

# 🟡 高风险依赖（已知安全问题）
vm2（已废弃，沙箱逃逸 CVE 多发）、lodash<4.17.21、log4j<2.17（Log4Shell）、fastjson<1.2.83
```

## 7. 输出要求

- 每个中间件/第三方服务标注：名称、用途、证据（`file:line`）
- 无法确定用途的依赖列在"待确认"清单
- 安全隐患按 严重/中等/低 分级，密钥类信息打码后展示前 4 位
