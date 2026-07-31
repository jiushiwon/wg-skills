---
name: uniapp-code-audit-skill
description: 当用户要求审计 uniapp 项目、排查小程序代码质量问题、安全漏洞、性能风险、UI/主题一致性、跨平台兼容性或项目规范符合性时触发。本 skill 只输出审计报告，不修改、不修复项目代码。
---

# UniApp Code Audit Skill

## 定位

本 skill 用于审计 uniapp 项目（Vue3 + TypeScript + Pinia 技术栈优先），识别代码中不符合规范、存在风险或可能影响上线的问题，**仅输出 `uniapp-audit-report.md` 报告，不修改、不修复、不重构项目代码**。

## When to Use

触发此 skill 时使用：

- "uniapp 审计"
- "小程序代码审计"
- "uniapp 安全审计"
- "uniapp 性能审计"
- "检查 uniapp 规范符合性"
- "帮我看看这个 uniapp 项目有什么问题"

## Workflow

```
Phase 1: 审计范围确认
  → 全量审计 or 指定模块/页面
  → 目标平台：微信小程序 / H5 / App
  → 重点维度：安全 / 性能 / 代码质量 / 架构 / UI/主题 / 跨平台 / 小程序专项

Phase 2: 多维度扫描
  → 按下列 8 个维度逐项扫描
  → 记录问题位置、风险等级、判定依据、参考标准

Phase 3: 问题汇总
  → 按 P0/P1/P2/P3 风险等级归类
  → 统计各维度问题数量
  → 评估维度健康度（可选）

Phase 4: 输出报告
  → 生成 uniapp-audit-report.md
  → 不包含任何修复代码或修复指令
```

## 审计维度与参考清单

| 维度 | 参考文件 | 主要规范来源 |
|------|----------|--------------|
| **安全合规** | `references/security-checklist.md` | `uniapp-components-skill` 红线规则、通用安全规范 |
| **性能** | `references/performance-checklist.md` | `uniapp-standard-skill` 性能规范、`uniapp-app-generate-skill` |
| **代码质量** | `references/code-quality-checklist.md` | `uniapp-standard-skill` 红线规则、TS/Vue3 通用规范 |
| **架构与规范** | `references/architecture-checklist.md` | `uniapp-app-generate-skill/references/project-structure.md`、`uniapp-standard-skill` R01-R20 |
| **UI/主题一致性** | `references/ui-consistency-checklist.md` | `uniapp-app-generate-skill/references/theme-system.md`、`component-standards.md` |
| **跨平台兼容** | `references/cross-platform-checklist.md` | `uniapp-crossplatform-audit-skill`、`cross-platform-compatibility.md` |
| **小程序专项** | `references/mini-program-checklist.md` | 微信小程序官方限制、`uniapp-standard-skill` 性能规范 |
| **API 契约** | `references/api-contract-checklist.md` | `uniapp-request-skill`、`uniapp-standard-skill` 接口规范 |

## 风险等级

| 等级 | 说明 |
|------|------|
| **P0 / Critical** | 违反强制红线或上线合规要求，可能导致审核被拒、安全漏洞或严重性能问题 |
| **P1 / High** | 高风险偏差，影响功能、性能或稳定性 |
| **P2 / Medium** | 中风险偏差，影响可维护性或规范符合性 |
| **P3 / Low** | 优化建议，偏离程度较轻 |

> 风险等级仅用于报告分类，**不代表修复指令**。本 skill 不输出修复方案。

## 输出格式

生成 `uniapp-audit-report.md`：

