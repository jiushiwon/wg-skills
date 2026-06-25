# 02 · Optimize 优化模式（一键重构）

智能识别现有项目，提取 Token，匹配画像，应用统一设计系统。

## 用法

```bash
optimize [path] [--strategy conservative|gradual|reshape] [--brand <name>] [--report-only] [--dry-run]
```

## 3 个策略

| 策略 | 风险 | 适用 |
|------|------|------|
| `conservative` | 低 | 只统一不一致项，保留现状 |
| `gradual`（默认） | 中 | 对齐到匹配品牌 80% |
| `reshape` | 高 | 完全套用某品牌/场景 Token |

## 5 步流水线

### 1. detect-stack
```bash
node scripts/detect-stack.mjs [path]
```
输出：`{ stack, framework, version, ui, language, scale }`

支持识别：
- React/Next.js、Vue/Nuxt、Svelte/SvelteKit
- React Native、uniapp
- 纯 HTML+Tailwind

### 2. extract-tokens
```bash
node scripts/extract-tokens.mjs [path] > tokens.json
```
提取：颜色 / 字体 / 字号 / 间距 / 圆角 / 阴影 / 动效 / 断点
检查：4pt 网格、圆角阶梯、字体数量

### 3. match-profile
```bash
node scripts/match-profile.mjs tokens.json > profile.json
```
匹配：10 调色板 + 字体画像 + 策略推荐

### 4. apply

**只改视觉相关属性**，**不改业务代码**：

| 改 | 不改 |
|----|------|
| 颜色值（→ CSS 变量） | API 调用 |
| 内联样式（→ 工具类） | 数据结构 |
| 魔法数字（→ Token） | 状态管理 |
| 圆角/阴影/动效 | 路由配置 |
| 字号（→ token） | props / event / 业务逻辑 |

### 5. verify
```bash
node scripts/verify-output.mjs [path] [output.json]
```
8 项检查：构建、Token 文件、viewport、触摸目标、4pt 网格、减弱动效、颜色 Token、AI Slop

## 常用示例

```bash
# 优化当前目录
optimize

# 优化指定项目 + 渐进策略
optimize /path/to/project

# 保守策略（最低风险）
optimize --strategy conservative

# 重塑为赤琥金
optimize --brand vermilion-amber --strategy reshape

# 只看报告
optimize --report-only

# 试运行（不写文件）
optimize --dry-run
```

## 输出 `optimize-report.md`

包含：
- 项目画像（技术栈 / UI 库 / 规模）
- 当前 Token 现状（频次统计）
- 匹配画像（最佳品牌 + drift 列表）
- 优化策略（推荐 + 风险）
- 修改清单（文件 + 行号 + 改前/改后）
- 回滚方案（git checkout）
- 验证结果（8 项检查）

## 注意事项

- **绝不修改业务逻辑**
- **不破坏可访问性**（对比度、触摸目标、键盘）
- **不引入 AI slop**（自检）
- **提供回滚**（git diff + 报告）
- **保守优先**：默认 gradual

## 关联：unify（多页面统一）

```bash
# 多页面 / 多端项目变体收敛
unify [path] [--scope pages|components|stacks] [--baseline <brand>]
```
