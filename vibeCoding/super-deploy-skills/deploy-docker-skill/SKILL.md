---
name: deploy-docker-skill
description: 用于按 deploy-profile.md 生成 Dockerfile 与 docker-compose.yml，覆盖多阶段构建、数据库/缓存服务编排、健康检查、日志驱动、Docker 安装命令（如服务器无 Docker）。区分单容器与多容器编排。当用户说「Docker 部署」「deploy docker」「生成 Dockerfile」「生成 docker-compose」时触发。
---

# Deploy Docker Skill

## Overview

本 skill 把项目容器化部署规范化。它读取 `deploy-profile.md`，生成对应语言的 Dockerfile（多阶段构建、镜像瘦身），以及包含项目服务 + 数据库 + 缓存的 `docker-compose.yml`。如服务器无 Docker，生成安装命令。

默认行为：生成文件到项目目录，不自动 `docker build` / `up`；用户审查后手动执行。

## When to Use

触发词：

- `Docker 部署`
- `deploy docker`
- `生成 Dockerfile`
- `生成 docker-compose`
- `帮我把项目容器化`

前置依赖：建议先运行 `deploy-detect-skill`。如服务器无 Docker，本 skill 会调用 `server-setup-skill` 的安装命令模板生成 Docker 安装步骤。

## Workflow Summary

```
Phase 1: 读取 deploy-profile.md
  → 语言/框架 → 决定 base image 与构建方式
  → 数据库/缓存 → 决定 compose 中的依赖服务
  → 前端产物 → 决定是否需要 Nginx 容器或静态托管

Phase 2: 检测 Docker 是否安装
  → docker -v / docker compose version
  → 缺失则按 OS 生成安装命令（调用 server-setup-skill 模板）

Phase 3: 生成 Dockerfile
  → 多阶段构建（deps → build → runtime）
  → 运行时镜像瘦身（alpine / slim / distroless）
  → 非 root 用户运行
  → HEALTHCHECK 指令

Phase 4: 生成 docker-compose.yml
  → app 服务（build + ports + env_file + depends_on）
  → 数据库服务（image + volumes + 初始化变量）
  → 缓存/消息服务（按需）
  → healthcheck + restart 策略

Phase 5: 输出部署命令
  → docker compose build
  → docker compose up -d
  → docker compose logs -f
  → docker compose restart
```

## Phase 1: 读取 deploy-profile.md

| 画像字段 | 决定 |
|----------|------|
| 语言 | Dockerfile base image 与构建命令 |
| Web 框架 | 启动命令（CMD） |
| 数据库 | compose 中增加对应 db 服务 + volume |
| 缓存/消息 | compose 中增加 redis / kafka 服务 |
| 前端产物 | 增加 Nginx 容器托管静态，或合并到 app 镜像 |

## Phase 2: 检测 Docker 是否安装

```bash
docker -v                  # Docker version 24.x
docker compose version     # Docker Compose version v2.x
```

缺失时，按 `server-setup-skill/references/install-commands.md` 的 Docker 段生成安装命令。如已安装，跳过。

## Phase 3: 生成 Dockerfile

按 `references/dockerfile-spec.md` 生成多阶段 Dockerfile。Node.js 示例：

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
  CMD node -e "require('http').get('http://127.0.0.1:8080/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "dist/server.js"]
```

## Phase 4: 生成 docker-compose.yml

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: my-api:latest
    container_name: my-api
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://127.0.0.1:8080/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: postgres:16-alpine
    container_name: my-api-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: myapi_db
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d myapi_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: my-api-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data

volumes:
  db_data:
  redis_data:
```

> 数据库密码等敏感值从 `.env` 读取，不要写进 compose。

## Phase 5: 输出部署命令

```bash
# 首次构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f app

# 重启
docker compose restart app

# 更新代码后重新部署
git pull
docker compose up -d --build app

# 停止
docker compose down        # 保留数据卷
docker compose down -v     # 删除数据卷（危险，需确认）
```

## 单容器 vs 多容器

- **单容器**：项目 + 数据库都在同一容器（仅适合 demo，不推荐生产）。
- **多容器编排**（默认推荐）：app / db / redis 各自独立容器，通过 compose network 互通。

## Output

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- 部署/更新/回滚命令清单

## Resources

- `references/dockerfile-spec.md` — 各语言 Dockerfile 骨架与 compose 规范

## Best Practices

- 多阶段构建，运行时镜像不含构建工具与源码。
- 用具体版本 tag（`node:22-alpine`），禁止 `latest`。
- 容器内用非 root 用户运行。
- 配置 HEALTHCHECK 与 `restart: unless-stopped`。
- 日志用 `json-file` 驱动并限制大小，避免磁盘打满。
- 数据库数据用 named volume 持久化，禁止 `down -v` 误删。
- 敏感值走 `.env` + `env_file`，不进镜像、不进 compose。
- 默认只生成文件，不自动 build/up；执行需二次确认。