```markdown
# UniApp 代码审计报告

## 审计概览
- 项目路径：xxx
- 审计时间：2024-01-01
- 审计范围：全量 / 指定模块
- 目标平台：微信小程序 / H5 / App
- 审计维度：安全、性能、代码质量、架构、UI/主题、跨平台、小程序专项、API 契约

## 问题统计

| 风险等级 | 安全 | 性能 | 代码质量 | 架构 | UI/主题 | 跨平台 | 小程序专项 | API 契约 | 合计 |
|----------|------|------|----------|------|---------|--------|------------|----------|------|
| P0       | ...  | ...  | ...      | ...  | ...     | ...    | ...        | ...      | ...  |
| P1       | ...  | ...  | ...      | ...  | ...     | ...    | ...        | ...      | ...  |
| P2       | ...  | ...  | ...      | ...  | ...     | ...    | ...        | ...      | ...  |
| P3       | ...  | ...  | ...      | ...  | ...     | ...    | ...        | ...      | ...  |

## 问题详情

### P0

#### 1. `src/utils/api.ts` 存在硬编码 API Key
- 维度：安全
- 风险等级：P0
- 位置：第 10 行
- 风险描述：源代码中直接写入 API Key，存在泄露风险
- 判定依据：安全清单 1. 敏感信息硬编码
- 参考标准：`uniapp-components-skill` 安全规范

### P1 / P2 / P3（同上格式）

## 维度健康度（可选）

| 维度 | 健康度 | 说明 |
|------|--------|------|
| 安全 | ⚠️ 差 | 存在 P0 级敏感信息泄露风险 |
| 性能 | ✅ 良 | 无 P0/P1 问题 |

## 参考标准

- `uniapp-standard-skill`
- `uniapp-app-generate-skill`
- `uniapp-request-skill`
- `uniapp-components-skill`
- `uniapp-crossplatform-audit-skill`

> 可按审计范围追加参考 `uniapp-standardization-skill`、`uniapp-vue2-upgrade-skill`、`uniapp-theme-skill`、`frontend-code-doctor` 等协作技能。

## 可配合技能

本 skill 仅输出报告，不执行修复。如需基于报告调整，可调用：

| 配合 Skill | 场景 |
|------------|------|
| `uniapp-standardization-skill` | 按报告进行项目规范化 |
| `uniapp-crossplatform-audit-skill` | 深入跨平台兼容性审计 |
| `uniapp-request-skill` | 深度请求层设计与审计 |
| `uniapp-vue2-upgrade-skill` | Vue2 项目升级评估 |
| `uniapp-theme-skill` | 主题系统一致性治理 |
| `frontend-code-doctor` | 通用前端代码审查补充 |
```

## 扫描方式

优先使用 Grep 等只读工具进行扫描。允许使用的示例命令：

> **命令使用说明**
> - 下方命令基于 Unix 工具（`grep`/`find`）。Windows 环境请使用内置 Grep 工具或 ripgrep（`rg`）替代，例如 `rg -nE '(apiKey|secret|token)' src/`。
> - `references/*.md` 表格内"检测命令"列中的 `\|` 是 markdown 表格转义，实际执行时请按 `|`（POSIX ERE 分组交替符）处理。

```bash
# 敏感信息扫描
grep -rnE '(apiKey|apikey|API_KEY|secret|token|password|passwd|pwd|appSecret|APP_SECRET)' src/

# H5 标签扫描
grep -rnE '<div|<span|<p|<h[1-6]|<img|<section|<article|<main' src/

# 直接 uni.request 扫描
grep -rnE 'uni\.request\(' src/pages/

# 嵌套 v-for 扫描
grep -rnE 'v-for.*v-for' src/

# eval / new Function 扫描
grep -rnE 'eval\(|new Function\(' src/
```

> 禁止在扫描过程中使用任何会修改项目的命令（如 `rm`、`mv`、`sed -i`、自动格式化等）。

## 自我审计

本 skill 升级完成后，应使用 `references/self-audit-checklist.md` 对 `SKILL.md`、`README.md` 及所有 references 进行自我审计，确保符合“报告-only”原则。

## References

- `references/security-checklist.md` — 安全合规检查清单
- `references/performance-checklist.md` — 性能检查清单
- `references/code-quality-checklist.md` — 代码质量检查清单
- `references/ui-consistency-checklist.md` — UI/主题一致性检查清单
- `references/architecture-checklist.md` — 架构与规范检查清单
- `references/api-contract-checklist.md` — API 契约检查清单
- `references/cross-platform-checklist.md` — 跨平台兼容性检查清单
- `references/mini-program-checklist.md` — 小程序专项检查清单
- `references/self-audit-checklist.md` — 本 skill 自我审计清单
