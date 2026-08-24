# FFmpeg 常见陷阱与最佳实践

## `-ss` 位置陷阱

这是 FFmpeg 最常见的误用，直接决定裁剪精度和速度。

### 放 `-i` 前（快速但不精确）

```bash
ffmpeg -ss 00:01:00 -i input.mp4 -t 00:00:30 -c copy output.mp4
```

- 使用 **关键帧 seek**，速度极快
- 起始点可能偏移到最近的关键帧（偏差 1-10 秒）
- 适用于：粗略裁剪、长视频快速截取

### 放 `-i` 后（精确但慢）

```bash
ffmpeg -i input.mp4 -ss 00:01:00 -t 00:00:30 -c copy output.mp4
```

- 逐帧解码到指定位置，精确到帧
- 速度慢（需解码前面全部帧）
- 适用于：需要精确起止点的裁剪

### 既快又准（先 seek 再重编码）

```bash
ffmpeg -ss 00:01:00 -i input.mp4 -t 00:00:30 -c:v libx264 -c:a aac output.mp4
```

- `-ss` 放 `-i` 前实现快速 seek
- 同时重编码（不用 `-c copy`）确保精度
- 最推荐的平衡方案

## `-c copy` 无损复制

```bash
ffmpeg -i input.mp4 -c copy output.mp4
```

优点：
- 不重新编码，速度极快
- 画质无损

限制：
- 剪裁只能在关键帧位置
- 不能同时叠加滤镜
- 源和目标容器必须兼容同一编码格式

## 覆盖文件

FFmpeg 默认遇到同名文件会交互询问 `Overwrite? [y/N]`，无人值守时必须处理：

```bash
# 自动覆盖（静默）
ffmpeg -y -i input.mp4 output.mp4

# 自动跳过（不覆盖）
ffmpeg -n -i input.mp4 output.mp4
```

**本 skill 约定**：默认使用 `-y`，但生成前提醒用户确认不会被误覆盖。

## 路径含空格/中文

Windows 下路径含空格或中文必须用双引号：

```bash
# 正确
ffmpeg -i "D:\我的视频\input file.mp4" "output.mp4"

# 错误（会报 No such file）
ffmpeg -i D:\我的视频\input file.mp4 output.mp4
```

## 字幕中文乱码

Windows 下 `subtitles` 滤镜渲染中文字幕乱码：

```bash
ffmpeg -i input.mp4 -vf "subtitles=subs.srt:fontsdir=C\:/Windows/Fonts" output.mp4
```

关键点：
- `fontsdir` 指向系统字体目录
- Windows 路径用 `/` 而非 `\`，且盘符的 `:` 前加 `\` 转义

## GIF 输出色彩差

直接转 GIF 只有 256 色且无透明平滑：

```bash
# 错误：色彩会很差
ffmpeg -i input.mp4 output.gif

# 正确：使用调色板提升画质
ffmpeg -i input.mp4 -vf "fps=10,scale=480:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i input.mp4 -i palette.png -vf "fps=10,scale=480:-1:flags=lanczos,paletteuse" output.gif
```

两步走：先生成调色板，再用调色板生成 GIF。

## H.265/HEVC 编解码器

部分 FFmpeg 构建不包含 libx265：

```bash
# 检测是否支持
ffmpeg -encoders | grep hevc
ffmpeg -encoders | grep x265
```

若只有硬件编码器（`hevc_amf`/`hevc_nvenc`），无 `libx265`，建议用 `libx264` 替代。

## concat 拼接

不支持直接用空格分隔多文件：

```bash
# 错误
ffmpeg -i a.mp4 b.mp4 output.mp4

# 正确：concat demuxer
# 先创建文件列表 filelist.txt：
#   file 'a.mp4'
#   file 'b.mp4'
# 再：
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4
```

注意 `-safe 0` 允许非安全路径（含盘符、中文路径时必需）。

## 音量调整

`volume` 滤镜的值含义易混淆：

```bash
# 0dB = 原始音量
# +6dB = 翻倍
# -6dB = 减半
ffmpeg -i input.mp4 -af "volume=3dB" output.mp4   # 增大
ffmpeg -i input.mp4 -af "volume=-6dB" output.mp4  # 减小
ffmpeg -i input.mp4 -af "volume=2.0" output.mp4   # 线性：2 倍
```
