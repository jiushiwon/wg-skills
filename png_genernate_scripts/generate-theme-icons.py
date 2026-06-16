#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
icont theme color conversion script
Convert gray icons to theme color (#931c32)
"""
import os
import sys
from PIL import Image, ImageColor

# Force UTF-8 output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Theme color
THEME_COLOR = '#931c32'

# Icon directory
ICONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'static', 'icons')

# 需要生成主题版本的图标列表
ICONS_TO_CONVERT = [
    # 基础图标 -> 主题版本
    ('加号.png', '加号-theme.png'),
    ('笑脸.png', '笑脸-theme.png'),
    ('ic_voice.png', 'ic_voice-theme.png'),
    ('voice2.png', 'voice2-theme.png'),
    ('icon-mic-stand.png', 'icon-mic-stand-theme.png'),
    ('icon-speaker.png', 'icon-speaker-theme.png'),
    ('icon-bell.png', 'icon-bell-theme.png'),
    ('icon-clock.png', 'icon-clock-theme.png'),
    ('icon-mail.png', 'icon-mail-theme.png'),
    ('icon-person.png', 'icon-person-theme.png'),
    ('home.png', 'home-theme.png'),
    ('history.png', 'history-theme.png'),
    ('profile.png', 'profile-theme.png'),
    ('message.png', 'message-theme.png'),
    ('icon-chat.png', 'icon-chat-theme.png'),
    ('icon-todo.png', 'icon-todo-theme.png'),
    ('icon-growth.png', 'icon-growth-theme.png'),
]


def recolor_icon(input_path: str, output_path: str, target_color: str) -> bool:
    """将图标重新着色为主题色"""
    try:
        img = Image.open(input_path)

        # 转换为RGBA模式
        if img.mode != 'RGBA':
            img = img.convert('RGBA')

        # 获取主题色
        color = ImageColor.getrgb(target_color)

        # 创建主题色图像
        data = img.getdata()
        new_data = []

        for item in data:
            # alpha > 0 的像素（非透明）重新着色
            if item[3] > 0:
                new_data.append((*color, item[3]))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, 'PNG')
        print(f'✓ {os.path.basename(output_path)}')
        return True

    except Exception as e:
        print(f'✗ {os.path.basename(input_path)}: {e}')
        return False


def main():
    """Main function"""
    print(f'Theme color: {THEME_COLOR}')
    print(f'Icons directory: {ICONS_DIR}')
    print('-' * 40)

    created_count = 0
    skipped_count = 0

    for base_name, theme_name in ICONS_TO_CONVERT:
        input_path = os.path.join(ICONS_DIR, base_name)
        output_path = os.path.join(ICONS_DIR, theme_name)

        # Check if source file exists
        if not os.path.exists(input_path):
            print(f'[SKIP] {base_name}: source file not found')
            skipped_count += 1
            continue

        # Check if target file already exists
        if os.path.exists(output_path):
            print(f'[EXISTS] {theme_name}: already exists, skip')
            skipped_count += 1
            continue

        # Convert icon
        if recolor_icon(input_path, output_path, THEME_COLOR):
            created_count += 1
        else:
            skipped_count += 1

    print('-' * 40)
    print(f'Done: created {created_count}, skipped {skipped_count}')


if __name__ == '__main__':
    main()