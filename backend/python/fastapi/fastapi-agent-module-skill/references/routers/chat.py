# 对话路由
# ✅ 修复 P0-S3: 添加 Rate Limiting（chat 接口 10 次/分钟）
# ✅ 修复 P0-P4: SSE 流式接口注入 Request 用于断连检测
# ✅ 修复 P0-P7: SSE 响应禁用代理缓冲
# ✅ 修复 P0-U1: 在接口文档中说明流式模式不支持 Tools
# 使用骨架的 EnvelopeRoute 实现统一响应

from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import StreamingResponse
from src.agent.schemas import ChatRequest
from src.auth.dependencies import get_current_user
from src.agent.services.chat_service import ChatService
from src.agent.rate_limiter import (
    rate_limit_chat, rate_limit_session, rate_limit_tool, SLOWAPI_AVAILABLE
)
from app.response import EnvelopeRoute

router = APIRouter(
    prefix="/api/agent/chat",
    tags=["AI 对话"],
    route_class=EnvelopeRoute
)


# ✅ 修复 P0-S3: 限流依赖注入
# 优先使用 slowapi（生产推荐），降级使用 in-memory token bucket（开发用）
_chat_rate_dep = rate_limit_chat()


@router.post(
    "",
    summary="AI 对话接口",
    description="""
发起 AI 对话，支持流式（SSE）与同步两种模式。

**限流**：每用户 10 次/分钟（防 LLM 财务风险）

**模式说明**：
- `stream=true`（默认）：流式响应，Server-Sent Events
- `stream=false`：同步响应，一次性返回完整结果

**流式模式限制**（P0-U1）：
- 当前流式接口（stream=true）仅返回 LLM 文本输出
- 由于 SSE 的 token-by-token 性质，Tool 调用（function calling）仅在同步模式生效
- 如需使用 Tools，请设置 `stream=false`
    """,
)
async def chat(
    req: ChatRequest,
    request: Request,
    current_user=Depends(get_current_user)
):
    """对话接口（统一入口，根据 stream 字段自动选择流式/同步）"""
    # ✅ Rate Limiting（兼容 slowapi 装饰器和降级方案）
    if not SLOWAPI_AVAILABLE:
        try:
            _chat_rate_dep(request)
        except HTTPException:
            raise

    if req.stream:
        return StreamingResponse(
            ChatService.stream_chat(
                message=req.message,
                session_id=req.session_id,
                user_id=current_user.id,
                request=request  # ✅ P0-P4: 断连检测
            ),
            media_type="text/event-stream",
            headers={
                # ✅ P0-P7: 禁用代理缓冲
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive"
            }
        )
    else:
        # 同步模式：支持 Tools
        result = await ChatService.chat(
            message=req.message,
            session_id=req.session_id,
            user_id=current_user.id
        )
        return result