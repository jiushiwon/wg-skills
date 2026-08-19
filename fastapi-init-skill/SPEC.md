# fastapi-init-skill 功能规格说明书

> 本文档描述 fastapi-init-skill 的完整功能清单、生成内容、工作流程与技术细节。

---

## 一、技能定位

**一句话描述**：面向零基础用户的 FastAPI 项目一键初始化技能。用户只需说"帮我搭一个 FastAPI 项目"，即可在 30 秒内获得一个**立即可运行**的标准化 Web 服务骨架。

**目标用户**：
- 完全不懂编程、想快速搭建 API 服务的小白
- 需要标准化 FastAPI 骨架的开发团队
- 需要内置 SSE 流式、JWT 鉴权、Swagger 文档的原型项目

**与 python-backend-skill 的区别**：

| 维度 | python-backend-skill | fastapi-init-skill |
|------|---------------------|--------------------|
| 目标用户 | 后端开发者 | **零基础小白** |
| 环境安装 | 用户自己装 | **自动检测 + 自动安装** |
| 启动方式 | 手动 uvicorn | **一键脚本（setup / dev / restart / start）** |
| SSE 支持 | 无 | **内置** |
| 默认数据库 | PostgreSQL | **MySQL** |
| 脚本 | 无 | **Linux + Windows 双平台** |
| 交互次数 | 多个技术问题 | **最多 3 个问题** |

---

## 二、触发条件

### 2.1 关键词触发（18 个）

```
FastAPI 脚手架、FastAPI 一键生成、初始化 FastAPI 项目、FastAPI 快速开始、
fastapi init、搭建 FastAPI 服务、Python Web 骨架、FastAPI 开箱即用、
FastAPI 零基础、FastAPI 小白、帮我搭一个 FastAPI、新建 FastAPI、
create fastapi project、fastapi starter
```

### 2.2 自动触发逻辑

当用户消息包含上述任一关键词，且未明确指定使用 python-backend-skill 时，自动路由到本技能。

---

## 三、核心功能（23 项）

| # | 功能 | 说明 |
|---|------|------|
| 1 | **环境探测** | 自动检测 Python 版本（>=3.9）、pip、操作系统类型 |
| 2 | **自动安装** | 创建 venv、安装所有依赖、编译检查 |
| 3 | **一键启动** | `./setup.sh` 一条命令完成检测→安装→启动 |
| 4 | **开发模式** | `./dev.sh` 热重载，代码修改自动重启 |
| 5 | **生产启动** | `./start.sh` 后台多 worker 启动，PID 文件管理 |
| 6 | **一键重启** | `./restart.sh` 优雅停止旧进程并重新启动 |
| 7 | **SSE 流式** | 内置 `sse-starlette`，示例端点 `/api/sse/chat` |
| 8 | **文件上传** | 内置 `/api/upload` 单文件与 `/api/uploads` 多文件上传 |
| 9 | **统一响应** | `EnvelopeRoute` 自动包装 `{ code, message, data }` |
| 10 | **全局异常** | BusinessException / -1001 校验 / -2000 兜底 |
| 11 | **JWT 鉴权** | 注册 / 登录 / 刷新令牌 / 当前用户注入 |
| 12 | **请求日志** | requestId + method + path + status + duration（自动过滤敏感路径） |
| 13 | **CORS** | 可配置来源、凭证策略 |
| 14 | **参数校验** | Pydantic v2 自动校验，失败转 -1001 |
| 15 | **密码加密** | passlib bcrypt，最小 8 位 |
| 16 | **Swagger** | `/docs`（Swagger UI）+ `/redoc`（ReDoc） |
| 17 | **数据库** | MySQL 默认 / PostgreSQL / MongoDB / 无数据库 可选 |
| 18 | **健康检查** | `/api/health` 含 DB 连通检查 |
| 19 | **Docker** | Dockerfile + docker-compose（多阶段构建 + 非 root 运行） |
| 20 | **文档** | project-guide + api-contract 双文档强制交付 |
| 21 | **生产安全配置** | 安全头中间件、.env 安全注释、资源限制 |
| 22 | **连接池保活** | `pool_recycle` + `pool_pre_ping` |
| 23 | **优雅关闭** | `SIGTERM` 精确停止 + uvicorn `--graceful-timeout` |

---

## 四、用户交互流程

### 4.1 第一步：询问（最多 3 个问题）

