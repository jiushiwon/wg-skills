# 对话记忆
# ✅ 修复 P1-P21: 使用 collections.deque 自动裁剪（O(1) 替代 O(n) 列表）

from collections import deque
from typing import List, Dict, Any
from src.agent.llm.base import Message


class MemoryBuffer:
    """对话记忆缓冲区（基于 deque 实现 O(1) 自动裁剪）

    使用模式：
        buffer = MemoryBuffer(max_turns=20)
        buffer.add_user_message("你好")
        buffer.add_assistant_message("你好，有什么可以帮你的？")
        messages = buffer.get_messages()
    """

    def __init__(self, max_turns: int = 20):
        self.max_turns = max_turns
        # ✅ 修复 P1-P21: deque(maxlen=max_turns*2) 自动裁剪
        self._messages: deque = deque(maxlen=max_turns * 2)
        # 系统消息单独保存（不受裁剪影响）
        self._system_messages: deque = deque(maxlen=10)

    def add_user_message(self, content: str):
        """添加用户消息"""
        self._messages.append(Message(role="user", content=content))

    def add_assistant_message(self, content: str):
        """添加助手消息"""
        self._messages.append(Message(role="assistant", content=content))

    def add_tool_result(self, tool_name: str, result: str):
        """添加工具结果"""
        self._messages.append(Message(
            role="tool",
            content=f"<tool_result name=\"{tool_name}\">{result}</tool_result>"
        ))

    def add_system_message(self, content: str):
        """添加系统消息（不受 max_turns 限制）"""
        self._system_messages.append(Message(role="system", content=content))

    def get_messages(self) -> List[Message]:
        """获取消息列表（系统消息 + 普通消息）"""
        return list(self._system_messages) + list(self._messages)

    def get_messages_for_llm(self) -> List[dict]:
        """获取给 LLM 的消息格式"""
        return [m.to_dict() for m in self.get_messages()]

    @property
    def messages(self) -> List[Message]:
        """兼容旧接口：返回消息列表"""
        return self.get_messages()

    @messages.setter
    def messages(self, value: List[Message]):
        """兼容旧接口：设置消息列表"""
        # 分离 system 和其他消息
        self._system_messages.clear()
        self._messages.clear()
        for m in value:
            if m.role == "system":
                self._system_messages.append(m)
            else:
                self._messages.append(m)

    def clear(self):
        """清空记忆"""
        self._messages.clear()
        self._system_messages.clear()

    def to_dict(self) -> Dict[str, Any]:
        """序列化"""
        return {
            "messages": [m.to_dict() for m in self.get_messages()],
            "max_turns": self.max_turns
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MemoryBuffer":
        """反序列化"""
        buffer = cls(max_turns=data.get("max_turns", 20))
        for m in data.get("messages", []):
            msg = Message(m["role"], m["content"])
            if msg.role == "system":
                buffer._system_messages.append(msg)
            else:
                buffer._messages.append(msg)
        return buffer