# LangGraph Agent 定义

from typing import Optional
from langgraph.graph import StateGraph, END
from src.agent.graph.state import AgentState
from src.agent.graph.nodes import (
    node_llm_think, node_execute_tools, node_generate_response, should_continue
)
from src.agent.llm.base import LLMBase
from src.agent.llm.openai import OpenAILLM


# 全局 LLM 实例
_llm: Optional[LLMBase] = None


def get_llm() -> LLMBase:
    """获取 LLM 实例"""
    global _llm
    if _llm is None:
        # 默认使用 OpenAI
        from config import settings
        _llm = OpenAILLM(
            model=settings.AGENT_MODEL or "gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY
        )
    return _llm


def set_llm(llm: LLMBase):
    """设置 LLM 实例"""
    global _llm
    _llm = llm


def create_agent_graph() -> StateGraph:
    """创建 Agent 图"""
    graph = StateGraph(AgentState)

    # 添加节点
    graph.add_node("think", node_llm_think)
    graph.add_node("execute_tools", node_execute_tools)
    graph.add_node("respond", node_generate_response)

    # 设置入口
    graph.set_entry_point("think")

    # 添加边
    graph.add_conditional_edges(
        "think",
        should_continue,
        {
            "execute_tools": "execute_tools",
            "respond": "respond"
        }
    )

    graph.add_edge("execute_tools", "think")  # 执行完 Tool 后继续思考
    graph.add_edge("respond", END)

    return graph


# 创建编译后的图
_agent_graph = None


def get_agent_graph() -> StateGraph:
    """获取编译后的 Agent 图"""
    global _agent_graph
    if _agent_graph is None:
        _agent_graph = create_agent_graph().compile()
    return _agent_graph


async def run_agent(
    user_input: str,
    session_id: int,
    user_id: int,
    messages: list = None
) -> str:
    """运行 Agent"""
    graph = get_agent_graph()

    # 初始状态
    initial_state = {
        "user_input": user_input,
        "session_id": session_id,
        "user_id": user_id,
        "messages": messages or [],
        "iterations": 0,
        "max_iterations": 5
    }

    # 运行
    result = await graph.ainvoke(initial_state)

    return result.get("final_response", "")


async def run_agent_stream(
    user_input: str,
    session_id: int,
    user_id: int,
    messages: list = None
):
    """流式运行 Agent"""
    graph = get_agent_graph()

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
