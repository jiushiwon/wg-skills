"""
统一响应格式
"""
from typing import Any, Optional


def success(data: Any = None, message: str = "success") -> dict:
    """成功响应"""
    return {
        "success": True,
        "message": message,
        "data": data
    }


def error(message: str = "error", code: int = 400, data: Any = None) -> dict:
    """错误响应"""
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": code
    }
