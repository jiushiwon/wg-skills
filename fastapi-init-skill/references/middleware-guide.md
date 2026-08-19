# 中间件链与鉴权指南

## 完整请求链路

一个请求从进入 FastAPI 到返回的完整路径：

```
HTTP 请求
  │
  ├─ 1. request_log_middleware
  │     生成 requestId → 记录开始时间 → 传给下游
  │
  ├─ 2. CORSMiddleware
  │     跨域策略检查 → 放行或拒绝
  │
  ├─ 3. 路由匹配
  │     匹配 URL → 确定 handler
  │
  ├─ 4. Depends（依赖注入链）
  │     ├─ get_db() → 获取数据库 Session
  │     ├─ get_current_user() → JWT 解析 → 注入用户信息
  │     └─ 其他业务依赖
  │
  ├─ 5. Pydantic v2 校验
  │     请求体/查询参数/路径参数自动校验 → 失败抛 RequestValidationError
  │
  ├─ 6. Service 层（业务逻辑）
  │     handler 调用 service → 处理业务 → 返回裸数据
  │
  ├─ 7. EnvelopeRoute
  │     检测响应类型：
  │     ├─ JSON → 包装为 { code: 0, message: "success", data: ... }
  │     └─ 非 JSON（SSE/文件下载）→ 透传，不包装
  │
  └─ 8. exception_handler（异常兜底）
        ├─ BusinessException → { code, message, data: null }
        ├─ RequestValidationError → -1001
        └─ Exception → -2000 "系统繁忙"
```

## 中间件注册顺序

注册顺序决定执行顺序：**先注册的先执行，后注册的后执行**（洋葱模型向外返回时反过来）。

```python
# main.py

# ① CORS 最外层（安全性）
app.add_middleware(CORSMiddleware, ...)

# ② 请求日志（记录所有请求，包括被拒绝的）
@app.middleware("http")
async def request_log_middleware(request, call_next):
    ...

# ③ 路由匹配（FastAPI 内置）
# ④ 依赖注入（Depends）

# ⑤ 异常处理（最内层兜底）
@app.exception_handler(BusinessException)
```

## JWT 鉴权

### 登录流程

```
客户端                    服务端
  │                         │
  │  POST /api/auth/login   │
  │  { username, password } │
  │ ───────────────────────>│
  │                         ├─ 查用户
  │                         ├─ bcrypt 验证密码
  │                         ├─ 签发 access_token (24h)
  │                         ├─ 签发 refresh_token (7d)
  │                         ├─ 存 refresh_token 到 DB
  │  { access_token,        │
  │    refresh_token }      │
  │ <───────────────────────│
  │                         │
  │  GET /api/users         │
  │  Authorization: Bearer  │
  │  <access_token>         │
  │ ───────────────────────>│
  │                         ├─ 解析 JWT
  │                         ├─ 查用户状态
  │                         ├─ 注入 current_user
  │  { code: 0, data: [...]│
  │ <───────────────────────│
```

### Token 刷新流程

```
access_token 过期（24h）后，用 refresh_token（7d）获取新 access_token：
POST /api/auth/refresh { refresh_token }
→ 验证 refresh_token 是否有效 + 是否与 DB 中一致
→ 签发新 access_token + 新 refresh_token（旧 refresh_token 作废）
```

### 登出流程

```
POST /api/auth/logout
→ 清空 DB 中用户的 refresh_token
→ 旧的 refresh_token 失效
→ access_token 仍有效直到过期（JWT 无状态，无法主动失效）
```

## 错误码体系

| code | 含义 | 说明 |
|------|------|------|
| 0 | 成功 | 正常响应 |
| -1001 | 参数校验失败 | Pydantic 校验不通过 |
| -1002 | 认证失败 | 未登录 / Token 无效 / 密码错误 / 账号异常 |
| -1003 | 禁止访问 | 已登录但无操作权限 |
| -1004 | 资源不存在 | 用户/数据未找到 |
| -1005 | 资源冲突 | 用户名已存在 / 旧密码不正确 / 重复提交 |
| -1006 | 请求过于频繁 | 限流触发（预留） |
| -1031 | 请求体过大 | 上传文件超过 `UPLOAD_MAX_SIZE` 限制 |
| -1032 | 不支持的文件类型 | 上传文件 MIME 不在白名单 |
| -2000 | 系统异常 | 未预期的内部错误 |

> 错误码与 `backend-convention-skill` 规范对齐，前端 `frontend-request-skill` 的 `ERROR_CODE_MAP` 可直接复用。

## 生产环境安全中间件

### 安全头中间件（已内置）

`main.py` 已默认注册以下安全头，防御常见 Web 攻击：

```python
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

### 请求体大小限制

防止超大请求导致内存耗尽：

```python
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_size: int = 10 * 1024 * 1024):
        super().__init__(app)
        self.max_size = max_size

    async def dispatch(self, request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            body = await request.body()
            if len(body) > self.max_size:
                return JSONResponse(
                    status_code=200,
                    content={"code": -1031, "message": "请求体过大", "data": None},
                )
        return await call_next(request)

# 注册（限制 10MB）
app.add_middleware(MaxBodySizeMiddleware, max_size=10 * 1024 * 1024)
```

### 慢请求告警中间件

生产环境监控接口延迟，及时发现性能退化：

```python
@app.middleware("http")
async def slow_request_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    if duration > 1.0:
        logger.warning("慢请求: %s %s 耗时 %.2fs", request.method, request.url.path, duration)
    return response
```

## 自定义中间件示例

### 限流中间件

```python
from collections import defaultdict
import time
from fastapi import Request
from fastapi.responses import JSONResponse

rate_limit_store: dict[str, list[float]] = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = time.time()
    rate_limit_store[client_ip] = [t for t in rate_limit_store[client_ip] if now - t < 60]

    if len(rate_limit_store[client_ip]) >= 100:
        return JSONResponse(
            status_code=200,
            content={"code": -1030, "message": "请求过于频繁，请稍后再试", "data": None},
        )

    rate_limit_store[client_ip].append(now)
    return await call_next(request)
```

### 压缩中间件

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### 响应时间监控

```python
@app.middleware("http")
async def slow_request_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    if duration > 1.0:
        logger.warning("慢请求: %s %s 耗时 %.2fs", request.method, request.url.path, duration)
    return response
```

## 鉴权扩展建议

### 角色权限

```python
# 在 User 模型中添加 role 字段
role: Mapped[str] = mapped_column(String(32), default="user")  # admin / user

# 创建权限依赖
def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise BusinessException(-1003, "无权限")
    return current_user

# 使用
@router.delete("/users/{user_id}")
async def delete_user(user_id: int, _: dict = Depends(require_admin)):
    ...
```

### API Key 认证（第三方调用）

```python
from fastapi import Header

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.api_key:
        raise BusinessException(-1002, "无效的 API Key")
    return True
```
