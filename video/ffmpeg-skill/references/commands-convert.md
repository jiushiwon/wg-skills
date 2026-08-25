# 转码类命令模板

## 格式转换

```bash
# MP4 → MKV（无损，仅换容器）
ffmpeg -i input.mp4 -c copy output.mkv

# MKV → MP4（需确认编码兼容）
ffmpeg -i input.mkv -c copy output.mp4

# 任意格式 → H.264 MP4（兼容性最好）
ffmpeg -i input.xxx -c:v libx264 -c:a aac output.mp4

# 任意格式 → H.265 MKV（体积更小）
ffmpeg -i input.xxx -c:v libx265 -c:a aac output.mkv

# 任意格式 → WebM（网页嵌入）
ffmpeg -i input.xxx -c:v libvpx-vp9 -c:a libopus output.webm

# MOV → MP4（Apple 生态输出）
ffmpeg -i input.mov -c copy output.mp4
```

## 视频压缩

```bash
# 默认压缩（CRF 23，适合大多数场景）
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# 高品质（CRF 18，视觉无损）
ffmpeg -i input.mp4 -c:v libx264 -crf 18 -preset slow -c:a aac -b:a 192k output.mp4

# 高压缩（CRF 28，牺牲画质换体积）
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 96k output.mp4

# 固定码率压缩（目标 1Mbps 视频码率）
ffmpeg -i input.mp4 -c:v libx264 -b:v 1M -maxrate 1M -bufsize 2M -c:a aac -b:a 128k output.mp4
```

## 分辨率调整

```bash
# 缩放到 720p
ffmpeg -i input.mp4 -vf "scale=1280:-1" -c:v libx264 -c:a copy output.mp4

# 缩放到 1080p（保持比例）
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -c:a copy output.mp4

# 缩小到 50%
ffmpeg -i input.mp4 -vf "scale=iw/2:ih/2" -c:v libx264 -c:a copy output.mp4

# 最大宽 720（等比缩放）
ffmpeg -i input.mp4 -vf "scale='min(720,iw)':-2" -c:v libx264 -c:a copy output.mp4
```

## 帧率转换

```bash
# 转 30fps
ffmpeg -i input.mp4 -r 30 -c:v libx264 -c:a copy output.mp4

# 转 60fps（需要插帧，时间变长）
ffmpeg -i input.mp4 -r 60 -c:v libx264 -c:a copy output.mp4
```

## 批量转码

```bash
# Windows PowerShell
Get-ChildItem *.mkv | ForEach-Object {
    ffmpeg -i $_.FullName -c:v libx264 -crf 23 -c:a aac "$($_.BaseName).mp4"
}

# Mac / Linux Bash
for f in *.mkv; do
    ffmpeg -i "$f" -c:v libx264 -crf 23 -c:a aac "${f%.mkv}.mp4"
done
```

## 旋转视频

```bash
# 顺时针 90°
ffmpeg -i input.mp4 -vf "transpose=1" -c:a copy output.mp4

# 逆时针 90°
ffmpeg -i input.mp4 -vf "transpose=2" -c:a copy output.mp4

# 180°
ffmpeg -i input.mp4 -vf "transpose=1,transpose=1" -c:a copy output.mp4
```

## 裁切视频

```bash
# 裁掉上下黑边（上下各裁 100px）
ffmpeg -i input.mp4 -vf "crop=iw:ih-200:0:100" -c:v libx264 -c:a copy output.mp4

# 裁掉左右黑边
ffmpeg -i input.mp4 -vf "crop=iw-200:ih:100:0" -c:v libx264 -c:a copy output.mp4
```
