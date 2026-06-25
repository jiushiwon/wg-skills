# 03 · Audit 审查模式

设计 + 代码双维审查，按 8 类检查项打分，输出 Top 修复建议。

## 用法

```bash
audit [path] [--depth quick|standard|deep] [--focus design|code|all]
```

## 3 个深度

| 深度 | 检查数 | 时间 |
|------|--------|------|
| `quick` | 8 项核心 | 1-2 分钟 |
| `standard` | 24 项标准 | 5-10 分钟 |
| `deep` | 60+ 项深度 | 30+ 分钟 |

## 3 个焦点

| Focus | 说明 |
|-------|------|
| `design` | 设计法则 + 可访问性 + AI slop |
| `code` | 代码质量 + 性能 + 安全 |
| `all`（默认） | 全部 |

## 检查清单

### 设计维度（30 项）

**调色（4）**：OKLCH / 中性色微调 / 无纯黑白 / 调色策略明确
**字体（4）**：字号阶 ≥1.25 / 行长 65-75ch / 行高 1.5-1.75 / 无 AI slop 字体
**布局（4）**：4pt 网格 / 圆角阶梯 / 触摸目标 ≥44pt / 嵌套卡片 = 0
**动效（3）**：仅 transform/opacity / ease-out 指数 / reduced-motion
**可访问性（6）**：对比度 AA / 大文本 3:1 / 焦点环 / 键盘可达 / 语义化 / 减弱动效
**AI Slop（6）**：无侧边色条 / 无渐变文字 / 无玻璃默认 / 无 hero-metric / 无相同卡片 / 无紫渐变

### 代码维度（18 项）

**性能（4）**：WebP/AVIF / 字体预加载 / 代码分割 / 懒加载
**安全（3）**：无硬编码密钥 / 输入校验 / XSS 防护
**可维护（3）**：TS 严格 / ESLint / 组件命名
**响应式（3）**：viewport 正确 / 移动优先 / 安全区

## 评分

```
总分 = pass * 1.0 + warn * 0.5 + fail * 0
满分 100
```

## 常用示例

```bash
# 快速审查
audit --depth quick

# 深度 + 焦点设计
audit --depth deep --focus design

# 审查指定路径
audit /path/to/project --depth standard
```

## 输出 `audit-report.md`

- 总分（0-100）
- 各项检查 pass/warn/fail
- Top 5 优先级修复（含工作量评估）
- 与其他 SKILL 协同建议

## 与其他子命令联动

```bash
# 循环：audit → optimize → audit
audit --report-only > issues.md
optimize --fix-from-audit issues.md
audit  # 验证
```

## 关联 SKILL

- `frontend-code-doctor`（D:\frontend-skills\frontend-code-doctor）— 详细代码审查
- `impeccable`（D:\frontend-skills\impeccable）— 极致设计精修
- `ui-ux-pro-max`（D:\frontend-skills\ui-ux-pro-max）— 161 规则库

audit 是这些的入口与汇总，深度检查时调用具体 SKILL。
