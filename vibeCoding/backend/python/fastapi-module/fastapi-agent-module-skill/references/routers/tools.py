# Tool 路由
# 使用骨架的 EnvelopeRoute 实现统一响应

from fastapi import APIRouter, Depends
from src.auth.dependencies import get_current_user
from src.agent.tools.registry import ToolRegistry
from app.response import EnvelopeRoute

router = APIRouter(
    prefix="/api/agent/tools",
    tags=["工具管理"],
    route_class=EnvelopeRoute  # 使用骨架的统一响应
)


@router.get("")
async def list_tools(current_user=Depends(get_current_user)):
    """获取可用工具列表（仅返回工具元信息，不暴露执行接口）"""
    tools = ToolRegistry.get_definitions()
    return tools  # EnvelopeRoute 会自动包装

# 注意：已移除 /execute 接口
# Tool 只能通过 Agent 对话间接调用，防止越权执行
