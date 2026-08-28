# Agent 模块 Rate Limiting 中间件
# ✅ 修复 P0-S3: 基于用户 ID 的速率限制（防 LLM 财务风险 + DoS）
#
# 使用 slowapi 实现；如果项目未安装 slowapi，提供降级方案（in-memory token bucket）

from typing import Callable, Optional
from fastapi import Request, HTTPException
from src.agent.audit import audit_logger

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    SLOWAPI_AVAILABLE = True
except ImportError:
    SLOWAPI_AVAILABLE = False


def _get_user_id_or_ip(request: Request) -> str:
    """获取限流 key：优先用 user_id（已认证用户），否则用 IP"""
    # 尝试从 FastAPI Depends 注入的 current_user 获取
    user = getattr(request.state, "current_user", None)
    if user is not None and getattr(user, "id", None):
        return f"user:{user.id}"
    # 兜底：使用 IP
    return f"ip:{get_remote_address(request) if SLOWAPI_AVAILABLE else request.client.host}"


if SLOWAPI_AVAILABLE:
    # ✅ 慢api 实现（推荐生产使用）
    limiter = Limiter(key_func=_get_user_id_or_ip)

    def rate_limit_chat():
        """chat 接口限流：每用户 10 次/分钟"""
        return limiter.limit("10/minute")

    def rate_limit_session():
        """session 接口限流：每用户 30 次/分钟"""
        return limiter.limit("30/minute")

    def rate_limit_tool():
        """tool 接口限流：每用户 60 次/分钟"""
        return limiter.limit("60/minute")
else:
    # ⚠️ 降级方案：in-memory token bucket（仅用于开发/测试）
    import time
    from collections import defaultdict

    class _TokenBucket:
        """简单的令牌桶限流（进程内，仅适合单机开发）"""
        def __init__(self, rate: int, per: int = 60):
            self.rate = rate
            self.per = per
            self._buckets: dict = defaultdict(lambda: {"tokens": rate, "last": time.time()})

        def __call__(self, request: Request) -> bool:
            key = _get_user_id_or_ip(request)
            bucket = self._buckets[key]
            now = time.time()
            elapsed = now - bucket["last"]
            # 补充令牌
            bucket["tokens"] = min(self.rate, bucket["tokens"] + elapsed * (self.rate / self.per))
            bucket["last"] = now

            if bucket["tokens"] >= 1:
                bucket["tokens"] -= 1
                return True
            audit_logger.log_rate_limit_hit(
                user_id=getattr(request.state, "current_user_id", None),
                endpoint=request.url.path
            )
            return False

    _chat_bucket = _TokenBucket(rate=10, per=60)
    _session_bucket = _TokenBucket(rate=30, per=60)
    _tool_bucket = _TokenBucket(rate=60, per=60)

    def rate_limit_chat():
        """chat 接口限流（降级方案）"""
        def dep(request: Request):
            if not _chat_bucket(request):
                raise HTTPException(status_code=429, detail="请求过于频繁，请稍后重试")
        return dep

    def rate_limit_session():
        """session 接口限流（降级方案）"""
        def dep(request: Request):
            if not _session_bucket(request):
                raise HTTPException(status_code=429, detail="请求过于频繁，请稍后重试")
        return dep

    def rate_limit_tool():
        """tool 接口限流（降级方案）"""
        def dep(request: Request):
            if not _tool_bucket(request):
                raise HTTPException(status_code=429, detail="请求过于频繁，请稍后重试")
        return dep


__all__ = ["rate_limit_chat", "rate_limit_session", "rate_limit_tool", "SLOWAPI_AVAILABLE"]