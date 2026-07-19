# 项目类型与平台探测决策表

本文件供 `icon-image-catch-skill` 在执行「项目素材需求审计」时使用，把「怎么判断项目框架、平台、主题色、静态资源目录」从口述经验固化为可查表的规则。

Claude 应根据本表读取项目关键文件，输出探测结果，并写入 `assets-requirements-report.md`。

## 探测流程

1. 读取项目根目录文件列表。
2. 按下方「框架探测表」匹配关键文件，确定项目框架。
3. 按「平台探测表」判断平台类型（移动端 / PC / Web / 桌面端）。
4. 按「主题色探测表」提取主题色。
5. 按「静态资源目录探测表」确定素材落地目录。
6. 按「平台 → 默认尺寸映射表」给出推荐图片尺寸。
7. 所有结果写入 `assets-requirements-report.md`。

## 框架探测

| 关键文件 | 辅助判断 | 框架 |
|---|---|---|
| `pages.json` + `manifest.json` | 存在 `App.vue` 或 `main.js` 在根目录/uniapp 目录 | uniapp |
| `pages.json` + `vite.config.ts` | 存在 `src/App.vue` | uniapp-vue3 |
| `next.config.js` / `next.config.ts` | 存在 `app/` 或 `pages/` | Next.js |
| `nuxt.config.ts` | 存在 `app.vue` 或 `pages/` | Nuxt |
| `vue.config.js` / `vite.config.ts` + `src/App.vue` | `package.json` 依赖含 `vue` | Vue3 |
| `vite.config.ts` + `src/App.tsx` | `package.json` 依赖含 `react` | React |
| `angular.json` | 存在 `src/app/` | Angular |
| `pubspec.yaml` | 存在 `lib/main.dart` | Flutter |
| `react-native.config.js` / `metro.config.js` | `package.json` 依赖含 `react-native` | React Native |
| 以上都不匹配 | — | Web 通用 |

### 冲突处理

- 同时存在 `pages.json` 和 `next.config.js`：以 `pages.json` 优先，判定为 uniapp。
- 同时存在 Vue 和 React 依赖：以入口文件 `App.vue` / `App.tsx` 为准。
- 存在 Taro 配置文件（`config/index.js` + `project.config.json`）：判定为 Taro（按 uniapp 同级处理）。

## 平台探测

平台由框架 + 额外配置文件共同决定：

| 框架 | 平台判断 | 说明 |
|---|---|---|
| uniapp / Taro / Flutter / React Native | 移动端优先 | 默认按移动端尺寸推荐，同时提醒用户是否兼顾小程序/H5/App |
| Next.js / Nuxt / Vue / React / Angular | Web（PC+移动自适应） | 默认响应式；若检测到 `tailwind.config.js` 中只配置了移动端断点，按 Web 移动优先处理 |
| 检测到 `tauri.config.json` / `electron` 依赖 | 桌面端 | 按 PC 尺寸推荐 |
| 检测到 `manifest.json` 中 `mp-weixin` / `mp-alipay` | 小程序 | 按移动端尺寸推荐 |
| 无明确特征 | Web 通用 | 默认给出 PC + 移动端两套推荐尺寸 |

## 主题色探测

按以下顺序尝试提取主题色，命中即止：

1. `tailwind.config.js` / `tailwind.config.ts` → `theme.extend.colors.primary`。
2. `theme.json`（微信小程序）→ `light.primary` / `primary`。
3. `manifest.json`（uniapp）→ 读取 `style` 中的主色或 `app-plus` 配置。
4. `src/styles/variables.css` / `src/styles/theme.css` → CSS 变量 `--color-primary`、`--primary`、`--brand`。
5. `package.json` 中无以上文件 → 使用默认主题色 `#3B82F6`（蓝色）。

提取到主题色后，浅色背景使用 `rgba(主色, 0.12)`。

## 静态资源目录探测

| 框架 | 默认静态资源目录 | 图标目录建议 | 图片目录建议 |
|---|---|---|---|
| uniapp / Taro 小程序 | `static/` | `static/icons/` | `static/images/` |
| Next.js | `public/` | `public/icons/` 或 `src/assets/icons/` | `public/images/` 或 `src/assets/images/` |
| Nuxt | `public/` | `public/icons/` | `public/images/` |
| Vue3 / React / Angular | `public/` 或 `src/assets/` | `src/assets/icons/` | `src/assets/images/` |
| Flutter | `assets/` | `assets/icons/` | `assets/images/` |
| React Native | 项目根目录或 `src/assets/` | `src/assets/icons/` | `src/assets/images/` |
| Web 通用 | 项目根目录或 `assets/` | `assets/icons/` | `assets/images/` |

若用户已指定目录，以用户指定为准。

## 平台 → 默认尺寸映射

以下尺寸为设计稿 1x 基准，实际抓取时可按 2x/3x 放大。详细比例与场景参考 `image-sizes.md`。

### 移动端 / uniapp / 小程序

| 场景 | 默认尺寸 | 比例 |
|---|---|---|
| 首页 Banner | 750×320 / 750×400 | 2.3:1 / 1.875:1 |
| 轮播图 | 750×340 / 750×420 | 2.2:1 / 1.78:1 |
| 商品/内容卡片 | 343×193 / 343×257 | 16:9 / 4:3 |
| 头像 | 120×120 | 1:1 |
| 方形缩略图 | 200×200 | 1:1 |
| 全屏背景 | 750×1624 | 9:16 |
| 人物半身像 | 750×1000 | 3:4 |
| 详情页头图 | 750×500 | 3:2 |

### PC / Web

| 场景 | 默认尺寸 | 比例 |
|---|---|---|
| 全屏 Hero | 1920×600 / 1920×800 | 3.2:1 / 2.4:1 |
| 内容 Banner | 1200×400 / 1200×600 | 3:1 / 2:1 |
| 侧边栏/小 Banner | 600×300 | 2:1 |
| 卡片封面 | 400×225 / 400×300 | 16:9 / 4:3 |
| 方图 | 400×400 / 600×600 | 1:1 |
| 人物写真 | 800×1000 | 4:5 |
| 团队合影 | 1600×900 | 16:9 |
| 全屏背景 | 1920×1080 | 16:9 |

### 桌面端（Electron / Tauri）

按 PC / Web 尺寸推荐，同时考虑窗口默认大小（如 1280×800）适当缩小 Hero 尺寸。

## 输出示例

`assets-requirements-report.md` 中应包含：

```markdown
## 项目探测结果

- **框架**：uniapp-vue3
- **平台**：移动端（小程序/H5/App）
- **主题色**：#059669
- **静态资源目录**：static/
- **推荐图标目录**：static/icons/
- **推荐图片目录**：static/images/

## 推荐默认尺寸

| 场景 | 移动端 | PC/Web |
|---|---|---|
| Banner | 750×400 | 1920×600 |
| 卡片配图 | 343×193 | 400×225 |
| 头像 | 120×120 | 128×128 |
```

## 兼容性

- 用户明确指定尺寸时，以用户为准，不使用本表推荐值。
- 用户明确指定目录时，以用户为准。
- 探测失败时，使用「Web 通用」兜底，并在报告中标注「探测结果不确定，已使用兜底值」。
