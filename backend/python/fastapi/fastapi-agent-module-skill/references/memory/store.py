# 会话记忆存储

import logging
from typing import Dict, Optional
from collections import OrderedDict
from src.agent.memory.buffer import MemoryBuffer

logger = logging.getLogger(__name__)

# 最大会话数限制，防止内存耗尽
MAX_SESSIONS = 1000


class MemoryStore:
    """会话记忆存储（带 LRU 淘汰策略）"""

    def __init__(self, max_sessions: int = MAX_SESSIONS):
        self._buffers: OrderedDict[int, MemoryBuffer] = OrderedDict()
        self._max_sessions = max_sessions

    def get_buffer(self, session_id: int, max_turns: int = 20) -> MemoryBuffer:
        """获取或创建记忆缓冲区"""
        if session_id in self._buffers:
            # 移动到末尾（最近使用）
            self._buffers.move_to_end(session_id)
            return self._buffers[session_id]

        # 检查是否超过限制
        if len(self._buffers) >= self._max_sessions:
            # 淘汰最久未使用的
            evicted_id, _ = self._buffers.popitem(last=False)
            logger.warning(f"内存限制，淘汰会话: {evicted_id}")

        buffer = MemoryBuffer(max_turns=max_turns)
        self._buffers[session_id] = buffer
        return buffer

    def save_buffer(self, session_id: int, buffer: MemoryBuffer):
        """保存记忆缓冲区"""
        self._buffers[session_id] = buffer
        self._buffers.move_to_end(session_id)

    def clear_buffer(self, session_id: int):
        """清除会话记忆"""
        if session_id in self._buffers:
            self._buffers[session_id].clear()

    def delete_buffer(self, session_id: int):
        """删除缓冲区"""
        if session_id in self._buffers:
            del self._buffers[session_id]

    def has_buffer(self, session_id: int) -> bool:
        """检查是否有缓冲"""
        return session_id in self._buffers

    @property
    def size(self) -> int:
        """当前缓存的会话数"""
        return len(self._buffers)


# 全局实例
memory_store = MemoryStore()
