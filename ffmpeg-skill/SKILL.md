---
name: ffmpeg-skill
description: "FFmpeg 多媒体处理技能 — 将自然语言描述转为正确的 ffmpeg 命令，覆盖视频剪辑、转码、水印、合成、提取、生成等操作。内置一键安装脚本（Windows/Mac/Linux）。触发词：ffmpeg、视频剪辑、视频裁剪、视频转码、视频压缩、去水印、加水印、视频拼接、视频合成、提取音频、视频转 GIF、截取视频帧、调整播放速度、画中画、批量处理视频、给视频加字幕、修改分辨率、音频替换、倍速播放、视频倒放。"
argument-hint: "[操作描述] [输入文件] [参数...]"
user-invocable: true
triggers:
  - "ffmpeg"
  - "视频剪辑"
  - "视频裁剪"
  - "视频分割"
  - "视频转码"
  - "视频压缩"
  - "视频格式转换"
  - "去水印"
  - "加水印"
  - "视频拼接"
  - "视频合成"
  - "提取音频"
  - "视频转 GIF"
  - "截取视频帧"
  - "调整播放速度"
  - "倍速播放"
  - "视频倒放"
  - "画中画"
  - "批量处理视频"
  - "给视频加字幕"
  - "修改分辨率"
  - "音频替换"
  - "混音"
  - "视频去声"
  - "音频淡入淡出"
  - "图片合成视频"
---

# ffmpeg-skill

FFmpeg 多媒体处理技能 — 把自然语言指令转成正确、安全的 ffmpeg 命令。

## 定位

**本 skill 是 FFmpeg 的命令翻译层**：用户说"把视频压缩到 10MB 以内"，输出对应的 ffmpeg 命令行并执行。skill 不捆绑 FFmpeg 本体，只提供安装脚本和命令模板。

## 核心能力

| 操作域 | 说明 | 关键命令/滤镜 |
|--------|------|--------------|
| **安装检测** | 自动检测 + 一键安装脚本 | `scripts/install-ffmpeg.ps1` / `.sh` |
| **剪辑** | 裁剪、分割、调速、倒放 | `-ss`, `-t`, `setpts`, `reverse` |
| **转码** | 格式转换、压缩、分辨率、帧率 | `-c:v`, `-crf`, `scale`, `-r` |
| **去水印** | 模糊遮盖固定区域水印 | `delogo` |
| **加水印** | 图片水印、文字水印、动态水印 | `overlay`, `drawtext` |
| **合成** | 拼接、画中画、多轨混合 | `concat`, `overlay`, `amix` |
| **提取** | 抽帧、提取音频/字幕、视频转 GIF | `-vn`, `-an`, `-map`, `fps` |
| **音频** | 替换音轨、音量、混音、淡入淡出 | `volume`, `atempo`, `amix`, `afade` |
| **生成** | 图片序列→视频、单图+音频、测试画面 | `-loop`, `-framerate` |

## 工作流

```
Step 0: 检测 FFmpeg 是否安装
  → 已安装 → Step 1
  → 未安装 → 提供安装选项：
      "FFmpeg 未安装，请选择安装方式："
      - 运行 scripts/install-ffmpeg.ps1 (Windows)
      - 运行 scripts/install-ffmpeg.sh (Mac/Linux)
      - 参考 references/install-guide.md 手动安装
  → 用户确认后执行安装，然后进入 Step 1

Step 1: 解析用户意图 → 匹配操作域
Step 2: 查 references/ 中对应命令模板，填充参数
Step 3: 构造完整命令 → 确认文件不会误覆盖
Step 4: 通过 Bash 执行 ffmpeg 命令
Step 5: 验证输出文件，报告结果
```

## 使用场景

### 场景 1：去水印

```
用户：帮我把 video.mp4 右上角的水印去掉

AI：
  1. 先定位水印：
     ffmpeg -i "video.mp4" -vf "delogo=x=W-250:y=10:w=240:h=60:show=1" -t 5 preview.mp4
  2. 用户确认位置后执行：
     ffmpeg -i "video.mp4" -vf "delogo=x=W-250:y=10:w=240:h=60" -c:a copy output.mp4
```

### 场景 2：视频剪辑

```
用户：把 demo.mp4 从第 30 秒开始，剪出 15 秒

AI：
  ffmpeg -ss 00:00:30 -i "demo.mp4" -t 00:00:15 -c:v libx264 -c:a aac output.mp4
```

### 场景 3：视频压缩

```
用户：把这个视频压缩到小一点，最好 720p

AI：
  ffmpeg -i "input.mp4" -vf "scale=1280:-1" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

### 场景 4：视频拼接

```
用户：把 part1.mp4、part2.mp4、part3.mp4 拼成一个视频

AI：
  生成文件列表 filelist.txt → 执行：
  ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4
```

### 场景 5：提取音频

```
用户：把这个视频的声音单独导出来，要 MP3

AI：
  ffmpeg -i "video.mp4" -vn -c:a libmp3lame -q:a 2 audio.mp3
