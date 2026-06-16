#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate plus and smile icons to match voice2.png style
"""
import os
import sys
from PIL import Image, ImageDraw, ImageColor

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Output directory
ICONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'static', 'icons')

# Target size (matching voice2.png)
SIZE = (57, 48)

# Gray color (matching voice2.png style - #666666)
GRAY_COLOR = '#666666'


def create_plus_icon(output_path: str, size: tuple, color: str) -> bool:
    """Create plus icon"""
    try:
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        c = ImageColor.getrgb(color)
        w, h = size
        stroke = max(4, w // 14)

        # Horizontal line
        draw.rectangle([w*0.2, h*0.45, w*0.8, h*0.55], fill=c)
        # Vertical line
        draw.rectangle([w*0.45, h*0.2, w*0.55, h*0.8], fill=c)

        img.save(output_path, 'PNG')
        print(f'[OK] plus.png')
        return True
    except Exception as e:
        print(f'[FAIL] plus.png: {e}')
        return False


def create_smile_icon(output_path: str, size: tuple, color: str) -> bool:
    """Create smile icon"""
    try:
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        c = ImageColor.getrgb(color)
        w, h = size
        stroke = max(3, w // 15)

        # Oval face
        margin = w // 8
        draw.ellipse([margin, margin, w-margin, h-margin], outline=c, width=stroke)

        # Left eye
        eye_x = w * 0.35
        eye_y = h * 0.38
        eye_r = max(2, w // 16)
        draw.ellipse([eye_x-eye_r, eye_y-eye_r, eye_x+eye_r, eye_y+eye_r], fill=c)

        # Right eye
        eye_x2 = w * 0.65
        draw.ellipse([eye_x2-eye_r, eye_y-eye_r, eye_x2+eye_r, eye_y+eye_r], fill=c)

        # Smile arc
        smile_y = h * 0.55
        draw.arc([w*0.25, h*0.35, w*0.75, h*0.75], start=20, end=160, fill=c, width=stroke)

        img.save(output_path, 'PNG')
        print(f'[OK] smile.png')
        return True
    except Exception as e:
        print(f'[FAIL] smile.png: {e}')
        return False


def main():
    print(f'Target size: {SIZE}')
    print(f'Color: {GRAY_COLOR}')
    print(f'Output: {ICONS_DIR}')
    print('-' * 40)

    plus_path = os.path.join(ICONS_DIR, 'plus.png')
    smile_path = os.path.join(ICONS_DIR, 'smile.png')

    # Check if files exist
    if os.path.exists(plus_path):
        print('[EXISTS] plus.png already exists')
    else:
        create_plus_icon(plus_path, SIZE, GRAY_COLOR)

    if os.path.exists(smile_path):
        print('[EXISTS] smile.png already exists')
    else:
        create_smile_icon(smile_path, SIZE, GRAY_COLOR)

    print('-' * 40)
    print('Done')


if __name__ == '__main__':
    main()