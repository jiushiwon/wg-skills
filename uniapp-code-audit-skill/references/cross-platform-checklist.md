# 跨平台兼容性检查清单

> 本清单用于 `uniapp-code-audit-skill` 跨平台兼容性审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. 模板标签

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 使用 H5 标签 | P0 | 小程序端无法识别 | 模板中出现 `div`、`span`、`p`、`h1~h6`、`img`、`section`、`article`、`main`、`ul`/`li`/`ol` | `uniapp-crossplatform-audit-skill` / `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | `grep -rnE '<div\|<span\|<p\|<h[1-6]\|<img\|<section\|<article\|<main\|<ul\|<li\|<ol' src/` |
| 使用 H5 表单标签 | P2 | 小程序端行为不一致 | 模板中出现 `input type="date"` 以外的 H5 表单标签 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 人工检查表单模板 |

## 2. CSS 兼容性

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 使用 `background-image: url()` | P1 | 小程序端图片表现不一致 | 样式中出现 `background-image: url(...)` | `uniapp-crossplatform-audit-skill` / `uniapp-app-generate-skill` 3.9 | `grep -rnE 'background-image:' src/` |
| 使用 CSS 自定义属性 `var(--xxx)` | P1 | 主题切换与跨端兼容性差 | 样式中出现 `var(--` | `uniapp-crossplatform-audit-skill` / `uniapp-app-generate-skill` 3.9 | `grep -rnE 'var\(' src/` |
| 使用 `calc()` | P2 | 多端计算结果不一致 | 样式中出现 `calc(` | `uniapp-crossplatform-audit-skill` | `grep -rnE 'calc\(' src/` |
| 使用 `vw`/`vh` | P2 | 小程序端适配问题 | 样式中出现 `vw`/`vh` | `uniapp-crossplatform-audit-skill` | `grep -rnE '\dvw\|\dvh' src/` |
| 使用 `px` | P2 | 未统一使用 `rpx` | 样式中出现 `px` | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | `grep -rnE '\d+px' src/ \| grep -v 'upx'` |
| `z-index` 过大 | P3 | 各端层级表现不一致 | 出现 `z-index: 9999` 等极大值 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | `grep -rnE 'z-index:\s*\d{4,}' src/` |
| 使用 `position: fixed` | P2 | 小程序端 z-index 与层级差异 | 样式中出现 `position: fixed` | `uniapp-crossplatform-audit-skill` | `grep -rnE 'position:\s*fixed' src/` |

## 3. API 调用

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 使用 `fetch` | P1 | 小程序端无原生 `fetch` | 代码中出现 `fetch(` | `uniapp-crossplatform-audit-skill` / `uniapp-app-generate-skill` 3.9 | `grep -rnE 'fetch\(' src/` |
| 使用 `window`/`document` | P1 | 小程序端不存在 | 代码中出现 `window.` 或 `document.` | `uniapp-crossplatform-audit-skill` / `uniapp-app-generate-skill` 3.9 | `grep -rnE 'window\.|document\.' src/` |
| 使用 `localStorage`/`sessionStorage` | P1 | 小程序端不可用 | 代码中出现 `localStorage` 或 `sessionStorage` | `uniapp-crossplatform-audit-skill` | `grep -rnE 'localStorage\|sessionStorage' src/` |
| 使用 `alert` | P2 | 小程序端不支持 | 代码中出现 `alert(` | `uniapp-crossplatform-audit-skill` | `grep -rnE 'alert\(' src/` |
| 使用浏览器导航 API | P2 | 小程序端行为不一致 | 代码中出现 `history.pushState` 等 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | `grep -rnE 'history\.' src/` |

## 4. 条件编译

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 平台差异未使用条件编译 | P2 | 同一段代码在三端表现不一致 | 存在平台差异但未使用 `#ifdef` / `#ifndef` | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | `grep -rnE '#ifdef\|#ifndef' src/` |
| 条件编译使用过多 | P3 | 业务代码被平台分支严重割裂 | 单个文件存在大量 `#ifdef` | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 统计 `#ifdef` 数量 |

## 5. rpx 与尺寸

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 混用 `px` 与 `rpx` | P2 | 跨端尺寸不一致 | 同一项目同时出现 `px` 与 `rpx` | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | `grep -rnE '\d+px' src/` |
| 尺寸未使用 Token | P2 | 主题/适配难以维护 | 直接写具体 `rpx` 尺寸 | `uniapp-app-generate-skill/references/theme-system.md` | `grep -rnE '(width\|height\|font-size\|margin\|padding)[^:]*:\s*\d+rpx' src/` |

## 6. 安全区与刘海屏

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未处理安全区 | P2 | 内容被刘海/底部横条遮挡 | 自定义导航栏或底部 tab 未处理 `safe-area-inset-*` | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | `grep -rnE 'safe-area-inset' src/` |
| 未使用 `getSafeAreaBottom` | P3 | 底部按钮可能被横条覆盖 | 底部固定按钮未适配安全区 | `uniapp-app-generate-skill` 3.8 | 检查底部固定元素样式 |

## 7. 自定义导航栏

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 胶囊按钮区域被覆盖 | P1 | 微信小程序胶囊与页面内容重叠 | `navigationStyle: custom` 页面标题或内容覆盖胶囊 | `uniapp-app-generate-skill` 3.6 / cross-platform | 检查 `src/pages.json` 与对应页面 |
| 未处理状态栏高度 | P2 | 自定义导航栏可能顶到状态栏 | 自定义导航栏未计算状态栏高度 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 检查自定义导航栏组件 |

## 8. 平台配置

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| `manifest.json` 缺少各端配置 | P2 | H5/App 打包缺少必要配置 | `manifest.json` 中 `mp-weixin`/`h5`/`app-plus` 为空或缺失 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 检查 `src/manifest.json` |
| 三端 baseURL 未分别配置 | P2 | 各端请求地址混乱 | `.env` 中缺少 `VITE_BASE_URL`/`VITE_H5_BASE_URL`/`VITE_APP_BASE_URL` | `uniapp-app-generate-skill` 3.8 | `cat .env.example` |
| 微信小程序合法域名未配置 | P1 | 请求/web-view 被拦截 | `manifest.json` 未配置 request/uploadFile/downloadFile/web-view 域名 | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 检查小程序后台配置（需人工确认） |
| H5 CORS/代理未处理 | P2 | 开发/生产环境请求失败 | H5 端未配置代理或后端未开启 CORS | `uniapp-app-generate-skill/references/cross-platform-compatibility.md` | 检查 `vite.config.ts` |

## 9. 图标与静态资源

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| tabBar 图标非 PNG | P2 | 小程序 tabBar 不支持其他格式 | tabBar 图标使用 JPG/SVG/WebP | `uniapp-app-generate-skill/references/mini-program-checklist.md` | 检查 `static/tab-bar/` |
| tabBar 图标尺寸非 81×81 | P2 | 小程序 tabBar 图标显示异常 | tabBar 图标尺寸不符合规范 | `uniapp-app-generate-skill/references/mini-program-checklist.md` | 检查 `static/tab-bar/` 图片尺寸 |
| 使用 emoji 作为图标 | P2 | 跨端显示不一致 | 代码/文案中直接使用 emoji | `uniapp-app-generate-skill` 最佳实践 | `grep -rnP '[\x{1F300}-\x{1F9FF}]' src/` |

## 跨平台兼容性评分参考

| 级别 | 描述 |
|------|------|
| A | 全端兼容，无 H5 标签与浏览器 API |
| B | 少量平台特定处理，整体兼容 |
| C | 存在明显跨平台风险，需要治理 |
| D | 大量 H5 标签/浏览器 API，无法跑通小程序 |
