# Dockerfile / Compose 规范

本文件定义 `deploy-docker-skill` 生成各语言 Dockerfile 的骨架，以及 docker-compose.yml 的标准结构。

## 通用原则

- **多阶段构建**：构建期与运行期分离，运行镜像不含编译器/源码。
- **具体版本 tag**：禁止 `latest`，用 `node:22-alpine`、`postgres:16-alpine`。
- **非 root 运行**：运行阶段 `USER app`。
- **HEALTHCHECK**：镜像内置健康检查。
- **`.dockerignore`**：排除 `node_modules`、`.git`、`*.log`、`dist`（构建期重新生成）。
- **端口约定**：容器内应用监听统一读环境变量 `APP_PORT`（默认 8080）；`EXPOSE` 写默认 8080（仅文档用途），HEALTHCHECK 用 `${APP_PORT:-8080}`；compose 用 `${APP_PORT:-8080}:8080` 或 `${APP_PORT:-8080}:${APP_PORT:-8080}` 映射。应用代码必须读 `APP_PORT`，与 `script-standards.md` 一致。

## Node.js Dockerfile

```dockerfile
# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8080/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "dist/server.js"]
```

## Python (FastAPI) Dockerfile

```dockerfile
# ---- build ----
FROM python:3.11-slim AS build
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1
COPY requirements.txt ./
RUN pip install --prefix=/install -r requirements.txt

# ---- runtime ----
FROM python:3.11-slim AS runtime
WORKDIR /app
ENV PYTHONUNBUFFERED=1
RUN useradd -r -u 1001 app
COPY --from=build /install /usr/local
COPY . .
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/health').status==200 else 1)"
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8080", "app.main:app"]
```

## Java (Spring Boot) Dockerfile

```dockerfile
# ---- build ----
FROM maven:3-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# ---- runtime ----
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app
RUN useradd -r -u 1001 app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Go (Gin) Dockerfile

```dockerfile
# ---- build ----
FROM golang:1.22 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /server ./cmd/server

# ---- runtime ----
FROM gcr.io/distroless/static:nonroot AS runtime
COPY --from=build /server /server
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/server"]
```

> Go 静态二进制可放进 distroless，镜像极小（几 MB）。

## 前端静态（Nginx 容器）

```dockerfile
# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime ----
FROM nginx:1.25-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
```

## docker-compose.yml 规范

标准结构：

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: <app>:<version>          # 不用 latest
    container_name: <app>
    restart: unless-stopped
    ports:
      - "${APP_PORT:-8080}:8080"   # 容器内固定 8080，宿主端口由 APP_PORT 决定
    env_file:
      - .env                         # 内含 APP_PORT
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "..."]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - app-net

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: <app>_db
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-net

networks:
  app-net:

volumes:
  db_data:
```

## 数据库镜像选择

| 数据库 | 镜像 | 数据卷路径 | 健康检查 |
|--------|------|-----------|----------|
| PostgreSQL | `postgres:16-alpine` | `/var/lib/postgresql/data` | `pg_isready` |
| MySQL | `mysql:8.0` | `/var/lib/mysql` | `mysqladmin ping` |
| MongoDB | `mongo:7` | `/data/db` | `mongosh --eval "db.adminCommand('ping')"` |
| Redis | `redis:7-alpine` | `/data` | `redis-cli ping` |

## .dockerignore 模板

```
.git
.github
node_modules
npm-debug.log
dist
build
.env
*.log
.DS_Store
__pycache__
*.pyc
target
bin
```

## 常见坑

- **镜像里打进 .env**：敏感值泄露。用 `env_file` 在运行时注入。
- **`down -v` 误删数据卷**：生产禁用，或先备份。
- **depends_on 不等就绪**：只等容器启动，不等服务就绪；用 `condition: service_healthy`。
- **端口冲突**：host_port 与已有服务冲突；生成前提示检测。
- **时区错误**：容器默认 UTC；如需本地时区，挂 `-v /etc/localtime:/etc/localtime:ro` 或设 `TZ` 环境变量。
- **日志无限增长**：必须设 `max-size` / `max-file`。
