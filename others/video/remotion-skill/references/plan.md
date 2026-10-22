# remotion-skill MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务顺序实现。步骤使用 `- [ ]` 语法便于跟踪。

**Goal:** 把当前空白的 `video/remotion-skill` 实现为最小可用的社媒口播视频生成技能：用户输入文案 → 生成可编辑 Remotion 项目 → 一键渲染 → FFmpeg 后期 → 输出成品。

**Architecture:** 采用"模板复制 + JSON 驱动"架构。`script.json` 是文案与时长的唯一事实来源，模板组件只读取它。生成脚本负责把用户文案填充到模板，渲染脚本负责调用 Remotion CLI 和 FFmpeg 后期处理。两套模板（9x16 / 16x9）共用同一组组件逻辑，仅画布尺寸和布局不同。

**Tech Stack:** Remotion 4.x（React + TypeScript）、Python 3（生成/渲染脚本）、FFmpeg（后期处理）。

---

## 文件结构

```
remotion-skill/
├── SKILL.md                                  # 修改：触发词 + 工作流 + 红线
├── README.md                                 # 修改：用户文档 + 示例
├── scripts/
│   ├── init-remotion.py                      # 创建：文案 → Remotion 项目
│   └── render.py                             # 创建：一键渲染 + FFmpeg 后期
├── templates/
│   ├── oral-broadcast-9x16/                  # 创建：竖屏口播模板
│   │   ├── package.json
│   │   ├── remotion.config.ts
│   │   ├── src/
│   │   │   ├── Root.tsx
│   │   │   ├── Subtitle.tsx
│   │   │   ├── Background.tsx
│   │   │   ├── script.json
│   │   │   └── voiceover.mp3                 # 占位音频说明文件
│   │   └── public/
│   │       └── cover.png                     # 占位封面
│   └── oral-broadcast-16x9/                  # 创建：横屏口播模板
│       └── （同 9x16 结构）
└── references/
    ├── design.md                             # 已存在
    ├── remotion-guide.md                     # 创建：Remotion 核心概念速查
    ├── subtitle-spec.md                      # 创建：script.json 格式规范
    └── ffmpeg-post-guide.md                  # 创建：渲染后 FFmpeg 处理参数
```

---

## Task 1: 更新 SKILL.md

**Files:**
- Modify: `remotion-skill/SKILL.md`

- [ ] **Step 1: 重写 SKILL.md 内容**

```markdown
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
- `video/ffmpeg-skill` 负责**后期处理**（压缩、格式统一、加封面）。
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
3. 不捆绑 FFmpeg，未安装时引导调用 `video/ffmpeg-skill`
4. script.json 是唯一事实来源
5. 默认不自动联网抓取素材
```

- [ ] **Step 2: 验证 YAML 格式**

Run: `python -c "import yaml; yaml.safe_load(open('remotion-skill/SKILL.md'))"`
Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add remotion-skill/SKILL.md
git commit -m "docs(remotion-skill): 定义触发词、工作流与红线"
```

---

## Task 2: 更新 README.md

**Files:**
- Modify: `remotion-skill/README.md`

- [ ] **Step 1: 重写 README.md 内容**

```markdown
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
python ../remotion-skill/scripts/render.py
```

输出：`out/final.mp4`

## 目录说明

```
remotion-skill/
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
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/README.md
git commit -m "docs(remotion-skill): 使用说明与示例"
```

---

## Task 3: 创建 references/remotion-guide.md

**Files:**
- Create: `remotion-skill/references/remotion-guide.md`

- [ ] **Step 1: 写入 Remotion 速查文档**

```markdown
# Remotion 核心概念速查

## 常用命令

```bash
# 安装依赖
npm install

# 预览
npx remotion preview

# 渲染
npx remotion render src/index.ts out/video.mp4

# 升级
npx remotion upgrade
```

## 核心 API

- `Composition`：定义一个可渲染的合成
- `useCurrentFrame()`：获取当前帧号
- `useVideoConfig()`：获取 fps、width、height、durationInFrames
- `interpolate()`：数值插值动画
- `spring()`：弹簧动画
- `Sequence`：按时间轴编排子组件
- `Audio`：嵌入音频

## 本模板约定