```

### 场景 6：视频转 GIF

```
用户：把 video.mp4 的 5~8 秒转成 GIF

AI：
  先创建调色板再生成 GIF（两步，保证画质）
  ffmpeg -ss 00:00:05 -t 3 -i "video.mp4" -vf "fps=10,scale=480:-1:flags=lanczos,palettegen" palette.png
  ffmpeg -ss 00:00:05 -t 3 -i "video.mp4" -i palette.png -vf "fps=10,scale=480:-1:flags=lanczos,paletteuse" output.gif
```

### 场景 7：倍速播放

```
用户：把视频调成 1.5 倍速

AI：
  ffmpeg -i "input.mp4" -vf "setpts=0.6667*PTS" -af "atempo=1.5" output.mp4
```

### 场景 8：画中画

```
用户：把 main.mp4 作为主画面，pip.mp4 放在右下角小窗

AI：
  ffmpeg -i "main.mp4" -i "pip.mp4" -filter_complex "[1:v]scale=iw/4:ih/4[pip];[0:v][pip]overlay=W-w-10:H-h-10" -c:a copy output.mp4
```

## 约束红线

1. **必须先检测安装**：任何操作前检查 `ffmpeg -version` 是否可执行
2. **路径必须引号**：Windows 路径含空格或中文时必须用双引号包裹
3. **默认 `-y` 覆盖**：所有命令默认加 `-y`，但在执行前确认不会误覆盖用户重要文件
4. **`-ss` 位置规则**：
   - 放 `-i` 前 → 快速 seek，精度 ±关键帧间隔 → 适合粗略裁剪
   - 放 `-i` 后 → 精确到帧，但慢 → 适合精确裁剪
   - 推荐：`-ss` 放 `-i` 前 + 重编码（不 `-c copy`）= 又快又准
5. **无损复制限制**：`-c copy` 只能在关键帧位置切割，不能与滤镜同时使用
6. **不删原始文件**：skill 只生成新文件，绝对不删除用户的源文件
7. **delogo 局限性**：只遮盖固定位置水印，不能还原被遮盖画面，动态水印基本无效
8. **安装脚本安全**：安装脚本询问确认后才执行，不偷偷改系统环境变量
9. **GIF 两步走**：视频转 GIF 必须先生成调色板再编码，否则色彩极差
10. **concat 用 demuxer**：拼接相同编码的视频优先用 concat demuxer（`-f concat`），不用重编码

## 安装脚本使用

### Windows

```powershell
# 在 ffmpeg-skill 目录下
powershell -ExecutionPolicy Bypass -File scripts/install-ffmpeg.ps1
```

脚本逻辑：检测 ffmpeg → winget 安装 → 失败则从 gyan.dev 下载 → 询问是否添加 PATH。

### Mac / Linux

```bash
# 在 ffmpeg-skill 目录下
bash scripts/install-ffmpeg.sh
```

脚本逻辑：检测 ffmpeg → Mac 用 brew → Linux 检测包管理器（apt/dnf/pacman 等）→ 自动安装。

### 手动安装

参考 `references/install-guide.md`。

## 常见问题处理

| 错误现象 | 原因 | 解决 |
|----------|------|------|
| `No such file or directory` | 路径有空格未加引号 | 用双引号包裹路径 |
| `-ss` 位置不精确 | 用了 `-c copy` 在非关键帧位置剪 | 去掉 `-c copy` 改为重编码 |
| GIF 色彩像浆糊 | 直接转未先建调色板 | 用两步流程（palettegen + paletteuse） |
| `concat` 拼接失败 | 编码格式或分辨率不一致 | 先统一转码后再拼接，或用 concat filter |
| 字幕乱码 | 未指定中文字体 | 加 `fontsdir` 指向系统字体目录 |
| `hevc` 编码器不可用 | FFmpeg 构建不含 libx265 | 改用 `libx264` |

详细陷阱和解决方案见 `references/gotchas.md`。

## 与其他技能的关系

| 技能 | 关系 |
|------|------|
| `image-forge-skill` | 互补：image-forge 处理静态图片，ffmpeg-skill 处理视频/音频 |
| `workflow-diagram-skill` | 无直接关联 |
| `icon-image-catch-skill` | 可用于抓取水印素材图片 |

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `references/install-guide.md` | 三平台手动安装指引 |
| `references/gotchas.md` | 常见陷阱与最佳实践 |
| `references/codec-guide.md` | 编码器与容器格式速查 |
| `references/filter-guide.md` | 滤镜参数速查（scale/crop/delogo/overlay/drawtext） |
| `references/commands-trim.md` | 剪辑类命令模板 |
| `references/commands-convert.md` | 转码类命令模板 |
| `references/commands-watermark.md` | 水印类命令模板 |
| `references/commands-compose.md` | 合成类命令模板 |
| `references/commands-extract.md` | 提取类命令模板 |
| `references/commands-generate.md` | 生成类命令模板 |
| `references/commands-audio.md` | 音频类命令模板 |
