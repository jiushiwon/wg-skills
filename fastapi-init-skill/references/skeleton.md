# FastAPI 项目完整骨架

生成 FastAPI 项目时按本骨架现场写代码。版本号一律不写，由 SKILL.md 的版本获取策略动态决定。

## 目录结构

```
{{project}}/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 入口：lifespan、CORS、异常、中间件、路由注册
│   ├── config.py            # Pydantic Settings：从 .env 读取全部配置
│   ├── database.py          # 数据库引擎：SQLAlchemy async
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
│   │   └── user.py          # User 表模型
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py          # Pydantic 入参/出参
│   │   └── upload.py        # 上传请求/响应模型
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user.py          # 用户业务逻辑
│   │   └── upload.py        # 文件保存策略与校验
│   └── utils/
│       ├── __init__.py
│       └── security.py      # JWT 签发/验证 + bcrypt 哈希
├── docs/
│   └── project-guide.md     # 项目指南（强制交付物）
├── setup.sh                 # 一键环境搭建脚本（Linux/macOS）
├── setup.bat                # 一键环境搭建脚本（Windows）
├── dev.sh                   # 开发模式热重载（Linux/macOS）
├── dev.bat                  # 开发模式热重载（Windows）
├── start.sh                 # 生产模式启动（Linux/macOS）
├── start.bat                # 生产模式启动（Windows）
├── restart.sh               # 一键重启（Linux/macOS）
├── restart.bat              # 一键重启（Windows）
├── requirements.txt         # Python 依赖清单
├── .env.example             # 环境变量模板
├── .gitignore               # Git 忽略规则
├── api-contract.md          # 接口契约（强制交付物）
└── README.md                # 项目说明
```

## 依赖清单（requirements.txt）

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
email-validator
httpx
```

## 关键文件模板

### app/__init__.py

```python
```

### app/main.py

```python
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
from app.routers import health, auth, users, sse, upload

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
if settings.db_type != "none":
    app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
    app.include_router(users.router, prefix="/api", tags=["用户管理"])
app.include_router(upload.router, prefix="/api", tags=["文件上传"])
app.include_router(sse.router, prefix="/api/sse", tags=["SSE 流式"])

