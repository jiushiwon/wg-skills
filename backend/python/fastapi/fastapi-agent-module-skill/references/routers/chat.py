# 对话路由

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from src.agent.schemas import (
    ChatRequest, ChatSyncRequest, ChatResponse, StreamChunk
)
from src.auth.dependencies import get_current_user  # 复用 auth 模块
from src.agent.services.chat_service import ChatService

router = APIRouter(prefix="/api/agent/chat", tags=["AI 对话"])


@router.post("")
async def chat(req: ChatRequest, current_user=Depends(get_current_user)):
    """流式对话"""
    if req.stream:
        return StreamingResponse(
            ChatService.stream_chat(
                message=req.message,
                session_id=req.session_id,
                user_id=current_user.id
            ),
            media_type="text/event-stream"
        )
    else:
        result = await ChatService.chat(
            message=req.message,
            session_id=req.session_id,
            user_id=current_user.id
        )
        return result


@router.post("/sync")
async def chat_sync(req: ChatSyncRequest, current_user=Depends(get_current_user)):
    """同步对话（非流式）"""
    result = await ChatService.chat(
        message=req.message,
        session_id=req.session_id,
        user_id=current_user.id
    )
    return result
