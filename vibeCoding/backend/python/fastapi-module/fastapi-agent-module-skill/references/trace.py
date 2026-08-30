# Trace ID 关联日志
# ✅ 修复 P2-13: 使用 contextvars 注入 trace_id 到所有日志
# 用于一次请求的完整链路追踪（LLM 调用、Tool 执行、DB 操作）

import logging
import uuid
import contextvars
from typing import Optional

# ✅ contextvars：在 async 上下文自动隔离
_trace_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("trace_id", default="-")


def set_trace_id(trace_id: Optional[str] = None) -> str:
    """设置当前上下文的 trace_id

    Args:
        trace_id: 自定义 ID，None 则自动生成

    Returns:
        设置的 trace_id
    """
    if trace_id is None:
        trace_id = uuid.uuid4().hex[:16]
    _trace_id_var.set(trace_id)
    return trace_id


def get_trace_id() -> str:
    """获取当前上下文的 trace_id"""
    return _trace_id_var.get()


def clear_trace_id():
    """清除当前上下文 trace_id（用于测试）"""
    _trace_id_var.set("-")


class TraceIdFilter(logging.Filter):
    """日志过滤器：自动注入 trace_id 到所有日志记录"""

    def filter(self, record: logging.LogRecord) -> bool:
        # 自动注入 trace_id（如果有）
        record.trace_id = get_trace_id()
        return True


def setup_trace_logging(logger_name: str = None) -> logging.Logger:
    """为指定 logger 配置 trace_id 过滤器

    用法：
            setup_trace_logging("agent.audit")
            setup_trace_logging("agent.chat")
    """
    target_logger = logging.getLogger(logger_name) if logger_name else logging.getLogger()
    target_logger.addFilter(TraceIdFilter())
    return target_logger


# ✅ FastAPI 中间件：自动为每次请求生成/传递 trace_id
try:
    from fastapi import Request
    from starlette.middleware.base import BaseHTTPMiddleware
    from starlette.responses import Response

    class TraceIdMiddleware(BaseHTTPMiddleware):
        """Trace ID 中间件

        - 从请求头 `X-Trace-Id` 读取（用于跨服务追踪）
        - 自动生成 UUID 作为兜底
        - 注入到响应头 `X-Trace-Id` 便于客户端关联
        """

        async def dispatch(self, request: Request, call_next):
            trace_id = request.headers.get("X-Trace-Id") or uuid.uuid4().hex[:16]
            set_trace_id(trace_id)

            response: Response = await call_next(request)
            response.headers["X-Trace-Id"] = trace_id
            return response
except ImportError:
    # FastAPI 不在时跳过中间件定义
    TraceIdMiddleware = None


__all__ = [
    "set_trace_id",
    "get_trace_id",
    "clear_trace_id",
    "TraceIdFilter",
    "setup_trace_logging",
    "TraceIdMiddleware",
]