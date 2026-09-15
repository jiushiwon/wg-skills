# demo - springboot-init-skill canonical 示例项目

> 由 springboot-init-skill 生成的完整 Spring Boot 项目骨架，用于：
> 1. 验证技能生成的内容可编译、可运行
> 2. 维护者 dogfooding：先在 demo 跑通，再回写 references

## 一键运行

```bash
# 1. 启动数据库
docker-compose up -d

# 2. 启动服务（dev 模式，热重载）
./restart.sh dev          # Linux / macOS
restart.bat dev           # Windows
```

打开浏览器：

- Swagger UI：<http://localhost:8080/swagger-ui.html>
- 健康检查：<http://localhost:8080/api/health>

## 验证步骤

```bash
# 1. 健康检查
curl http://localhost:8080/api/health
# {"code":0,"message":"success","data":{"status":"ok","service":"demo",...}}

# 2. 注册
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123","email":"alice@example.com"}'

# 3. 登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'

# 4. SSE 流
curl -N http://localhost:8080/api/sse/chat

# 5. 上传文件
curl -X POST http://localhost:8080/api/upload \
  -H "Authorization: Bearer {accessToken}" \
  -F "file=@test.png"
```

## 与 skill 同步

本 demo 的源码是 `references/skeleton.md` 的"实例化产物"。

| 源码 | 对应 references |
|------|------------------|
| `src/main/java/com/example/demo/Application.java` | skeleton.md `### Application.java` |
| `common/ApiResponse.java` | skeleton.md `### common/ApiResponse.java` |
| `config/SecurityConfig.java` | skeleton.md `### config/SecurityConfig.java` |
| `controller/HealthController.java` | skeleton.md `### controller/HealthController.java` |
| ... | ... |

修改 skeleton.md 后，应同步更新本 demo 保持一致。

## 版本

| 维度 | 版本 |
|------|------|
| Spring Boot | 3.3.5 |
| JDK | 21 |
| jjwt | 0.12.6 |
| springdoc-openapi | 2.6.0 |
| MySQL | 8.0 |

> ⚠️ 版本号为 canonical demo 的固定值，SKILL.md 不写死。