---
name: remotion-skill
description: "Remotion 社媒口播视频生成技能：输入文案生成可编辑 Remotion 项目，支持一键渲染与 FFmpeg 后期处理。触发词：remotion、口播视频、短视频、生成视频、渲染 Remotion 项目。"
argument-hint: "[文案或操作描述] [画幅，可选 9x16/16x9] [目标目录]"
user-invocable: true
triggers:
  - "remotion"
  - "口播视频"
  - "短视频"
  - "生成视频"
  - "渲染 Remotion 项目"
  - "把文案做成视频"
  - "9x16 视频"
  - "16x9 视频"
---

# remotion-skill

Remotion 社媒口播视频生成技能：用户输入文案，生成可编辑的 Remotion 项目；用户可修改样式/文案后，一键渲染并自动完成 FFmpeg 后期处理。

## 定位

- `remotion-skill` 负责**程序化生成**视频（React → MP4）。
- `ffmpeg-skill` 负责**后期处理**（压缩、格式统一、加封面）。
- 本 skill 是两者的衔接层，专注于社媒口播场景。

## 核心能力

| 能力 | 说明 |
|------|------|
| 生成项目 | 文案 → 竖屏/横屏 Remotion 项目 |
| 字幕动画 | 按段落高亮当前句，非当前句弱化 |
| 可编辑 | 用户可改文案、字体、颜色、背景、配音 |
| 一键渲染 | 调用 Remotion CLI 输出视频 |
| FFmpeg 后期 | 渲染后自动压缩、统一画幅、输出成品 |

## 工作流

```
Step 0: 用户输入文案 + 画幅（默认 9x16）
Step 1: 运行 scripts/init-remotion.py 生成项目
Step 2: 用户编辑 src/script.json / Subtitle.tsx / Background.tsx / voiceover.mp3
Step 3: 运行 scripts/render.py 一键渲染
Step 4: 输出 out/final.mp4
```

## 约束红线

1. 不自动删除用户源文件
2. 生成项目前检测目标目录，避免覆盖
3. 不捆绑 FFmpeg，未安装时引导调用 ffmpeg-skill
4. script.json 是唯一事实来源
5. 默认不自动联网抓取素材
