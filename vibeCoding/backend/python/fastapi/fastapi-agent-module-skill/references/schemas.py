# Agent 模块 Pydantic Schemas
# ✅ 修复 P1-S2: model 字段白名单（防止任意模型调用造成财务/审计风险）
# ✅ 修复 P2-2: title 长度限制
# ✅ 修复 P1-U: ChatSyncRequest 删除（未实现路由）

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal


# ===== 允许的模型白名单（修复 P1-S2）=====
# 防止客户端任意指定模型造成财务损失或绕过审计
ALLOWED_MODELS = Literal[
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-4-turbo",
    "claude-3-haiku-20240307",
    "claude-3-sonnet-20240229",
    "claude-3-5-sonnet-20241022",
]


# ===== 对话 =====
class ChatRequest(BaseModel):
    """对话请求"""
    message: str = Field(..., min_length=1, max_length=10000, description="用户消息")
    session_id: Optional[int] = Field(default=None, ge=1, description="会话ID")
    stream: bool = Field(default=True, description="是否流式响应")


# ===== 会话 =====
class SessionCreateRequest(BaseModel):
    """创建会话"""
    # ✅ 修复 P2-2: title 长度限制
    title: Optional[str] = Field(default=None, max_length=200, description="会话标题")
    # ✅ 修复 P1-S2: model 字段白名单（Literal 枚举）
    model: ALLOWED_MODELS = Field(default="gpt-4o-mini", description="使用的模型")


class SessionResponse(BaseModel):
    """会话响应"""
    id: int
    user_id: int
    title: str
    model: str
    status: int
    created_at: Optional[str]
    updated_at: Optional[str] = None
    deleted_at: Optional[str] = None


class SessionListResponse(BaseModel):
    """会话列表"""
    items: List[SessionResponse]
    total: int
    page: int
    page_size: int


# ===== 消息 =====
class MessageResponse(BaseModel):
    """消息响应"""
    id: int
    session_id: int
    role: str
    content: str
    tool_name: Optional[str]
    tool_result: Optional[str]
    created_at: Optional[str]


# ===== Tool =====
class ToolDefine(BaseModel):
    """Tool 定义"""
    name: str
    description: str
    parameters: Dict[str, Any]


class ToolListResponse(BaseModel):
    """工具列表"""
    tools: List[ToolDefine]


# ===== 记忆 =====
class ClearMemoryRequest(BaseModel):
    """清除记忆"""
    session_id: int = Field(..., ge=1, description="会话ID")


# ===== 配置 =====
class AgentConfig(BaseModel):
    """Agent 配置"""
    model: ALLOWED_MODELS = Field(default="gpt-4o-mini", description="使用的模型")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="温度参数")
    max_tokens: int = Field(default=2048, ge=1, le=32000, description="最大token数")
    memory_turns: int = Field(default=20, ge=1, le=100, description="保留轮数")
    system_prompt: Optional[str] = Field(default=None, max_length=10000, description="系统提示词")