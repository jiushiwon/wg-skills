# uniapp 设计系统与组件规范 Skill

> uniapp 微信小程序项目的设计系统与组件开发规范。专注视觉层（皮肉层），不涉及架构/安全/主题系统。

## 功能

### 规范

- **红线规则**：17 条专属强制规范（字号禁止硬编码、SCSS 嵌套 ≤ 3 层、动画限用 transform/opacity 等）
- **Design Tokens**：四层 Token 架构（config → primitive → semantic → mixins）
- **主题配置**：品牌色、功能色、深色模式开关
- **排版系统**：字号阶梯（xs~xxxl）、行高、字重、字体家族
- **间距系统**：基于 4rpx 基数的完整间距阶梯（0~64rpx）
- **语义变量**：文字色/背景色/功能色/边框/圆角/阴影/Z 层级
- **SCSS 函数与混入**：tint/shade 色板生成、布局/文本/安全区/细线混入
- **动画过渡**：时长 Token + 缓动曲线
- **组件规范**：Button（完整示例含 loading 态）、Card、Modal、Toast、Input、NavBar 及 Loading/Skeleton/Empty/ErrorState 状态组件
- **交互状态**：hover/active/disabled/loading/focus/error/success 视觉模式
- **组件开发规范**：目录结构、命名、props/emit/slots 约定
- **屏幕适配**：顶部适配、底部安全区、rpx 换算、横屏、鸿蒙降级
- **深色模式**：prefers-color-scheme + data-theme 双方案

### 审计与修复

- **设计合规审计**：扫描项目 `.vue/.scss/.css` 文件中违反 D01-D10 的硬编码
  - 颜色硬编码 → 语义变量
  - 字号/间距/圆角硬编码 → Token 变量
  - z-index 硬编码 → `$z-*` 层级
  - 缺失 scoped / 嵌套过深 / 非 transform 动画 / 深色模式未适配
- **自动修复**：审计后可选自动替换硬编码为 Token 变量
- **排除项**：`_theme-config.scss`（配置源）、`node_modules/`、`uni_modules/`、`*.ts` 常量导出等自动跳过

## 使用方式

### 触发词

**规范查询：**
- "样式规范是什么"
- "uniapp 设计系统"
- "Design Tokens"
- "组件规范"
- "屏幕适配"
- "uniapp 样式怎么写"
- "主题配置"
- "颜色变量"
- "字体大小规范"
- "间距规范"
- "深色模式"
- "dark mode"

**审计与修复：**
- "设计审计"
- "扫描硬编码样式"
- "修复硬编码"
- "替换硬编码颜色"
- "审计设计合规"

### 相关 Skill

| Skill | 关系 |
|-------|------|
| [uniapp-standard-skill](../uniapp-standard-skill/) | 前置依赖（通用架构规范） |
| [uniapp-theme-skill](../uniapp-theme-skill/) | 互补（CSS 变量运行时换肤） |
| [uniapp-code-audit-skill](../uniapp-code-audit-skill/) | 正交（全景审计，只出报告不修复） |

## 文档结构

```
uniapp-style-skill/
├── SKILL.md                         # 核心规范 + 审计流程
├── README.md                        # 说明文档
└── references/
    └── design-tokens.md             # 架构详解（色板算法、生成脚本、CSS 变量桥接、深色模式完整实现）
```
