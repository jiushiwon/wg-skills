#!/usr/bin/env python3
"""
init_skill_assets.py - 检测并安装 workflow-diagram-skill 的依赖

Usage:
  python3 scripts/init_skill_assets.py
"""

import subprocess
import sys
from pathlib import Path


def check_python_deps():
    try:
        import yaml
        print("[OK] pyyaml installed")
    except ImportError:
        print("[MISSING] pyyaml, installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyyaml", "-q"], check=True)
        print("[OK] pyyaml installed")


def check_node_deps(skill_dir: Path):
    if (skill_dir / "node_modules" / "puppeteer-core").exists():
        print("[OK] puppeteer-core installed")
    else:
        print("[MISSING] puppeteer-core, installing...")
        subprocess.run(["npm", "install", "puppeteer-core", "--no-save"], cwd=skill_dir, check=True)
        print("[OK] puppeteer-core installed")


def check_browser():
    import platform
    if platform.system() == "Windows":
        candidates = [
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        ]
        for c in candidates:
            if Path(c).exists():
                print(f"[OK] browser found: {c}")
                return
    print("[WARN] Edge/Chrome not found, PNG rendering may fail.")


def main():
    skill_dir = Path(__file__).parent.parent.resolve()
    print(f"初始化 workflow-diagram-skill 依赖...\n目录: {skill_dir}\n")
    check_python_deps()
    check_node_deps(skill_dir)
    check_browser()
    print("\n初始化完成。")


if __name__ == "__main__":
    main()
