# remotion-skill 🎬

> Remotion 社媒口播视频生成技能

## 功能

- 输入文案，自动生成竖屏（9x16）或横屏（16x9）口播视频项目
- 内置字幕高亮动画、可替换背景、可替换配音
- 一键渲染输出 MP4，自动完成 FFmpeg 后期压缩

## 使用方式

```
/remotion-skill
```

或自然语言：

```
帮我做一个口播视频
把这段文案做成 9x16 短视频
生成一个 Remotion 项目
渲染这个 Remotion 项目
```

## 示例

### 生成项目

```bash
python scripts/init-remotion.py \
  --text "短视频时代，内容就是流量。做好前三秒，完播率翻倍。" \
  --aspect 9x16 \
  --output ./my-video
```

输出：

```
./my-video/
├── package.json
├── remotion.config.ts
├── src/
│   ├── Root.tsx
│   ├── Subtitle.tsx
│   ├── Background.tsx
│   ├── script.json
│   └── voiceover.mp3    # 占位，请替换为你的配音
└── public/
    └── cover.png
```

### 编辑文案/时长

修改 `src/script.json`：

```json
{
  "fps": 30,
  "durationInFrames": 180,
  "canvas": { "width": 1080, "height": 1920 },
  "segments": [
    { "text": "短视频时代，内容就是流量。", "startFrame": 0, "endFrame": 90 },
    { "text": "做好前三秒，完播率翻倍。", "startFrame": 90, "endFrame": 180 }
  ]
}
```

### 一键渲染

```bash
cd my-video
python ../scripts/render.py
```

输出：`out/final.mp4`

## 目录说明

```
video/remotion-skill/
├── SKILL.md              # 技能定义
├── README.md             # 使用文档（本文件）
├── scripts/              # 生成与渲染脚本
├── templates/            # Remotion 项目模板
└── references/           # 参考资料
```

## 依赖

- Node.js 18+
- Remotion CLI（模板内通过 npm install 自动安装）
- FFmpeg（后期处理用，未安装时脚本会提示）