# 上传文件静态访问
app.mount("/static/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
```

### app/config.py

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "{{project}}"
    app_port: int = 8080
    app_debug: bool = True  # ⚠️ 生产环境必须设为 false，防止泄漏堆栈跟踪等敏感信息

    db_type: str = "mysql"  # mysql / postgresql / mongodb / none
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "app_db"
    db_user: str = "root"
    # 🔴 生产环境务必修改为强密码！
    db_password: str = "root"
    db_prefix: str = "wg"
    db_url: str | None = None

    cors_origins: str = "*"
    jwt_secret: str = "change-me-in-production"
    jwt_expires_in: int = 86400
    jwt_refresh_expires_in: int = 604800

    bcrypt_rounds: int = 12

    sse_retry_timeout: int = 3000

    upload_dir: str = "uploads"
    upload_max_size: int = 10
    upload_allowed_types: str = "image/jpeg,image/png,image/gif,application/pdf"

    @property
    def database_url(self) -> str:
        if self.db_url:
            return self.db_url
        if self.db_type == "mysql":
            return f"mysql+aiomysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        if self.db_type == "postgresql":
            return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        if self.db_type == "mongodb":
            return f"mongodb://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        return ""


settings = Settings()
```

### app/database.py

```python
from app.config import settings

if settings.db_type == "mongodb":
    from motor.motor_asyncio import AsyncIOMotorClient

    _mongo_client: AsyncIOMotorClient | None = None

    async def connect_db():
        global _mongo_client
        _mongo_client = AsyncIOMotorClient(settings.database_url)

    async def close_db():
        global _mongo_client
        if _mongo_client:
            _mongo_client.close()

    async def get_db():
        if _mongo_client is None:
            await connect_db()
        return _mongo_client[settings.db_name]


elif settings.db_type == "none":
    class DummyDB:
        async def execute(self, *args, **kwargs):
            return None

        async def command(self, *args, **kwargs):
            return None

    async def get_db():
        return DummyDB()


else:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from sqlalchemy.orm import DeclarativeBase

    engine = create_async_engine(
        settings.database_url,
        echo=settings.app_debug,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,      # 1 小时后回收连接，防止数据库端连接失效
        pool_pre_ping=True,     # 连接前发送 ping，自动重连失效连接
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

### app/response.py

```python
import json
from fastapi import Request, Response
from fastapi.routing import APIRoute
from fastapi.responses import JSONResponse, StreamingResponse


class EnvelopeRoute(APIRoute):
    """统一响应信封路由。

    handler 返回 dict/Pydantic 模型 → 自动包装为 { code: 0, message: "success", data: ... }
    StreamingResponse（SSE、文件下载等）直接透传，不包信封。
    """

    def get_route_handler(self):
        original = super().get_route_handler()

        async def custom_handler(request: Request) -> Response:
            response = await original(request)
            # ponytail: 只包装明确的 JSONResponse，流式/文件响应一律透传
            if isinstance(response, StreamingResponse):
                return response
            if not isinstance(response, JSONResponse):
                return response
            body = response.body
            if body is None:
                return JSONResponse({"code": 0, "message": "success", "data": None}, status_code=200)
            # FastAPI JSONResponse body 是 bytes
            data = body.decode("utf-8") if isinstance(body, bytes) else body
            if isinstance(data, str):
                data = json.loads(data)
            return JSONResponse({"code": 0, "message": "success", "data": data}, status_code=200)

        return custom_handler


def api_response(data=None, code=0, message="success"):
    """仅供 exception_handler 构造信封；handler 禁止调用。"""
    return {"code": code, "message": message, "data": data}
```

### app/exceptions.py

```python
class BusinessException(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
```

### app/dependencies.py

```python
from functools import lru_cache
from fastapi import Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.config import settings
from app.exceptions import BusinessException
from app.utils.security import JWTUtil

security = HTTPBearer(auto_error=False)


@lru_cache()
def get_jwt() -> JWTUtil:
    return JWTUtil(settings.jwt_secret, settings.jwt_expires_in, settings.jwt_refresh_expires_in)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    token: str | None = Query(None, description="SSE 等无法设置 Header 的场景通过 URL 参数传递"),
    jwt: JWTUtil = Depends(get_jwt),
) -> dict:
    raw_token = credentials.credentials if credentials else token
    if not raw_token:
        raise BusinessException(-1002, "未登录，请先获取 Token")
    try:
        payload = jwt.parse(raw_token)
        return {"user_id": int(payload["sub"]), "username": payload["username"]}
    except JWTError:
        raise BusinessException(-1002, "Token 无效或已过期")
```

### app/utils/__init__.py

```python
```

### app/utils/security.py

```python
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class JWTUtil:
    def __init__(self, secret: str, expires_in: int, refresh_expires_in: int):
        self.secret = secret
        self.expires_in = expires_in
        self.refresh_expires_in = refresh_expires_in
        self.algorithm = "HS256"

    def generate(self, user_id: int, username: str) -> str:
        payload = {
            "sub": str(user_id),
            "username": username,
            "exp": datetime.now(timezone.utc) + timedelta(seconds=self.expires_in),
            "type": "access",
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def generate_refresh(self, user_id: int, username: str) -> str:
        payload = {
            "sub": str(user_id),
            "username": username,
            "exp": datetime.now(timezone.utc) + timedelta(seconds=self.refresh_expires_in),
            "type": "refresh",
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def parse(self, token: str) -> dict:
        return jwt.decode(token, self.secret, algorithms=[self.algorithm])


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### app/models/__init__.py

```python
from app.config import settings

if settings.db_type not in ("mongodb", "none"):
    from app.database import Base
    from app.models.user import User

    __all__ = ["Base", "User"]
else:
    __all__ = []
```

### app/models/user.py

```python
from datetime import datetime
from sqlalchemy import String, DateTime, func, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.config import settings


class User(Base):
    __tablename__ = f"{settings.db_prefix}_user"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str | None] = mapped_column(String(128), default=None)
    phone: Mapped[str | None] = mapped_column(String(20), default=None)
    nickname: Mapped[str | None] = mapped_column(String(64), default=None)
    avatar: Mapped[str | None] = mapped_column(Text, default=None)
    is_active: Mapped[bool] = mapped_column(default=True)
    refresh_token: Mapped[str | None] = mapped_column(String(512), default=None)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
```

### app/schemas/__init__.py

```python
```

### app/schemas/user.py

```python
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64, description="用户名")
    # 🔴 生产环境建议将 min_length 提高到 8 并增加复杂度校验（大小写+数字+特殊字符）
    password: str = Field(..., min_length=8, max_length=128, description="密码")
    email: EmailStr | None = Field(default=None, max_length=128, description="邮箱")
    phone: str | None = Field(default=None, max_length=20, description="手机号")


class LoginRequest(BaseModel):
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="刷新令牌")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="访问令牌")
    refresh_token: str = Field(..., description="刷新令牌")
    token_type: str = Field(default="bearer", description="令牌类型")


class UserResponse(BaseModel):
    id: int
    username: str
    email: str | None = None
    phone: str | None = None
    nickname: str | None = None
    avatar: str | None = None
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    email: str | None = Field(default=None, description="邮箱")
    phone: str | None = Field(default=None, description="手机号")
    nickname: str | None = Field(default=None, min_length=1, max_length=64, description="昵称")
    avatar: str | None = Field(default=None, description="头像URL")


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(..., min_length=6, max_length=128, description="新密码")


class PaginatedResponse(BaseModel):
    page: int
    page_size: int = Field(..., alias="pageSize", serialization_alias="pageSize")
    total: int
    list: list[UserResponse]
```

### app/schemas/upload.py

```python
from pydantic import BaseModel, Field


class UploadFileResponse(BaseModel):
    url: str = Field(..., description="文件访问 URL")
    filename: str = Field(..., description="原始文件名")
    size: int = Field(..., description="文件大小（字节）")
    mime_type: str = Field(..., alias="mimeType", serialization_alias="mimeType", description="文件 MIME 类型")


class UploadBatchResponse(BaseModel):
    list: list[UploadFileResponse]
    total: int = Field(..., description="上传成功文件数")
```

### app/services/__init__.py

```python
```

### app/services/user.py

```python
from app.exceptions import BusinessException
from app.models.user import User
from app.utils.security import hash_password, verify_password


class UserService:

    @staticmethod
    async def create_user(db, username: str, password: str, email: str | None = None, phone: str | None = None) -> User:
        existing = await UserService._find_by_username(db, username)
        if existing:
            raise BusinessException(-1005, "用户名已存在")
        user = User(
            username=username,
            password=hash_password(password),
            email=email,
            phone=phone,
        )
        db.add(user)
        try:
            await db.flush()
        except Exception:
            await db.rollback()
            raise BusinessException(-1005, "用户名已存在")
        return user

    @staticmethod
    async def authenticate(db, username: str, password: str) -> User:
        user = await UserService._find_by_username(db, username)
        if not user or not verify_password(password, user.password):
            raise BusinessException(-1002, "用户名或密码错误")
        if not user.is_active:
            raise BusinessException(-1002, "用户名或密码错误")
        return user

    @staticmethod
    async def _find_by_username(db, username: str) -> User | None:
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()
```

### app/services/upload.py

```python
import mimetypes
import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import settings
from app.exceptions import BusinessException


class UploadService:
    """文件上传服务：负责保存策略、类型校验、大小限制、访问 URL 生成。"""

    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.max_size = settings.upload_max_size * 1024 * 1024
        self.allowed_types = {t.strip().lower() for t in settings.upload_allowed_types.split(",") if t.strip()}

    async def save(self, file: UploadFile) -> dict:
        content_type = (file.content_type or "application/octet-stream").lower()
        if self.allowed_types and content_type not in self.allowed_types:
            raise BusinessException(-1032, f"不允许上传该文件类型: {content_type}")

        ext = Path(file.filename or "unknown").suffix.lower()
        if not ext:
            ext = mimetypes.guess_extension(content_type) or ".bin"
        unique_name = f"{uuid.uuid4().hex}{ext}"

        self.upload_dir.mkdir(parents=True, exist_ok=True)
        target = self.upload_dir / unique_name

        size = 0
        with target.open("wb") as f:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > self.max_size:
                    target.unlink(missing_ok=True)
                    raise BusinessException(-1031, f"文件大小超过限制 {settings.upload_max_size}MB")
                f.write(chunk)

        return {
            "url": f"/static/uploads/{unique_name}",
            "filename": file.filename or unique_name,
            "size": size,
            "mimeType": content_type,
        }

    async def save_batch(self, files: list[UploadFile]) -> dict:
        results = []
        for file in files:
            results.append(await self.save(file))
        return {"list": results, "total": len(results)}
```

### app/routers/health.py

```python
from fastapi import APIRouter, Depends
from app.response import EnvelopeRoute
from app.dependencies import get_db

router = APIRouter(route_class=EnvelopeRoute)


@router.get("/health")
async def health():
    return {"status": "ok", "service": "fastapi-init"}


@router.get("/health/db")
async def health_db(db=Depends(get_db)):
    try:
        if hasattr(db, "execute"):
            await db.execute("SELECT 1")
        elif hasattr(db, "command"):
            await db.command("ping")
        else:
            return {"status": "ok", "database": "none"}
        return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "ok", "database": "disconnected"}
```

### app/routers/auth.py

```python
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials

from app.response import EnvelopeRoute
from app.dependencies import get_db, get_current_user, get_jwt, security
from app.schemas.user import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserResponse
from app.services.user import UserService
from app.models.user import User
from app.exceptions import BusinessException
from app.utils.security import JWTUtil

router = APIRouter(route_class=EnvelopeRoute)


@router.post("/register", summary="注册新用户")
async def register(body: RegisterRequest, db=Depends(get_db), jwt: JWTUtil = Depends(get_jwt)):
    user = await UserService.create_user(db, body.username, body.password, body.email, body.phone)
    access_token = jwt.generate(user.id, user.username)
    refresh_token = jwt.generate_refresh(user.id, user.username)
    user.refresh_token = refresh_token
    await db.flush()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", summary="用户登录")
async def login(body: LoginRequest, db=Depends(get_db), jwt: JWTUtil = Depends(get_jwt)):
    user = await UserService.authenticate(db, body.username, body.password)
    access_token = jwt.generate(user.id, user.username)
    refresh_token = jwt.generate_refresh(user.id, user.username)
    user.refresh_token = refresh_token
    user.last_login_at = datetime.now(timezone.utc)
    await db.flush()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", summary="刷新令牌")
async def refresh(body: RefreshRequest, db=Depends(get_db), jwt: JWTUtil = Depends(get_jwt)):
    from sqlalchemy import select
    try:
        payload = jwt.parse(body.refresh_token)
        if payload.get("type") != "refresh":
            raise BusinessException(-1002, "无效的刷新令牌")
    except Exception:
        raise BusinessException(-1002, "刷新令牌无效或已过期")

    result = await db.execute(select(User).where(User.id == int(payload["sub"])))
    user = result.scalar_one_or_none()
    if not user or user.refresh_token != body.refresh_token:
        raise BusinessException(-1002, "刷新令牌无效")

    access_token = jwt.generate(user.id, user.username)
    refresh_token = jwt.generate_refresh(user.id, user.username)
    user.refresh_token = refresh_token
    await db.flush()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", summary="登出")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    jwt: JWTUtil = Depends(get_jwt),
    db=Depends(get_db),
):
    from sqlalchemy import select
    try:
        payload = jwt.parse(credentials.credentials)
        result = await db.execute(select(User).where(User.id == int(payload["sub"])))
        user = result.scalar_one_or_none()
        if user:
            user.refresh_token = None
            await db.flush()
    except Exception:
        pass
    return {"message": "已登出"}


@router.get("/me", summary="当前用户信息")
async def me(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise BusinessException(-1004, "用户不存在")
    return UserResponse.model_validate(user)
```

### app/routers/users.py

```python
from fastapi import APIRouter, Depends, Query

from app.response import EnvelopeRoute
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateRequest, ChangePasswordRequest, PaginatedResponse
from app.exceptions import BusinessException
from app.utils.security import hash_password, verify_password

router = APIRouter(route_class=EnvelopeRoute)


@router.get("/users", summary="用户列表（分页）")
async def list_users(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, alias="pageSize", description="每页数量"),
    db=Depends(get_db),
    _=Depends(get_current_user),
):
    from sqlalchemy import select, func
    count_result = await db.execute(select(func.count(User.id)))
    total = count_result.scalar()
    result = await db.execute(
        select(User).order_by(User.id.desc()).offset((page - 1) * page_size).limit(page_size)
    )
    users = result.scalars().all()
    return PaginatedResponse(
        page=page,
        pageSize=page_size,
        total=total,
        list=[UserResponse.model_validate(u) for u in users],
    )


@router.get("/users/{user_id}", summary="用户详情")
async def get_user(user_id: int, db=Depends(get_db), _=Depends(get_current_user)):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise BusinessException(-1004, "用户不存在")
    return UserResponse.model_validate(user)


@router.put("/users/profile", summary="修改个人资料")
async def update_profile(
    body: UserUpdateRequest,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise BusinessException(-1004, "用户不存在")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.flush()
    return UserResponse.model_validate(user)


@router.put("/users/password", summary="修改密码")
async def change_password(
    body: ChangePasswordRequest,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise BusinessException(-1004, "用户不存在")
    if not verify_password(body.old_password, user.password):
        raise BusinessException(-1005, "旧密码不正确")
    user.password = hash_password(body.new_password)
    await db.flush()
    return {"message": "密码修改成功"}
```

### app/routers/sse.py

```python
import asyncio
import json
from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse

from app.response import EnvelopeRoute
from app.dependencies import get_current_user

router = APIRouter(route_class=EnvelopeRoute)


@router.get("/chat", summary="SSE 流式示例（无需登录）")
async def sse_chat():
    """SSE 流式推送示例——登录后可获取个性化消息。"""

    async def event_generator():
        messages = [
            {"role": "system", "content": "你好！我是 FastAPI 助理，支持 SSE 流式推送。"},
            {"role": "assistant", "content": "你正在体验 Server-Sent Events 实时流式传输。"},
            {"role": "assistant", "content": "这里的每一条消息都是逐条推送的，而不是一次性返回。"},
            {"role": "assistant", "content": "这种方式非常适合 AI 聊天、实时通知、日志推送等场景。"},
            {"role": "assistant", "content": "试着登录后调用 /api/sse/chat/protected 查看个性化推送。"},
        ]

        for msg in messages:
            yield {"event": "message", "data": json.dumps(msg, ensure_ascii=False)}
            await asyncio.sleep(0.8)

        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    return EventSourceResponse(event_generator())


@router.get("/chat/protected", summary="SSE 流式（需登录）")
async def sse_chat_protected(current_user: dict = Depends(get_current_user)):
    async def event_generator():
        yield {
            "event": "message",
            "data": json.dumps({"role": "system", "content": f"你好 {current_user['username']}！"}, ensure_ascii=False),
        }
        await asyncio.sleep(0.5)

        thoughts = [
            f"你的用户 ID 是 {current_user['user_id']}",
            "SSE 可以携带业务数据，比如实时状态更新",
            "还可以用来做进度条推送、直播弹幕等",
            "连接保持期间，服务端可以随时推送数据",
        ]
        for thought in thoughts:
            yield {"event": "message", "data": json.dumps({"role": "assistant", "content": thought}, ensure_ascii=False)}
            await asyncio.sleep(0.8)

        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    return EventSourceResponse(event_generator())
```

### app/routers/upload.py

```python
from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.response import EnvelopeRoute
from app.dependencies import get_current_user
from app.schemas.upload import UploadFileResponse, UploadBatchResponse
from app.services.upload import UploadService

router = APIRouter(route_class=EnvelopeRoute)


async def _upload_current_user():
    """none 数据库模式下上传不需要登录；其他模式需要 JWT。"""
    if settings.db_type == "none":
        return None
    return get_current_user()


@router.post("/upload", summary="单文件上传")
async def upload_file(
    file: UploadFile = File(..., description="待上传文件"),
    _=Depends(_upload_current_user),
):
    service = UploadService()
    result = await service.save(file)
    return UploadFileResponse(**result)


@router.post("/uploads", summary="多文件上传")
async def upload_files(
    files: list[UploadFile] = File(..., description="待上传文件列表"),
    _=Depends(_upload_current_user),
):
    service = UploadService()
    result = await service.save_batch(files)
    return UploadBatchResponse(**result)
```

### app/routers/__init__.py（含所有路由导入）

```python
from app.routers import health, auth, users, sse, upload

__all__ = ["health", "auth", "users", "sse", "upload"]
```

### .env.example

```env
# ==================== 应用配置 ====================
APP_NAME={{project}}
APP_PORT=8080
# ⚠️ 生产环境必须设为 false，防止泄漏堆栈跟踪、配置详情等敏感信息
APP_DEBUG=true

# ==================== 数据库配置 ====================
# 数据库类型：mysql（默认） / postgresql / mongodb / none
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=app_db
DB_USER=root
# 🔴 生产环境务必修改为强密码！
DB_PASSWORD=root
DB_PREFIX=wg

# MySQL 连接串示例（优先级高于上面分项）:
# DB_URL=mysql+aiomysql://root:root@localhost:3306/app_db?charset=utf8mb4

# ==================== 安全配置 ====================
# 🔴 生产环境必须修改为随机字符串（建议 32 字节以上）！
# 生成命令：openssl rand -hex 32
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=86400
JWT_REFRESH_EXPIRES_IN=604800
BCRYPT_ROUNDS=12

# ==================== CORS ====================
# 🔴 生产环境必须指定具体域名，禁止用 *，否则存在 CSRF 等安全风险
# 示例：CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
CORS_ORIGINS=*

# ==================== SSE ====================
SSE_RETRY_TIMEOUT=3000

# ==================== 文件上传 ====================
# 上传文件保存目录（相对路径，程序启动时自动创建）
UPLOAD_DIR=uploads
# 单个文件最大大小，单位 MB
UPLOAD_MAX_SIZE=10
# 允许上传的 MIME 类型，逗号分隔
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### .gitignore

```gitignore
# Python
__pycache__/
*.py[cod]
*.so
*.egg-info/
dist/
build/
venv/
.env
*.egg

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# 数据库
*.db
*.sqlite3

# Docker
.docker/

# 日志
*.log
logs/

# 测试
.coverage
htmlcov/
.pytest_cache/

# 环境配置（敏感信息，切勿提交到仓库）
.env.production
.env.local
.env.*.local
```



## 关键约定

- 表名：`{DB_PREFIX}_user`，snake_case
- 路由前缀：`/api`；认证路由 `/api/auth/*`；SSE 路由 `/api/sse/*`；上传路由 `/api/upload`、`/api/uploads`
- 健康检查：`GET /api/health`
- 校验：Pydantic v2，失败由 `RequestValidationError` handler 转 `-1001`
- SSE：`sse-starlette`，`StreamingResponse` 由 `EnvelopeRoute` 自动透传
- 文件上传：`python-multipart`，单文件/多文件，默认最大 10MB，允许 jpg/png/gif/pdf
- 数据库默认 MySQL，可选 PostgreSQL / MongoDB / 暂不启用数据库
- 密码 bcrypt 12 rounds，最小 8 位
- JWT access_token 24h / refresh_token 7d
- 所有注释、文档使用中文

## api-contract 生成模板

生成 `api-contract.md` 时以 `backend-convention-skill/references/default-api-contract.md` 为起点，填充以下内容：

```markdown
# {{project}} 接口契约

## 1. 通信协议

- 基础 URL：`http://localhost:8080/api`
- 统一响应格式：`{ code, message, data }`
- 认证方式：`Authorization: Bearer {access_token}`

## 2. 全局错误码

| 错误码 | 含义 | 触发场景 |
|--------|------|----------|
| 0 | 成功 | 业务正常 |
| -1001 | 参数校验失败 | Pydantic 校验失败、必填字段缺失、格式错误 |
| -1002 | 未授权 | Token 缺失、无效或过期 |
| -1003 | 禁止访问 | 权限不足（预留） |
| -1004 | 资源不存在 | 用户/记录不存在 |
| -1005 | 资源冲突 | 用户名已存在、旧密码错误 |
| -1006 | 请求过于频繁 | 限流触发（预留） |
| -1031 | 请求体过大 | 上传文件超过 `UPLOAD_MAX_SIZE` |
| -1032 | 不支持的文件类型 | 上传文件 MIME 不在白名单 |
| -2000 | 系统错误 | 未捕获异常 |

## 3. 接口清单

### 3.1 健康检查

#### GET /health
- 说明：服务健康检查
- 认证：否
- 出参：`{ status: "ok", service: "fastapi-init" }`

### 3.2 认证

#### POST /auth/register
- 说明：用户注册
- 入参：`{ username, password, email?, phone? }`
- 出参：`TokenResponse { access_token, refresh_token, token_type }`
- 错误：-1005（用户名已存在）、-1001（参数校验失败）

#### POST /auth/login
- 说明：用户登录
- 入参：`{ username, password }`
- 出参：`TokenResponse`
- 错误：-1002（用户名或密码错误）

#### POST /auth/refresh
- 说明：刷新访问令牌
- 入参：`{ refresh_token }`
- 出参：`TokenResponse`
- 错误：-1002（刷新令牌无效）

#### POST /auth/logout
- 说明：登出，清空 refresh_token
- 认证：Bearer Token
- 出参：`{ message: "已登出" }`

#### GET /auth/me
- 说明：当前用户信息
- 认证：Bearer Token
- 出参：`UserResponse`
- 错误：-1004（用户不存在）

### 3.3 用户管理

#### GET /users
- 说明：用户列表（分页）
- 认证：Bearer Token
- 入参：`page=1&pageSize=20`
- 出参：`PaginatedResponse { page, pageSize, total, list: UserResponse[] }`

#### GET /users/{id}
- 说明：用户详情
- 认证：Bearer Token
- 出参：`UserResponse`
- 错误：-1004（用户不存在）

#### PUT /users/profile
- 说明：修改当前用户资料
- 认证：Bearer Token
- 入参：`UserUpdateRequest { email?, phone?, nickname?, avatar? }`
- 出参：`UserResponse`
- 错误：-1004（用户不存在）

#### PUT /users/password
- 说明：修改密码
- 认证：Bearer Token
- 入参：`ChangePasswordRequest { old_password, new_password }`
- 出参：`{ message: "密码修改成功" }`
- 错误：-1005（旧密码不正确）

### 3.4 文件上传

#### POST /upload
- 说明：单文件上传
- 认证：Bearer Token
- Content-Type：`multipart/form-data`
- 入参：`file`（二进制文件）
- 出参：`UploadFileResponse { url, filename, size, mimeType }`
- 错误：-1031（文件过大）、-1032（不支持的文件类型）

#### POST /uploads
- 说明：多文件上传
- 认证：Bearer Token
- Content-Type：`multipart/form-data`
- 入参：`files[]`（多个二进制文件）
- 出参：`UploadBatchResponse { list: UploadFileResponse[], total }`
- 错误：-1031（文件过大）、-1032（不支持的文件类型）

### 3.5 SSE 流式

#### GET /sse/chat
- 说明：SSE 流式示例（无需登录）
- 响应：`text/event-stream`
- 事件：`message`、`done`

#### GET /sse/chat/protected
- 说明：SSE 流式示例（需登录）
- 认证：Bearer Token
- 响应：`text/event-stream`
- 事件：`message`、`done`

## 4. 字段类型定义

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface UserResponse {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  avatar: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  list: T[];
}

interface UploadFileResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}
```

## 5. 前端联动

- 前端 `request.ts` 按 `ApiResponse<T>` 解析统一响应
- `ERROR_CODE_MAP` 直接复用「全局错误码」表
- SSE 使用 `EventSource`（H5）或小程序 `enableChunked` 对接
- 文件上传使用前端 `upload<T>(options)`，Content-Type 由浏览器/框架自动设置
```

## project-guide 填充段

生成 `docs/project-guide.md` 时，按 backend-convention-skill `references/project-guide-template.md` 的占位符填入以下本栈内容：

| 占位符 | 本栈填充值 |
|--------|-----------|
| `{{STACK}}` | Python + FastAPI + SQLAlchemy 2.0 异步 + SSE（sse-starlette） |
| `{{START_COMMAND}}` | `./setup.sh`（首次）/ `./dev.sh`（开发） |
| `{{DIRECTORY_TREE}}` | 上文「目录结构」节 |
| `{{LAYER_RESPONSIBILITY}}` | routers 接请求返回裸数据；models 表映射（SQLAlchemy ORM）；schemas 出入参校验（Pydantic v2）；services 业务逻辑（用户/上传）；utils 工具（JWT/密码）；main 注册中间件/异常/路由/SSE/静态文件 |
| `{{MIDDLEWARE_CHAIN}}` | `security_headers_middleware 安全头 → request_log_middleware 日志 → CORSMiddleware → 路由匹配 → get_current_user 鉴权依赖 → Pydantic v2 校验 → EnvelopeRoute 信封包装（StreamingResponse 自动透传）→ exception_handler 异常兜底` |
| `{{VALIDATION_WAY}}` | 请求体/查询参数用 Pydantic v2 模型 + 类型注解 + Field 约束，失败由 `RequestValidationError` handler 转 `-1001` |
| `{{ENVELOPE_WAY}}` | `EnvelopeRoute` 为唯一包装点，handler 返回裸数据；`api_response` 仅供 exception_handler 兜底；SSE/文件下载等非 JSON 响应自动透传 |
| `{{SSE_WAY}}` | 使用 `sse-starlette` 的 `EventSourceResponse`，在路由中 `yield` 字典即可流式推送；前端用 `EventSource` API 接收 |
| `{{MODULE_STEPS}}` | ① 更新 `api-contract.md` → ② `app/models/xxx.py` → ③ `app/schemas/xxx.py` → ④ `app/services/xxx.py` → ⑤ `app/routers/xxx.py`（`APIRouter(route_class=EnvelopeRoute)`）→ ⑥ `main.py` 中 `include_router` / 静态文件挂载 → ⑦ `python -m compileall app` + curl 验证 |
| `{{MIDDLEWARE_STEPS}}` | 横切逻辑用 `@app.middleware("http")`；鉴权/权限类优先用 `Depends` 依赖注入 |
| `{{ONE_CLICK_WAY}}` | Linux/macOS 运行 `./setup.sh`，Windows 运行 `setup.bat`；脚本自动检测 Python → 创建 venv → 安装依赖 → 启动服务 |
| `{{MIGRATION_WAY}}` | 开发阶段 `lifespan` 中 `create_all()` 自动建表；生产环境请自行安装 Alembic 管理迁移 |
| `{{DB_START_WAY}}` | MySQL：`docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=app_db mysql:8.0`；PostgreSQL：`docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=root -e POSTGRES_DB=app_db postgres:15`；MongoDB：`docker run -d -p 27017:27017 -e MONGO_INITDB_DATABASE=app_db mongo:6`；无数据库：将 `.env` 中 `DB_TYPE=none`。本地安装：确保数据库已启动且 `.env` 中连接信息正确 |
