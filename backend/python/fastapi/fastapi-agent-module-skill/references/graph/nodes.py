# Agent 节点函数

from typing import Dict, Any
from langgraph.graph import StateGraph
from src.agent.graph.state import AgentState
from src.agent.tools.registry import ToolRegistry
from src.agent.llm.base import Message


async def node_llm_think(state: AgentState) -> Dict[str, Any]:
    """LLM 思考节点"""
    from src.agent.graph.agent import get_llm

    llm = get_llm()

    # 构建消息
    messages = [Message(role=m["role"], content=m["content"]) for m in state.messages]

    # 添加用户最新输入
    if state.user_input:
        messages.append(Message(role="user", content=state.user_input))

    # 获取 Tool 定义
    tools = ToolRegistry.get_definitions()

    # 调用 LLM
    response = await llm.chat(messages, tools=tools if tools else None)

    # 更新状态
    updates = {
        "llm_response": response.content,
        "iterations": state.iterations + 1
    }

    # 如果有 Tool Calls
    if response.tool_calls:
        updates["tool_calls"] = [
            {"name": tc.name, "arguments": tc.arguments}
            for tc in response.tool_calls
        ]

    return updates


async def node_execute_tools(state: AgentState) -> Dict[str, Any]:
    """执行 Tools 节点"""
    tool_results = []

    for tc in state.tool_calls:
        tool_name = tc.get("name")
        arguments = tc.get("arguments", {})

        # 执行 Tool
        result = await ToolRegistry.execute(tool_name, **arguments)

        tool_results.append({
            "tool_name": tool_name,
            "arguments": arguments,
            "result": str(result)
        })

        # 添加到消息历史
        state.messages.append({
            "role": "tool",
            "content": f"[{tool_name}]: {result}"
        })

    return {"tool_results": tool_results}


async def node_generate_response(state: AgentState) -> Dict[str, Any]:
    """生成最终响应"""
    # 如果有 Tool 调用结果，让 LLM 根据结果生成最终回复
    if state.tool_results:
        from src.agent.graph.agent import get_llm

        llm = get_llm()

        # 构建消息（含 Tool 结果）
        messages = [Message(role=m["role"], content=m["content"]) for m in state.messages]

        # 添加总结 prompt
        summary_prompt = "根据上面的工具执行结果，给用户一个清晰的回答。"
        messages.append(Message(role="user", content=summary_prompt))

        response = await llm.chat(messages)
        return {"final_response": response.content}

    # 直接返回 LLM 响应
    return {"final_response": state.llm_response}


def should_continue(state: AgentState) -> str:
    """判断是否继续"""
    # 超过最大迭代次数
    if state.iterations >= state.max_iterations:
        return "end"

    # 有 Tool Calls 需要执行
    if state.tool_calls:
        return "execute_tools"

    # 无 Tool Calls，生成最终响应
    return "respond"
