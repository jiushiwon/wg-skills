#!/usr/bin/env python3
"""Generate growth tabBar icons."""
import os
from PIL import Image, ImageDraw

SRC_ICONS = os.path.join(os.path.dirname(__file__), '..', 'src', 'static', 'icons')

W, H = 64, 64

def create_growth_icon(color, path):
    img = Image.new('RGBA', (W, H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    c = color

    # Draw a bar chart / upward trend
    # Three bars of increasing height
    bar_w = 8
    gap = 6
    base_y = 50
    bars = [22, 32, 42]
    start_x = 14

    for i, h in enumerate(bars):
        x = start_x + i * (bar_w + gap)
        y = base_y - h
        draw.rectangle([x, y, x + bar_w, base_y], fill=c)

    # Draw an upward arrow line above the bars
    draw.line([(38, 28), (48, 18)], fill=c, width=3)
    draw.line([(48, 18), (44, 18)], fill=c, width=3)
    draw.line([(48, 18), (48, 22)], fill=c, width=3)

    img.save(path)
    print(f"Created {path}")

create_growth_icon((153, 153, 153, 255), os.path.join(SRC_ICONS, 'icon-growth.png'))
create_growth_icon((147, 28, 50, 255), os.path.join(SRC_ICONS, 'icon-growth-theme.png'))
