# 渲染后 FFmpeg 处理参数

## 9x16 竖屏（1080x1920）

```bash
ffmpeg -i out/video.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k \
  -movflags +faststart \
  -y out/final.mp4
```

## 16x9 横屏（1920x1080）

```bash
ffmpeg -i out/video.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k \
  -movflags +faststart \
  -y out/final.mp4
```

## 压缩到平台规格

```bash
# 抖音/视频号推荐：H.264, AAC, 1080x1920, 码率 5-8Mbps
ffmpeg -i out/final.mp4 -c:v libx264 -b:v 6M -maxrate 8M -bufsize 4M -c:a aac -b:a 128k -y out/platform.mp4
```

## 加封面（首帧）

```bash
ffmpeg -i out/final.mp4 -i public/cover.png -map 0 -map 1 -c copy -disposition:v:1 attached_pic out/with_cover.mp4
```
