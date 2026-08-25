# {{project}} 项目指南

> 由 springboot-init-skill 一键生成。配套根目录 `api-contract.md`。

## 一、技术栈

| 维度 | 选型 |
|------|------|
| 语言 | JDK 17+ LTS |
| 框架 | Spring Boot 3.x |
| 构建 | Maven + Maven Wrapper |
| ORM | {{orm}}（Spring Data JPA / Spring Data MongoDB） |
| 数据库 | {{dbType}}（MySQL / PostgreSQL / MongoDB） |
| 鉴权 | Spring Security 6 + jjwt 0.12.x |
| 文档 | springdoc-openapi 2（Swagger UI） |
| SSE | Spring MVC `SseEmitter`（Servlet 异步） |
| 上传 | multipart/form-data |

## 二、目录结构

参见根目录 README.md「生成项目结构」一节。

## 三、启动方式

### 3.1 准备 .env

生成后会自动创建 `.env`（从 `.env.example` 复制）。**生产环境务必修改**：

```bash
# ⚠️ 必须修改的敏感配置
JWT_SECRET=<运行 openssl rand -base64 32 生成>
APP_DEBUG=false
CORS_ORIGINS=https://your-domain.com
```

### 3.2 启动数据库

```bash
# MySQL
docker-compose up -d

# PostgreSQL
docker-compose -f docker-compose.pg.yml up -d

# MongoDB
docker-compose -f docker-compose.mongo.yml up -d
```

### 3.3 一键启动

```bash
./restart.sh dev         # Linux / macOS
restart.bat dev          # Windows
```

浏览器打开：

- Swagger UI：<http://localhost:8080/swagger-ui.html>
- OpenAPI JSON：<http://localhost:8080/v3/api-docs>
- 健康检查：<http://localhost:8080/api/health>

## 四、关键约定

### 4.1 响应信封

所有接口统一返回 `{ code, message, data }`，详见 `api-contract.md`。

### 4.2 错误码

| code | 含义 |
|------|------|
| 0 | 成功 |
| -1001 ~ -1005 | 业务错误（参数/鉴权/权限/不存在/冲突） |
| -2000 ~ -2002 | 系统错误 |

### 4.3 Token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 4.4 表前缀

默认 `wg_`，通过 `.env` 中 `DB_TABLE_PREFIX` 修改。

### 4.5 日志

- 开发：`logs/dev.log`
- 生产：`logs/app.log`

## 五、开发指南

### 5.1 新增接口（标准流程）

1. `dto/` 新增请求/响应 DTO
2. `service/` 新增业务方法
3. `controller/` 新增路由
4. （可选）`@CurrentUser` 注入当前用户
5. 更新 `api-contract.md`

### 5.2 新增实体（数据库）

1. `entity/` 新增 `@Entity`（或 `@Document`）
2. `repository/` 新增 `JpaRepository`（或 `MongoRepository`）
3. `service/` 调用仓储
4. 如需迁移：`src/main/resources/db/migration/V{n}__{desc}.sql`

### 5.3 修改 .env 后生效

开发模式 devtools 自动重启；生产模式 `./restart.sh prod` 重启。

## 六、与前端联动

| 维度 | 后端实现 | 前端消费 |
|------|----------|----------|
| 响应信封 | `ResponseBodyAdvice` | `frontend-request-skill` 的 `ApiResponse<T>` |
| 错误码 | `GlobalExceptionHandler` | `ERROR_CODE_MAP` |
| Token | `Authorization: Bearer` | 请求拦截器 |
| SSE | `SseEmitter` | EventSource / `enableChunked` |
| 上传 | `multipart/form-data` | `upload<T>(options)` |

前端调用示例（`uniapp-request-skill`）：

```typescript
import { request } from 'uniapp-request-skill';

const resp = await request({
  url: '/api/users',
  method: 'GET',
  params: { page: 1, size: 10 },
});
// resp.code === 0 时取 resp.data
```

## 七、生产部署

### 7.1 Docker 部署

```bash
docker-compose up -d --build
```

容器包含：

- {{project}}-app（Spring Boot）
- {{project}}-mysql（MySQL）

### 7.2 反向代理

建议 Nginx 前置：

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/sse/ {
        proxy_pass http://localhost:8080;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        proxy_read_timeout 60s;
    }
}
```

> SSE 必须 `proxy_buffering off` + `Connection ''`，否则 Nginx 会缓存响应，SSE 流式特性失效。

### 7.3 JVM 调优

```bash
java -Xms512m -Xmx1g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -jar app.jar
```

## 八、高并发 / 企业级 checklist

- [ ] 调整 `.env` 中 `DB_POOL_MAX_SIZE`、`DB_POOL_MIN_IDLE` 匹配数据库承载力
- [ ] 调整 `TOMCAT_THREADS_MAX`、`TOMCAT_ACCEPT_COUNT` 匹配压测结果
- [ ] `SHUTDOWN_TIMEOUT` 大于最长请求处理时间
- [ ] 若需服务端登出，引入 Redis 实现 JWT 黑名单
- [ ] 大文件上传建议走对象存储（OSS/S3）
- [ ] 启用 Nginx / CDN HTTPS

## 九、安全清单

- [ ] 修改 `JWT_SECRET` 为随机值（至少 256 位）
- [ ] `APP_DEBUG=false`
- [ ] `CORS_ORIGINS` 设为具体域名
- [ ] 数据库密码改为强密码
- [ ] 启用 HTTPS（反向代理层做）
- [ ] 启用 Flyway（生产环境不依赖 `ddl-auto: update`）
- [ ] 日志脱敏（密码、身份证、手机号中间 4 位 *）

## 十、版本

项目版本：1.0.0（与 `pom.xml` 中 `<version>` 一致）。
