# Tool 注册表

from typing import Dict, List, Optional
from src.agent.tools.base import Tool


class ToolRegistry:
    """Tool 注册表"""

    _tools: Dict[str, Tool] = {}

    @classmethod
    def register(cls, tool: Tool):
        """注册 Tool"""
        cls._tools[tool.name] = tool

    @classmethod
    def get(cls, name: str) -> Optional[Tool]:
        """获取 Tool"""
        return cls._tools.get(name)

    @classmethod
    def list_all(cls) -> List[Tool]:
        """列出所有 Tool"""
        return list(cls._tools.values())

    @classmethod
    def get_definitions(cls) -> List[dict]:
        """获取 Tool 定义（给 LLM 用）"""
        return [
            {
                "name": t.name,
                "description": t.description,
                "parameters": t.parameters
            }
            for t in cls._tools.values()
        ]

    @classmethod
    async def execute(cls, name: str, **kwargs) -> any:
        """执行 Tool"""
        tool = cls.get(name)
        if not tool:
            return {"error": f"Tool {name} 不存在"}
        return await tool.execute(**kwargs)


# 注册内置 Tools
def register_builtin_tools():
    """注册内置 Tools"""
    from src.agent.tools.user_tools import (
        get_user_info, get_user_roles, get_user_menus, search_users
    )
    from src.agent.tools.org_tools import (
        get_org_tree, get_org_detail, get_post_list, get_tenant_info
    )

    # 用户相关
    ToolRegistry.register(get_user_info)
    ToolRegistry.register(get_user_roles)
    ToolRegistry.register(get_user_menus)
    ToolRegistry.register(search_users)

    # 组织架构相关
    ToolRegistry.register(get_org_tree)
    ToolRegistry.register(get_org_detail)
    ToolRegistry.register(get_post_list)
    ToolRegistry.register(get_tenant_info)


# 初始化时注册
register_builtin_tools()
