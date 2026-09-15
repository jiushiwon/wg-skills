import json
from fastapi import Request, Response
from fastapi.routing import APIRoute
from fastapi.responses import JSONResponse, StreamingResponse


class EnvelopeRoute(APIRoute):
    """统一响应信封路由。

    handler 返回 dict/Pydantic 模型 → 自动包装为 { code: 0, message: "success", data: ... }
    StreamingResponse（SSE、文件下载等）直接透传，不包信封。
    """

    def get_route_handler(self):
        original = super().get_route_handler()

        async def custom_handler(request: Request) -> Response:
            response = await original(request)
            # ponytail: 只包装明确的 JSONResponse，流式/文件响应一律透传
            if isinstance(response, StreamingResponse):
                return response
            if not isinstance(response, JSONResponse):
                return response
            body = response.body
            if body is None:
                return JSONResponse({"code": 0, "message": "success", "data": None}, status_code=200)
            # FastAPI JSONResponse body 是 bytes
            data = body.decode("utf-8") if isinstance(body, bytes) else body
            if isinstance(data, str):
                data = json.loads(data)
            return JSONResponse({"code": 0, "message": "success", "data": data}, status_code=200)

        return custom_handler


def api_response(data=None, code=0, message="success"):
    """仅供 exception_handler 构造信封；handler 禁止调用。"""
    return {"code": code, "message": message, "data": data}