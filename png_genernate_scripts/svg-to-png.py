#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SVG 转 PNG 脚本
将 svgs/ 目录下的所有 SVG 文件转换为 PNG，输出到同一目录。

用法:
    python scripts/svg-to-png.py
    python scripts/svg-to-png.py --size 64              # 指定输出尺寸（默认 48）
    python scripts/svg-to-png.py --color '#999999'      # 指定图标颜色（默认白色）

依赖:
    Node.js + sharp（已写入 package.json devDependencies）
"""

import os
import sys
import subprocess
import shutil

# Force UTF-8 output on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 脚本所在目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# SVG 源目录（与脚本同级 svgs/）
SVGS_DIR = os.path.join(SCRIPT_DIR, 'svgs')
# 默认输出尺寸
DEFAULT_SIZE = 48


def check_sharp() -> bool:
    """检查 sharp 是否可用"""
    node = shutil.which('node')
    if not node:
        print('[ERR] Node.js 未安装')
        return False

    # 检查项目目录下是否安装了 sharp
    project_root = os.path.dirname(os.path.dirname(SCRIPT_DIR))
    sharp_path = os.path.join(project_root, 'node_modules', 'sharp')
    if os.path.exists(sharp_path):
        return True

    # 尝试全局检查
    try:
        result = subprocess.run(
            [node, '-e', "require('sharp')"],
            capture_output=True, text=True, timeout=5
        )
        return result.returncode == 0
    except Exception:
        pass

    print('[ERR] sharp 未安装，请运行: npm install sharp --save-dev')
    return False


def make_colored_svg(svg_path: str, color: str) -> str:
    """读取 SVG 并将所有颜色改为指定颜色，返回临时文件路径"""
    with open(svg_path, 'r', encoding='utf-8') as f:
        content = f.read()

    import re
    # stroke="..."
    content = re.sub(r'stroke="[^"]*"', f'stroke="{color}"', content)
    content = re.sub(r"stroke='[^']*'", f'stroke="{color}"', content)
    # fill="..." (但保留 fill="none")
    content = re.sub(r'fill="(?!none)[^"]*"', f'fill="{color}"', content)
    content = re.sub(r"fill='(?!none)[^']*'", f'fill="{color}"', content)
    # 内联 style 中的颜色
    content = re.sub(r'stroke:\s*[^;"\'\s]+', f'stroke: {color}', content)
    content = re.sub(r'fill:\s*[^;"\'\s]+', f'fill: {color}', content)

    tmp_path = svg_path.replace('.svg', f'.tmp-{color.lstrip("#")}.svg')
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return tmp_path


def svg_to_png(svg_path: str, png_path: str, size: int = DEFAULT_SIZE, color: str = '#FFFFFF') -> bool:
    """使用 Node.js + sharp 将 SVG 转为 PNG"""
    node = shutil.which('node')
    project_root = os.path.dirname(os.path.dirname(SCRIPT_DIR))

    # 生成指定颜色的临时 SVG
    colored_svg_path = make_colored_svg(svg_path, color)

    js_code = (
        f"const sharp = require('sharp'); "
        f"sharp('{colored_svg_path.replace(chr(92), '/')}')"
        f".resize({size}, {size})"
        f".png()"
        f".toFile('{png_path.replace(chr(92), '/')}')"
        f".then(() => {{ console.log('OK'); process.exit(0); }})"
        f".catch((e) => {{ console.error(e.message); process.exit(1); }});"
    )

    try:
        result = subprocess.run(
            [node, '-e', js_code],
            capture_output=True, text=True, timeout=15,
            cwd=project_root
        )
        # 删除临时文件
        if os.path.exists(colored_svg_path):
            os.remove(colored_svg_path)
        return result.returncode == 0
    except Exception as e:
        if os.path.exists(colored_svg_path):
            os.remove(colored_svg_path)
        print(f'  [ERR] sharp 转换失败: {e}')
        return False


def main():
    args = sys.argv[1:]
    size = DEFAULT_SIZE
    color = '#FFFFFF'

    if '--size' in args:
        idx = args.index('--size')
        if idx + 1 < len(args):
            try:
                size = int(args[idx + 1])
            except ValueError:
                pass

    if '--color' in args:
        idx = args.index('--color')
        if idx + 1 < len(args):
            color = args[idx + 1]

    if not os.path.exists(SVGS_DIR):
        print(f'[ERR] SVG 目录不存在: {SVGS_DIR}')
        return

    svg_files = [f for f in os.listdir(SVGS_DIR) if f.lower().endswith('.svg')]
    if not svg_files:
        print(f'[WARN] SVG 目录为空: {SVGS_DIR}')
        return

    if not check_sharp():
        return

    print(f'\n>> SVG 转 PNG，源目录: {SVGS_DIR}')
    print(f'>> 输出尺寸: {size}x{size}')
    print(f'>> 图标颜色: {color}')
    print(f'>> 共 {len(svg_files)} 个文件\n')

    success = 0
    failed = 0

    for svg_file in svg_files:
        name = os.path.splitext(svg_file)[0]
        svg_path = os.path.join(SVGS_DIR, svg_file)
        png_path = os.path.join(SVGS_DIR, f'{name}.png')

        print(f'  转换: {svg_file} -> {name}.png ... ', end='', flush=True)

        if svg_to_png(svg_path, png_path, size, color):
            print('OK')
            success += 1
        else:
            print('失败')
            failed += 1

    print(f'\n{"="*40}')
    print(f'[OK] 成功: {success}  |  [ERR] 失败: {failed}')
    print(f'{"="*40}\n')


if __name__ == '__main__':
    main()
