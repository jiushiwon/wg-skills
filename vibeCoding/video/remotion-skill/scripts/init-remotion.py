#!/usr/bin/env python3
import argparse
import json
import os
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


def parse_text(text: str, seconds_per_segment: int, fps: int) -> list[dict]:
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

    frames_per_part = seconds_per_segment * fps
    segments = []
    cursor = 0
    for part in parts:
        if not part:
            continue
        segments.append({
            "text": part,
            "startFrame": cursor,
            "endFrame": cursor + frames_per_part,
        })
        cursor += frames_per_part

    return segments


def build_script(segments: list[dict], aspect: str, fps: int,
                 title: dict | None = None,
                 end_card: dict | None = None) -> dict:
    canvas = {"width": 1080, "height": 1920} if aspect == "9x16" else {"width": 1920, "height": 1080}

    total_frames = segments[-1]["endFrame"] if segments else fps * 3
    if end_card and end_card.get("startFrame", 0) + end_card.get("durationFrames", 0) > total_frames:
        total_frames = end_card["startFrame"] + end_card["durationFrames"]

    return {
        "fps": fps,
        "durationInFrames": total_frames,
        "canvas": canvas,
        "title": title,
        "segments": segments,
        "endCard": end_card,
    }


def main():
    parser = argparse.ArgumentParser(description="生成 Remotion 口播视频项目")
    parser.add_argument("--text", required=True, help="口播文案（按标点分句）")
    parser.add_argument("--aspect", choices=["9x16", "16x9"], default="9x16", help="画幅")
    parser.add_argument("--output", default="./demo", help="输出目录")
    parser.add_argument("--seconds", type=int, default=5, help="每段默认秒数")
    parser.add_argument("--title-text", help="开场主标题")
    parser.add_argument("--title-subtitle", help="开场副标题（英文小字）")
    parser.add_argument("--title-frames", type=int, default=60, help="开场持续帧数")
    parser.add_argument("--end-message", help="结尾主信息")
    parser.add_argument("--end-hint", help="结尾副提示")
    parser.add_argument("--end-frames", type=int, default=60, help="结尾持续帧数")
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

    fps = 30
    segments = parse_text(args.text, args.seconds, fps)

    title = None
    if args.title_text:
        title = {
            "text": args.title_text,
            "subtitle": args.title_subtitle,
            "durationFrames": args.title_frames,
        }

    end_card = None
    if args.end_message:
        end_card = {
            "message": args.end_message,
            "hint": args.end_hint,
            "startFrame": segments[-1]["endFrame"] if segments else 0,
            "durationFrames": args.end_frames,
        }

    script = build_script(segments, args.aspect, fps, title, end_card)

    script_path = output_dir / "src" / "script.json"
    with open(script_path, "w", encoding="utf-8") as f:
        json.dump(script, f, ensure_ascii=False, indent=2)

    skill_dir = Path(__file__).parent.parent.resolve()
    render_script = (skill_dir / "scripts" / "render.py").resolve()
    try:
        rel_script = os.path.relpath(render_script, output_dir.resolve())
    except ValueError:
        rel_script = render_script.as_posix()

    print(f"项目已生成：{output_dir}")
    print("下一步：")
    print(f"  1. 替换 {output_dir / 'src/voiceover.mp3'} 为你的配音")
    print(f"  2. 编辑 {output_dir / 'src/script.json'} 调整文案和时长")
    print(f"  3. 运行：cd {output_dir} && python {rel_script}")


if __name__ == "__main__":
    main()