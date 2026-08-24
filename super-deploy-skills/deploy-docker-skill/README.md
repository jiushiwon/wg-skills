# deploy-docker-skill

一个用于 **生成 Docker 部署文件** 的 Claude Skill。按 `deploy-profile.md` 生成多阶段 Dockerfile 与 docker-compose.yml，自动编排数据库/缓存服务，含健康检查与日志限制。如服务器无 Docker，会生成安装命令。

---

## 它能做什么

当你说：

- 「Docker 部署」
- 「deploy docker」
- 「生成 Dockerfile」
- 「生成 docker-compose」
- 「帮我把项目容器化」

这个 Skill 会帮你把项目容器化：生成对应语言的 Dockerfile（多阶段 + 瘦身）、含数据库/缓存的 compose 编排，以及部署/更新/回滚命令。

---

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| 每次写 Dockerfile 都重头来 | 按画像自动生成多阶段 Dockerfile |
| 镜像太大 | 运行时镜像用 alpine / slim / distroless |
| 数据库/缓存要单独起 | compose 一键编排 app + db + redis |
| 容器崩溃没人拉 | `restart: unless-stopped` + HEALTHCHECK |
| 日志把磁盘打满 | json-file 驱动 + max-size/max-file 限制 |
| 服务器没装 Docker | 调用 server-setup-skill 模板生成安装命令 |

---

## 支持的容器化栈

| 语言 | 构建阶段 base | 运行时 base |
|------|--------------|------------|
| Node.js | `node:22-alpine` | `node:22-alpine` |
| Python | `python:3.11-slim` | `python:3.11-slim` |
| Java | `maven:3-eclipse-temurin-17` | `eclipse-temurin:17-jre` |
| Go | `golang:1.22` | `gcr.io/distroless/static` |

数据库/缓存：PostgreSQL、MySQL、MongoDB、Redis、RabbitMQ、Kafka（按画像自动加入 compose）。

---

## 使用方式

```
Docker 部署
```

或自然语言：

```
帮我把这个项目容器化
生成 Dockerfile 和 docker-compose
```

### 五阶段流程

```
Phase 1: 读 deploy-profile.md，确定 base image 与依赖服务
Phase 2: 检测 Docker 是否安装，缺失则给安装命令
Phase 3: 生成多阶段 Dockerfile（含非 root 用户 + HEALTHCHECK）
Phase 4: 生成 docker-compose.yml（app + db + cache + volumes）
Phase 5: 输出部署命令（build / up / logs / restart / down）
```

---

## 生成的 compose 结构

```yaml
services:
  app:    # 项目服务（build + ports + env_file + depends_on + healthcheck）
  db:     # 数据库（image + named volume + healthcheck）
  redis:  # 缓存（按需）
volumes:
  db_data:
  redis_data:
```

---

## 部署命令

```bash
docker compose up -d --build       # 首次构建并启动
docker compose logs -f app         # 看日志
docker compose restart app         # 重启
git pull && docker compose up -d --build app   # 更新
docker compose down                # 停止（保留数据卷）
```

---

## 目录结构

```
deploy-docker-skill/
├── SKILL.md                         # 技能定义：触发条件、五阶段流程
├── README.md                        # 本文件
└── references/
    └── dockerfile-spec.md           # 各语言 Dockerfile 骨架与 compose 规范
```

---

## 与上游/下游 Skill 的关系

- 上游：[deploy-detect-skill](../deploy-detect-skill/) 提供画像（语言/数据库/缓存）。
- 协作：[server-setup-skill](../server-setup-skill/) 提供 Docker 安装命令模板。
- 协作：[static-nginx-skill](../static-nginx-skill/) 处理前端产物的 Nginx 容器。

---

## 注意事项

1. **默认不执行**：本 Skill 只生成文件，不自动 build/up；执行需二次确认。
2. **不用 latest**：镜像 tag 必须具体版本。
3. **非 root 运行**：容器内用非特权用户。
4. **数据卷持久化**：数据库用 named volume，禁止 `down -v` 误删。
5. **敏感值走 .env**：不进镜像、不进 compose。
6. **多容器优先**：生产默认 app/db/cache 分离，单容器仅 demo。