```
1. 项目名叫什么？（默认 my-fastapi-app）
2. 用哪个数据库？
   A. MySQL（默认，推荐）
   B. PostgreSQL
   C. MongoDB
   D. 暂时不用数据库
3. 是否需要 Redis？（默认不需要）
```

**不做**：不问技术细节、不问版本号、不问目录结构——全部自动选最佳实践。

### 4.2 第二步：环境探测

```
开始
  │
  ├─ 1. 检测操作系统（Linux/macOS/Windows）
  ├─ 2. 检测 Python 版本（需 >= 3.9）
  ├─ 3. 检测 pip 是否可用
  ├─ 4. 检测虚拟环境（已有则询问是否重建）
  └─ 5. 安装依赖（pip install -r requirements.txt）
```

环境不满足时给出中文提示 + 下载链接 + 安装指引。

### 4.3 第三步：生成项目骨架

**生成顺序**：

1. 创建目录结构
2. 写入配置文件（requirements.txt、.env.example、.gitignore）
3. 写入核心模块（main.py、config.py、database.py、response.py、exceptions.py、dependencies.py）
4. 写入业务模块（models → schemas → services → routers）
5. 写入启动脚本（setup + dev + start + restart，双平台）
6. 写入 Docker 配置（Dockerfile + docker-compose.yml x3）
7. 写入强制交付物（api-contract.md + docs/project-guide.md）
8. 写入项目元文件（README.md、CLAUDE.md、AGENTS.md、versions.md）

### 4.4 第四步：自动安装与验证

```
1. 创建 Python 虚拟环境（python -m venv venv）
2. 从 .env.example 复制生成 .env（如不存在）
3. 安装依赖（pip install -r requirements.txt）
4. 编译检查（python -m compileall app）
5. 检测数据库可用性，有 Docker 则自动启动数据库容器
6. 提示用户运行 ./setup.sh 或 setup.bat 一键启动
```

### 4.5 第五步：交付清单

向用户汇报完整交付物：

```
✅ 项目 {{project}} 生成完毕！

📁 生成的文件：
  - 核心模块：app/main.py, config.py, database.py, response.py ...
  - API 路由：health / auth / users / sse / upload
  - 启动脚本：setup.sh, dev.sh, start.sh, restart.sh（Windows 对应 .bat）
  - 数据库：MySQL（已配置 docker-compose.yml，可选 PG / MongoDB / 无数据库）
  - 文档：api-contract.md, docs/project-guide.md

🚀 启动方式：
  一键启动：  ./setup.sh        （首次使用，自动装依赖）
  开发模式：  ./dev.sh          （改代码自动重启）
  生产模式：  ./start.sh        （后台多 worker）
  重启服务：  ./restart.sh      （停止后重新启动）

📖 接口文档：
  Swagger UI：  http://localhost:8080/docs
  ReDoc：       http://localhost:8080/redoc

🔌 SSE 示例：
  curl http://localhost:8080/api/sse/chat

📎 上传示例：
  curl -F "file=@test.png" http://localhost:8080/api/upload

🔑 默认账号：
  注册接口：POST /api/auth/register
  登录接口：POST /api/auth/login

⚠️ 安全提醒：
  请编辑 .env 文件修改 JWT_SECRET（搜索 change-me）
  生产环境务必使用随机密钥！
```

---

## 五、生成项目的目录结构

