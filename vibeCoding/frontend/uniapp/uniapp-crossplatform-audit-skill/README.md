# uniapp-crossplatform-audit-skill 🌐

uniapp 项目**跨平台兼容性专项深度审计**技能。识别项目在微信小程序 / H5 / App / 抖音小程序等各端运行时的兼容性问题与端间差异，**仅输出审计报告**，不修改、不修复项目代码。

---

## 它能做什么

当你说：

- "跨平台审计"
- "小程序 App 兼容"
- "多端兼容检查"
- "uniapp 三端表现差异"
- "H5 标签能不能跑小程序"
- "条件编译写得对不对"
- "App 端和小程序端有哪些坑"

这个 Skill 会引导你完成范围确认、多维度扫描、问题汇总、报告输出，输出 `uniapp-crossplatform-audit-report.md`。

---

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| 同一段代码 H5 正常、小程序端崩溃 | 模板标签 / 浏览器 API 专项扫描 |
| 三端表现不一致（字体/间距/动画） | 样式兼容性扫描 + 端间差异比对 |
| 平台差异忘写条件编译 | `#ifdef MP-WEIXIN` / `#ifdef APP-PLUS` / `#ifdef H5` 使用情况审计 |
| `manifest.json` 端配置缺漏 | `mp-weixin` / `h5` / `app-plus` 三端字段完整性核查 |
| 提审被拒 / App 端崩溃 | 平台配置 + 原生能力使用合理性扫描 |

---

## 与 uniapp-code-audit-skill 的区别

| 维度 | uniapp-crossplatform-audit-skill | uniapp-code-audit-skill |
|------|----------------------------------|-------------------------|
| **定位** | 跨平台专项深度审计 | 全维度体检（10 维） |
| **覆盖** | 6 个跨平台维度（模板标签 / 样式 / API / 条件编译 / 平台配置 / 端间差异） | 安全 / 性能 / 代码质量 / 架构 / UI / 跨平台 / 小程序专项 / App 端专项 / 死代码 / API 契约 |
| **深度** | 端间差异细节 | 各维度基础扫描 |
| **触发场景** | 怀疑多端兼容有问题 | 整体健康度体检 |

**互不替代，按场景选用。** 一般项目可先用 `uniapp-code-audit-skill` 体检，发现跨平台问题后再用本 skill 深入。

---

## 使用方式

### 触发 Skill

对 Claude 说任意一种：

```
跨平台审计
小程序 App 兼容
多端兼容检查
三端表现差异
```

### 四阶段流程

```
Phase 1: 审计范围确认
  → 目标平台（小程序 / H5 / App）
  → 端数（2 端 / 3 端 / N 端）
  → 重点维度（模板 / 样式 / API / 条件编译 / 平台配置 / 端间差异）

Phase 2: 多维度扫描
  → 模板标签：H5 标签在小程序端的失效
  → 样式兼容：CSS 变量、calc、vw/vh、rpx/px 混用
  → API 兼容：fetch / window / document / localStorage
  → 条件编译：#ifdef 使用完整性
  → 平台配置：manifest.json 三端字段
  → 端间差异：键盘、滚动、安全区、支付回调

Phase 3: 问题汇总
  → 按 P0/P1/P2/P3 风险等级归类
  → 列出"端间表现差异"专项问题

Phase 4: 输出报告
  → 生成 uniapp-crossplatform-audit-report.md
```

---

## 审计维度详解

### 1. 模板标签

- **P0**：`<div>`、`<span>`、`<p>`、`<h1~h6>`、`<img>`、`<section>`、`<article>`、`<main>`、`<ul>`/`li`/`ol` 在小程序端无法识别
- **P2**：H5 表单标签（`input type="date"` 等）

### 2. 样式兼容

- **P1**：`background-image: url()` 小程序端表现不一致
- **P2**：`calc()`、`vw`/`vh`、`px`/`rpx` 混用、`position: fixed`

### 3. API 兼容

- **P1**：`fetch`、`window`、`document`、`localStorage`、`sessionStorage` 在小程序端不可用
- **P2**：`alert`、`history.pushState`

### 4. 条件编译

- **P2**：平台差异未使用条件编译
- **P3**：条件编译使用过多，代码被严重割裂

### 5. 平台配置

- **P1**：微信小程序合法域名未配置
- **P2**：`manifest.json` 三端配置缺失、H5 CORS 未处理

### 6. 端间表现差异

- **P1**：原生组件层级问题、分享/支付回调差异
- **P2**：图片/字体未按端适配、键盘弹起遮挡
- **P3**：滚动行为差异

---

## 输出文件

- `uniapp-crossplatform-audit-report.md` — 按风险等级分级的审计问题清单
- 报告可选包含：端间表现差异比对、问题闭环对比、跨平台健康度

> 本 skill 不输出修复方案、不生成补丁、不修改项目代码。

---

## 风险等级

| 等级 | 说明 |
|------|------|
| **P0 / Critical** | 某端完全无法运行或审核被拒 |
| **P1 / High** | 某端功能失效或行为异常 |
| **P2 / Medium** | 某端表现降级或样式不一致 |
| **P3 / Low** | 微小差异，建议优化 |

> 风险等级仅用于报告分类，不代表修复指令。

---

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

---

## 目录结构

```
uniapp-crossplatform-audit-skill/
├── SKILL.md           # 技能定义（报告-only）
└── README.md          # 本文件
```

> 当前为骨架版本：仅含 SKILL.md 与 README.md。如需扩展 references/ 详细检查清单，可参考 `uniapp-code-audit-skill/references/cross-platform-checklist.md` 的维度结构。

---

## 适用 vs 不适用

✅ **适用**：
- 多端发布的 uniapp 项目（小程序 + H5 + App）
- 单端项目但需要评估未来扩展多端的风险
- 提审前合规性检查

❌ **不适用**：
- 纯前端 SPA（Vue/React），应用 `frontend-code-doctor` 或 `vue-generate-skill`
- 整体健康度体检，应用 `uniapp-code-audit-skill`

---

## 维护记录

- 2026-08-27：骨架版本创建，从 `uniapp-code-audit-skill/references/cross-platform-checklist.md` 提取专项维度。