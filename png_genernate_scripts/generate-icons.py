#!/usr/bin/env python3
"""
图标生成脚本
根据关键词生成对应 SVG/PNG 图标（默认色 + 主题色）

用法:
    python scripts/generate-icons.py chat person clock
    python scripts/generate-icons.py 聊天 我的 时钟
    python scripts/generate-icons.py --from-svg           # 从 svgs/ 目录批量生成

会在 src/static/icons/ 下生成:
    - icon-{name}.svg      (默认深色)
    - icon-{name}-theme.svg (主题色 #ff6b9d)
    - icon-{name}.png      (默认深色，需安装 sharp/cairosvg)
    - icon-{name}-theme.png (主题色，需安装 sharp/cairosvg)
"""

import sys
import os
import xml.etree.ElementTree as ET

# 项目根目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUTPUT_DIR = os.path.join(BASE_DIR, "src", "static", "icons")

# 主题色（与项目主色一致）
THEME_COLOR = "#ff6b9d"
DEFAULT_COLOR = "#333333"

# 图标尺寸
SIZE = 48
VIEWBOX = "0 0 24 24"
STROKE_WIDTH = "1.8"
STROKE_LINECAP = "round"
STROKE_LINEJOIN = "round"

# SVG 源文件目录
SVGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "svgs")


def build_svg(paths: list, color: str, size: int = SIZE) -> str:
    """构建 SVG 字符串"""
    svg_attrs = {
        "xmlns": "http://www.w3.org/2000/svg",
        "width": str(size),
        "height": str(size),
        "viewBox": VIEWBOX,
        "fill": "none",
    }
    svg = ET.Element("svg", svg_attrs)

    for d in paths:
        path = ET.SubElement(svg, "path")
        path.set("d", d)
        path.set("stroke", color)
        path.set("stroke-width", STROKE_WIDTH)
        path.set("stroke-linecap", STROKE_LINECAP)
        path.set("stroke-linejoin", STROKE_LINEJOIN)

    return ET.tostring(svg, encoding="unicode")


