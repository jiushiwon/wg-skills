---
name: uniapp-crossplatform-audit-skill
description: 当用户要求检查 uniapp 项目在多端（微信小程序 / H5 / App / 抖音小程序等）的兼容性、排查平台差异问题、审查条件编译使用或确认三端表现一致性时触发。本 skill 输出跨平台兼容性审计报告，**不修改、不修复项目代码**。
---

# UniApp Cross-Platform Audit Skill

## 定位

本 skill 专门审计 uniapp 项目在三端（小程序 / H5 / App）运行时的兼容性问题，识别 H5 标签、浏览器 API、样式兼容性、条件编译缺失、平台配置缺陷等导致"一端正常、另一端崩溃"的隐患，**仅输出 `uniapp-crossplatform-audit-report.md` 报告，不修改、不修复、不重构项目代码**。

> 与 `uniapp-code-audit-skill` 的区别：本 skill 是**专项深度审计**，覆盖跨平台维度所有端间差异细节；`uniapp-code-audit-skill` 是**全维度体检**（10 维度），跨平台只是其中一维。

## When to Use

触发此 skill 时使用：

- "跨平台审计"
- "小程序 App 兼容"
- "多端兼容检查"
- "uniapp 三端表现差异"
- "H5 标签能不能跑小程序"
- "条件编译写得对不对"
- "App 端和小程序端有哪些坑"

## Workflow

```
Phase 1: 审计范围确认
  → 目标平台：微信小程序 / H5 / App / 其他小程序
  → 端数：2 端 / 3 端 / N 端
  → 重点维度：模板标签 / 样式兼容 / API 兼容 / 条件编译 / 平台配置

Phase 2: 多维度扫描
  → 按下列 6 个维度逐项扫描
  → 记录问题位置、风险等级、判定依据

Phase 3: 问题汇总
  → 按 P0/P1/P2/P3 风险等级归类
  → 列出"端间表现差异"专项问题

Phase 4: 输出报告
  → 生成 uniapp-crossplatform-audit-report.md
```

## 审计维度

| 维度 | 主要内容 |
|------|----------|
| **模板标签** | `<div>` `<span>` `<p>` `<h1~h6>` `<img>` `<ul>` 等 H5 标签在小程序端失效 |
| **样式兼容** | `background-image`、CSS 变量跨端差异、`px`/`rpx` 混用、`vw`/`vh` 适配问题 |
| **API 调用** | `fetch`/`window`/`document`/`localStorage`/`alert` 在小程序端不可用 |
| **条件编译** | `#ifdef MP-WEIXIN` `#ifdef APP-PLUS` `#ifdef H5` 使用是否完整 |
| **平台配置** | `manifest.json` 中 `mp-weixin`/`h5`/`app-plus` 各端差异化字段 |
| **端间表现差异** | 同一逻辑在三端的表现不一致（如键盘、滚动、安全区、支付回调） |

## 风险等级

| 等级 | 说明 |
|------|------|
| **P0 / Critical** | 某端完全无法运行或审核被拒 |
| **P1 / High** | 某端功能失效或行为异常 |
| **P2 / Medium** | 某端表现降级或样式不一致 |
| **P3 / Low** | 微小差异，建议优化 |

> 风险等级仅用于报告分类，**不代表修复指令**。

## 输出格式

生成 `uniapp-crossplatform-audit-report.md`，按风险等级分组列出问题，每条问题注明：

- 维度
- 风险等级
- 位置（文件 + 行号）
- 风险描述
- 判定依据
- 参考标准（`uniapp-app-generate-skill/references/cross-platform-compatibility.md` 等）

## 参考标准

- `uniapp-app-generate-skill/references/cross-platform-compatibility.md` — 跨平台规范
- `uniapp-standard-skill` — 红线规则
- uni-app 官方文档 — 各端 API 兼容表
- 微信小程序官方限制 — 包体积、合法域名、隐私接口

## 可配合技能

| 配合 Skill | 场景 |
|------------|------|
| `uniapp-code-audit-skill` | 跨平台仅是 10 维度之一，需要全维度审计时调用 |
| `uniapp-app-generate-skill` | 按报告进行项目骨架调整 |
| `uniapp-standardization-skill` | 按报告进行项目规范化 |

## 扫描方式

优先使用 Grep 等只读工具扫描。允许使用的命令示例：

```bash
# H5 标签扫描
grep -rnE '<div|<span|<p|<h[1-6]|<img|<section|<article|<main' src/

# 小程序端不可用 API
grep -rnE 'fetch\(|window\.|document\.|localStorage|sessionStorage' src/

# 条件编译使用
grep -rnE '#ifdef MP-WEIXIN|#ifdef APP-PLUS|#ifdef H5' src/
```

> 禁止在扫描过程中使用任何会修改项目的命令（如 `rm`、`mv`、`sed -i`、自动格式化等）。

## 自我审计

本 skill 升级后，应核对：

- SKILL.md 与 README.md 触发词一致
- 审计维度齐全（6 个）
- 不输出修复代码
- 参考标准无死链