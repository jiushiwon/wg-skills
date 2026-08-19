# SSE 流式框架集成指南

FastAPI 原生支持 StreamingResponse，但 SSE（Server-Sent Events）需要更结构化的处理。本框架使用 `sse-starlette` 作为 SSE 实现。

## 为什么选 sse-starlette

- FastAPI 社区最广泛使用的 SSE 库
- 支持事件类型（event）、事件 ID、自动重连（retry）
- 内置连接断开检测
- 与 FastAPI 的 `StreamingResponse` 完美兼容
- Starlette 官方维护

## 依赖

```
sse-starlette
```

## 快速开始

### 最简单的 SSE 端点

```python
import asyncio
import json
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter()

@router.get("/sse/simple")
async def simple_sse():
    async def event_generator():
        for i in range(10):
            data = {"count": i, "message": f"第 {i+1} 条消息"}
            yield {"event": "message", "data": json.dumps(data, ensure_ascii=False)}
            await asyncio.sleep(0.5)
        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    return EventSourceResponse(event_generator())
```

### 前端接收

```javascript
const eventSource = new EventSource("http://localhost:8080/api/sse/simple");

eventSource.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    console.log("收到消息:", data);
});

eventSource.addEventListener("done", (e) => {
    console.log("流式传输结束");
    eventSource.close();
});

eventSource.onerror = (e) => {
    console.error("SSE 连接错误", e);
};
```

### 带认证的 SSE

前端需要在 URL 中传递 Token（EventSource API 不支持自定义 Header）：

```javascript
const token = "eyJhbGciOi...";
const eventSource = new EventSource(`http://localhost:8080/api/sse/chat/protected?token=${token}`);
```

后端验证：

```python
from fastapi import APIRouter, Depends, Query
from app.dependencies import get_current_user
from app.utils.security import JWTUtil

router = APIRouter()

@router.get("/sse/protected")
async def protected_sse(token: str = Query(...), jwt: JWTUtil = Depends(get_jwt)):
    try:
        user = jwt.parse(token)
    except Exception:
        return EventSourceResponse(_error_generator("Token 无效"))

    async def event_generator():
        yield {"event": "message", "data": json.dumps({"content": f"你好 {user['username']}！"})}

    return EventSourceResponse(event_generator())
```

## 高级用法

### 超时与重连设置

```python
return EventSourceResponse(
    event_generator(),
    headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    # 前端将在连接断开后 3 秒自动重连
    ping=15,  # 每 15 秒发送心跳
    sep="\n",
)
```

### 心跳保活

```python
async def event_generator_with_heartbeat():
    for msg in messages:
        if await request.is_disconnected():
            break
        yield {"event": "message", "data": json.dumps(msg)}
        await asyncio.sleep(0.5)

    # 发送完成后保持连接一段时间
    while True:
        if await request.is_disconnected():
            break
        yield {"event": "ping", "data": ""}
        await asyncio.sleep(15)
```

### 对接 AI 大模型（OpenAI 格式）

```python
@router.get("/sse/ai-chat")
async def ai_chat(prompt: str = Query(...)):
    async def event_generator():
        async for chunk in openai_stream(prompt):
            if await request.is_disconnected():
                break
            yield {
                "event": "message",
                "data": json.dumps({"content": chunk, "role": "assistant"}, ensure_ascii=False),
            }
        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    return EventSourceResponse(event_generator())
```

## 与 EnvelopeRoute 的兼容性

SSE 端点通过 `EventSourceResponse` 返回，其 `Content-Type` 为 `text/event-stream`（非 `application/json`）。

`EnvelopeRoute` 会自动检测：非 JSON 响应直接透传，不会被包装成 `{ code, message, data }` 格式。因此 SSE 端点无需特殊处理。

唯一注意事项：SSE 端点抛出异常时，异常处理器会返回 `application/json` 的错误响应，这是预期行为——连接错误时客户端应收到 JSON 格式的错误信息。

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 浏览器只能接收到整个响应 | Nginx 缓冲了 SSE | Nginx 配置 `proxy_buffering off` |
| 连接频繁断开 | 无心跳保活 | 添加 `ping` 参数或心跳事件 |
| EventSource 无法携带自定义 Header | EventSource API 限制 | 通过 URL 参数传 Token；或用 Fetch API + ReadableStream |
| 前端收到乱码 | 未设置 UTF-8 | `json.dumps(data, ensure_ascii=False)` |