```
{{project}}/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 入口：lifespan、CORS、异常、中间件、路由注册
│   ├── config.py            # Pydantic Settings：从 .env 读取全部配置
│   ├── database.py          # 数据库引擎：SQLAlchemy async / Motor client
│   ├── response.py          # 统一响应：EnvelopeRoute + api_response 兜底
│   ├── exceptions.py        # 业务异常：BusinessException
│   ├── dependencies.py      # 依赖注入：get_db、get_current_user
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py        # 健康检查 GET /api/health
│   │   ├── auth.py          # 注册/登录/刷新 POST /api/auth/*
│   │   ├── users.py         # 用户 CRUD GET|PUT /api/users/*
│   │   ├── sse.py           # SSE 流式 GET /api/sse/chat
│   │   └── upload.py        # 文件上传 POST /api/upload /api/uploads
│   ├── models/
│   │   ├── __init__.py      # Base 导出
│   │   └── user.py          # User 表模型（SQLAlchemy ORM 或 Pydantic Document）
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py          # Pydantic 入参/出参（RegisterRequest/LoginRequest/TokenResponse/...）
│   │   └── upload.py        # 上传请求/响应模型
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user.py          # 用户业务逻辑（创建/认证/查询）
│   │   └── upload.py        # 文件保存策略与校验
│   └── utils/
│       ├── __init__.py
│       └── security.py      # JWT 签发/验证 + bcrypt 哈希
├── alembic/                 # 数据库迁移（仅关系型 PG/MySQL）
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # pytest 异步客户端 fixture
│   └── test_health.py       # 健康检查单元测试
├── docs/
│   └── project-guide.md     # 项目指南（强制交付物）
├── setup.sh                 # 一键环境搭建（Linux/macOS）
├── setup.bat                # 一键环境搭建（Windows）
├── dev.sh                   # 开发模式热重载（Linux/macOS）
├── dev.bat                  # 开发模式热重载（Windows）
├── start.sh                 # 生产模式启动（Linux/macOS）
├── start.bat                # 生产模式启动（Windows）
├── restart.sh               # 一键重启（Linux/macOS）
├── restart.bat              # 一键重启（Windows）
├── requirements.txt         # Python 依赖清单
├── .env.example             # 环境变量模板（含安全注释）
├── .gitignore               # Git 忽略规则
├── Dockerfile               # 容器镜像构建（多阶段 + 非 root）
├── docker-compose.yml       # 默认 MySQL 服务编排
├── docker-compose.pg.yml    # PostgreSQL 编排
├── docker-compose.mongo.yml # MongoDB 编排
├── api-contract.md          # 接口契约（强制交付物）
├── versions.md              # 依赖版本记录
├── CLAUDE.md                # Claude 项目规范
├── AGENTS.md                # Agent 项目规范
├── README.md                # 项目说明
└── pyproject.toml           # 项目元数据
```

**核心约定**：
- 路由前缀：`/api`
- 认证路由：`/api/auth/*`
- SSE 路由：`/api/sse/*`
- 上传路由：`/api/upload`、`/api/uploads`
- 表前缀：`wg`（可在 .env 中修改）
- 应用端口：`8080`
- Swagger：`/docs`、`/redoc`
- 健康检查：`GET /api/health`

---

## 六、技术栈与依赖

### 6.1 核心技术栈

| 组件 | 用途 | 版本策略 |
|------|------|---------|
| Python 3.9+ | 运行时 | 自动检测本机版本 |
| FastAPI | Web 框架 | PyPI 最新稳定版 |
| Uvicorn | ASGI 服务器 | PyPI 最新稳定版 |
| SQLAlchemy 2.0 | 异步 ORM（MySQL/PostgreSQL） | PyPI 最新稳定版 |
| Motor | 异步 MongoDB 驱动 | PyPI 最新稳定版 |
| Pydantic v2 | 数据校验与配置管理 | PyPI 最新稳定版 |
| python-jose | JWT 签发与验证 | PyPI 最新稳定版 |
| passlib[bcrypt] | 密码加密 | PyPI 最新稳定版 |
| sse-starlette | Server-Sent Events 流式推送 | PyPI 最新稳定版 |
| python-multipart | 文件上传解析 | PyPI 最新稳定版 |
| Alembic | 数据库迁移 | PyPI 最新稳定版 |

### 6.2 依赖清单（requirements.txt）

```txt
fastapi
uvicorn[standard]
pydantic
pydantic-settings
python-dotenv
sqlalchemy[asyncio]
pymysql
aiomysql
asyncpg
motor
cryptography
passlib[bcrypt]
python-jose[cryptography]
sse-starlette
python-multipart
alembic
email-validator
httpx
pytest
pytest-asyncio
```

**数据库变体**：
- MySQL：已包含 `pymysql` + `aiomysql` + `cryptography`
- PostgreSQL：已包含 `asyncpg`
- MongoDB：已包含 `motor`

---

## 七、核心模块详解

### 7.1 main.py（应用入口）

**职责**：
- `lifespan` 异步上下文：启动时初始化数据库（`create_all` 或 `connect_db`），关闭时释放资源
- 中间件注册顺序：安全头 → 请求日志 → CORS
- 异常处理器：`BusinessException` → `-1001` 校验错误 → `-2000` 兜底
- 路由注册：`health`、`auth`、`users`、`sse`、`upload`
- Swagger 自定义：增强中文说明、注册/登录指引