def save_svg(name: str, svg_content: str, suffix: str = ""):
    """保存 SVG 文件"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"icon-{name}{suffix}.svg"
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"  [OK] SVG: {filepath}")
    return filepath


def convert_to_png(svg_path: str, png_path: str, size: int = SIZE):
    """将 SVG 转为 PNG（优先 Node.js + sharp，备选 cairosvg）"""
    import subprocess
    import shutil

    # 方案1: Node.js + sharp（跨平台，Windows最稳）
    node = shutil.which("node")
    if node:
        js_code = (
            f"const sharp = require('sharp'); "
            f"sharp('{svg_path.replace(chr(92), '/')}'"
            f").resize({size}, {size}).png().toFile('{png_path.replace(chr(92), '/')}'"
            f").then(() => process.exit(0)).catch(() => process.exit(1));"
        )
        try:
            result = subprocess.run(
                [node, "-e", js_code],
                capture_output=True, text=True, timeout=10, cwd=os.path.dirname(os.path.dirname(__file__))
            )
            if result.returncode == 0:
                print(f"  [OK] PNG: {png_path}")
                return
        except Exception:
            pass

    # 方案2: cairosvg（需系统安装cairo库）
    try:
        import cairosvg
        cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=size, output_height=size)
        print(f"  [OK] PNG: {png_path}")
        return
    except ImportError:
        pass
    except Exception as e:
        print(f"  [WARN] cairosvg 失败: {e}")

    print(f"  [WARN] 跳过 PNG: 未安装 sharp 或 cairosvg")


def generate_icon(name: str, paths: list):
    """生成单个图标（默认色 + 主题色）"""
    print(f"\n[GEN] 生成图标: {name}")

    # 默认色
    svg_default = build_svg(paths, DEFAULT_COLOR)
    svg_path = save_svg(name, svg_default)
    png_path = svg_path.replace(".svg", ".png")
    convert_to_png(svg_path, png_path)

    # 主题色
    svg_theme = build_svg(paths, THEME_COLOR)
    svg_theme_path = save_svg(name, svg_theme, suffix="-theme")
    png_theme_path = svg_theme_path.replace(".svg", ".png")
    convert_to_png(svg_theme_path, png_theme_path)


# ========== 图标路径库 ==========
# 风格：现代线性图标，1.8px 描边，圆角端点

ICONS = {
    # 聊天/消息
    "chat": {
        "aliases": ["聊天", "消息", "message"],
        "paths": [
            "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
        ],
    },
    # 人物/我的
    "person": {
        "aliases": ["我的", "人物", "用户", "user", "profile", "我"],
        "paths": [
            "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
            "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
        ],
    },
    # 时钟/历史
    "clock": {
        "aliases": ["时钟", "时间", "历史", "history", "time", "足迹"],
        "paths": [
            "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
            "M12 6v6l4 2",
        ],
    },
    # 首页/房子
    "home": {
        "aliases": ["首页", "家", "房子", "home", "主页"],
        "paths": [
            "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
            "M9 22V12h6v10",
        ],
    },
    # 设置/齿轮
    "settings": {
        "aliases": ["设置", "齿轮", "配置", "settings", "config"],
        "paths": [
            "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
            "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
        ],
    },
    # 搜索
    "search": {
        "aliases": ["搜索", "查找", "search", "find"],
        "paths": [
            "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
            "M21 21l-4.35-4.35",
        ],
    },
    # 铃铛/通知
    "bell": {
        "aliases": ["铃铛", "通知", "提醒", "bell", "notification"],
        "paths": [
            "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
            "M13.73 21a2 2 0 0 1-3.46 0",
        ],
    },
    # 心/健康
    "heart": {
        "aliases": ["心", "健康", "喜欢", "heart", "health", "love"],
        "paths": [
            "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
        ],
    },
    # 音乐
    "music": {
        "aliases": ["音乐", "音符", "music", "audio", "song"],
        "paths": [
            "M9 18V5l12-2v13",
            "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
            "M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
        ],
    },
    # 日历
    "calendar": {
        "aliases": ["日历", "日期", "calendar", "date"],
        "paths": [
            "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z",
            "M16 2v4",
            "M8 2v4",
            "M3 10h18",
        ],
    },
    # 相机
    "camera": {
        "aliases": ["相机", "拍照", "camera", "photo"],
        "paths": [
            "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z",
            "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
        ],
    },
    # 文件/文档
    "document": {
        "aliases": ["文件", "文档", "document", "file", "paper"],
        "paths": [
            "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
            "M14 2v6h6",
            "M16 13H8",
            "M16 17H8",
            "M10 9H8",
        ],
    },
    # 星星
    "star": {
        "aliases": ["星星", "收藏", "star", "favorite", "bookmark"],
        "paths": [
            "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
        ],
    },
    # 位置/地图
    "location": {
        "aliases": ["位置", "地图", "定位", "location", "map", "pin"],
        "paths": [
            "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z",
            "M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
        ],
    },
    # 电话
    "phone": {
        "aliases": ["电话", "手机", "phone", "call", "tel"],
        "paths": [
            "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
        ],
    },
    # 邮件
    "mail": {
        "aliases": ["邮件", "邮箱", "mail", "email", "envelope"],
        "paths": [
            "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
            "M22 6l-10 7L2 6",
        ],
    },
    # 锁
    "lock": {
        "aliases": ["锁", "安全", "lock", "security", "password"],
        "paths": [
            "M19 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z",
            "M7 11V7a5 5 0 0 1 10 0v4",
        ],
    },
    # 分享
    "share": {
        "aliases": ["分享", "转发", "share", "forward"],
        "paths": [
            "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",
            "M16 6l-4-4-4 4",
            "M12 2v13",
        ],
    },
    # 更多/三点
    "more": {
        "aliases": ["更多", "菜单", "more", "menu", "dots"],
        "paths": [
            "M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
            "M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
            "M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
        ],
    },
    # 加号
    "plus": {
        "aliases": ["加", "添加", "plus", "add", "new"],
        "paths": [
            "M12 5v14",
            "M5 12h14",
        ],
    },
    # 垃圾桶/删除
    "trash": {
        "aliases": ["删除", "垃圾桶", "trash", "delete", "remove"],
        "paths": [
            "M3 6h18",
            "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
        ],
    },
    # 编辑/笔
    "edit": {
        "aliases": ["编辑", "修改", "edit", "pen", "write"],
        "paths": [
            "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
            "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
        ],
    },
    # 眼睛/查看
    "eye": {
        "aliases": ["眼睛", "查看", "eye", "view", "look"],
        "paths": [
            "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
            "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
        ],
    },
    # 眼睛关闭
    "eye-off": {
        "aliases": ["隐藏", "闭眼", "eye-off", "hide"],
        "paths": [
            "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24",
            "M1 1l22 22",
        ],
    },
    # 箭头-右
    "arrow-right": {
        "aliases": ["右箭头", "下一步", "arrow-right", "next", "forward"],
        "paths": [
            "M5 12h14",
            "M12 5l7 7-7 7",
        ],
    },
    # 箭头-左
    "arrow-left": {
        "aliases": ["左箭头", "上一步", "arrow-left", "back", "previous"],
        "paths": [
            "M19 12H5",
            "M12 19l-7-7 7-7",
        ],
    },
    # 对勾
    "check": {
        "aliases": ["对勾", "完成", "check", "done", "success", "ok"],
        "paths": [
            "M20 6L9 17l-5-5",
        ],
    },
    # 关闭/X
    "close": {
        "aliases": ["关闭", "叉", "close", "x", "cancel", "error"],
        "paths": [
            "M18 6L6 18",
            "M6 6l12 12",
        ],
    },
    # 图表/数据
    "chart": {
        "aliases": ["图表", "数据", "chart", "data", "stats"],
        "paths": [
            "M18 20V10",
            "M12 20V4",
            "M6 20v-6",
        ],
    },
    # 月亮/夜间
    "moon": {
        "aliases": ["月亮", "夜间", "moon", "night", "dark"],
        "paths": [
            "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
        ],
    },
    # 太阳/白天
    "sun": {
        "aliases": ["太阳", "白天", "sun", "day", "light"],
        "paths": [
            "M12 1v2",
            "M12 21v2",
            "M4.22 4.22l1.42 1.42",
            "M18.36 18.36l1.42 1.42",
            "M1 12h2",
            "M21 12h2",
            "M4.22 19.78l1.42-1.42",
            "M18.36 5.64l1.42-1.42",
            "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
        ],
    },
    # 麦克风/语音
    "mic": {
        "aliases": ["麦克风", "语音", "mic", "voice", "record"],
        "paths": [
            "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z",
            "M19 10v2a7 7 0 0 1-14 0v-2",
            "M12 19v4",
            "M8 23h8",
        ],
    },
    # 键盘
    "keyboard": {
        "aliases": ["键盘", "输入", "keyboard", "input", "type"],
        "paths": [
            "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
            "M6 9h.01",
            "M10 9h.01",
            "M14 9h.01",
            "M18 9h.01",
            "M6 13h.01",
            "M10 13h.01",
            "M14 13h.01",
            "M18 13h.01",
            "M8 17h8",
        ],
    },
    # 书本/学习
    "book": {
        "aliases": ["书", "学习", "book", "study", "read"],
        "paths": [
            "M4 19.5A2.5 2.5 0 0 1 6.5 17H20",
            "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
        ],
    },
    # 奖杯/成就
    "trophy": {
        "aliases": ["奖杯", "成就", "trophy", "achievement", "award"],
        "paths": [
            "M6 9H4.5a2.5 2.5 0 0 1 0-5H6",
            "M18 9h1.5a2.5 2.5 0 0 0 0-5H18",
            "M4 22h16",
            "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",
            "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",
            "M18 2H6v7a6 6 0 0 0 12 0V2z",
        ],
    },
    # 火苗/运动
    "fire": {
        "aliases": ["火", "运动", "热量", "fire", "flame", "exercise", "calories"],
        "paths": [
            "M12 2c0 0-7 4-7 11v3l-2 2h18l-2-2v-3c0-7-7-11-7-11z",
            "M12 14a2 2 0 0 1-2-2c0-1.5 2-3 2-3s2 1.5 2 3a2 2 0 0 1-2 2z",
        ],
    },
    # 水杯/饮水
    "cup": {
        "aliases": ["水杯", "饮水", "cup", "water", "drink"],
        "paths": [
            "M17 8h1a4 4 0 0 1 0 8h-1",
            "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z",
            "M6 2v3",
            "M10 2v3",
            "M14 2v3",
        ],
    },
    # 喇叭/声音
    "speaker": {
        "aliases": ["喇叭", "声音", "扬声器", "speaker", "sound", "volume", "audio"],
        "paths": [
            "M4 9 L10 5",
            "M10 5 L10 19",
            "M10 19 L4 15",
            "M4 15 L4 9",
            "M14 8 Q17 12 14 16",
        ],
    },
    # 桌面话筒/立式麦克风
    "mic-stand": {
        "aliases": ["话筒", "麦克风", "桌面话筒", "会议话筒", "mic-stand", "stand-mic", "voicemike"],
        "paths": [
            "M12 2 Q16 2 16 8 Q16 14 12 14 Q8 14 8 8 Q8 2 12 2",
            "M12 14 L12 19",
            "M7 19 Q12 23 17 19",
            "M9 21 L15 21",
        ],
    },
    # 跑步/运动
    "run": {
        "aliases": ["跑步", "运动", "run", "running", "jog"],
        "paths": [
            "M13 4v6",
            "M16 2l3 3-3 3",
            "M19 13l-2 8-5-3-2 3",
            "M4 18l3-3 3 3",
            "M9 12l-3-3 4-3 2 3",
        ],
    },
    # 睡觉/作息
    "sleep": {
        "aliases": ["睡觉", "睡眠", "sleep", "bed", "rest"],
        "paths": [
            "M2 20h20",
            "M5 20v-9a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v9",
            "M15 11V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4",
        ],
    },
    # 秤/体重
    "scale": {
        "aliases": ["秤", "体重", "scale", "weight", "bmi"],
        "paths": [
            "M20 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z",
            "M12 7a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z",
            "M12 7V5",
        ],
    },
    # 药丸/药物
    "pill": {
        "aliases": ["药", "药物", "pill", "medicine", "drug"],
        "paths": [
            "M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z",
            "M8.5 8.5l7 7",
        ],
    },
}


def resolve_icon(name: str) -> str | None:
    """根据关键词查找对应的图标 key"""
    name = name.strip().lower()

    # 直接匹配 key
    if name in ICONS:
        return name

    # 匹配别名
    for key, info in ICONS.items():
        if name in [a.lower() for a in info["aliases"]]:
            return key

    return None


def list_all_icons():
    """列出所有可用图标"""
    print("\n[LIST] 可用图标列表（共 {} 个）:\n".format(len(ICONS)))
    for key, info in sorted(ICONS.items()):
        aliases = ", ".join(info["aliases"])
        print(f"  {key:12} → {aliases}")
    print()


def process_svg_content(content: str, color: str) -> str:
    """将 SVG 中的 currentColor 替换为指定颜色"""
    content = content.replace('stroke="currentColor"', f'stroke="{color}"')
    content = content.replace("stroke='currentColor'", f'stroke="{color}"')
    content = content.replace('fill="currentColor"', f'fill="{color}"')
    content = content.replace("fill='currentColor'", f'fill="{color}"')
    return content


def generate_from_svgs():
    """从 svgs/ 目录读取 SVG 文件并生成默认色 + 主题色图标"""
    if not os.path.exists(SVGS_DIR):
        print(f"[ERR] SVG 目录不存在: {SVGS_DIR}")
        return 0, 0

    svg_files = [f for f in os.listdir(SVGS_DIR) if f.lower().endswith('.svg')]
    if not svg_files:
        print(f"[WARN] SVG 目录为空: {SVGS_DIR}")
        return 0, 0

    print(f"\n>> 从 {SVGS_DIR} 读取 SVG 文件，共 {len(svg_files)} 个\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    success = 0
    failed = 0

    for svg_file in svg_files:
        name = os.path.splitext(svg_file)[0]
        svg_path = os.path.join(SVGS_DIR, svg_file)

        try:
            with open(svg_path, 'r', encoding='utf-8') as f:
                svg_content = f.read()

            # 1. 默认色版本（currentColor → #333333）
            svg_default = process_svg_content(svg_content, DEFAULT_COLOR)
            default_path = os.path.join(OUTPUT_DIR, f"icon-{name}.svg")
            with open(default_path, 'w', encoding='utf-8') as f:
                f.write(svg_default)
            print(f"  [OK] SVG(default): icon-{name}.svg")

            png_default_path = default_path.replace(".svg", ".png")
            convert_to_png(default_path, png_default_path)

            # 2. 主题色版本（currentColor → #ff6b9d）
            svg_theme = process_svg_content(svg_content, THEME_COLOR)
            theme_path = os.path.join(OUTPUT_DIR, f"icon-{name}-theme.svg")
            with open(theme_path, 'w', encoding='utf-8') as f:
                f.write(svg_theme)
            print(f"  [OK] SVG(theme):  icon-{name}-theme.svg")

            png_theme_path = theme_path.replace(".svg", ".png")
            convert_to_png(theme_path, png_theme_path)

            success += 1

        except Exception as e:
            print(f"  [ERR] 处理 {svg_file} 失败: {e}")
            failed += 1

    return success, failed


def main():
    args = sys.argv[1:]

    if not args or "--help" in args or "-h" in args:
        print(__doc__)
        print("\n[EXAMPLE] 示例:")
        print("  python scripts/generate-icons.py chat person clock")
        print("  python scripts/generate-icons.py 聊天 我的 时钟")
        print("  python scripts/generate-icons.py --list")
        print("  python scripts/generate-icons.py --from-svg")
        return

    if "--list" in args:
        list_all_icons()
        return

    if "--from-svg" in args:
        success, failed = generate_from_svgs()
        print(f"\n{'='*40}")
        print(f"[OK] 成功: {success}  |  [ERR] 失败: {failed}")
        print(f"{'='*40}\n")
        return

    print(f"\n>> 开始生成图标，输出目录: {OUTPUT_DIR}\n")

    success = 0
    failed = 0

    for arg in args:
        key = resolve_icon(arg)
        if key:
            generate_icon(key, ICONS[key]["paths"])
            success += 1
        else:
            print(f"\n[ERR] 未知图标: '{arg}'")
            # 尝试查找相似名称
            suggestions = [
                k for k in ICONS
                if arg[0] in k or any(arg[0] in a for a in ICONS[k]["aliases"])
            ][:3]
            if suggestions:
                print(f"   你可能想找: {', '.join(suggestions)}")
            print(f"   执行 --list 查看全部可用图标")
            failed += 1

    print(f"\n{'='*40}")
    print(f"[OK] 成功: {success}  |  [ERR] 失败: {failed}")
    print(f"{'='*40}\n")


if __name__ == "__main__":
    main()
