# tokens — Token 提取 / 注入 / 导出

设计 Token 是 foundry 的核心资产。`tokens` 子命令管理 Token 的全生命周期。

## 用法

```
tokens <action> [args]
```

| Action | 说明 |
|--------|------|
| `extract <path>` | 从项目代码提取 Token（频次统计） |
| `inject <target>` | 注入 Token 文件到项目 |
| `export <format>` | 导出为不同格式（CSS / Tailwind / SCSS / JS / JSON） |
| `validate <path>` | 验证 Token 文件的完整性 |
| `list` | 列出当前可用调色板 + 字体配对 |

## extract — 提取

```
tokens extract [path]
```

调用 `scripts/extract-tokens.mjs`，输出"事实 Token"（用户当前使用的频次统计）。

```bash
tokens extract /path/to/project > project-tokens.json
```

输出示例：
```json
{
  "filesScanned": 87,
  "summary": { "uniqueColors": 47, "uniqueSpacings": 28, ... },
  "colors": [
    ["#c45c48", 23],
    ["#1a1a1a", 18],
    ...
  ],
  "warnings": ["检测到 47 种独立颜色值", "约 35% 间距值不在 4pt 网格上"]
}
```

## inject — 注入

```
tokens inject [path] [--palette vermilion-amber] [--strategy replace|append]
```

把 foundry 模板的 Token 注入到目标项目。

**步骤**：
1. 检测项目（`detect-stack.mjs`）
2. 选择 Token 模板（`templates/tokens.css.tpl` 或 `tokens.tailwind.tpl`）
3. 选择调色板（默认 `vermilion-amber`）
4. 复制到目标位置：
   - **HTML+Tailwind**：`assets/css/tokens.css` + 替换 `tailwind.config`
   - **React/Next**：`src/styles/tokens.css` + `tailwind.config.ts`
   - **Vue/Nuxt**：`assets/css/tokens.css` + 引入 `nuxt.config.ts`
   - **uniapp**：`static/css/tokens.css` + `App.vue` 引入

**选项**：
- `--strategy replace`：完全替换现有 Token
- `--strategy append`：追加新 Token（保留旧的）

## export — 导出

```
tokens export <format> [--output <file>]
```

| 格式 | 输出 |
|------|------|
| `css` | CSS 变量文件 |
| `tailwind` | tailwind.config.js / .ts |
| `scss` | SCSS 变量 |
| `js` | JS 主题对象（用于 styled-components / Emotion） |
| `json` | JSON（用于 Style Dictionary） |
| `swift` | iOS Swift Constants |
| `kotlin` | Android Kotlin Constants |

**示例**：

```bash
# 导出为 Tailwind 配置
tokens export tailwind --output tailwind.config.ts

# 导出为 iOS Swift
tokens export swift --output Theme.swift

# 导出为 Style Dictionary
tokens export json --output tokens.json
```

## validate — 验证

```
tokens validate <path>
```

检查 Token 文件是否完整：

| 检查 | 说明 |
|------|------|
| 必备色 | primary / secondary / surface / on-surface / border / error / success / warning |
| 必备间距 | 0 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 |
| 必备字号 | xs / sm / base / lg / xl / 2xl / 3xl |
| 必备圆角 | sm / md / lg / full |
| 必备动效 | quick / base / medium + 缓动 |
| 必备无障碍 | 暗色主题 / 减弱动效支持 |

输出：
```json
{
  "valid": true,
  "warnings": [],
  "errors": ["缺少 --color-info", "缺少 --radius-full"]
}
```

## list — 列出

```
tokens list [--palettes] [--fonts] [--scenarios]
```

显示当前可用资源：

```
=== 调色板（10 套） ===
1. vermilion-amber — 赤琥金（默认）
2. cold-minimal — 冷调极简
3. warm-business — 暖色商务
4. data-dark — 数据深色
5. finance-solid — 金融稳重
6. docs-fresh — 文档清爽
7. creative-ad — 创意广告
8. native-mobile — 原生移动
9. threejs-immersive — 3D 沉浸
10. b2b-slate — 2B 灰蓝

=== 字体配对（15 套） ===
1. chinese-tech — Noto Sans SC + JetBrains Mono
2. chinese-literary — Source Han Serif SC + Noto Sans SC
...

=== 场景（8 个） ===
1. mobile-responsive
2. pc-corporate
...
```

## 端到端示例

```bash
# 1. 提取现有项目 Token
tokens extract ./old-project > current.json

# 2. 匹配画像
node scripts/match-profile.mjs current.json > profile.json
# 看到：当前与 cold-minimal 匹配度 0.78

# 3. 注入 cold-minimal 调色板 Token
tokens inject ./old-project --palette cold-minimal --strategy replace

# 4. 导出为多平台
tokens export tailwind --output ./new-theme/tailwind.config.ts
tokens export swift --output ./ios/Theme.swift
tokens export kotlin --output ./android/Theme.kt

# 5. 验证
tokens validate ./new-theme/tokens.css
```
