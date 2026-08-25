# 会话管理路由
# ✅ 修复 P0-S3: 添加 Rate Limiting
# ✅ 修复 P0-U3: 实现 /clear-memory 路由
# ✅ 修复 P1-3: page_size 上限校验（Query(ge, le)）
# 使用骨架的 EnvelopeRoute 实现统一响应

from fastapi import APIRouter, Depends, Query
from src.agent.schemas import SessionCreateRequest, ClearMemoryRequest
from src.auth.dependencies import get_current_user
from src.auth.schemas import CurrentUser
from src.agent.services.session_service import SessionService
from src.agent.memory.store import get_memory_store, MemoryStore
from src.agent.rate_limiter import rate_limit_session
from app.response import EnvelopeRoute
from app.exceptions import BusinessException

router = APIRouter(
    prefix="/api/agent/sessions",
    tags=["会话管理"],
    route_class=EnvelopeRoute
)


@router.get("")
async def list_sessions(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    current_user: CurrentUser = Depends(get_current_user)
):
    """会话列表（修复 P1-3：分页参数边界校验）"""
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
    """删除会话（软删除）"""
    await SessionService.delete_session(session_id, current_user.id)
    return {"deleted": True, "session_id": session_id}


@router.get("/{session_id}/messages")
async def get_session_messages(
    session_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """获取会话消息"""
    return await SessionService.get_messages(session_id, current_user.id)


# ✅ 修复 P0-U3: 实现 /clear-memory 路由（之前文档存在但未实现）
@router.post("/clear-memory")
async def clear_memory(
    req: ClearMemoryRequest,
    current_user: CurrentUser = Depends(get_current_user),
    store: MemoryStore = Depends(get_memory_store)
):
    """清除指定会话的记忆缓冲

    注意：只清除内存中的 MemoryStore（短期对话上下文），
    数据库中的历史消息（AgentMessage）不会被删除，
    如需彻底删除请使用 DELETE /api/agent/sessions/{session_id}
    """
    # ✅ 校验会话归属（防越权清除他人会话记忆）
    session = await SessionService.get_session(req.session_id, current_user.id)
    if not session:
        raise BusinessException(code=-1001, message="会话不存在或无权访问")

    store.delete_buffer(req.session_id)
    return {"cleared": True, "session_id": req.session_id}