#!/usr/bin/env python3
"""
svg2png.py - 使用本地 Edge/Chrome 将 SVG 渲染为 PNG

Usage:
  python3 scripts/svg2png.py input.svg
"""

import json
import platform
import re
import subprocess
import sys
import tempfile
from pathlib import Path


def find_browser():
    """搜索 Edge/Chrome，支持 Windows / macOS / Linux。"""
    system = platform.system()
    candidates = []
    if system == "Windows":
        candidates = [
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        ]
    elif system == "Darwin":
        candidates = [
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        ]
    else:  # Linux
        candidates = [
            "/usr/bin/microsoft-edge",
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
        ]
    for c in candidates:
        if Path(c).exists():
            return c
    return None


def parse_svg_size(svg_path: Path):
    """从 SVG 的 width/height 或 viewBox 解析尺寸。"""
    text = svg_path.read_text(encoding="utf-8")

    # 优先读取 width/height 属性
    m = re.search(r'<svg[^>]*?width="([0-9.]+)"', text)
    w = float(m.group(1)) if m else None
    m = re.search(r'<svg[^>]*?height="([0-9.]+)"', text)
    h = float(m.group(1)) if m else None
    if w and h:
        return int(w), int(h)

    # 其次读取 viewBox
    m = re.search(r'<svg[^>]*?viewBox="([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.]+)\s+([0-9.]+)"', text)
    if m:
        return int(float(m.group(3))), int(float(m.group(4)))

    # 兜底
    return 960, 1200


def check_node(skill_dir: Path):
    """检查 Node 是否安装。"""
    try:
        subprocess.run(["node", "--version"], cwd=skill_dir, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except FileNotFoundError:
        print("ERROR: Node.js not found. Please install Node.js first.")
        sys.exit(1)


def check_node_modules(skill_dir: Path):
    """检查 puppeteer-core 是否可被 Node 解析，缺失则安装。"""
    try:
        subprocess.run(["node", "-e", "require('puppeteer-core')"], cwd=skill_dir, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("[OK] puppeteer-core resolvable")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[MISSING] puppeteer-core, installing...")
        subprocess.run(["npm", "install", "puppeteer-core", "--no-save"], cwd=skill_dir, check=True)
        print("[OK] puppeteer-core installed")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/svg2png.py input.svg")
        sys.exit(1)

    svg_path = Path(sys.argv[1]).resolve()
    if not svg_path.exists():
        print(f"ERROR: file not found: {svg_path}")
        sys.exit(1)

    skill_dir = Path(__file__).parent.parent.resolve()

    browser = find_browser()
    if not browser:
        print("ERROR: Edge/Chrome not found.")
        sys.exit(1)

    check_node(skill_dir)
    check_node_modules(skill_dir)

    width, height = parse_svg_size(svg_path)
    png_path = svg_path.with_suffix(".png")
    scale = 2

    js_code = f'''const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {{
  const svgPath = {json.dumps(str(svg_path))};
  const pngPath = {json.dumps(str(png_path))};
  const browserPath = {json.dumps(browser)};
  const width = {width};
  const height = {height};
  const scale = {scale};

  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  const browser = await puppeteer.launch({{
    executablePath: browserPath,
    headless: 'new',
    args: []
  }});

  const page = await browser.newPage();
  await page.setViewport({{ width, height, deviceScaleFactor: scale }});

  const html = `<!DOCTYPE html>
<html><head><style>
  body {{ margin: 0; padding: 0; background: #fff; }}
  img {{ display: block; width: ${{width}}px; height: ${{height}}px; }}
</style></head><body>
  <img src="data:image/svg+xml;base64,${{Buffer.from(svgContent).toString('base64')}}" />
</body></html>`;

  await page.setContent(html, {{ waitUntil: 'networkidle0' }});
  await page.screenshot({{ path: pngPath, type: 'png', omitBackground: false }});
  await browser.close();
  console.log('PNG generated: ' + pngPath);
}})();
'''

    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', prefix='.tmp-svg2png-', delete=False,
                                     dir=str(skill_dir), encoding='utf-8') as f:
        f.write(js_code)
        renderer = f.name

    try:
        subprocess.run(["node", renderer], cwd=skill_dir, check=True)
    finally:
        Path(renderer).unlink(missing_ok=True)


if __name__ == "__main__":
    main()
