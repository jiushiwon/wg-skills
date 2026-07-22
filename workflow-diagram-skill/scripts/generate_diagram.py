#!/usr/bin/env python3
"""
generate_diagram.py - 根据模板或自定义节点生成 SVG 流程图

Usage:
  python3 scripts/generate_diagram.py --template vibe-coding --style flat -o vibe-coding.svg
  python3 scripts/generate_diagram.py --title "我的流程" --nodes-json '[...]' --edges-json '[...]' -o out.svg
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def load_templates(ref_path: Path):
    """从 references/templates.md 解析 YAML 模板列表。"""
    try:
        import yaml
    except ImportError:
        print("ERROR: need pyyaml. run: pip install pyyaml")
        sys.exit(1)

    text = ref_path.read_text(encoding="utf-8")
    m = re.search(r"^templates:\s*$", text, re.MULTILINE)
    if not m:
        print("ERROR: 'templates:' root not found in templates.md")
        sys.exit(1)
    yaml_text = text[m.start():]
    data = yaml.safe_load(yaml_text)
    return {t["id"]: t for t in data.get("templates", [])}


# ---------------- 图标库 ----------------

def icon_user(cx, cy, stroke, fill):
    return [f'<path d="M {cx-6} {cy-5} C {cx-6} {cy-9}, {cx-2} {cy-11}, {cx+2} {cy-11} C {cx+6} {cy-11}, {cx+10} {cy-9}, {cx+10} {cy-5} C {cx+10} {cy-1}, {cx+6} {cy+1}, {cx+2} {cy+1} C {cx-2} {cy+1}, {cx-6} {cy-1}, {cx-6} {cy-5} Z M {cx-8} {cy+7} C {cx-8} {cy+3}, {cx-2} {cy+2}, {cx+2} {cy+2} C {cx+6} {cy+2}, {cx+12} {cy+3}, {cx+12} {cy+7} L {cx+12} {cy+10} L {cx-8} {cy+10} Z" fill="{stroke}"/>']

def icon_brain(cx, cy, stroke, fill):
    return [f'<path d="M {cx-5} {cy-4} C {cx-5} {cy-8}, {cx-1} {cy-11}, {cx+4} {cy-11} C {cx+7} {cy-11}, {cx+10} {cy-9}, {cx+11} {cy-6} C {cx+13} {cy-7}, {cx+15} {cy-5}, {cx+15} {cy-2} C {cx+15} {cy+1}, {cx+12} {cy+3}, {cx+9} {cy+3} C {cx+7} {cy+6}, {cx+3} {cy+7}, {cx-1} {cy+6} C {cx-4} {cy+4}, {cx-5} {cy+1}, {cx-5} {cy-2} Z" fill="{stroke}"/>']

def icon_code(cx, cy, stroke, fill):
    return [f'<path d="M {cx-6} {cy-2} L {cx-2} {cy+2} L {cx-6} {cy+6} M {cx+6} {cy-2} L {cx+2} {cy+2} L {cx+6} {cy+6}" stroke="{stroke}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>']

def icon_play(cx, cy, stroke, fill):
    return [f'<polygon points="{cx-5},{cy-6} {cx-5},{cy+6} {cx+7},{cy}" fill="{stroke}"/>']

def icon_eye(cx, cy, stroke, fill):
    return [f'<path d="M {cx-8} {cy} C {cx-8} {cy}, {cx-2} {cy-7}, {cx+6} {cy} C {cx-2} {cy+7}, {cx-8} {cy}, {cx-8} {cy} Z M {cx+1} {cy-3} C {cx+3} {cy-3}, {cx+4} {cy-1}, {cx+4} {cy} C {cx+4} {cy+2}, {cx+2} {cy+3}, {cx+1} {cy+3} C {cx-1} {cy+3}, {cx-2} {cy+1}, {cx-2} {cy} C {cx-2} {cy-2}, {cx} {cy-3}, {cx+1} {cy-3} Z" fill="{stroke}"/>']

def icon_loop(cx, cy, stroke, fill):
    return [
        f'<path d="M {cx-6} {cy-4} C {cx-9} {cy-4}, {cx-10} {cy-1}, {cx-8} {cy+2} C {cx-6} {cy+5}, {cx-1} {cy+5}, {cx+2} {cy+2}" stroke="{stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>',
        f'<polygon points="{cx+2},{cy+2} {cx-1},{cy+1} {cx-1},{cy+4}" fill="{stroke}"/>'
    ]

def icon_chat(cx, cy, stroke, fill):
    return [
        f'<rect x="{cx-8}" y="{cy-7}" width="16" height="12" rx="3" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
        f'<path d="M {cx-4} {cy+5} L {cx} {cy+1} L {cx-4} {cy+1}" fill="{stroke}"/>'
    ]

def icon_git(cx, cy, stroke, fill):
    return [
        f'<circle cx="{cx-3}" cy="{cy-3}" r="2.5" fill="{stroke}"/>',
        f'<circle cx="{cx+4}" cy="{cy-3}" r="2.5" fill="{stroke}"/>',
        f'<circle cx="{cx}" cy="{cy+4}" r="2.5" fill="{stroke}"/>',
        f'<path d="M {cx-3} {cy} L {cx} {cy+1} L {cx+4} {cy-1}" stroke="{stroke}" stroke-width="1.5" fill="none"/>'
    ]

def icon_server(cx, cy, stroke, fill):
    return [
        f'<rect x="{cx-7}" y="{cy-8}" width="14" height="16" rx="2" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
        f'<circle cx="{cx-3}" cy="{cy-3}" r="1.5" fill="{stroke}"/>',
        f'<circle cx="{cx-3}" cy="{cy+3}" r="1.5" fill="{stroke}"/>'
    ]

def icon_rocket(cx, cy, stroke, fill):
    return [
        f'<path d="M {cx} {cy-10} Q {cx+5} {cy-4}, {cx+5} {cy+2} Q {cx+5} {cy+7}, {cx+2} {cy+8} L {cx-2} {cy+8} Q {cx-5} {cy+7}, {cx-5} {cy+2} Q {cx-5} {cy-4}, {cx} {cy-10} Z" fill="{stroke}"/>',
        f'<circle cx="{cx}" cy="{cy+1}" r="2" fill="#ffffff"/>',
        f'<path d="M {cx-3} {cy+8} L {cx-1} {cy+14} L {cx} {cy+11} L {cx+1} {cy+14} L {cx+3} {cy+8} Z" fill="#f97316"/>'
    ]

def icon_database(cx, cy, stroke, fill):
    return [
        f'<ellipse cx="{cx}" cy="{cy-5}" rx="7" ry="3" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
        f'<path d="M {cx-7} {cy-5} L {cx-7} {cy+4} C {cx-7} {cy+7}, {cx+7} {cy+7}, {cx+7} {cy+4} L {cx+7} {cy-5}" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
        f'<path d="M {cx-7} {cy} C {cx-7} {cy+3}, {cx+7} {cy+3}, {cx+7} {cy}" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
    ]

def icon_search(cx, cy, stroke, fill):
    return [
        f'<circle cx="{cx-2}" cy="{cy-2}" r="6" fill="none" stroke="{stroke}" stroke-width="2"/>',
        f'<line x1="{cx+3}" y1="{cy+3}" x2="{cx+8}" y2="{cy+8}" stroke="{stroke}" stroke-width="2" stroke-linecap="round"/>',
    ]

def icon_document(cx, cy, stroke, fill):
    return [
        f'<path d="M {cx-5} {cy-8} L {cx+2} {cy-8} L {cx+5} {cy-5} L {cx+5} {cy+8} L {cx-5} {cy+8} Z" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
        f'<path d="M {cx+2} {cy-8} L {cx+2} {cy-5} L {cx+5} {cy-5}" stroke="{stroke}" stroke-width="1.5" fill="none"/>',
        f'<line x1="{cx-2}" y1="{cy-1}" x2="{cx+2}" y2="{cy-1}" stroke="{stroke}" stroke-width="1.2"/>',
        f'<line x1="{cx-2}" y1="{cy+2}" x2="{cx+2}" y2="{cy+2}" stroke="{stroke}" stroke-width="1.2"/>',
    ]

def icon_check(cx, cy, stroke, fill):
    return [
        f'<path d="M {cx-6} {cy} L {cx-2} {cy+5} L {cx+6} {cy-5}" stroke="{stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    ]

def icon_robot(cx, cy, stroke, fill):
    return [
        f'<rect x="{cx-7}" y="{cy-8}" width="14" height="14" rx="3" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
        f'<circle cx="{cx-3}" cy="{cy-3}" r="1.5" fill="{stroke}"/>',
        f'<circle cx="{cx+3}" cy="{cy-3}" r="1.5" fill="{stroke}"/>',
        f'<path d="M {cx-2} {cy+2} L {cx} {cy+4} L {cx+2} {cy+2}" stroke="{stroke}" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
        f'<rect x="{cx-2}" y="{cy-10}" width="4" height="3" fill="{stroke}"/>',
    ]

def icon_file(cx, cy, stroke, fill):
    return [
        f'<path d="M {cx-6} {cy-8} L {cx+2} {cy-8} L {cx+6} {cy-4} L {cx+6} {cy+8} L {cx-6} {cy+8} Z" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
        f'<path d="M {cx+2} {cy-8} L {cx+2} {cy-4} L {cx+6} {cy-4}" stroke="{stroke}" stroke-width="1.5" fill="none"/>',
        f'<line x1="{cx-3}" y1="{cy}" x2="{cx+3}" y2="{cy}" stroke="{stroke}" stroke-width="1.2"/>',
        f'<line x1="{cx-3}" y1="{cy+3}" x2="{cx+3}" y2="{cy+3}" stroke="{stroke}" stroke-width="1.2"/>',
    ]

def icon_checkmark(cx, cy, stroke, fill):
    return [
        f'<circle cx="{cx}" cy="{cy}" r="10" fill="none" stroke="{stroke}" stroke-width="2"/>',
        f'<path d="M {cx-4} {cy} L {cx-1} {cy+4} L {cx+5} {cy-4}" stroke="{stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    ]

def icon_bolt(cx, cy, stroke, fill):
    return [
        f'<path d="M {cx+1} {cy-9} L {cx-5} {cy-1} L {cx-1} {cy-1} L {cx-3} {cy+9} L {cx+5} {cy+1} L {cx+1} {cy+1} Z" fill="{stroke}"/>',
    ]

def icon_cloud(cx, cy, stroke, fill):
    return [
        f'<path d="M {cx-7} {cy+2} C {cx-10} {cy+2}, {cx-10} {cy-4}, {cx-6} {cy-4} C {cx-6} {cy-9}, {cx+2} {cy-10}, {cx+4} {cy-5} C {cx+8} {cy-6}, {cx+9} {cy+1}, {cx+6} {cy+3} Z" fill="none" stroke="{stroke}" stroke-width="1.5"/>',
    ]

def icon_star(cx, cy, stroke, fill):
    return [
        f'<path d="M {cx} {cy-8} L {cx+2} {cy-3} L {cx+7} {cy-3} L {cx+3} {cy} L {cx+5} {cy+6} L {cx} {cy+3} L {cx-5} {cy+6} L {cx-3} {cy} L {cx-7} {cy-3} L {cx-2} {cy-3} Z" fill="{stroke}"/>',
    ]

ICON_FUNCS = {
    "user": icon_user, "brain": icon_brain, "code": icon_code, "play": icon_play,
    "eye": icon_eye, "loop": icon_loop, "chat": icon_chat, "git": icon_git,
    "server": icon_server, "rocket": icon_rocket,
    "database": icon_database, "search": icon_search, "document": icon_document, "check": icon_check,
    "robot": icon_robot, "file": icon_file, "checkmark": icon_checkmark,
    "bolt": icon_bolt, "cloud": icon_cloud, "star": icon_star,
}


# ---------------- 风格定义 ----------------

STYLES = {
    "flat": {
        "bg": "#ffffff",
        "container_bg": "#f8fafc",
        "container_stroke": "#e5e7eb",
        "node_fill": "#ffffff",
        "node_stroke": "#d1d5db",
        "title": "#111827",
        "subtitle": "#6b7280",
        "container_title": "#6b7280",
        "primary_arrow": "#2563eb",
        "loop_arrow": "#9333ea",
        "font": "'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif",
        "icon_tints": {
            "user": ("#eff6ff", "#2563eb"), "brain": ("#faf5ff", "#9333ea"), "code": ("#f0fdf4", "#16a34a"),
            "play": ("#fff7ed", "#ea580c"), "eye": ("#fef2f2", "#dc2626"), "loop": ("#f0fdfa", "#0d9488"),
            "chat": ("#eff6ff", "#2563eb"), "git": ("#eff6ff", "#2563eb"), "server": ("#fff7ed", "#ea580c"),
            "rocket": ("#f0fdfa", "#0d9488"),
            "database": ("#fff7ed", "#ea580c"), "search": ("#fef2f2", "#dc2626"),
            "document": ("#f3f4f6", "#6b7280"), "check": ("#e8f5e9", "#16a34a"),
            "robot": ("#faf5ff", "#9333ea"), "file": ("#fff7ed", "#ea580c"),
            "checkmark": ("#e8f5e9", "#16a34a"), "bolt": ("#fff7ed", "#ea580c"),
            "cloud": ("#eff6ff", "#2563eb"), "star": ("#fff7ed", "#ea580c"),
        }
    },
    "sketchy": {
        "bg": "#fffef8",
        "container_bg": "#fffdf5",
        "container_stroke": "#d4c5b0",
        "node_fill": "#fffef8",
        "node_stroke": "#8b7e66",
        "title": "#3d3d3d",
        "subtitle": "#7a7a7a",
        "container_title": "#7a7a7a",
        "primary_arrow": "#4a7c59",
        "loop_arrow": "#a35c5c",
        "font": "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        "icon_tints": {
            "user": ("#fefce8", "#4a7c59"), "brain": ("#fff7ed", "#a35c5c"), "code": ("#f0fdf4", "#4a7c59"),
            "play": ("#fff7ed", "#a35c5c"), "eye": ("#fef2f2", "#a35c5c"), "loop": ("#f0fdfa", "#4a7c59"),
            "chat": ("#fefce8", "#4a7c59"), "git": ("#eff6ff", "#4a7c59"), "server": ("#fff7ed", "#a35c5c"),
            "rocket": ("#f0fdfa", "#4a7c59"),
            "database": ("#fff7ed", "#a35c5c"), "search": ("#fef2f2", "#a35c5c"),
            "document": ("#fffdf5", "#8b7e66"), "check": ("#f0fdf4", "#4a7c59"),
            "robot": ("#fff7ed", "#a35c5c"), "file": ("#fffdf5", "#8b7e66"),
            "checkmark": ("#f0fdf4", "#4a7c59"), "bolt": ("#fff7ed", "#a35c5c"),
            "cloud": ("#eff6ff", "#4a7c59"), "star": ("#fff7ed", "#a35c5c"),
        }
    },
    "dark": {
        "bg": "#0f0f1a",
        "container_bg": "#1a1a2e",
        "container_stroke": "#2d2d44",
        "node_fill": "#16162a",
        "node_stroke": "#3f3f5f",
        "title": "#e4e4f0",
        "subtitle": "#9ca3af",
        "container_title": "#9ca3af",
        "primary_arrow": "#60a5fa",
        "loop_arrow": "#c084fc",
        "font": "'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif",
        "icon_tints": {
            "user": ("rgba(96,165,250,0.15)", "#60a5fa"), "brain": ("rgba(192,132,252,0.15)", "#c084fc"),
            "code": ("rgba(74,222,128,0.15)", "#4ade80"), "play": ("rgba(251,146,60,0.15)", "#fb923c"),
            "eye": ("rgba(248,113,113,0.15)", "#f87171"), "loop": ("rgba(45,212,191,0.15)", "#2dd4bf"),
            "chat": ("rgba(96,165,250,0.15)", "#60a5fa"), "git": ("rgba(96,165,250,0.15)", "#60a5fa"),
            "server": ("rgba(251,146,60,0.15)", "#fb923c"), "rocket": ("rgba(45,212,191,0.15)", "#2dd4bf"),
            "database": ("rgba(251,146,60,0.15)", "#fb923c"), "search": ("rgba(248,113,113,0.15)", "#f87171"),
            "document": ("rgba(156,163,175,0.15)", "#9ca3af"), "check": ("rgba(74,222,128,0.15)", "#4ade80"),
            "robot": ("rgba(192,132,252,0.15)", "#c084fc"), "file": ("rgba(251,146,60,0.15)", "#fb923c"),
            "checkmark": ("rgba(74,222,128,0.15)", "#4ade80"), "bolt": ("rgba(251,146,60,0.15)", "#fb923c"),
            "cloud": ("rgba(96,165,250,0.15)", "#60a5fa"), "star": ("rgba(251,146,60,0.15)", "#fb923c"),
        }
    },
    "cute": {
        "bg": "#fff8f3",
        "container_bg": "#fff0e8",
        "container_stroke": "#f4d7c4",
        "node_fill": "#ffffff",
        "node_stroke": "#f4c2c2",
        "title": "#5c4b51",
        "subtitle": "#9d8a8f",
        "container_title": "#9d8a8f",
        "primary_arrow": "#ff9aa2",
        "loop_arrow": "#b5b9ff",
        "shadow": "rgba(255, 154, 162, 0.18)",
        "font": "'Nunito', 'Quicksand', 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
        "icon_tints": {
            "user": ("#ffe9ec", "#ff9aa2"), "brain": ("#e6e6fa", "#b5b9ff"), "code": ("#e0f7fa", "#80deea"),
            "play": ("#fff9c4", "#fff176"), "eye": ("#e8f5e9", "#a5d6a7"), "loop": ("#fce4ec", "#f48fb1"),
            "chat": ("#ffe9ec", "#ff9aa2"), "git": ("#e3f2fd", "#90caf9"), "server": ("#fff9c4", "#fff176"),
            "rocket": ("#e3f2fd", "#90caf9"),
            "database": ("#e3f2fd", "#90caf9"), "search": ("#e8f5e9", "#a5d6a7"),
            "document": ("#fff3e0", "#ffcc80"), "check": ("#e8f5e9", "#a5d6a7"),
            "robot": ("#e6e6fa", "#b5b9ff"), "file": ("#fff3e0", "#ffcc80"),
            "checkmark": ("#e8f5e9", "#a5d6a7"), "bolt": ("#fff9c4", "#fff176"),
            "cloud": ("#e3f2fd", "#90caf9"), "star": ("#fff9c4", "#fff176"),
        }
    }
}


def get_style(style_name):
    return STYLES.get(style_name, STYLES["flat"])


# ---------------- 布局与生成 ----------------

def layout_nodes(nodes, groups=None, direction="vertical"):
    """按 groups 或每 3 个一组布局。direction: vertical(默认上下) 或 horizontal(左右)"""
    node_map = {n["id"]: n for n in nodes}
    positions = {}

    if groups:
        grouped = [(g.get("name", f"阶段 {i+1}"), [node_map[nid] for nid in g["nodes"]])
                   for i, g in enumerate(groups)]
    else:
        grouped = []
        if direction == "horizontal":
            # 横向：所有节点放一行
            grouped = [("流程", nodes)]
        else:
            # 纵向：每 3 个一组
            for i in range(0, len(nodes), 3):
                grouped.append((f"阶段 {i//3 + 1}", nodes[i:i+3]))

    node_w_default, node_h = 230, 70
    top_margin = 90
    start_x = [90, 360, 630]

    if direction == "horizontal":
        # 横向布局
        node_w = node_w_default
        y = top_margin + 45
        for idx, node in enumerate(nodes):
            x = 90 + idx * (node_w + 40)
            positions[node["id"]] = (x, y, node_w, node_h)
        return positions, grouped

    # 纵向布局（默认）
    for gi, (name, group_nodes) in enumerate(grouped):
        n_count = len(group_nodes)
        node_w = node_w_default
        if n_count == 1:
            xs = [480 - node_w // 2]
        elif n_count == 2:
            xs = [270, 510]
        elif n_count == 3:
            xs = start_x
        elif n_count == 4:
            # 压缩节点宽度，确保不超出容器右边界（容器 x=60, width=840, 右边界=900）
            node_w = 165
            xs = [60, 285, 510, 735]
        else:
            raise ValueError(f"每组最多 4 个节点，当前组 '{name}' 有 {n_count} 个节点，请拆分")
        y = top_margin + gi * 170
        for idx, node in enumerate(group_nodes):
            x = xs[idx]
            positions[node["id"]] = (x, y + 45, node_w, node_h)

    return positions, grouped


def render_svg(title, nodes, edges, groups=None, style_name="flat", direction="vertical", arrow_style="straight"):
    """渲染 SVG。direction: vertical(上下) / horizontal(左右); arrow_style: straight(直线) / curved(曲线)"""
    style = get_style(style_name)
    positions, grouped = layout_nodes(nodes, groups, direction)

    # 自动生成主流程边
    auto_edges = []

    if direction == "horizontal":
        # 横向：所有节点依次连接
        for i in range(len(nodes) - 1):
            auto_edges.append({"from": nodes[i]["id"], "to": nodes[i+1]["id"]})
    else:
        # 纵向
        for _, group_nodes in grouped:
            for i in range(len(group_nodes) - 1):
                auto_edges.append({"from": group_nodes[i]["id"], "to": group_nodes[i+1]["id"]})
        for i in range(len(grouped) - 1):
            auto_edges.append({
                "from": grouped[i][1][-1]["id"],
                "to": grouped[i+1][1][0]["id"],
                "cross_group": True,
            })

    # 合并用户/模板提供的边（如迭代循环），去重
    seen = set((e["from"], e["to"]) for e in auto_edges)
    for e in edges:
        key = (e["from"], e["to"])
        if key not in seen:
            auto_edges.append(e)
            seen.add(key)

    edges = auto_edges

    # 计算画布尺寸
    if direction == "horizontal":
        view_w = 90 + len(nodes) * 270 + 60
        view_h = 280
    else:
        num_groups = len(grouped)
        view_h = 90 + num_groups * 170 + 120
        view_w = 960

    bg = style["bg"]
    title_color = style["title"]
    subtitle_color = style["subtitle"]
    container_title_color = style.get("container_title", "#6b7280")
    container_bg = style["container_bg"]
    container_stroke = style["container_stroke"]
    node_fill = style["node_fill"]
    node_stroke = style["node_stroke"]
    primary_arrow = style["primary_arrow"]
    loop_arrow = style["loop_arrow"]

    lines = []
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w} {view_h}" width="{view_w}" height="{view_h}">')
    lines.append('  <style>')
    lines.append(f"    text {{ font-family: {style['font']}; }}")
    lines.append('    .title { font-size: 24px; font-weight: 600; }')
    lines.append('    .subtitle { font-size: 13px; }')
    lines.append('    .label { font-size: 15px; font-weight: 600; }')
    lines.append('    .sublabel { font-size: 12px; }')
    lines.append('    .box-title { font-size: 14px; font-weight: 600; }')
    lines.append('  </style>')
    lines.append('  <defs>')
    lines.append(f'    <marker id="arrow-primary" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="{primary_arrow}"/></marker>')
    lines.append(f'    <marker id="arrow-loop" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="{loop_arrow}"/></marker>')
    lines.append(f'    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="{style.get("shadow", "rgba(0,0,0,0.1)")}" flood-opacity="0.5"/></filter>')
    lines.append('  </defs>')
    lines.append(f'  <rect width="{view_w}" height="{view_h}" fill="{bg}"/>')

    # 标题
    lines.append(f'  <text x="{view_w//2}" y="45" text-anchor="middle" class="title" fill="{title_color}">{title}</text>')

    # 容器（横向布局不画容器）
    if direction != "horizontal":
        for gi, (name, group_nodes) in enumerate(grouped):
            gx, gy = 60, 80 + gi * 170
            lines.append(f'  <rect x="{gx}" y="{gy}" width="840" height="140" rx="12" ry="12" fill="{container_bg}" stroke="{container_stroke}" stroke-width="1.5" stroke-dasharray="6,4"/>')
            lines.append(f'  <text x="{gx+15}" y="{gy+25}" class="box-title" fill="{container_title_color}">{name}</text>')

    # 节点
    for node in nodes:
        x, y, w, h = positions[node["id"]]
        cx, cy = x + 28, y + h // 2
        icon = node.get("icon", "brain")
        icon_fill, icon_stroke = style["icon_tints"].get(icon, ("#f3f4f6", "#6b7280"))

        if style_name == "cute":
            lines.append(f'  <g filter="url(#drop-shadow)">')
            lines.append(f'    <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" ry="16" fill="{node_fill}" stroke="{node_stroke}" stroke-width="2"/>')
            lines.append(f'  </g>')
        else:
            lines.append(f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" ry="8" fill="{node_fill}" stroke="{node_stroke}" stroke-width="1.5"/>')
        lines.append(f'  <circle cx="{cx}" cy="{cy}" r="16" fill="{icon_fill}" stroke="{icon_stroke}" stroke-width="1.5"/>')

        func = ICON_FUNCS.get(icon, icon_brain)
        for el in func(cx, cy, icon_stroke, icon_fill):
            lines.append(f'  {el}')

        lines.append(f'  <text x="{x+52}" y="{cy-2}" class="label" fill="{title_color}">{node["label"]}</text>')
        lines.append(f'  <text x="{x+52}" y="{cy+17}" class="sublabel" fill="{subtitle_color}">{node.get("sub", "")}</text>')

    # 边
    for edge in edges:
        src = positions[edge["from"]]
        dst = positions[edge["to"]]
        sx = src[0] + src[2] // 2
        sy = src[1] + src[3] // 2
        dx = dst[0] + dst[2] // 2
        dy = dst[1] + dst[3] // 2
        dashed = edge.get("dashed", False)
        label = edge.get("label", "")

        color = loop_arrow if dashed else primary_arrow
        marker = "url(#arrow-loop)" if dashed else "url(#arrow-primary)"
        dashattr = ' stroke-dasharray="6,4"' if dashed else ""

        if dashed:
            # 循环边：从源节点左侧绕回目标节点左侧
            path_d = f"M {src[0]} {sy} C {src[0]-80} {sy}, {dst[0]-80} {dy}, {dst[0]-5} {dy}"
        elif edge.get("cross_group"):
            # 跨组边：先向下再横向，避免对角回折
            if arrow_style == "curved":
                mid_y = (src[1] + src[3] + dst[1]) // 2
                path_d = f"M {sx} {src[1]+src[3]} C {sx} {mid_y+30}, {dx} {mid_y-30}, {dx} {dst[1]-5}"
            else:
                mid_y = (src[1] + src[3] + dst[1]) // 2
                path_d = f"M {sx} {src[1]+src[3]} L {sx} {mid_y} L {dx} {mid_y} L {dx} {dst[1]-5}"
        else:
            if direction == "horizontal":
                # 横向：左到右
                if arrow_style == "curved":
                    path_d = f"M {src[0]+src[2]} {sy} C {src[0]+src[2]+40} {sy}, {dst[0]-40} {dy}, {dst[0]-5} {dy}"
                else:
                    path_d = f"M {src[0]+src[2]} {sy} L {dst[0]-5} {dy}"
            elif abs(src[1] - dst[1]) < 10:
                # 同行直线
                if arrow_style == "curved":
                    path_d = f"M {src[0]+src[2]} {sy} C {src[0]+src[2]+40} {sy}, {dst[0]-40} {dy}, {dst[0]-5} {dy}"
                else:
                    path_d = f"M {src[0]+src[2]} {sy} L {dst[0]-5} {dy}"
            else:
                # 上下
                if arrow_style == "curved":
                    path_d = f"M {sx} {src[1]+src[3]} C {sx} {sy+50}, {dx} {dy-50}, {dx} {dst[1]-5}"
                else:
                    path_d = f"M {sx} {src[1]+src[3]} L {dx} {dst[1]-5}"

        stroke_width = "3" if style_name == "cute" else "2"
        lines.append(f'  <path d="{path_d}" stroke="{color}" stroke-width="{stroke_width}" fill="none" marker-end="{marker}"{dashattr}/>')

        if label:
            mid_x = (src[0] + dst[0]) // 2
            mid_y = (src[1] + dst[1]) // 2
            lines.append(f'  <text x="{mid_x}" y="{mid_y-6}" text-anchor="middle" class="sublabel" fill="{color}">{label}</text>')

    lines.append('</svg>')
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description="generate workflow diagram SVG")
    parser.add_argument("--template", help="template ID")
    parser.add_argument("--style", default=None, help="style: flat | sketchy | dark | cute (defaults to template's default_style)")
    parser.add_argument("-o", "--output", required=True, help="output SVG path")
    parser.add_argument("--title", help="diagram title")
    parser.add_argument("--nodes-json", help="custom nodes JSON")
    parser.add_argument("--edges-json", help="custom edges JSON")
    parser.add_argument("--direction", default="vertical", help="layout: vertical (上下) | horizontal (左右)")
    parser.add_argument("--arrow-style", default="straight", help="arrow: straight | curved")
    parser.add_argument("--png", action="store_true", help="also render PNG using svg2png.py")
    args = parser.parse_args()

    script_dir = Path(__file__).parent.resolve()
    templates_path = script_dir.parent / "references" / "templates.md"

    nodes, edges, groups = [], [], None
    title = args.title or "流程图"
    style = args.style or "flat"

    if args.template:
        templates = load_templates(templates_path)
        tmpl = templates.get(args.template)
        if not tmpl:
            print(f"ERROR: template '{args.template}' not found. available: {', '.join(templates.keys())}")
            sys.exit(1)
        nodes = tmpl.get("nodes", [])
        edges = tmpl.get("edges", [])
        groups = tmpl.get("groups")
        title = args.title or tmpl.get("name", "流程图")
        style = args.style or tmpl.get("default_style", "flat")
    elif args.nodes_json:
        nodes = json.loads(args.nodes_json)
        edges = json.loads(args.edges_json or "[]")
    else:
        print("ERROR: need --template or --nodes-json")
        sys.exit(1)

    svg = render_svg(title, nodes, edges, groups, style, args.direction, args.arrow_style)
    Path(args.output).write_text(svg, encoding="utf-8")
    print(f"SVG generated: {args.output}")

    if args.png:
        svg2png = script_dir / "svg2png.py"
        subprocess.run([sys.executable, str(svg2png), str(Path(args.output).resolve())], check=True)


if __name__ == "__main__":
    main()
