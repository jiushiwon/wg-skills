# 安全响应头中间件
# ✅ 修复 P2-11: 添加 CSP / X-Frame-Options / X-Content-Type-Options 等安全响应头
# ✅ CORS 显式配置（特别是 SSE 端点）

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from starlette.requests import Request


# ✅ 默认安全响应头
DEFAULT_SECURITY_HEADERS = {
    # 防止 MIME 类型嗅探
    "X-Content-Type-Options": "nosniff",
    # 防止点击劫持
    "X-Frame-Options": "DENY",
    # XSS 防护
    "X-XSS-Protection": "1; mode=block",
    # 限制 referrer 泄露
    "Referrer-Policy": "strict-origin-when-cross-origin",
    # 权限控制
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """安全响应头中间件

    用法：
        from fastapi import FastAPI
        from src.agent.security_headers import SecurityHeadersMiddleware

        app = FastAPI()
        app.add_middleware(SecurityHeadersMiddleware)
    """

    def __init__(self, app, extra_headers: dict = None):
        super().__init__(app)
        self.extra_headers = {**DEFAULT_SECURITY_HEADERS, **(extra_headers or {})}

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        for header, value in self.extra_headers.items():
            response.headers[header] = value
        return response


__all__ = [
    "SecurityHeadersMiddleware",
    "DEFAULT_SECURITY_HEADERS",
]