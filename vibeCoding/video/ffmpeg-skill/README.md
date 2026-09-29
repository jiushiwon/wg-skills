# ffmpeg-skill 🎬

**FFmpeg 多媒体处理技能** — 把自然语言指令转成正确、安全的 ffmpeg 命令，覆盖剪辑 / 转码 / 水印 / 合成 / 提取 / 生成等 8 大类操作。

---

## 它能做什么

当你说：

- "把这个视频压缩到 10MB 以内"
- "从 02:30 开始裁剪 30 秒"
- "把 mp4 转成 webp"
- "给视频加水印"
- "把视频拼接起来"
- "提取视频里的音频"
- "视频转 GIF"
- "给视频加字幕"
- "视频调速 / 倒放"
- "画中画"

这个 Skill 会引导你完成 FFmpeg 检测 → 命令构造 → 用户确认 → 执行 → 输出验证。

> **定位**：本 skill 是 FFmpeg 的**命令翻译层**，不捆绑 FFmpeg 本体；如未安装会自动给出 Windows/Mac/Linux 一键安装脚本。

---

## 它解决了什么问题

| 痛点 | 解决方案 |
|------|----------|
| ffmpeg 命令参数繁多，记不住 | 9 大类操作模板，按需查表 |
| 不同平台（Win/Mac/Linux）命令差异 | 统一封装，平台自动识别 |
| 担心命令错覆盖原文件 | 强制确认输出路径，覆盖需二次确认 |
| FFmpeg 未安装 | 一键脚本 `install-ffmpeg.ps1` / `.sh` |
| 滤镜链复杂 | 模板化构造，可直接复用 |

---

## 9 大操作域

| # | 操作域 | 关键命令/滤镜 | 模板位置 |
|---|--------|--------------|----------|
| 1 | **剪辑** | `-ss`, `-t`, `setpts`, `reverse` | `references/commands-trim.md` |
| 2 | **转码** | `-c:v`, `-crf`, `scale`, `-r` | `references/commands-convert.md` |
| 3 | **加水印** | `overlay`, `drawtext` | `references/commands-watermark.md` |
| 4 | **合成** | `concat`, `overlay`, `amix` | `references/commands-compose.md` |
| 5 | **提取** | `-vn`, `-an`, `-map`, `fps` | `references/commands-extract.md` |
| 6 | **生成** | `-loop`, `-framerate` | `references/commands-generate.md` |
| 7 | **音频** | `volume`, `atempo`, `afade` | `references/commands-audio.md` |
| 8 | **去水印** | `delogo` | `references/commands-watermark.md` §3 |
| 9 | **滤镜/编解码** | 完整选项清单 | `references/filter-guide.md` / `codec-guide.md` |

---

## 工作流

```
Step 0: 检测 FFmpeg 是否安装
  → 已安装 → Step 1
  → 未安装 → 提供安装选项：
      - 运行 scripts/install-ffmpeg.ps1 (Windows)
      - 运行 scripts/install-ffmpeg.sh (Mac/Linux)
      - 参考 references/install-guide.md 手动安装
  → 用户确认后执行安装

Step 1: 解析用户意图 → 匹配操作域
Step 2: 查 references/ 中对应命令模板，填充参数
Step 3: 构造完整命令 → 确认输出路径不覆盖原文件
Step 4: 用户确认后通过 Bash 执行 ffmpeg 命令
Step 5: 验证输出文件，报告结果
```

---

## 触发词

```
ffmpeg、视频剪辑、视频裁剪、视频分割、视频转码、视频压缩、视频格式转换、
去水印、加水印、视频拼接、视频合成、提取音频、视频转 GIF、截取视频帧、
调整播放速度、倍速播放、视频倒放、画中画、批量处理视频、给视频加字幕、
修改分辨率、音频替换、混音、视频去声、音频淡入淡出、图片合成视频
```

---

## 安装脚本

| 平台 | 脚本 |
|------|------|
| Windows | `scripts/install-ffmpeg.ps1` |
| Mac/Linux | `scripts/install-ffmpeg.sh` |

---

## 输出

- **不修改文件**：默认输出到独立目录（如 `output/` 或用户指定路径）
- **覆盖需二次确认**：原文件不会被静默覆盖
- **失败回滚**：命令执行失败保留输入文件不删

---

## 常见坑

| 坑 | 说明 | 见 |
|----|------|-----|
| `-ss` 位置 | 放在 `-i` 之前 = 快速定位（精度低）；之后 = 精确（速度慢） | `references/gotchas.md` §1 |
| 编码兼容性 | 不同播放器对 H.264/H.265/VP9 兼容性差异 | `references/codec-guide.md` |
| 大文件处理 | 内存不足时分段输入 + `-segment_time` | `references/gotchas.md` §3 |
| 字体路径 | `drawtext` 需指定字体绝对路径 | `references/gotchas.md` §2 |

---

## 适用 vs 不适用

✅ **适用**：
- 单个 / 批量视频处理（剪辑 / 转码 / 水印 / 合成）
- 提取音频 / 抽帧 / 转 GIF
- 自动检测并安装 FFmpeg

❌ **不适用**：
- 复杂的视频特效制作（用 After Effects / Premiere / DaVinci）
- 实时直播推流（用 OBS / Streamlabs）
- Remotion 模板化视频生成 → 用 `video/remotion-skill`
- 完整视频剪辑工程管理 → 用 DaVinci Resolve / Final Cut Pro

---

## 目录结构

```
ffmpeg-skill/
├── SKILL.md              # 技能定义
├── README.md             # 本文件
├── references/
│   ├── install-guide.md  # FFmpeg 安装说明
│   ├── gotchas.md        # 常见坑位
│   ├── codec-guide.md    # 编解码选择指南
│   ├── filter-guide.md   # 滤镜速查
│   └── commands-*.md     # 8 类操作命令模板
└── scripts/
    ├── install-ffmpeg.ps1    # Windows 安装
    └── install-ffmpeg.sh     # Mac/Linux 安装
```

---

## 可配合技能

| 配合 Skill | 场景 |
|------------|------|
| `video/remotion-skill` | Remotion 项目渲染后用 ffmpeg 做后期压缩 / 转码 |
| `image-forge-skill` | 视频封面 / 抽帧图后续处理 |

---

## 维护记录

- 2026-08-27：补全 README，与 SKILL.md 触发词对齐。