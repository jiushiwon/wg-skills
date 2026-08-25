# 对话记忆

from typing import List, Dict, Any
from src.agent.llm.base import Message


class MemoryBuffer:
    """对话记忆缓冲区"""

    def __init__(self, max_turns: int = 20):
        self.max_turns = max_turns
        self.messages: List[Message] = []

    def add_user_message(self, content: str):
        """添加用户消息"""
        self.messages.append(Message(role="user", content=content))
        self._trim()

    def add_assistant_message(self, content: str):
        """添加助手消息"""
        self.messages.append(Message(role="assistant", content=content))
        self._trim()

    def add_tool_result(self, tool_name: str, result: str):
        """添加工具结果"""
        self.messages.append(Message(
            role="tool",
            content=f"[{tool_name}]: {result}"
        ))
        self._trim()

    def get_messages(self) -> List[Message]:
        """获取消息列表"""
        return self.messages

    def get_messages_for_llm(self) -> List[dict]:
        """获取给 LLM 的消息格式"""
        return [m.to_dict() for m in self.messages]

    def clear(self):
        """清空记忆"""
        self.messages = []

    def _trim(self):
        """裁剪超出的消息"""
        if len(self.messages) > self.max_turns * 2:
            # 保留系统消息 + 最近的消息
            system_msgs = [m for m in self.messages if m.role == "system"]
            others = [m for m in self.messages if m.role != "system"]
            self.messages = system_msgs + others[-(self.max_turns * 2):]

    def to_dict(self) -> Dict[str, Any]:
        """序列化"""
        return {
            "messages": [m.to_dict() for m in self.messages],
            "max_turns": self.max_turns
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MemoryBuffer":
        """反序列化"""
        buffer = cls(max_turns=data.get("max_turns", 20))
        buffer.messages = [
            Message(m["role"], m["content"])
            for m in data.get("messages", [])
        ]
        return buffer
