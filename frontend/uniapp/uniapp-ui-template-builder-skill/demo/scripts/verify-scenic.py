"""H5 个人中心回归；依赖 Playwright 和 Edge，服务需预先启动。"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", default="http://127.0.0.1:5192")
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--channel", default="msedge")
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
scenes = ["glacier", "coral", "aurora", "forest", "cloud", "solid"]
errors, unexpected_assets, checks = [], [], []
with sync_playwright() as pw:
    browser = pw.chromium.launch(channel=args.channel, headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    page.on("pageerror", lambda error: errors.append(str(error)))
    def response(res):
        if res.status >= 400 and "/static/" in res.url and "missing-" not in res.url:
            unexpected_assets.append({"url": res.url, "status": res.status})
    page.on("response", response)
    def open_page(path):
        page.goto("about:blank")
        page.goto(args.url.rstrip("/") + "/#/pages/" + path)
        page.wait_for_selector(".base-card")
    def click(text):
        page.get_by_text(text, exact=True).first.click()
    for route, names in [("scenic", scenes), ("index", ["simple", "service", "commerce", "enterprise", "member"])]:
        for scene in names:
            for width in [320, 390, 430, 768]:
                page.set_viewport_size({"width": width, "height": 844})
                open_page(f"{route}?scene={scene}&preview=1")
                if route == "scenic":
                    if scene == "solid":
                        assert page.locator(".solid-circle").count() == 3
                        assert page.locator(".scenic-art").count() == 0
                        assert page.locator(".solid-decoration").evaluate("el=>getComputedStyle(el).pointerEvents") == "none"
                    else:
                        assert scene + "-background.jpg" in page.locator(".scenic-art img").get_attribute("src")
                assert not page.evaluate("document.documentElement.scrollWidth>innerWidth"), (route, scene, width)
                checks.append({"route": route, "scene": scene, "width": width, "overflow": False})
                if route == "scenic" and width == 390:
                    page.wait_for_timeout(250)
                    page.screenshot(path=str(args.output / (scene + "-runtime.png")))
    page.set_viewport_size({"width": 390, "height": 844})
    for scene in scenes:
        open_page("scenic?scene=" + scene)
        click("长昵称")
        assert not page.evaluate("document.documentElement.scrollWidth>innerWidth")
        click("切换深色")
        assert page.locator(".scenic-shell").get_attribute("data-theme") == "dark"
        click("恢复默认")
        click("未登录"); click("模拟登录")
        assert page.locator(".identity").count() == 1
        click("失败"); click("重试")
        click("空记录")
        assert page.get_by_text("还没有相关记录", exact=True).count() == 1
        click("加载中")
        assert page.get_by_text("正在加载个人中心…", exact=True).count() == 1
        click("默认")
        page.locator(".grid-action, .menu-action").first.click()
        assert page.get_by_text("当前为本地模拟反馈", exact=False).count() > 0
        click("关闭")
        page.locator(".grid-action, .menu-action").first.focus()
        page.keyboard.press("Space")
        assert page.get_by_text("当前为本地模拟反馈", exact=False).count() > 0
        click("关闭")
        if scene != "solid":
            click("图片失败")
            page.wait_for_timeout(250)
            assert page.locator(".scenic-art").count() == 0
            click("恢复默认")
            assert page.locator(".scenic-art").count() == 1
        if scene == "cloud":
            click("今日打卡")
            page.wait_for_timeout(400)
            assert page.get_by_text("今日已打卡", exact=True).count() == 1
            assert "22 天" in page.locator(".scenic-content").inner_text()
        checks.append({"scene": scene, "state_and_interactions": "passed"})
    assert not errors, errors
    assert not unexpected_assets, unexpected_assets
    browser.close()
(args.output / "verification.json").write_text(json.dumps({"checks": checks, "page_errors": errors, "unexpected_assets": unexpected_assets}, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"通过：44 组场景/宽度检查、6 套交互状态；页面错误 {len(errors)}，非预期素材错误 {len(unexpected_assets)}")