**关键代码结构**：
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 数据库初始化（开发阶段 auto-create；生产环境请用 Alembic）
    logger.info("服务启动完成")
    if settings.jwt_secret == "change-me-in-production":
        logger.warning("⚠️ JWT_SECRET 为默认值！")
    yield
    # 资源释放

app = FastAPI(lifespan=lifespan, ...)

# 安全头中间件
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response

# 请求日志中间件（自动过滤敏感路径）
@app.middleware("http")
async def request_log_middleware(request, call_next):
    ...

# 异常处理器
@app.exception_handler(BusinessException)
@app.exception_handler(RequestValidationError)
@app.exception_handler(Exception)
```

### 7.2 config.py（配置管理）

**职责**：Pydantic Settings 从 `.env` 读取全部配置，支持类型校验和默认值。

**配置项清单**：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `APP_NAME` | `{{project}}` | 应用名称 |
| `APP_PORT` | `8080` | 监听端口 |
| `APP_DEBUG` | `true` | 调试模式（⚠️ 生产必须 false） |
| `DB_TYPE` | `mysql` | 数据库类型 |
| `DB_HOST` | `localhost` | 数据库地址 |
| `DB_PORT` | `3306` | 数据库端口 |
| `DB_NAME` | `app_db` | 数据库名 |
| `DB_USER` | `root` | 用户名 |
| `DB_PASSWORD` | `root` | 密码（🔴 生产必须修改） |
| `DB_PREFIX` | `wg` | 表前缀 |
| `JWT_SECRET` | `change-me-in-production` | JWT 密钥（🔴 生产必须修改） |
| `JWT_EXPIRES_IN` | `86400` | Access Token 有效期（秒） |
| `JWT_REFRESH_EXPIRES_IN` | `604800` | Refresh Token 有效期（秒） |
| `CORS_ORIGINS` | `*` | 跨域来源（🔴 生产必须指定域名） |
| `UPLOAD_DIR` | `uploads` | 文件上传保存目录 |
| `UPLOAD_MAX_SIZE` | `10` | 单文件最大大小（MB） |
| `UPLOAD_ALLOWED_TYPES` | `image/jpeg,image/png,image/gif,application/pdf` | 允许上传的 MIME 类型 |

**database_url 属性**：根据 `DB_TYPE` 自动拼接连接串
- MySQL：`mysql+aiomysql://...?charset=utf8mb4`
- PostgreSQL：`postgresql+asyncpg://...`
- MongoDB：`mongodb://...?authSource=admin`

### 7.3 database.py（数据库引擎）

**SQLAlchemy 变体**：
```python
engine = create_async_engine(
    settings.database_url,
    echo=settings.app_debug,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,      # 连接池保活
    pool_pre_ping=True,
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

**MongoDB 变体**：
```python
client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.database_url)
    db = client[settings.db_name]
    await client.admin.command("ping")
