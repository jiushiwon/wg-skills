"""扫码登录测试用例"""
from app.routers.qr_login import build_wxacode_scene


def test_wxacode_scene_uses_session_id_without_prefix():
    session_id = "a" * 32

    scene = build_wxacode_scene(session_id)

    assert scene == session_id
    assert len(scene) <= 32
