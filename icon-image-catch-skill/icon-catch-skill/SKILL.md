---
name: icon-catch-skill
description: Use when 用户需要按语义搜索并下载专业 SVG 图标。
---

# icon-catch-skill — 图标抓取规范

本技能提供图标抓取流程，**不执行本地脚本**。Claude 应根据以下规范，直接调用 Iconify API 或浏览器工具完成下载。

## 数据源

所有图标来自 [Iconify](https://api.iconify.design) 聚合平台，免费、无需 Key。

| 源名 | Iconify prefix | 风格特点 | 推荐场景 |
|---|---|---|---|
| `lucide` | `lucide` | 现代线性，命名与前端术语对齐 | **默认首选**，大多数 UI 场景 |
| `tabler` | `tabler` | 5000+ 业务图标，含 filled 变体 | 电商/金融/医疗等细分业务 |
| `heroicons` | `heroicons` | outline/solid，Tailwind 官方 | Tailwind / 简洁后台 |
| `phosphor` | `ph` | 6 种风格 | 需要多状态切换的图标 |
| `remix` | `ri` | 中文语义匹配度高 | 国内业务 |
| `feather` | `feather` | 280+ 极简基础图标 | 轻量产品 |
| `simple-icons` | `simple-icons` | 3000+ 品牌单色 Logo | 品牌 Logo、第三方登录 |
| `mdi` | `mdi` | 数量庞大 | 兜底 |

未指定源时，默认先用 Iconify 聚合搜索；若无结果，再按上表优先级逐个尝试单个库。

## 使用前询问规范

当用户要求抓图标时，Claude **必须先询问用户想用的图标库**，给出风格推荐，再执行。示例：

> 准备抓 home 图标，可选图标库：
> 1. **lucide** — 现代线性，前端默认推荐（推荐）
> 2. **tabler** — 业务图标丰富
> 3. **heroicons** — Tailwind 官方
> 4. **phosphor** — 多粗细风格
> 5. **remix** — 中文语义友好
> 6. **全部自动** — 从所有库中挑最合适的（默认）
>
> 你想用哪个？直接回车默认全部自动。

如果用户明确指定了库（如"用 lucide 风格"），则不再询问。

## 标准抓取流程

1. **理解语义**：从用户需求提取图标用途词（如「个人中心入口」→ `user`）。
2. **询问图标库**：向用户展示可选库及风格，确认后执行；用户已指定则跳过。
3. **英文关键词**：优先使用英文搜索；中文需求参考 `references/icon-sources.md` 的中英文映射表。
4. **搜索图标**：调用 Iconify API：
   - 聚合搜索：`GET https://api.iconify.design/search?query={英文词}&limit={数量}`
   - 指定库搜索：`GET https://api.iconify.design/search?query={英文词}&prefix={prefix}&limit={数量}`
5. **挑选最优**：按优先级 `lucide → tabler → heroicons → ph → ri → feather → simple-icons → mdi` 挑选，同库时优先选名称与搜索词最匹配的图标。
6. **下载 SVG**：`GET https://api.iconify.design/{prefix}/{name}.svg?color=%23{颜色}&width={尺寸}&height={尺寸}`
7. **落地保存**：保存到项目图标目录（uniapp 默认 `static/icons/`，Web 项目 `src/assets/icons/` 或用户指定目录）。
8. **展示图标询问（可选）**：下载完成后，询问用户是否需要输出一个「图标展示」公共 class（居中 icon + 圆角正方形浅色背景）。需要则按下方「图标展示」规范输出。
9. **批量场景**：逐个语义词执行，保持颜色、尺寸一致，确保风格统一。

## 参数规范

| 参数 | 说明 | 示例 |
|---|---|---|
| `out` | 输出目录 | `./static/icons` |
| `color` | 图标颜色（hex，不带 `#`） | `666` / `3B82F6` |
| `size` | 宽高（px） | `24` |
| `name` | 自定义文件名（不含扩展名） | `icon-home` |

## 图标展示（可选）

当用户需要把下载的图标以「居中 icon + 圆角正方形浅色背景」形式展示时，输出一个公共 CSS class。

### 触发时机

单图标或批量图标下载完成后，Claude 主动询问：

> 图标已下载到 `{outDir}`。是否需要输出一个「图标展示」公共 class（居中 icon + 圆角正方形浅色背景）？

用户也可在抓图前直接说：
- 「图标展示」
- 「展示图标」
- 「图标样式」
- 「图标 icon」
- 「给图标加个背景」
- 「图标容器样式」

### CSS 规范

统一 class 名 `.icon-box`（若项目已有命名约定，可替换为项目前缀）：

```css
.icon-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;          /* 容器默认 48px */
  height: 48px;
  border-radius: 12px;  /* 统一圆角 */
  background-color: var(--color-primary-light, rgba(59, 130, 246, 0.12)); /* 浅色主题色 */
}

.icon-box svg,
.icon-box image,
.icon-box img {
  width: 24px;          /* 图标默认 24px */
  height: 24px;
  color: var(--color-primary, #3B82F6); /* 图标色跟随主题色 */
}
```

### 约定

- 背景色使用主题色的 12% 透明度（`rgba(主色, 0.12)`），无 CSS 变量时回退到 `rgba(59, 130, 246, 0.12)`。
- 容器默认 48×48px，图标默认 24×24px。
- 容器圆角 12px（约 25% 圆角）。
- 优先使用 CSS 变量 `var(--color-primary)`，无变量时回退到默认蓝色 `#3B82F6`。
- uniapp / 小程序项目：建议把 class 放入 `App.vue` 的 `<style>` 或 `static/common.css`；Web 项目：建议放入 `src/styles/common.css` 或对应的全局样式文件。

### 输出物

1. 公共 class 代码（如上）。
2. 推荐放置位置。
3. 使用示例：

```html
<view class="icon-box">
  <image src="/static/icons/home.svg" />
</view>
```

## SVG → PNG

如需 PNG，优先建议：
- 项目使用 SVG 直接渲染（推荐）。
- 确需 PNG 时，可使用 `icon-forge` 技能生成，或用其他 PNG 渲染工具/在线服务。

本技能**不本地执行任何 SVG→PNG 脚本**。

## 异常处理

- **搜不到结果**：换更通用/更具体的英文词重试（如 `快递` → `delivery` / `truck`）。
- **多次失败**：建议改用 `icon-forge` 技能生成。
- **网络失败**：检查网络/代理，自动重试 2 次后仍失败则降级下一源。

## 使用规范

- 同一项目只用一个图标集（优先 lucide）。
- 线性/填充风格不混用。
- 导航 20px、卡片 32px、按钮 16px；颜色跟随文字色。
- 图标必须贴合功能语义，禁止用 Emoji 作为功能图标。
