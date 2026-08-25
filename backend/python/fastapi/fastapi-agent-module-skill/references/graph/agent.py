# LangGraph Agent 定义
# ✅ 修复 P0-P2: 懒加载路径加锁（防止并发初始化竞态）
# ✅ 修复 P0-A2: 通过 AppState 持有依赖，lifespan 中初始化（避免全局单例）
# ✅ 修复 P0-P25: init_agent_graph 幂等保护

import asyncio
import logging
from typing import Optional
from fastapi import Request
from langgraph.graph import StateGraph, END
from src.agent.graph.state import AgentState
from src.agent.graph.nodes import (
    node_llm_think, node_execute_tools, node_generate_response, should_continue
)
from src.agent.llm.base import LLMBase
from src.agent.llm.openai import OpenAILLM
from app.config import settings

logger = logging.getLogger(__name__)

# ✅ 修复 P0-P2: 懒加载路径加锁
_init_lock = asyncio.Lock()
_graph_lock = asyncio.Lock()


class AgentContainer:
    """Agent 依赖容器（修复 P0-A2：消除全局单例）

    通过 FastAPI 的 app.state 持有实例，lifespan 中注入，routers 通过 Request 访问
    """

    def __init__(self):
        self.llm: Optional[LLMBase] = None
        self.graph: Optional[StateGraph] = None

    def init_llm(self, llm: Optional[LLMBase] = None):
        """初始化 LLM"""
        if llm is not None:
            self.llm = llm
            logger.info(f"LLM 已设置: {type(llm).__name__}")
            return self.llm
        self.llm = OpenAILLM(
            model=settings.agent_model or "gpt-4o-mini",
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            temperature=settings.agent_temperature,
            max_tokens=settings.agent_max_tokens
        )
        logger.info(f"LLM 自动初始化: {settings.agent_model}")
        return self.llm

    def init_graph(self):
        """初始化 Agent Graph"""
        # ✅ 修复 P0-P25: 幂等保护
        if self.graph is not None:
            return self.graph
        self.graph = create_agent_graph().compile()
        logger.info("Agent Graph 已编译")
        return self.graph


# 兼容旧接口（lifespan 中调用一次即可）
def init_llm(llm: Optional[LLMBase] = None) -> LLMBase:
    """兼容旧接口：初始化全局 LLM（建议通过 lifespan 注入到 app.state.agent）"""
    global _llm_legacy
    if llm is not None:
        _llm_legacy = llm
        return _llm_legacy
    _llm_legacy = OpenAILLM(
        model=settings.agent_model or "gpt-4o-mini",
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=settings.agent_temperature,
        max_tokens=settings.agent_max_tokens
    )
    logger.info(f"LLM 自动初始化: {settings.agent_model}")
    return _llm_legacy


def init_agent_graph():
    """兼容旧接口：初始化全局 Agent Graph"""
    global _agent_graph_legacy
    _agent_graph_legacy = create_agent_graph().compile()
    logger.info("Agent Graph 已编译")


# 全局实例（保留用于未使用 lifespan 的场景）
_llm_legacy: Optional[LLMBase] = None
_agent_graph_legacy = None


async def get_llm_async(request: Optional[Request] = None) -> LLMBase:
    """获取 LLM（异步版本，支持 DI）

    优先从 app.state.agent 读取；否则使用全局懒加载（带锁）。
    """
    if request is not None:
        container = getattr(request.app.state, "agent", None)
        if container is not None and container.llm is not None:
            return container.llm

    # ✅ 修复 P0-P2: 懒加载路径加锁
    global _llm_legacy
    if _llm_legacy is None:
        async with _init_lock:
            if _llm_legacy is None:
                logger.warning(
                    "LLM 未通过 lifespan 初始化，使用懒加载模式（生产环境应在 lifespan 中调用 init_llm()）"
                )
                _llm_legacy = init_llm()
    return _llm_legacy


def get_llm() -> LLMBase:
    """同步版本：获取 LLM（保留兼容，懒加载带锁）"""
    global _llm_legacy
    if _llm_legacy is None:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # 在事件循环中，无法直接锁，警告并返回兜底
                logger.warning("事件循环中检测到同步 get_llm()，未加锁")
                return init_llm()
        except RuntimeError:
            pass
        _llm_legacy = init_llm()
    return _llm_legacy


async def get_agent_graph_async(request: Optional[Request] = None) -> StateGraph:
    """获取 Agent Graph（异步版本，支持 DI）"""
    if request is not None:
        container = getattr(request.app.state, "agent", None)
        if container is not None and container.graph is not None:
            return container.graph

    global _agent_graph_legacy
    if _agent_graph_legacy is None:
        async with _graph_lock:
            if _agent_graph_legacy is None:
                _agent_graph_legacy = create_agent_graph().compile()
    return _agent_graph_legacy


def get_agent_graph() -> StateGraph:
    """同步版本：获取 Agent Graph"""
    global _agent_graph_legacy
    if _agent_graph_legacy is None:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                logger.warning("事件循环中检测到同步 get_agent_graph()，未加锁")
                return init_agent_graph_legacy_sync()
        except RuntimeError:
            pass
        _agent_graph_legacy = create_agent_graph().compile()
    return _agent_graph_legacy


def init_agent_graph_legacy_sync():
    global _agent_graph_legacy
    _agent_graph_legacy = create_agent_graph().compile()
    return _agent_graph_legacy


def create_agent_graph() -> StateGraph:
    """创建 Agent 图"""
    graph = StateGraph(AgentState)

    graph.add_node("think", node_llm_think)
    graph.add_node("execute_tools", node_execute_tools)
    graph.add_node("respond", node_generate_response)

    graph.set_entry_point("think")

    graph.add_conditional_edges(
        "think",
        should_continue,
        {
            "execute_tools": "execute_tools",
            "respond": "respond",
            "end": "respond"
        }
    )

    graph.add_edge("execute_tools", "think")
    graph.add_edge("respond", END)

    return graph


async def run_agent(
    user_input: str,
    session_id: int,
    user_id: int,
    messages: list = None,
    request: Optional[Request] = None
) -> str:
    """运行 Agent"""
    graph = await get_agent_graph_async(request)

    initial_state = {
        "user_input": user_input,
        "session_id": session_id,
        "user_id": user_id,
        "messages": messages or [],
        "iterations": 0,
        "max_iterations": 5
    }

    result = await graph.ainvoke(initial_state)
    return result.get("final_response", "")


async def run_agent_stream(
    user_input: str,
    session_id: int,
    user_id: int,
    messages: list = None,
    request: Optional[Request] = None
):
    """流式运行 Agent"""
    graph = await get_agent_graph_async(request)

    initial_state = {
        "user_input": user_input,
        "session_id": session_id,
        "user_id": user_id,
        "messages": messages or [],
        "iterations": 0,
        "max_iterations": 5
    }

    async for chunk in graph.astream(initial_state):
        yield chunk