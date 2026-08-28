# Python + FastAPI 骨架

生成 FastAPI 项目时按本骨架现场写代码。版本号一律不写，由 SKILL.md 的版本获取策略动态决定。

## 依赖（pyproject.toml / requirements.txt）

关系型：
- `fastapi`、`uvicorn[standard]`
- `pydantic`、`pydantic-settings`
- `sqlalchemy`、`psycopg2-binary`、`pymysql`
- `alembic`（迁移）
- `python-dotenv`、`passlib`、`python-jose`

MongoDB 变体（替换 SQLAlchemy）：
- `motor`（异步 MongoDB 驱动）

## 目录结构

```
{{project}}/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI 入口（lifespan、注册路由/异常）
│   ├── config.py          # Pydantic Settings
│   ├── database.py        # SQLAlchemy 引擎 / Motor client
│   ├── response.py        # 统一响应封装
│   ├── exceptions.py      # BusinessException + handler
│   ├── routers/           # API 路由
│   │   ├── health.py
│   │   ├── auth.py
│   │   └── users.py
│   ├── models/            # SQLAlchemy / Pydantic 文档模型
│   ├── schemas/           # Pydantic 输入/输出
│   ├── services/          # 业务逻辑
│   └── utils/             # 工具（security 等）
├── alembic/               # 迁移（关系型，生产）
├── tests/
├── .env.example
├── .gitignore
├── docker-compose.yml     # PostgreSQL 默认
├── docker-compose.mysql.yml
├── Dockerfile
├── pyproject.toml
├── requirements.txt
├── README.md
├── api-contract.md
└── versions.md
```

## 关键文件清单

| 文件 | 责任 |
|------|------|
| `app/main.py` | FastAPI 实例，lifespan 中建表，注册路由与异常处理器 |
| `app/config.py` | `BaseSettings`，`env_file=".env"` |
| `app/database.py` | SQLAlchemy `engine` + `SessionLocal`，或 MongoDB Motor client |
| `app/response.py` | `EnvelopeRoute`（唯一包装点，handler 返裸数据）+ `api_response`（仅 `exception_handler` 兜底） |
| `app/exceptions.py` | `BusinessException` + `@app.exception_handler` 转信封 |
| `app/models/user.py` | User 模型 |
| `app/schemas/user.py` | Pydantic 输入/输出 |
| `app/routers/users.py` / `auth.py` / `health.py` | 路由 |

## config.py 模板

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    app_name: str = "{{project}}"
    app_port: int = 8080
    db_type: str = "postgresql"      # postgres/mysql/mongodb
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "app_db"
    db_user: str = "postgres"
    db_password: str = "postgres"
    db_prefix: str = "wg"
    db_url: str | None = None        # mongodb://... 或显式覆盖
    cors_origins: str = "*"          # 逗号分隔；* 仅开发
    jwt_secret: str = "change-me"    # 环境变量 JWT_SECRET，生产必换
    jwt_expires_in: int = 86400      # 秒，环境变量 JWT_EXPIRES_IN

settings = Settings()
```

## 开箱即用片段

### JWT 工具

```python
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

