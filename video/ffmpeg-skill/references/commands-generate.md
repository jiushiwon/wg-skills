# 生成类命令模板

## 图片序列 → 视频

```bash
# JPG 序列 → MP4（frame_0001.jpg, frame_0002.jpg...）
ffmpeg -framerate 30 -i frame_%04d.jpg -c:v libx264 -pix_fmt yuv420p output.mp4

# PNG 序列 → MP4
ffmpeg -framerate 24 -i img_%03d.png -c:v libx264 -pix_fmt yuv420p output.mp4

# 自定义帧率
ffmpeg -framerate 60 -i frame_%04d.jpg -c:v libx264 -crf 18 -pix_fmt yuv420p output.mp4

# 图片序列 + 音频 → 视频
ffmpeg -framerate 30 -i frame_%04d.jpg -i audio.mp3 -c:v libx264 -c:a aac -pix_fmt yuv420p -shortest output.mp4
```

> 图片编号必须从 1 开始连续。如果从其他数字开始，用 `-start_number`：
> ```bash
> ffmpeg -start_number 100 -i frame_%04d.jpg ...
> ```

## 单图 + 时长 → 视频

```bash
# 生成 10 秒静态画面视频
ffmpeg -loop 1 -i photo.jpg -c:v libx264 -t 10 -pix_fmt yuv420p output.mp4

# 单图 + 音频 → 视频（以音频时长为准）
ffmpeg -loop 1 -i photo.jpg -i music.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest output.mp4
```

## 纯色测试画面

```bash
# 5 秒红色 1080p 测试视频
ffmpeg -f lavfi -i color=c=red:s=1920x1080:d=5 -c:v libx264 output.mp4

# 10 秒白色 720p（带颜色值）
ffmpeg -f lavfi -i "color=c=0xFFFFFF:s=1280x720:d=10" -c:v libx264 output.mp4
```

## 测试画面模板

```bash
# SMPTE 彩条（电视台测试图）
ffmpeg -f lavfi -i smptebars=s=1920x1080:d=10 -c:v libx264 output.mp4

# 测试信号（SMPTE + 1kHz 音频）
ffmpeg -f lavfi -i smptebars=s=1920x1080:d=10 -f lavfi -i sine=frequency=1000:duration=10 -c:v libx264 -c:a aac -shortest output.mp4

# RGB 渐变测试画面
ffmpeg -f lavfi -i testsrc=s=1920x1080:d=10 -c:v libx264 output.mp4
```

## 带倒计时的视频

```bash
# 3-2-1 倒计时
ffmpeg -f lavfi -i "color=c=black:s=640x480:d=5,
  drawtext=fontsize=120:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:
  text='%{eif\\:ceil(5-t)\\:d}'" -c:v libx264 output.mp4
```

## 渐变色视频

```bash
# 5 秒黑→白渐变
ffmpeg -f lavfi -i "gradients=s=1920x1080:d=5" -c:v libx264 output.mp4
```

## 波形可视化视频（音频频谱）

```bash
# 音频频谱可视化
ffmpeg -i audio.mp3 -filter_complex "[0:a]showwaves=s=1280x720:mode=cline,format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -c:a aac output.mp4

# 频谱（频域）
ffmpeg -i audio.mp3 -filter_complex "[0:a]showfreqs=s=1280x720:mode=line,format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -c:a aac -shortest output.mp4
```
