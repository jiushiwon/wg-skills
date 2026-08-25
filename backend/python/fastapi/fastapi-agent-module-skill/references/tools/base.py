# Tool 基类

import inspect
import logging
from typing import Any, Callable, Dict, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ToolParameter(BaseModel):
    """Tool 参数定义"""
    name: str
    type: str = "any"
    required: bool = False
    default: Any = None
    description: str = ""


class Tool(BaseModel):
    """Tool 定义"""
    name: str
    description: str
    func: Callable = None
    parameters: Dict[str, ToolParameter] = {}

    class Config:
        arbitrary_types_allowed = True

    @classmethod
    def from_function(cls, func: Callable) -> "Tool":
        """从函数自动生成 Tool"""
        sig = inspect.signature(func)
        desc = func.__doc__ or "无描述"

        # 解析参数
        params = {}
        for name, param in sig.parameters.items():
            params[name] = ToolParameter(
                name=name,
                type=param.annotation.__name__ if param.annotation != inspect.Parameter.empty else "any",
                required=param.default == inspect.Parameter.empty,
                default=param.default if param.default != inspect.Parameter.empty else None,
                description=f"参数 {name}"
            )

        return cls(
            name=func.__name__,
            description=desc.strip(),
            func=func,
            parameters=params
        )

    def validate_arguments(self, **kwargs) -> Dict[str, Any]:
        """校验并过滤参数"""
        validated = {}
        for param_name, param_def in self.parameters.items():
            if param_name in kwargs:
                value = kwargs[param_name]
                # 类型检查
                if param_def.type == "int" and not isinstance(value, int):
                    try:
                        value = int(value)
                    except (ValueError, TypeError):
                        if param_def.required:
                            raise ValueError(f"参数 {param_name} 必须是整数")
                        value = param_def.default
                elif param_def.type == "str" and not isinstance(value, str):
                    value = str(value)
                validated[param_name] = value
            elif param_def.required:
                if param_def.default is not None:
                    validated[param_name] = param_def.default
                else:
                    raise ValueError(f"缺少必需参数: {param_name}")
            elif param_def.default is not None:
                validated[param_name] = param_def.default
        return validated

    async def execute(self, **kwargs) -> Any:
        """执行 Tool（带参数校验）"""
        if not self.func:
            return {"error": "Tool 未实现"}

        try:
            # 校验参数
            validated_args = self.validate_arguments(**kwargs)

            # 记录执行日志
            logger.info(f"执行 Tool: {self.name}, 参数: {validated_args}")

            if inspect.iscoroutinefunction(self.func):
                result = await self.func(**validated_args)
            else:
                result = self.func(**validated_args)

            return result
        except Exception as e:
            logger.error(f"Tool {self.name} 执行失败: {e}")
            return {"error": f"Tool 执行失败: {str(e)}"}


def tool(name: str = None, description: str = None):
    """Tool 装饰器"""
    def decorator(func: Callable) -> Tool:
        tool_name = name or func.__name__
        tool_desc = description or (func.__doc__ or "").strip()
        tool_instance = Tool.from_function(func)
        tool_instance.name = tool_name
        tool_instance.description = tool_desc
        return tool_instance
    return decorator
