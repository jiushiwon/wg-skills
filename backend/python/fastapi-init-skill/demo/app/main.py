import logging
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.exceptions import BusinessException
from app.routers import health, sse, upload
if settings.db_type not in ("none", "mongodb"):
    from app.routers import auth, users

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.db_type not in ("mongodb", "none"):
        from app.database import engine, Base
        # ⚠️ 开发阶段自动建表；生产环境请使用 Alembic 迁移，禁用 create_all
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    elif settings.db_type == "mongodb":
        from app.database import connect_db
        await connect_db()
    # db_type == "none": 跳过数据库初始化
    logger.info("服务启动完成，端口 %s", settings.app_port)
    if settings.jwt_secret == "change-me-in-production":
        logger.warning("⚠️ JWT_SECRET 为默认值！请编辑 .env 将其改为随机字符串！")
    yield
    if settings.db_type not in ("mongodb", "none"):
        from app.database import engine
        await engine.dispose()
    elif settings.db_type == "mongodb":
        from app.database import close_db
        await close_db()
    logger.info("服务已关闭")


app = FastAPI(
    title=settings.app_name,
    description="FastAPI 开箱即用服务 — 支持 SSE 流式 / JWT 鉴权 / 统一响应",
    version="0.1.0",
    lifespan=lifespan,
    # ⚠️ 生产环境建议关闭 Swagger 文档，防止暴露 API 结构
    # docs_url=None,
    # redoc_url=None,
    docs_url="/docs",
    redoc_url="/redoc",
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=settings.app_name,
        version="0.1.0",
        description="## 快速开始\n\n1. 注册账号: `POST /api/auth/register`\n2. 登录获取 Token: `POST /api/auth/login`\n3. 在右上角 **Authorize** 填入 Token\n4. 开始调用其他接口\n\n## SSE 流式\n\n`GET /api/sse/chat` 演示服务端推送\n\n## 文件上传\n\n`POST /api/upload` 单文件，`POST /api/uploads` 多文件",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

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


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """安全头中间件：为所有响应添加基础安全头，防御常见 Web 攻击。"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# 包含敏感信息的 URL 路径关键词，日志中需要过滤或标记
_SENSITIVE_PATHS = ("password", "token", "secret", "auth", "login", "register")


@app.middleware("http")
async def request_log_middleware(request: Request, call_next):
    request_id = uuid.uuid4().hex[:16]
    request.state.request_id = request_id
    start = time.time()
    response = await call_next(request)
    duration = int((time.time() - start) * 1000)

    path = request.url.path
    # 若 URL 包含敏感关键词，只记录路径前缀，不记录查询参数
    if any(k in path.lower() for k in _SENSITIVE_PATHS):
        logger.info("[%s] %s <敏感路径> %s %dms [已过滤详细路径]", request_id, request.method, response.status_code, duration)
    else:
        logger.info("[%s] %s %s %s %dms", request_id, request.method, path, response.status_code, duration)

    response.headers["X-Request-Id"] = request_id
    return response


@app.exception_handler(BusinessException)
async def business_exception_handler(_, exc: BusinessException):
    return JSONResponse(status_code=200, content={"code": exc.code, "message": exc.message, "data": None})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    loc = ".".join(str(x) for x in first.get("loc", []) if x != "body")
    msg = f"{loc} {first.get('msg', '')}".strip() or "参数校验错误"
    return JSONResponse(status_code=200, content={"code": -1001, "message": msg, "data": None})


@app.exception_handler(Exception)
async def global_exception_handler(_, exc: Exception):
    logger.exception("未捕获的异常")
    return JSONResponse(status_code=200, content={"code": -2000, "message": "系统繁忙，请稍后再试", "data": None})


from pathlib import Path

# 上传目录必须在 StaticFiles 挂载前存在
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

app.include_router(health.router, prefix="/api", tags=["健康检查"])
if settings.db_type not in ("none", "mongodb"):
    app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
    app.include_router(users.router, prefix="/api", tags=["用户管理"])
app.include_router(upload.router, prefix="/api", tags=["文件上传"])
app.include_router(sse.router, prefix="/api/sse", tags=["SSE 流式"])

# 上传文件静态访问
app.mount("/static/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")