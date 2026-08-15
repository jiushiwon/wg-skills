#!/usr/bin/env python3
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


def check_command(cmd: list[str]) -> bool:
    return shutil.which(cmd[0]) is not None


def run(cmd: list[str], cwd: Path | None = None):
    print(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        print(f"命令失败：{' '.join(cmd)}")
        sys.exit(result.returncode)


def main():
    parser = argparse.ArgumentParser(description="一键渲染 Remotion 项目并执行 FFmpeg 后期")
    parser.add_argument("--project", default=".", help="Remotion 项目目录")
    args = parser.parse_args()

    project_dir = Path(args.project).resolve()
    script_path = project_dir / "src" / "script.json"
    if not script_path.exists():
        print(f"错误：找不到 {script_path}")
        sys.exit(1)

    with open(script_path, encoding="utf-8") as f:
        script = json.load(f)

    canvas = script["canvas"]
    width, height = canvas["width"], canvas["height"]

    if not check_command(["npx"]):
        print("错误：未找到 npx，请先安装 Node.js")
        sys.exit(1)

    out_dir = project_dir / "out"
    out_dir.mkdir(exist_ok=True)
    raw_video = out_dir / "video.mp4"
    final_video = out_dir / "final.mp4"

    run(
        ["npx", "remotion", "render", "src/index.ts", "Main", str(raw_video)],
        cwd=project_dir,
    )

    if not check_command(["ffmpeg"]):
        print("警告：未找到 ffmpeg，跳过后期处理。可调用 ffmpeg-skill 安装。")
        print(f"原始渲染文件：{raw_video}")
        sys.exit(0)

    vf = f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2"
    run(
        [
            "ffmpeg",
            "-i", str(raw_video),
            "-vf", vf,
            "-c:v", "libx264",
            "-crf", "23",
            "-preset", "medium",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            "-y",
            str(final_video),
        ],
        cwd=project_dir,
    )

    print(f"成品已输出：{final_video}")


if __name__ == "__main__":
    main()
