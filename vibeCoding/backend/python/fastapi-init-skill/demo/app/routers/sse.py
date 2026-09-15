import asyncio
import json
from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse

from app.response import EnvelopeRoute
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter(route_class=EnvelopeRoute)


@router.get("/chat", summary="SSE 流式示例（无需登录）")
async def sse_chat():
    """SSE 流式推送示例——登录后可获取个性化消息。"""

    async def event_generator():
        messages = [
            {"role": "system", "content": "你好！我是 FastAPI 助理，支持 SSE 流式推送。"},
            {"role": "assistant", "content": "你正在体验 Server-Sent Events 实时流式传输。"},
            {"role": "assistant", "content": "这里的每一条消息都是逐条推送的，而不是一次性返回。"},
            {"role": "assistant", "content": "这种方式非常适合 AI 聊天、实时通知、日志推送等场景。"},
            {"role": "assistant", "content": "试着登录后调用 /api/sse/chat/protected 查看个性化推送。"},
        ]

        for msg in messages:
            yield {
                "event": "message",
                "data": json.dumps(msg, ensure_ascii=False),
                "retry": settings.sse_retry_timeout,
            }
            await asyncio.sleep(0.8)

        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    return EventSourceResponse(event_generator())


@router.get("/chat/protected", summary="SSE 流式（需登录）")
async def sse_chat_protected(current_user: dict = Depends(get_current_user)):
    async def event_generator():
        yield {
            "event": "message",
            "data": json.dumps({"role": "system", "content": f"你好 {current_user['username']}！"}, ensure_ascii=False),
            "retry": settings.sse_retry_timeout,
        }
        await asyncio.sleep(0.5)

        thoughts = [
            f"你的用户 ID 是 {current_user['user_id']}",
            "SSE 可以携带业务数据，比如实时状态更新",
            "还可以用来做进度条推送、直播弹幕等",
            "连接保持期间，服务端可以随时推送数据",
        ]
        for thought in thoughts:
            yield {
                "event": "message",
                "data": json.dumps({"role": "assistant", "content": thought}, ensure_ascii=False),
                "retry": settings.sse_retry_timeout,
            }
            await asyncio.sleep(0.8)

        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    return EventSourceResponse(event_generator())