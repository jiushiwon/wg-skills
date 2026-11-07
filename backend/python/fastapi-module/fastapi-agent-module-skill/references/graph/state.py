# Agent State 定义

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class AgentState(BaseModel):
    """Agent 状态"""
    # 输入
    user_input: str = ""

    # 上下文
    session_id: int = 0
    user_id: int = 0

    # 对话历史
    messages: List[Dict[str, str]] = []

    # LLM 输出
    llm_response: str = ""

    # Tool 调用
    tool_calls: List[Dict[str, Any]] = []
    tool_results: List[Dict[str, Any]] = []

    # 最终响应
    final_response: str = ""

    # 元数据
    iterations: int = 0
    max_iterations: int = 5

    class Config:
        arbitrary_types_allowed = True
