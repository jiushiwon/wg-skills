"""
扫码登录 API
- 网站生成扫码会话（pending）
- 小程序扫码确认（confirmed）
- 网站轮询获取 token
"""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request, Depends
from app.utils.response import success, error
from app.utils.db import get_db
from app.utils.auth import create_token, get_current_user

router = APIRouter(prefix="/auth/qr", tags=["扫码登录"])

SESSION_TTL_MINUTES = 5  # 会话有效期


def _now():
    return datetime.now(timezone.utc)


def _as_aware(dt):
    """MongoDB 默认返回 naive datetime（按 UTC 存），比较前统一补 UTC 时区，
    避免 offset-naive 与 offset-aware 比较抛 TypeError"""
    if dt is not None and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _session_col():
    return get_db()["qr_sessions"]


@router.post("/create")
async def create_session(source: str = "login"):
    """网站调用：创建扫码登录会话，返回 session_id 供前端生成二维码"""
    session_id = uuid.uuid4().hex
    doc = {
        "_id": session_id,
        "source": source,          # login / share / ...
        "status": "pending",       # pending → scanned → confirmed / expired
        "user_id": None,
        "token": None,
        "created_at": _now(),
        "expires_at": _now() + timedelta(minutes=SESSION_TTL_MINUTES),
    }
    await _session_col().insert_one(doc)
    return success({"session_id": session_id, "expires_in": SESSION_TTL_MINUTES * 60, "source": source})


@router.get("/status/{session_id}")
async def poll_status(session_id: str):
    """网站轮询：查询会话状态，confirmed 时返回 token"""
    col = _session_col()
    doc = await col.find_one({"_id": session_id})
    if not doc:
        return error("会话不存在", 404)

    # 过期检查
    if _as_aware(doc["expires_at"]) <= _now():
        await col.update_one({"_id": session_id}, {"$set": {"status": "expired"}})
        return success({"status": "expired"})

    if doc["status"] == "confirmed" and doc.get("token"):
        return success({"status": "confirmed", "token": doc["token"]})

    return success({"status": doc["status"]})


@router.post("/scan")
async def scan_session(request: Request, user_id: str = Depends(get_current_user)):
    """小程序调用：用户扫码后标记为 scanned（前端展示确认弹框前调用）"""
    body = await request.json()
    session_id = body.get("session_id", "") if isinstance(body, dict) else None
    session_id = session_id.strip() if isinstance(session_id, str) else ""
    if not session_id:
        return error("缺少 session_id", 400)

    col = _session_col()
    # 状态、归属和有效期在同一次写入中校验，避免并发扫码抢占。
    result = await col.update_one(
        {"_id": session_id, "status": "pending", "user_id": None,
         "expires_at": {"$gt": _now()}},
        {"$set": {"status": "scanned", "user_id": user_id}}
    )
    if result.matched_count:
        return success({"status": "scanned"})
    return await _transition_result(col, session_id, user_id, ("scanned", "confirmed"))


async def _transition_result(col, session_id, user_id, allowed_statuses):
    """条件写入未命中时区分错误，并允许同账号安全重试。"""
    doc = await col.find_one({"_id": session_id})
    if not doc:
        return error("会话不存在", 404)
    if _as_aware(doc["expires_at"]) <= _now() or doc["status"] == "expired":
        return error("会话已过期", 410)
    if doc.get("user_id") and doc["user_id"] != user_id:
        return error("会话已由其他账号扫码", 403)
    if doc.get("user_id") == user_id and doc["status"] in allowed_statuses:
        return success({"status": doc["status"]})
    return error("会话状态异常，请先扫码", 400)


@router.post("/confirm")
async def confirm_session(request: Request, user_id: str = Depends(get_current_user)):
    """小程序调用：用户确认登录，生成 JWT 并绑定到会话"""
    body = await request.json()
    session_id = body.get("session_id", "") if isinstance(body, dict) else None
    session_id = session_id.strip() if isinstance(session_id, str) else ""
    if not session_id:
        return error("缺少 session_id", 400)

    col = _session_col()
    token = create_token(user_id)
    result = await col.update_one(
        {"_id": session_id, "status": "scanned", "user_id": user_id,
         "expires_at": {"$gt": _now()}},
        {"$set": {"status": "confirmed", "user_id": user_id, "token": token}}
    )
    if result.matched_count:
        return success({"status": "confirmed"})
    return await _transition_result(col, session_id, user_id, ("confirmed",))


# ============================================================
# 微信小程序码（微信原生扫一扫直接打开小程序确认页）
# ============================================================
import httpx
from fastapi.responses import Response
from app.config import settings

_WX_ACODE_URL = "https://api.weixin.qq.com/wxa/getwxacodeunlimit"
_WX_TOKEN_CACHE = {"token": None, "expires_at": None}
WX_SCENE_MAX_LENGTH = 32


def build_wxacode_scene(session_id: str) -> str:
    """微信小程序码 scene 最多 32 个可见字符，直接复用 32 位会话 ID。"""
    scene = session_id.strip()
    if not scene or len(scene) > WX_SCENE_MAX_LENGTH:
        raise ValueError("扫码会话 ID 不符合微信 scene 长度限制")
    return scene


async def _wx_access_token():
    """获取微信 access_token（缓存，提前 60 秒过期）"""
    now = _now()
    cached = _WX_TOKEN_CACHE
    if cached["token"] and cached["expires_at"] and cached["expires_at"] > now + timedelta(seconds=60):
        return cached["token"]
    if not settings.WX_APPID or not settings.WX_APPSECRET:
        return None
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            settings.WX_TOKEN_URL,
            params={
                "grant_type": "client_credential",
                "appid": settings.WX_APPID,
                "secret": settings.WX_APPSECRET,
            },
        )
        data = r.json()
    token = data.get("access_token")
    if not token:
        return None
    cached["token"] = token
    cached["expires_at"] = now + timedelta(seconds=data.get("expires_in", 7200))
    return token


@router.get("/wxacode/{session_id}")
async def get_wxacode(session_id: str, source: str = "login"):
    """网站调用：生成小程序码 PNG，微信扫一扫直达确认页。"""
    col = _session_col()
    doc = await col.find_one({"_id": session_id})
    if not doc:
        return error("会话不存在", 404)
    if _as_aware(doc["expires_at"]) < _now():
        return error("会话已过期", 410)

    token = await _wx_access_token()
    if not token:
        return error("微信凭证未配置或获取 access_token 失败", 500)

    # 小程序同时兼容纯 session_id 与历史 source:session_id；此处使用前者以满足微信 32 位限制。
    scene = build_wxacode_scene(session_id)

    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            _WX_ACODE_URL,
            params={"access_token": token},
            json={
                "scene": scene,
                "page": "pages/qr-login/index",
                "check_path": False,  # 兼容新版小程序码刚发布、CDN 未全量的窗口期
            },
        )
    if r.headers.get("content-type", "").startswith("image"):
        return Response(content=r.content, media_type=r.headers["content-type"])
    return error(f"微信生成小程序码失败: {r.text[:200]}", 502)
