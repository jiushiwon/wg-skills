# image-forge-skill 🖼️

> 图片处理 + 图标生成技能（基于 sharp）：压缩/转格式/改尺寸/裁剪/base64/水印/遮罩/多图合成 + SVG→PNG 图标批量渲染

本技能是**可执行型技能**：内置 `image-forge.js`（Node + sharp），配置驱动，两种模式：

- **icons 模式**：把 SVG path（heroicons/feather 风格）或完整 SVG 批量渲染成 PNG 图标（原 icon-forge 能力已并入）。
- **jobs 模式**：图片处理 —— 压缩、转格式、改尺寸、裁剪、base64、水印、遮罩、多图合成。

## 功能范围

| 模式 | 能力 |
|------|------|
| **icons** | SVG path / 完整 SVG → 批量 PNG；主题色、描边宽、尺寸可配 |
| **jobs-image** | 压缩（质量 1-100）、转格式（JPEG/WebP/PNG）、改尺寸（cover/contain/fill/inside/outside）、裁剪、base64 |
| **jobs-image + overlays** | 图片水印、文字水印、纯色遮罩 |
| **jobs-composite** | 画布 + 多图层合成（image/color/text 图层） |
| 通用 | 输出 Data URI（base64）、`FORGE_OUTPUT_JSON=1` 输出 JSON 报告 |

## 适用场景

- 把本地图片批量压缩并转为 WebP
- 裁剪图片为指定比例（如 16:9 封面）
- 给图片添加文字或 Logo 水印
- 添加半透明遮罩层（便于叠加文字）
- 多张图合成一张 banner 或分享卡
- 生成 base64 Data URI
- 生成 tabBar / 登录页 / 功能入口成套单色 PNG 图标（uniapp / 小程序 / RN / H5）

## 安装

仓库存源 + 本地软链接激活（与 `frontend-ui-foundry` 同款）：

```bash
# 软链接到个人技能目录（一次即可）
ln -s /你的路径/wg-skills/image-forge-skill ~/.claude/skills/image-forge-skill

# 安装依赖（sharp）
cd ~/.claude/skills/image-forge-skill && npm install
```

> Windows 原生符号链接需管理员/开发者模式；推荐用目录联接（无需管理员）：
> `mklink /J "%USERPROFILE%\.claude\skills\image-forge-skill" "D:\你的路径\wg-skills\image-forge-skill"`

## 使用方式

安装后直接对 AI 说需求即可触发，例如：

> 「把 photo.jpg 压缩成 800 宽的 webp」
> 「给 banner 加黑色遮罩和白色标题文字」
> 「把 logo.png 合成到 photo.jpg 右上角」
> 「给登录页生成一套图标，绿色 `#059669`，放 `src/static/icons/login`，要数据、看板、洞察、计划、记录、重测」

AI 会写好 JSON 配置并运行 `image-forge.js`，回报每个 `[OK] 路径`。

### 手动调用

```bash
cd ~/.claude/skills/image-forge-skill
# 图标生成（icons 模式）
echo '{"outDir":"./out","size":72,"color":"#059669","icons":[{"name":"data.png","path":"M9 12h6"}]}' | node image-forge.js -
# 图片处理（jobs 模式）
echo '{"outDir":"./dist","jobs":[{"type":"image","input":"a.jpg","format":"webp","resize":{"width":800,"fit":"cover"}}]}' | node image-forge.js -
# 或从文件
node image-forge.js spec.json
```

## 配置说明

### icons 模式（图标生成）

| 字段 | 必填 | 默认 | 说明 |
|------|------|------|------|
| `outDir` | ✅ | — | 输出目录，自动创建 |
| `size` | | `72` | 输出像素（正方形） |
| `color` | | `#059669` | 描边色（仅对 `path` 模式生效） |
| `strokeWidth` | | `2` | 描边宽度 |
| `icons[].name` | ✅ | — | 输出文件名（含 `.png`） |
| `icons[].path` | ※ | — | heroicons/feather 风格 path（viewBox `0 0 24 24`） |
| `icons[].svg` | ※ | — | 完整 SVG 字符串（可彩色/多色） |

※ `path` 与 `svg` 二选一。

### jobs 模式（图片处理）

| 任务 | 字段 | 说明 |
|------|------|------|
| image | `input`, `output`, `format`, `quality`, `resize.*`, `base64`, `overlays` | 压缩/转格式/裁剪 + 叠加层 |
| composite | `width`, `height`, `background`, `backgroundOpacity`, `layers`, `format`, `quality`, `base64` | 画布 + 多图层合成 |
| 图层 | image（坐标/尺寸/fit/opacity/blend）、text（坐标/字号/颜色/字体/对齐）、color（纯色遮罩铺满） | — |

详细字段说明见 [references/operation-schema.md](references/operation-schema.md)。

## 与其他技能的关系

| 技能 | 关系 |
|------|------|
| icon-image-catch-skill | 远程抓图 → 本技能处理 |
| uniapp-theme-skill | 主题换肤后，用本技能 icons 模式生成主题色 tabBar 图标 |

## 目录结构

```
image-forge-skill/
├── SKILL.md                     # 技能定义
├── README.md                    # 本文件
├── image-forge.js               # 主处理脚本（icons + jobs 双模式）
├── package.json                 # 依赖声明（sharp）
└── references/
    └── operation-schema.md     # jobs 模式 JSON Spec 字段详解
```

## 触发词

「处理图片」「压缩图片」「转 webp」「加水印」「图片合成」「裁剪图片」「生成图标」「做一套图标」「icon 生成」「生成 png 图标」「给我加几个图标」

## 迁移说明（v2 合并 icon-forge）

> 原 `icon-forge` 技能已并入本技能（icons 模式），脚本 `forge-icons.js` 由 `image-forge.js` 取代。
> 迁移方式：把 `node forge-icons.js spec.json` 换成 `node image-forge.js spec.json`，配置格式完全兼容。

## License

MIT