- `Root.tsx` 中只注册 Composition，不直接写视觉逻辑
- 视觉组件读取 `src/script.json`，不硬编码文案
- 所有动画基于 `useCurrentFrame()` 计算，不使用 CSS 动画
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/references/remotion-guide.md
git commit -m "docs(remotion-skill): 添加 Remotion 速查"
```

---

## Task 4: 创建 references/subtitle-spec.md

**Files:**
- Create: `remotion-skill/references/subtitle-spec.md`

- [ ] **Step 1: 写入字幕规范**

```markdown
# script.json 格式规范

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `fps` | number | 视频帧率，固定 30 |
| `durationInFrames` | number | 总帧数，等于最后一段 endFrame |
| `canvas.width` | number | 画布宽度，9x16 为 1080，16x9 为 1920 |
| `canvas.height` | number | 画布高度，9x16 为 1920，16x9 为 1080 |
| `segments` | array | 字幕段落数组 |
| `segments[].text` | string | 单段文案 |
| `segments[].startFrame` | number | 开始帧（含） |
| `segments[].endFrame` | number | 结束帧（不含） |

## 分段规则

- 按中文句号 `。`、感叹号 `！`、问号 `？`、换行符分割
- 每段默认 3 秒（90 帧 @ 30fps）
- 允许用户手动调整时长

## 校验

- `startFrame` 必须小于 `endFrame`
- 段落必须连续：第 N 段 `endFrame` 等于第 N+1 段 `startFrame`
- `durationInFrames` 必须等于最后一段 `endFrame`
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/references/subtitle-spec.md
git commit -m "docs(remotion-skill): 添加 script.json 规范"
```

---

## Task 5: 创建 references/ffmpeg-post-guide.md

**Files:**
- Create: `remotion-skill/references/ffmpeg-post-guide.md`

- [ ] **Step 1: 写入 FFmpeg 后期参数**

```markdown
# 渲染后 FFmpeg 处理参数

## 9x16 竖屏（1080x1920）

```bash
ffmpeg -i out/video.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k \
  -movflags +faststart \
  -y out/final.mp4
```

## 16x9 横屏（1920x1080）

```bash
ffmpeg -i out/video.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k \
  -movflags +faststart \
  -y out/final.mp4
```

## 压缩到平台规格

```bash
# 抖音/视频号推荐：H.264, AAC, 1080x1920, 码率 5-8Mbps
ffmpeg -i out/final.mp4 -c:v libx264 -b:v 6M -maxrate 8M -bufsize 4M -c:a aac -b:a 128k -y out/platform.mp4
```

## 加封面（首帧）

```bash
ffmpeg -i out/final.mp4 -i public/cover.png -map 0 -map 1 -c copy -disposition:v:1 attached_pic out/with_cover.mp4
```
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/references/ffmpeg-post-guide.md
git commit -m "docs(remotion-skill): 添加 FFmpeg 后期参数参考"
```

---

## Task 6: 创建 9x16 模板 package.json

**Files:**
- Create: `remotion-skill/templates/oral-broadcast-9x16/package.json`

- [ ] **Step 1: 写入 package.json**

```json
{
  "name": "oral-broadcast-9x16",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "remotion preview",
    "build": "remotion render src/index.ts out/video.mp4",
    "upgrade": "remotion upgrade"
  },
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/player": "^4.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "remotion": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/web": "^0.0.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/templates/oral-broadcast-9x16/package.json
git commit -m "feat(remotion-skill): 9x16 模板 package.json"
```

---

## Task 7: 创建 9x16 模板 tsconfig.json 与 remotion.config.ts

**Files:**
- Create: `remotion-skill/templates/oral-broadcast-9x16/tsconfig.json`
- Create: `remotion-skill/templates/oral-broadcast-9x16/remotion.config.ts`

- [ ] **Step 1: 写入 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: 写入 remotion.config.ts**

```typescript
import { Config } from "@remotion/cli/config";

