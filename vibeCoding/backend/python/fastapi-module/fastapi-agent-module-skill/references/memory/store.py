# 会话记忆存储
# ✅ 修复 P0-A2: MemoryStore 实例不再作为全局单例（通过 FastAPI Depends 注入）
# ✅ 修复 P0-P8: 淘汰时显式清空 buffer

import logging
from typing import Dict, Optional
from collections import OrderedDict
from src.agent.memory.buffer import MemoryBuffer

logger = logging.getLogger(__name__)

# 最大会话数限制，防止内存耗尽
MAX_SESSIONS = 1000


class MemoryStore:
    """会话记忆存储（带 LRU 淘汰策略）

    使用模式：
        # 在 lifespan 中创建单例
        store = MemoryStore()

        # 在 routers 中通过 Depends 注入
        def get_memory_store(request: Request) -> MemoryStore:
            return request.app.state.memory_store

        @router.post("/chat")
        async def chat(store: MemoryStore = Depends(get_memory_store)):
            buffer = store.get_buffer(session_id)
    """

    def __init__(self, max_sessions: int = MAX_SESSIONS):
        self._buffers: OrderedDict[int, MemoryBuffer] = OrderedDict()
        self._max_sessions = max_sessions

    def get_buffer(self, session_id: int, max_turns: int = 20) -> MemoryBuffer:
        """获取或创建记忆缓冲区"""
        if session_id in self._buffers:
            self._buffers.move_to_end(session_id)
            return self._buffers[session_id]

        if len(self._buffers) >= self._max_sessions:
            # ✅ 修复 P0-P8: 淘汰时显式清空 buffer（释放引用）
            evicted_id, evicted_buffer = self._buffers.popitem(last=False)
            if evicted_buffer is not None:
                evicted_buffer.clear()
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
            buffer = self._buffers.pop(session_id)
            if buffer is not None:
                buffer.clear()

    def has_buffer(self, session_id: int) -> bool:
        """检查是否有缓冲"""
        return session_id in self._buffers

    @property
    def size(self) -> int:
        """当前缓存的会话数"""
        return len(self._buffers)


# ⚠️ 已废弃：全局实例保留仅为兼容旧代码，新代码请通过 FastAPI Depends 注入
# 推荐做法：在 lifespan 中创建单例并保存到 app.state.memory_store
memory_store = MemoryStore()


# ✅ FastAPI Depends 工厂函数
def get_memory_store(request) -> MemoryStore:
    """获取 MemoryStore 实例（通过 FastAPI Depends 注入）

    用法：
        from fastapi import Depends
        from src.agent.memory.store import get_memory_store

        @router.post("/chat")
        async def chat(store: MemoryStore = Depends(get_memory_store)):
            ...
    """
    # 从 app.state 获取（lifespan 中注入），否则兜底使用全局实例
    store = getattr(request.app.state, "memory_store", None)
    if store is None:
        logger.warning(
            "app.state.memory_store 未设置，使用全局兜底实例"
            "（生产环境应在 lifespan 中显式注入）"
        )
        return memory_store
    return store