#!/usr/bin/env python3
import argparse
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path


def resolve_output_dir(path: str) -> Path:
    """解析输出目录，兼容 Windows 上 Git Bash 的 /tmp 映射。"""
    output_dir = Path(path).resolve()
    if path.startswith("/tmp/"):
        fallback = Path(tempfile.gettempdir()) / path[5:]
        if fallback.exists() or not output_dir.exists():
            return fallback
    return output_dir


def parse_text(text: str, seconds_per_segment: int = 3, fps: int = 30) -> list[dict]:
    """按标点拆分文案，生成连续段落。"""
    raw_segments = re.split(r'([。！？\n]+)', text.strip())
    parts: list[str] = []
    buffer = ""
    for seg in raw_segments:
        if re.match(r'[。！？\n]+', seg):
            buffer += seg
            parts.append(buffer.strip())
            buffer = ""
        else:
            buffer += seg
    if buffer.strip():
        parts.append(buffer.strip())

    segments_per_part = seconds_per_segment * fps
    segments = []
    current_frame = 0
    for part in parts:
        if not part:
            continue
        start = current_frame
        end = current_frame + segments_per_part
        segments.append({
            "text": part,
            "startFrame": start,
            "endFrame": end,
        })
        current_frame = end

    return segments


def build_script(segments: list[dict], aspect: str, fps: int = 30) -> dict:
    canvas = {"width": 1080, "height": 1920} if aspect == "9x16" else {"width": 1920, "height": 1080}
    return {
        "fps": fps,
        "durationInFrames": segments[-1]["endFrame"] if segments else fps * 3,
        "canvas": canvas,
        "segments": segments,
    }


def main():
    parser = argparse.ArgumentParser(description="生成 Remotion 口播视频项目")
    parser.add_argument("--text", required=True, help="口播文案")
    parser.add_argument("--aspect", choices=["9x16", "16x9"], default="9x16", help="画幅")
    parser.add_argument("--output", required=True, help="输出目录")
    parser.add_argument("--seconds", type=int, default=3, help="每段默认秒数")
    args = parser.parse_args()

    output_dir = resolve_output_dir(args.output)
    if output_dir.exists():
        print(f"错误：目标目录已存在 {output_dir}")
        sys.exit(1)

    template_dir = Path(__file__).parent.parent / "templates" / f"oral-broadcast-{args.aspect}"
    if not template_dir.exists():
        print(f"错误：模板不存在 {template_dir}")
        sys.exit(1)

    shutil.copytree(template_dir, output_dir)

    segments = parse_text(args.text, args.seconds)
    script = build_script(segments, args.aspect)

    script_path = output_dir / "src" / "script.json"
    with open(script_path, "w", encoding="utf-8") as f:
        json.dump(script, f, ensure_ascii=False, indent=2)

    print(f"项目已生成：{output_dir}")
    print("下一步：")
    print(f"  1. 替换 {output_dir / 'src/voiceover.mp3'} 为你的配音")
    print(f"  2. 编辑 {output_dir / 'src/script.json'} 调整文案和时长")
    print(f"  3. 运行：cd {output_dir} && python ../remotion-skill/scripts/render.py")


if __name__ == "__main__":
    main()