export const config: Config = {
  ffmpegExecutable: null,
  ffprobeExecutable: null,
};
```

- [ ] **Step 3: Commit**

```bash
git add remotion-skill/templates/oral-broadcast-9x16/tsconfig.json remotion-skill/templates/oral-broadcast-9x16/remotion.config.ts
git commit -m "feat(remotion-skill): 9x16 模板 TypeScript 与 Remotion 配置"
```

---

## Task 8: 创建 9x16 模板 src/script.json

**Files:**
- Create: `remotion-skill/templates/oral-broadcast-9x16/src/script.json`

- [ ] **Step 1: 写入占位 script.json**

```json
{
  "fps": 30,
  "durationInFrames": 90,
  "canvas": {
    "width": 1080,
    "height": 1920
  },
  "segments": [
    {
      "text": "请替换为你的第一句文案",
      "startFrame": 0,
      "endFrame": 90
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/templates/oral-broadcast-9x16/src/script.json
git commit -m "feat(remotion-skill): 9x16 模板占位 script.json"
```

---

## Task 9: 创建 9x16 模板 src/Background.tsx

**Files:**
- Create: `remotion-skill/templates/oral-broadcast-9x16/src/Background.tsx`

- [ ] **Step 1: 写入 Background 组件**

```typescript
import { AbsoluteFill } from "remotion";

export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
      }}
    />
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/templates/oral-broadcast-9x16/src/Background.tsx
git commit -m "feat(remotion-skill): 9x16 模板背景组件"
```

---

## Task 10: 创建 9x16 模板 src/Subtitle.tsx

**Files:**
- Create: `remotion-skill/templates/oral-broadcast-9x16/src/Subtitle.tsx`

- [ ] **Step 1: 写入 Subtitle 组件**

```typescript
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { Segment } from "./types";

interface SubtitleProps {
  segments: Segment[];
}

export const Subtitle: React.FC<SubtitleProps> = ({ segments }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentIndex = segments.findIndex(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 240,
        left: 60,
        right: 60,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {segments.map((segment, index) => {
        const isCurrent = index === currentIndex;
        const opacity = isCurrent ? 1 : 0.35;
        const scale = isCurrent
          ? interpolate(
              frame - segment.startFrame,
              [0, 10],
              [0.95, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          : 1;

        return (
          <div
            key={index}
            style={{
              color: "#ffffff",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.4,
              textAlign: "center",
              textShadow: "0 4px 12px rgba(0,0,0,0.5)",
              opacity,
              transform: `scale(${scale})`,
              transition: "none",
            }}
          >
            {segment.text}
          </div>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/templates/oral-broadcast-9x16/src/Subtitle.tsx
git commit -m "feat(remotion-skill): 9x16 模板字幕组件"
```

---

## Task 11: 创建 9x16 模板 src/types.ts 与 src/Root.tsx

**Files:**
- Create: `remotion-skill/templates/oral-broadcast-9x16/src/types.ts`
- Create: `remotion-skill/templates/oral-broadcast-9x16/src/Root.tsx`

- [ ] **Step 1: 写入 types.ts**

```typescript
export interface Segment {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface Script {
  fps: number;
  durationInFrames: number;
  canvas: {
    width: number;
    height: number;
  };
  segments: Segment[];
}
```

- [ ] **Step 2: 写入 Root.tsx**

```typescript
import { Composition } from "remotion";
import { Background } from "./Background";
import { Subtitle } from "./Subtitle";
import type { Script } from "./types";
import script from "./script.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={script.durationInFrames}
      fps={script.fps}
      width={script.canvas.width}
      height={script.canvas.height}
      defaultProps={{ script }}
    />
  );
};

const Main: React.FC<{ script: Script }> = ({ script }) => {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Background />
      <Subtitle segments={script.segments} />
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add remotion-skill/templates/oral-broadcast-9x16/src/types.ts remotion-skill/templates/oral-broadcast-9x16/src/Root.tsx
git commit -m "feat(remotion-skill): 9x16 模板入口与类型定义"
```

---

## Task 12: 创建 9x16 模板 src/index.ts

**Files:**
- Create: `remotion-skill/templates/oral-broadcast-9x16/src/index.ts`

- [ ] **Step 1: 写入入口文件**

```typescript
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/templates/oral-broadcast-9x16/src/index.ts
git commit -m "feat(remotion-skill): 9x16 模板 Remotion 注册入口"
```

---

## Task 13: 创建 16x9 模板

**Files:**
- Create: `remotion-skill/templates/oral-broadcast-16x9/` 下所有文件

- [ ] **Step 1: 复制 9x16 模板到 16x9**

```bash
cp -r remotion-skill/templates/oral-broadcast-9x16/* remotion-skill/templates/oral-broadcast-16x9/
```

- [ ] **Step 2: 修改 script.json 为 16x9 尺寸**

```json
{
  "fps": 30,
  "durationInFrames": 90,
  "canvas": {
    "width": 1920,
    "height": 1080
  },
  "segments": [
    {
      "text": "请替换为你的第一句文案",
      "startFrame": 0,
      "endFrame": 90
    }
  ]
}
```

- [ ] **Step 3: 调整 Subtitle.tsx 布局**

修改 `Subtitle.tsx`：
- `bottom: 160`
- `left: 120`
- `right: 120`
- `fontSize: 72`

- [ ] **Step 4: Commit**

```bash
git add remotion-skill/templates/oral-broadcast-16x9/
git commit -m "feat(remotion-skill): 添加 16x9 横屏口播模板"
```

---

## Task 14: 创建 scripts/init-remotion.py

**Files:**
- Create: `remotion-skill/scripts/init-remotion.py`

- [ ] **Step 1: 写入项目生成脚本**

```python
#!/usr/bin/env python3
import argparse
import json
import re
import shutil
import sys
from pathlib import Path


def parse_text(text: str, seconds_per_segment: int = 3, fps: int = 30) -> list[dict]:
    """按标点拆分文案，生成连续段落。"""
    raw_segments = re.split(r'([。！？\n]+)', text.strip())
    parts: list[str] = []
    buffer = ""
    for seg in raw_segments:
        if re.match(r'[。！？\n]+', seg):
            buffer += seg
            parts.append(buffer.strip())
            buffer = ""
        else:
            buffer += seg
    if buffer.strip():
        parts.append(buffer.strip())

    segments_per_part = seconds_per_segment * fps
    segments = []
    current_frame = 0
    for part in parts:
        if not part:
            continue
        start = current_frame
        end = current_frame + segments_per_part
        segments.append({
            "text": part,
            "startFrame": start,
            "endFrame": end,
        })
        current_frame = end

    return segments


def build_script(segments: list[dict], aspect: str, fps: int = 30) -> dict:
    canvas = {"width": 1080, "height": 1920} if aspect == "9x16" else {"width": 1920, "height": 1080}
    return {
        "fps": fps,
        "durationInFrames": segments[-1]["endFrame"] if segments else fps * 3,
        "canvas": canvas,
        "segments": segments,
    }


def main():
    parser = argparse.ArgumentParser(description="生成 Remotion 口播视频项目")
    parser.add_argument("--text", required=True, help="口播文案")
    parser.add_argument("--aspect", choices=["9x16", "16x9"], default="9x16", help="画幅")
    parser.add_argument("--output", required=True, help="输出目录")
    parser.add_argument("--seconds", type=int, default=3, help="每段默认秒数")
    args = parser.parse_args()

    output_dir = Path(args.output).resolve()
    if output_dir.exists():
        print(f"错误：目标目录已存在 {output_dir}")
        sys.exit(1)

    template_dir = Path(__file__).parent.parent / "templates" / f"oral-broadcast-{args.aspect}"
    if not template_dir.exists():
        print(f"错误：模板不存在 {template_dir}")
        sys.exit(1)

    shutil.copytree(template_dir, output_dir)

    segments = parse_text(args.text, args.seconds)
    script = build_script(segments, args.aspect)

    script_path = output_dir / "src" / "script.json"
    with open(script_path, "w", encoding="utf-8") as f:
        json.dump(script, f, ensure_ascii=False, indent=2)

    print(f"项目已生成：{output_dir}")
    print("下一步：")
    print(f"  1. 替换 {output_dir / 'src/voiceover.mp3'} 为你的配音")
    print(f"  2. 编辑 {output_dir / 'src/script.json'} 调整文案和时长")
    print(f"  3. 运行：cd {output_dir} && python ../remotion-skill/scripts/render.py")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/scripts/init-remotion.py
git commit -m "feat(remotion-skill): 项目生成脚本"
```

---

## Task 15: 创建 scripts/render.py

**Files:**
- Create: `remotion-skill/scripts/render.py`

- [ ] **Step 1: 写入渲染脚本**

```python
#!/usr/bin/env python3
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


def check_command(cmd: list[str]) -> bool:
    return shutil.which(cmd[0]) is not None


def run(cmd: list[str], cwd: Path | None = None):
    print(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        print(f"命令失败：{' '.join(cmd)}")
        sys.exit(result.returncode)


def main():
    parser = argparse.ArgumentParser(description="一键渲染 Remotion 项目并执行 FFmpeg 后期")
    parser.add_argument("--project", default=".", help="Remotion 项目目录")
    args = parser.parse_args()

    project_dir = Path(args.project).resolve()
    script_path = project_dir / "src" / "script.json"
    if not script_path.exists():
        print(f"错误：找不到 {script_path}")
        sys.exit(1)

    with open(script_path, encoding="utf-8") as f:
        script = json.load(f)

    canvas = script["canvas"]
    width, height = canvas["width"], canvas["height"]

    if not check_command(["npx"]):
        print("错误：未找到 npx，请先安装 Node.js")
        sys.exit(1)

    out_dir = project_dir / "out"
    out_dir.mkdir(exist_ok=True)
    raw_video = out_dir / "video.mp4"
    final_video = out_dir / "final.mp4"

    run(
        ["npx", "remotion", "render", "src/index.ts", str(raw_video)],
        cwd=project_dir,
    )

    if not check_command(["ffmpeg"]):
        print("警告：未找到 ffmpeg，跳过后期处理。可调用 ffmpeg-skill 安装。")
        print(f"原始渲染文件：{raw_video}")
        sys.exit(0)

    vf = f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2"
    run(
        [
            "ffmpeg",
            "-i", str(raw_video),
            "-vf", vf,
            "-c:v", "libx264",
            "-crf", "23",
            "-preset", "medium",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            "-y",
            str(final_video),
        ],
        cwd=project_dir,
    )

    print(f"成品已输出：{final_video}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit**

```bash
git add remotion-skill/scripts/render.py
git commit -m "feat(remotion-skill): 一键渲染与 FFmpeg 后期脚本"
```

---

## Task 16: 端到端验证

**Files:**
- Test command only

- [ ] **Step 1: 生成测试项目**

Run:
```bash
python remotion-skill/scripts/init-remotion.py \
  --text "短视频时代，内容就是流量。做好前三秒，完播率翻倍。" \
  --aspect 9x16 \
  --output /tmp/remotion-test-9x16
```

Expected: 目录生成成功，`src/script.json` 包含两段

- [ ] **Step 2: 验证 script.json 结构**

Run:
```bash
python -c "import json; d=json.load(open('/tmp/remotion-test-9x16/src/script.json')); assert len(d['segments'])==2; assert d['canvas']=={'width':1080,'height':1920}"
```

Expected: 无报错

- [ ] **Step 3: 生成 16x9 项目并验证**

Run:
```bash
python remotion-skill/scripts/init-remotion.py \
  --text "横屏视频更适合 B 站和小红书图文视频。" \
  --aspect 16x9 \
  --output /tmp/remotion-test-16x9
```

Expected: `canvas` 为 `{"width":1920,"height":1080}`

- [ ] **Step 4: 渲染验证（需 Node.js + FFmpeg）**

Run:
```bash
cd /tmp/remotion-test-9x16
npm install
python ../../d/projects/wg-skills/remotion-skill/scripts/render.py
```

Expected: `out/final.mp4` 存在且尺寸为 1080x1920

- [ ] **Step 5: 清理测试目录**

Run:
```bash
rm -rf /tmp/remotion-test-9x16 /tmp/remotion-test-16x9
```

---

## Task 17: 更新根目录 README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 在"当前可用 Skills"末尾添加 remotion-skill 条目**

在 `### 29. fastapi-init-skill` 之后、`## 📋 Skill 一览` 之前插入：

```markdown
### 30. remotion-skill 🎬

> Remotion 社媒口播视频生成技能：文案 → 可编辑 Remotion 项目 → 一键渲染 → FFmpeg 后期

**功能**：输入文案生成竖屏（9x16）或横屏（16x9）口播视频项目，内置字幕高亮动画，支持用户二次编辑样式与配音，一键渲染后自动完成 FFmpeg 压缩与画幅统一。

**使用场景**：
- 把口播文案快速转成短视频
- 生成可二次编辑的 Remotion 项目
- 批量生产社媒短视频原型

**使用方式**：

```
/remotion-skill
```

或自然语言：

```
帮我做一个口播视频
把这段文案做成 9x16 短视频
生成一个 Remotion 项目
```

**详细文档**：[remotion-skill/README.md](remotion-skill/README.md)

---
```

- [ ] **Step 2: 在"Skill 一览"表格添加一行**

在 fastapi-init-skill 行后添加：

```markdown
| [remotion-skill](remotion-skill/) | Remotion 社媒口播视频生成（文案 → 可编辑项目 → 一键渲染 → FFmpeg 后期） | `remotion`、`口播视频`、`生成视频`、`9x16 视频`、`渲染 Remotion 项目` |
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: 根目录 README 添加 remotion-skill"
```

---

## Self-Review

- [x] **Spec coverage:** 设计方案中的 MVP 范围、工作流、模板规范、触发词、红线均已对应到具体任务。
- [x] **Placeholder scan:** 无 TBD/TODO/待填充内容；所有代码块均为可直接运行的完整内容。
- [x] **Type consistency:** `Segment`/`Script` 类型在 Task 11 定义，Task 10/14/15 中字段名称保持一致。
