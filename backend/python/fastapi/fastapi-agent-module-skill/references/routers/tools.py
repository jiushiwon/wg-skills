# Tool 路由

from fastapi import APIRouter, Depends
from src.agent.schemas import ToolListResponse
from src.auth.dependencies import get_current_user  # 复用 auth 模块
from src.agent.tools.registry import ToolRegistry

router = APIRouter(prefix="/api/agent/tools", tags=["工具管理"])


@router.get("")
async def list_tools(current_user=Depends(get_current_user)):
    """获取可用工具列表（仅返回工具元信息，不暴露执行接口）"""
    tools = ToolRegistry.get_definitions()
    return {"code": 0, "data": tools}

# 注意：已移除 /execute 接口
# Tool 只能通过 Agent 对话间接调用，防止越权执行