```

### 7.4 response.py（统一响应）

**EnvelopeRoute**：自定义 APIRoute，自动包装响应为 `{ code, message, data }` 格式。

**规则**：
- handler 返回裸数据 → 自动包装为 `{ code: 0, message: "success", data: ... }`
- 非 JSON 响应（SSE、文件下载）→ 自动透传，不包信封
- 异常处理器使用 `api_response()` 构造错误信封

### 7.5 dependencies.py（依赖注入）

**get_db()**：获取数据库 Session（SQLAlchemy）或 Database 对象（MongoDB）
**get_current_user()**：解析 JWT Token，注入当前用户信息字典 `{ user_id, username }`

### 7.6 utils/security.py（安全工具）

**JWTUtil 类**：
- `generate(user_id, username)` → 签发 access_token（24h）
- `generate_refresh(user_id, username)` → 签发 refresh_token（7d）
- `parse(token)` → 解析并验证 Token

**密码工具**：
- `hash_password(password)` → bcrypt 哈希（12 rounds）
- `verify_password(plain, hashed)` → 验证密码

### 7.7 routers/（路由层）

| 路由文件 | 前缀 | 端点 | 说明 |
|----------|------|------|------|
| health.py | `/api` | `GET /health` | 服务状态 |
| health.py | `/api` | `GET /health/db` | 数据库连通检查 |
| auth.py | `/api/auth` | `POST /register` | 用户注册 |
| auth.py | `/api/auth` | `POST /login` | 用户登录 |
| auth.py | `/api/auth` | `POST /refresh` | 刷新 Token |
| auth.py | `/api/auth` | `POST /logout` | 登出（清除 refresh_token） |
| auth.py | `/api/auth` | `GET /me` | 当前用户信息 |
| users.py | `/api` | `GET /users` | 用户列表（分页） |
| users.py | `/api` | `GET /users/{id}` | 用户详情 |
| users.py | `/api` | `PUT /users/profile` | 修改个人资料 |
| users.py | `/api` | `PUT /users/password` | 修改密码 |
| sse.py | `/api/sse` | `GET /chat` | SSE 流式示例（公开） |
| sse.py | `/api/sse` | `GET /chat/protected` | SSE 流式（需登录） |
| upload.py | `/api` | `POST /upload` | 单文件上传 |
| upload.py | `/api` | `POST /uploads` | 多文件上传 |

---

## 八、启动脚本详解

### 8.1 脚本矩阵

| 脚本 | 平台 | 模式 | 热重载 | PID 管理 | 资源限制 |
|------|------|------|--------|----------|----------|
| `setup.sh` / `setup.bat` | Linux/macOS / Windows | 首次环境搭建 | ✅ | ❌ | ❌ |
| `dev.sh` / `dev.bat` | Linux/macOS / Windows | 开发 | ✅ | ❌ | ❌ |
| `start.sh` / `start.bat` | Linux/macOS / Windows | 生产 | ❌ | ✅ | ✅ |
| `restart.sh` / `restart.bat` | Linux/macOS / Windows | 重启 | 跟随 start | ✅ | - |

### 8.2 setup.sh 工作流程

```
[1/6] 检测 Python 3.9+
[2/6] 创建/激活虚拟环境
[3/6] 从 .env.example 生成 .env
[4/6] 安装依赖
[5/6] 编译检查
[6/6] 检查数据库（有 Docker 则自动启动）
→ 启动 uvicorn（热重载开启，前台运行）
```

### 8.3 start.sh 生产启动

```bash
mkdir -p logs
nohup uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --workers "$WORKERS" \
    --log-level info \
    > logs/app.log 2>&1 &
echo $! > app.pid
```

**特性**：
- 后台运行，日志写入 `logs/app.log`
- PID 写入 `app.pid`
- 多 worker（默认 2 进程，可通过 `APP_WORKERS` 调整）

### 8.4 restart.sh 优雅重启

```bash
if [ -f "app.pid" ]; then
    kill -TERM $(cat app.pid)
    sleep 2
fi
rm -f app.pid
→ 重新执行 start.sh
```

---

## 九、Docker 支持

### 9.1 Dockerfile（多阶段构建）

```dockerfile
# 构建阶段
FROM python:{{PYTHON_VERSION}}-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 运行阶段
FROM python:{{PYTHON_VERSION}}-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# 非 root 用户
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser
COPY --chown=appuser:appuser . .

EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080",
     "--workers", "2", "--limit-max-requests", "10000",
     "--limit-concurrency", "100", "--graceful-timeout", "30"]
```

### 9.2 docker-compose 编排

**默认 MySQL**：`docker-compose.yml`
- app 服务 + mysql 服务
- app 依赖 mysql healthy 状态
- mysql 含 healthcheck（mysqladmin ping）
- app 含 healthcheck（HTTP /api/health）

**PostgreSQL**：`docker-compose.pg.yml`
**MongoDB**：`docker-compose.mongo.yml`

---

## 十、SSE 流式框架

### 10.1 依赖

```txt
sse-starlette
```

### 10.2 示例端点

```python
@router.get("/chat", summary="SSE 流式示例（无需登录）")
async def sse_chat():
    async def event_generator():
        for msg in messages:
            yield {"event": "message", "data": json.dumps(msg)}
            await asyncio.sleep(0.8)
        yield {"event": "done", "data": json.dumps({"status": "complete"})}
    return EventSourceResponse(event_generator())
