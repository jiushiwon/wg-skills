# uniapp 设计系统与组件规范 Skill

> uniapp 微信小程序项目的设计系统与组件开发规范。专注视觉层（皮肉层），与 [uniapp-theme-skill](../uniapp-theme-skill/) 默认联动。

## 功能

### 设计系统

- **红线规则**：34 条专属强制规范（字号/颜色/间距/圆角/动画/对比度等硬编码禁令）
- **Design Tokens**：四层 Token 架构（config → primitive → semantic → mixins） + 组件级 Token（§6.9）
- **中性色阶**：文字 4 阶 + 背景 3 阶 + 边框 2 阶，一张图讲清全部默认灰度，tint() 自动派生
- **主题配置**：品牌色 + 功能色 + 深色模式开关，主题色阶委托给 uniapp-theme-skill
- **排版系统**：字号阶梯（xs~xxxl）+ 行高 + 字重 + 字体家族 + 文本层级预设类（h1~h4 / body / caption）
- **间距系统**：基于 4rpx 基数的完整间距阶梯（0~64rpx）+ Page Gutter + 模块间距统一
- **语义变量**：文字色（基色自动派生）/ 背景色 / 功能色 / 边框 / 圆角 / 阴影 / Z 层级
- **SCSS 函数与混入**：tint/shade 色板生成、布局/文本/安全区/细线混入
- **动画过渡**：时长 Token + 缓动曲线 + **6 个开箱即用动画预设类**（fade-in / slide-up / slide-down / scale-in / shimmer / spin）。支持 3 种触发模式（Mount 触发 / 交互触发 / 持续循环），通过 `v-if` 重新挂载元素实现点击播放
- **页面布局**：10 个通用 layout zone 类（lyt-page/lyt-body/lyt-hero/lyt-footer 等） + 5 种页面骨架（列表/详情/表单/设置/首页）
- **无障碍**：WCAG AA 文字背景对比度规范（正文 ≥ 4.5:1，大字 ≥ 3:1）

### 组件规范

18 个核心组件完整规范与代码实现：Button / Card / Modal / Toast / Input / NavBar / Popup / Empty / Loading / Skeleton（含 4 种变体）/ ErrorState / Divider / Badge & Tag / ListItem / Avatar / Checkbox & Radio & Switch / Grid / Image

附带：底部固定按钮全局样式、交互状态 8 态、最小触摸区 44pt、骨架屏 4 种变体

### 审计与修复

- **设计合规审计**：扫描项目 `.vue/.scss/.css` 文件中违反 D01-D34 的硬编码（21 条可自动扫描，13 条需人工审查）
  - 颜色/字号/间距/圆角/z-index 硬编码 → Token 变量
  - 组件尺寸硬编码 → 组件级 Token（新增 D33）
  - 文字背景对比度不足 → WCAG AA 检测（新增 D34）
  - 缺失 scoped / 嵌套过深 / 非 transform 动画 / 深色模式未适配
  - 页面级 scroll-view 滥用 / Popup 缺动画 / 底部按钮未走公共样式
  - 文本层级/可点击区域/图片兜底/第三方 UI 库/空列表 Empty 组件
- **自动修复**：✅ 类型支持一键自动替换，⚡ 类型扫描后人工确认
- **排除项**：`_theme-config.scss`（配置源）、`node_modules/`、`uni_modules/`、`*.ts` 常量导出等自动跳过

### 可视化速查

打开 `demo.html` 可查看 Design Token 速查盘：色彩 / 尺寸 / 组件 / 动效 / 触发词 五合一，主题色可切换，色阶 CSS `color-mix()` 即时重算。

## 使用方式

### 触发词

**规范查询：**
- "样式规范"、"uniapp 设计系统"、"Design Tokens"、"组件规范"
- "主题配置"、"颜色变量"、"文字颜色"、"文字层级"、"色阶"、"中性色"、"背景颜色"
- "字体大小规范"、"间距规范"、"页面布局"、"列表页布局"、"详情页布局"、"表单布局"
- "屏幕适配"、"深色模式"、"dark mode"、"uniapp 样式怎么写"

**审计与修复：**
- "设计审计"、"扫描硬编码样式"、"修复硬编码"

### 相关 Skill

| Skill | 关系 |
|-------|------|
| [uniapp-standard-skill](../uniapp-standard-skill/) | 前置依赖（通用架构规范） |
| [uniapp-theme-skill](../uniapp-theme-skill/) | **默认引用**（品牌色阶 + 一键换肤），未安装时回退默认值 |
| [uniapp-page-components-skill](../uniapp-page-components-skill/) | 互补（style-skill 定义组件视觉规范，page-components-skill 落地为可复用页面组件） |
| [uniapp-components-skill](../uniapp-components-skill/) | 无交集（登录鉴权与安全规范） |
| [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | 正交（全景审计，只出报告不修复） |

## 文档结构

```
uniapp-style-skill/
├── SKILL.md                         # 核心规范（4788 行，18 章，34 条红线）
├── README.md                        # 说明文档
├── demo.html                        # Design Token 可视化速查盘
└── references/
    ├── design-tokens.md              # 架构详解（色板算法、CSS 变量桥接、深色模式完整实现）
    └── design-audit-checklist.md     # D01-D34 审计检查清单
```
