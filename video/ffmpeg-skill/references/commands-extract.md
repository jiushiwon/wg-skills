# 提取类命令模板

## 提取音频

```bash
# 提取为 AAC
ffmpeg -i input.mp4 -vn -c:a aac -b:a 192k output.m4a

# 提取为 MP3
ffmpeg -i input.mp4 -vn -c:a libmp3lame -q:a 2 output.mp3

# 提取为 WAV（无损）
ffmpeg -i input.mp4 -vn -c:a pcm_s16le output.wav

# 提取为 FLAC（无损压缩）
ffmpeg -i input.mp4 -vn -c:a flac output.flac

# 提取其中一段的音频
ffmpeg -ss 00:01:00 -t 00:00:30 -i input.mp4 -vn -c:a aac output.m4a
```

> `-vn` = 去除视频流；`-q:a 2` = MP3 品质 0（最高）~9（最低），2 是高品质。

## 截取视频帧

```bash
# 截取第 10 秒的一帧
ffmpeg -ss 00:00:10 -i input.mp4 -vframes 1 -q:v 2 output.jpg

# 每 5 秒截一帧（序列）
ffmpeg -i input.mp4 -vf "fps=1/5" -q:v 2 frame_%04d.jpg

# 每分钟截一帧
ffmpeg -i input.mp4 -vf "fps=1/60" -q:v 2 frame_%04d.jpg

# 截取指定时间范围的帧（每秒 1 帧）
ffmpeg -ss 00:01:00 -t 00:00:10 -i input.mp4 -vf "fps=1" frame_%04d.jpg
```

> `-q:v 2` = JPEG 画质 2-31（越小越好），`%04d` = 四位数字编号。

## 视频转 GIF

```bash
# 两步走（品质好，推荐）
ffmpeg -i input.mp4 -vf "fps=10,scale=480:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i input.mp4 -i palette.png -vf "fps=10,scale=480:-1:flags=lanczos,paletteuse" output.gif

# 一步（品质差，仅用于快速预览）
ffmpeg -i input.mp4 -vf "fps=10,scale=480:-1" output.gif

# 指定时长
ffmpeg -ss 00:01:00 -t 00:00:05 -i input.mp4 -vf "fps=10,scale=480:-1:flags=lanczos,palettegen" palette.png
ffmpeg -ss 00:01:00 -t 00:00:05 -i input.mp4 -i palette.png -vf "fps=10,scale=480:-1:flags=lanczos,paletteuse" output.gif
```

## 提取字幕

```bash
# 提取内嵌字幕为 SRT
ffmpeg -i input.mkv -map 0:s:0 subs.srt

# 提取所有字幕轨
ffmpeg -i input.mkv -map 0:s subs_%d.srt
```

## 提取视频流（去掉音频）

```bash
ffmpeg -i input.mp4 -c:v copy -an output.mp4
```

> `-an` = 去除音频流。

## 截取视频片段为 GIF（一步到位）

```bash
# 创建调色板 + 生成 GIF
ffmpeg -ss 00:00:05 -t 3 -i input.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif
```

> 用 `split` + `palettegen` + `paletteuse` 滤镜组合可一步完成，无中间文件。
