# 剪辑类命令模板

## 精确裁剪（推荐）

快速 seek + 重编码，既快又准：

```bash
ffmpeg -ss 开始时间 -i 输入.mp4 -t 持续时长 输出.mp4
```

示例：

```bash
# 截取 1:00 到 1:30（30 秒）
ffmpeg -ss 00:01:00 -i input.mp4 -t 00:00:30 -c:v libx264 -c:a aac output.mp4

# 截取 30 秒开始到 2 分 15 秒结束
ffmpeg -ss 00:00:30 -i input.mp4 -to 00:02:15 -c:v libx264 -c:a aac output.mp4
```

## 无损裁剪（仅关键帧）

无需重编码，速度极快，但起始点可能偏移到最近关键帧：

```bash
ffmpeg -ss 00:01:00 -i input.mp4 -t 00:00:30 -c copy -avoid_negative_ts make_zero output.mp4
```

## 按时间段分割

```bash
# 第 1 段：0:00 - 1:00
ffmpeg -ss 0 -i input.mp4 -t 00:01:00 -c copy part1.mp4

# 第 2 段：1:00 - 2:00
ffmpeg -ss 00:01:00 -i input.mp4 -t 00:01:00 -c copy part2.mp4
```

## 去除片头片尾

```bash
# 去掉前 5 秒和后 10 秒
# 需要先获取总时长，计算截取范围
ffprobe -v error -show_entries format=duration -of csv=p=0 input.mp4
# 假设总时长 120 秒
ffmpeg -ss 5 -i input.mp4 -t 105 -c:v libx264 -c:a aac output.mp4
```

## 调速

```bash
# 视频 2 倍速 + 音频 2 倍速（保持同步）
ffmpeg -i input.mp4 -vf "setpts=0.5*PTS" -af "atempo=2.0" output.mp4

# 视频 0.5 倍速（慢放）+ 音频 0.5 倍速
ffmpeg -i input.mp4 -vf "setpts=2*PTS" -af "atempo=0.5" output.mp4

# 16 倍速（延时摄影），音频需多次链式 atempo
ffmpeg -i input.mp4 -vf "setpts=1/16*PTS" -af "atempo=2.0,atempo=2.0,atempo=2.0,atempo=2.0" output.mp4
```

## 视频反转（倒放）

```bash
# 仅视频倒放（静音）
ffmpeg -i input.mp4 -vf reverse -an output.mp4

# 视频 + 音频一起倒放
ffmpeg -i input.mp4 -vf reverse -af areverse output.mp4
```

## 时间格式

| 格式 | 示例 | 含义 |
|------|------|------|
| `HH:MM:SS` | `00:01:30` | 1 分 30 秒 |
| `HH:MM:SS.mmm` | `00:01:30.500` | 1 分 30 秒 500 毫秒 |
| `ss` | `90` | 90 秒 |

> 用 `ffprobe -v error -show_entries format=duration -of csv=p=0 input.mp4` 获取精确总时长。
