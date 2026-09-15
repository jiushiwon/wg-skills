# demo 项目指南

> 由 springboot-init-skill 一键生成。配套根目录 [api-contract.md](../api-contract.md)。

## 一、技术栈

| 维度 | 选型 |
|------|------|
| 语言 | JDK 21 |
| 框架 | Spring Boot 3.3.5 |
| 构建 | Maven + Maven Wrapper |
| ORM | Spring Data JPA |
| 数据库 | MySQL 8.0 |
| 鉴权 | Spring Security 6 + jjwt 0.12.x |
| 文档 | springdoc-openapi 2.6.0 |
| SSE | Spring MVC `SseEmitter`（Servlet 异步） |

## 二、目录结构

```
src/main/java/com/example/demo/
├── Application.java
├── common/        统一响应 / 异常 / JWT / 分页
├── config/        Security / Web / LoggingFilter / OpenAPI / ResponseAdvice
├── controller/    REST 控制器
├── service/       业务逻辑（含 SSE）
├── repository/    Spring Data JPA
├── entity/        JPA 实体
└── dto/           请求/响应 DTO
```

## 三、启动方式

```bash
# 1. 启动数据库
docker-compose up -d

# 2. 启动服务（dev 模式，热重载）
./restart.sh dev          # Linux / macOS
restart.bat dev           # Windows
```

浏览器打开：

- Swagger UI：<http://localhost:8080/swagger-ui.html>
- 健康检查：<http://localhost:8080/api/health>

## 四、关键约定

### 4.1 响应信封

所有接口统一返回 `{ code, message, data }`。

### 4.2 错误码

| code | 含义 |
|------|------|
| 0 | 成功 |
| -1001 ~ -1005 | 业务错误 |
| -2000 ~ -2002 | 系统错误 |

### 4.3 Token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## 五、开发指南

1. 新增接口：DTO → Service → Controller，同步更新 `api-contract.md`
2. 新增实体：Entity → Repository → Service
3. 修改 `.env` 后 devtools 自动生效

## 六、生产部署

```bash
docker-compose up -d --build
```

Nginx 反向代理时，SSE 端点必须：

```nginx
location /api/sse/ {
    proxy_pass http://localhost:8080;
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    proxy_read_timeout 60s;
}
```

## 七、高并发 / 企业级 checklist

- [ ] 调整 `.env` 中 `DB_POOL_MAX_SIZE`、`DB_POOL_MIN_IDLE` 以匹配数据库承载力
- [ ] 调整 `TOMCAT_THREADS_MAX`、`TOMCAT_ACCEPT_COUNT` 以匹配压测结果
- [ ] 生产环境 `SHUTDOWN_TIMEOUT` 应大于最长请求处理时间
- [ ] 若需服务端登出，引入 Redis 实现 JWT 黑名单
- [ ] 大文件上传建议走对象存储（OSS/S3）而非本地磁盘
- [ ] 启用 Nginx / CDN HTTPS

## 八、安全清单

- [ ] 修改 `.env` 中 `JWT_SECRET` 为随机值
- [ ] 生产环境 `APP_DEBUG=false`
- [ ] 生产环境 `CORS_ORIGINS` 设为具体域名
- [ ] 数据库密码改为强密码
- [ ] 启用 HTTPS

## 八、版本

项目版本：1.0.0
