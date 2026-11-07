# Tool 注册表
# ✅ 修复 P1-P7: 启动时同步注册，无需运行时锁（避免阻塞事件循环）

import logging
from typing import Dict, List, Optional
from src.agent.tools.base import Tool


class ToolRegistry:
    """Tool 注册表（启动时一次性同步注册，无需锁）"""

    _tools: Dict[str, Tool] = {}

    @classmethod
    def register(cls, tool: Tool):
        """注册 Tool（启动时调用，无需锁）"""
        if tool.name in cls._tools:
            logging.getLogger(__name__).warning(
                f"Tool {tool.name} 已存在，跳过重复注册"
            )
            return
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
                "parameters": {
                    pn: {
                        "type": pd.type,
                        "required": pd.required,
                        "description": pd.description
                    }
                    for pn, pd in t.parameters.items()
                }
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


# 注册内置 Tools（在模块导入时执行一次）
def register_builtin_tools():
    """注册内置 Tools"""
    from src.agent.tools.user_tools import (
        get_user_info, get_user_roles, get_user_menus, search_users
    )
    from src.agent.tools.org_tools import (
        get_org_tree, get_org_detail, get_post_list, get_tenant_info
    )
    from src.agent.tools.file_tools import (  # ✅ 文件操作 Tools（编程助手标准实现）
        safe_read_file, safe_write_file
    )

    ToolRegistry.register(get_user_info)
    ToolRegistry.register(get_user_roles)
    ToolRegistry.register(get_user_menus)
    ToolRegistry.register(search_users)

    ToolRegistry.register(get_org_tree)
    ToolRegistry.register(get_org_detail)
    ToolRegistry.register(get_post_list)
    ToolRegistry.register(get_tenant_info)

    # ✅ 文件操作 Tools（编程助手场景）
    ToolRegistry.register(safe_read_file)
    ToolRegistry.register(safe_write_file)


# ✅ 修复 P1-P7: 模块加载时执行（启动一次性，FastAPI lifespan 中也可调用一次）
register_builtin_tools()