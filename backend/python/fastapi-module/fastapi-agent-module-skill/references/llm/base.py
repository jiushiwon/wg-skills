# LLM 基类

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncGenerator


class Message:
    """对话消息"""
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content

    def to_dict(self) -> dict:
        return {"role": self.role, "content": self.content}


class LLMBase(ABC):
    """LLM 接口基类"""

    @abstractmethod
    async def chat(
        self,
        messages: List[Message],
        tools: List[Dict] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """同步对话，返回完整响应"""
        pass

    @abstractmethod
    async def stream_chat(
        self,
        messages: List[Message],
        tools: List[Dict] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """流式对话"""
        pass

    @abstractmethod
    async def get_embedding(self, text: str) -> List[float]:
        """获取文本嵌入"""
        pass


class ToolCall:
    """Tool 调用"""
    def __init__(self, name: str, arguments: dict):
        self.name = name
        self.arguments = arguments

    @classmethod
    def from_dict(cls, data: dict) -> "ToolCall":
        return cls(
            name=data.get("name", ""),
            arguments=data.get("arguments", {})
        )


class LLMResponse:
    """LLM 响应"""
    def __init__(
        self,
        content: str,
        tool_calls: List[ToolCall] = None,
        finish_reason: str = "stop"
    ):
        self.content = content
        self.tool_calls = tool_calls or []
        self.finish_reason = finish_reason
