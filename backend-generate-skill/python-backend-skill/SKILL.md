---
name: python-backend-skill
description: Use when the user wants to generate a Python + FastAPI backend project, or when routed from backend-select-skill with Python chosen. Generates a runnable scaffold on the spot following backend-convention-skill. MongoDB is generated only for this stack and Node.js. Triggers: "用 Python 写后端", "FastAPI 项目", "生成 FastAPI", "python backend", "fastapi 骨架".
---

# Python Backend Skill

现场生成 FastAPI 后端项目骨架。

**依赖**：backend-convention-skill（规范）、database-skill（DB）。本 skill 只写 FastAPI 特定骨架与片段，规则文本不复制。

## 版本获取（不写死）

优先级：本机已装版本 → 官方最新稳定/LTS → 用户可覆盖 → 写入 `versions.md`。

- Python：`python --version`；否则 `https://python.org/downloads` 或 `https://endoflife.date/api/python.json`。
- 依赖：`curl https://pypi.org/pypi/<pkg>/json | jq .info.version`（fastapi、uvicorn、pydantic、pydantic-settings、sqlalchemy、psycopg2-binary、pymysql、alembic、motor、python-jose、passlib、python-dotenv 等）。

**禁止**：在 SKILL.md 写"Python 3.11 / FastAPI 0.109"等具体数字。

## 生成步骤

1. 从 `spec.md` 读项目名、数据库、表前缀（默认 `wg`）。
2. 按 `references/skeleton.md` 的目录结构建文件。
3. 用下面最小片段生成关键文件，AI 扩写完整。
4. **落地两份强制交付物**（见下节），缺一不可。

## 强制交付物（文档）

生成项目时必须与代码**同时落地**两份文档，漏交视为生成未完成：

| 文档 | 位置 | 生成依据 |
|------|------|----------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 按 backend-convention-skill `references/project-guide-template.md`，栈特定段按本 skill `references/skeleton.md` 末尾「project-guide 填充段」填 |
| 接口契约（接口 md） | 项目根目录 `api-contract.md` | 以 backend-convention-skill `references/default-api-contract.md` 为起点（已含 health/auth/users 全量接口），按 `api-contract-spec.md` 模板追加业务实体接口 |

要求：
- `project-guide.md` 第 4~10 节（接口范式/入参/出参/拦截器链路/鉴权/对接前端/错误码）不得省略，这是前端对接的最低信息量。
- `api-contract.md` 必须覆盖骨架自带接口 + 确认的全部业务实体接口，每个接口按模板写全。
- 两份文档字段细节不重复：范式进 guide，字段进 contract。

## 关键文件最小片段

### 入口 main.py（lifespan）

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.exceptions import BusinessException
from app.routers import auth, health, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title=settings.app_name, lifespan=lifespan)

# CORS 策略见 backend-convention-skill env-config-guide.md（禁 *+凭证同开）
_cors_origins = [o.strip() for o in settings.cors_origins.split(",")]
_allow_all = _cors_origins == ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all else _cors_origins,
    allow_credentials=not _allow_all,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-Id"],
    expose_headers=["X-Request-Id"],
)

@app.exception_handler(BusinessException)
async def business_exception_handler(_, exc: BusinessException):
    return JSONResponse(status_code=200, content={"code": exc.code, "message": exc.message, "data": None})

# Pydantic 校验失败必须转 -1001；不单独接就会被 Exception 兜底成 -2000，违反规范
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    loc = ".".join(str(x) for x in first.get("loc", []) if x != "body")
    msg = f"{loc} {first.get('msg', '')}".strip() or "参数校验错误"
    return JSONResponse(status_code=200, content={"code": -1001, "message": msg, "data": None})

@app.exception_handler(Exception)
async def global_exception_handler(_, exc: Exception):
    return JSONResponse(status_code=200, content={"code": -2000, "message": "系统繁忙，请稍后再试", "data": None})

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
```

### 统一响应

handler 只返裸数据，由 `EnvelopeRoute`（唯一包装点，见 `references/skeleton.md`）统一加信封；`api_response` 仅供 `exception_handler` 兜底，handler 禁止调用。

```python
from typing import Any

def api_response(data: Any = None, code: int = 0, message: str = "success") -> dict:
    """仅供 exception_handler 构造信封；handler 不得调用。"""
    return {"code": code, "message": message, "data": data}
```

### 业务异常

```python
class BusinessException(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
```

### 健康检查

```python
from fastapi import APIRouter
from app.response import EnvelopeRoute

router = APIRouter(route_class=EnvelopeRoute)

@router.get("/health")
def health():
    return {"status": "ok"}
```

## 标准能力清单

生成项目必须内置以下能力，完整片段见 `references/skeleton.md` 的"开箱即用片段"节：

| 能力 | 关键文件 |
|------|----------|
| 统一响应 `{ code, message, data }` | `app/response.py` 的 `EnvelopeRoute`（handler 返裸数据，自动加信封） |
| 全局异常（-1001 / -2000） | `app/exceptions.py` + `app/main.py` 的 exception_handler |
| JWT 签发 / 验证 / 当前用户注入 | `app/utils/security.py` + `app/dependencies.py` |
| 请求日志（requestId / method / path / status / duration） | `app/main.py` 的 `request_log_middleware` |
| 参数校验 | Pydantic schema，失败转 `-1001` |
| 分页列表 `{ page, pageSize, total, list }` | `app/routers/users.py` 的 `list_users` |
| CORS | `app/main.py` 的 `CORSMiddleware` |
| 密码 bcrypt hash | `passlib` |
| 健康检查 `/api/health` | `app/routers/health.py` |
| Docker / docker-compose | `Dockerfile` + `docker-compose.yml` |
| 介绍 & 拓展性文档 | `docs/project-guide.md`（强制交付物，见上节） |
| api-contract.md（接口 md） | 项目根目录，以 convention `default-api-contract.md` 为起点按 `api-contract-spec.md` 补全 |

## 验证

```bash
pip install -r requirements.txt
python -m compileall app
uvicorn app.main:app --host 0.0.0.0 --port 8080
curl http://localhost:8080/api/health
```

预期：`{ "code": 0, "message": "success", "data": { "status": "ok" } }`

## 不做

- 不加未请求的中间件。
- 不在 SKILL.md 锁定版本号。
- 不替用户提交。
