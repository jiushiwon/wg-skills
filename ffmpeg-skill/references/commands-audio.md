# 音频类命令模板

## 提取/替换音频

```bash
# 提取原音频
ffmpeg -i input.mp4 -vn -c:a aac -b:a 192k audio_only.m4a

# 替换视频中的音频
ffmpeg -i video.mp4 -i new_audio.mp3 -c:v copy -map 0:v:0 -map 1:a:0 -shortest output.mp4

# 保留原音频 + 替换（多音轨 MKV）
ffmpeg -i video.mp4 -i new_audio.mp3 -c:v copy -map 0:v:0 -map 0:a:0 -map 1:a:0 -shortest output.mkv
```

## 音量调整

```bash
# 增加 3dB
ffmpeg -i input.mp4 -af "volume=3dB" -c:v copy output.mp4

# 减半（-6dB）
ffmpeg -i input.mp4 -af "volume=-6dB" -c:v copy output.mp4

# 线性倍数（2 倍音量）
ffmpeg -i input.mp4 -af "volume=2.0" -c:v copy output.mp4

# 降噪后增加音量（先 -6dB 裁剪，再 +9dB）
ffmpeg -i input.mp4 -af "volume=-6dB,volume=9dB" -c:v copy output.mp4
```

## 去除视频原声（静音）

```bash
# 去掉音频流
ffmpeg -i input.mp4 -c:v copy -an output.mp4

# 保留音频流但静音
ffmpeg -i input.mp4 -af "volume=0" -c:v copy output.mp4
```

## 原声 + 背景音乐混合

```bash
# 原声保持，BGM 降为 20% 音量混合
ffmpeg -i video.mp4 -i bgm.mp3 -filter_complex \
  "[1:a]volume=0.2[bgm];[0:a]volume=1.0[orig];[orig][bgm]amix=inputs=2:duration=first" \
  -c:v copy -shortest output.mp4

# BGM 循环到视频长度
ffmpeg -i video.mp4 -stream_loop -1 -i bgm.mp3 -filter_complex \
  "[1:a]volume=0.15[bgm];[0:a]volume=1.0[orig];[orig][bgm]amix=inputs=2:duration=first" \
  -c:v copy -shortest output.mp4
```

## 音频淡入淡出

```bash
# 开头 3 秒淡入，结尾 5 秒淡出
ffmpeg -i input.mp4 -af "afade=t=in:ss=0:d=3,afade=t=out:st=60:d=5" -c:v copy output.mp4

# 仅淡入
ffmpeg -i input.mp4 -af "afade=t=in:ss=0:d=3" -c:v copy output.mp4

# 仅淡出（假设视频长 120 秒）
ffmpeg -i input.mp4 -af "afade=t=out:st=115:d=5" -c:v copy output.mp4
```

## 音频裁剪

```bash
# 截取 1:00-1:30 的音频
ffmpeg -ss 00:01:00 -t 00:00:30 -i input.mp4 -vn -c:a aac output.m4a
```

## 音频格式转换

```bash
# WAV → MP3
ffmpeg -i input.wav -c:a libmp3lame -q:a 2 output.mp3

# FLAC → AAC
ffmpeg -i input.flac -c:a aac -b:a 256k output.m4a

# MP3 → WAV（无损，但不会恢复已丢失的信息）
ffmpeg -i input.mp3 -c:a pcm_s16le output.wav

# 批量 WAV → MP3
for f in *.wav; do ffmpeg -i "$f" -c:a libmp3lame -q:a 2 "${f%.wav}.mp3"; done
```

## 音频拼接

```bash
# 多个音频文件拼接
# 生成列表 concat.txt：
# file 'part1.mp3'
# file 'part2.mp3'

ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp3
```

## 音频合并（多轨混合）

```bash
# 两个音频混合
ffmpeg -i voice.mp3 -i bgm.mp3 -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:weights=1 0.3" output.mp3
```

> `weights=1 0.3` 表示第 1 路音量 100%，第 2 路 30%。

## 加速/减速（保持音高）

```bash
# 1.5 倍速
ffmpeg -i input.mp3 -af "atempo=1.5" output.mp3

# 0.75 倍速
ffmpeg -i input.mp3 -af "atempo=0.75" output.mp3

# 4 倍速（链式，tempo 范围 0.5-2.0）
ffmpeg -i input.mp3 -af "atempo=2.0,atempo=2.0" output.mp3
```
