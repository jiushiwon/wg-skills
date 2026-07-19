# icon-image-catch-skill — 远程素材抓取套件

> 用户需要 icon 或图片时，只要使用此技能，Claude 就能自行抓取合适的素材：
> 说「一只猫的图片」就去找猫的图，说「home 图标」就去找合适的 home icon。
> 也支持审计项目，输出完整的素材需求报告。

本技能为**纯文档规范**，不执行任何本地脚本。Claude 直接调用 Iconify、图库 API 或浏览器/网络工具完成抓取。

## 功能

| 子技能 | 能力 | 数据源 |
|---|---|---|
| [icon-catch-skill](icon-catch-skill/) | 语义搜图标 → 下载 SVG | Iconify 聚合（免费、免 Key） |
| [image-catch-skill](image-catch-skill/) | 语义搜图片 → 下载高清图 | 自定义源 / Pexels / Pixabay / Unsplash / Lorem Flickr / Picsum |

## 使用方式

直接对 Claude 说：

```
帮我抓一个 home 图标
给"个人中心、订单、设置"三个入口各配一个图标，灰色 24px
把页面里的 Emoji 都换成 lucide 专业图标
给首页 Hero 区域抓一张科技感办公背景图，1920 宽
给三个功能卡片配图：团队协作、数据分析、创新设计
帮我审计一下这个项目需要哪些素材
扫描一下这个项目，把需要图的地方都补上
```

Claude 会：
1. 判断你要图标、图片、审计，还是扫描项目自动抓取。
2. 询问你想用的图标库/图片来源（或按默认自动降级）。
3. 直接调用对应 API 下载素材到项目目录。
4. 扫描/审计时自动探测项目框架、平台、主题色，输出 `assets-requirements-report.md`。
5. 记录来源、作者、链接等信息。

## 图片来源选择

| 源 | 质量 | 推荐场景 |
|---|---|---|
| **Pexels** | ⭐⭐⭐⭐⭐ | 正式项目、Hero、Banner |
| **Pixabay** | ⭐⭐⭐⭐ | 内容运营、营销页、插画 |
| **Unsplash** | ⭐⭐⭐⭐⭐ | 大图/Hero/品牌视觉 |
| **Lorem Flickr** | ⭐⭐⭐ | Demo、原型、占位 |
| **Picsum** | ⭐⭐ | 纯视觉占位、测试 |

## 图标库选择

| 源 | 风格 | 推荐场景 |
|---|---|---|
| **lucide** | 现代线性 | 默认首选 |
| **tabler** | 业务图标丰富 | 电商/金融/医疗 |
| **heroicons** | Tailwind 官方 | Tailwind / 简洁后台 |
| **phosphor** | 多粗细风格 | 状态切换 |
| **remix** | 中文语义友好 | 国内业务 |
| **feather** | 极简 | 轻量产品 |
| **simple-icons** | 品牌 Logo | 品牌/第三方登录 |
| **mdi** | 数量庞大 | 兜底 |

## 目录说明

```
icon-image-catch-skill/
├── SKILL.md                    # 总入口：意图判断、路由、审计规范
├── README.md                   # 本文件
├── references/
│   ├── image-sizes.md          # 项目图片尺寸参考规范
│   └── project-type-detection.md   # 项目框架/平台/主题色探测决策表
├── icon-catch-skill/           # 图标抓取规范
│   ├── SKILL.md
│   ├── README.md
│   └── references/icon-sources.md
└── image-catch-skill/          # 图片抓取规范
    ├── SKILL.md
    ├── README.md
    └── references/image-sources.md
```

## 项目素材审计

`SKILL.md` 中定义了审计流程。Claude 会扫描项目文件，探测框架、平台、主题色、静态资源目录，输出 `assets-requirements-report.md`。

## 与其他技能的关系

- **icon-forge**：抓不到合适图标时，建议转 `icon-forge` 生成。
- **image-forge-skill**：需要本地压缩、裁剪、格式转换、水印、合成时，转 `image-forge-skill`。
- **uniapp-app-generate-skill / frontend-ui-foundry**：生成页面时若需要图标与配图，应调用本技能获取真实素材。

## 设计要点

- **语义驱动**：内置高频中英文映射表（见子技能 references）。
- **可配置源**：支持自定义远程源、正版图库、Lorem Flickr / Picsum 兜底多级策略。
- **图标多库降级**：支持 Iconify 聚合 + 多个独立图标集自动降级。
- **风格统一**：同一项目图标来自同一图标集，图片色调与主题色协调。
