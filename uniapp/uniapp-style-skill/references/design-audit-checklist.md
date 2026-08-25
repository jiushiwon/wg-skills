# 设计合规审计检查清单

> 本文件是 `SKILL.md` §十五 设计合规审计的补充参考，逐条列出 D01-D32 的扫描命令、修复策略与自动化程度。

## 图例

| 标记 | 含义 |
|------|------|
| ✅ | 可自动扫描 + 自动修复 |
| ⚡ | 可自动扫描，修复需人工确认 |
| 🔧 | 可自动扫描，无法自动修复 |
| 👁️ | 仅人工审查 |

---

## D01 — SCSS 必须用 Token（颜色）

- **扫描**：`rg "#[0-9a-fA-F]{3,8}\b|rgba?\s*\(" --glob "*.{vue,scss,css}" -n`
- **排除**：`_theme-config.scss`、`node_modules/`、`uni_modules/`、CSS 注释、`content: "#"` 字符串
- **修复映射**：见 [SKILL.md §15.3 颜色硬编码映射表](../SKILL.md#d01d06--颜色硬编码)
- **自动化**：✅

## D01 — SCSS 必须用 Token（字号）

- **扫描**：`rg "font-size:\s*\d+rpx" --glob "*.{vue,scss,css}" -n`
- **修复映射**：见 [SKILL.md §15.3 字号硬编码映射表](../SKILL.md#d01d06--字号硬编码)
- **自动化**：✅

## D01 — SCSS 必须用 Token（间距）

- **扫描**：`rg "(padding|margin|gap):\s*[^;]*\d+rpx" --glob "*.{vue,scss,css}" -n`
- **排除**：值为 `0` 或 `auto` 的行
- **修复映射**：见 [SKILL.md §15.3 间距硬编码映射表](../SKILL.md#d01--间距硬编码)
- **自动化**：✅

## D01 — SCSS 必须用 Token（圆角）

- **扫描**：`rg "border-radius:\s*\d+rpx" --glob "*.{vue,scss,css}" -n`
- **修复映射**：见 [SKILL.md §15.3 圆角硬编码映射表](../SKILL.md#d01--圆角硬编码)
- **自动化**：✅

## D02 — 组件样式用 scoped

- **扫描**：`rg "<style\s+lang=\"scss\"\s*>" --glob "components/**/*.vue" -n`
- **修复**：自动追加 `scoped` → `<style lang="scss" scoped>`
- **自动化**：✅

## D03 — props 用 TS 接口

- **扫描**：`rg "defineProps\(\[" --glob "components/**/*.vue" -n`
- **修复**：人工替换为 TS 接口 + `withDefaults`
- **自动化**：🔧

## D04 — 屏幕适配走规范

- **扫描**：`rg "padding-top:\s*88rpx" --glob "pages/**/*.vue" -n`（硬编码状态栏高度）
- **修复**：替换为 `useNavBarHeight()` composable
- **自动化**：🔧

## D05 — 鸿蒙降级处理

- **扫描**：`rg "getSystemInfoSync" --glob "*.{ts,vue}" -n` 并且未包裹 `checkCapability`
- **修复**：人工包裹 `checkCapability()` 降级函数
- **自动化**：👁️

## D06 — 字号禁止硬编码

- **扫描**：同 D01 字号扫描
- **修复映射**：同 D01 字号
- **自动化**：✅

## D07 — SCSS 嵌套 ≤ 3 层

- **扫描**：`rg "^\s{8,}[&.]" --glob "*.{vue,scss}" -n`
- **修复**：仅输出警告，人工拆分嵌套
- **自动化**：🔧

## D08 — 动画限用 transform/opacity

- **扫描**：`rg "transition(?:-property)?:\s*[^;]*\b(width|height|left|top|margin|padding|background-color)\b" --glob "*.{vue,scss,css}" -n`
- **修复**：仅输出警告，人工替换
- **自动化**：🔧

## D09 — z-index 禁止硬编码

- **扫描**：`rg "z-index:\s*\d+" --glob "*.{vue,scss,css}" -n`
- **排除**：`_theme-config.scss`、`tokens/_semantic.scss`（定义源）
- **修复映射**：见 [SKILL.md §15.3 z-index 硬编码映射表](../SKILL.md#d09--z-index-硬编码)
- **自动化**：✅

## D10 — 深色模式可切换

- **扫描**：`rg "background:\s*\$color-bg-" --glob "pages/**/*.vue" -n` 且未用 `var(--*)` 包装
- **修复**：`background: $color-bg-primary` → `background: var(--color-bg-primary, $color-bg-primary)`
- **自动化**：✅

---

## D11 — 全页滚动禁止 scroll-view

- **扫描**：`rg "<scroll-view\s+scroll-y" --glob "pages/**/*.vue" -n`
- **修复**：删除 `<scroll-view>` 包裹，走 page 原生流；仅局部滚动场景保留
- **自动化**：🔧

## D12 — 自定义导航栏必须对齐胶囊

- **扫描**：`rg "getMenuButtonBoundingClientRect" --glob "components/**/NavBar/**" -n`（缺少即违规）
- **修复**：引入 `useCapsuleLayout()` composable
- **自动化**：👁️

## D13 — Popup 必须有进出场动画

- **扫描**：`rg "animation:\s*none\b|transition:\s*none\b" --glob "**/Popup/**" -n`
- **补充检测**：Popup 组件内完全不包含 `@keyframes` 或 `animation:` 声明
- **修复**：引入 `_popup-animations.scss` 公共动画
- **自动化**：🔧

## D14 — 页面外边距必须统一

- **扫描**：`rg "(padding|margin).*32rpx" --glob "pages/**/*.vue" -n`（检测是否使用 `$page-gutter` 或 `.page-container`）
- **修复**：统一替换为 `.page-container`、`.page-section` 公共类
- **自动化**：👁️（需跨文件对比确认一致性）

## D15 — 底部菜单必须全局统一

- **扫描**：`rg "\"tabBar\"" --glob "pages.json" -n` 检查 `custom` 值与各页面实际 TabBar 引用
- **修复**：全自定义或全默认，禁止混用
- **自动化**：👁️

## D16 — 自定义头部必须全局统一 + 对齐胶囊

- **扫描**：`rg "\"navigationStyle\"" --glob "pages.json" -n` + 各个 page 是否有 `<navigationBarTitleText>`
- **修复**：`globalStyle.navigationStyle: "custom"` + 所有页面引入 `<CustomNavbar>`
- **自动化**：👁️

## D17 — 模块间距必须一致

- **扫描**：`rg "\.(section|card|block|module).*padding" --glob "pages/**/*.vue" -n`（对比 padding/margin 值一致性）
- **修复**：统一使用 `.section`、`$section-padding`、`$section-margin`
- **自动化**：👁️（需跨组件对比，自动修复风险高）

## D18 — 圆角必须全局统一

- **扫描**：同 D01 圆角
- **修复映射**：同 D01 圆角
- **自动化**：✅

## D19 — 底部悬浮按钮走全局样式

- **扫描**：`rg "position:\s*fixed.*\bbottom\b" --glob "pages/**/*.vue" -n` 且 class 不是 `btn-fixed-bottom`
- **修复**：替换为 `.btn-fixed-bottom` / `.btn-fixed-bottom-double` 公共类
- **自动化**：⚡

## D20 — 分割线必须统一

- **扫描**：`rg "border-bottom.*1px|border-top.*1px" --glob "*.{vue,scss}" -n | rg -v "\.divider"`
- **修复**：替换为 `.divider` 公共类或 `$divider-color` / `$divider-width` Token
- **自动化**：⚡

## D21 — 徽标标签必须统一

- **扫描**：`rg "\.badge|\.tag" --glob "*.{vue,scss}" -n | rg -v "_components\.scss"`
- **修复**：替换为公共 `.badge*` / `.tag-*` 类
- **自动化**：⚡

## D22 — 列表项必须统一

- **扫描**：`rg "\.list-item|\.item-cell" --glob "pages/**/*.vue" -n`
- **修复**：替换为公共 `<ListItem>` 组件
- **自动化**：⚡

## D23 — 文本层级必须统一

- **扫描**：`rg "font-size:\s*\d+rpx" --glob "*.{vue,scss}" -n | rg -v "_\w+\.scss"`
- **修复**：替换为 `.text-h1`~`.text-h4`、`.text-body`、`.text-caption` 预设类
- **自动化**：⚡

## D24 — 可点击区域 ≥ 44pt

- **扫描**：`rg "(width|height):\s*([1-9]|[1-7]\d|8[0-7])rpx" --glob "*.{vue,scss}" -n`（交互元素 class 下）
- **修复**：撑大到 ≥ 88rpx
- **自动化**：🔧

## D25 — 头像必须统一

- **扫描**：`rg "\.avatar" --glob "*.{vue,scss}" -n | rg -v "_components\.scss"`
- **修复**：替换为公共 `.avatar-sm`/`.avatar-md`/`.avatar-lg` 类
- **自动化**：⚡

## D26 — 表单控件必须统一

- **扫描**：`rg "checkbox|radio|switch" --glob "*.{vue,scss}" -n | rg -v "_components\.scss"`
- **修复**：统一使用 Token `$control-size`/`$control-color`/`$control-border`
- **自动化**：⚡

## D27 — 宫格必须统一

- **扫描**：`rg "\.grid" --glob "*.{vue,scss}" -n | rg -v "_components\.scss|_utilities\.scss"`
- **修复**：替换为公共 `.grid-2`~`.grid-5` 类
- **自动化**：⚡

## D28 — 图片必须有占位和兜底

- **扫描**：`rg "<image\s(?!.*mode=)" --glob "*.vue" -n`（缺少 mode 属性）
- **补充检测**：`<image>` 标签缺少 `@error` 处理器
- **修复**：添加 `mode="aspectFill"` + `@error="onError"` + 占位图
- **自动化**：⚡

## D29 — 禁止第三方组件库

- **扫描**：`rg "uview-ui|vant|colorui|iview" --glob "package.json" -n`
- **补充检测**：`rg "@import.*uview|import.*vant|import.*colorui" --glob "*.{vue,ts,scss}" -n`
- **修复**：移除依赖，更换为 uni 官方组件 + 本 skill 公共样式
- **自动化**：🔧

## D30 — Utility 类必须统一

- **扫描**：`rg "style=.*(display:\s*flex|justify-content|align-items)" --glob "*.vue" -n`
- **修复**：替换为 `.flex`、`.flex-between`、`.flex-center` 等 utility class
- **自动化**：⚡

## D31 — 文字颜色必须从基色派生

- **扫描**：`rg "color:\s*#[0-9a-fA-F]{6}" --glob "*.{vue,scss}" -n | rg -v "_theme-config|_semantic"`（排除定义源）
- **修复**：替换为 `$color-text-primary` / `$color-text-secondary` / `$color-text-tertiary`
- **自动化**：✅

## D32 — 空列表必须用 Empty 组件

- **扫描**：`rg "暂无数据|无数据|无记录|没有数据|暂无内容" --glob "pages/**/*.vue" -n`
- **补充检测**：`v-if="list.length === 0"` 内部未包含 `<Empty>`
- **修复**：替换为 `<Empty />` 组件
- **自动化**：⚡

---

## 审计流程速查

```
1. 确认扫描范围 → 全量 / 指定目录 / 指定页面
2. 执行 D01-D32 逐条扫描 →
   - ✅ 自动扫描 + 自动修复
   - ⚡ 自动扫描 + 人工确认修复
   - 🔧 自动扫描 + 仅出警告
   - 👁️ 仅人工审查
3. 输出报告 → 按 P0/自动 / P1/人工确认 / P2/仅警告 分级
4. 用户确认 → 全部修复 / 逐条确认 / 仅出报告
5. 执行修复 → 自动修复 ✅ 项 + 输出 ⚡/🔧 项的修复建议
6. 验证 → npm run lint
```

## 排除项

以下内容显式跳过审计：

| 路径/文件 | 原因 |
|-----------|------|
| `_theme-config.scss` | 配置源，允许硬编码 |
| `tokens/_semantic.scss` | Token 定义源 |
| `_functions.scss` | 函数/混入定义 |
| `vite.config.ts` | 构建配置 |
| `pages.json` / `manifest.json` | 框架配置 |
| `*.ts` 颜色常量导出 | 运行时层 |
| `node_modules/` | 第三方 |
| `uni_modules/` | 官方扩展 |
| CSS `@keyframes` 中间色 | 动画序列值 |
| CSS 注释中的颜色 | 非代码值 |
| `content: "#"` | 字符串字面量 |
