# 静态资源指南

> 本参考文档定义 `uniapp-app-generate-skill` 在处理小程序静态资源（图标、图片）时的规则与推荐工作流。

## 核心原则

1. **无 emoji**：小程序界面中禁止使用 emoji 作为图标、按钮或装饰元素。所有视觉表达必须通过 PNG/SVG 图片完成。
2. **图标统一为 PNG**：微信小程序对 PNG 支持最稳定，tabBar 图标必须使用 PNG。
3. **生成优于搜索**：优先使用 `icon-forge` 技能生成图标。
4. **真实图片优先 Pexels**：需要真实照片/插画时，优先通过 Pexels API 获取；禁止用 CSS 渐变或纯色块充当图片。
5. **API Key 从 .env 读取**：Pexels API Key 写入 `.env`，项目代码通过 `import.meta.env.VITE_PEXELS_API_KEY` 读取，禁止硬编码。
6. **尺寸规范**：tabBar 图标建议 81×81px，页面图标建议 48×48px，空状态图建议 240×240px。
7. **命名规范**：全部小写，连字符分隔，含义明确，如 `home-active.png`、`empty-state.png`。

## 图标生成流程

当项目需要图标时：

1. 明确图标用途（tabBar / 按钮 / 空状态 / 列表项）。
2. 根据当前主题色和布局风格，生成 SVG path 或文字描述。
3. 调用 `icon-forge` 技能，批量生成 PNG。
4. 放入 `static/icons/` 或 `static/tab-bar/`。
5. 在 `CLAUDE.md` 和 `AGENTS.md` 中记录图标清单，防止重复生成。

### icon-forge 调用示例

```text
/ icon-forge
生成一组清新健康风的 tabBar 图标：首页、数据、发现、我的。每个图标包含激活态（主色填充）和未激活态（灰色线性）。尺寸 81x81px，PNG 格式，输出到 static/tab-bar/。
```

## 图片资源

### 页面装饰图

- **优先使用 Pexels API** 搜索真实照片，关键词需与业务场景相关。
- 必须经过压缩，单张 ≤ 100KB。
- 放在 `static/images/`。
- 禁止用 `linear-gradient` 或纯色背景代替真实图片。

### 空状态图

- 从 Pexels 搜索与主题相关的真实照片或极简插画，禁止使用渐变色块。
- 建议尺寸 240×240px。
- 命名：`empty-{scene}.png`，如 `empty-data.png`、`empty-network.png`。
- 无 Pexels Key 时，使用默认占位图，不能显示色块。

### 头像占位图

- 默认使用一张中性占位头像。
- 命名：`avatar-placeholder.png`。
- 尺寸：120×120px。

## 资源目录结构

```
static/
├── icons/                  # 页面内小图标
│   ├── arrow-right.png
│   ├── setting.png
│   └── ...
├── tab-bar/                # tabBar 图标
│   ├── home.png
│   ├── home-active.png
│   └── ...
├── images/                 # 装饰图/插图
│   ├── banner.png
│   └── empty-data.png
└── avatar-placeholder.png  # 头像占位
```

## 使用规范

```vue
<image src="/static/icons/setting.png" mode="aspectFit" class="icon" />
```

注意：
- 路径以 `/static/` 开头，表示项目根目录静态资源。
- 图标容器尺寸与图片尺寸分开控制，避免拉伸。

## 禁止事项

- 禁止使用 emoji 作为任何 UI 元素。
- **禁止用 CSS 渐变（`linear-gradient`）或纯色块充当 Banner、空状态、装饰图等图片资源。**
- 禁止在 `src/` 业务目录中直接存放图片。
- 禁止使用在线 URL 作为 tabBar 图标。
- 禁止硬编码 Pexels API Key 或图片路径。
- 页面级图片应在 `src/constants/pages.ts` 中集中管理。

## 资源清单模板

每个项目初始化后，应在 `CLAUDE.md` 或 `AGENTS.md` 中维护以下清单：

| 资源 | 路径 | 用途 | 生成方式 |
|------|------|------|----------|
| 首页 tabBar 图标 | `static/tab-bar/home.png` | 底部导航 | icon-forge |
| 数据 tabBar 图标 | `static/tab-bar/data.png` | 底部导航 | icon-forge |
| 发现 tabBar 图标 | `static/tab-bar/discover.png` | 底部导航 | icon-forge |
| 我的 tabBar 图标 | `static/tab-bar/profile.png` | 底部导航 | icon-forge |
| 空状态图 | `static/images/empty-data.png` | 数据为空 | Pexels API |
| 头像占位 | `static/avatar-placeholder.png` | 未获取头像 | Pexels API / icon-forge |
