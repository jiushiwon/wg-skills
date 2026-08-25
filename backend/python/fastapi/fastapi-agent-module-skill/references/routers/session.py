# 会话管理路由

from fastapi import APIRouter, Depends
from src.agent.schemas import (
    SessionCreateRequest, SessionResponse, SessionListResponse
)
from src.auth.dependencies import get_current_user  # 复用 auth 模块
from src.auth.schemas import CurrentUser  # 复用 auth 模块
from src.agent.services.session_service import SessionService

router = APIRouter(prefix="/api/agent/sessions", tags=["会话管理"])


@router.get("")
async def list_sessions(
    page: int = 1,
    page_size: int = 10,
    current_user: CurrentUser = Depends(get_current_user)
):
    """会话列表"""
    return await SessionService.list_sessions(
        user_id=current_user.id,
        page=page,
        page_size=page_size
    )


@router.post("")
async def create_session(
    req: SessionCreateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """创建会话"""
    return await SessionService.create_session(
        user_id=current_user.id,
        title=req.title,
        model=req.model
    )


@router.get("/{session_id}")
async def get_session(
    session_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """获取会话"""
    return await SessionService.get_session(session_id, current_user.id)


@router.delete("/{session_id}")
async def delete_session(
    session_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """删除会话"""
    await SessionService.delete_session(session_id, current_user.id)
    return {"code": 0, "message": "删除成功"}


@router.get("/{session_id}/messages")
async def get_session_messages(
    session_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """获取会话消息"""
    return await SessionService.get_messages(session_id, current_user.id)
