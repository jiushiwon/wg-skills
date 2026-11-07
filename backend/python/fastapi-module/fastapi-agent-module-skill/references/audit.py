# Agent 模块审计日志
# 提供结构化审计日志，记录 user_id/tool_name/token/异常等关键事件
# 用于安全追溯与合规审计

import logging
import hashlib
from datetime import datetime

# 审计 logger（独立于业务 logger，可独立配置 sink/格式化）
audit_logger = logging.getLogger("agent.audit")


def _hash_args(args: dict) -> str:
    """对参数做 SHA256 哈希（用于日志追溯，不暴露明文）"""
    try:
        # 仅取参数名和类型，不取参数值
        meta = {k: type(v).__name__ for k, v in args.items()}
        raw = str(sorted(meta.items())).encode()
        return hashlib.sha256(raw).hexdigest()[:16]
    except Exception:
        return "hash_failed"


class AuditLogger:
    """审计日志器（修复 P0-S4：结构化审计）"""

    @staticmethod
    def log_tool_call(user_id: int, tool_name: str, args: dict, success: bool, session_id: int = None):
        """记录 Tool 调用"""
        audit_logger.info(
            "tool_call",
            extra={
                "event": "tool_call",
                "user_id": user_id,
                "session_id": session_id,
                "tool_name": tool_name,
                "args_hash": _hash_args(args),
                "args_keys": list(args.keys()),  # 只记录参数名，不记录值
                "success": success,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    @staticmethod
    def log_tool_failure(user_id: int, tool_name: str, error: str, session_id: int = None):
        """记录 Tool 失败（用于追溯越权尝试）"""
        audit_logger.warning(
            "tool_failure",
            extra={
                "event": "tool_failure",
                "user_id": user_id,
                "session_id": session_id,
                "tool_name": tool_name,
                "error": error,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    @staticmethod
    def log_chat_failure(user_id: int, session_id: int, error: str):
        """记录对话失败"""
        audit_logger.error(
            "chat_failure",
            extra={
                "event": "chat_failure",
                "user_id": user_id,
                "session_id": session_id,
                "error": error,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    @staticmethod
    def log_token_usage(user_id: int, session_id: int, model: str, prompt_tokens: int, completion_tokens: int):
        """记录 token 消耗（成本追溯）"""
        audit_logger.info(
            "token_usage",
            extra={
                "event": "token_usage",
                "user_id": user_id,
                "session_id": session_id,
                "model": model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    @staticmethod
    def log_rate_limit_hit(user_id: int, endpoint: str):
        """记录限流命中"""
        audit_logger.warning(
            "rate_limit_hit",
            extra={
                "event": "rate_limit_hit",
                "user_id": user_id,
                "endpoint": endpoint,
                "timestamp": datetime.utcnow().isoformat()
            }
        )