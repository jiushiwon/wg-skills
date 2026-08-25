# Tool 基类
# ✅ 修复 P0-S2: 参数日志脱敏（只记参数名 + 类型）
# ✅ 修复 P0-S4: 结构化审计日志
# ✅ 修复 P0-S6: Pydantic Schema 校验（替换手写类型转换）
# ✅ 修复 P0-A1: current_user_id 不允许默认值
# ✅ 修复 P0-S1: Tool 错误返回固定话术，不暴露内部异常

import inspect
import logging
from typing import Any, Callable, Dict, Optional, get_type_hints
from pydantic import BaseModel, Field, create_model, ValidationError
from src.agent.audit import audit_logger

logger = logging.getLogger(__name__)

# Tool 错误返回给 LLM 的固定话术（避免内部异常泄露到 LLM 上下文）
TOOL_ERROR_MSG = "工具执行失败，请重试或换个工具"


class ToolParameter(BaseModel):
    """Tool 参数定义"""
    name: str
    type: str = "any"
    required: bool = False
    default: Any = None
    description: str = ""
    # ✅ Pydantic 字段约束（修复 P0-S6）
    ge: Optional[float] = None
    le: Optional[float] = None
    max_length: Optional[int] = None
    pattern: Optional[str] = None


class Tool(BaseModel):
    """Tool 定义"""
    name: str
    description: str
    func: Callable = None
    parameters: Dict[str, ToolParameter] = {}
    # ✅ Pydantic 校验模型（自动从签名推导）
    _validator_model: Optional[type] = None

    class Config:
        arbitrary_types_allowed = True

    @classmethod
    def from_function(cls, func: Callable) -> "Tool":
        """从函数自动生成 Tool"""
        sig = inspect.signature(func)
        desc = func.__doc__ or "无描述"

        # ✅ 修复：使用 typing.get_type_hints 获取真实类型（解决 Optional[int] 等复合类型）
        try:
            type_hints = get_type_hints(func)
        except Exception:
            type_hints = {}

        params = {}
        validator_fields = {}
        for pname, param in sig.parameters.items():
            # ✅ 修复：必需参数判断（不再被 None default 误导）
            has_default = param.default is not inspect.Parameter.empty
            annotation = type_hints.get(pname, str)

            # ✅ 修复：current_user_id 必须是必需参数，不允许默认值
            if pname == "current_user_id" and has_default:
                logger.warning(
                    f"Tool {func.__name__} 的 current_user_id 参数不应有默认值，强制设为必需"
                )
                has_default = False

            params[pname] = ToolParameter(
                name=pname,
                type=_type_to_str(annotation),
                required=not has_default,
                default=param.default if has_default else None,
                description=f"参数 {pname}"
            )

            # 构建 Pydantic 校验字段
            validator_fields[pname] = _build_pydantic_field(annotation, has_default, param.default)

        # ✅ 创建 Pydantic 校验模型
        try:
            validator_model = create_model(
                f"{func.__name__}_Validator",
                **validator_fields
            )
        except Exception as e:
            logger.warning(f"无法为 Tool {func.__name__} 创建 Pydantic 校验模型: {e}")
            validator_model = None

        instance = cls(
            name=func.__name__,
            description=desc.strip(),
            func=func,
            parameters=params
        )
        instance._validator_model = validator_model
        return instance

    def validate_arguments(self, **kwargs) -> Dict[str, Any]:
        """✅ 修复 P0-S6：使用 Pydantic 模型进行参数校验"""
        if self._validator_model is not None:
            try:
                validated = self._validator_model(**kwargs)
                return validated.model_dump(exclude_none=True)
            except ValidationError as e:
                # 提取用户友好的错误信息（不暴露内部堆栈）
                msg = "; ".join(
                    f"{'.'.join(str(x) for x in err['loc'])}: {err['msg']}"
                    for err in e.errors()
                )
                raise ValueError(f"参数校验失败: {msg}") from None

        # 兜底：使用旧的简单校验（兼容极端情况）
        return self._legacy_validate(**kwargs)

    def _legacy_validate(self, **kwargs) -> Dict[str, Any]:
        """旧版简单校验（仅作为兜底）"""
        validated = {}
        for param_name, param_def in self.parameters.items():
            if param_name in kwargs and kwargs[param_name] is not None:
                value = kwargs[param_name]
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

    async def execute(self, user_id: int = None, **kwargs) -> Any:
        """执行 Tool（带 Pydantic 校验 + 审计 + 异常脱敏）"""
        if not self.func:
            return {"error": TOOL_ERROR_MSG}

        # ✅ 强制注入 current_user_id（修复 P0-A1）
        if "current_user_id" in self.parameters:
            if user_id is None:
                audit_logger.log_tool_failure(
                    user_id=None, tool_name=self.name,
                    error="missing current_user_id", session_id=kwargs.get("_session_id")
                )
                return {"error": "无法识别当前用户"}
            kwargs["current_user_id"] = user_id

        try:
            # ✅ Pydantic 校验
            validated_args = self.validate_arguments(**kwargs)

            # ✅ 修复 P0-S2：日志只记参数名 + 类型，不记值
            args_meta = {k: type(v).__name__ for k, v in validated_args.items()}
            logger.info(f"执行 Tool: {self.name}, 参数签名: {args_meta}")

            # ✅ 修复 P0-S4：审计日志
            audit_logger.log_tool_call(
                user_id=user_id or validated_args.get("current_user_id"),
                tool_name=self.name,
                args=validated_args,
                success=True,
                session_id=kwargs.get("_session_id")
            )

            if inspect.iscoroutinefunction(self.func):
                result = await self.func(**validated_args)
            else:
                result = self.func(**validated_args)

            return result
        except ValueError as e:
            # 参数错误：客户端问题，记录 warn
            logger.warning(f"Tool {self.name} 参数错误: {e}")
            return {"error": f"参数错误: {str(e)}"}
        except Exception as e:
            # ✅ 修复 P0-S1：返回固定话术，真实异常写服务端日志
            logger.exception(f"Tool {self.name} 执行失败")
            audit_logger.log_tool_failure(
                user_id=user_id, tool_name=self.name,
                error=str(e), session_id=kwargs.get("_session_id")
            )
            return {"error": TOOL_ERROR_MSG}


def _type_to_str(tp: Any) -> str:
    """把 Python 类型转为简单字符串（兼容 Optional/List 等）"""
    origin = getattr(tp, "__origin__", None)
    if origin is not None:
        return str(tp)
    name = getattr(tp, "__name__", None)
    if name:
        return name
    return str(tp)


def _build_pydantic_field(annotation: Any, has_default: bool, default: Any):
    """构建 Pydantic 字段（带边界/长度校验）"""
    # 兼容 Optional[T] 提取内部类型
    actual_type = annotation
    origin = getattr(annotation, "__origin__", None)
    if origin is not None:
        # List[T] / Optional[T] 等
        args = getattr(annotation, "__args__", ())
        if args:
            actual_type = args[0]

    if actual_type is int:
        return (int, Field(default=default if has_default else ..., ge=-2**31, le=2**31-1))
    if actual_type is float:
        return (float, Field(default=default if has_default else ..., ge=-1e10, le=1e10))
    if actual_type is str:
        return (str, Field(default=default if has_default else ..., max_length=10000))
    if actual_type is bool:
        return (bool, default if has_default else ...)
    # 默认：原类型，允许 None
    if has_default:
        return (Optional[actual_type], default)
    return (actual_type, ...)


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