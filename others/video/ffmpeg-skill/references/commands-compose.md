# 合成类命令模板

## 视频拼接（concat）

### 方式 1：concat demuxer（同编码，无损，推荐）

要求所有视频编码格式、分辨率完全相同：

```bash
# 创建文件列表 filelist.txt
# file 'part1.mp4'
# file 'part2.mp4'
# file 'part3.mp4'

ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4
```

用 Bash 生成文件列表：

```bash
# Mac / Linux / Git Bash
for f in part*.mp4; do echo "file '$f'" >> filelist.txt; done
```

```powershell
# Windows PowerShell
Get-ChildItem part*.mp4 | ForEach-Object { "file '$($_.Name)'" } | Out-File -Encoding ascii filelist.txt
```

### 方式 2：concat filter（不同编码/分辨率，需重编码）

```bash
ffmpeg -i part1.mp4 -i part2.mp4 -i part3.mp4 -filter_complex "concat=n=3:v=1:a=1" output.mp4
```

> `n=3` 是文件数量，`v=1` 每文件 1 路视频，`a=1` 每文件 1 路音频。

### 方式 3：中间过渡效果

```bash
# 淡入淡出过渡
ffmpeg -i part1.mp4 -i part2.mp4 -filter_complex \
  "[0][1]xfade=transition=fade:duration=1:offset=4[out];amix=inputs=2:duration=first" \
  output.mp4
```

## 画中画（overlay）

```bash
# 主视频右下角放小窗（1/4 大小）
ffmpeg -i main.mp4 -i pip.mp4 -filter_complex "[1:v]scale=iw/4:ih/4[pip];[0:v][pip]overlay=W-w-10:H-h-10" -c:a copy output.mp4

# 左右等分画面
ffmpeg -i left.mp4 -i right.mp4 -filter_complex "[0:v]crop=iw/2:ih:0:0[left];[1:v]crop=iw/2:ih:iw/2:0[right];[left][right]hstack" output.mp4

# 上下等分画面
ffmpeg -i top.mp4 -i bottom.mp4 -filter_complex "[0:v][1:v]vstack" output.mp4

# 四宫格
ffmpeg -i 1.mp4 -i 2.mp4 -i 3.mp4 -i 4.mp4 -filter_complex \
  "[0:v][1:v]hstack[top];[2:v][3:v]hstack[bottom];[top][bottom]vstack" output.mp4
```

## 音视频合成

### 图片 + 音频 → 视频

```bash
# 单图 + 音频 → 视频
ffmpeg -loop 1 -i cover.jpg -i music.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest output.mp4
```

> `-loop 1` 使图片无限循环；`-shortest` 以较短的输入（音频）为结束点。

### 视频 + 新音频

```bash
# 替换音频（去掉原音频，换新）
ffmpeg -i video.mp4 -i new_audio.mp3 -c:v copy -map 0:v:0 -map 1:a:0 -shortest output.mp4
```

### 视频 + 背景音乐（保留原声）

```bash
# 原声 80% + BGM 20%
ffmpeg -i video.mp4 -i bgm.mp3 -filter_complex \
  "[1:a]volume=0.2[bgm];[0:a]volume=0.8[orig];[orig][bgm]amix=inputs=2:duration=first" \
  -c:v copy -shortest output.mp4
```

### 静音原视频 + BGM

```bash
# 视频去掉原声 + BGM
ffmpeg -i video.mp4 -i bgm.mp3 -c:v copy -map 0:v:0 -map 1:a:0 -shortest output.mp4
```

## 多音轨视频

```bash
# 保留原音轨 + 添加新音轨（MKV 支持多轨）
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -map 0:v:0 -map 0:a:0 -map 1:a:0 -shortest output.mkv
```

## 图片拼接成横幅

```bash
# 两张图左右拼接
ffmpeg -i left.jpg -i right.jpg -filter_complex hstack output.jpg

# 三图横向拼接
ffmpeg -i 1.jpg -i 2.jpg -i 3.jpg -filter_complex "[0][1][2]hstack=inputs=3" output.jpg
```

> 要求图片高度相同，否则会报错。
