# Agent 模块 SQLModel 模型
# 使用骨架的 settings.db_prefix 作为表前缀

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from app.config import settings


def _utc_now() -> datetime:
    """统一的当前时间函数"""
    return datetime.utcnow()


class AgentSession(SQLModel, table=True):
    """AI 对话会话"""
    __tablename__ = f"{settings.db_prefix}_agent_session"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(description="关联用户ID")
    title: str = Field(max_length=200, description="会话标题")
    model: str = Field(default="gpt-4o-mini", description="使用的模型")
    status: int = Field(default=1, description="状态 0结束 1活跃")
    created_at: Optional[datetime] = Field(default_factory=_utc_now, description="创建时间")
    updated_at: Optional[datetime] = Field(default_factory=_utc_now, description="更新时间")
    deleted_at: Optional[datetime] = Field(default=None, description="软删除时间")


class AgentMessage(SQLModel, table=True):
    """对话消息"""
    __tablename__ = f"{settings.db_prefix}_agent_message"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(description="会话ID")
    role: str = Field(description="角色 user/assistant/system/tool")
    content: str = Field(description="消息内容")
    tool_name: Optional[str] = Field(default=None, description="调用的工具名")
    tool_result: Optional[str] = Field(default=None, description="工具返回结果")
    tokens: Optional[int] = Field(default=None, description="消耗 token 数")
    created_at: Optional[datetime] = Field(default_factory=_utc_now, description="创建时间")