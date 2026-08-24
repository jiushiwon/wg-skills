---
name: uniapp-crossplatform-audit-skill
description: 审计 uniapp 项目的跨平台兼容性，检测 H5/小程序/App 差异问题，输出修复指南。触发词："多端兼容"、"跨平台审计"、"小程序 App 兼容"、"uniapp 兼容性"
---

# UniApp Crossplatform Audit Skill

## Overview

审计 uniapp 项目的跨平台兼容性，识别 H5、小程序、App 端的差异问题，输出按文件维度组织的兼容性问题清单和修复建议。

## When to Use

触发此 skill 时使用：

- "审计多端兼容性"
- "检查 uniapp 跨平台问题"
- "小程序 App 兼容性问题"
- "这个项目能同时跑小程序和 App 吗"
- "帮我看看这个 uniapp 项目有没有平台兼容性风险"

## Workflow

```
Phase 1: 目标平台确认
  → 询问用户想要兼容哪些端（MP-WEIXIN / H5 / APP-PLUS）
  → 确定最低兼容要求

Phase 2: 自动化扫描
  → 扫描模板标签：H5 标签使用（div/span/p/img 等）
  → 扫描样式兼容性：background-image、var()、calc()、vw/vh 等
  → 扫描 API 调用：fetch/window/document 等非 uni API
  → 检查 pages.json 平台配置
  → 检查 manifest.json 各端配置

Phase 3: 人工复核
  → 过滤误报（动态创建的标签、特殊场景）
  → 评估修复难度：简单 / 中等 / 复杂

Phase 4: 输出报告
  → 按文件维度组织问题
  → 给出每个问题的具体修复方案
  → 预估修复工作量
  → 生成 audit-report.md
```

## Phase Details

### Phase 1: 目标平台确认

询问用户以下问题（不需要全问，根据上下文选择）：

1. "项目需要同时支持哪些端？微信小程序必选，H5 和 App 是否需要？"
2. "是否已经有其中某端运行正常？哪端问题最多？"
3. "有没有遇到具体的报错或表现异常？"

根据回答确定审计范围：
- 仅小程序：重点检查模板和基础 API
- 小程序 + H5：重点检查路由和浏览器 API
- 全端（+App）：重点检查原生能力差异

### Phase 2: 自动化扫描

使用 Grep 工具进行以下扫描：

#### 2.1 模板标签检查

```bash
# 搜索 H5 专属标签
grep -rnE '<div|<span|<p>|<h[1-6]>|<img|<section|<article|<main' src/
```

**检查规则**：
- `div` → 替换为 `view`
- `span` → 替换为 `text`
- `p` → 替换为 `text`
- `h1~h6` → 替换为 `text` + 样式
- `img` → 替换为 `image`
- `section/article/main` → 替换为 `view`

#### 2.2 CSS 兼容性检查

```bash
# 搜索兼容性风险属性
grep -rnE 'background-image:|var\(|calc\(|vw|vh|position:fixed' src/
```

**检查规则**：
- `background-image: url()` → 使用 `<image>` 组件
- `var(--xxx)` → 改用 SCSS 变量 `$xxx`
- `calc()` → 使用固定 rpx 值或 flex 布局
- `vw/vh` → 改用 rpx 或百分比
- `position: fixed` → 需考虑各端 z-index 差异

#### 2.3 API 检查

```bash
# 搜索浏览器/Node 专属 API
grep -rnE 'fetch\(|window\.|document\.|localStorage|sessionStorage|alert\(' src/
```

**检查规则**：
- `fetch` → 改用 `uni.request`
- `window/document` → 使用 `uni` API 或条件编译
- `localStorage` → 改用 `uni.getStorageSync` / `uni.setStorageSync`
- `alert` → 改用 `uni.showToast` 或 `uni.showModal`

#### 2.4 条件编译检查

```bash
# 搜索已有的条件编译
grep -rnE '#ifdef|#ifndef' src/
```

评估现有的条件编译是否覆盖了各端差异点。

#### 2.5 配置文件检查

- `pages.json`：检查各页面的 `style` 配置
- `manifest.json`：检查各端的 `app-plus`、`mp-weixin` 配置
- `.env`：检查是否有平台专属配置

### Phase 3: 人工复核

对自动化结果进行逐项确认：

1. **误报过滤**：某些场景下动态创建的标签可能是合法的
2. **上下文判断**：同一个问题在不同文件优先级可能不同
3. **修复难度**：评估改起来是简单复制粘贴还是需要重构

### Phase 4: 输出报告

生成 `crossplatform-audit-report.md`，包含：

```markdown
# 跨平台兼容性审计报告

## 审计概览
- 项目路径：xxx
- 目标平台：微信小程序、H5、App
- 扫描时间：2024-01-01

## 问题统计
| 严重程度 | 数量 |
|----------|------|
| Critical | X   |
| High     | X   |
| Medium   | X   |
| Low      | X   |

## 问题详情

### Critical - 必须修复

#### 1. [pages/index/index.vue] 使用了 H5 标签
- 问题：`div`、`span` 等标签在小程序不识别
- 位置：第 10-15 行
- 修复：替换为 `view`、`text`

#### 2. [styles/common.scss] 使用了 background-image
- 问题：背景图在小程序表现不一致
- 位置：第 30 行
- 修复：改用 `<image>` 组件

### ... 依此类推

## 修复建议

### 优先级 P0（立即修复）
1. 替换所有 H5 标签
2. 替换 background-image 为 image 组件

### 优先级 P1（下一迭代）
1. 添加缺失的条件编译
2. 统一 API 调用方式

### 优先级 P2（规划中）
1. 优化长列表渲染
2. 添加各端差异化处理
```

## Output

此 skill 输出以下内容：

1. **terminal 输出**：审计进度、发现的问题摘要
2. **文件**：`crossplatform-audit-report.md` 在项目根目录

## Collaboration

可与以下 skill 协作：

- **uniapp-code-audit-skill**：先做代码审计了解整体质量，再做兼容性审计
- **uniapp-standardization-skill**：兼容性修复后可做规范化，提升代码一致性
- **uniapp-vue2-upgrade-skill**：Vue2 项目先升级再做兼容性审计更准确

## References

- `references/cross-platform-checklist.md` — 详细的兼容性检查清单
- `references/tag-mapping.md` — H5 标签到 uniapp 组件的映射表
- `references/api-mapping.md` — 浏览器 API 到 uni API 的映射表
