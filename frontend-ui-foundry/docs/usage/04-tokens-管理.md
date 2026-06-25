# 04 · Tokens Token 全生命周期管理

设计 Token 是 foundry 的核心资产。`tokens` 子命令管理 extract / inject / export / validate / list。

## 6 个 Action

### extract — 提取

```bash
node scripts/extract-tokens.mjs [path] > tokens.json
```

提取：颜色、字体、字号、字重、行高、间距、圆角、阴影、动效、缓动、断点
输出：频次统计 + 一致性警告

### inject — 注入

```bash
tokens inject [path] [--palette <name>] [--strategy replace|append]
```

- `--strategy replace`：完全替换
- `--strategy append`：追加保留

按技术栈放置：
- HTML+Tailwind → `assets/css/tokens.css` + `tailwind.config.js`
- React/Next → `src/styles/tokens.css` + `tailwind.config.ts`
- Vue/Nuxt → `assets/css/tokens.css` + `nuxt.config.ts`
- uniapp → `static/css/tokens.css` + `App.vue`

### export — 导出（7 格式）

```bash
tokens export <format> [--output <file>]
```

| 格式 | 输出 |
|------|------|
| `css` | CSS 变量 |
| `tailwind` | tailwind.config.js/.ts |
| `scss` | SCSS 变量 |
| `js` | JS 主题对象（styled-components / Emotion） |
| `json` | JSON（Style Dictionary） |
| `swift` | iOS Swift Constants |
| `kotlin` | Android Kotlin Constants |

示例：
```bash
tokens export tailwind --output tailwind.config.ts
tokens export swift --output Theme.swift
tokens export kotlin --output Theme.kt
```

### validate — 验证

```bash
tokens validate <path>
```

检查必备 Token 完整性：
- 颜色：primary/secondary/surface/on-surface/border/error/success/warning
- 间距：0/4/8/12/16/24/32/48/64
- 字号：xs/sm/base/lg/xl/2xl/3xl
- 圆角：sm/md/lg/full
- 动效：quick/base/medium + 缓动
- 无障碍：暗色主题 + 减弱动效

### list — 列出可用资源

```bash
tokens list [--palettes] [--fonts] [--scenarios]
```

## 端到端示例

```bash
# 1. 提取
tokens extract ./old-project > current.json

# 2. 匹配画像
node scripts/match-profile.mjs current.json
# 看到：当前与 cold-minimal 匹配度 0.78

# 3. 注入新调色板
tokens inject ./old-project --palette cold-minimal --strategy replace

# 4. 多平台导出
tokens export tailwind --output ./theme/tailwind.config.ts
tokens export swift --output ./ios/Theme.swift
tokens export kotlin --output ./android/Theme.kt

# 5. 验证
tokens validate ./theme/tokens.css
```

## Token 文件模板

完整模板见 `templates/`：
- `tokens.css.tpl` — 完整 CSS 变量 + 暗色派生 + 基础样式
- `tokens.tailwind.tpl` — 完整 Tailwind 配置

直接复制到项目使用：
```bash
cp templates/tokens.css.tpl src/styles/tokens.css
```
