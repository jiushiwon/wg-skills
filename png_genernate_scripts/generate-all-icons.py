#!/usr/bin/env python3
"""
批量图标生成脚本
将 scripts/svgs/ 和 scripts/svgs/tabbar/ 下的 SVG 文件转换为 PNG

用法:
    python scripts/generate-all-icons.py
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVGS_DIR = os.path.join(BASE_DIR, "scripts", "svgs")
TABBAR_SVGS_DIR = os.path.join(SVGS_DIR, "tabbar")
OUTPUT_TABBAR = os.path.join(BASE_DIR, "src", "static", "tabbar")
OUTPUT_IMAGES = os.path.join(BASE_DIR, "src", "static", "images")
OUTPUT_ICONS = os.path.join(BASE_DIR, "src", "static", "icons")


def svg_to_png(svg_path: str, png_path: str, width: int, height: int, color: str = None):
    """将 SVG 转换为指定尺寸的 PNG"""
    from svglib.svglib import svg2rlg
    from reportlab.graphics import renderPM
    from reportlab.lib.colors import HexColor

    drawing = svg2rlg(svg_path)
    if drawing is None:
        raise ValueError(f"无法解析 SVG: {svg_path}")

    # 计算缩放比例
    scale_x = width / drawing.width
    scale_y = height / drawing.height
    scale = min(scale_x, scale_y)

    drawing.width = width
    drawing.height = height
    drawing.scale(scale, scale)

    # 如果指定了颜色，替换 currentColor
    if color:
        _replace_color_in_drawing(drawing, color)

    os.makedirs(os.path.dirname(png_path), exist_ok=True)
    renderPM.drawToFile(drawing, png_path, fmt="PNG", dpi=150)
    print(f"  [OK] {png_path} ({width}x{height})")


def _replace_color_in_drawing(drawing, color):
    """递归替换绘图中的 currentColor"""
    from reportlab.graphics.shapes import Group

    def replace_in_shape(shape):
        if hasattr(shape, 'strokeColor') and shape.strokeColor:
            try:
                if hasattr(shape.strokeColor, 'colors') or str(shape.strokeColor).lower() == 'currentcolor':
                    shape.strokeColor = HexColor(color)
            except:
                pass
        if hasattr(shape, 'fillColor') and shape.fillColor:
            try:
                if hasattr(shape.fillColor, 'colors') or str(shape.fillColor).lower() == 'currentcolor':
                    shape.fillColor = HexColor(color)
            except:
                pass
        if hasattr(shape, 'textAnchor'):
            pass  # 文本颜色由 fillColor 控制

    def traverse(group):
        if hasattr(group, 'contents'):
            for child in group.contents:
                replace_in_shape(child)
                if isinstance(child, Group):
                    traverse(child)

    traverse(drawing)


def process_tabbar_icons():
    """处理 tabBar 图标：81x81px，默认灰色，选中主题色"""
    print("\n[TABBAR] 生成 tabBar 图标 (81x81px)...")

    icons = [
        ("home", "#8C8C8C"),
        ("home-active", "#7BA59D"),
        ("dashboard", "#8C8C8C"),
        ("dashboard-active", "#7BA59D"),
        ("profile", "#8C8C8C"),
        ("profile-active", "#7BA59D"),
    ]

    for name, color in icons:
        svg_path = os.path.join(TABBAR_SVGS_DIR, f"{name}.svg")
        if not os.path.exists(svg_path):
            print(f"  [SKIP] 未找到: {svg_path}")
            continue

        png_name = name.replace("-", "-") + ".png"
        png_path = os.path.join(OUTPUT_TABBAR, png_name)
        svg_to_png(svg_path, png_path, 81, 81, color)


def process_share_image():
    """处理分享封面图：500x400px"""
    print("\n[SHARE] 生成分享封面 (500x400px)...")

    svg_path = os.path.join(SVGS_DIR, "share-default.svg")
    if os.path.exists(svg_path):
        png_path = os.path.join(OUTPUT_IMAGES, "share-default.png")
        svg_to_png(svg_path, png_path, 500, 400)
    else:
        print(f"  [SKIP] 未找到: {svg_path}")


def process_existing_svgs():
    """处理 scripts/svgs/ 下已有的 SVG 文件（ai, weight, diet, sport 等）"""
    print("\n[ICONS] 生成通用图标 (48x48px)...")

    svg_files = [f for f in os.listdir(SVGS_DIR) if f.endswith('.svg')]
    for svg_file in svg_files:
        name = os.path.splitext(svg_file)[0]
        svg_path = os.path.join(SVGS_DIR, svg_file)

        # 跳过 tabbar 和 share 目录/文件
        if name.startswith('tabbar') or name == 'share-default':
            continue

        png_path = os.path.join(OUTPUT_ICONS, f"icon-{name}.png")
        svg_to_png(svg_path, png_path, 48, 48)


def main():
    print("=" * 50)
    print("图标批量生成工具")
    print("=" * 50)

    try:
        process_tabbar_icons()
        process_share_image()
        process_existing_svgs()
    except Exception as e:
        print(f"\n[ERR] 生成失败: {e}")
        import traceback
        traceback.print_exc()
        return 1

    print("\n" + "=" * 50)
    print("[DONE] 所有图标生成完成!")
    print("=" * 50)
    return 0


if __name__ == "__main__":
    sys.exit(main())