```

### 10.3 与 EnvelopeRoute 兼容性

SSE 端点返回 `text/event-stream`，非 `application/json`。`EnvelopeRoute` 自动检测：非 JSON 响应直接透传，不会被包装成 `{ code, message, data }`。

### 10.4 认证 SSE

EventSource API 不支持自定义 Header，Token 通过 URL 参数传递：

```javascript
const eventSource = new EventSource(
  `http://localhost:8080/api/sse/chat/protected?token=${token}`
);
```

后端 `get_current_user` 同时读取 `Authorization: Bearer` Header 和 `token` 查询参数，优先使用 Header。

---

## 十一、错误码体系

| code | 含义 | 触发场景 |
|------|------|---------|
| 0 | 成功 | 正常响应 |
| -1001 | 参数校验失败 | Pydantic 校验不通过 |
| -1002 | 认证失败 | 未登录 / Token 无效 / 密码错误 |
| -1003 | 无权限 | 已登录但无操作权限 |
| -1004 | 资源不存在 | 用户/数据未找到 |
| -1005 | 资源冲突 | 用户名已存在 / 重复提交 |
| -1006 | 请求过于频繁 | 限流触发（预留） |
| -1031 | 请求体过大 | 上传文件超过 `UPLOAD_MAX_SIZE` 限制 |
| -1032 | 不支持的文件类型 | 上传文件 MIME 不在白名单 |
| -2000 | 系统异常 | 未预期的内部错误 |

> 错误码与 `backend-convention-skill/references/response-format.md` 保持一致，前端 `frontend-request-skill` 的 `ERROR_CODE_MAP` 可直接复用。

---

## 十二、强制交付物

与 `backend-convention-skill` 一致，生成项目时必须同时落地两份文档：

| 文档 | 位置 | 说明 |
|------|------|------|
| 项目指南 | `docs/project-guide.md` | 栈特定内容（FastAPI/SQLAlchemy/SSE/Upload）、目录结构、启动方式、模块开发步骤 |
| 接口契约 | `api-contract.md` | 含 health / auth / users / sse / upload 全量接口定义 |

---

## 十三、引用技能

| 被引用技能 | 引用内容 |
|-----------|---------|
| `backend-convention-skill` | 响应信封 `{ code, message, data }`、错误码体系、JWT 规范、api-contract 模板、project-guide 模板 |
| `database-skill` | MySQL/PostgreSQL/MongoDB 选型规则、表前缀 `wg`、连接参数、Alembic 迁移规则 |
| `frontend-request-skill` | 前端请求层规范、响应信封解析、错误码映射、Token/SSE/上传对接方式 |

---

## 十四、与前端联动

本 skill 生成的后端与 `frontend-request-skill` 通过 `api-contract.md` 联动：

- 后端统一返回 `{ code, message, data }`
- 前端 `request.ts` 按相同结构解析
- `ERROR_CODE_MAP` 直接复用后端契约中的错误码表
- SSE、文件上传接口也纳入契约，避免前后端约定不一致

详见 `references/frontend-integration.md`。

---

## 十五、红线（不可绕过）

1. **不做 python-backend-skill 已做的事**：不重复生成同样的骨架代码，本 skill 生成的是更完整、更小白友好的版本。
2. **不硬编码版本号**：Python / FastAPI / 依赖版本一律现场查询官方源最新稳定版。
3. **不跳过环境探测**：生成前必须先检查用户环境，无法安装则给出明确提示。
4. **不替用户运行数据库**：只生成 docker-compose 配置，告知用户如何启动。
5. **不替用户提交 git**。
6. **生产默认值必须安全**：Dockerfile 非 root 运行、安全头强制开启、`.env.example` 对 `JWT_SECRET` / `CORS` / `APP_DEBUG` 有醒目警告。
7. **所有注释、文档用中文**：目标用户是中文小白，不要英文注释。
8. **接口契约必须和 frontend-request-skill 对齐**：响应信封、错误码、字段命名前后端一致。

---

## 十五、后续扩展方向

| 方向 | 说明 | 优先级 |
|------|------|--------|
| 密码复杂度校验 | Pydantic validator 强制要求大小写+数字+特殊字符 | 🟡 |
| 速率限制（Rate Limiting） | 基于 Redis 的限流中间件 | 🟡 |
| 操作审计日志 | 登录/登出/密码修改等安全事件记录 | 🟡 |
| TLS/HTTPS 配置 | Nginx / Traefik 反向代理模板 | 🟡 |
| K8s 部署模板 | Deployment + Service + ConfigMap YAML | 🟢 |
| Prometheus 指标 | `prometheus-fastapi-instrumentator` 暴露 /metrics | 🟢 |
| Sentry 异常上报 | 生产环境自动上报未捕获异常 | 🟢 |

---

*文档版本：v2.0（2026-08-13）*
