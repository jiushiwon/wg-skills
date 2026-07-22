#!/usr/bin/env python3
"""
svg2png.py - 使用本地 Edge/Chrome 将 SVG 渲染为 PNG

Usage:
  python3 scripts/svg2png.py input.svg
"""

import subprocess
import sys
from pathlib import Path


def find_browser():
    """在 Windows 上搜索 Edge/Chrome。"""
    candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for c in candidates:
        if Path(c).exists():
            return c
    return None


def check_node_modules(skill_dir: Path):
    """检查 puppeteer-core 是否可被 Node 解析。"""
    try:
        subprocess.run(["node", "-e", "require('puppeteer-core')"], cwd=skill_dir, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("[OK] puppeteer-core resolvable")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[MISSING] puppeteer-core, installing...")
        subprocess.run(["npm", "install", "puppeteer-core", "--no-save"], cwd=skill_dir, shell=True, check=True)
        print("[OK] puppeteer-core installed")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/svg2png.py input.svg")
        sys.exit(1)

    svg_path = Path(sys.argv[1]).resolve()
    skill_dir = Path(__file__).parent.parent.resolve()

    browser = find_browser()
    if not browser:
        print("ERROR: Edge/Chrome not found.")
        sys.exit(1)

    check_node_modules(skill_dir)

    renderer = skill_dir / "scripts" / "svg2png_core.js"
    renderer.write_text(f'''const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {{
  const svgPath = {repr(str(svg_path))};
  const pngPath = svgPath.replace('.svg', '.png');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  const browser = await puppeteer.launch({{
    executablePath: {repr(browser)},
    headless: 'new',
    args: []
  }});

  const page = await browser.newPage();
  const width = 960;
  const height = 1200;
  const scale = 2;
  await page.setViewport({{ width, height, deviceScaleFactor: scale }});

  const html = `<!DOCTYPE html>
<html><head><style>
  body {{ margin: 0; padding: 0; background: #fff; }}
  img {{ display: block; }}
</style></head><body>
  <img src="data:image/svg+xml;base64,${{Buffer.from(svgContent).toString('base64')}}" width="${{width}}" height="${{height}}" />
</body></html>`;

  await page.setContent(html, {{ waitUntil: 'networkidle0' }});
  await page.screenshot({{ path: pngPath, type: 'png', omitBackground: false }});
  await browser.close();
  console.log('PNG generated: ' + pngPath);
}})();
''', encoding='utf-8')

    subprocess.run(["node", str(renderer)], cwd=skill_dir, check=True)


if __name__ == "__main__":
    main()
