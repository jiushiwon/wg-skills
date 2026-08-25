# remotion-skill 设计方案

## 背景与目标

`remotion-skill` 是 wg-skills 仓库中面向**社媒短视频**生成的技能。它与 `video/ffmpeg-skill` 形成互补关系：

- `remotion-skill`：负责**程序化生成**视频（React → MP4）
- `video/ffmpeg-skill`：负责**后期处理**（压缩、转码、加封面等）

本阶段目标是实现最小可用闭环（MVP）：用户输入文案 → 生成可编辑的 Remotion 项目 → 一键渲染 → FFmpeg 后期 → 输出成品。

## 范围

**本期包含**：

1. 1 个竖屏 9:16 口播模板
2. 1 个横屏 16:9 口播模板
3. 项目生成脚本 `scripts/init-remotion.py`
4. 一键渲染脚本 `scripts/render.py`
5. SKILL.md / README.md / references/ 文档

**本期不包含**（后续扩展）：

- TTS 自动生成配音
- 自动抓取 B-roll/配图
- 多模板市场
- 字幕与音频自动对齐

## 架构

```
remotion-skill/
├── SKILL.md                          # 触发词 + 工作流 + 红线
├── README.md                         # 用户文档 + 示例
├── scripts/
│   ├── init-remotion.py              # 根据文案生成 Remotion 项目
│   └── render.py                     # 一键渲染 + FFmpeg 后期
├── templates/
│   ├── oral-broadcast-9x16/          # 竖屏口播模板
│   │   ├── package.json
│   │   ├── remotion.config.ts
│   │   ├── src/
│   │   │   ├── Root.tsx
│   │   │   ├── Subtitle.tsx
│   │   │   ├── Background.tsx
│   │   │   ├── script.json
│   │   │   └── voiceover.mp3
│   │   └── public/
│   └── oral-broadcast-16x9/          # 横屏口播模板
│       └── （同 9x16 结构）
└── references/
    ├── remotion-guide.md             # Remotion 核心概念速查
    ├── subtitle-spec.md              # script.json 格式规范
    ├── ffmpeg-post-guide.md          # 渲染后 FFmpeg 处理参数
    └── design.md                     # 本文件
```

## 核心工作流

### 生成项目

```
用户输入：文案 + 画幅（默认 9x16）

scripts/init-remotion.py:
  1. 检测目标目录是否已存在，避免覆盖
  2. 按句号/换行拆分文案为 segments
  3. 每段默认 3 秒，生成 script.json
  4. 复制对应模板到目标目录
  5. 写入用户文案到 src/script.json
  6. 输出项目路径和下一步命令
```

### 编辑项目

用户可编辑：

- `src/script.json`：改文案、调整每段时长
- `src/Subtitle.tsx`：改字体、颜色、动画
- `src/Background.tsx`：改背景、配色
- `src/voiceover.mp3`：替换为自己的配音

### 渲染与后期

```
scripts/render.py:
  1. 检测 remotion 是否可执行（npx remotion --version）
  2. 执行 npx remotion render src/index.ts out/video.mp4
  3. 渲染成功后调用 FFmpeg 后期处理
  4. 输出最终成品路径
```

FFmpeg 后期示例（9x16）：

```bash
ffmpeg -i out/video.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k \
  out/final.mp4
```

## script.json 规范

```json
{
  "fps": 30,
  "durationInFrames": 270,
  "canvas": { "width": 1080, "height": 1920 },
  "segments": [
    { "text": "第一句文案", "startFrame": 0, "endFrame": 90 },
    { "text": "第二句文案", "startFrame": 90, "endFrame": 180 },
    { "text": "第三句文案", "startFrame": 180, "endFrame": 270 }
  ]
}
```

## 触发词

```
/remotion-skill
帮我做一个口播视频
生成一个 9:16 的短视频
把这段文案做成 Remotion 项目
渲染这个 Remotion 项目
```

## 红线

1. **不自动删除用户源文件**：只生成新文件，删除需用户确认。
2. **避免覆盖**：生成项目前检测目标目录是否已存在。
3. **不捆绑 FFmpeg**：渲染后处理调用系统 ffmpeg，未安装时提示调用 `video/ffmpeg-skill` 安装。
4. **单一事实来源**：`script.json` 是文案和时长的唯一来源，组件只读取不硬编码。
5. **最小依赖**：模板只使用 Remotion 核心 API，不引入额外 UI 库。

## 后续扩展

按优先级排序：

1. **TTS 集成**：文案 → 自动配音 → 字幕时长按音频自动调整
2. **自动抓图**：根据关键词调用 `image-catch-skill` 抓取 B-roll
3. **字幕对齐**：用 Whisper 从音频生成时间轴
4. **更多模板**：产品种草、数据快报、情感语录等
5. **模板参数化**：支持通过命令行参数切换主题色、字体、节奏

## 参考关系

- `video/ffmpeg-skill`：后期处理依赖，提供安装检测和命令参考
- `image-forge-skill`：未来用于封面图/素材处理
- `icon-image-catch-skill` / `image-catch-skill`：未来用于自动抓取 B-roll