class JWTUtil:
    def __init__(self, secret: str, expires_in: int):
        self.secret = secret
        self.expires_in = expires_in  # 秒
        self.algorithm = "HS256"

    def generate(self, user_id: int, username: str) -> str:
        payload = {
            "sub": str(user_id),
            "username": username,
            "exp": datetime.now(timezone.utc) + timedelta(seconds=self.expires_in),
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def parse(self, token: str) -> dict:
        return jwt.decode(token, self.secret, algorithms=[self.algorithm])


@lru_cache
def get_jwt() -> JWTUtil:
    """JWTUtil 单例工厂：从 settings 读取密钥/过期时间，供 Depends(get_jwt) 注入。"""
    return JWTUtil(settings.jwt_secret, settings.jwt_expires_in)
```

### 当前用户依赖

```python
from app.exceptions import BusinessException

def get_current_user(token: str = Depends(oauth2_scheme), jwt: JWTUtil = Depends(get_jwt)) -> dict:
    if not token:
        raise BusinessException(-1002, "未登录")
    try:
        return jwt.parse(token)
    except JWTError:
        raise BusinessException(-1002, "Token 无效或已过期")
```

### 请求日志中间件

用 `logging` 而非 `print`（生产可接管级别与输出）：

```python
import logging
import time
import uuid
from fastapi import Request

logger = logging.getLogger("request")

@app.middleware("http")
async def request_log_middleware(request: Request, call_next):
    request_id = uuid.uuid4().hex[:16]
    request.state.request_id = request_id
    start = time.time()
    response = await call_next(request)
    duration = int((time.time() - start) * 1000)
    logger.info("[%s] %s %s %s %dms", request_id, request.method, request.url.path, response.status_code, duration)
    response.headers["X-Request-Id"] = request_id
    return response
```

### 统一响应（唯一包装点）

handler 一律返回裸数据，由自定义 `APIRoute` 统一加信封；异常由 `exception_handler` 直接产出已信封响应（异常向上抛出，不走本路由成功分支，故不会双包）。`api_response` 仅保留给 `exception_handler` 兜底，handler 禁止调用。

```python
import json
from fastapi import Request, Response
from fastapi.routing import APIRoute
from fastapi.responses import JSONResponse


class EnvelopeRoute(APIRoute):
    def get_route_handler(self):
        original = super().get_route_handler()

        async def custom_handler(request: Request) -> Response:
            response = await original(request)  # 抛异常则直达 exception_handler，不进下方包装
            if response.status_code != 200:
                return response
            # 文件下载/流式等非 JSON 响应直接透传，不包信封
            if "application/json" not in response.headers.get("content-type", ""):
                return response
            data = json.loads(response.body)
            return JSONResponse({"code": 0, "message": "success", "data": data}, status_code=200)

        return custom_handler
```

路由注册：每个 router 声明 `router = APIRouter(route_class=EnvelopeRoute)`；`api_response` 保留在 `app/response.py`，仅供 `exception_handler` 使用。

### 分页列表

```python
from fastapi import Query

@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    # 查询参数名必须与契约一致为 pageSize；Python 变量名保持 snake_case，靠 alias 对齐
    page_size: int = Query(20, ge=1, le=100, alias="pageSize"),
    db: Session = Depends(get_db),
):
    total = db.query(User).count()
    users = db.query(User).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "page": page,
        "pageSize": page_size,
        "total": total,
        "list": [UserResponse.model_validate(u) for u in users],
    }
```

## 关键约定

- 表名：`{DB_PREFIX}_user`，snake_case。
- 路由前缀：`/api`；健康检查 `GET /api/health` 返回信封。
- 校验：Pydantic schema，失败由 `RequestValidationError` handler 转 `-1001`。
- MongoDB：选 MongoDB 时用 `motor` 模型层（替换 SQLAlchemy），`DB_URL=mongodb://...`。
- **Python / Node 是唯一自动生成 MongoDB 的两个栈**。

## project-guide 填充段

生成 `docs/project-guide.md` 时，按 backend-convention-skill `references/project-guide-template.md` 的占位符填入以下本栈内容：

| 占位符 | 本栈填充值 |
|--------|-----------|
| `{{STACK}}` | Python + FastAPI + SQLAlchemy（MongoDB 时为 Motor） |
| `{{START_COMMAND}}` | `uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload` |
| `{{DIRECTORY_TREE}}` | 上文「目录结构」节 |
| `{{LAYER_RESPONSIBILITY}}` | routers 接请求返裸数据；services 业务逻辑；models 表/文档映射；schemas 出入参校验（Pydantic）；utils 工具；main 注册中间件/异常/路由 |
| `{{MIDDLEWARE_CHAIN}}` | `request_log_middleware 日志 → CORSMiddleware → 路由匹配 → get_current_user 鉴权依赖 → Pydantic 校验 → Service 业务 → EnvelopeRoute 信封包装 → exception_handler 异常兜底` |
| `{{VALIDATION_WAY}}` | 请求体/查询参数用 Pydantic schema 与类型注解，失败由 `RequestValidationError` handler 转 `-1001`（查询参数 camelCase 用 alias 对齐契约） |
| `{{ENVELOPE_WAY}}` | `EnvelopeRoute` 为唯一包装点，handler 返裸数据；`api_response` 仅供 exception_handler 兜底，handler 禁止调用；非 JSON 响应（文件下载）自动透传 |
| `{{MODULE_STEPS}}` | ① 更新 `api-contract.md` → ② `app/models/post.py` → ③ `app/schemas/post.py` → ④ `app/services/post.py` → ⑤ `app/routers/posts.py`（`APIRouter(route_class=EnvelopeRoute)`）→ ⑥ `main.py` 中 `include_router` → ⑦ `alembic revision --autogenerate -m "add posts"` → ⑧ `python -m compileall app` + curl 验证 |
| `{{MIDDLEWARE_STEPS}}` | 横切逻辑用 `@app.middleware("http")`（注意后注册的最外层）；鉴权/权限类优先用 `Depends` 依赖注入而非 middleware |
| `{{MIGRATION_WAY}}` | Alembic：`alembic revision --autogenerate -m "{desc}"` → `alembic upgrade head`；生产禁用 `create_all` |
| `{{EXTRA_MIDDLEWARE_WAY}}` | 按需接 Redis/Kafka，连接信息只从环境变量读，命名见 backend-convention-skill `env-config-guide.md` |
