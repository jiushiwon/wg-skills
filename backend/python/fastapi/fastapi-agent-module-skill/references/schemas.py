# Agent 模块 Pydantic Schemas

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ===== 对话 =====
class ChatRequest(BaseModel):
    """对话请求"""
    message: str = Field(..., min_length=1, max_length=10000, description="用户消息")
    session_id: Optional[int] = None
    stream: bool = True


class ChatSyncRequest(BaseModel):
    """同步对话请求"""
    message: str = Field(..., min_length=1, max_length=10000, description="用户消息")
    session_id: Optional[int] = None


class ChatResponse(BaseModel):
    """对话响应"""
    session_id: int
    message: str
    tool_calls: Optional[List[Dict]] = None


class StreamChunk(BaseModel):
    """流式输出块"""
    type: str  # token, tool_call, tool_result, done
    content: str
    tool_name: Optional[str] = None


# ===== 会话 =====
class SessionCreateRequest(BaseModel):
    """创建会话"""
    title: Optional[str] = None
    model: str = "gpt-4o-mini"


class SessionResponse(BaseModel):
    """会话响应"""
    id: int
    user_id: int
    title: str
    model: str
    status: int
    created_at: Optional[str]


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
    session_id: int


# ===== 配置 =====
class AgentConfig(BaseModel):
    """Agent 配置"""
    model: str = "gpt-4o-mini"
    temperature: float = 0.7
    max_tokens: int = 2048
    memory_turns: int = 20
    system_prompt: Optional[str] = None
